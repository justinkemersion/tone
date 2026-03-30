import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useFavoriteTunings } from "./useFavoriteTunings";

const STORAGE_KEY = "tone:favorite-tuning-ids";

describe("useFavoriteTunings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates favorite ids from localStorage after mount", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(["standard", "drop-d"])
    );
    const { result } = renderHook(() => useFavoriteTunings());
    await waitFor(() => {
      expect(result.current.favoriteTuningIds).toEqual([
        "standard",
        "drop-d",
      ]);
    });
    expect(result.current.isFavoriteTuning("standard")).toBe(true);
    expect(result.current.isFavoriteTuning("open-g")).toBe(false);
  });

  it("toggles favorite and persists JSON array", async () => {
    const { result } = renderHook(() => useFavoriteTunings());
    await waitFor(() => {
      expect(result.current.favoriteTuningIds).toEqual([]);
    });

    act(() => {
      result.current.toggleFavoriteTuning("open-g");
    });
    expect(result.current.favoriteTuningIds).toEqual(["open-g"]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([
      "open-g",
    ]);

    act(() => {
      result.current.toggleFavoriteTuning("open-g");
    });
    expect(result.current.favoriteTuningIds).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([]);
  });

  it("ignores corrupt localStorage payload", async () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    const { result } = renderHook(() => useFavoriteTunings());
    await waitFor(() => {
      expect(result.current.favoriteTuningIds).toEqual([]);
    });
  });
});
