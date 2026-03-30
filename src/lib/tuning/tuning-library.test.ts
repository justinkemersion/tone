import { describe, expect, it } from "vitest";
import {
  REFERENCE_A4_HZ,
  resolveOpenStrings,
} from "@/lib/tuning/tuning-library";
import { getTuningById } from "@/lib/tuning/tunings";

describe("resolveOpenStrings", () => {
  it("agrees with tuning engine for standard at library reference", () => {
    const tuning = getTuningById("standard");
    expect(tuning).toBeDefined();
    const targets = resolveOpenStrings(tuning!, REFERENCE_A4_HZ);
    expect(targets[0].note).toBe("E2");
    expect(targets[0].stringIndex).toBe(6);
    expect(targets).toHaveLength(6);
  });
});

describe("REFERENCE_A4_HZ", () => {
  it("is 440", () => {
    expect(REFERENCE_A4_HZ).toBe(440);
  });
});
