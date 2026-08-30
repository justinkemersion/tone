"use client";

import { Button } from "@/components/ui/Button";
import type { MicStatus } from "@/lib/tuner/state";

const START_LABEL: Record<Exclude<MicStatus, "listening" | "requesting">, string> = {
  idle: "Allow microphone",
  "permission-denied": "Try microphone again",
  unavailable: "Try again",
  unsupported: "Try again",
  "init-failed": "Retry audio",
};

export function MicGate({
  mic,
  onStart,
  onStop,
}: {
  mic: MicStatus;
  onStart: () => void;
  onStop?: () => void;
}) {
  if (mic === "requesting") {
    return (
      <div className="flex justify-center">
        <Button type="button" disabled className="min-h-11 min-w-[11rem]">
          Waiting for permission
        </Button>
      </div>
    );
  }

  if (mic === "listening") {
    return (
      <div className="flex justify-center">
        <Button
          type="button"
          variant="secondary"
          onClick={onStop}
          className="min-h-11 min-w-[11rem]"
        >
          Stop microphone
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Button type="button" onClick={onStart} className="min-h-11 min-w-[11rem]">
        {START_LABEL[mic]}
      </Button>
    </div>
  );
}
