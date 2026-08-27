import { TunerApp } from "@/components/tuner/TunerApp";
import { ThemeRuntime } from "@/components/theme/ThemeRuntime";
import { auth } from "@/auth";
import { isFluxPersistenceConfigured } from "@/lib/config/availability";
import { getPreferences } from "@/lib/flux/preferences";
import { listCustomTunings } from "@/lib/flux/custom-tunings";
import { DEFAULT_LOCAL_PREFS } from "@/lib/tuner/local-prefs";
import type { TuningOption } from "@/components/tuner/TuningBar";

export default async function HomePage() {
  const session = await auth();
  const sub = session?.user?.id;
  let prefs = DEFAULT_LOCAL_PREFS;
  let extraTunings: TuningOption[] = [];

  if (sub && isFluxPersistenceConfigured()) {
    try {
      const row = await getPreferences(sub);
      if (row) {
        prefs = {
          referenceHz: Number(row.reference_hz),
          tuningId: row.default_tuning_id,
          mode: row.tuner_mode,
          theme: row.theme,
        };
      }
      const custom = await listCustomTunings(sub);
      extraTunings = custom.map((t) => ({
        id: t.id,
        name: t.name,
        notes: Array.isArray(t.notes) ? t.notes.map(String) : [],
      }));
    } catch {
      /* Flux unavailable — tuner still works */
    }
  }

  return (
    <>
      <ThemeRuntime theme={prefs.theme} />
      <TunerApp initialPrefs={prefs} extraTunings={extraTunings} />
    </>
  );
}
