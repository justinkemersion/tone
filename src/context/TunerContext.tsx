"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReferenceTone } from "@/hooks/useReferenceTone";
import { useTuner } from "@/hooks/useTuner";
import {
  DEFAULT_TUNING_ID,
  getTuningById,
  REFERENCE_A4_HZ,
  TUNING_LIBRARY,
} from "@/lib/tuning/tuning-library";
import { useFavoriteTunings } from "@/hooks/useFavoriteTunings";
import type { TunerStatus } from "@/hooks/useTuner";
import type { OpenStringTarget, TuningPreset } from "@/lib/tuning/types";

export type TunerActiveMode = "listen" | "play";

export type TunerContextValue = {
  activeMode: TunerActiveMode;
  setActiveMode: (mode: TunerActiveMode) => void;
  currentTuning: TuningPreset;
  tuningId: string;
  setTuningId: (id: string) => void;
  tuningList: typeof TUNING_LIBRARY;
  favoriteTuningIds: readonly string[];
  toggleFavoriteTuning: (id: string) => void;
  isFavoriteTuning: (id: string) => boolean;
  openStrings: OpenStringTarget[];
  activeNote: string | null;
  activeStringIndex: number | null;
  playOpenString: (stringIndex: number) => void;
  stopReference: () => void;
  muteAll: () => void;
  referencePlaying: boolean;
  /** Seconds each string sounds before advancing (reference cycle). */
  referenceCycleSeconds: number;
  setReferenceCycleSeconds: (seconds: number) => void;
  referenceCycleRunning: boolean;
  startReferenceCycle: () => void;
  stopReferenceCycle: () => void;
  status: TunerStatus;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  frequencyHz: number | null;
  noteLabel: string | null;
  cents: number | null;
  inTune: boolean;
};

const TunerContext = createContext<TunerContextValue | null>(null);

