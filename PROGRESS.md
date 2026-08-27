# PROGRESS — Tone Foundry rebuild

Another agent can resume from this file.

## Status (2026-08-27)

**Rebuild shipped on `cursor/foundry-rebuild-7e17`.** PR: https://github.com/justinkemersion/tone/pull/1

Foundry overlay + Tone domain are in the tree. `/` is a public guitar tuner. Auth/Flux/R2 are contracts with honest unavailable states. Live Flux and OAuth secrets are **not** present in this environment.

**Visual pass (2026-08-27 follow-up):** Headless Chrome screenshots at 375 / 768 / 1280, dark and light, for `/` `/tunings` `/settings` `/login`, plus `/recordings` once (1280 dark). **1440 not captured.** Files: `/opt/cursor/artifacts/screenshots/`. Layout fixes from that pass: six strings stay on one row at 375; tighter tuner stack on mobile; Tuner nav link hidden below `sm` (TONE still goes home); extra bottom padding on `/tunings`.

## Overlay

- Upstream: `justinkemersion/flux-app-foundry` @ `1abbc5507d7d1c8ee71279577e7fdf11f0a3850e`
- Stamped baseline: `foundry.baseline.json` `0.6.1` / `e818c6e` (not re-stamped)
- `pnpm foundry:status` → `current` (84/84). Extra `lib/flux/{preferences,custom-tunings,favorites}.ts` do not break fingerprints.

## Product

- `/` public tuner: YIN CMNDF + 12-TET (default A440) + Standard guitar strings
- Guitar + chromatic; presets Standard / Drop D / D Standard / Drop C / Open G / Open D / DADGAD
- Distinct mic/pitch states; positional needle; cents; live region without cents spam
- Optional reference tone (detection muted while it plays)
- `/tunings` presets + custom CRUD (auth + Flux)
- `/settings` always local; Flux upsert when signed in
- `/recordings` honest R2-unavailable; upload never reports success
- Theme: localStorage `tone-prefs-v1` is merged, not overwritten by the tuner
- PWA shell cache; auth/Flux/R2 not claimed offline

## Remaining Justin env

Exact list: `docs/SECRETS.md`. `flux.json` hash is still `REPLACE_AFTER_FLUX_INIT`. Do not invent a hash.

## Validation recorded (commit `e5d8fdd` + docs pass)

| Command | Result |
|---------|--------|
| `pnpm lint` | pass |
| `pnpm typecheck` | pass |
| `pnpm exec vitest run` | **119** tests, 21 files, pass |
| `pnpm check:drift` | pass (file-sizes, imports, contracts, SQL placeholders, graph) |
| `pnpm build` (template CI stubs) | pass |
| `pnpm foundry:status` | `current` 84/84, 6/6 security invariants |
| `pnpm foundry:compat` | local pass; live probes skipped/pending |
| `pnpm foundry:verify:template` | **fails honestly** at `foundry:new-app-check` (`flux.json` hash `REPLACE_AFTER_FLUX_INIT`) after lint/typecheck/test/drift already passed |
| `pnpm foundry:doctor` | **fails honestly** — no `.env`; hash placeholder; missing `AUTH_SECRET` / `FLUX_URL` / `FLUX_GATEWAY_JWT_SECRET` |
| `pnpm flux:doctor` | **fails honestly** — hash placeholder, no login, no `FLUX_URL` |
| `pnpm foundry:new-app-check` | **fails honestly** — flux.json hash not configured |

HTTP against `http://localhost:3000` (dev, `AUTH_SECRET` stub only):

| Path | Result |
|------|--------|
| `/` `/tunings` `/settings` `/recordings` `/login` `/manifest.webmanifest` | **200** |
| `/dashboard` | **307** → `/login` (fail-closed; unauthenticated) |

**Not captured:** 1440; `/recordings` at 375/768 or light; live microphone (permission not granted in this environment). Next.js dev “N” overlay appears in screenshots; it is not product UI.

After layout fixes: `pnpm lint`, `typecheck`, `vitest run` (119), and template-env `pnpm build` passed. `flux.json` hash untouched.

## Resume notes

- Tuner math: `lib/tuner/` (theory, presets, `pitch/yin.ts`, engine, smoothing, state)
- Do not resurrect MPM; it octave-errored on guitar harmonics in tests
- Do not put `NEXT_PUBLIC_FLUX_*` anywhere
- Do not re-stamp `foundry.baseline.json`
- Homepage must stay public; `(dashboard)` stays fail-closed
- Next human work: `flux init` + OAuth + optional R2 from `docs/SECRETS.md`; optional visual QA
