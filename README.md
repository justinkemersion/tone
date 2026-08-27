# Tone

Open the site. Allow the microphone. Play a guitar string. Tune.

Tone is a Foundry (Flux) application. `/` is the tuner and works without an account. Sign-in is optional and only unlocks saved tunings and preferences.

## First run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Microphone access needs a secure context (`localhost` or HTTPS).

No Flux, OAuth, or R2 credentials are required to tune.

## What it does

- Continuous pitch detection in the browser (YIN, not zero-crossing)
- 12-TET math with a configurable A4 (default 440 Hz)
- Guitar mode (nearest open string) and chromatic mode
- Built-in presets: Standard, Drop D, D Standard, Drop C, Open G, Open D, DADGAD
- Flat / nearly / in-tune / sharp, with cents and a positional needle
- Optional reference tone on a string (detection is muted while it plays)
- Dark and light themes

## Persistence (optional)

When Justin has linked a Flux project and OAuth:

- Preferences (reference Hz, default tuning, theme, mode)
- Custom tunings and favorites

RLS: `jwt.sub = user_id`. All Flux HTTP goes through `lib/flux` on the server.

Recordings/R2: env contract and an honest unavailable page only. Cloud save is never faked.

## Foundry

This repo is a Foundry fork of [`flux-app-foundry`](https://github.com/justinkemersion/flux-app-foundry). See `FOUNDRY_BASELINE.md`, `_contract/`, and `docs/FIRST_FORK.md`.

Until `flux init` is run, `flux.json` hash stays `REPLACE_AFTER_FLUX_INIT`. That is intentional. Exact remaining secrets: [`docs/SECRETS.md`](docs/SECRETS.md). Resume notes: [`PROGRESS.md`](PROGRESS.md).

```bash
pnpm lint
pnpm typecheck
pnpm exec vitest run
pnpm check:drift
pnpm build
pnpm foundry:status
pnpm foundry:compat
# After .env + Flux:
pnpm flux:doctor
pnpm foundry:doctor
pnpm foundry:verify
```

`foundry:new-app-check` / live doctors fail honestly until Flux and OAuth exist. Do not stub them green.

## Layout

| Path | Role |
|------|------|
| `/` | Public tuner |
| `/tunings` | Presets + custom tunings (auth to persist) |
| `/settings` | Reference, theme, default tuning |
| `/login` | Auth.js (GitHub/Google when configured) |
| `/recordings` | Honest R2-unavailable state |

Pitch math lives in `lib/tuner/`. Do not put Flux credentials in client code.
