import { fluxJson } from "./client";
import type { ProfileRow } from "./types";

export async function getProfile(sub: string): Promise<ProfileRow | null> {
  const rows = await fluxJson<ProfileRow[]>(
    sub,
    `/profiles?user_id=eq.${encodeURIComponent(sub)}&limit=1`,
  );
  return rows[0] ?? null;
}

export async function upsertProfile(
  sub: string,
  payload: { display_name?: string | null; avatar_url?: string | null },
): Promise<ProfileRow> {
  const rows = await fluxJson<ProfileRow[]>(sub, "/profiles", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      user_id: sub,
      display_name: payload.display_name ?? null,
      avatar_url: payload.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    }),
  });
  const row = rows[0];
  if (!row) throw new Error("upsertProfile: empty response");
  return row;
}
