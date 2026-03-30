"use client";

type Props = {
  cents: number | null;
  inTune: boolean;
};

const DISPLAY_RANGE = 50;

export function TunerMeter({ cents, inTune }: Props) {
  const active = cents != null && Number.isFinite(cents);
  const clamped = active
    ? Math.max(-DISPLAY_RANGE, Math.min(DISPLAY_RANGE, cents))
    : 0;
  const positionPct = 50 + (clamped / DISPLAY_RANGE) * 44;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs font-medium tracking-wide text-neutral-500 uppercase">
        <span>Flat</span>
        <span>In tune</span>
        <span>Sharp</span>
      </div>
      <div className="relative h-14 border border-neutral-300 bg-neutral-50">
        <div
          className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-neutral-800"
          aria-hidden
        />
        {[25, 75].map((pct) => (
          <div
            key={pct}
            className="absolute top-2 bottom-2 w-px bg-neutral-200"
            style={{ left: `${pct}%` }}
            aria-hidden
          />
        ))}
        <div
          className="absolute top-1 bottom-1 w-0.5 rounded-none transition-transform duration-100 ease-out will-change-transform"
          style={{
            left: `${positionPct}%`,
            transform: "translateX(-50%)",
            backgroundColor: !active
              ? "#a3a3a3"
              : inTune
                ? "#15803d"
                : "#b91c1c",
          }}
          role="presentation"
        />
      </div>
      <p className="mt-2 text-center font-mono text-sm tabular-nums text-neutral-600">
        {active ? (
          <>
            {cents > 0 ? "+" : ""}
            {cents!.toFixed(1)} cents
          </>
        ) : (
          "—"
        )}
      </p>
    </div>
  );
}
