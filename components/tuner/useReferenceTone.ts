"use client";

import { useCallback, useRef } from "react";
import { midiToHz } from "@/lib/tuner/theory";
import { parseNote } from "@/lib/tuner/theory";

export function useReferenceTone() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stop = useCallback(() => {
    const gain = gainRef.current;
    const ctx = ctxRef.current;
    const osc = oscRef.current;
    if (gain && ctx) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    }
    window.setTimeout(() => {
      osc?.stop();
      osc?.disconnect();
      gain?.disconnect();
    }, 60);
    oscRef.current = null;
    gainRef.current = null;
  }, []);

  const play = useCallback(
    async (note: string, referenceHz: number) => {
      stop();
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      await ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = midiToHz(parseNote(note).midi, referenceHz);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      window.setTimeout(() => stop(), 1800);
    },
    [stop],
  );

  return { play, stop };
}
