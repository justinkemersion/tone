import { describe, expect, it } from "vitest";
import {
  DEFAULT_TUNING_ID,
  filterPresetsBySearch,
  getTuningById,
  groupPresets,
  TUNING_PRESETS,
} from "./tunings";

describe("getTuningById", () => {
  it("returns standard preset", () => {
    const t = getTuningById("standard");
    expect(t?.name).toBe("Standard");
    expect(t?.notes).toEqual(["E2", "A2", "D3", "G3", "B3", "E4"]);
  });

  it("returns undefined for unknown id", () => {
    expect(getTuningById("not-a-real-tuning")).toBeUndefined();
  });
});

describe("DEFAULT_TUNING_ID", () => {
  it("points at an existing preset", () => {
    expect(getTuningById(DEFAULT_TUNING_ID)).toBeDefined();
  });
});

describe("filterPresetsBySearch", () => {
  it("returns all presets for empty query", () => {
    expect(filterPresetsBySearch(TUNING_PRESETS, "")).toHaveLength(
      TUNING_PRESETS.length
    );
    expect(filterPresetsBySearch(TUNING_PRESETS, "   ")).toHaveLength(
      TUNING_PRESETS.length
    );
  });

  it("matches name, note, and category label", () => {
    const dropD = filterPresetsBySearch(TUNING_PRESETS, "drop d");
    expect(dropD.some((p) => p.id === "drop-d")).toBe(true);

    const byNote = filterPresetsBySearch(TUNING_PRESETS, "eb2");
    expect(byNote.length).toBeGreaterThan(0);

    const byCategory = filterPresetsBySearch(TUNING_PRESETS, "song");
    expect(byCategory.every((p) => p.category === "song")).toBe(true);
  });
});

describe("groupPresets", () => {
  it("places every preset in its category bucket", () => {
    const grouped = groupPresets(TUNING_PRESETS);
    const flat = [
      ...grouped.standard,
      ...grouped.drop,
      ...grouped.open,
      ...grouped.song,
    ];
    expect(flat).toHaveLength(TUNING_PRESETS.length);
    for (const p of TUNING_PRESETS) {
      expect(grouped[p.category].some((x) => x.id === p.id)).toBe(true);
    }
  });
});
