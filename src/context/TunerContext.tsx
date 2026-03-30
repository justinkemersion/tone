"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import type { TunerStatus } from "@/hooks/useTuner";
import type { OpenStringTarget, TuningConfig } from "@/lib/tuning/types";

export type TunerActiveMode = "listen" | "play";

export type TunerContextValue = {
  activeMode: TunerActiveMode;
  setActiveMode: (mode: TunerActiveMode) => void;
  currentTuning: TuningConfig;
  tuningId: string;
  setTuningId: (id: string) => void;
  tuningList: typeof TUNING_LIBRARY;
  openStrings: OpenStringTarget[];
  activeNote: string | null;
  activeStringIndex: number | null;
  playOpenString: (stringIndex: number) => void;
  stopReference: () => void;
  muteAll: () => void;
  referencePlaying: boolean;
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
  const [activeMode, setActiveModeState] = useState<TunerActiveMode>("listen");

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

  const setTuningId = useCallback((id: string) => {
    setTuningIdState(id);
  }, []);

  const setActiveMode = useCallback(
    (mode: TunerActiveMode) => {
      setActiveModeState((prev) => {
        if (mode === prev) return prev;
        if (mode === "listen") {
          suspendOutput();
        } else {
          stopListen();
        }
        return mode;
      });
    },
    [stopListen, suspendOutput]
  );

  useEffect(() => {
    if (activeMode !== "play") return;
    stopSmooth();
  }, [tuningId, activeMode, stopSmooth]);

  const playOpenString = useCallback(
    (stringIndex: number) => {
      if (activeMode !== "play") return;
      const target = openStrings.find((s) => s.stringIndex === stringIndex);
      if (!target) return;
      void playString({
        frequencyHz: target.hz,
        note: target.note,
        stringIndex,
      });
    },
    [activeMode, openStrings, playString]
  );

  const stopReference = useCallback(() => {
    stopSmooth();
  }, [stopSmooth]);

  const muteAll = useCallback(() => {
    stopListen();
    disposeOutput();
  }, [disposeOutput, stopListen]);

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
      openStrings,
      activeNote,
      activeStringIndex,
      playOpenString,
      stopReference,
      muteAll,
      referencePlaying,
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
      frequencyHz,
      inTune,
      muteAll,
      referencePlaying,
      noteLabel,
      openStrings,
      playOpenString,
      setActiveMode,
      setTuningId,
      start,
      status,
      stopListen,
      stopReference,
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
