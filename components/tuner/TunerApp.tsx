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
import { liveRegionMessage, type MicStatus, type TunerMode, type TunerView } from "@/lib/tuner/state";
import { resolveOpenStrings, resolvePreset, TUNING_PRESETS } from "@/lib/tuner/presets";
import {
  DEFAULT_LOCAL_PREFS,
  patchStoredPrefs,
  readStoredPrefs,
  type LocalPrefs,
} from "@/lib/tuner/local-prefs";

const idleView = (mic: MicStatus, mode: TunerMode): TunerView => ({
  mic,
  mode,
  intonation: "none",
  hz: null,
  cents: null,
  note: null,
  target: null,
  confidence: 0,
  amplitude: 0,
  stale: true,
});

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
  const [view, setView] = useState<TunerView>(() => idleView("idle", prefs.mode));
  const [playing, setPlaying] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

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
  const { start, read } = useMicCapture(
    useCallback((mic: MicStatus) => {
      engineRef.current.mic = mic;
      setView((v) => ({ ...v, mic }));
    }, []),
  );
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
    let raf = 0;
    const tick = () => {
      const frame = read();
      if (frame) {
        const next = ingestFrame(
          engineRef.current,
          frame.buffer,
          frame.sampleRate,
          performance.now(),
          preset,
        );
        setView(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [preset, read]);

  const announcement = liveRegionMessage(view);

  async function onPlay(index: number) {
    const s = strings[index];
    if (!s) return;
    engineRef.current.muted = true;
    setPlaying(index);
    await reference.play(s.note, engineRef.current.referenceHz);
    window.setTimeout(() => {
      engineRef.current.muted = false;
      setPlaying(null);
    }, 1900);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-3xl flex-col justify-center gap-8 px-4 py-8">
      <NoteDisplay view={view} />
      <TunerNeedle cents={view.cents} intonation={view.intonation} />
      {mode === "guitar" ? (
        <StringTargets
          strings={strings}
          activeIndex={view.target?.index ?? null}
          playingIndex={playing}
          onSelect={onPlay}
        />
      ) : null}
      <MicGate mic={view.mic} onStart={() => void start()} />
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
