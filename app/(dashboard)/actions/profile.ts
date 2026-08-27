"use server";

import { z } from "zod";
import { requireSessionSub } from "@/lib/flux/auth";
import { getProfile, upsertProfile } from "@/lib/flux/profiles";
import { logActivity } from "@/lib/flux/activity";
import { actionError, type ActionResult } from "@/lib/actions/result";
import type { ProfileRow } from "@/lib/flux/types";

const profileSchema = z.object({
  display_name: z.string().max(120).optional(),
  avatar_url: z.string().url().max(500).optional().or(z.literal("")),
});

export async function saveProfileAction(
  input: z.infer<typeof profileSchema>,
): Promise<ActionResult<ProfileRow>> {
  try {
    const sub = await requireSessionSub();
    const parsed = profileSchema.parse(input);
    const existing = await getProfile(sub);
    const row = await upsertProfile(sub, {
      display_name: parsed.display_name ?? null,
      avatar_url: parsed.avatar_url || null,
    });
    await logActivity(sub, {
      entity_type: "profile",
      entity_id: row.id,
      action: existing ? "updated" : "created",
    });
    return { ok: true, data: row };
  } catch (e) {
    return actionError(e);
  }
}
