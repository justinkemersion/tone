#!/usr/bin/env bash
# Sync local deploy/.env.docker → production /srv/apps/tone/.env.docker over SSH.
#
# Why: .env.docker is gitignored. Edit secrets on your laptop, then push only this
#      whitelist file to the server (never the whole tree / never .env).
#
# Modeled on lighthouse/deploy/sync-env-remote.sh: dry-run by default; pass --apply to write.
#
# Usage (from repo root):
#   ./deploy/sync-env-remote.sh              # dry-run
#   ./deploy/sync-env-remote.sh --apply      # write remote file
#   ./deploy/sync-env-remote.sh --apply --restart   # write + recreate container
#
# Env overrides:
#   TONE_DEPLOY_HOST   default root@178.104.205.138
#   TONE_DEPLOY_DIR    default /srv/apps/tone
#   TONE_LOCAL_ENV     default deploy/.env.docker
#
set -euo pipefail

HOST="${TONE_DEPLOY_HOST:-root@178.104.205.138}"
APP_DIR="${TONE_DEPLOY_DIR:-/srv/apps/tone}"
LOCAL_ENV="${TONE_LOCAL_ENV:-deploy/.env.docker}"
REMOTE_ENV_NAME=".env.docker"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

show_help() {
  sed -n '2,22p' "$0" | sed 's/^# \?//'
}

APPLY=0
RESTART=0
REMOTE_OVERRIDE=""
for a in "$@"; do
  case "$a" in
    -h | --help)
      show_help
      exit 0
      ;;
    --apply)
      APPLY=1
      ;;
    --restart)
      RESTART=1
      ;;
    *)
      if [[ -n "${REMOTE_OVERRIDE}" ]]; then
        echo "Unexpected extra argument: $a (expected at most one user@host)" >&2
        exit 1
      fi
      REMOTE_OVERRIDE="$a"
      ;;
  esac
done

REMOTE="${REMOTE_OVERRIDE:-$HOST}"
if [[ "$REMOTE" != *"@"* ]]; then
  echo "Invalid ssh target (expected user@host): '$REMOTE'" >&2
  exit 1
fi

LOCAL_PATH="$REPO_ROOT/$LOCAL_ENV"
if [[ ! -f "$LOCAL_PATH" ]]; then
  echo "ERROR: local env file missing: $LOCAL_ENV" >&2
  echo "Copy deploy/env.docker.example → deploy/.env.docker and fill secrets." >&2
  exit 1
fi

echo "=== local keys in $LOCAL_ENV ==="
grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$LOCAL_PATH" | cut -d= -f1 | sort || true

required=(
  AUTH_SECRET
  AUTH_URL
  NEXTAUTH_URL
  FLUX_URL
  FLUX_GATEWAY_JWT_SECRET
  FLUX_POSTGREST_SCHEMA
  NEXT_PUBLIC_APP_URL
)
missing=()
for key in "${required[@]}"; do
  if ! grep -Eq "^${key}=" "$LOCAL_PATH"; then
    missing+=("$key")
  elif grep -Eq "^${key}=[[:space:]]*$" "$LOCAL_PATH"; then
    missing+=("$key (empty)")
  fi
done
if [[ "${#missing[@]}" -gt 0 ]]; then
  echo "WARN: recommended production keys missing or empty:" >&2
  for m in "${missing[@]}"; do
    echo "  - $m" >&2
  done
  echo "WARN: tuner still boots without Flux/OAuth; login and persistence fail closed." >&2
fi

if grep -Eq '^AUTH_DEV_LOGIN=1$' "$LOCAL_PATH"; then
  echo "ERROR: AUTH_DEV_LOGIN must be 0/unset on production." >&2
  exit 1
fi
if grep -Eq '^FLUX_TLS_INSECURE=1$' "$LOCAL_PATH"; then
  echo "WARN: FLUX_TLS_INSECURE=1 — production should use 0." >&2
fi
if ! grep -Eq '^AUTH_GITHUB_(ID|SECRET)=.+$' "$LOCAL_PATH" && ! grep -Eq '^AUTH_GOOGLE_(ID|SECRET)=.+$' "$LOCAL_PATH"; then
  echo "NOTE: OAuth empty — production will fail-closed for interactive login (expected until credentials are supplied)." >&2
fi

RSYNC_OPTS=(-avz)
if [[ "$APPLY" -eq 0 ]]; then
  RSYNC_OPTS+=(-n)
  echo ""
  echo "=== DRY RUN (no files written on remote). Pass --apply to sync. ==="
  echo "  remote: $REMOTE"
  echo "  source: $LOCAL_ENV"
  echo "  dest:   $APP_DIR/$REMOTE_ENV_NAME"
else
  if [[ "$RESTART" -eq 1 && "$APPLY" -eq 0 ]]; then
    echo "ERROR: --restart requires --apply" >&2
    exit 1
  fi
  echo ""
  echo "=== APPLY: writing $REMOTE:$APP_DIR/$REMOTE_ENV_NAME ==="
fi

ssh "$REMOTE" "test -d '$APP_DIR' || { echo 'ERROR: missing $APP_DIR — run ./deploy/bootstrap-server.sh first' >&2; exit 1; }"

rsync "${RSYNC_OPTS[@]}" "$LOCAL_PATH" "${REMOTE}:${APP_DIR}/${REMOTE_ENV_NAME}"

if [[ "$APPLY" -eq 1 ]]; then
  ssh "$REMOTE" "chmod 600 '$APP_DIR/$REMOTE_ENV_NAME'"
  echo "=== remote keys (names only) ==="
  ssh "$REMOTE" "grep -E '^[A-Za-z_][A-Za-z0-9_]*=' '$APP_DIR/$REMOTE_ENV_NAME' | cut -d= -f1 | sort"
fi

if [[ "$APPLY" -eq 0 ]]; then
  echo ""
  echo "Dry run complete. Re-run with --apply after reviewing warnings above."
  exit 0
fi

if [[ "$RESTART" -eq 1 ]]; then
  echo "=== recreate container with new env ==="
  ssh "$REMOTE" "set -euo pipefail
    cd '$APP_DIR'
    docker compose --env-file '$REMOTE_ENV_NAME' up -d --force-recreate
    docker compose --env-file '$REMOTE_ENV_NAME' ps
  "
  echo "Synced and restarted. Smoke: curl -sS https://tone.vsl-base.com/health"
else
  echo ""
  echo "Synced. Recreate the container to pick up env changes:"
  echo "  ./deploy/relaunch.sh"
  echo "  # or: ./deploy/sync-env-remote.sh --apply --restart"
fi
