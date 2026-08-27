# 016 — Tone on Foundry

Rebuild Tone in `justinkemersion/tone` as a Foundry fork. Overlay complete; this plan is the domain work.

- [x] Overlay Foundry; keep `foundry.baseline.json`; record `FOUNDRY_BASELINE.md`
- [x] `/` is a public guitar tuner (no account wall)
- [x] YIN pitch detection + 12-TET + guitar presets
- [x] Domain SQL `0007`/`0008` with RLS
- [x] Flux helpers + server actions fail closed
- [x] `/tunings`, `/settings`, `/recordings` (honest R2)
- [x] Theme/local prefs: device storage is not overwritten by the tuner
- [ ] `pnpm lint && pnpm typecheck && pnpm exec vitest run && pnpm check:drift && pnpm build` (re-run after this pass)
- [ ] Browser pass 375 / 768 / 1280 / 1440 dark+light
- [x] Honest `foundry:doctor` / `flux:doctor` (fail without Justin credentials)
