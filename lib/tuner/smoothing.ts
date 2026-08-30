import { FREQ_EMA_ALPHA, NOTE_HYSTERESIS_CENTS, STALE_MS } from "./constants";
import { centsBetween } from "./theory";
import type { PitchEstimate } from "./pitch/yin";

export type SmoothedPitch = {
  hz: number;
  clarity: number;
  rms: number;
  updatedAt: number;
};

export type SmootherState = {
  current: SmoothedPitch | null;
};

export function createSmoother(): SmootherState {
  return { current: null };
}

export function pushPitch(
  state: SmootherState,
  estimate: PitchEstimate | null,
  now: number,
  alpha = FREQ_EMA_ALPHA,
): SmoothedPitch | null {
  if (!estimate) {
    if (state.current && now - state.current.updatedAt > STALE_MS) {
      state.current = null;
    }
    return state.current;
  }

  const prev = state.current;
  if (!prev) {
    state.current = { ...estimate, updatedAt: now };
    return state.current;
  }

  const jump = Math.abs(centsBetween(estimate.hz, prev.hz));
  if (jump > NOTE_HYSTERESIS_CENTS && estimate.clarity < prev.clarity + 0.04) {
    // Keep the last note, but do not refresh updatedAt. A weak wrong pitch
    // must not keep a stale reading alive past STALE_MS.
    return state.current;
  }

  const hz = jump > NOTE_HYSTERESIS_CENTS ? estimate.hz : prev.hz * (1 - alpha) + estimate.hz * alpha;
  state.current = {
    hz,
    clarity: prev.clarity * 0.6 + estimate.clarity * 0.4,
    rms: prev.rms * 0.6 + estimate.rms * 0.4,
    updatedAt: now,
  };
  return state.current;
}

export function isStale(state: SmootherState, now: number, staleMs = STALE_MS): boolean {
  if (!state.current) return true;
  return now - state.current.updatedAt > staleMs;
}
