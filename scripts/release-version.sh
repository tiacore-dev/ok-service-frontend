#!/bin/sh
# Production versioning from Conventional Commits. Annotated git tags vX.Y.Z are the source of truth.
#   release-version.sh next                   -> next version for HEAD (no "v"); empty output = nothing to release
#   release-version.sh notes <version>        -> Markdown release notes for <version>
#   release-version.sh check-latest <version> -> fails if a higher release tag already exists
#   release-version.sh plan <image>           -> release_state/version/digest lines for HEAD (master runs)
#   release-version.sh promote <image> <version> <digest> -> tags the prod-<HEAD> candidate digest as <version>
# plan and promote read the registry with `docker buildx imagetools` (log in first).
set -eu

# Full history and tags are needed; actions/checkout is shallow and does not fetch tags.
REMOTE=origin
[ "$(git rev-parse --is-shallow-repository)" = true ] && git fetch --quiet --unshallow "$REMOTE"
git fetch --quiet --force --tags "$REMOTE"

semver_sort() { sed 's/^v//' | sort -t. -k1,1n -k2,2n -k3,3n; }
release_tags() { git tag "$@" | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' || true; }

# Highest vX.Y.Z tag reachable from HEAD (without "v"), optionally excluding one tag.
last_version() {
  release_tags --merged HEAD | grep -vxF "${1:-}" | semver_sort | tail -n1
}

# Prints breaking|feat|fix|perf|none for a commit.
classify() {
  subject="$(git log -1 --format=%s "$1")"
  if printf '%s\n' "$subject" | grep -qE '^[a-z]+(\([^)]*\))?!:' \
    || git log -1 --format=%b "$1" | grep -qE '^BREAKING[ -]CHANGE:'; then
    echo breaking
    return
  fi
  case "$subject" in
    feat:* | feat\(*\):*) echo feat ;;
    fix:* | fix\(*\):*) echo fix ;;
    perf:* | perf\(*\):*) echo perf ;;
    *) echo none ;;
  esac
}

next() {
  # Re-run of an already released commit keeps its version.
  head_version="$(release_tags --points-at HEAD | semver_sort | tail -n1)"
  [ -n "$head_version" ] && { echo "$head_version"; return; }

  # Never release a commit that is older than an existing release.
  highest="$(release_tags | semver_sort | tail -n1)"
  last="$(last_version)"
  if [ "$highest" != "$last" ]; then
    echo "HEAD does not contain the latest release v${highest}; refusing to release an older commit" >&2
    exit 1
  fi
  # First production release is 1.0.0 regardless of older commit messages.
  [ -z "$last" ] && { echo 1.0.0; return; }

  bump=none
  for sha in $(git log --no-merges --format=%H "v${last}..HEAD"); do
    case "$(classify "$sha")" in
      breaking) bump=major; break ;;
      feat) bump=minor ;;
      fix | perf) [ "$bump" = none ] && bump=patch ;;
    esac
  done

  major="${last%%.*}"; rest="${last#*.}"; minor="${rest%%.*}"; patch="${rest#*.}"
  case "$bump" in
    major) echo "$((major + 1)).0.0" ;;
    minor) echo "${major}.$((minor + 1)).0" ;;
    patch) echo "${major}.${minor}.$((patch + 1))" ;;
  esac
}

fail() { echo "$*" >&2; exit 1; }

# Manifest digest of <ref>. Exit 3 only when the registry says the tag does not exist; auth, transport
# and manifest errors exit 1.
digest_of() {
  if out="$(docker buildx imagetools inspect "$1" --format '{{.Manifest.Digest}}' 2>&1)"; then
    printf '%s\n' "$out" | grep -qxE 'sha256:[0-9a-f]{64}' || { echo "unexpected digest for $1: $out" >&2; return 1; }
    echo "$out"
  else
    case "$(printf '%s\n' "$out" | tail -n1)" in
      *"$1: not found") return 3 ;;
      *) echo "cannot inspect $1: $out" >&2; return 1 ;;
    esac
  fi
}

