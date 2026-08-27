import { fluxJson } from "./client";
import type { UserPreferencesRow } from "@/lib/types/tone";

export async function getPreferences(sub: string): Promise<UserPreferencesRow | null> {
  const rows = await fluxJson<UserPreferencesRow[]>(
    sub,
    `/user_preferences?user_id=eq.${encodeURIComponent(sub)}&limit=1`,
  );
  return rows[0] ?? null;
}

export async function upsertPreferences(
  sub: string,
  payload: Partial<
    Pick<UserPreferencesRow, "reference_hz" | "default_tuning_id" | "tuner_mode" | "theme">
  >,
): Promise<UserPreferencesRow> {
  const rows = await fluxJson<UserPreferencesRow[]>(sub, "/user_preferences", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      user_id: sub,
      ...payload,
      updated_at: new Date().toISOString(),
    }),
  });
  const row = rows[0];
  if (!row) throw new Error("upsertPreferences: empty response");
  return row;
}
