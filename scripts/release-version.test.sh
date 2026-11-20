#!/bin/sh
# Self-check for release-version.sh on throwaway Git history: sh scripts/release-version.test.sh
set -eu

SCRIPT="$(cd "$(dirname "$0")" && pwd)/release-version.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
git init -q --bare "$TMP/origin.git"
git clone -q "$TMP/origin.git" "$TMP/repo" 2>/dev/null
cd "$TMP/repo"
git config user.email test@example.com
git config user.name test
git config commit.gpgsign false
git config tag.gpgsign false

fails=0
commit() { git commit -q --allow-empty -m "$1"; }
tag() { git tag -a "v$1" -m "v$1" "${2:-HEAD}"; git push -q origin "v$1"; }
expect() { # <description> <expected> <command...>
  desc="$1" want="$2"; shift 2
  got="$("$@" 2>/dev/null)" || got="<exit $?>"
  if [ "$got" = "$want" ]; then echo "ok   - $desc"; else echo "FAIL - $desc: expected '$want', got '$got'"; fails=$((fails + 1)); fi
}
next() { sh "$SCRIPT" next; }

printf '{ "version": "1.1.0" }\n' > package.json
git add package.json
commit "feat!: historical breaking change before releases existed"
commit "feat: historical feature"
expect "no release tags + package.json 1.1.0 -> 1.0.0" 1.0.0 next
commit "ci: add automatic production releases"
expect "only the release-workflow commit is new -> still 1.0.0" 1.0.0 next

tag 1.0.0
expect "HEAD already released keeps its version" 1.0.0 next
commit "docs: notes"
commit "chore(deps): bump"
expect "no release-worthy commits -> empty" "" next
commit "fix: OK-1 bug"
commit "perf(api): faster"
expect "fix + perf -> patch" 1.0.1 next
commit "feat(shifts): OK-2 new screen"
expect "feat wins over fix -> minor" 1.1.0 next

base="$(git rev-parse HEAD)"
commit "fix(auth)!: drop legacy login"
expect "type(scope)!: -> major" 2.0.0 next
git reset -q --hard "$base"
commit "refactor!: rename"
expect "non-release type with ! -> major" 2.0.0 next
git reset -q --hard "$base"
git commit -q --allow-empty -m "fix: thing" -m "BREAKING CHANGE: api removed"
expect "BREAKING CHANGE footer -> major" 2.0.0 next
git reset -q --hard "$base"
git commit -q --allow-empty -m "fix: thing" -m "BREAKING-CHANGE: api removed"
expect "BREAKING-CHANGE footer -> major" 2.0.0 next
git reset -q --hard "$base"
git commit -q --allow-empty -m "fix: mentions BREAKING CHANGE: inline only"
expect "BREAKING CHANGE not at line start is not a footer" 1.1.0 next
git reset -q --hard "$base"

# Commits introduced by a merge count; the merge commit itself does not.
tag 1.1.0
git checkout -q -b feature
commit "feat: from a branch"
git checkout -q master
commit "docs: on master"
git merge -q --no-ff -m "fix: merge commit message is ignored" feature
expect "merged feat counts, merge subject ignored" 1.2.0 next
git reset -q --hard v1.1.0
git checkout -q -b docs-only
commit "docs: only docs"
git checkout -q master
git merge -q --no-ff -m "feat: merge commit message is ignored" docs-only
expect "merge of non-release commits -> empty" "" next

# A retry on an older revision must not release over a newer one.
git reset -q --hard v1.1.0
commit "fix: newer"
tag 1.1.1
git checkout -q v1.1.0~1
expect "older revision than the latest release is refused" "<exit 1>" next
git checkout -q master
expect "check-latest accepts the latest version" "" sh "$SCRIPT" check-latest 1.1.1
expect "check-latest refuses an older version" "<exit 1>" sh "$SCRIPT" check-latest 1.1.0
expect "check-latest compares numerically" "" sh "$SCRIPT" check-latest 1.10.0

