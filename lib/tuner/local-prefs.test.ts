import { describe, expect, it } from "vitest";
import { parseFavoriteIds, parseLocalPrefs } from "./local-prefs";

describe("local prefs", () => {
  it("ignores corrupt payloads", () => {
    expect(parseLocalPrefs("nope").tuningId).toBe("standard");
    expect(parseLocalPrefs({ referenceHz: 12, mode: "laser" }).referenceHz).toBe(440);
    expect(parseFavoriteIds(null)).toEqual([]);
    expect(parseFavoriteIds(["standard", 1])).toEqual(["standard"]);
  });
});
