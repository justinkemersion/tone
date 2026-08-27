import { describe, expect, it, vi, beforeEach } from "vitest";
import { createTuningAction } from "@/app/(dashboard)/actions/tunings";
import { savePreferencesAction } from "@/app/(dashboard)/actions/preferences";
import { saveRecordingAction } from "@/app/(dashboard)/actions/recordings";
import { UnauthorizedError } from "@/lib/flux/errors";

vi.mock("@/lib/flux/auth", () => ({
  requireSessionSub: vi.fn(),
}));
vi.mock("@/lib/flux/custom-tunings", () => ({
  createCustomTuning: vi.fn(),
  updateCustomTuning: vi.fn(),
  archiveCustomTuning: vi.fn(),
}));
vi.mock("@/lib/flux/favorites", () => ({
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));
vi.mock("@/lib/flux/preferences", () => ({
  getPreferences: vi.fn(),
  upsertPreferences: vi.fn(),
}));
vi.mock("@/lib/flux/activity", () => ({
  logActivity: vi.fn(),
}));
vi.mock("@/lib/config/availability", () => ({
  isFluxPersistenceConfigured: vi.fn(() => true),
  isR2Configured: vi.fn(() => false),
}));

import { requireSessionSub } from "@/lib/flux/auth";

const requireSub = vi.mocked(requireSessionSub);

describe("auth boundaries", () => {
  beforeEach(() => {
    requireSub.mockReset();
    requireSub.mockRejectedValue(new UnauthorizedError());
  });

  it("createTuningAction fails closed without a session", async () => {
    const result = await createTuningAction({
      name: "X",
      notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Unauthorized");
  });

  it("savePreferencesAction fails closed without a session", async () => {
    const result = await savePreferencesAction({ theme: "dark" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Unauthorized");
  });

  it("saveRecordingAction never reports a successful cloud save", async () => {
    requireSub.mockResolvedValue("user-1");
    const result = await saveRecordingAction();
    expect(result.ok).toBe(false);
  });
});
