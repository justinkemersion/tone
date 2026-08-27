import { beforeEach, describe, expect, it, vi } from "vitest";
import { fluxJson } from "./client";
import { getPreferences, upsertPreferences } from "./preferences";
import { createCustomTuning, listCustomTunings } from "./custom-tunings";
import { addFavorite, listFavorites } from "./favorites";

vi.mock("./client", () => ({
  fluxJson: vi.fn(),
}));

const mocked = vi.mocked(fluxJson);

beforeEach(() => {
  mocked.mockReset();
});

describe("preferences flux helper", () => {
  it("loads the current user row", async () => {
    mocked.mockResolvedValueOnce([{ id: "p1", user_id: "u1", reference_hz: 440 }]);
    const row = await getPreferences("u1");
    expect(row?.id).toBe("p1");
    expect(String(mocked.mock.calls[0]?.[1])).toContain("/user_preferences");
  });

  it("upserts with user_id", async () => {
    mocked.mockResolvedValueOnce([{ id: "p1", user_id: "u1", theme: "dark" }]);
    await upsertPreferences("u1", { theme: "dark" });
    const init = mocked.mock.calls[0]?.[2] as RequestInit;
    expect(JSON.parse(String(init.body))).toMatchObject({ user_id: "u1", theme: "dark" });
  });
});

describe("custom tunings flux helper", () => {
  it("lists non-archived tunings", async () => {
    mocked.mockResolvedValueOnce([]);
    await listCustomTunings("u1");
    expect(String(mocked.mock.calls[0]?.[1])).toContain("custom_tunings");
  });

  it("creates with notes payload", async () => {
    mocked.mockResolvedValueOnce([{ id: "t1", name: "Mine", notes: ["E2"] }]);
    await createCustomTuning("u1", { name: "Mine", notes: ["E2", "A2", "D3", "G3", "B3", "E4"] });
    const init = mocked.mock.calls[0]?.[2] as RequestInit;
    expect(JSON.parse(String(init.body)).user_id).toBe("u1");
  });
});

describe("favorites flux helper", () => {
  it("adds a preset favorite", async () => {
    mocked.mockResolvedValueOnce([{ id: "f1" }]);
    await addFavorite("u1", { presetId: "standard" });
    const init = mocked.mock.calls[0]?.[2] as RequestInit;
    expect(JSON.parse(String(init.body))).toMatchObject({
      user_id: "u1",
      preset_id: "standard",
      custom_tuning_id: null,
    });
  });

  it("lists favorites", async () => {
    mocked.mockResolvedValueOnce([]);
    await listFavorites("u1");
    expect(String(mocked.mock.calls[0]?.[1])).toContain("tuning_favorites");
  });
});
