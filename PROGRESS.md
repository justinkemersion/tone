# PROGRESS — Tone Foundry rebuild

Another agent can resume from this file.

## Status (2026-08-27)

Foundry overlay + Tone domain are in the tree on `cursor/foundry-rebuild-7e17`. PR: https://github.com/justinkemersion/tone/pull/1

The product is a public guitar tuner at `/` (no account wall). Auth/Flux/R2 are wired as contracts with honest unavailable states. Live Flux and OAuth secrets are **not** present in this environment.

## Overlay

- Upstream: `justinkemersion/flux-app-foundry` @ `1abbc5507d7d1c8ee71279577e7fdf11f0a3850e`
- Stamped baseline: `foundry.baseline.json` `0.6.1` / `e818c6e` (not re-stamped)
- `pnpm foundry:status` → `current` (84/84). New `lib/flux/{preferences,custom-tunings,favorites}.ts` are extra files, not fingerprint mismatches.

## Product

- `/` public tuner: YIN CMNDF + 12-TET (default A440) + Standard guitar strings
- Guitar + chromatic; presets Standard / Drop D / D Standard / Drop C / Open G / Open D / DADGAD
- Distinct mic/pitch states; positional needle; cents; live region without cents spam
- Optional reference tone (detection muted while it plays)
- `/tunings` presets + custom CRUD (auth + Flux)
- `/settings` always local; Flux upsert when signed in
- `/recordings` honest R2-unavailable; upload never reports success
- Theme: localStorage `tone-prefs-v1` wins over server default so anonymous dark/light sticks
- PWA shell cache; auth/Flux/R2 not claimed offline

## Remaining Justin env

Exact list: `docs/SECRETS.md`. `flux.json` hash is still `REPLACE_AFTER_FLUX_INIT`. Do not invent a hash.

## Commands

```bash
pnpm lint
pnpm typecheck
pnpm exec vitest run
pnpm check:drift
pnpm build
pnpm foundry:status
pnpm foundry:compat
pnpm foundry:doctor    # expected fail without .env / Flux
pnpm flux:doctor       # expected fail without Flux
pnpm foundry:new-app-check  # expected fail until flux.json hash is real
```

## Resume notes

- Tuner math: `lib/tuner/` (theory, presets, `pitch/yin.ts`, engine, smoothing, state)
- Do not resurrect MPM; it octave-errored on guitar harmonics in tests
- Do not put `NEXT_PUBLIC_FLUX_*` anywhere
- Do not re-stamp `foundry.baseline.json`
- Homepage must stay public; `(dashboard)` stays fail-closed
