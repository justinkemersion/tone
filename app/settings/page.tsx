import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ThemeRuntime } from "@/components/theme/ThemeRuntime";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { isFluxPersistenceConfigured, isR2Configured } from "@/lib/config/availability";
import { configuredAuthProviders } from "@/lib/auth/providers";
import { getPreferences } from "@/lib/flux/preferences";
import { DEFAULT_LOCAL_PREFS } from "@/lib/tuner/local-prefs";
import { TUNING_PRESETS } from "@/lib/tuner/presets";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  const sub = session?.user?.id ?? null;
  const flux = isFluxPersistenceConfigured();
  const oauth = configuredAuthProviders().length > 0;
  let prefs = DEFAULT_LOCAL_PREFS;

  if (sub && flux) {
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
    } catch {
      /* Flux down — local settings still apply on the tuner */
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <ThemeRuntime theme={prefs.theme} />
      <PageHeader
        title="Settings"
        description="Reference pitch, default tuning, and theme. The tuner itself does not require an account."
      />
      <SettingsForm
        prefs={prefs}
        canPersist={Boolean(sub && flux)}
        tunings={TUNING_PRESETS.map((p) => ({ id: p.id, name: p.name }))}
      />
      <Card className="mt-6 space-y-2 text-sm text-[var(--muted-fg)]">
        <p>
          Account:{" "}
          {sub
            ? "signed in"
            : oauth
              ? "not signed in"
              : "OAuth is not configured (AUTH_GITHUB_* / AUTH_GOOGLE_*)."}
        </p>
        <p>
          Flux persistence: {flux ? "env present" : "not connected (FLUX_URL / FLUX_GATEWAY_JWT_SECRET)."}
        </p>
        <p>Cloud recordings (R2): {isR2Configured() ? "env present" : "not configured."}</p>
        <p>
          <Link href="/recordings" className="underline">
            Recordings
          </Link>{" "}
          are a later feature; cloud save is disabled until R2 is wired for real.
        </p>
        {!sub && oauth ? (
          <p>
            <Link href="/login" className="underline">
              Sign in
            </Link>{" "}
            to sync preferences across devices.
          </p>
        ) : null}
      </Card>
      <p className="mt-6 text-center text-xs">
        <Link href="/" className="underline">
          Back to the tuner
        </Link>
      </p>
    </div>
  );
}
