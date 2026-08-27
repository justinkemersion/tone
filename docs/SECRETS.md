# Secrets checklist (Justin)

Nothing in this file is a secret. Do not commit `.env` or real credentials.

The tuner at `/` does not need any of these. Persistence and sign-in do.

## Required for Flux persistence (custom tunings, synced preferences)

After `flux login` and `flux init` (or link) for slug `tone`:

| Variable | Where | Notes |
|----------|--------|--------|
| `FLUX_URL` | `.env` | From `flux project credentials` / `flux list` |
| `FLUX_GATEWAY_JWT_SECRET` | `.env` | Per-project gateway secret |
| `FLUX_POSTGREST_SCHEMA` | `.env.local` only | Written by `pnpm flux:schema:sync`. Do not put an empty key in `.env`. |
| `flux.json` `hash` | repo | Replace `REPLACE_AFTER_FLUX_INIT` with the 7-char hash from `flux list`. Do not invent one. |

Then: `flux push sql/migrations/` (versioned ledger) → `pnpm flux:schema:sync` → `pnpm flux:doctor`.

## Required for Auth.js sign-in

| Variable | Notes |
|----------|--------|
| `AUTH_SECRET` | `openssl rand -base64 32` — min 32 characters, not a default/example value |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth app, **or** |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client |

At least one provider pair. Callback URL: `{origin}/api/auth/callback/github` (and/or google).

## Optional R2 (recordings)

| Variable | Notes |
|----------|--------|
| `R2_ACCOUNT_ID` | Cloudflare account id |
| `R2_ACCESS_KEY_ID` | R2 API token |
| `R2_SECRET_ACCESS_KEY` | R2 API secret |
| `R2_BUCKET_NAME` | Bucket |
| `R2_PUBLIC_BASE_URL` | Optional public URL prefix |

`/recordings` tells the truth if these are missing. No successful cloud save is claimed.

## Optional branding

`NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_TAGLINE`

## Honest doctor

- `pnpm foundry:doctor` fails without `.env` / OAuth / Flux — that is correct.
- `pnpm flux:doctor` is skipped or fails without `FLUX_URL`.
- `pnpm foundry:new-app-check` fails until `flux.json` hash is real.
- Never stub those to green.
