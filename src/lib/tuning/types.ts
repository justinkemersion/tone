export type TuningConfig = {
  id: string;
  name: string;
  /** Scientific pitch, low string first (standard guitar order). */
  notes: readonly string[];
};

export type OpenStringTarget = {
  /** 1-based string index (high E = 6 in standard). */
  stringIndex: number;
  note: string;
  hz: number;
};
