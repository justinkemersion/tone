import type { TuningCategory, TuningPreset } from "./types";

/**
 * Open-string scientific pitches at A4 = 440 Hz (equal temperament).
 */
export const TUNING_PRESETS: readonly TuningPreset[] = [
  /* Standard & half-step */
  {
    id: "standard",
    name: "Standard",
    category: "standard",
    notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
  },
  {
    id: "eb-standard",
    name: "E♭ standard",
    category: "standard",
    notes: ["Eb2", "Ab2", "Db3", "Gb3", "Bb3", "Eb4"],
  },
  {
    id: "d-standard",
    name: "D standard",
    category: "standard",
    notes: ["D2", "G2", "C3", "F3", "A3", "D4"],
  },
  /* Drop */
  {
    id: "drop-d",
    name: "Drop D",
    category: "drop",
    notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
  },
  {
    id: "drop-c",
    name: "Drop C",
    category: "drop",
    notes: ["C2", "G2", "C3", "F3", "A3", "D4"],
  },
  {
    id: "drop-b",
    name: "Drop B",
    category: "drop",
    notes: ["B1", "F#2", "B2", "E3", "G#3", "C#4"],
  },
  /* Open / modal */
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
  /* Song */
  {
    id: "song-pink-moon",
    name: "Pink Moon",
    category: "song",
    subtitle: "Nick Drake",
    notes: ["C2", "G2", "C3", "F3", "C4", "E4"],
  },
  {
    id: "song-california",
    name: "California",
    category: "song",
    subtitle: "Joni Mitchell",
    notes: ["E2", "B2", "E3", "G#3", "B3", "E4"],
  },
  {
    id: "song-big-yellow-taxi",
    name: "Big Yellow Taxi",
    category: "song",
    subtitle: "Joni Mitchell · open E (open D + capo 2 is common)",
    notes: ["E2", "B2", "E3", "G#3", "B3", "E4"],
  },
  {
    id: "song-rain-song",
    name: "The Rain Song",
    category: "song",
    subtitle: "Led Zeppelin",
    notes: ["D2", "A2", "D3", "G3", "A3", "D4"],
  },
] as const;

export const PRESET_CATEGORY_ORDER: readonly TuningCategory[] = [
  "standard",
  "drop",
  "open",
  "song",
] as const;

export const CATEGORY_LABELS: Record<TuningCategory, string> = {
  standard: "Standard & half-step",
  drop: "Drop",
  open: "Open / modal",
  song: "Song",
};

export function getTuningById(id: string): TuningPreset | undefined {
  return TUNING_PRESETS.find((t) => t.id === id);
}

export const DEFAULT_TUNING_ID = "standard";

export function filterPresetsBySearch(
  presets: readonly TuningPreset[],
  query: string
): TuningPreset[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...presets];
  return presets.filter((p) => {
    const hay = [
      p.name,
      p.id,
      p.subtitle ?? "",
      ...p.notes,
      CATEGORY_LABELS[p.category],
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function groupPresets(
  presets: readonly TuningPreset[]
): Record<TuningCategory, TuningPreset[]> {
  const empty: Record<TuningCategory, TuningPreset[]> = {
    standard: [],
    drop: [],
    open: [],
    song: [],
  };
  for (const p of presets) {
    empty[p.category].push(p);
  }
  return empty;
}
