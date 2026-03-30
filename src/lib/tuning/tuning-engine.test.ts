import { describe, expect, it } from "vitest";
import { noteToHz } from "@/lib/audio/note-utils";
import { TuningEngine } from "./tuning-engine";

describe("TuningEngine", () => {
  it("orders open strings low → high with 1-based string indices (high string = 1)", () => {
    const engine = new TuningEngine({
      id: "standard",
      name: "Standard",
      category: "standard",
      notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
    });
    const targets = engine.getOpenStringTargets(440);
    expect(targets).toHaveLength(6);
    expect(targets[0]).toMatchObject({
      stringIndex: 6,
      note: "E2",
      hz: noteToHz("E2", 440),
    });
    expect(targets[5]).toMatchObject({
      stringIndex: 1,
      note: "E4",
      hz: noteToHz("E4", 440),
    });
  });

  it("uses custom reference Hz", () => {
    const engine = new TuningEngine({
      id: "standard",
      name: "Standard",
      category: "standard",
      notes: ["A4"],
    });
    expect(engine.getOpenStringTargets(432)[0].hz).toBeCloseTo(432, 5);
  });
});
