"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CategoryGlyph } from "@/components/tuner/CategoryGlyph";
import {
  CATEGORY_LABELS,
  filterPresetsBySearch,
  getTuningById,
  groupPresets,
  PRESET_CATEGORY_ORDER,
} from "@/lib/tuning/tunings";
import type { TuningPreset } from "@/lib/tuning/types";

type Props = {
  presets: readonly TuningPreset[];
  value: string;
  onChange: (id: string) => void;
  favoriteTuningIds: readonly string[];
  toggleFavoriteTuning: (id: string) => void;
  isFavoriteTuning: (id: string) => boolean;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        d="M10 16.5s-6-3.6-6-8a3.4 3.4 0 0 1 6-1.1 3.4 3.4 0 0 1 6 1.1c0 4.4-6 8-6 8Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PresetCard({
  preset,
  selected,
  favorite,
  onSelect,
  onToggleFavorite,
}: {
  preset: TuningPreset;
  selected: boolean;
  favorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <motion.div layout initial={false} className="relative">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full min-h-[4.25rem] flex-col gap-0.5 rounded-xl border px-3 py-2.5 pr-11 text-left transition-[box-shadow,border-color,background-color] ${
          selected
            ? "border-emerald-500/55 bg-emerald-500/[0.09] shadow-[0_0_24px_rgba(16,185,129,0.14)] ring-1 ring-emerald-500/35"
            : "border-zinc-700/80 bg-zinc-900/45 backdrop-blur-md hover:border-zinc-600 hover:bg-zinc-800/50"
        }`}
      >
        <span className="flex items-center gap-2">
          <CategoryGlyph category={preset.category} />
          <span className="text-sm font-medium tracking-tight text-zinc-100">
            {preset.name}
          </span>
        </span>
        {preset.subtitle ? (
          <span className="line-clamp-3 pl-[22px] text-[11px] leading-snug text-zinc-500/90">
            {preset.subtitle}
          </span>
        ) : null}
        <span className="pl-[22px] font-mono text-[11px] tabular-nums text-zinc-600">
          {preset.notes.join(" · ")}
        </span>
      </button>
      <button
        type="button"
        aria-label={
          favorite ? `Remove ${preset.name} from favorites` : `Favorite ${preset.name}`
        }
        aria-pressed={favorite}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
          favorite
            ? "border-rose-500/35 bg-rose-500/10 text-rose-300"
            : "border-zinc-700/60 bg-zinc-900/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
        }`}
      >
        <HeartIcon filled={favorite} />
      </button>
    </motion.div>
  );
}

export function PresetSelector({
  presets,
  value,
  onChange,
  favoriteTuningIds,
  toggleFavoriteTuning,
  isFavoriteTuning,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const current = useMemo(
    () => getTuningById(value) ?? presets[0],
    [presets, value]
  );

  const filtered = useMemo(
    () => filterPresetsBySearch(presets, search),
    [presets, search]
  );

  const favoritePresets = useMemo(() => {
    const set = new Set(favoriteTuningIds);
    return filtered.filter((p) => set.has(p.id));
  }, [filtered, favoriteTuningIds]);

  const favIdSet = useMemo(
    () => new Set(favoritePresets.map((p) => p.id)),
    [favoritePresets]
  );

  const grouped = useMemo(() => {
    const g = groupPresets(filtered);
    if (favIdSet.size === 0) return g;
    const out = {
      standard: [] as TuningPreset[],
      drop: [] as TuningPreset[],
      open: [] as TuningPreset[],
      song: [] as TuningPreset[],
    };
    for (const c of PRESET_CATEGORY_ORDER) {
      out[c] = g[c].filter((p) => !favIdSet.has(p.id));
    }
    return out;
  }, [filtered, favIdSet]);

  const select = useCallback(
    (id: string) => {
      onChange(id);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-30">
      <span className="mb-2 block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
        Tuning preset
      </span>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-[box-shadow,border-color] ${
          open
            ? "border-zinc-500 bg-zinc-900/70 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
            : "border-zinc-700/90 bg-zinc-900/55 shadow-inner shadow-black/25 backdrop-blur-md hover:border-zinc-600"
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          {current ? <CategoryGlyph category={current.category} /> : null}
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-zinc-100">
              {current?.name ?? "—"}
            </span>
            {current?.subtitle ? (
              <span className="mt-0.5 block truncate text-[11px] leading-snug text-zinc-500/85">
                {current.subtitle}
              </span>
            ) : (
              <span className="mt-0.5 block truncate text-[11px] text-zinc-600">
                {CATEGORY_LABELS[current?.category ?? "standard"]}
              </span>
            )}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="text-zinc-500"
          aria-hidden
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <motion.div
              id={listId}
              role="listbox"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-3 top-24 z-50 flex max-h-[min(72vh,560px)] flex-col overflow-hidden rounded-2xl border border-zinc-700/90 bg-zinc-950/95 shadow-2xl shadow-black/50 backdrop-blur-xl md:absolute md:inset-x-0 md:top-full md:mt-2 md:max-h-[min(480px,58vh)]"
            >
              <div className="border-b border-zinc-800/90 p-3">
                <label className="sr-only" htmlFor={`${listId}-search`}>
                  Search tunings
                </label>
                <input
                  id={`${listId}-search`}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tunings, songs, notes…"
                  className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-3">
                <motion.div
                  layout
                  className="flex flex-col gap-6"
                  transition={{ layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
                >
                  {favoritePresets.length > 0 ? (
                    <section>
                      <h3 className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                        <HeartIcon filled={false} />
                        Favorites
                      </h3>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {favoritePresets.map((p) => (
                          <PresetCard
                            key={p.id}
                            preset={p}
                            selected={p.id === value}
                            favorite={isFavoriteTuning(p.id)}
                            onSelect={() => select(p.id)}
                            onToggleFavorite={() => toggleFavoriteTuning(p.id)}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {PRESET_CATEGORY_ORDER.map((cat) => {
                    const items = grouped[cat];
                    if (items.length === 0) return null;
                    return (
                      <section key={cat}>
                        <h3 className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                          <CategoryGlyph category={cat} />
                          {CATEGORY_LABELS[cat]}
                        </h3>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {items.map((p) => (
                            <PresetCard
                              key={p.id}
                              preset={p}
                              selected={p.id === value}
                              favorite={isFavoriteTuning(p.id)}
                              onSelect={() => select(p.id)}
                              onToggleFavorite={() => toggleFavoriteTuning(p.id)}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}

                  {filtered.length === 0 ? (
                    <p className="py-8 text-center text-sm text-zinc-500">
                      No tunings match “{search.trim()}”.
                    </p>
                  ) : null}
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
