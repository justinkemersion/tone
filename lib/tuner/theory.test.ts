import { describe, expect, it } from "vitest";
import {
  centsBetween,
  formatCents,
  hzToChromaticPitch,
  midiToHz,
  noteToHz,
  parseNote,
} from "./theory";
import { DEFAULT_REFERENCE_HZ } from "./constants";

describe("parseNote", () => {
  it("parses scientific notation including flats", () => {
    expect(parseNote("E2")).toMatchObject({ midi: 40, octave: 2, letter: "E" });
    expect(parseNote("A4")).toMatchObject({ midi: 69, octave: 4, letter: "A" });
    expect(parseNote("Bb3")).toMatchObject({ letter: "A#" });
    expect(parseNote("F#3").midi).toBe(parseNote("Gb3").midi);
  });

  it("rejects garbage", () => {
    expect(() => parseNote("H2")).toThrow();
    expect(() => parseNote("E")).toThrow();
  });
});

describe("12-TET", () => {
  it("A4 is the reference", () => {
    expect(noteToHz("A4")).toBeCloseTo(DEFAULT_REFERENCE_HZ, 8);
    expect(midiToHz(69, 440)).toBeCloseTo(440, 8);
    expect(midiToHz(69, 432)).toBeCloseTo(432, 8);
  });

  it("standard guitar strings at A440", () => {
    expect(noteToHz("E2")).toBeCloseTo(82.4069, 3);
    expect(noteToHz("A2")).toBeCloseTo(110, 3);
    expect(noteToHz("D3")).toBeCloseTo(146.832, 3);
    expect(noteToHz("G3")).toBeCloseTo(195.998, 3);
    expect(noteToHz("B3")).toBeCloseTo(246.942, 3);
    expect(noteToHz("E4")).toBeCloseTo(329.628, 3);
  });

  it("octave is exactly 2×", () => {
    expect(noteToHz("E4") / noteToHz("E3")).toBeCloseTo(2, 10);
  });

  it("cents: 100 cents is a semitone", () => {
    const a = noteToHz("A4");
    const asharp = noteToHz("A#4");
    expect(centsBetween(asharp, a)).toBeCloseTo(100, 6);
  });

  it("maps frequencies to nearest chromatic pitch", () => {
    const p = hzToChromaticPitch(440);
    expect(p.label).toBe("A4");
    expect(p.cents).toBeCloseTo(0, 6);
  });

  it("reports flat and sharp cents", () => {
    const flat = hzToChromaticPitch(440 * 2 ** (-10 / 1200));
    expect(flat.label).toBe("A4");
    expect(flat.cents).toBeCloseTo(-10, 4);
    const sharp = hzToChromaticPitch(440 * 2 ** (8 / 1200));
    expect(sharp.cents).toBeCloseTo(8, 4);
  });

  it("respects non-440 reference", () => {
    expect(hzToChromaticPitch(432, 432).label).toBe("A4");
    expect(noteToHz("A4", 432)).toBeCloseTo(432, 8);
    const a440As432 = hzToChromaticPitch(440, 432);
    expect(a440As432.label).toBe("A4");
    expect(a440As432.cents).toBeGreaterThan(20);
  });

  it("formats cents without a plus on zero", () => {
    expect(formatCents(0)).toBe("0¢");
    expect(formatCents(12.4)).toBe("+12¢");
    expect(formatCents(-3.2)).toBe("-3¢");
  });
});
