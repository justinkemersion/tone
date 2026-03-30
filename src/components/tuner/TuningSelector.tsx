"use client";

import { motion } from "framer-motion";
import type { TuningConfig } from "@/lib/tuning/types";

type Props = {
  value: string;
  onChange: (id: string) => void;
  options: readonly TuningConfig[];
};

export function TuningSelector({ value, onChange, options }: Props) {
  return (
    <motion.div
      key={value}
      layout
      initial={{ opacity: 0.86, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-2"
    >
      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
          Tuning preset
        </span>
        <select
          className="w-full cursor-pointer rounded-lg border border-zinc-700/90 bg-zinc-900/60 px-3 py-3 text-sm font-medium text-zinc-100 shadow-inner shadow-black/20 backdrop-blur-md outline-none transition-[border-color,box-shadow] focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400/40"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((t) => (
            <option key={t.id} value={t.id} className="bg-zinc-900">
              {t.name}
            </option>
          ))}
        </select>
      </label>
    </motion.div>
  );
}
