import type { TuningConfig } from "./types";

export const TUNINGS: readonly TuningConfig[] = [
  {
    id: "standard",
    name: "Standard",
    notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
  },
  {
    id: "drop-d",
    name: "Drop D",
    notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
  },
] as const;

export function getTuningById(id: string): TuningConfig | undefined {
  return TUNINGS.find((t) => t.id === id);
}

export const DEFAULT_TUNING_ID = "standard";
