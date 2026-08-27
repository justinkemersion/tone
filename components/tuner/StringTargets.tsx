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
    <ul className="mx-auto flex w-full max-w-xl flex-nowrap justify-center gap-1 sm:gap-2" aria-label="Open strings">
      {strings.map((s) => {
        const active = s.index === activeIndex;
        const playing = s.index === playingIndex;
        return (
          <li key={`${s.index}-${s.note}`} className="min-w-0 flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => onSelect?.(s.index)}
              className={cn(
                "min-h-11 w-full min-w-0 rounded-full border px-1.5 py-2 text-xs tabular sm:min-w-[3.25rem] sm:px-3 sm:text-sm",
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
