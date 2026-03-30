# Tone

**Tone** is a browser-based guitar tuner built for daily use: a **Listen** mode that reads your instrument from the microphone, and a **Reference** mode that plays steady open-string pitches from your chosen tuning preset. Pitch detection and reference frequencies both come from the same tuning data so they never disagree.

## Features

- **Listen** — Web Audio `AnalyserNode` + autocorrelation pitch tracking, chromatic note readout, cents deviation, and an SVG arc meter with a clear in-tune state.
- **Reference** — Tap a string to hear a continuous **triangle** oscillator at that string’s Hz, with **gain ramps** on start/stop to avoid clicks. Only one reference tone at a time; changing string or preset fades the previous tone.
- **Presets** — Configuration-driven tunings (e.g. Standard, Drop D) via a shared `tuning-library`; easy to extend with more presets in code.
- **Mute all** — Stops microphone analysis and tears down the reference output context after a short fade.
- **UI** — Dark zinc theme, glass-style panels, responsive layout (bento-style on larger screens, large tap targets on mobile), motion via Framer Motion.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript  
- [Tailwind CSS](https://tailwindcss.com) v4  
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)  
- [Framer Motion](https://www.framer.com/motion/)  

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Microphone access** requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or `localhost`).

Other scripts:

```bash
npm run build   # production build
npm run start   # run production server
npm run lint    # ESLint
```

## Project layout (high level)

| Area | Role |
|------|------|
| `src/hooks/useTuner.ts` | Mic capture, analyser loop, pitch → note + cents |
| `src/hooks/useReferenceTone.ts` | Reference oscillator, envelopes, single-voice policy |
| `src/lib/tuning/tuning-library.ts` | Canonical `REFERENCE_A4_HZ`, presets, `resolveOpenStrings` |
| `src/context/TunerContext.tsx` | Mode (`listen` / `play`), tuning selection, mute, string playback |
| `src/components/tuner/` | Shell UI, arc meter, string grid, mode toggle |

## TODO / ideas

Possible directions if you want to grow the app later:

- [ ] **Custom tunings & song presets** — UI to save/load named tunings (JSON or local storage), plus “song” presets that bundle tuning + capo/fret hints.
- [ ] **Alternate pitch algorithms** — Implement McLeod Pitch Method or YIN behind a `PitchDetector` interface and A/B or auto-select by stability.
- [ ] **A4 / concert pitch** — User-adjustable reference (e.g. 432–446 Hz) wired through `REFERENCE_A4_HZ` for both detection and reference tones.
- [ ] **Per-string lock** — In Listen mode, optionally lock the meter to the nearest *open-string target* for the active preset instead of pure chromatic nearest semitone.
- [ ] **Other instruments** — Extra preset types (bass, ukulele, alternate string counts) using the same `TuningConfig` shape.
- [ ] **Input level meter** — Simple RMS strip from the time-domain buffer for “signal too weak” feedback.
- [ ] **PWA / install** — Offline shell, icon, standalone display for phone-on-music-stand use.
- [ ] **Accessibility** — Stronger screen-reader labels for arc position, reduced-motion path for Framer animations.
- [ ] **Tests** — Unit tests for `note-utils`, pitch detector edge cases, and tuning resolution.

---

Bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
