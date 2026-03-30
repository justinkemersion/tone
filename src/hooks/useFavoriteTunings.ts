"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tone:favorite-tuning-ids";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function useFavoriteTunings() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate favorites from localStorage once after SSR
    setFavoriteIds(readIds());
  }, []);

  const toggleFavoriteTuning = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage full or disabled */
      }
      return next;
    });
  }, []);

  const isFavoriteTuning = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds]
  );

  return { favoriteTuningIds: favoriteIds, toggleFavoriteTuning, isFavoriteTuning };
}
