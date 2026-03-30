"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AutocorrPitchDetector } from "@/lib/audio/pitch-detection";
import { hzToChromaticPitch } from "@/lib/audio/note-utils";
import {
  REFERENCE_A4_HZ,
  resolveOpenStrings,
} from "@/lib/tuning/tuning-library";
import type { OpenStringTarget, TuningConfig } from "@/lib/tuning/types";

const FFT_SIZE = 4096;
const SMOOTH = 0.22;
const IN_TUNE_CENTS = 5;

export type TunerStatus = "idle" | "starting" | "running" | "error";

export type UseTunerOptions = {
  tuning: TuningConfig;
  /** A4 reference in Hz. */
  referenceHz?: number;
};

export type UseTunerResult = {
  status: TunerStatus;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  /** Smoothed fundamental when detected. */
  frequencyHz: number | null;
  /** Nearest chromatic label, e.g. "E2". */
  noteLabel: string | null;
  /** Signed cents vs equal temperament for `noteLabel`. */
  cents: number | null;
  inTune: boolean;
  openStrings: OpenStringTarget[];
};

export function useTuner(options: UseTunerOptions): UseTunerResult {
  const referenceHz = options.referenceHz ?? REFERENCE_A4_HZ;

  const [status, setStatus] = useState<TunerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [frequencyHz, setFrequencyHz] = useState<number | null>(null);
  const [noteLabel, setNoteLabel] = useState<string | null>(null);
  const [cents, setCents] = useState<number | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedHzRef = useRef<number | null>(null);
  const detectorRef = useRef(new AutocorrPitchDetector({ minHz: 70, maxHz: 1200 }));

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    analyserRef.current = null;
    smoothedHzRef.current = null;
    setStatus("idle");
    setFrequencyHz(null);
    setNoteLabel(null);
    setCents(null);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access is not available in this browser.");
      setStatus("error");
      return;
    }

    stop();
    setStatus("starting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      analyserRef.current = analyser;

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const timeBuffer = new Float32Array(analyser.fftSize);
      const detector = detectorRef.current;

      const tick = () => {
        const analyserNode = analyserRef.current;
        const audioCtx = ctxRef.current;
        if (!analyserNode || !audioCtx) return;

        analyserNode.getFloatTimeDomainData(timeBuffer);
        const raw = detector.detect(timeBuffer, audioCtx.sampleRate);

        if (raw == null || !Number.isFinite(raw)) {
          smoothedHzRef.current = null;
          setFrequencyHz(null);
          setNoteLabel(null);
          setCents(null);
        } else {
          const prev = smoothedHzRef.current;
          const next =
            prev == null
              ? raw
              : prev + SMOOTH * (raw - prev);
          smoothedHzRef.current = next;
          const chroma = hzToChromaticPitch(next, referenceHz);
          setFrequencyHz(next);
          setNoteLabel(chroma.label);
          setCents(chroma.cents);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
      setStatus("running");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not access the microphone.";
      stop();
      setError(message);
      setStatus("error");
    }
  }, [referenceHz, stop]);

  useEffect(() => () => stop(), [stop]);

  const openStrings = useMemo(
    () => resolveOpenStrings(options.tuning, referenceHz),
    [options.tuning, referenceHz]
  );

  const inTune = cents != null && Math.abs(cents) <= IN_TUNE_CENTS;

  return {
    status,
    error,
    start,
    stop,
    frequencyHz,
    noteLabel,
    cents,
    inTune,
    openStrings,
  };
}
