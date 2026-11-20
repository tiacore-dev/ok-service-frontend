#!/usr/bin/env bash
# Production deploy of the frontend. Runs on the server; the workflow streams it over SSH:
#   ssh host bash -s -- deploy <path> <image> <version> <digest> <sha> < scripts/deploy-production.sh
#   ssh host bash -s -- verify <path> <image> <version> <digest>       < scripts/deploy-production.sh
# deploy: refuse tracked edits and rollbacks, pull <image>:<version> and check its digest, then checkout <sha>,
#         switch TAG in .env, restart, verify. Each phase below states what may have changed by then.
# verify: the running frontend is <image>:<version> with <digest> and healthy. Changes nothing.
# DOCKERHUB_USERNAME/DOCKERHUB_TOKEN come from the environment (deploy only).
set -euo pipefail

HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-180}"

fail() { echo "❌ $*" >&2; exit 1; }

# Rewrites .env atomically, setting each KEY=VALUE argument and keeping every other line.
env_set() {
  local tmp
  tmp="$(mktemp .env.XXXXXX)"
  awk -v pairs="$*" '
    BEGIN { n = split(pairs, p, " "); for (i = 1; i <= n; i++) { k = substr(p[i], 1, index(p[i], "=") - 1); val[k] = p[i]; order[i] = k } }
    { k = substr($0, 1, index($0, "=") - 1); if (k in val) { if (!(k in done)) print val[k]; done[k] = 1; next } print }
    END { for (i = 1; i <= n; i++) if (!(order[i] in done)) print val[order[i]] }
  ' .env > "$tmp"
  chmod --reference=.env "$tmp"
  mv "$tmp" .env
}
env_get() { awk -v k="$1" 'index($0, k "=") == 1 { v = substr($0, length(k) + 2) } END { print v }' .env; }

verify() {
  local ref="$1" digest="$2" want_id cid status deadline
  docker image inspect --format '{{range .RepoDigests}}{{println .}}{{end}}' "$ref" | grep -qxF "${ref%:*}@${digest}" \
    || fail "local ${ref} is not ${digest}"
  want_id="$(docker image inspect --format '{{.Id}}' "$ref")"
  cid="$(docker compose ps -q frontend)"
  [ -n "$cid" ] || fail "frontend container is not running"
  [ "$(docker inspect --format '{{.Image}}' "$cid")" = "$want_id" ] \
    || fail "running frontend is $(docker inspect --format '{{.Config.Image}}' "$cid"), not ${ref}@${digest}"

  deadline=$((SECONDS + HEALTH_TIMEOUT))
  while :; do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$cid")"
    case "$status" in
      healthy) break ;;
      none) fail "frontend container has no healthcheck" ;;
      unhealthy) docker inspect --format '{{json .State.Health}}' "$cid" >&2; fail "frontend is unhealthy" ;;
    esac
    [ "$(docker inspect --format '{{.State.Running}}' "$cid")" = true ] || fail "frontend container stopped"
    [ "$SECONDS" -lt "$deadline" ] || fail "frontend not healthy within ${HEALTH_TIMEOUT}s (status: ${status})"
    echo "waiting for frontend health: ${status}"
    sleep 5
  done
  echo "✅ frontend runs ${ref}@${digest} and is healthy"
}

deploy() {
  local ref="$1" digest="$2" sha="$3" namespace="${1%%/*}" version="${1##*:}" dirty cid running_ref running_version prev_tag prev_image

  # Phase 0 (nothing changes): operator edits to tracked files are never overwritten; untracked/ignored
  # runtime files (.env, logs) are fine.
  dirty="$(git status --porcelain --untracked-files=no)"
  [ -z "$dirty" ] || fail "tracked files changed on the server; commit, move or discard them first: $(printf '%s\n' "$dirty" | cut -c4- | paste -sd' ')"

  cid="$(docker compose ps -q frontend)"
  running_ref=""; running_version=""
  if [ -n "$cid" ]; then
    running_ref="$(docker inspect --format '{{.Config.Image}}' "$cid")"
    running_version="$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.version"}}' "$cid")"
  fi
  echo "Running before deploy: ${running_ref:-<none>} (version label ${running_version:-<none>})"
  if printf '%s\n' "$running_version" | grep -qxE '[0-9]+\.[0-9]+\.[0-9]+' \
    && [ "$(printf '%s\n%s\n' "$running_version" "$version" | sort -t. -k1,1n -k2,2n -k3,3n | tail -n1)" != "$version" ]; then
    fail "production runs newer ${running_version}; refusing to roll back to ${version}"
  fi

  # Phase 1 (nothing changes): the exact image must be local before the checkout or .env move.
  echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin >/dev/null \
    || fail "docker login failed"
  docker pull "$ref" || fail "docker pull ${ref} failed"
  docker image inspect --format '{{range .RepoDigests}}{{println .}}{{end}}' "$ref" | grep -qxF "${ref%:*}@${digest}" \
    || fail "pulled ${ref} is not ${digest}"

  # Phase 2 (checkout may change; .env and the container do not): docker-compose.yml of the released commit.
  trap 'fail_hint "the checkout may have moved; .env and the running container are unchanged"' EXIT
  git fetch --quiet origin master
  git checkout --quiet master
  git merge --quiet --ff-only "$sha" || fail "cannot fast-forward the server checkout to ${sha}"
  [ "$(git rev-parse HEAD)" = "$sha" ] || fail "server checkout is at $(git rev-parse HEAD), expected ${sha}"
  [ "$(TAG="$version" DOCKERHUB_USERNAME="$namespace" docker compose config --images)" = "$ref" ] \
    || fail "docker-compose.yml does not resolve to ${ref}"

  # Phase 3 (.env changes): the recovery target survives retries of the same version.
  touch .env
  if [ "$(env_get TAG)" = "$version" ]; then
    env_set "TAG=${version}" "DOCKERHUB_USERNAME=${namespace}"
  else
    env_set "PREV_TAG=$(env_get TAG)" "PREV_IMAGE=${running_ref}" "TAG=${version}" "DOCKERHUB_USERNAME=${namespace}"
  fi
  prev_tag="$(env_get PREV_TAG)"; prev_image="$(env_get PREV_IMAGE)"
  echo "Recovery target: PREV_TAG=${prev_tag:-<none>} PREV_IMAGE=${prev_image:-<none>}"
  # shellcheck disable=SC2064  # the hint must carry the values known now
  trap "fail_hint '.env now has TAG=${version}; the container may have been replaced. To restore: set TAG and DOCKERHUB_USERNAME in $(pwd)/.env from PREV_IMAGE=${prev_image:-<none>} (PREV_TAG=${prev_tag:-<none>}), then docker compose up -d frontend'" EXIT

  # Phase 4 (the container is replaced).
  docker compose up -d --no-deps --remove-orphans frontend || fail "docker compose up failed"
  verify "$ref" "$digest"
  trap - EXIT
}

# Runs from an EXIT trap: on failure, says what the deploy may already have changed.
fail_hint() { [ $? -eq 0 ] || echo "Deploy stopped: $1" >&2; }

main() {
  local cmd="${1:-}" path="${2:?path}" image="${3:?image}" version="${4:?version}" digest="${5:?digest}"
  cd "$path" || fail "cannot cd to ${path}"
  docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required"
  case "$cmd" in
    deploy) deploy "${image}:${version}" "$digest" "${6:?sha}" ;;
    verify) verify "${image}:${version}" "$digest" ;;
    *) fail "usage: $0 deploy|verify <path> <image> <version> <digest> [sha]" ;;
  esac
}

# Called last: bash has read the whole script from stdin before anything runs.
main "$@"
