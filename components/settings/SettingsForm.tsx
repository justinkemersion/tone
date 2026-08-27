"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { savePreferencesAction } from "@/app/(dashboard)/actions/preferences";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { readStoredPrefs, writeStoredPrefs, type LocalPrefs } from "@/lib/tuner/local-prefs";
import type { TunerMode } from "@/lib/tuner/state";
import type { ThemePreference } from "@/lib/types/tone";
import { applyTheme } from "@/components/theme/ThemeRuntime";

export function SettingsForm({
  prefs,
  canPersist,
  tunings,
}: {
  prefs: LocalPrefs;
  canPersist: boolean;
  tunings: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [formPrefs, setFormPrefs] = useState(prefs);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredPrefs();
    if (stored) setFormPrefs(stored);
    setHydrated(true);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: LocalPrefs = {
      referenceHz: Number(fd.get("referenceHz")),
      tuningId: String(fd.get("tuningId")),
      mode: (String(fd.get("mode")) as TunerMode) === "chromatic" ? "chromatic" : "guitar",
      theme: String(fd.get("theme")) as ThemePreference,
    };
    writeStoredPrefs(next);
    applyTheme(next.theme);
    if (canPersist) {
      const result = await savePreferencesAction({
        reference_hz: next.referenceHz,
        default_tuning_id: next.tuningId,
        tuner_mode: next.mode,
        theme: next.theme,
      });
      if (!result.ok) {
        setError(result.error);
        setOk(false);
        return;
      }
    }
    setError(null);
    setOk(true);
    router.refresh();
  }

  return (
    <form key={hydrated ? "local" : "server"} onSubmit={onSubmit} className="space-y-4">
      <label className="block text-xs font-medium">
        Reference (A4 Hz)
        <Input
          name="referenceHz"
          type="number"
          min={390}
          max={480}
          step={0.1}
          defaultValue={formPrefs.referenceHz}
          className="mt-1"
        />
      </label>
      <label className="block text-xs font-medium">
        Default tuning
        <select
          name="tuningId"
          defaultValue={formPrefs.tuningId}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
        >
          {tunings.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium">
        Mode
        <select
          name="mode"
          defaultValue={formPrefs.mode}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
        >
          <option value="guitar">Guitar</option>
          <option value="chromatic">Chromatic</option>
        </select>
      </label>
      <label className="block text-xs font-medium">
        Theme
        <select
          name="theme"
          defaultValue={formPrefs.theme}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
        >
          <option value="system">System</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ok ? (
        <p className="text-sm text-[var(--in-tune)]">
          {canPersist ? "Saved to your account." : "Saved on this device."}
        </p>
      ) : null}
      <Button type="submit">Save</Button>
    </form>
  );
}
