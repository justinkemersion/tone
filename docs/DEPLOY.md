# Deploy Tone

Production URL: **https://tone.vsl-base.com**

## Topology

| Piece | Value |
|-------|--------|
| App host | `tone.vsl-base.com` (Traefik + ACME on `flux-network`) |
| Deploy SSH | `root@178.104.205.138` (`TONE_DEPLOY_HOST`) |
| App checkout | `/srv/apps/tone` on deploy host |
| Runtime env | `/srv/apps/tone/.env.docker` (from local `deploy/.env.docker`) |
| Git repo | `git@github.com:justinkemersion/tone.git` |
| Branch | `main` |
| Compose services | `web` (Next only — no worker) |
| Flux project | `tone` (see `flux.json`; hash stays `REPLACE_AFTER_FLUX_INIT` until `flux init`) |

Production must never load `.env.local`. Use a distinct `AUTH_SECRET` from development. Keep `AUTH_DEV_LOGIN=0` or unset.

Git is the source of truth. Server updates only via `git clone` / `git pull`. Do not rsync/scp source trees. rsync of gitignored `deploy/.env.docker` (secrets only) is allowed.

## First bootstrap

From a laptop with SSH to the deploy host (after `git push origin main`):

```bash
cp deploy/env.docker.example deploy/.env.docker
# Fill AUTH_SECRET (openssl rand -base64 32).
# Leave AUTH_GITHUB_* / AUTH_GOOGLE_* / FLUX_* / R2_* empty until credentials exist
# (tuner boots; login and persistence fail closed).
# AUTH_DEV_LOGIN must be 0/unset

./deploy/bootstrap-server.sh
./deploy/sync-env-remote.sh --apply
./deploy/relaunch.sh
```

DNS: `tone.vsl-base.com` → same A/proxy pattern as other `*.vsl-base.com` apps.

## Routine deploy

```bash
git push origin main
./deploy/relaunch.sh
# If env changed:
./deploy/sync-env-remote.sh --apply --restart
```

## Health

- App: `https://tone.vsl-base.com/health` → `{ ok: true, service: "tone" }`
- Container healthcheck uses the same path
- Served from `app/health/route.ts` (not under `app/api`) so Foundry's sole Auth.js API-route check stays intact.

## Rollback

1. On the server: `cd /srv/apps/tone && git fetch && git checkout <known-good-sha>`
2. `docker compose --env-file .env.docker up --build -d`
3. Schema: prefer forward-fix migrations; for data recovery use Flux backup tools (`flux backup`)

## OAuth

Production GitHub / Google OAuth app callbacks must match `AUTH_URL` / `NEXTAUTH_URL` (`https://tone.vsl-base.com`) when credentials are supplied:

- Local: `http://localhost:3000/api/auth/callback/github`
- Production: `https://tone.vsl-base.com/api/auth/callback/github`

Until then, interactive login stays fail-closed. `AUTH_DEV_LOGIN=1` is local-only.

## Flux

After `flux init` / link for slug `tone`, fill `FLUX_URL`, `FLUX_GATEWAY_JWT_SECRET`, and `FLUX_POSTGREST_SCHEMA` (from `pnpm flux:schema:sync`). Replace `flux.json` `hash` with the 7-char hash from `flux list`. Do not invent a hash. Then `flux push sql/migrations/`.
