"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MicStatus } from "@/lib/tuner/state";
import {
  inspectBrowserMicCapability,
  shouldResumeAudio,
  statusFromCapability,
  statusFromGetUserMediaError,
  type MicRead,
} from "@/lib/tuner/mic";

type AudioHandles = {
  context: AudioContext;
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  buffer: Float32Array<ArrayBuffer>;
};

export function useMicCapture(onStatus: (status: MicStatus) => void) {
  const handles = useRef<AudioHandles | null>(null);
  const onStatusRef = useRef(onStatus);
  const paused = useRef(false);
  onStatusRef.current = onStatus;

  const stop = useCallback(() => {
    const h = handles.current;
    handles.current = null;
    paused.current = false;
    if (!h) return;
    h.source.disconnect();
    h.analyser.disconnect();
    for (const track of h.stream.getTracks()) track.stop();
    void h.context.close();
  }, []);

  const start = useCallback(async () => {
    stop();
    const blocked = statusFromCapability(inspectBrowserMicCapability());
    if (blocked) {
      onStatusRef.current(blocked);
      return null;
    }
    onStatusRef.current("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new Ctor();
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      const buffer = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));
      handles.current = { context, stream, source, analyser, buffer };
      paused.current = document.visibilityState === "hidden";

      const onEnded = () => {
        if (handles.current?.stream !== stream) return;
        stop();
        onStatusRef.current("unavailable");
      };
      for (const track of stream.getAudioTracks()) {
        track.addEventListener("ended", onEnded);
      }
      context.addEventListener("statechange", () => {
        if (handles.current?.context !== context || context.state === "closed") return;
        if (
          shouldResumeAudio({
            pageVisible: document.visibilityState === "visible",
            contextState: context.state,
          })
        ) {
          void context.resume();
        }
      });

      onStatusRef.current("listening");
      return handles.current;
    } catch (err) {
      onStatusRef.current(statusFromGetUserMediaError(err));
      return null;
    }
  }, [stop]);

  const read = useCallback((): MicRead => {
    const h = handles.current;
    if (!h) return { kind: "inactive" };
    if (paused.current || h.context.state !== "running") return { kind: "paused" };
    h.analyser.getFloatTimeDomainData(h.buffer);
    return { buffer: h.buffer, sampleRate: h.context.sampleRate, kind: "frame" };
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      const h = handles.current;
      if (!h) return;
      if (document.visibilityState === "hidden") {
        paused.current = true;
        if (h.context.state === "running") void h.context.suspend();
        return;
      }
      paused.current = false;
      if (h.context.state !== "closed") void h.context.resume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onVisibility);
      stop();
    };
  }, [stop]);

  return { start, stop, read };
}
