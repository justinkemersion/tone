# PROGRESS — Tone

Another agent can resume from this file.

## Status (2026-08-30)

**This pass:** usable tuner lifecycle + honest pitch hold + quieter homepage, on `cursor/agent-operational-guidelines-2c2e`.

**Before this pass** (main @ `9c7b3ae`, Foundry rebuild PR https://github.com/justinkemersion/tone/pull/1): `/` was already a public YIN tuner with guitar/chromatic presets, needle, cents, and optional reference tones. Mic start existed, but there was no stop/retry while listening, no tab/background handling, no unsupported-browser status, and a weak jump could keep a stale note alive. Homepage showed an account teaser. `:root` painted light before theme JS.

## What changed this pass

- Mic capability/error/permission helpers in `lib/tuner/mic.ts` (testable). `useMicCapture` now classifies insecure/unsupported browsers, resumes AudioContext when the tab returns, suspends while hidden, and treats a dead track as “no microphone.”
- Start / stop / retry: Allow → Waiting → Stop; Escape stops. Prior mic grant autostarts (Permissions API only; Safari without it still needs a tap).
- Pitch hold: rejected harmonic jumps no longer refresh `updatedAt`. Last note can be **held** briefly, then clears. Reference playback and a hidden tab clear the readout so we do not show a stale frequency. Hz is hidden while held.
- Readout: note + octave, cents direction (“Tune up · -12¢”), in-tune color on the note/needle, larger tuning/mode targets. Tuning picker hidden in chromatic mode.
- Dark is the CSS first paint; light remains an explicit `data-theme="light"`. Removed the homepage “Tuning works without an account” teaser.
- Tests: 136 (was 119). RTL cleanup added in `vitest.setup.ts`.

## Overlay (unchanged)

- Upstream: `justinkemersion/flux-app-foundry` @ `1abbc5507d7d1c8ee71279577e7fdf11f0a3850e`
- Stamped baseline: `foundry.baseline.json` `0.6.1` / `e818c6e` (**not** re-stamped)
- `pnpm foundry:status` → `current` (84/84)

## Validation (this pass)

| Command | Result |
|---------|--------|
| `pnpm lint` | pass |
| `pnpm typecheck` | pass |
| `pnpm exec vitest run` | **136** tests, 23 files, pass |
| `pnpm check:drift` | pass |
| `pnpm build` (template CI stubs) | pass |
| `pnpm foundry:status` | `current` 84/84, 6/6 security invariants |
| `pnpm foundry:compat` | local pass; live probes skipped/pending |
| `pnpm foundry:doctor` / `flux:doctor` / `foundry:verify:template` | **not stubbed green** — still fail honestly without Justin Flux/OAuth |

HTTP against `http://localhost:3000` (production `pnpm start`, AUTH stub only):

| Path | Result |
|------|--------|
| `/` `/tunings` `/settings` `/login` `/health` | **200** (`/health` → `{ ok: true, service: "tone" }`) |
| `/dashboard` | **307** → `/login` |

Browser (Chrome + interactive pass): 375 and ~1280. First-use is Allow microphone → play a string. Clicking Allow here → “No microphone” + Try again (no capture device). Drop D updates the lowest string to D2. Chromatic hides string buttons and (after this pass) the tuning picker. Light theme from Settings is readable. Tab reaches Allow/Try again; Escape does not crash. **Live pitch / in-tune with a real guitar was not exercised** — this environment has no microphone.

## Remaining risks

- iOS Safari Permissions API is missing; autostart will not run there until the user taps Allow (correct).
- No live guitar signal in this environment; YIN/smoothing are unit-tested with synthetic buffers only.
- `flux.json` hash is still `REPLACE_AFTER_FLUX_INIT`. Do not invent one.

## Next best tranche

1. Real-device pass: phone + desktop with a guitar — confirm hold length, harmonic lock, and iOS interrupt/resume.
2. Justin env: `flux init` + OAuth (+ optional R2) from `docs/SECRETS.md`. Then `pnpm flux:doctor` / `foundry:doctor` can be honest-green.
3. Ship via `docs/DEPLOY.md`. Do not SSH from this agent. Do not merge to `main` unless Justin asks.

## Resume notes

- Tuner math: `lib/tuner/` (theory, presets, `pitch/yin.ts`, engine, smoothing, `mic.ts`, state)
- Do not resurrect MPM
- Do not put `NEXT_PUBLIC_FLUX_*` anywhere
- Do not re-stamp `foundry.baseline.json`
- Homepage must stay public and tuner-focused; `(dashboard)` stays fail-closed

## Deploy

Production: **https://tone.vsl-base.com**. See `docs/DEPLOY.md`. Flux/OAuth/R2 stay empty until Justin adds them; the tuner must still boot.
