"use client";

import { LayoutGroup, motion } from "framer-motion";
import type { TunerActiveMode } from "@/context/TunerContext";

type Props = {
  mode: TunerActiveMode;
  onChange: (mode: TunerActiveMode) => void;
};

const MODES: { id: TunerActiveMode; label: string; hint: string }[] = [
  { id: "listen", label: "Listen", hint: "Microphone" },
  { id: "play", label: "Reference", hint: "Tone" },
];

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <LayoutGroup id="tone-modes">
      <div
        className="grid grid-cols-2 gap-1 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-1 backdrop-blur-md touch-manipulation"
        role="tablist"
        aria-label="Tuner mode"
      >
        {MODES.map((m) => {
          const selected = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(m.id)}
              className="relative min-h-[48px] rounded-md px-3 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 sm:min-h-0 sm:py-2.5"
            >
              {selected ? (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-md bg-zinc-800/90 shadow-inner shadow-black/40 ring-1 ring-zinc-700/80"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative z-10 flex flex-col gap-0.5">
                <span
                  className={`text-sm font-medium tracking-tight ${
                    selected ? "text-zinc-50" : "text-zinc-500"
                  }`}
                >
                  {m.label}
                </span>
                <span className="text-[11px] font-medium tracking-wide text-zinc-600 uppercase">
                  {m.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
