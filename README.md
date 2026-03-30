# Tone

**Tone** is a browser-based **guitar tuner** for everyday practice: **Listen** mode analyzes your playing from the mic, and **Reference** mode plays steady **open-string** pitches from the preset you choose. Both paths read the **same tuning data**, so detected notes and reference tones always agree.

---

## Where this project is going

Tone started as a focused foundation—a **`useTuner`** hook (Web Audio + autocorrelation), configuration-driven tunings, and a simple meter. It has grown into a **dual-mode** instrument UI:

1. **Core audio** — Mic analysis and a **triangle-wave** reference generator with **gain envelopes** (no clicks), single active reference tone, **Mute all** to stop everything.
2. **Modern UI** — Dark zinc layout, glass-style panels, **SVG arc** meter (with an in-tune glow), **Framer Motion** for mode and layout transitions, responsive **bento-style** string grid.
3. **Preset system** — Tunings are **typed data** (`TuningPreset` with optional **subtitle** for artist/context). The **PresetSelector** groups presets by **category**, supports **search**, and **favorites** persisted in **`localStorage`**.
4. **Expanded library** — Beyond standard/drop/open shapes, the catalog now includes **song-oriented** presets (alternate and “ostrich”-style tunings) for real repertoire, while staying at **A4 = 440 Hz** and **12-TET** unless you change the code.

The direction is still **configuration-first**: new tunings are added in data, and Hz are derived in one place (`resolveOpenStrings` → `noteToHz`) so Listen and Reference never drift.

---

## Features

| Area | What you get |
|------|----------------|
| **Listen** | `AnalyserNode` + autocorrelation, chromatic note + **Hz**, **cents** vs equal temperament, spring-animated arc. |
| **Reference** | Tap a string for a looping reference pitch; switching string or preset **fades** the previous tone. |
| **Presets** | Categorized library (see below); search; **heart** favorites; active preset highlighted in the picker and on the main card (name + muted subtitle). |
| **Mute all** | Stops the mic path and closes the reference output context after a short fade. |

---

## Tuning presets (overview)

All open-string pitches are **scientific notation** at **A4 = 440 Hz** (equal temperament). Per-string **Hz** are computed—not hand-pasted—so they stay consistent.

### Standard & half-step

- **Standard** — E A D G B E  
- **E♭ standard** — Half step down from standard  
- **D standard** — Whole step down from standard  

### Drop

- **Drop D**, **Drop C**, **Drop B**

### Open / modal

- **Open G**, **Open D**, **DADGAD**

### Song (with subtitles in the app)

| Preset | Notes |
|--------|--------|
| **Pink Moon** | Nick Drake — C G C F C E |
| **California** | Joni Mitchell — open E (E B E G♯ B E) |
| **Big Yellow Taxi** | Joni Mitchell — same open E; many players use open D + capo 2 (noted in UI) |
| **The Rain Song** | Led Zeppelin — DADGAD |
| **Holocene** | Bon Iver — open B♭ (B♭ F B♭ D F B♭) |
| **Venus in Furs** | The Velvet Underground — “ostrich” (D D D D D D at successive octaves) |
| **Schizophrenia** | Sonic Youth — F♯ F♯ B B C♯ C♯ |
| **Skinny Love** | Bon Iver — open C variant (C G C G C E; differs from Pink Moon on the 4th string) |

*Song tunings are for reference and practice; recordings may use capos or slightly different concert pitch.*

---

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript  
- [Tailwind CSS](https://tailwindcss.com) v4  
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)  
- [Framer Motion](https://www.framer.com/motion/)  

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Microphone access** needs a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or `localhost`).

```bash
npm run build   # production build
npm run start   # production server
npm run lint    # ESLint
```

---

## Project layout (high level)

| Path | Role |
|------|------|
| `src/hooks/useTuner.ts` | Mic capture, analyser loop, pitch → note + cents |
| `src/hooks/useReferenceTone.ts` | Reference oscillator, envelopes, single-voice policy |
| `src/hooks/useFavoriteTunings.ts` | Favorite preset IDs in `localStorage` |
| `src/lib/tuning/tunings.ts` | **`TUNING_PRESETS`** — all presets, categories, search/group helpers |
| `src/lib/tuning/tuning-library.ts` | **`REFERENCE_A4_HZ`**, re-exports, **`resolveOpenStrings`** → Hz |
| `src/context/TunerContext.tsx` | Listen / Reference mode, preset id, favorites API, mute |
| `src/components/tuner/` | `TunerApp`, `PresetSelector`, `StringGrid`, `TunerArc`, `ModeToggle`, … |

---

## TODO / ideas

- [ ] **User-defined tunings** — UI to add/edit presets (or import JSON) without editing `tunings.ts`; optional capo field as a hint only.  
- [ ] **Alternate pitch algorithms** — MPM or YIN behind a `PitchDetector` interface; compare stability on low strings.  
- [ ] **A4 / concert pitch** — Slider wired to `REFERENCE_A4_HZ` for both detection and reference.  
- [ ] **Per-string lock** — In Listen mode, bias cents toward the **active preset’s** open-string targets.  
- [ ] **Other instruments** — Bass / ukulele string sets using the same `TuningPreset` shape.  
- [ ] **Input level meter** — RMS from the time-domain buffer.  
- [ ] **PWA** — Installable, phone-on-stand workflow.  
- [ ] **Accessibility** — Arc semantics, reduced-motion variants for Framer.  
- [ ] **Tests** — `note-utils`, pitch detector edge cases, preset → Hz resolution.  

---

Bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
