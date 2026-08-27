# Foundry Baseline

Forked from **flux-app-foundry** into this repository (`justinkemersion/tone`) in place — git history of Tone is preserved.

| Field | Value |
|-------|--------|
| Based on | `flux-app-foundry` |
| Machine manifest | `foundry.baseline.json` (copied from upstream, not re-stamped) |
| Baseline version | `0.6.1` (`foundry.baseline.json`) |
| Baseline commit (stamped) | `e818c6e0b9f7d87c8d708e08ae12b46890bfd35b` |
| Upstream HEAD at overlay | `1abbc5507d7d1c8ee71279577e7fdf11f0a3850e` |
| Last synced | 2026-08-27 |
| Flux surface | `_contract/flux.md`, `_contract/flux-workflow.md` |

## Local deviations

- Product: Tone — public guitar tuner at `/`. Auth unlocks persistence; it does not gate the tuner.
- `package.json` name is `tone`. Default tagline is tuner-specific (override with `NEXT_PUBLIC_APP_TAGLINE`).
- `flux.json` slug is `tone`. Hash remains `REPLACE_AFTER_FLUX_INIT` until Justin runs `flux init` / link. Do not fabricate a project hash.
- `auth.ts` allows zero OAuth providers so the tuner runs without secrets. Login shows a truthful unavailable state.
- Homepage `/` is the tuner (Foundry sample used sign-in → `/dashboard`). Protected routes still fail closed.
- App shell is a thin instrument header (no SaaS sidebar chrome on the tuner). Foundry sample records CRUD remains at `/records` as a Flux pattern, not primary IA.
- Domain SQL: `0007_tone_entities.sql`, `0008_tone_grants.sql` (preferences, custom tunings, favorites). Recordings table is a metadata stub only.
- Domain Flux helpers added under `lib/flux/` (`preferences.ts`, `custom-tunings.ts`, `favorites.ts`). Existing Foundry fingerprints still match (`pnpm foundry:status` → `current`); new files are app domain wrappers calling `fluxJson`.
- Optional R2 env contract for later recordings. Cloud save is never faked.
- PWA manifest + service worker cache the tuner shell. Auth/Flux/R2 are not claimed to work offline.

## Remaining Justin env (exact)

See `docs/SECRETS.md`. Until Flux is linked, `pnpm foundry:new-app-check` honestly fails on `flux.json` hash, and `pnpm foundry:doctor` / `pnpm flux:doctor` fail or skip live probes.

## Reference compatibility

Keep `fixtures/reference-app/` + `pnpm foundry:compat`. Do not add a parallel `_compat/` harness.
