"use client";

import { TUNING_PRESETS } from "@/lib/tuner/presets";
import type { TunerMode } from "@/lib/tuner/state";
import { cn } from "@/lib/ui/cn";

export type TuningOption = { id: string; name: string; notes: readonly string[] };

export function TuningBar({
  options,
  selectedId,
  mode,
  onSelect,
  onMode,
}: {
  options: readonly TuningOption[];
  selectedId: string;
  mode: TunerMode;
  onSelect: (id: string) => void;
  onMode: (mode: TunerMode) => void;
}) {
  const list = options.length ? options : TUNING_PRESETS;
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <label className="flex items-center gap-2 text-xs text-[var(--muted-fg)]">
        Tuning
        <select
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--foreground)]"
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
        >
          {list.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex rounded-md border border-[var(--border)] p-0.5 text-xs">
        {(["guitar", "chromatic"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onMode(m)}
            aria-pressed={mode === m}
            className={cn(
              "rounded px-2 py-1 capitalize",
              mode === m ? "bg-[var(--muted)]" : "text-[var(--muted-fg)]",
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
