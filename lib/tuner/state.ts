import { IN_TUNE_CENTS, NEARLY_TUNE_CENTS } from "./constants";
import type { ChromaticPitch } from "./theory";
import type { StringTarget } from "./targets";

export type MicStatus =
  | "idle"
  | "requesting"
  | "listening"
  | "permission-denied"
  | "unavailable"
  | "init-failed";

export type TunerMode = "guitar" | "chromatic";

export type Intonation = "none" | "flat" | "nearly" | "in-tune" | "sharp";

export type TunerView = {
  mic: MicStatus;
  mode: TunerMode;
  intonation: Intonation;
  hz: number | null;
  cents: number | null;
  note: ChromaticPitch | null;
  target: StringTarget | null;
  confidence: number;
  amplitude: number;
  stale: boolean;
};

export function intonationFromCents(cents: number | null): Intonation {
  if (cents == null || !Number.isFinite(cents)) return "none";
  const abs = Math.abs(cents);
  if (abs <= IN_TUNE_CENTS) return "in-tune";
  if (abs <= NEARLY_TUNE_CENTS) return "nearly";
  return cents < 0 ? "flat" : "sharp";
}

export function liveRegionMessage(view: TunerView): string {
  if (view.mic === "idle") return "Allow microphone to start tuning.";
  if (view.mic === "requesting") return "Waiting for microphone permission.";
  if (view.mic === "permission-denied") return "Microphone permission denied.";
  if (view.mic === "unavailable") return "No microphone available.";
  if (view.mic === "init-failed") return "Audio could not start.";
  if (view.stale || view.intonation === "none") return "Listening. Play a string.";
  const label = view.mode === "guitar" && view.target ? view.target.note : view.note?.label;
  if (!label) return "Listening. Play a string.";
  if (view.intonation === "in-tune") return `${label} is in tune.`;
  if (view.intonation === "nearly") return `${label} is nearly in tune.`;
  if (view.intonation === "flat") return `${label} is flat.`;
  return `${label} is sharp.`;
}
