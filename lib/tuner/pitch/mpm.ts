import {
  CLARITY_GATE,
  DETECT_MAX_HZ,
  DETECT_MIN_HZ,
  MPM_CUTOFF,
  RMS_GATE,
} from "../constants";
import { rmsAmplitude } from "./amplitude";

export type PitchEstimate = {
  hz: number;
  clarity: number;
  rms: number;
};

function parabolicOffset(y0: number, y1: number, y2: number): number {
  const denom = 2 * (2 * y1 - y0 - y2);
  if (Math.abs(denom) < 1e-12) return 0;
  const delta = (y0 - y2) / denom;
  return Math.max(-1, Math.min(1, delta));
}

/**
 * McLeod Pitch Method (normalized square difference / NSDF).
 * Picks the first sufficiently strong peak so guitar harmonics do not
 * steal the fundamental as often as raw autocorrelation.
 */
export function detectPitchMpm(
  buffer: Float32Array,
  sampleRate: number,
  options?: { minHz?: number; maxHz?: number; rmsGate?: number; cutoff?: number },
): PitchEstimate | null {
  const minHz = options?.minHz ?? DETECT_MIN_HZ;
  const maxHz = options?.maxHz ?? DETECT_MAX_HZ;
  const rmsGate = options?.rmsGate ?? RMS_GATE;
  const cutoff = options?.cutoff ?? MPM_CUTOFF;

  const n = buffer.length;
  if (n < 512 || sampleRate <= 0) return null;

  const rms = rmsAmplitude(buffer);
  if (!Number.isFinite(rms) || rms < rmsGate) return null;

  const minTau = Math.max(2, Math.floor(sampleRate / maxHz));
  const maxTau = Math.min(Math.floor(n / 2) - 2, Math.ceil(sampleRate / minHz));
  if (maxTau <= minTau + 2) return null;

  const nsdf = new Float32Array(maxTau + 1);
  for (let tau = minTau; tau <= maxTau; tau++) {
    let ac = 0;
    let m = 0;
    const limit = n - tau;
    for (let i = 0; i < limit; i++) {
      const a = buffer[i] ?? 0;
      const b = buffer[i + tau] ?? 0;
      ac += a * b;
      m += a * a + b * b;
    }
    nsdf[tau] = m > 0 ? (2 * ac) / m : 0;
  }

  let peakTau = -1;
  let peakVal = -Infinity;
  const maxima: Array<{ tau: number; value: number }> = [];

  for (let tau = minTau + 1; tau < maxTau; tau++) {
    const y0 = nsdf[tau - 1] ?? 0;
    const y1 = nsdf[tau] ?? 0;
    const y2 = nsdf[tau + 1] ?? 0;
    if (y1 >= y0 && y1 >= y2 && y1 > 0) {
      maxima.push({ tau, value: y1 });
      if (y1 > peakVal) {
        peakVal = y1;
        peakTau = tau;
      }
    }
  }

  if (peakTau < 0 || peakVal < CLARITY_GATE * 0.7) return null;

  const threshold = peakVal * cutoff;
  let chosen = maxima.find((p) => p.value >= threshold) ?? { tau: peakTau, value: peakVal };

  // Strong 2nd-harmonic peaks appear at ~tau/2. If 2τ is also a peak, prefer
  // the longer period (guitar fundamental) when it stays in range.
  const twice = chosen.tau * 2;
  if (twice + 1 <= maxTau) {
    const v2 = nsdf[twice] ?? 0;
    if (v2 >= chosen.value * 0.82) {
      const hzHigh = sampleRate / chosen.tau;
      const hzLow = sampleRate / twice;
      if (hzHigh > 130 && hzLow >= minHz) {
        chosen = { tau: twice, value: Math.max(v2, chosen.value) };
      }
    }
  }

  const y0 = nsdf[chosen.tau - 1] ?? chosen.value;
  const y1 = nsdf[chosen.tau] ?? chosen.value;
  const y2 = nsdf[chosen.tau + 1] ?? chosen.value;
  const tau = chosen.tau + parabolicOffset(y0, y1, y2);
  if (tau <= 0) return null;

  const hz = sampleRate / tau;
  if (!Number.isFinite(hz) || hz < minHz || hz > maxHz) return null;

  const clarity = Math.max(0, Math.min(1, chosen.value));
  if (clarity < CLARITY_GATE * 0.85) return null;

  return { hz, clarity, rms };
}
