"use server";

import { z } from "zod";
import { requireSessionSub } from "@/lib/flux/auth";
import { getPreferences, upsertPreferences } from "@/lib/flux/preferences";
import { logActivity } from "@/lib/flux/activity";
import { actionError, type ActionResult } from "@/lib/actions/result";
import { UserFacingError } from "@/lib/flux/errors";
import { isFluxPersistenceConfigured } from "@/lib/config/availability";
import type { UserPreferencesRow } from "@/lib/types/tone";

const prefsSchema = z.object({
  reference_hz: z.number().min(390).max(480).optional(),
  default_tuning_id: z.string().min(1).max(80).optional(),
  tuner_mode: z.enum(["guitar", "chromatic"]).optional(),
  theme: z.enum(["system", "light", "dark"]).optional(),
});

function requireFlux(): void {
  if (!isFluxPersistenceConfigured()) {
    throw new UserFacingError(
      "Persistence is not connected. Set FLUX_URL and FLUX_GATEWAY_JWT_SECRET after flux init.",
    );
  }
}

export async function savePreferencesAction(
  input: z.infer<typeof prefsSchema>,
): Promise<ActionResult<UserPreferencesRow>> {
  try {
    requireFlux();
    const sub = await requireSessionSub();
    const parsed = prefsSchema.parse(input);
    const existing = await getPreferences(sub);
    const row = await upsertPreferences(sub, parsed);
    await logActivity(sub, {
      entity_type: "user_preferences",
      entity_id: row.id,
      action: existing ? "updated" : "created",
    });
    return { ok: true, data: row };
  } catch (e) {
    return actionError(e);
  }
}
