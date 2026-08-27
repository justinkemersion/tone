"use client";

import { useEffect } from "react";
import type { ThemePreference } from "@/lib/types/tone";
import { readStoredPrefs } from "@/lib/tuner/local-prefs";

export function applyTheme(theme: ThemePreference) {
  const dark =
    theme === "dark" ||
    (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function ThemeRuntime({ theme }: { theme: ThemePreference }) {
  useEffect(() => {
    const stored = readStoredPrefs();
    const resolved = stored?.theme ?? theme;
    applyTheme(resolved);
    if (resolved !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);
  return null;
}
