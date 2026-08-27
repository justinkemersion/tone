"use server";

import { z } from "zod";
import { requireSessionSub } from "@/lib/flux/auth";
import {
  archiveCustomTuning,
  createCustomTuning,
  updateCustomTuning,
} from "@/lib/flux/custom-tunings";
import { addFavorite, removeFavorite } from "@/lib/flux/favorites";
import { logActivity } from "@/lib/flux/activity";
import { actionError, type ActionResult } from "@/lib/actions/result";
import { UserFacingError } from "@/lib/flux/errors";
import { isFluxPersistenceConfigured } from "@/lib/config/availability";
import { parseNote } from "@/lib/tuner/theory";
import type { CustomTuningRow, TuningFavoriteRow } from "@/lib/types/tone";

const noteSchema = z
  .string()
  .min(2)
  .max(6)
  .superRefine((value, ctx) => {
    try {
      parseNote(value);
    } catch {
      ctx.addIssue({ code: "custom", message: `Invalid note: ${value}` });
    }
  });

const tuningSchema = z.object({
  name: z.string().min(1).max(80),
  notes: z.array(noteSchema).min(1).max(8),
});

const idSchema = z.string().uuid();

function requireFlux(): void {
  if (!isFluxPersistenceConfigured()) {
    throw new UserFacingError(
      "Persistence is not connected. Set FLUX_URL and FLUX_GATEWAY_JWT_SECRET after flux init.",
    );
  }
}

export async function createTuningAction(
  input: z.infer<typeof tuningSchema>,
): Promise<ActionResult<CustomTuningRow>> {
  try {
    requireFlux();
    const sub = await requireSessionSub();
    const parsed = tuningSchema.parse(input);
    const row = await createCustomTuning(sub, parsed);
    await logActivity(sub, {
      entity_type: "custom_tuning",
      entity_id: row.id,
      action: "created",
      metadata: { name: row.name },
    });
    return { ok: true, data: row };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateTuningAction(
  id: string,
  input: z.infer<typeof tuningSchema>,
): Promise<ActionResult<CustomTuningRow>> {
  try {
    requireFlux();
    const sub = await requireSessionSub();
    const tuningId = idSchema.parse(id);
    const parsed = tuningSchema.parse(input);
    const row = await updateCustomTuning(sub, tuningId, parsed);
    await logActivity(sub, {
      entity_type: "custom_tuning",
      entity_id: row.id,
      action: "updated",
    });
    return { ok: true, data: row };
  } catch (e) {
    return actionError(e);
  }
}

export async function archiveTuningAction(id: string): Promise<ActionResult<CustomTuningRow>> {
  try {
    requireFlux();
    const sub = await requireSessionSub();
    const tuningId = idSchema.parse(id);
    const row = await archiveCustomTuning(sub, tuningId);
    await logActivity(sub, {
      entity_type: "custom_tuning",
      entity_id: row.id,
      action: "archived",
    });
    return { ok: true, data: row };
  } catch (e) {
    return actionError(e);
  }
}

export async function addFavoriteAction(input: {
  presetId?: string;
  customTuningId?: string;
}): Promise<ActionResult<TuningFavoriteRow>> {
  try {
    requireFlux();
    const sub = await requireSessionSub();
    const row = input.customTuningId
      ? await addFavorite(sub, { customTuningId: idSchema.parse(input.customTuningId) })
      : await addFavorite(sub, { presetId: z.string().min(1).parse(input.presetId) });
    await logActivity(sub, {
      entity_type: "tuning_favorite",
      entity_id: row.id,
      action: "created",
    });
    return { ok: true, data: row };
  } catch (e) {
    return actionError(e);
  }
}

export async function removeFavoriteAction(id: string): Promise<ActionResult> {
  try {
    requireFlux();
    const sub = await requireSessionSub();
    const favId = idSchema.parse(id);
    await removeFavorite(sub, favId);
    await logActivity(sub, {
      entity_type: "tuning_favorite",
      entity_id: favId,
      action: "archived",
    });
    return { ok: true };
  } catch (e) {
    return actionError(e);
  }
}
