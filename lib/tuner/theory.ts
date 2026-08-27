import {
  DEFAULT_REFERENCE_HZ,
  MIDI_A4,
  NOTE_NAMES,
  type NoteName,
} from "./constants";

const FLAT_ALIASES: Record<string, number> = {
  Db: 1,
  Eb: 3,
  Gb: 6,
  Ab: 8,
  Bb: 10,
};

export type ParsedNote = {
  name: string;
  letter: NoteName;
  octave: number;
  midi: number;
};

export type ChromaticPitch = {
  letter: NoteName;
  octave: number;
  label: string;
  midi: number;
  cents: number;
  referenceHz: number;
};

function pitchClassIndex(pc: string): number {
  if (pc in FLAT_ALIASES) return FLAT_ALIASES[pc];
  const idx = NOTE_NAMES.indexOf(pc as NoteName);
  if (idx === -1) throw new Error(`Unknown note: ${pc}`);
  return idx;
}

/** Scientific pitch notation, e.g. E2, A#3, Bb4. */
export function parseNote(note: string): ParsedNote {
  const m = note.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!m) throw new Error(`Invalid note: ${note}`);
  const letter = m[1].toUpperCase();
  const acc = m[2] ?? "";
  const octave = Number(m[3]);
  const name = `${letter}${acc}`;
  const pc = pitchClassIndex(name);
  const midi = (octave + 1) * 12 + pc;
  return { name, letter: NOTE_NAMES[pc], octave, midi };
}

export function midiToHz(midi: number, referenceHz = DEFAULT_REFERENCE_HZ): number {
  return referenceHz * 2 ** ((midi - MIDI_A4) / 12);
}

export function noteToHz(note: string, referenceHz = DEFAULT_REFERENCE_HZ): number {
  return midiToHz(parseNote(note).midi, referenceHz);
}

export function hzToMidi(hz: number, referenceHz = DEFAULT_REFERENCE_HZ): number {
  return MIDI_A4 + 12 * Math.log2(hz / referenceHz);
}

/** Signed cents from `fromHz` to `toHz`. */
export function centsBetween(fromHz: number, toHz: number): number {
  return 1200 * Math.log2(fromHz / toHz);
}

export function hzToChromaticPitch(
  hz: number,
  referenceHz = DEFAULT_REFERENCE_HZ,
): ChromaticPitch {
  const midiFloat = hzToMidi(hz, referenceHz);
  const midi = Math.round(midiFloat);
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const letter = NOTE_NAMES[pc];
  const reference = midiToHz(midi, referenceHz);
  return {
    letter,
    octave,
    label: `${letter}${octave}`,
    midi,
    cents: centsBetween(hz, reference),
    referenceHz: reference,
  };
}

export function formatCents(cents: number): string {
  const rounded = Math.round(cents);
  if (rounded === 0) return "0¢";
  return `${rounded > 0 ? "+" : ""}${rounded}¢`;
}

export function formatHz(hz: number): string {
  if (hz >= 1000) return `${hz.toFixed(0)} Hz`;
  if (hz >= 100) return `${hz.toFixed(1)} Hz`;
  return `${hz.toFixed(2)} Hz`;
}