# Value of OCI label <key> on <ref> (empty if absent).
label_of() {
  json="$(docker buildx imagetools inspect "$1" --format '{{json .Image}}')" || fail "cannot read labels of $1"
  printf '%s\n' "$json" | sed -n "s/.*\"$2\":\"\([^\"]*\)\".*/\1/p" | head -n1
}

# Annotated vX.Y.Z whose peeled commit is <sha>; anything else is refused.
check_tag() {
  [ "$(git cat-file -t "refs/tags/v$1")" = tag ] || fail "v$1 is not an annotated tag; refusing to use it as release evidence"
  peeled="$(git rev-parse "refs/tags/v$1^{commit}")"
  [ "$peeled" = "$2" ] || fail "v$1 points at ${peeled}, not $2; refusing to move or reuse it"
}

emit() { printf 'release_state=%s\nversion=%s\ndigest=%s\n' "$1" "${2:-}" "${3:-}"; }

# master runs: outdated | none | released | resume | new (docs/release-process.md).
plan() {
  image="$1"
  head="$(git rev-parse HEAD)"
  # A failed lookup is an error, never "master moved on".
  git fetch --quiet "$REMOTE" "+refs/heads/master:refs/remotes/$REMOTE/master" || fail "cannot read $REMOTE/master"
  tip="$(git rev-parse --verify "refs/remotes/$REMOTE/master^{commit}")"

  if [ "$head" != "$tip" ]; then
    git merge-base --is-ancestor "$head" "$tip" \
      || fail "$head is not in $REMOTE/master history (rewritten?); refusing to release it"
    # Superseded: finish only a release this commit already promoted, otherwise the newer run releases it.
    rc=0; cand="$(digest_of "$image:prod-$head")" || rc=$?
    [ "$rc" -eq 3 ] && { echo "master moved on to $tip and $head has no production candidate: nothing to do." >&2; emit outdated; return; }
    [ "$rc" -eq 0 ] || exit 1
    version="$(label_of "$image:prod-$head" org.opencontainers.image.version)"
    printf '%s\n' "$version" | grep -qxE '[0-9]+\.[0-9]+\.[0-9]+' || fail "$image:prod-$head has no release version label"
    rc=0; digest="$(digest_of "$image:$version")" || rc=$?
    [ "$rc" -eq 3 ] && { echo "master moved on to $tip and $head never promoted $version: nothing to do." >&2; emit outdated; return; }
    [ "$rc" -eq 0 ] || exit 1
    owner="$(label_of "$image:$version" org.opencontainers.image.revision)"
    if [ "$digest" != "$cand" ] && [ "$owner" != "$head" ]; then
      echo "master moved on to $tip and $version belongs to another commit: nothing to do." >&2; emit outdated; return
    fi
  else
    version="$(next)"
    [ -n "$version" ] || { echo "No feat/fix/perf/breaking commits since the last release: nothing to deploy or release." >&2; emit none; return; }
    rc=0; digest="$(digest_of "$image:$version")" || rc=$?
    if [ "$rc" -eq 3 ]; then
      git rev-parse -q --verify "refs/tags/v$version" >/dev/null && fail "v$version is released but $image:$version is missing"
      echo "Production version: $version" >&2; emit new "$version"; return
    fi
    [ "$rc" -eq 0 ] || exit 1
    owner="$(label_of "$image:$version" org.opencontainers.image.revision)"
    [ "$owner" = "$head" ] || fail "$image:$version exists for commit ${owner:-<unknown>}, but v$version is not released. Finish that release first: see 'Promoted release overtaken by master' in docs/release-process.md."
  fi

  # Ownership of a promoted release: one digest for prod-<sha> and <version>, labelled with both.
  cand="$(digest_of "$image:prod-$head")" || fail "$image:prod-$head is missing; cannot prove $version belongs to $head"
  [ "$cand" = "$digest" ] || fail "$image:$version is $digest but $image:prod-$head is $cand; refusing a conflicting digest"
  owner="$(label_of "$image:$version" org.opencontainers.image.revision)"
  labelled="$(label_of "$image:$version" org.opencontainers.image.version)"
  [ "$owner" = "$head" ] && [ "$labelled" = "$version" ] \
    || fail "$image:$version is labelled revision ${owner:-?} / version ${labelled:-?}, expected $head / $version"
  check_latest "$version"
  now="$(next)"
  [ "$now" = "$version" ] || fail "$head would now release ${now:-nothing}, not the promoted $version"

  if git rev-parse -q --verify "refs/tags/v$version" >/dev/null; then
    check_tag "$version" "$head"
    echo "v$version is already released from $head; not redeploying." >&2; emit released "$version" "$digest"
  else
    echo "Resuming release $version: $image:$version is the candidate of $head ($digest)." >&2; emit resume "$version" "$digest"
  fi
}

