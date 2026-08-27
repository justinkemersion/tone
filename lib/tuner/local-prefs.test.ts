import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_LOCAL_PREFS,
  LOCAL_PREFS_KEY,
  parseFavoriteIds,
  parseLocalPrefs,
  patchStoredPrefs,
  readStoredPrefs,
} from "./local-prefs";

describe("local prefs", () => {
  afterEach(() => {
    localStorage.removeItem(LOCAL_PREFS_KEY);
  });

  it("ignores corrupt payloads", () => {
    expect(parseLocalPrefs("nope").tuningId).toBe("standard");
    expect(parseLocalPrefs({ referenceHz: 12, mode: "laser" }).referenceHz).toBe(440);
    expect(parseFavoriteIds(null)).toEqual([]);
    expect(parseFavoriteIds(["standard", 1])).toEqual(["standard"]);
  });

  it("does not drop theme when patching tuning from the tuner", () => {
    localStorage.setItem(
      LOCAL_PREFS_KEY,
      JSON.stringify({ ...DEFAULT_LOCAL_PREFS, theme: "light", tuningId: "standard" }),
    );
    const next = patchStoredPrefs({ tuningId: "drop-d", mode: "guitar" }, DEFAULT_LOCAL_PREFS);
    expect(next.theme).toBe("light");
    expect(next.tuningId).toBe("drop-d");
    expect(readStoredPrefs()?.theme).toBe("light");
  });
});
