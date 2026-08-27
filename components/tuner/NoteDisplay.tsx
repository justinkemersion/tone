"use client";

import { formatHz } from "@/lib/tuner/theory";
import type { TunerView } from "@/lib/tuner/state";

function headline(view: TunerView): string {
  if (view.mic === "idle") return "Allow microphone";
  if (view.mic === "requesting") return "Waiting";
  if (view.mic === "permission-denied") return "Permission denied";
  if (view.mic === "unavailable") return "No microphone";
  if (view.mic === "init-failed") return "Audio failed";
  if (view.stale || !view.note) return "Play a string";
  return view.mode === "guitar" && view.target ? view.target.note : view.note.label;
}

function subline(view: TunerView): string {
  if (view.mic === "idle") return "Then play an open string.";
  if (view.mic === "permission-denied") {
    return "Enable microphone access in the browser, then try again.";
  }
  if (view.mic === "unavailable") return "This device has no usable microphone.";
  if (view.mic === "init-failed") return "Reload and allow audio when prompted.";
  if (view.stale || !view.hz) return "Listening";
  if (view.intonation === "in-tune") return "In tune";
  if (view.intonation === "nearly") return "Almost";
  if (view.intonation === "flat") return "Tune up";
  if (view.intonation === "sharp") return "Tune down";
  return formatHz(view.hz);
}

export function NoteDisplay({ view }: { view: TunerView }) {
  const showingNote = view.mic === "listening" && !view.stale && Boolean(view.note);
  return (
    <div className="text-center">
      <p
        className={
          showingNote
            ? "tabular text-[clamp(3.5rem,16vw,8rem)] font-semibold leading-none tracking-tight"
            : "text-[clamp(1.4rem,5vw,2.25rem)] font-semibold tracking-tight"
        }
      >
        {headline(view)}
      </p>
      <p className="mt-3 text-sm text-[var(--muted-fg)]">{subline(view)}</p>
      {view.hz && !view.stale ? (
        <p className="tabular mt-1 text-xs text-[var(--muted-fg)]">{formatHz(view.hz)}</p>
      ) : null}
    </div>
  );
}
