"use client";

import type { TuningConfig } from "@/lib/tuning/types";

type Props = {
  value: string;
  onChange: (id: string) => void;
  options: readonly TuningConfig[];
};

export function TuningSelector({ value, onChange, options }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
        Tuning
      </span>
      <select
        className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-900 outline-none transition-[box-shadow] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}
