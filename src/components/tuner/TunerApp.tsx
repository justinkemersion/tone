"use client";

import { LayoutGroup, motion } from "framer-motion";
import { ModeToggle } from "@/components/tuner/ModeToggle";
import { StringGrid } from "@/components/tuner/StringGrid";
import { TunerArc } from "@/components/tuner/TunerArc";
import { PresetSelector } from "@/components/tuner/PresetSelector";
import { useTunerContext } from "@/context/TunerContext";

function formatHz(hz: number | null): string {
  if (hz == null || !Number.isFinite(hz)) return "—";
  return `${hz.toFixed(1)} Hz`;
}

export function TunerApp() {
  const {
    activeMode,
    setActiveMode,
    status,
    error,
    start,
    stop,
    frequencyHz,
    cents,
    inTune,
    tuningId,
    setTuningId,
    tuningList,
    favoriteTuningIds,
    toggleFavoriteTuning,
    isFavoriteTuning,
    currentTuning,
    openStrings,
    activeNote,
    activeStringIndex,
    playOpenString,
    stopReference,
    muteAll,
    referencePlaying,
  } = useTunerContext();

  const listening = status === "running";
  const busy = status === "starting";
  const listenActive = activeMode === "listen" && listening;

  const displayHz =
    activeMode === "listen"
      ? frequencyHz
      : activeStringIndex != null
        ? openStrings.find((s) => s.stringIndex === activeStringIndex)?.hz ??
          null
        : null;

  return (
    <div className="min-h-dvh bg-zinc-950 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(39,39,42,0.9),transparent)] text-zinc-100">
      <LayoutGroup>
        <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <header className="border-b border-zinc-800/80 pb-8">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500 uppercase">
              Tone
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              Guitar tuner
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
              Listen with the mic or play reference tones from your tuning
              preset. A4 = 440 Hz — detection and tones use the same library.
            </p>
          </header>

          <div className="mt-8 flex flex-1 flex-col gap-5 lg:gap-6">
            <ModeToggle mode={activeMode} onChange={setActiveMode} />

            <div className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-12 md:gap-5 lg:gap-6">
              <motion.aside
                layout
                className="flex flex-col gap-5 md:col-span-4 lg:col-span-4"
              >
                <PresetSelector
                  presets={tuningList}
                  value={tuningId}
                  onChange={setTuningId}
                  favoriteTuningIds={favoriteTuningIds}
                  toggleFavoriteTuning={toggleFavoriteTuning}
                  isFavoriteTuning={isFavoriteTuning}
                />
                <p className="rounded-xl border border-zinc-800/70 bg-zinc-900/35 p-4 text-xs leading-relaxed text-zinc-500 backdrop-blur-md">
                  {activeMode === "listen" ? (
                    <>
                      Microphone analyzes pitch in real time. The arc maps
                      cents deviation for the nearest semitone.
                    </>
                  ) : (
                    <>
                      Tap a string to hear a continuous triangle-wave reference.
                      One tone at a time, with fade in/out to avoid clicks.
                    </>
                  )}
                </p>
              </motion.aside>

              <motion.section
                layout
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-8 md:col-span-8 lg:col-span-8"
              >
                <div className="text-center">
                  <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                    {activeMode === "listen" ? "Detected" : "Reference"}
                  </p>
                  <p
                    className="mt-3 font-mono text-5xl font-semibold tabular-nums tracking-tight text-zinc-50 sm:text-6xl"
                    aria-live="polite"
                  >
                    {activeNote ?? "—"}
                  </p>
                  <p className="mt-4 font-mono text-lg tabular-nums text-zinc-400">
                    {formatHz(displayHz)}
                  </p>
                </div>

                <div className="mt-8">
                  <TunerArc
                    cents={cents}
                    inTune={inTune}
                    listenActive={listenActive}
                  />
                </div>

                <p className="mt-6 text-center font-mono text-sm tabular-nums text-zinc-500">
                  {listenActive && cents != null && Number.isFinite(cents) ? (
                    <>
                      {cents > 0 ? "+" : ""}
                      {cents.toFixed(1)} cents
                    </>
                  ) : activeMode === "play" ? (
                    "Reference mode — arc idle"
                  ) : (
                    "Start listening to see cents"
                  )}
                </p>

                <p className="mt-2 text-center text-xs text-zinc-600">
                  Preset:{" "}
                  <span className="text-zinc-400">{currentTuning.name}</span>
                </p>
              </motion.section>
            </div>

            <section>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Strings
                </h2>
                <span className="text-xs text-zinc-600">
                  {activeMode === "play"
                    ? "Tap to play"
                    : "Reference mode only"}
                </span>
              </div>
              <StringGrid
                tuningKey={tuningId}
                strings={openStrings}
                mode={activeMode}
                activeStringIndex={activeStringIndex}
                onStringPress={playOpenString}
              />
            </section>

            {error ? (
              <p
                className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200 backdrop-blur-md"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-auto flex flex-col gap-3 border-t border-zinc-800/80 pt-6 sm:flex-row sm:flex-wrap">
              {activeMode === "listen" ? (
                !listening ? (
                  <button
                    type="button"
                    className="w-full rounded-lg border border-emerald-600/50 bg-emerald-600/15 px-4 py-3.5 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
                    onClick={() => void start()}
                    disabled={busy}
                  >
                    {busy ? "Starting…" : "Start microphone"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800/60 px-4 py-3.5 text-sm font-medium text-zinc-100 backdrop-blur-md transition-colors hover:border-zinc-500 sm:w-auto sm:min-w-[200px]"
                    onClick={stop}
                  >
                    Stop microphone
                  </button>
                )
              ) : referencePlaying ? (
                <button
                  type="button"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800/60 px-4 py-3.5 text-sm font-medium text-zinc-100 backdrop-blur-md transition-colors hover:border-zinc-500 sm:w-auto sm:min-w-[200px]"
                  onClick={stopReference}
                >
                  Stop reference tone
                </button>
              ) : (
                <p className="flex w-full items-center rounded-lg border border-dashed border-zinc-700/80 bg-zinc-900/30 px-4 py-3.5 text-sm text-zinc-500 sm:w-auto">
                  Select a string above to hear its pitch.
                </p>
              )}

              <button
                type="button"
                className="w-full rounded-lg border border-red-900/50 bg-red-950/35 px-4 py-3.5 text-sm font-medium text-red-100/90 backdrop-blur-md transition-colors hover:border-red-800/70 hover:bg-red-950/50 sm:ml-auto sm:w-auto"
                onClick={muteAll}
              >
                Mute all
              </button>
            </div>
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
}
