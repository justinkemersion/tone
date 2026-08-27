import { fluxJson } from "./client";
import type { RecordRow, RecordStatus, RecordTagRow } from "./types";

export type ListRecordsOptions = {
  status?: RecordStatus;
  tag?: string;
};

export async function listRecords(
  sub: string,
  opts: ListRecordsOptions = {},
): Promise<RecordRow[]> {
  const params = new URLSearchParams({ order: "updated_at.desc" });
  if (opts.status) params.set("status", `eq.${opts.status}`);
  if (opts.tag) {
    const tags = await fluxJson<RecordTagRow[]>(
      sub,
      `/record_tags?tag=eq.${encodeURIComponent(opts.tag)}&select=record_id`,
    );
    const ids = [...new Set(tags.map((t) => t.record_id))];
    if (ids.length === 0) return [];
    params.set("id", `in.(${ids.join(",")})`);
  }
  return fluxJson<RecordRow[]>(sub, `/records?${params}`);
}

export async function getRecord(sub: string, id: string): Promise<RecordRow | null> {
  const rows = await fluxJson<RecordRow[]>(
    sub,
    `/records?id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  return rows[0] ?? null;
}

export async function createRecord(
  sub: string,
  payload: { title: string; description?: string | null; status?: RecordStatus },
): Promise<RecordRow> {
  const rows = await fluxJson<RecordRow[]>(sub, "/records", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: sub,
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? "draft",
    }),
  });
  const row = rows[0];
  if (!row) throw new Error("createRecord: empty response");
  return row;
}

export async function updateRecord(
  sub: string,
  id: string,
  payload: Partial<{
    title: string;
    description: string | null;
    status: RecordStatus;
    archived_at: string | null;
  }>,
): Promise<RecordRow> {
  const rows = await fluxJson<RecordRow[]>(
    sub,
    `/records?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
    },
  );
  const row = rows[0];
  if (!row) throw new Error("updateRecord: empty response");
  return row;
}

export async function listTagsForRecord(
  sub: string,
  recordId: string,
): Promise<RecordTagRow[]> {
  return fluxJson<RecordTagRow[]>(
    sub,
    `/record_tags?record_id=eq.${encodeURIComponent(recordId)}&order=tag.asc`,
  );
}

export async function addTag(
  sub: string,
  recordId: string,
  tag: string,
): Promise<RecordTagRow> {
  const rows = await fluxJson<RecordTagRow[]>(sub, "/record_tags", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ user_id: sub, record_id: recordId, tag }),
  });
  const row = rows[0];
  if (!row) throw new Error("addTag: empty response");
  return row;
}

export async function removeTag(sub: string, tagId: string): Promise<void> {
  await fluxJson(sub, `/record_tags?id=eq.${encodeURIComponent(tagId)}`, {
    method: "DELETE",
  });
}

export async function countRecordsByStatus(
  sub: string,
): Promise<Record<RecordStatus, number>> {
  const rows = await listRecords(sub);
  return rows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    { draft: 0, active: 0, archived: 0 } as Record<RecordStatus, number>,
  );
}
