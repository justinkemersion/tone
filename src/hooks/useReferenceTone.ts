"use client";

import { useCallback, useRef, useState } from "react";

const ATTACK_S = 0.055;
const RELEASE_S = 0.092;
/** Output peak; triangle is bright — keep below clipping. */
const PEAK_GAIN = 0.18;
const START_PAD_S = 0.012;

export type ReferenceToneState = {
  activeNote: string | null;
  activeStringIndex: number | null;
  isPlaying: boolean;
};

export type PlayStringArgs = {
  frequencyHz: number;
  note: string;
  stringIndex: number;
};

export function useReferenceTone() {
  const ctxRef = useRef<AudioContext | null>(null);
  const voiceRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(
    null
  );

  const ensureCtx = useCallback(async () => {
    if (typeof window === "undefined") {
      throw new Error("AudioContext is not available.");
    }
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    return ctx;
  }, []);

  const scheduleFadeOutCurrent = useCallback((ctx: AudioContext) => {
    const v = voiceRef.current;
    if (!v) return;
    const now = ctx.currentTime;
    try {
      v.gain.gain.cancelScheduledValues(now);
      v.gain.gain.setValueAtTime(v.gain.gain.value, now);
      const tEnd = now + RELEASE_S;
      v.gain.gain.linearRampToValueAtTime(0, tEnd);
      v.osc.stop(tEnd + 0.03);
    } catch {
      /* node may already be stopped */
    }
    voiceRef.current = null;
  }, []);

  const playString = useCallback(
    async ({ frequencyHz, note, stringIndex }: PlayStringArgs) => {
      if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return;

      const ctx = await ensureCtx();
      const now = ctx.currentTime;

      const hadVoice = voiceRef.current !== null;
      scheduleFadeOutCurrent(ctx);
      const startAt = (hadVoice ? now + RELEASE_S : now) + START_PAD_S;

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequencyHz, startAt);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(PEAK_GAIN, startAt + ATTACK_S);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      voiceRef.current = { osc, gain };

      setActiveNote(note);
      setActiveStringIndex(stringIndex);
    },
    [ensureCtx, scheduleFadeOutCurrent]
  );

  const stopSmooth = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) {
      setActiveNote(null);
      setActiveStringIndex(null);
      return;
    }
    scheduleFadeOutCurrent(ctx);
    setActiveNote(null);
    setActiveStringIndex(null);
  }, [scheduleFadeOutCurrent]);

  /** Fade out, suspend context (output path idle). */
  const suspendOutput = useCallback(() => {
    const ctx = ctxRef.current;
    stopSmooth();
    if (!ctx || ctx.state === "closed") return;
    const ms = Math.ceil((RELEASE_S + 0.05) * 1000);
    window.setTimeout(() => {
      if (ctxRef.current === ctx && ctx.state === "running") {
        void ctx.suspend();
      }
    }, ms);
  }, [stopSmooth]);

  const disposeOutput = useCallback(() => {
    const ctx = ctxRef.current;
    stopSmooth();
    if (!ctx) return;
    const ms = Math.ceil((RELEASE_S + 0.08) * 1000);
    window.setTimeout(() => {
      if (ctxRef.current === ctx) {
        void ctx.close();
        ctxRef.current = null;
      }
    }, ms);
  }, [stopSmooth]);

  const isPlaying = activeNote != null;

  return {
    playString,
    stopSmooth,
    suspendOutput,
    disposeOutput,
    activeNote,
    activeStringIndex,
    isPlaying,
  };
}
