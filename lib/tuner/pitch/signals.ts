/** Unit test helpers: synthetic audio buffers. Not used in the browser pipeline. */

export function sineWave(
  hz: number,
  sampleRate: number,
  length: number,
  amplitude = 0.5,
): Float32Array {
  const out = new Float32Array(length);
  const omega = (2 * Math.PI * hz) / sampleRate;
  for (let i = 0; i < length; i++) {
    out[i] = amplitude * Math.sin(omega * i);
  }
  return out;
}

/** Guitar-like partials: strong 2nd/3rd that can fool naive detectors. */
export function harmonicTone(
  fundamentalHz: number,
  sampleRate: number,
  length: number,
  amplitudes: readonly number[] = [1, 0.55, 0.32, 0.18, 0.1],
): Float32Array {
  const out = new Float32Array(length);
  let norm = 0;
  for (const a of amplitudes) norm += a;
  const scale = norm > 0 ? 0.5 / norm : 0.5;
  for (let p = 0; p < amplitudes.length; p++) {
    const hz = fundamentalHz * (p + 1);
    const amp = (amplitudes[p] ?? 0) * scale;
    const omega = (2 * Math.PI * hz) / sampleRate;
    for (let i = 0; i < length; i++) {
      out[i] = (out[i] ?? 0) + amp * Math.sin(omega * i);
    }
  }
  return out;
}

export function whiteNoise(length: number, amplitude = 0.4, seed = 1): Float32Array {
  const out = new Float32Array(length);
  let s = seed;
  for (let i = 0; i < length; i++) {
    s = (s * 16807) % 2147483647;
    out[i] = ((s / 2147483647) * 2 - 1) * amplitude;
  }
  return out;
}

export function silence(length: number): Float32Array {
  return new Float32Array(length);
}

export function mix(a: Float32Array, b: Float32Array, bGain = 1): Float32Array {
  const n = Math.min(a.length, b.length);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = (a[i] ?? 0) + (b[i] ?? 0) * bGain;
  }
  return out;
}