export function TunerProvider({ children }: { children: ReactNode }) {
  const [tuningId, setTuningIdState] = useState(DEFAULT_TUNING_ID);
  const [activeMode, setActiveModeState] = useState<TunerActiveMode>("play");
  const [referenceCycleSeconds, setReferenceCycleSecondsState] = useState(4);
  const [referenceCycleRunning, setReferenceCycleRunning] = useState(false);

  const cycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRunningRef = useRef(false);
  const openStringsRef = useRef<OpenStringTarget[]>([]);

  const {
    favoriteTuningIds,
    toggleFavoriteTuning,
    isFavoriteTuning,
  } = useFavoriteTunings();

  const currentTuning = useMemo(
    () => getTuningById(tuningId) ?? TUNING_LIBRARY[0],
    [tuningId]
  );

  const {
    status,
    error,
    start,
    stop: stopListen,
    frequencyHz,
    noteLabel,
    cents,
    inTune,
    openStrings,
  } = useTuner({
    tuning: currentTuning,
    referenceHz: REFERENCE_A4_HZ,
  });

  const {
    playString,
    stopSmooth,
    suspendOutput,
    disposeOutput,
    activeNote: referenceNote,
    activeStringIndex: referenceStringIndex,
    isPlaying: referencePlaying,
  } = useReferenceTone();

  useEffect(() => {
    openStringsRef.current = openStrings;
  }, [openStrings]);

  const clearCycleTimer = useCallback(() => {
    if (cycleTimeoutRef.current != null) {
      clearTimeout(cycleTimeoutRef.current);
      cycleTimeoutRef.current = null;
    }
    cycleRunningRef.current = false;
    queueMicrotask(() => {
      setReferenceCycleRunning(false);
    });
  }, []);

  const setTuningId = useCallback((id: string) => {
    setTuningIdState(id);
  }, []);

  const setActiveMode = useCallback((mode: TunerActiveMode) => {
    setActiveModeState((prev) => (mode === prev ? prev : mode));
  }, []);

  const prevModeRef = useRef<TunerActiveMode>("play");
  useEffect(() => {
    const prev = prevModeRef.current;
    if (activeMode === prev) return;
    prevModeRef.current = activeMode;
    if (activeMode === "listen" && prev === "play") {
      clearCycleTimer();
      suspendOutput();
    }
    if (activeMode === "play" && prev === "listen") {
      stopListen();
    }
  }, [activeMode, clearCycleTimer, stopListen, suspendOutput]);

  const stopReferenceCycle = useCallback(() => {
    clearCycleTimer();
    stopSmooth();
  }, [clearCycleTimer, stopSmooth]);

  const startReferenceCycle = useCallback(() => {
    if (activeMode !== "play") return;
    clearCycleTimer();
    const strings = openStringsRef.current;
    if (strings.length === 0) return;
    const sec = Math.min(60, Math.max(0.5, referenceCycleSeconds));
    cycleRunningRef.current = true;
    setReferenceCycleRunning(true);

    let idx = 0;
    const step = () => {
      if (!cycleRunningRef.current) return;
      const list = openStringsRef.current;
      if (list.length === 0) {
        clearCycleTimer();
        stopSmooth();
        return;
      }
      const t = list[idx % list.length];
      void playString({
        frequencyHz: t.hz,
        note: t.note,
        stringIndex: t.stringIndex,
      });
      cycleTimeoutRef.current = setTimeout(() => {
        if (!cycleRunningRef.current) return;
        idx = (idx + 1) % list.length;
        step();
      }, sec * 1000);
    };
    step();
  }, [
    activeMode,
    clearCycleTimer,
    playString,
    referenceCycleSeconds,
    stopSmooth,
  ]);

  useEffect(() => {
    if (activeMode !== "play") return;
    clearCycleTimer();
    stopSmooth();
  }, [tuningId, activeMode, stopSmooth, clearCycleTimer]);

  const playOpenString = useCallback(
    (stringIndex: number) => {
      if (activeMode !== "play") return;
      clearCycleTimer();
      const target = openStrings.find((s) => s.stringIndex === stringIndex);
      if (!target) return;
      void playString({
        frequencyHz: target.hz,
        note: target.note,
        stringIndex,
      });
    },
    [activeMode, clearCycleTimer, openStrings, playString]
  );

  const stopReference = stopReferenceCycle;

  const setReferenceCycleSeconds = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds)) return;
    setReferenceCycleSecondsState(seconds);
  }, []);

  const muteAll = useCallback(() => {
    clearCycleTimer();
    stopListen();
    disposeOutput();
  }, [clearCycleTimer, disposeOutput, stopListen]);

  useEffect(() => () => clearCycleTimer(), [clearCycleTimer]);

  const activeNote =
    activeMode === "listen" ? noteLabel : referenceNote;

  const activeStringIndex =
    activeMode === "play" ? referenceStringIndex : null;

  const value = useMemo<TunerContextValue>(
    () => ({
      activeMode,
      setActiveMode,
      currentTuning,
      tuningId,
      setTuningId,
      tuningList: TUNING_LIBRARY,
      favoriteTuningIds,
      toggleFavoriteTuning,
      isFavoriteTuning,
      openStrings,
      activeNote,
      activeStringIndex,
      playOpenString,
      stopReference,
      muteAll,
      referencePlaying,
      referenceCycleSeconds,
      setReferenceCycleSeconds,
      referenceCycleRunning,
      startReferenceCycle,
      stopReferenceCycle,
      status,
      error,
      start,
      stop: stopListen,
      frequencyHz,
      noteLabel,
      cents,
      inTune,
    }),
    [
      activeMode,
      activeNote,
      activeStringIndex,
      cents,
      currentTuning,
      error,
      favoriteTuningIds,
      frequencyHz,
      inTune,
      isFavoriteTuning,
      muteAll,
      referencePlaying,
      referenceCycleRunning,
      referenceCycleSeconds,
      setReferenceCycleSeconds,
      startReferenceCycle,
      stopReferenceCycle,
      noteLabel,
      openStrings,
      playOpenString,
      setActiveMode,
      setTuningId,
      start,
      status,
      stopListen,
      stopReference,
      toggleFavoriteTuning,
      tuningId,
    ]
  );

  return (
    <TunerContext.Provider value={value}>{children}</TunerContext.Provider>
  );
}

export function useTunerContext(): TunerContextValue {
  const ctx = useContext(TunerContext);
  if (!ctx) {
    throw new Error("useTunerContext must be used within TunerProvider");
  }
  return ctx;
}