notes="$(sh "$SCRIPT" notes 1.1.1)"
case "$notes" in *"### Bug fixes"*"- newer ("*"Changes since v1.1.0."*) echo "ok   - notes group changes" ;; *) echo "FAIL - notes: $notes"; fails=$((fails + 1)) ;; esac
git checkout -q v1.0.0
case "$(sh "$SCRIPT" notes 1.0.0)" in *"Initial production release."*) echo "ok   - bootstrap notes" ;; *) echo "FAIL - bootstrap notes"; fails=$((fails + 1)) ;; esac

# Shallow CI checkout without tags still sees history and tags.
git push -q -f origin master
git clone -q --depth 1 "file://$TMP/origin.git" "$TMP/shallow" 2>/dev/null
expect "shallow clone is unshallowed and tags fetched" 1.1.1 sh -c "cd '$TMP/shallow' && sh '$SCRIPT' next"

# ---- plan/promote and the server deploy: real Git, a file-backed `docker` stub for registry and container.
DEPLOY="$(dirname "$SCRIPT")/deploy-production.sh"
STUB="$TMP/stub"; mkdir -p "$STUB/tags" "$STUB/blobs" "$STUB/run" "$TMP/bin"; : > "$STUB/log"
export STUB DOCKERHUB_USERNAME=t DOCKERHUB_TOKEN=x HEALTH_TIMEOUT=1
PATH="$TMP/bin:$PATH"
cat > "$TMP/bin/docker" <<'EOF'
#!/bin/sh
# Test double: registry = $STUB/tags/<ref> -> digest, $STUB/blobs/<digest> = image JSON; one frontend container.
echo "$*" >> "$STUB/log"
key() { printf '%s' "$1" | sed 's#[/:@]#_#g'; }
resolve() { case "$1" in *@sha256:*) [ -f "$STUB/blobs/${1##*@}" ] && echo "${1##*@}" ;; *) cat "$STUB/tags/$(key "$1")" 2>/dev/null ;; esac; }
label() { sed -n "s/.*\"$2\":\"\([^\"]*\)\".*/\1/p" "$STUB/blobs/$(resolve "$1")" 2>/dev/null; }
case "$1/$2/$3" in
  buildx/imagetools/inspect)
    [ -f "$STUB/registry-down" ] && { echo "ERROR: failed to do request: dial tcp: i/o timeout" >&2; exit 1; }
    d="$(resolve "$4")" || { echo "ERROR: docker.io/$4: not found" >&2; exit 1; }
    case "$6" in *Digest*) echo "$d" ;; *) cat "$STUB/blobs/$d" ;; esac ;;
  buildx/imagetools/create) d="$(resolve "$7")" && echo "$d" > "$STUB/tags/$(key "$6")" ;;
  compose/ps/*) [ -s "$STUB/run/ref" ] && echo cid1 ;;
  compose/config/*) echo "$DOCKERHUB_USERNAME/ok-service-frontend:$TAG" ;;
  compose/up/*) . ./.env; echo "$DOCKERHUB_USERNAME/ok-service-frontend:$TAG" > "$STUB/run/ref" ;;
  login/*) cat >/dev/null ;;
  image/inspect/*) case "$4" in *RepoDigests*) echo "${5%:*}@$(resolve "$5")" ;; *) echo "id-$(resolve "$5")" ;; esac ;;
  inspect/*)
    ref="$(cat "$STUB/run/ref")"
    case "$3" in
      *Health.Status*) cat "$STUB/health" ;;
      *State.Running*) echo true ;;
      *Labels*) label "$ref" org.opencontainers.image.version || echo "<no value>" ;;
      *Config.Image*) echo "$ref" ;;
      *json*) echo '{}' ;;
      *) echo "id-$(resolve "$ref")" ;;
    esac ;;
esac
EOF
chmod +x "$TMP/bin/docker"

IMG=t/ok-service-frontend
planned() { p="$(sh "$SCRIPT" plan "$IMG")" && printf '%s\n' "$p" | paste -sd' ' -; }
reg_tag() { printf '%s' "$STUB/tags/$(printf '%s' "$1" | sed 's#[/:@]#_#g')"; }
build() { # <sha> <version> [salt]: pushes prod-<sha> like build-push-action and prints its digest
  d="sha256:$(printf '%s %s %s' "$1" "$2" "${3:-}" | sha256sum | cut -c1-64)"
  printf '{"config":{"Labels":{"org.opencontainers.image.revision":"%s","org.opencontainers.image.version":"%s"}}}\n' "$1" "$2" > "$STUB/blobs/$d"
  echo "$d" > "$(reg_tag "$IMG:prod-$1")"; echo "$d"
}
deploy() { (cd "$TMP/srv" && bash "$DEPLOY" "$1" "$TMP/srv" "$IMG" "$2" "$3" ${4:+"$4"} >>"$TMP/deploy.log" 2>&1) || { echo "<exit 1>"; return 0; }; }
srv_env() { grep -E "^$1=" "$TMP/srv/.env" | cut -d= -f2-; }
annotate() { git tag -a "v$1" -m "v$1" "$2"; git push -q origin "v$1"; }

git init -q --bare "$TMP/ab.git"
git -C "$TMP/ab.git" config receive.denyDeleteCurrent ignore
git clone -q "$TMP/ab.git" "$TMP/ab" 2>/dev/null
cd "$TMP/ab"
git symbolic-ref HEAD refs/heads/master
git config user.email test@example.com; git config user.name test; git config tag.gpgsign false; git config commit.gpgsign false
printf '{ "version": "1.1.0" }\n' > package.json; printf 'services: {}\n' > docker-compose.yml
git add . && commit "chore: init" && git push -q origin master
git clone -q "$TMP/ab.git" "$TMP/srv" 2>/dev/null
printf 'CONFIG_NAME=prod\nTAG=oldsha\n' > "$TMP/srv/.env"
echo gloomylime/ok-service-frontend:oldsha > "$STUB/run/ref"; echo healthy > "$STUB/health"

commit "feat: A"; git push -q origin master; A="$(git rev-parse HEAD)"
expect "A at master tip selects the first release" "release_state=new version=1.0.0 digest=" planned
dA="$(build "$A" 1.0.0)"
expect "promote gives 1.0.0 the candidate digest" "digest=$dA" sh "$SCRIPT" promote "$IMG" 1.0.0 "$dA"
expect "promote keeps the digest (--prefer-index=false)" 1 grep -c -- "imagetools create --prefer-index=false -t $IMG:1.0.0 $IMG@$dA" "$STUB/log"
expect "promote accepts an identical existing 1.0.0" "digest=$dA" sh "$SCRIPT" promote "$IMG" 1.0.0 "$dA"

commit "fix: B"; git push -q origin master; B="$(git rev-parse HEAD)"
expect "B before A is published: 1.0.0 belongs to A, refused" "<exit 1>" planned
git checkout -q "$A"
expect "A after master moved on resumes its promoted 1.0.0" "release_state=resume version=1.0.0 digest=$dA" planned
touch "$STUB/registry-down"
expect "registry error is not a missing tag" "<exit 1>" planned
rm "$STUB/registry-down"
git push -q origin --delete master
expect "failed master lookup is an error, not 'outdated'" "<exit 1>" planned
git push -q origin "$B:refs/heads/master"
git remote set-url origin "$TMP/gone.git"
expect "unreachable remote is an error (git exit code)" "<exit 128>" planned
git remote set-url origin "$TMP/ab.git"
dX="$(build "$A" 1.0.0 rebuilt)"
expect "conflicting candidate digest is refused" "<exit 1>" planned
expect "promote never overwrites a conflicting 1.0.0" "<exit 1>" sh "$SCRIPT" promote "$IMG" 1.0.0 "$dX"
echo "$dA" > "$(reg_tag "$IMG:prod-$A")"
git commit -q --allow-empty -m "fix: rewritten"
expect "commit outside master history is refused" "<exit 1>" planned
git checkout -q "$A"

: > "$STUB/log"
expect "server deploys A while master is at B" "" deploy deploy 1.0.0 "$dA" "$A"
expect "server checkout is exactly A" "$A" git -C "$TMP/srv" rev-parse HEAD
expect "image pulled before the checkout moved" "pull compose config" sh -c "grep -oE '^(pull|compose config)' '$STUB/log' | paste -sd' ' -"
expect ".env switched to 1.0.0" 1.0.0 srv_env TAG
expect ".env keeps the previous tag and image for recovery" "oldsha gloomylime/ok-service-frontend:oldsha" sh -c "echo \$(grep '^PREV_TAG=' '$TMP/srv/.env' | cut -d= -f2-) \$(grep '^PREV_IMAGE=' '$TMP/srv/.env' | cut -d= -f2-)"
deploy deploy 1.0.0 "$dA" "$A" >/dev/null
expect "retry of 1.0.0 keeps PREV_TAG" oldsha srv_env PREV_TAG

git tag v1.0.0 "$A"; git push -q origin v1.0.0
expect "lightweight tag is not release evidence" "<exit 1>" planned
git push -q origin :refs/tags/v1.0.0; git tag -d v1.0.0 >/dev/null
annotate 1.0.0 "$A"
expect "tag without Release: A is released, identity rechecked" "release_state=released version=1.0.0 digest=$dA" planned
echo unhealthy > "$STUB/health"
expect "missing Release + unhealthy live container: verify blocks publication" "<exit 1>" deploy verify 1.0.0 "$dA"
echo healthy > "$STUB/health"
expect "missing Release + healthy live 1.0.0: verify passes" "" deploy verify 1.0.0 "$dA"

git checkout -q master
expect "B then selects 1.0.1" "release_state=new version=1.0.1 digest=" planned
dB="$(build "$B" 1.0.1)"
sh "$SCRIPT" promote "$IMG" 1.0.1 "$dB" >/dev/null 2>&1
expect "server deploys B" "" deploy deploy 1.0.1 "$dB" "$B"
expect "server refuses to roll back to 1.0.0" "<exit 1>" deploy deploy 1.0.0 "$dA" "$A"
annotate 1.0.1 "$B"
git checkout -q "$A"
expect "A after 1.0.1 is published is refused" "<exit 1>" planned
git checkout -q master

commit "fix: C"; git push -q origin master; C="$(git rev-parse HEAD)"
commit "fix: D"; git push -q origin master
git checkout -q "$C"
expect "superseded C without a candidate is a no-op" "release_state=outdated version= digest=" planned
build "$C" 1.0.2 >/dev/null
expect "superseded C built but never promoted is a no-op" "release_state=outdated version= digest=" planned
git checkout -q master

echo '# operator edit' >> "$TMP/srv/docker-compose.yml"; : > "$STUB/log"
expect "tracked compose edit on the server is refused" "<exit 1>" deploy deploy 1.0.2 "$dB" "$C"
case "$(cd "$TMP/srv" && bash "$DEPLOY" deploy "$TMP/srv" "$IMG" 1.0.2 "$dB" "$C" 2>&1)" in
  *"docker-compose.yml"*) echo "ok   - refusal names docker-compose.yml" ;; *) echo "FAIL - refusal names the path"; fails=$((fails + 1)) ;; esac
expect "nothing pulled or changed after the refusal" "0 $B" sh -c "echo \$(grep -c '^pull' '$STUB/log') \$(git -C '$TMP/srv' rev-parse HEAD)"

[ "$fails" -eq 0 ] && echo "all release-version checks passed" || { echo "$fails check(s) failed"; exit 1; }
