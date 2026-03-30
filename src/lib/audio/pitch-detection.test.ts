import { describe, expect, it } from "vitest";
import { AutocorrPitchDetector } from "./pitch-detection";

function sineBuffer(
  freqHz: number,
  sampleRate: number,
  durationSec: number,
  amplitude = 0.35
): Float32Array {
  const n = Math.floor(sampleRate * durationSec);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    buf[i] =
      amplitude * Math.sin((2 * Math.PI * freqHz * i) / sampleRate);
  }
  return buf;
}

describe("AutocorrPitchDetector", () => {
  const sampleRate = 44_100;
  const detector = new AutocorrPitchDetector({
    minHz: 70,
    maxHz: 1200,
    rmsGate: 0.001,
  });

  it("returns null for buffer shorter than 256 samples", () => {
    const buf = new Float32Array(128);
    buf.fill(0.1);
    expect(detector.detect(buf, sampleRate)).toBeNull();
  });

  it("returns null for silence", () => {
    const buf = new Float32Array(8192);
    expect(detector.detect(buf, sampleRate)).toBeNull();
  });

  it("detects ~440 Hz sine", () => {
    const buf = sineBuffer(440, sampleRate, 0.25);
    const hz = detector.detect(buf, sampleRate);
    expect(hz).not.toBeNull();
    expect(hz!).toBeGreaterThan(435);
    expect(hz!).toBeLessThan(445);
  });

  it("detects ~82 Hz open-E range", () => {
    const buf = sineBuffer(82.41, sampleRate, 0.35);
    const hz = detector.detect(buf, sampleRate);
    expect(hz).not.toBeNull();
    expect(hz!).toBeGreaterThan(78);
    expect(hz!).toBeLessThan(88);
  });
});
