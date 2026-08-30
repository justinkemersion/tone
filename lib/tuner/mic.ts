import type { MicStatus } from "./state";

export type MicCapability = "ok" | "unsupported" | "insecure";

export type MicCapabilityInput = {
  isSecureContext: boolean;
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  hasAudioContext: boolean;
};

export type MicPermissionState = "granted" | "denied" | "prompt" | "unknown";

export type MicRead =
  | { kind: "inactive" }
  | { kind: "paused" }
  | { kind: "frame"; buffer: Float32Array; sampleRate: number };

export function inspectMicCapability(input: MicCapabilityInput): MicCapability {
  if (!input.isSecureContext) return "insecure";
  if (!input.hasMediaDevices || !input.hasGetUserMedia || !input.hasAudioContext) {
    return "unsupported";
  }
  return "ok";
}

export function inspectBrowserMicCapability(): MicCapability {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "unsupported";
  }
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return inspectMicCapability({
    isSecureContext: window.isSecureContext,
    hasMediaDevices: Boolean(navigator.mediaDevices),
    hasGetUserMedia: typeof navigator.mediaDevices?.getUserMedia === "function",
    hasAudioContext: typeof Ctor === "function",
  });
}

export function statusFromCapability(capability: MicCapability): Extract<
  MicStatus,
  "unsupported"
> | null {
  return capability === "ok" ? null : "unsupported";
}

export function statusFromGetUserMediaError(err: unknown): Extract<
  MicStatus,
  "permission-denied" | "unavailable" | "init-failed" | "unsupported"
> {
  const name =
    err instanceof DOMException ? err.name : err instanceof Error ? err.name : "";
  if (name === "SecurityError") return "unsupported";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "permission-denied";
  }
  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError" ||
    name === "OverconstrainedError"
  ) {
    return "unavailable";
  }
  return "init-failed";
}

export function parsePermissionState(state: string | undefined | null): MicPermissionState {
  if (state === "granted" || state === "denied" || state === "prompt") return state;
  return "unknown";
}

export function shouldAutostartMic(permission: MicPermissionState): boolean {
  return permission === "granted";
}

export function shouldResumeAudio(input: {
  pageVisible: boolean;
  contextState: string;
}): boolean {
  return (
    input.pageVisible &&
    (input.contextState === "suspended" || input.contextState === "interrupted")
  );
}

export function isPageHidden(visibilityState: string | undefined | null): boolean {
  return visibilityState === "hidden";
}
