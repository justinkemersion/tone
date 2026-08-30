"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MicGate } from "./MicGate";
import { NoteDisplay } from "./NoteDisplay";
import { StringTargets } from "./StringTargets";
import { TunerNeedle } from "./TunerNeedle";
import { TuningBar, type TuningOption } from "./TuningBar";
import { useMicCapture } from "./useMicCapture";
import { useReferenceTone } from "./useReferenceTone";
import { createTunerEngine, ingestFrame } from "@/lib/tuner/engine";
import {
  emptyTunerView,
  liveRegionMessage,
  sameTunerView,
  type MicStatus,
  type TunerMode,
  type TunerView,
} from "@/lib/tuner/state";
import {
  parsePermissionState,
  shouldAutostartMic,
} from "@/lib/tuner/mic";
import { resolveOpenStrings, resolvePreset, TUNING_PRESETS } from "@/lib/tuner/presets";
import {
  DEFAULT_LOCAL_PREFS,
  patchStoredPrefs,
  readStoredPrefs,
  type LocalPrefs,
} from "@/lib/tuner/local-prefs";

export function TunerApp({
  initialPrefs,
  extraTunings = [],
}: {
  initialPrefs?: Partial<LocalPrefs>;
  extraTunings?: TuningOption[];
}) {
  const prefs = useMemo(
    () => ({ ...DEFAULT_LOCAL_PREFS, ...initialPrefs }),
    [initialPrefs],
  );
  const engineRef = useRef(createTunerEngine({ mode: prefs.mode, referenceHz: prefs.referenceHz }));
  const [tuningId, setTuningId] = useState(prefs.tuningId);
  const [mode, setMode] = useState<TunerMode>(prefs.mode);
  const [view, setView] = useState<TunerView>(() => emptyTunerView("idle", prefs.mode));
  const [playing, setPlaying] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const applyView = useCallback((next: TunerView) => {
    setView((prev) => (sameTunerView(prev, next) ? prev : next));
  }, []);

  const onMicStatus = useCallback((mic: MicStatus) => {
    engineRef.current.mic = mic;
    engineRef.current.smoother.current = null;
    applyView(emptyTunerView(mic, engineRef.current.mode));
  }, [applyView]);

  useEffect(() => {
    const stored = readStoredPrefs();
    if (stored) {
      setTuningId(stored.tuningId);
      setMode(stored.mode);
      engineRef.current.referenceHz = stored.referenceHz;
      engineRef.current.mode = stored.mode;
    }
    setHydrated(true);
  }, []);
  const { start, stop, read } = useMicCapture(onMicStatus);
  const reference = useReferenceTone();

  const options = useMemo<TuningOption[]>(
    () => [...TUNING_PRESETS, ...extraTunings],
    [extraTunings],
  );
  const preset = useMemo(() => {
    const found = options.find((t) => t.id === tuningId);
    return found ? { ...resolvePreset("standard"), ...found, notes: found.notes } : resolvePreset(tuningId);
  }, [options, tuningId]);
  const strings = useMemo(
    () => resolveOpenStrings(preset.notes, engineRef.current.referenceHz),
    [preset],
  );

  useEffect(() => {
    engineRef.current.mode = mode;
  }, [mode]);

  useEffect(() => {
    if (!hydrated) return;
    patchStoredPrefs(
      {
        tuningId,
        mode,
        referenceHz: engineRef.current.referenceHz,
      },
      prefs,
    );
  }, [tuningId, mode, prefs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const boot = async () => {
      try {
        const query = navigator.permissions?.query;
        if (!query) return;
        const perm = await query({ name: "microphone" as PermissionName });
        if (cancelled || !shouldAutostartMic(parsePermissionState(perm.state))) return;
        if (engineRef.current.mic === "idle") await start();
      } catch {
        /* Permissions API missing — wait for an explicit tap. */
      }
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, [hydrated, start]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const frame = read();
      if (frame.kind === "frame") {
        applyView(
          ingestFrame(
            engineRef.current,
            frame.buffer,
            frame.sampleRate,
            performance.now(),
            preset,
          ),
        );
      } else if (frame.kind === "paused" && engineRef.current.mic === "listening") {
        engineRef.current.smoother.current = null;
        applyView(emptyTunerView("listening", engineRef.current.mode));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [preset, read, applyView]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (engineRef.current.mic !== "listening") return;
      stop();
      engineRef.current.mic = "idle";
      applyView(emptyTunerView("idle", engineRef.current.mode));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyView, stop]);

  const announcement = liveRegionMessage(view);

  function onStop() {
    reference.stop();
    stop();
    engineRef.current.muted = false;
    engineRef.current.mic = "idle";
    engineRef.current.smoother.current = null;
    setPlaying(null);
    applyView(emptyTunerView("idle", mode));
  }

  async function onPlay(index: number) {
    const s = strings[index];
    if (!s) return;
    engineRef.current.muted = true;
    engineRef.current.smoother.current = null;
    applyView(emptyTunerView("listening", mode));
    setPlaying(index);
    await reference.play(s.note, engineRef.current.referenceHz);
    window.setTimeout(() => {
      engineRef.current.muted = false;
      setPlaying(null);
    }, 1900);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-3xl flex-col justify-center gap-5 px-4 py-5 sm:gap-8 sm:py-8">
      <NoteDisplay view={view} />
      <TunerNeedle cents={view.cents} intonation={view.intonation} held={view.held} />
      {mode === "guitar" ? (
        <StringTargets
          strings={strings}
          activeIndex={view.target?.index ?? null}
          playingIndex={playing}
          onSelect={onPlay}
        />
      ) : null}
      <MicGate mic={view.mic} onStart={() => void start()} onStop={onStop} />
      <TuningBar
        options={options}
        selectedId={tuningId}
        mode={mode}
        onSelect={setTuningId}
        onMode={setMode}
      />
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
