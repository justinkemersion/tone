import { IN_TUNE_CENTS, NEARLY_TUNE_CENTS } from "./constants";

export function centsToNeedle(cents: number, clamp = 50): number {
  const limited = Math.max(-clamp, Math.min(clamp, cents));
  return limited / clamp;
}

export function intonationClass(
  cents: number | null,
): "none" | "flat" | "nearly" | "in-tune" | "sharp" {
  if (cents == null || !Number.isFinite(cents)) return "none";
  const abs = Math.abs(cents);
  if (abs <= IN_TUNE_CENTS) return "in-tune";
  if (abs <= NEARLY_TUNE_CENTS) return "nearly";
  return cents < 0 ? "flat" : "sharp";
}
