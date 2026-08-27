"use client";

import { Button } from "@/components/ui/Button";
import type { MicStatus } from "@/lib/tuner/state";

export function MicGate({
  mic,
  onStart,
}: {
  mic: MicStatus;
  onStart: () => void;
}) {
  if (mic === "listening" || mic === "requesting") return null;
  const label =
    mic === "idle"
      ? "Allow microphone"
      : mic === "permission-denied"
        ? "Try microphone again"
        : mic === "unavailable"
          ? "Try again"
          : "Retry audio";
  return (
    <div className="flex justify-center">
      <Button type="button" onClick={onStart} className="min-h-11 min-w-[11rem]">
        {label}
      </Button>
    </div>
  );
}
