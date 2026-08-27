import { centsBetween } from "./theory";
import type { OpenString } from "./presets";

export type StringTarget = OpenString & { cents: number };

export function nearestOpenString(
  hz: number,
  strings: readonly OpenString[],
): StringTarget | null {
  if (strings.length === 0 || !Number.isFinite(hz) || hz <= 0) return null;
  let best: StringTarget | null = null;
  let bestAbs = Infinity;
  for (const s of strings) {
    const cents = centsBetween(hz, s.hz);
    const abs = Math.abs(cents);
    if (abs < bestAbs) {
      bestAbs = abs;
      best = { ...s, cents };
    }
  }
  return best;
}
