"use client";

import { motion } from "framer-motion";
import type { OpenStringTarget } from "@/lib/tuning/types";
import type { TunerActiveMode } from "@/context/TunerContext";

type Props = {
  strings: OpenStringTarget[];
  mode: TunerActiveMode;
  activeStringIndex: number | null;
  onStringPress: (stringIndex: number) => void;
};

export function StringGrid({
  strings,
  mode,
  activeStringIndex,
  onStringPress,
}: Props) {
  const interactive = mode === "play";

  return (
    <motion.ul
      layout
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-3"
    >
      {strings.map((s) => {
        const active = activeStringIndex === s.stringIndex;
        return (
          <motion.li key={s.stringIndex} layout>
            <motion.button
              type="button"
              disabled={!interactive}
              whileTap={interactive ? { scale: 0.985 } : undefined}
              transition={{ type: "spring", stiffness: 520, damping: 38 }}
              onClick={() => onStringPress(s.stringIndex)}
              className={`flex w-full min-h-[4.5rem] flex-col items-start justify-between rounded-xl border px-4 py-3 text-left transition-colors md:min-h-[5.5rem] md:px-4 md:py-4 ${
                !interactive
                  ? "cursor-default border-zinc-800/60 bg-zinc-900/25 opacity-70"
                  : active
                    ? "border-emerald-500/55 bg-emerald-500/10 shadow-[0_0_28px_rgba(34,197,94,0.12)] ring-1 ring-emerald-500/30"
                    : "cursor-pointer border-zinc-700/80 bg-zinc-900/50 backdrop-blur-md hover:border-zinc-600 hover:bg-zinc-800/60 active:scale-[0.99]"
              }`}
              aria-pressed={interactive ? active : undefined}
            >
              <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                String {s.stringIndex}
              </span>
              <span className="font-mono text-lg font-semibold tabular-nums tracking-tight text-zinc-100 sm:text-xl">
                {s.note}
              </span>
              <span className="font-mono text-xs tabular-nums text-zinc-600">
                {s.hz.toFixed(1)} Hz
              </span>
            </motion.button>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
