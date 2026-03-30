export type TuningCategory = "standard" | "drop" | "open" | "song";

/** A4 = 440 Hz — `notes` are low string → high string. */
export type TuningPreset = {
  id: string;
  name: string;
  category: TuningCategory;
  notes: readonly string[];
  /** e.g. artist for song presets */
  subtitle?: string;
};

/** Alias for engines and pitch code that only need id/name/notes. */
export type TuningConfig = TuningPreset;

export type OpenStringTarget = {
  /** 1-based string index (high E = 6 in standard). */
  stringIndex: number;
  note: string;
  hz: number;
};
