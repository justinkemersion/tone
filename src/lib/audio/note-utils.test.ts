import { describe, expect, it } from "vitest";
import {
  centsBetween,
  hzToChromaticPitch,
  midiToHz,
  noteToHz,
  parseNote,
} from "./note-utils";

describe("parseNote", () => {
  it("parses natural and sharp notes", () => {
    expect(parseNote("A4")).toMatchObject({ name: "A", octave: 4 });
    expect(parseNote("C#3")).toMatchObject({ name: "C#", octave: 3 });
  });

  it("parses flat aliases", () => {
    expect(parseNote("Bb3")).toMatchObject({ name: "Bb", octave: 3 });
    expect(parseNote("Eb2")).toMatchObject({ name: "Eb", octave: 2 });
  });

  it("rejects invalid notation", () => {
    expect(() => parseNote("H2")).toThrow(/Invalid note/);
    expect(() => parseNote("E")).toThrow(/Invalid note/);
  });
});

describe("midiToHz / noteToHz", () => {
  it("maps A4 to reference pitch", () => {
    expect(midiToHz(69, 440)).toBeCloseTo(440, 5);
    expect(noteToHz("A4", 440)).toBeCloseTo(440, 5);
  });

  it("scales with custom reference", () => {
    expect(noteToHz("A4", 432)).toBeCloseTo(432, 5);
  });

  it("matches known open low E at A4=440", () => {
    const hz = noteToHz("E2", 440);
    expect(hz).toBeGreaterThan(82);
    expect(hz).toBeLessThan(83);
  });
});

describe("centsBetween", () => {
  it("is ~0 for identical frequencies", () => {
    expect(centsBetween(440, 440)).toBeCloseTo(0, 5);
  });

  it("is positive when measured is sharp", () => {
    expect(centsBetween(450, 440)).toBeGreaterThan(0);
  });
});

describe("hzToChromaticPitch", () => {
  it("labels near reference note", () => {
    const p = hzToChromaticPitch(440, 440);
    expect(p.label).toBe("A4");
    expect(p.midi).toBe(69);
    expect(Math.abs(p.cents)).toBeLessThan(1);
  });

  it("reports cents offset from nearest semitone", () => {
    const sharpA = 440 * 2 ** (18 / 1200);
    const p = hzToChromaticPitch(sharpA, 440);
    expect(p.label).toBe("A4");
    expect(p.cents).toBeGreaterThan(12);
    expect(p.cents).toBeLessThan(25);
  });
});
