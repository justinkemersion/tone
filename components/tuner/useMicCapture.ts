"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MicStatus } from "@/lib/tuner/state";

type AudioHandles = {
  context: AudioContext;
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  buffer: Float32Array<ArrayBuffer>;
};

export function useMicCapture(onStatus: (status: MicStatus) => void) {
  const handles = useRef<AudioHandles | null>(null);
  const raf = useRef<number>(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const h = handles.current;
    handles.current = null;
    if (!h) return;
    h.source.disconnect();
    h.analyser.disconnect();
    for (const track of h.stream.getTracks()) track.stop();
    void h.context.close();
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    stop();
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      onStatus("unavailable");
      return null;
    }
    onStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new Ctor();
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      const buffer = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));
      handles.current = { context, stream, source, analyser, buffer };
      onStatus("listening");
      return handles.current;
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        onStatus("permission-denied");
      } else if (name === "NotFoundError") {
        onStatus("unavailable");
      } else {
        onStatus("init-failed");
      }
      return null;
    }
  }, [onStatus, stop]);

  const read = useCallback((): { buffer: Float32Array; sampleRate: number } | null => {
    const h = handles.current;
    if (!h) return null;
    h.analyser.getFloatTimeDomainData(h.buffer);
    return { buffer: h.buffer, sampleRate: h.context.sampleRate };
  }, []);

  return { start, stop, read };
}
