"use client";

import { motion } from "framer-motion";

type Props = {
  cents: number | null;
  inTune: boolean;
  /** When false (e.g. reference mode), arc is idle. */
  listenActive: boolean;
};

const DISPLAY_RANGE = 50;

export function TunerArc({ cents, inTune, listenActive }: Props) {
  const cx = 100;
  const cy = 100;
  const r = 78;

  const hasSignal =
    listenActive && cents != null && Number.isFinite(cents);
  const clamped = hasSignal
    ? Math.max(-DISPLAY_RANGE, Math.min(DISPLAY_RANGE, cents))
    : 0;
  const t = (clamped + DISPLAY_RANGE) / (2 * DISPLAY_RANGE);
  const theta = Math.PI * (1 - t);
  const x = cx + r * Math.cos(theta);
  const y = cy - r * Math.sin(theta);

  return (
    <div
      className={`relative mx-auto w-full max-w-[min(100%,320px)] transition-[box-shadow,filter] duration-500 ease-out ${
        hasSignal && inTune
          ? "shadow-[0_0_56px_rgba(34,197,94,0.32),0_0_24px_rgba(34,197,94,0.18)]"
          : ""
      }`}
    >
      <svg
        viewBox="0 0 200 120"
        className="h-auto w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="tone-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#52525b" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#a1a1aa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#52525b" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M 22 100 A 78 78 0 1 1 178 100"
          fill="none"
          stroke="url(#tone-arc-grad)"
          strokeWidth={5}
          strokeLinecap="round"
          className="opacity-90"
        />
        <motion.circle
          r={hasSignal ? 5.5 : 4}
          fill={
            !listenActive
              ? "#3f3f46"
              : !hasSignal
                ? "#52525b"
                : inTune
                  ? "#4ade80"
                  : "#f87171"
          }
          animate={{ cx: x, cy: y }}
          transition={{ type: "spring", stiffness: 520, damping: 36 }}
        />
      </svg>
    </div>
  );
}
