/**
 * Seed demo Tone data for DEMO_USER_SUB (OAuth provider account id).
 * Requires FLUX_URL, FLUX_GATEWAY_JWT_SECRET, DEMO_USER_SUB in env.
 * Does not run without Flux — it will not fake success.
 */
import { upsertProfile } from "../lib/flux/profiles";
import { upsertPreferences } from "../lib/flux/preferences";
import { createCustomTuning } from "../lib/flux/custom-tunings";
import { addFavorite } from "../lib/flux/favorites";
import { logActivity } from "../lib/flux/activity";
import { loadEnvFiles } from "./lib/load-env";

loadEnvFiles(process.cwd());

async function main() {
  const sub = process.env.DEMO_USER_SUB?.trim();
  if (!sub) {
    console.error("Set DEMO_USER_SUB to your OAuth provider account id");
    process.exit(1);
  }
  if (!process.env.FLUX_URL?.trim()) {
    console.error("Set FLUX_URL (see .env.example / docs/FLUX_WORKFLOW.md)");
    process.exit(1);
  }
  if (!process.env.FLUX_GATEWAY_JWT_SECRET?.trim()) {
    console.error("Set FLUX_GATEWAY_JWT_SECRET");
    process.exit(1);
  }

  await upsertProfile(sub, { display_name: "Tone Demo" });
  await upsertPreferences(sub, {
    reference_hz: 440,
    default_tuning_id: "standard",
    tuner_mode: "guitar",
    theme: "dark",
  });
  const custom = await createCustomTuning(sub, {
    name: "Practice Drop D",
    notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
  });
  await addFavorite(sub, { presetId: "standard" });
  await addFavorite(sub, { customTuningId: custom.id });
  await logActivity(sub, {
    entity_type: "seed",
    entity_id: "tone-demo",
    action: "seeded",
    metadata: { tunings: 1 },
  });

  console.log("Seeded Tone demo data for", sub);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
