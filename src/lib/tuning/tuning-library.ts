import { TuningEngine } from "@/lib/tuning/tuning-engine";
import type { OpenStringTarget, TuningConfig } from "@/lib/tuning/types";
import {
  DEFAULT_TUNING_ID,
  getTuningById,
  TUNINGS,
} from "@/lib/tuning/tunings";

/** Single A4 reference for pitch detection and reference tones (keep in sync). */
export const REFERENCE_A4_HZ = 440 as const;

/** Canonical preset list — use this for UI, detection targets, and tone generation. */
export const TUNING_LIBRARY = TUNINGS;

export { getTuningById, DEFAULT_TUNING_ID };

export function resolveOpenStrings(
  tuning: TuningConfig,
  referenceHz: number = REFERENCE_A4_HZ
): OpenStringTarget[] {
  return new TuningEngine(tuning).getOpenStringTargets(referenceHz);
}
