"use client";

import type { TuningCategory } from "@/lib/tuning/types";

const cls = "h-3.5 w-3.5 shrink-0 text-zinc-500";

export function CategoryGlyph({ category }: { category: TuningCategory }) {
  switch (category) {
    case "standard":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2 12h12M2 8h12M2 4h12"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );
    case "drop":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 2.5c-1.2 1.6-2 3.4-2 5.1 0 2.2 1.2 4 2.5 5.9 1.3-1.9 2.5-3.7 2.5-5.9 0-1.7-.8-3.5-2-5.1Z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M8 6v3.5"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      );
    case "open":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle
            cx="8"
            cy="8"
            r="5.25"
            stroke="currentColor"
            strokeWidth="1.15"
          />
          <path
            d="M8 5v6M5.5 8h5"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      );
    case "song":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M5.5 12V6.2l6-1.7V10"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse
            cx="4.25"
            cy="12"
            rx="1.35"
            ry="1.1"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <ellipse
            cx="11.75"
            cy="10"
            rx="1.35"
            ry="1.1"
            stroke="currentColor"
            strokeWidth="1.1"
          />
        </svg>
      );
    default:
      return null;
  }
}
