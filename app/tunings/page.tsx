import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TUNING_PRESETS, CATEGORY_LABELS, PRESET_CATEGORY_ORDER } from "@/lib/tuner/presets";
import { isFluxPersistenceConfigured } from "@/lib/config/availability";
import { configuredAuthProviders } from "@/lib/auth/providers";
import { listCustomTunings } from "@/lib/flux/custom-tunings";
import { listFavorites } from "@/lib/flux/favorites";
import { CustomTuningForm } from "@/components/tunings/CustomTuningForm";
import { TuningList } from "@/components/tunings/TuningList";
import Link from "next/link";

export default async function TuningsPage() {
  const session = await auth();
  const sub = session?.user?.id ?? null;
  const flux = isFluxPersistenceConfigured();
  const oauth = configuredAuthProviders().length > 0;
  let custom: Awaited<ReturnType<typeof listCustomTunings>> = [];
  let favorites: Awaited<ReturnType<typeof listFavorites>> = [];

  if (sub && flux) {
    try {
      custom = await listCustomTunings(sub);
      favorites = await listFavorites(sub);
    } catch {
      /* Flux down */
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
      <PageHeader
        title="Tunings"
        description="Built-in presets are always here. Custom tunings save to your account when Flux is connected."
      />
      {PRESET_CATEGORY_ORDER.map((cat) => (
        <section key={cat} className="mb-8">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-[var(--muted-fg)]">
            {CATEGORY_LABELS[cat]}
          </h2>
          <TuningList
            tunings={TUNING_PRESETS.filter((p) => p.category === cat).map((p) => ({
              id: p.id,
              name: p.name,
              notes: [...p.notes],
              kind: "preset" as const,
            }))}
            favoriteIds={Object.fromEntries(
              favorites
                .filter((f) => f.preset_id)
                .map((f) => [f.preset_id as string, f.id]),
            )}
            canFavorite={Boolean(sub && flux)}
          />
        </section>
      ))}

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-[var(--muted-fg)]">Custom</h2>
        {sub && flux ? (
          <>
            <CustomTuningForm />
            {custom.length === 0 ? (
              <EmptyState title="No custom tunings yet" hint="Add one above. It stays on your account." />
            ) : (
              <div className="mt-4">
                <TuningList
                  tunings={custom.map((t) => ({
                    id: t.id,
                    name: t.name,
                    notes: Array.isArray(t.notes) ? t.notes.map(String) : [],
                    kind: "custom" as const,
                  }))}
                  favoriteIds={Object.fromEntries(
                    favorites
                      .filter((f) => f.custom_tuning_id)
                      .map((f) => [f.custom_tuning_id as string, f.id]),
                  )}
                  canFavorite
                  canArchive
                />
              </div>
            )}
          </>
        ) : (
          <Card>
            <p className="text-sm text-[var(--muted-fg)]">
              {oauth ? (
                <>
                  <Link href="/login" className="underline">
                    Sign in
                  </Link>{" "}
                  to save custom tunings.
                  {!flux ? " Flux is not connected in this environment yet." : null}
                </>
              ) : (
                "Sign-in is not configured, so custom tunings cannot persist. Built-in presets still work on the tuner."
              )}
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
