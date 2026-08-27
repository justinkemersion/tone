import { describe, expect, it } from "vitest";
import { detectPitchMpm } from "./pitch/mpm";
import { harmonicTone, silence, sineWave, whiteNoise } from "./pitch/signals";
import { noteToHz } from "./theory";
import { createSmoother, pushPitch } from "./smoothing";
import { createTunerEngine, ingestFrame } from "./engine";
import { resolvePreset } from "./presets";
import { intonationFromCents, liveRegionMessage } from "./state";
import { rmsAmplitude } from "./pitch/amplitude";

const SR = 44100;
const N = 4096;

function expectNearHz(actual: number | null | undefined, expected: number, cents = 8) {
  expect(actual).toBeTruthy();
  const ratio = (actual as number) / expected;
  const err = 1200 * Math.log2(ratio);
  expect(Math.abs(err)).toBeLessThan(cents);
}

describe("detectPitchMpm", () => {
  it("returns null for silence", () => {
    expect(detectPitchMpm(silence(N), SR)).toBeNull();
  });

  it("returns null for noise", () => {
    expect(detectPitchMpm(whiteNoise(N, 0.5), SR)).toBeNull();
  });

  it("detects A440", () => {
    const r = detectPitchMpm(sineWave(440, SR, N), SR);
    expectNearHz(r?.hz, 440, 5);
    expect(r?.clarity).toBeGreaterThan(0.9);
  });

  it("detects standard guitar fundamentals E2–E4", () => {
    for (const note of ["E2", "A2", "D3", "G3", "B3", "E4"] as const) {
      const hz = noteToHz(note);
      const r = detectPitchMpm(sineWave(hz, SR, N), SR);
      expectNearHz(r?.hz, hz, 10);
    }
  });

  it("stays on the fundamental when harmonics are strong (E2)", () => {
    const hz = noteToHz("E2");
    const r = detectPitchMpm(harmonicTone(hz, SR, N), SR);
    expectNearHz(r?.hz, hz, 15);
  });

  it("reads a string that is 12 cents flat", () => {
    const target = noteToHz("A2");
    const flat = target * 2 ** (-12 / 1200);
    const r = detectPitchMpm(sineWave(flat, SR, N), SR);
    expectNearHz(r?.hz, flat, 6);
  });

  it("reads a string that is 15 cents sharp", () => {
    const target = noteToHz("G3");
    const sharp = target * 2 ** (15 / 1200);
    const r = detectPitchMpm(sineWave(sharp, SR, N), SR);
    expectNearHz(r?.hz, sharp, 6);
  });

  it("detects A4 at 432 Hz reference tone frequency (absolute Hz)", () => {
    const r = detectPitchMpm(sineWave(432, SR, N), SR);
    expectNearHz(r?.hz, 432, 6);
  });
});

describe("smoothing", () => {
  it("expires stale pitch", () => {
    const s = createSmoother();
    pushPitch(s, { hz: 110, clarity: 0.95, rms: 0.1 }, 0);
    expect(pushPitch(s, null, 100)?.hz).toBeCloseTo(110, 5);
    expect(pushPitch(s, null, 400)).toBeNull();
  });

  it("hysteresis ignores a weak jump", () => {
    const s = createSmoother();
    pushPitch(s, { hz: 110, clarity: 0.96, rms: 0.1 }, 0);
    const next = pushPitch(s, { hz: 146.8, clarity: 0.86, rms: 0.1 }, 16);
    expect(next?.hz).toBeCloseTo(110, 0);
  });
});

describe("engine + intonation", () => {
  it("reports in-tune / flat / sharp against Standard", () => {
    const preset = resolvePreset("standard");
    const engine = createTunerEngine({ mode: "guitar", referenceHz: 440 });
    engine.mic = "listening";

    const inTune = ingestFrame(engine, sineWave(noteToHz("A2"), SR, N), SR, 0, preset);
    expect(inTune.target?.note).toBe("A2");
    expect(inTune.intonation).toBe("in-tune");

    const engine2 = createTunerEngine({ mode: "guitar" });
    engine2.mic = "listening";
    const flatHz = noteToHz("E2") * 2 ** (-20 / 1200);
    const flat = ingestFrame(engine2, sineWave(flatHz, SR, N), SR, 0, preset);
    expect(flat.intonation).toBe("flat");

    const engine3 = createTunerEngine({ mode: "guitar" });
    engine3.mic = "listening";
    const sharpHz = noteToHz("E4") * 2 ** (20 / 1200);
    const sharp = ingestFrame(engine3, sineWave(sharpHz, SR, N), SR, 0, preset);
    expect(sharp.intonation).toBe("sharp");
  });

  it("idles on silence while listening", () => {
    const engine = createTunerEngine();
    engine.mic = "listening";
    const view = ingestFrame(engine, silence(N), SR, 0, resolvePreset("standard"));
    expect(view.stale).toBe(true);
    expect(view.intonation).toBe("none");
  });

  it("does not detect when muted (reference playback)", () => {
    const engine = createTunerEngine();
    engine.mic = "listening";
    engine.muted = true;
    const view = ingestFrame(engine, sineWave(440, SR, N), SR, 0, resolvePreset("standard"));
    expect(view.hz).toBeNull();
  });
});

describe("live region", () => {
  it("does not mention cents", () => {
    expect(liveRegionMessage({
      mic: "listening",
      mode: "guitar",
      intonation: "in-tune",
      hz: 110,
      cents: 0.4,
      note: { letter: "A", octave: 2, label: "A2", midi: 45, cents: 0.4, referenceHz: 110 },
      target: {
        index: 1,
        stringNumber: 5,
        note: "A2",
        hz: 110,
        midi: 45,
        cents: 0.4,
      },
      confidence: 0.95,
      amplitude: 0.1,
      stale: false,
    })).toBe("A2 is in tune.");
  });

  it("maps cents bands", () => {
    expect(intonationFromCents(0)).toBe("in-tune");
    expect(intonationFromCents(4.9)).toBe("in-tune");
    expect(intonationFromCents(8)).toBe("nearly");
    expect(intonationFromCents(-20)).toBe("flat");
    expect(intonationFromCents(20)).toBe("sharp");
    expect(intonationFromCents(null)).toBe("none");
  });
});

describe("amplitude", () => {
  it("is ~0 for silence and >0 for a sine", () => {
    expect(rmsAmplitude(silence(256))).toBe(0);
    expect(rmsAmplitude(sineWave(440, SR, 256))).toBeGreaterThan(0.2);
  });
});