# Gives the captured candidate digest the version tag; an existing version tag is accepted only if identical.
promote() {
  image="$1" version="$2" digest="$3"
  cand="$(digest_of "$image:prod-$(git rev-parse HEAD)")" || fail "production candidate is missing"
  [ "$cand" = "$digest" ] || fail "candidate resolves to $cand, build reported $digest"
  rc=0; existing="$(digest_of "$image:$version")" || rc=$?
  case "$rc" in
    0) [ "$existing" = "$digest" ] || fail "$image:$version already exists as $existing; refusing to overwrite" ;;
    # shortcut: registries have no create-if-absent; safe because production runs are serialized.
    3) docker buildx imagetools create --prefer-index=false -t "$image:$version" "$image@$digest" >&2 ;;
    *) exit 1 ;;
  esac
  got="$(digest_of "$image:$version")" || fail "cannot re-read $image:$version"
  [ "$got" = "$digest" ] || fail "$image:$version resolves to $got, expected $digest"
  echo "$image:$version = $image@$digest" >&2
  echo "digest=$digest"
}

check_latest() {
  highest="$(release_tags | semver_sort | tail -n1)"
  [ -z "$highest" ] && return
  if [ "$(printf '%s\n%s\n' "$highest" "$1" | semver_sort | tail -n1)" != "$1" ]; then
    echo "A newer release v${highest} exists; refusing to deploy or publish ${1}" >&2
    exit 1
  fi
}

notes() {
  version="$1"
  prev="$(last_version "v${version}")"
  printf '## %s (%s)\n\n' "$version" "$(date -u +%Y-%m-%d)"
  if [ -z "$prev" ]; then
    echo "Initial production release."
    return
  fi

  # Commit text is untrusted: only ever expanded as data, never evaluated.
  nl='
'
  breaking=""; feat=""; fix=""; perf=""
  for sha in $(git log --no-merges --format=%H "v${prev}..HEAD"); do
    kind="$(classify "$sha")"
    line="- $(git log -1 --format=%s "$sha" | sed -E 's/^[a-z]+\(([^)]*)\)!?: */**\1:** /; s/^[a-z]+!?: *//') ($(git log -1 --format=%h "$sha"))${nl}"
    case "$kind" in
      breaking) breaking="${breaking}${line}" ;;
      feat) feat="${feat}${line}" ;;
      fix) fix="${fix}${line}" ;;
      perf) perf="${perf}${line}" ;;
    esac
  done

  [ -n "$breaking" ] && printf '### Breaking changes\n\n%s\n' "$breaking"
  [ -n "$feat" ] && printf '### Features\n\n%s\n' "$feat"
  [ -n "$fix" ] && printf '### Bug fixes\n\n%s\n' "$fix"
  [ -n "$perf" ] && printf '### Performance improvements\n\n%s\n' "$perf"
  printf 'Changes since %s.\n' "v${prev}"
}

case "${1:-}" in
  next) next ;;
  notes) notes "${2:?version required}" ;;
  check-latest) check_latest "${2:?version required}" ;;
  plan) plan "${2:?image required}" ;;
  promote) promote "${2:?image required}" "${3:?version required}" "${4:?digest required}" ;;
  *) echo "usage: $0 next | notes <version> | check-latest <version> | plan <image> | promote <image> <version> <digest>" >&2; exit 2 ;;
esac
