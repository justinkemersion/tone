# PROGRESS — Tone Foundry rebuild

Another agent can resume from this file.

## Status

**In progress:** Foundry overlay is in the tree. Tone domain (tuner, persistence, secondary IA, tests, browser pass) is being implemented on this branch.

## Overlay

- Upstream: `justinkemersion/flux-app-foundry` @ `1abbc5507d7d1c8ee71279577e7fdf11f0a3850e`
- Stamped baseline: `foundry.baseline.json` `0.6.1` / commit `e818c6e` (not re-stamped)
- Old Next 16 / Framer / glass-bento app removed from the working tree (history remains on `main`)
- Harvested from legacy Tone: 12-TET note math, preset note lists (Standard, Drop D, D Standard, Drop C, Open G, Open D, DADGAD), guitar-fundamental octave caution. Discarded: Listen-vs-Reference identity, glass/bento/Framer UI, localStorage-only favorites as the product persistence story, naive product architecture.

## Product decisions (locked)

- `/` is the tuner and is public. No account wall.
- Guitar mode default: Standard E2 A2 D3 G3 B3 E4. Chromatic mode available.
- Pitch: McLeod Pitch Method (NSDF) + RMS gate + clarity + hysteresis/smoothing + stale idle. Not zero-crossing.
- Persistence: Flux/Postgres RLS for preferences, custom tunings, favorites. Built-in presets are code.
- Recordings/R2: interfaces + env only unless credentials exist. Never fake a successful cloud save.
- Flux hash / OAuth / R2 secrets are Justin's. Document, don't invent.

## Next (if resuming)

1. Finish tuner modules + UI if incomplete.
2. Domain migrations `0007`/`0008` + `lib/flux` helpers + `/tunings` `/settings`.
3. Tests, `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
4. Browser: 375 / 768 / 1280 / 1440, dark and light.
5. Honest doctor: do not fake Flux success.
6. Update this file, README, `docs/SECRETS.md`, PR body.

## Commands

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm exec vitest run   # unit tests without drift (faster loop)
pnpm test              # includes check:drift
pnpm build             # uses real env or CI stubs
pnpm foundry:status
pnpm foundry:compat
pnpm foundry:doctor    # expected fail without .env / Flux
pnpm flux:doctor       # expected fail without Flux
```
