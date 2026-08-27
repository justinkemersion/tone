import { detectPitchMpm } from "./pitch/mpm";
import { preferGuitarFundamental } from "./pitch/octave";
import { hzToChromaticPitch } from "./theory";
import { resolveOpenStrings, type TuningPreset } from "./presets";
import { nearestOpenString } from "./targets";
import { createSmoother, isStale, pushPitch, type SmootherState } from "./smoothing";
import { intonationFromCents, type MicStatus, type TunerMode, type TunerView } from "./state";

export type TunerEngine = {
  smoother: SmootherState;
  mic: MicStatus;
  mode: TunerMode;
  referenceHz: number;
  muted: boolean;
};

export function createTunerEngine(input?: {
  mode?: TunerMode;
  referenceHz?: number;
}): TunerEngine {
  return {
    smoother: createSmoother(),
    mic: "idle",
    mode: input?.mode ?? "guitar",
    referenceHz: input?.referenceHz ?? 440,
    muted: false,
  };
}

export function ingestFrame(
  engine: TunerEngine,
  buffer: Float32Array,
  sampleRate: number,
  now: number,
  preset: TuningPreset,
): TunerView {
  const estimate =
    engine.mic === "listening" && !engine.muted
      ? detectPitchMpm(buffer, sampleRate)
      : null;
  const corrected = estimate ? preferGuitarFundamental(estimate) : null;
  const smoothed = pushPitch(engine.smoother, corrected, now);
  const stale = isStale(engine.smoother, now);
  const live = smoothed && !stale ? smoothed : null;

  const note = live ? hzToChromaticPitch(live.hz, engine.referenceHz) : null;
  const strings = resolveOpenStrings(preset.notes, engine.referenceHz);
  const target =
    engine.mode === "guitar" && live ? nearestOpenString(live.hz, strings) : null;
  const cents = engine.mode === "guitar" ? (target?.cents ?? null) : (note?.cents ?? null);

  return {
    mic: engine.mic,
    mode: engine.mode,
    intonation: intonationFromCents(cents),
    hz: live?.hz ?? null,
    cents,
    note,
    target,
    confidence: live?.clarity ?? 0,
    amplitude: live?.rms ?? 0,
    stale: engine.mic === "listening" && !live,
  };
}
