const NOTE_NAMES = [
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

const NOTE_ALIASES: Record<string, number> = {
  Db: 1,
  Eb: 3,
  Gb: 6,
  Ab: 8,
  Bb: 10,
};

export type ParsedNote = {
  name: string;
  octave: number;
  midi: number;
};

function pitchClassToIndex(pc: string): number {
  const upper = pc.trim();
  if (upper in NOTE_ALIASES) return NOTE_ALIASES[upper];
  const idx = NOTE_NAMES.indexOf(upper as (typeof NOTE_NAMES)[number]);
  if (idx === -1) throw new Error(`Unknown note: ${pc}`);
  return idx;
}

/** Scientific notation e.g. "E2", "A#3", "Bb4". */
export function parseNote(note: string): ParsedNote {
  const m = note.trim().match(/^([A-Ga-g])([#b]?)(\d+)$/);
  if (!m) throw new Error(`Invalid note: ${note}`);
  const letter = m[1].toUpperCase();
  const acc = m[2] ?? "";
  const octave = Number(m[3]);
  const name = `${letter}${acc}`;
  const pc = pitchClassToIndex(name);
  const midi = (octave + 1) * 12 + pc;
  return { name, octave, midi };
}

export function midiToHz(midi: number, referenceHz = 440): number {
  return referenceHz * 2 ** ((midi - 69) / 12);
}

export function noteToHz(note: string, referenceHz = 440): number {
  return midiToHz(parseNote(note).midi, referenceHz);
}

/** Cents difference between two frequencies (signed). */
export function centsBetween(hzMeasured: number, hzReference: number): number {
  return 1200 * Math.log2(hzMeasured / hzReference);
}

export type ChromaticPitch = {
  /** e.g. "E" */
  letter: string;
  octave: number;
  /** Display like "E2" */
  label: string;
  midi: number;
  /** Deviation from equal-tempered pitch for that MIDI note. */
  cents: number;
  referenceHz: number;
};

/**
 * Map a frequency to the nearest 12-TET chromatic pitch (A4 = referenceHz).
 */
export function hzToChromaticPitch(
  hz: number,
  referenceHz = 440
): ChromaticPitch {
  const midiFloat = 12 * Math.log2(hz / referenceHz) + 69;
  const midi = Math.round(midiFloat);
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const letter = NOTE_NAMES[pc];
  const label = `${letter}${octave}`;
  const refHz = midiToHz(midi, referenceHz);
  const cents = centsBetween(hz, refHz);
  return { letter, octave, label, midi, cents, referenceHz: refHz };
}
