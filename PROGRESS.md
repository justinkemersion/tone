# PROGRESS — Tone Foundry rebuild

Another agent can resume from this file.

## Status

**Domain implemented.** Overlay + tuner + persistence model + secondary IA are in the tree. Next: install, test, lint, typecheck, drift, build, browser pass, honest doctor.

## Overlay

- Upstream: `justinkemersion/flux-app-foundry` @ `1abbc5507d7d1c8ee71279577e7fdf11f0a3850e`
- Stamped baseline: `foundry.baseline.json` `0.6.1` / `e818c6e` (not re-stamped)
- `foundry:status` will report `locally_customized` because domain helpers were added under `lib/flux/` (expected).

## Product

- `/` public tuner (MPM + 12-TET + Standard default)
- `/tunings` presets + custom CRUD (auth + Flux)
- `/settings` local always; Flux when signed in
- `/recordings` honest unavailable
- Auth does not gate the tuner. Empty OAuth providers allowed.

## Remaining Justin env

See `docs/SECRETS.md`. `flux.json` hash is still `REPLACE_AFTER_FLUX_INIT`.

## Commands

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm exec vitest run
pnpm check:drift
pnpm build
pnpm foundry:status
pnpm foundry:compat
pnpm foundry:doctor    # expected fail without .env / Flux
pnpm flux:doctor       # expected fail without Flux
```
