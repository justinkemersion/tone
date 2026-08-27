import { fluxJson } from "./client";
import type { TuningFavoriteRow } from "@/lib/types/tone";

export async function listFavorites(sub: string): Promise<TuningFavoriteRow[]> {
  return fluxJson<TuningFavoriteRow[]>(sub, `/tuning_favorites?order=created_at.desc`);
}

export async function addFavorite(
  sub: string,
  target: { presetId: string } | { customTuningId: string },
): Promise<TuningFavoriteRow> {
  const body =
    "presetId" in target
      ? { user_id: sub, preset_id: target.presetId, custom_tuning_id: null }
      : { user_id: sub, preset_id: null, custom_tuning_id: target.customTuningId };
  const rows = await fluxJson<TuningFavoriteRow[]>(sub, "/tuning_favorites", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  const row = rows[0];
  if (!row) throw new Error("addFavorite: empty response");
  return row;
}

export async function removeFavorite(sub: string, id: string): Promise<void> {
  await fluxJson(sub, `/tuning_favorites?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
