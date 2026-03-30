export type PitchDetector = {
  detect(buffer: Float32Array, sampleRate: number): number | null;
};

export type AutocorrOptions = {
  minHz?: number;
  maxHz?: number;
  /** Minimum RMS (0–1) to treat as silence. */
  rmsGate?: number;
};

/**
 * Normalized autocorrelation with parabolic peak refinement.
 * Stable for monophonic guitar fundamentals in typical ranges.
 */
export class AutocorrPitchDetector implements PitchDetector {
  constructor(private readonly options: AutocorrOptions = {}) {}

  detect(buffer: Float32Array, sampleRate: number): number | null {
    const minHz = this.options.minHz ?? 70;
    const maxHz = this.options.maxHz ?? 1200;
    const rmsGate = this.options.rmsGate ?? 0.008;

    const n = buffer.length;
    if (n < 256) return null;

    let rms = 0;
    for (let i = 0; i < n; i++) {
      const s = buffer[i];
      rms += s * s;
    }
    rms = Math.sqrt(rms / n);
    if (!Number.isFinite(rms) || rms < rmsGate) return null;

    const minPeriod = Math.max(2, Math.floor(sampleRate / maxHz));
    const maxPeriod = Math.min(Math.floor(n / 2), Math.ceil(sampleRate / minHz));
    if (maxPeriod <= minPeriod + 2) return null;

    let bestTau = -1;
    let bestCorr = -Infinity;

    for (let tau = minPeriod; tau <= maxPeriod; tau++) {
      let sum = 0;
      const limit = n - tau;
      for (let i = 0; i < limit; i++) {
        sum += buffer[i] * buffer[i + tau];
      }
      if (sum > bestCorr) {
        bestCorr = sum;
        bestTau = tau;
      }
    }

    if (bestTau < minPeriod + 1 || bestTau > maxPeriod - 1) {
      const hz = sampleRate / bestTau;
      return preferGuitarFundamentalHz(hz, buffer, sampleRate, minHz);
    }

    const y0 = autocorrAt(buffer, bestTau - 1);
    const y1 = autocorrAt(buffer, bestTau);
    const y2 = autocorrAt(buffer, bestTau + 1);
    const denom = y0 - 2 * y1 + y2;
    let delta = 0;
    if (Math.abs(denom) > 1e-12) {
      delta = (y0 - y2) / (2 * denom);
      delta = Math.max(-1, Math.min(1, delta));
    }

    const refinedTau = bestTau + delta;
    if (refinedTau <= 0) return null;
    const hz = sampleRate / refinedTau;
    return preferGuitarFundamentalHz(hz, buffer, sampleRate, minHz);
  }
}

function autocorrAt(buffer: Float32Array, tau: number): number {
  let sum = 0;
  const n = buffer.length;
  const limit = n - tau;
  for (let i = 0; i < limit; i++) {
    sum += buffer[i] * buffer[i + tau];
  }
  return sum;
}

/**
 * Autocorrelation often locks onto a harmonic on thick strings (e.g. ~164 Hz
 * instead of open E ~82 Hz). Prefer one octave down when the lower period still
 * correlates strongly. Only applied below ~250 Hz so high-string fundamentals
 * are not pulled down incorrectly.
 */
function preferGuitarFundamentalHz(
  hz: number,
  buffer: Float32Array,
  sampleRate: number,
  minHz: number
): number {
  const ceiling = 250;
  let out = hz;
  const n = buffer.length;

  while (out > 100 && out <= ceiling && out / 2 >= minHz) {
    const tauHigh = Math.round(sampleRate / out);
    const tauLow = Math.round(sampleRate / (out / 2));
    if (tauHigh < 2 || tauLow < 2 || tauHigh > n - 4 || tauLow > n - 4) {
      break;
    }
    const cHigh = autocorrAt(buffer, tauHigh);
    const cLow = autocorrAt(buffer, tauLow);
    if (cHigh <= 1e-12) break;
    if (cLow >= cHigh * 0.83) {
      out /= 2;
    } else {
      break;
    }
  }
  return out;
}
