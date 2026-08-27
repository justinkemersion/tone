import { DEFAULT_TUNING_ID } from "./constants";
import { noteToHz, parseNote } from "./theory";

export type TuningCategory = "standard" | "drop" | "open";

export type TuningPreset = {
  id: string;
  name: string;
  category: TuningCategory;
  notes: readonly string[];
};

export const TUNING_PRESETS: readonly TuningPreset[] = [
  {
    id: "standard",
    name: "Standard",
    category: "standard",
    notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
  },
  {
    id: "drop-d",
    name: "Drop D",
    category: "drop",
    notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
  },
  {
    id: "d-standard",
    name: "D Standard",
    category: "standard",
    notes: ["D2", "G2", "C3", "F3", "A3", "D4"],
  },
  {
    id: "drop-c",
    name: "Drop C",
    category: "drop",
    notes: ["C2", "G2", "C3", "F3", "A3", "D4"],
  },
  {
    id: "open-g",
    name: "Open G",
    category: "open",
    notes: ["D2", "G2", "D3", "G3", "B3", "D4"],
  },
  {
    id: "open-d",
    name: "Open D",
    category: "open",
    notes: ["D2", "A2", "D3", "F#3", "A3", "D4"],
  },
  {
    id: "dadgad",
    name: "DADGAD",
    category: "open",
    notes: ["D2", "A2", "D3", "G3", "A3", "D4"],
  },
];

export const PRESET_CATEGORY_ORDER: readonly TuningCategory[] = [
  "standard",
  "drop",
  "open",
];

export const CATEGORY_LABELS: Record<TuningCategory, string> = {
  standard: "Standard",
  drop: "Drop",
  open: "Open",
};

export function getPresetById(id: string): TuningPreset | undefined {
  return TUNING_PRESETS.find((t) => t.id === id);
}

export function resolvePreset(id: string | null | undefined): TuningPreset {
  return getPresetById(id ?? DEFAULT_TUNING_ID) ?? TUNING_PRESETS[0];
}

export type OpenString = {
  index: number;
  stringNumber: number;
  note: string;
  hz: number;
  midi: number;
};

/** String 6 is the lowest (index 0) through string 1 (highest). */
export function resolveOpenStrings(
  notes: readonly string[],
  referenceHz: number,
): OpenString[] {
  return notes.map((note, index) => {
    const parsed = parseNote(note);
    return {
      index,
      stringNumber: notes.length - index,
      note,
      hz: noteToHz(note, referenceHz),
      midi: parsed.midi,
    };
  });
}

export { DEFAULT_TUNING_ID };
