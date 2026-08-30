"use client";

import { formatCents, formatHz } from "@/lib/tuner/theory";
import type { TunerView } from "@/lib/tuner/state";
import { cn } from "@/lib/ui/cn";

export function noteHeadline(view: TunerView): string {
  if (view.mic === "idle") return "Allow microphone";
  if (view.mic === "requesting") return "Waiting";
  if (view.mic === "permission-denied") return "Permission denied";
  if (view.mic === "unavailable") return "No microphone";
  if (view.mic === "unsupported") return "Microphone unavailable";
  if (view.mic === "init-failed") return "Audio failed";
  if (view.stale || !view.note) return "Play a string";
  return view.mode === "guitar" && view.target ? view.target.note : view.note.label;
}

export function noteSubline(view: TunerView): string {
  if (view.mic === "idle") return "Then play an open string.";
  if (view.mic === "permission-denied") {
    return "Enable microphone access in the browser, then try again.";
  }
  if (view.mic === "unavailable") return "This device has no usable microphone.";
  if (view.mic === "unsupported") {
    return "Use a modern browser on HTTPS or localhost.";
  }
  if (view.mic === "init-failed") return "Reload and allow audio when prompted.";
  if (view.stale || !view.hz) return "Listening";
  if (view.intonation === "in-tune") return "In tune";
  if (view.intonation === "nearly") {
    return view.cents == null ? "Almost" : `Almost · ${formatCents(view.cents)}`;
  }
  if (view.intonation === "flat") {
    return view.cents == null ? "Tune up" : `Tune up · ${formatCents(view.cents)}`;
  }
  if (view.intonation === "sharp") {
    return view.cents == null ? "Tune down" : `Tune down · ${formatCents(view.cents)}`;
  }
  return formatHz(view.hz);
}

export function NoteDisplay({ view }: { view: TunerView }) {
  const showingNote = view.mic === "listening" && !view.stale && Boolean(view.note);
  const inTune = showingNote && view.intonation === "in-tune";
  return (
    <div className="text-center">
      <p
        className={cn(
          showingNote
            ? "tabular text-[clamp(3.5rem,16vw,8rem)] font-semibold leading-none tracking-tight"
            : "text-[clamp(1.4rem,5vw,2.25rem)] font-semibold tracking-tight",
          inTune && "text-[var(--in-tune)]",
        )}
      >
        {noteHeadline(view)}
      </p>
      <p
        className={cn(
          "mt-3 text-sm",
          inTune ? "font-medium text-[var(--in-tune)]" : "text-[var(--muted-fg)]",
        )}
      >
        {noteSubline(view)}
      </p>
      {view.hz && !view.stale && !view.held ? (
        <p className="tabular mt-1 text-xs text-[var(--muted-fg)]">{formatHz(view.hz)}</p>
      ) : null}
    </div>
  );
}
