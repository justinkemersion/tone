import { fluxJson } from "./client";
import type { ActivityEventRow } from "./types";

export async function listActivity(
  sub: string,
  limit = 50,
): Promise<ActivityEventRow[]> {
  return fluxJson<ActivityEventRow[]>(
    sub,
    `/activity_events?order=created_at.desc&limit=${limit}`,
  );
}

export async function logActivity(
  sub: string,
  payload: {
    entity_type: string;
    entity_id: string;
    action: string;
    metadata?: Record<string, unknown> | null;
  },
): Promise<ActivityEventRow> {
  const rows = await fluxJson<ActivityEventRow[]>(sub, "/activity_events", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: sub,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id,
      action: payload.action,
      metadata: payload.metadata ?? null,
    }),
  });
  const row = rows[0];
  if (!row) throw new Error("logActivity: empty response");
  return row;
}
