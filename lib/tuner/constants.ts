/** Concert pitch A4. All 12-TET math takes an explicit reference; this is the default. */
export const DEFAULT_REFERENCE_HZ = 440;

/** MIDI note number of A4. */
export const MIDI_A4 = 69;

/** Guitar-relevant detection window (Drop C / low B through high harmonics). */
export const DETECT_MIN_HZ = 55;
export const DETECT_MAX_HZ = 1400;

/** RMS (0–1) below which the frame is silence. */
export const RMS_GATE = 0.006;

/** YIN / confidence floor to trust a pitch (1 - CMNDF dip). */
export const CLARITY_GATE = 0.85;

export const IN_TUNE_CENTS = 5;
export const NEARLY_TUNE_CENTS = 12;
export const DISPLAY_CENTS_CLAMP = 50;

/** Hold last pitch this long after the signal drops. */
export const STALE_MS = 320;

/** EMA coefficient for frequency smoothing (higher = snappier). */
export const FREQ_EMA_ALPHA = 0.32;

/** Stay on the current note unless the new candidate is this far away (cents). */
export const NOTE_HYSTERESIS_CENTS = 28;

export const DEFAULT_TUNING_ID = "standard";

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];
