"use client";

import { useRouter } from "next/navigation";
import { addFavoriteAction, archiveTuningAction, removeFavoriteAction } from "@/app/(dashboard)/actions/tunings";
import { Button } from "@/components/ui/Button";

export type ListedTuning = {
  id: string;
  name: string;
  notes: string[];
  kind: "preset" | "custom";
};

export function TuningList({
  tunings,
  favoriteIds = {},
  canFavorite = false,
  canArchive = false,
}: {
  tunings: ListedTuning[];
  favoriteIds?: Record<string, string>;
  canFavorite?: boolean;
  canArchive?: boolean;
}) {
  const router = useRouter();

  async function toggle(t: ListedTuning) {
    const favId = favoriteIds[t.id];
    if (favId) await removeFavoriteAction(favId);
    else if (t.kind === "preset") await addFavoriteAction({ presetId: t.id });
    else await addFavoriteAction({ customTuningId: t.id });
    router.refresh();
  }

  return (
    <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
      {tunings.map((t) => {
        const favored = Boolean(favoriteIds[t.id]);
        return (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <div>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="tabular text-xs text-[var(--muted-fg)]">{t.notes.join(" · ")}</p>
            </div>
            <div className="flex gap-2">
              {canFavorite ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void toggle(t)}
                  aria-pressed={favored}
                >
                  {favored ? "Favorited" : "Favorite"}
                </Button>
              ) : null}
              {canArchive && t.kind === "custom" ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    await archiveTuningAction(t.id);
                    router.refresh();
                  }}
                >
                  Archive
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
