"use client";

import { centsToNeedle } from "@/lib/tuner/display";
import { formatCents } from "@/lib/tuner/theory";
import { DISPLAY_CENTS_CLAMP } from "@/lib/tuner/constants";
import type { Intonation } from "@/lib/tuner/state";
import { cn } from "@/lib/ui/cn";

export function TunerNeedle({
  cents,
  intonation,
  held = false,
}: {
  cents: number | null;
  intonation: Intonation;
  held?: boolean;
}) {
  const t = cents == null ? 0 : centsToNeedle(cents, DISPLAY_CENTS_CLAMP);
  const pct = 50 + t * 50;
  const color =
    intonation === "in-tune"
      ? "var(--in-tune)"
      : intonation === "flat"
        ? "var(--flat)"
        : intonation === "sharp"
          ? "var(--sharp)"
          : "var(--needle)";

  return (
    <div className="mx-auto w-full max-w-xl px-2">
      <div className={cn("relative h-16", held && "opacity-70")}>
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[var(--track)]" />
        <div
          className="absolute left-1/2 top-[8px] h-10 w-[2px] -translate-x-1/2"
          style={{ background: intonation === "in-tune" ? "var(--in-tune)" : "var(--foreground)" }}
        />
        <div
          className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 transition-[left,background-color] duration-150 ease-out motion-reduce:transition-none"
          style={{ left: `${pct}%` }}
        >
          <div
            className={cn(
              "h-full w-full rotate-45 rounded-[3px] border-2",
              intonation === "in-tune" ? "scale-110" : "scale-100",
            )}
            style={{
              borderColor: color,
              background: intonation === "in-tune" ? color : "transparent",
            }}
          />
        </div>
        <span className="absolute left-0 top-0 text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">
          Flat
        </span>
        <span className="absolute right-0 top-0 text-[10px] uppercase tracking-wider text-[var(--muted-fg)]">
          Sharp
        </span>
      </div>
      <p
        className={cn(
          "tabular mt-1 text-center text-sm",
          intonation === "in-tune" ? "font-medium text-[var(--in-tune)]" : "text-[var(--muted-fg)]",
        )}
      >
        {cents == null ? "—" : formatCents(cents)}
      </p>
    </div>
  );
}
