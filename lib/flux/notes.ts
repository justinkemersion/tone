import { fluxJson } from "./client";
import type { NoteRow } from "./types";

export async function listNotesForRecord(
  sub: string,
  recordId: string,
): Promise<NoteRow[]> {
  return fluxJson<NoteRow[]>(
    sub,
    `/notes?record_id=eq.${encodeURIComponent(recordId)}&order=created_at.desc`,
  );
}

export async function createNote(
  sub: string,
  payload: { record_id?: string | null; body: string },
): Promise<NoteRow> {
  const rows = await fluxJson<NoteRow[]>(sub, "/notes", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: sub,
      record_id: payload.record_id ?? null,
      body: payload.body,
    }),
  });
  const row = rows[0];
  if (!row) throw new Error("createNote: empty response");
  return row;
}

export async function updateNote(
  sub: string,
  id: string,
  body: string,
): Promise<NoteRow> {
  const rows = await fluxJson<NoteRow[]>(sub, `/notes?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ body, updated_at: new Date().toISOString() }),
  });
  const row = rows[0];
  if (!row) throw new Error("updateNote: empty response");
  return row;
}
