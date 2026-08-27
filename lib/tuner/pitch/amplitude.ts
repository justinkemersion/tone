export function rmsAmplitude(buffer: Float32Array): number {
  if (buffer.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    const s = buffer[i] ?? 0;
    sum += s * s;
  }
  return Math.sqrt(sum / buffer.length);
}
