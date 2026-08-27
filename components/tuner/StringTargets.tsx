"use client";

import { cn } from "@/lib/ui/cn";
import type { OpenString } from "@/lib/tuner/presets";

export function StringTargets({
  strings,
  activeIndex,
  onSelect,
  playingIndex,
}: {
  strings: readonly OpenString[];
  activeIndex: number | null;
  onSelect?: (index: number) => void;
  playingIndex?: number | null;
}) {
  return (
    <ul className="mx-auto flex max-w-xl flex-wrap justify-center gap-2" aria-label="Open strings">
      {strings.map((s) => {
        const active = s.index === activeIndex;
        const playing = s.index === playingIndex;
        return (
          <li key={`${s.index}-${s.note}`}>
            <button
              type="button"
              onClick={() => onSelect?.(s.index)}
              className={cn(
                "min-h-11 min-w-[3.25rem] rounded-full border px-3 py-2 text-sm tabular",
                active
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted-fg)]",
                playing ? "bg-[var(--muted)]" : "bg-transparent",
              )}
              aria-pressed={playing}
              aria-label={`String ${s.stringNumber}, ${s.note}`}
            >
              {s.note}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
