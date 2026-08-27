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
    mic === "permission-denied"
      ? "Try microphone again"
      : mic === "init-failed"
        ? "Retry audio"
        : "Allow microphone";
  return (
    <div className="flex justify-center">
      <Button type="button" onClick={onStart}>
        {label}
      </Button>
    </div>
  );
}
