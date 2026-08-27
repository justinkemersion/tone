import { DEFAULT_REFERENCE_HZ, DEFAULT_TUNING_ID } from "./constants";
import type { TunerMode } from "./state";
import type { ThemePreference } from "@/lib/types/tone";

export type LocalPrefs = {
  referenceHz: number;
  tuningId: string;
  mode: TunerMode;
  theme: ThemePreference;
};

export const LOCAL_PREFS_KEY = "tone-prefs-v1";
export const LOCAL_FAVORITES_KEY = "tone-favorites-v1";

export const DEFAULT_LOCAL_PREFS: LocalPrefs = {
  referenceHz: DEFAULT_REFERENCE_HZ,
  tuningId: DEFAULT_TUNING_ID,
  mode: "guitar",
  theme: "system",
};

export function parseLocalPrefs(raw: unknown): LocalPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_LOCAL_PREFS };
  const o = raw as Record<string, unknown>;
  const referenceHz = Number(o.referenceHz);
  const mode = o.mode === "chromatic" ? "chromatic" : "guitar";
  const theme =
    o.theme === "light" || o.theme === "dark" || o.theme === "system" ? o.theme : "system";
  return {
    referenceHz:
      Number.isFinite(referenceHz) && referenceHz >= 390 && referenceHz <= 480
        ? referenceHz
        : DEFAULT_REFERENCE_HZ,
    tuningId: typeof o.tuningId === "string" && o.tuningId ? o.tuningId : DEFAULT_TUNING_ID,
    mode,
    theme,
  };
}

export function readStoredPrefs(): LocalPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_PREFS_KEY);
    if (!raw) return null;
    return parseLocalPrefs(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeStoredPrefs(prefs: LocalPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* quota / private mode */
  }
}

/** Merge a patch onto stored prefs without dropping theme or other fields. */
export function patchStoredPrefs(patch: Partial<LocalPrefs>, fallback: LocalPrefs): LocalPrefs {
  const current = readStoredPrefs() ?? fallback;
  const next = { ...current, ...patch };
  writeStoredPrefs(next);
  return next;
}

export function parseFavoriteIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string" && id.length > 0);
}
