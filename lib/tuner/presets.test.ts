import { describe, expect, it } from "vitest";
import {
  CATEGORY_LABELS,
  getPresetById,
  resolveOpenStrings,
  resolvePreset,
  TUNING_PRESETS,
} from "./presets";
import { noteToHz } from "./theory";

describe("built-in presets", () => {
  it("includes the required guitar tunings with verified notes", () => {
    expect(getPresetById("standard")?.notes).toEqual(["E2", "A2", "D3", "G3", "B3", "E4"]);
    expect(getPresetById("drop-d")?.notes).toEqual(["D2", "A2", "D3", "G3", "B3", "E4"]);
    expect(getPresetById("d-standard")?.notes).toEqual(["D2", "G2", "C3", "F3", "A3", "D4"]);
    expect(getPresetById("drop-c")?.notes).toEqual(["C2", "G2", "C3", "F3", "A3", "D4"]);
    expect(getPresetById("open-g")?.notes).toEqual(["D2", "G2", "D3", "G3", "B3", "D4"]);
    expect(getPresetById("open-d")?.notes).toEqual(["D2", "A2", "D3", "F#3", "A3", "D4"]);
    expect(getPresetById("dadgad")?.notes).toEqual(["D2", "A2", "D3", "G3", "A3", "D4"]);
  });

  it("labels every category", () => {
    for (const p of TUNING_PRESETS) {
      expect(CATEGORY_LABELS[p.category]).toBeTruthy();
    }
  });

  it("falls back to standard", () => {
    expect(resolvePreset("nope").id).toBe("standard");
  });

  it("numbers strings 6→1 and derives Hz from 12-TET", () => {
    const strings = resolveOpenStrings(["E2", "A2", "D3", "G3", "B3", "E4"], 440);
    expect(strings[0]?.stringNumber).toBe(6);
    expect(strings[5]?.stringNumber).toBe(1);
    expect(strings[0]?.hz).toBeCloseTo(noteToHz("E2"), 8);
  });
});
