import { fluxJson } from "./client";
import type { CustomTuningRow } from "@/lib/types/tone";

export async function listCustomTunings(sub: string): Promise<CustomTuningRow[]> {
  return fluxJson<CustomTuningRow[]>(
    sub,
    `/custom_tunings?status=neq.archived&order=created_at.desc`,
  );
}

export async function createCustomTuning(
  sub: string,
  payload: { name: string; notes: string[] },
): Promise<CustomTuningRow> {
  const rows = await fluxJson<CustomTuningRow[]>(sub, "/custom_tunings", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: sub,
      name: payload.name,
      notes: payload.notes,
      status: "active",
    }),
  });
  const row = rows[0];
  if (!row) throw new Error("createCustomTuning: empty response");
  return row;
}

export async function updateCustomTuning(
  sub: string,
  id: string,
  payload: Partial<{ name: string; notes: string[]; status: CustomTuningRow["status"]; archived_at: string | null }>,
): Promise<CustomTuningRow> {
  const rows = await fluxJson<CustomTuningRow[]>(
    sub,
    `/custom_tunings?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
    },
  );
  const row = rows[0];
  if (!row) throw new Error("updateCustomTuning: empty response");
  return row;
}

export async function archiveCustomTuning(sub: string, id: string): Promise<CustomTuningRow> {
  return updateCustomTuning(sub, id, {
    status: "archived",
    archived_at: new Date().toISOString(),
  });
}
