"use server";

import { actionError, type ActionResult } from "@/lib/actions/result";
import { requireSessionSub } from "@/lib/flux/auth";
import { describeRecordingsStatus, uploadRecording } from "@/lib/storage/recordings";

export async function recordingsStatusAction(): Promise<
  ActionResult<{ configured: boolean; detail: string }>
> {
  try {
    return { ok: true, data: describeRecordingsStatus() };
  } catch (e) {
    return actionError(e);
  }
}

/** Always fails closed until R2 upload is actually implemented. */
export async function saveRecordingAction(): Promise<ActionResult<never>> {
  try {
    await requireSessionSub();
    uploadRecording({
      title: "untitled",
      bytes: new Uint8Array(),
      contentType: "audio/webm",
    });
    return { ok: false, error: "Recording upload is not implemented yet." };
  } catch (e) {
    return actionError(e);
  }
}
