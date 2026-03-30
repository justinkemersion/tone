"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTuner, type UseTunerResult } from "@/hooks/useTuner";
import {
  DEFAULT_TUNING_ID,
  getTuningById,
  TUNINGS,
} from "@/lib/tuning/tunings";
import type { TuningConfig } from "@/lib/tuning/types";

export type TunerContextValue = UseTunerResult & {
  tuningId: string;
  setTuningId: (id: string) => void;
  tuning: TuningConfig;
  tuningList: readonly TuningConfig[];
};

const TunerContext = createContext<TunerContextValue | null>(null);

export function TunerProvider({ children }: { children: ReactNode }) {
  const [tuningId, setTuningIdState] = useState(DEFAULT_TUNING_ID);
  const tuning = useMemo(
    () => getTuningById(tuningId) ?? TUNINGS[0],
    [tuningId]
  );

  const tuner = useTuner({ tuning });

  const setTuningId = useCallback((id: string) => {
    setTuningIdState(id);
  }, []);

  const value = useMemo<TunerContextValue>(
    () => ({
      ...tuner,
      tuningId,
      setTuningId,
      tuning,
      tuningList: TUNINGS,
    }),
    [tuner, tuningId, setTuningId, tuning]
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
