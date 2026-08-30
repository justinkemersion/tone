import { describe, expect, it } from "vitest";
import {
  inspectMicCapability,
  isPageHidden,
  parsePermissionState,
  shouldAutostartMic,
  shouldResumeAudio,
  statusFromCapability,
  statusFromGetUserMediaError,
} from "./mic";

describe("inspectMicCapability", () => {
  const ok = {
    isSecureContext: true,
    hasMediaDevices: true,
    hasGetUserMedia: true,
    hasAudioContext: true,
  };

  it("is ok when the browser can capture audio securely", () => {
    expect(inspectMicCapability(ok)).toBe("ok");
    expect(statusFromCapability("ok")).toBeNull();
  });

  it("flags insecure contexts instead of pretending getUserMedia will work", () => {
    expect(inspectMicCapability({ ...ok, isSecureContext: false })).toBe("insecure");
    expect(statusFromCapability("insecure")).toBe("unsupported");
  });

  it("flags missing capture APIs as unsupported", () => {
    expect(inspectMicCapability({ ...ok, hasGetUserMedia: false })).toBe("unsupported");
    expect(inspectMicCapability({ ...ok, hasAudioContext: false })).toBe("unsupported");
    expect(statusFromCapability("unsupported")).toBe("unsupported");
  });
});

describe("statusFromGetUserMediaError", () => {
  it("maps permission, device, and security failures", () => {
    expect(statusFromGetUserMediaError(new DOMException("denied", "NotAllowedError"))).toBe(
      "permission-denied",
    );
    expect(statusFromGetUserMediaError(new DOMException("none", "NotFoundError"))).toBe(
      "unavailable",
    );
    expect(statusFromGetUserMediaError(new DOMException("http", "SecurityError"))).toBe(
      "unsupported",
    );
    expect(statusFromGetUserMediaError(new DOMException("busy", "NotReadableError"))).toBe(
      "init-failed",
    );
    expect(statusFromGetUserMediaError(new Error("boom"))).toBe("init-failed");
    expect(statusFromGetUserMediaError("nope")).toBe("init-failed");
  });
});

describe("permission autostart", () => {
  it("starts only after a prior grant, never on prompt or unknown", () => {
    expect(parsePermissionState("granted")).toBe("granted");
    expect(parsePermissionState("denied")).toBe("denied");
    expect(parsePermissionState("prompt")).toBe("prompt");
    expect(parsePermissionState("prompted")).toBe("unknown");
    expect(shouldAutostartMic("granted")).toBe(true);
    expect(shouldAutostartMic("prompt")).toBe(false);
    expect(shouldAutostartMic("denied")).toBe(false);
    expect(shouldAutostartMic("unknown")).toBe(false);
  });
});

describe("audio lifecycle", () => {
  it("resumes a suspended context only while the tab is visible", () => {
    expect(shouldResumeAudio({ pageVisible: true, contextState: "suspended" })).toBe(true);
    expect(shouldResumeAudio({ pageVisible: true, contextState: "interrupted" })).toBe(true);
    expect(shouldResumeAudio({ pageVisible: true, contextState: "running" })).toBe(false);
    expect(shouldResumeAudio({ pageVisible: false, contextState: "suspended" })).toBe(false);
  });

  it("treats hidden documents as paused detection", () => {
    expect(isPageHidden("hidden")).toBe(true);
    expect(isPageHidden("visible")).toBe(false);
    expect(isPageHidden(undefined)).toBe(false);
  });
});
