import { TuningEngine } from "@/lib/tuning/tuning-engine";
import type { OpenStringTarget, TuningPreset } from "@/lib/tuning/types";
import {
  CATEGORY_LABELS,
  DEFAULT_TUNING_ID,
  filterPresetsBySearch,
  getTuningById,
  groupPresets,
  PRESET_CATEGORY_ORDER,
  TUNING_PRESETS,
} from "@/lib/tuning/tunings";

/** Single A4 reference for pitch detection and reference tones (keep in sync). */
export const REFERENCE_A4_HZ = 440 as const;

/**
 * Canonical preset list — UI, mic analysis, and reference tones all read from here.
 * Per-note Hz are 12-TET at `REFERENCE_A4_HZ` via `resolveOpenStrings` → `noteToHz`
 * (scientific pitches defined in `tunings.ts`).
 */
export const TUNING_LIBRARY = TUNING_PRESETS;

export {
  getTuningById,
  DEFAULT_TUNING_ID,
  CATEGORY_LABELS,
  PRESET_CATEGORY_ORDER,
  filterPresetsBySearch,
  groupPresets,
};

export function resolveOpenStrings(
  tuning: TuningPreset,
  referenceHz: number = REFERENCE_A4_HZ
): OpenStringTarget[] {
  return new TuningEngine(tuning).getOpenStringTargets(referenceHz);
}
