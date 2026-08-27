import {
  CLARITY_GATE,
  DETECT_MAX_HZ,
  DETECT_MIN_HZ,
  RMS_GATE,
} from "../constants";
import { rmsAmplitude } from "./amplitude";

export type PitchEstimate = {
  hz: number;
  clarity: number;
  rms: number;
};

const YIN_THRESHOLD = 0.12;

function parabolicOffset(y0: number, y1: number, y2: number): number {
  const denom = 2 * (y0 - 2 * y1 + y2);
  if (Math.abs(denom) < 1e-12) return 0;
  const delta = (y0 - y2) / denom;
  return Math.max(-1, Math.min(1, delta));
}

/**
 * YIN cumulative-mean normalized difference pitch detector.
 * First dip below threshold, then walk to the local minimum so the
 * period is not taken on the far wall of the trough.
 */
export function detectPitchYin(
  buffer: Float32Array,
  sampleRate: number,
  options?: { minHz?: number; maxHz?: number; rmsGate?: number; threshold?: number },
): PitchEstimate | null {
  const minHz = options?.minHz ?? DETECT_MIN_HZ;
  const maxHz = options?.maxHz ?? DETECT_MAX_HZ;
  const rmsGate = options?.rmsGate ?? RMS_GATE;
  const threshold = options?.threshold ?? YIN_THRESHOLD;

  const n = buffer.length;
  if (n < 512 || sampleRate <= 0) return null;

  const rms = rmsAmplitude(buffer);
  if (!Number.isFinite(rms) || rms < rmsGate) return null;

  const minTau = Math.max(2, Math.floor(sampleRate / maxHz));
  const maxTau = Math.min(Math.floor(n / 2) - 2, Math.ceil(sampleRate / minHz));
  if (maxTau <= minTau + 2) return null;

  const cmndf = new Float32Array(maxTau + 1);
  cmndf[0] = 1;
  let running = 0;

  for (let tau = 1; tau <= maxTau; tau++) {
    let sum = 0;
    const limit = n - tau;
    for (let i = 0; i < limit; i++) {
      const delta = (buffer[i] ?? 0) - (buffer[i + tau] ?? 0);
      sum += delta * delta;
    }
    running += sum;
    cmndf[tau] = running > 0 ? (sum * tau) / running : 1;
  }

  let tau = -1;
  for (let t = minTau; t < maxTau; t++) {
    const y = cmndf[t] ?? 1;
    if (y < threshold) {
      while (t + 1 <= maxTau && (cmndf[t + 1] ?? 1) < (cmndf[t] ?? 1)) {
        t += 1;
      }
      tau = t;
      break;
    }
  }

  if (tau < 0) {
    let best = minTau;
    let bestVal = cmndf[minTau] ?? 1;
    for (let t = minTau + 1; t <= maxTau; t++) {
      const y = cmndf[t] ?? 1;
      if (y < bestVal) {
        bestVal = y;
        best = t;
      }
    }
    if (bestVal > 0.35) return null;
    tau = best;
  }

  const y0 = cmndf[tau - 1] ?? cmndf[tau] ?? 1;
  const y1 = cmndf[tau] ?? 1;
  const y2 = cmndf[tau + 1] ?? y1;
  const refined = tau + parabolicOffset(y0, y1, y2);
  if (refined <= 0) return null;

  const hz = sampleRate / refined;
  if (!Number.isFinite(hz) || hz < minHz || hz > maxHz) return null;

  const dip = Math.max(0, Math.min(1, y1));
  const clarity = 1 - dip;
  if (clarity < CLARITY_GATE * 0.7) return null;

  return { hz, clarity, rms };
}
