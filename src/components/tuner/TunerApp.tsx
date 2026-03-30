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
    referenceCycleSeconds,
    setReferenceCycleSeconds,
    referenceCycleRunning,
    startReferenceCycle,
    stopReferenceCycle,
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
                      cents deviation for the nearest semitone. The readout
                      holds briefly as the note decays so you can adjust.
                    </>
                  ) : (
                    <>
                      Tap a string for a reference tone, or use{" "}
                      <span className="text-zinc-400">Play cycle</span> to move
                      low → high through all strings, then repeat.
                    </>
                  )}
                </p>

                {activeMode === "play" ? (
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-md">
                    <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                      String cycle
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                      How long each string plays before advancing (then starts
                      over at the low string).
                    </p>
                    <label
                      htmlFor="ref-cycle-seconds"
                      className="mt-3 block text-[11px] font-medium text-zinc-500"
                    >
                      Seconds per string
                    </label>
                    <input
                      id="ref-cycle-seconds"
                      type="number"
                      min={0.5}
                      max={60}
                      step={0.5}
                      disabled={referenceCycleRunning}
                      value={referenceCycleSeconds}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setReferenceCycleSeconds(
                          Number.isFinite(v) ? v : referenceCycleSeconds
                        );
                      }}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700/90 bg-zinc-950/60 px-3 py-2.5 font-mono text-sm tabular-nums text-zinc-100 outline-none focus:border-zinc-500 disabled:opacity-50"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={referenceCycleRunning}
                        onClick={startReferenceCycle}
                        className="rounded-lg border border-emerald-600/50 bg-emerald-600/15 px-4 py-2.5 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Play cycle
                      </button>
                      {referenceCycleRunning ? (
                        <button
                          type="button"
                          onClick={stopReferenceCycle}
                          className="rounded-lg border border-zinc-600 bg-zinc-800/60 px-4 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-md transition-colors hover:border-zinc-500"
                        >
                          Stop cycle
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
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

                <div className="mt-2 text-center">
                  <p className="text-[11px] font-medium tracking-wide text-zinc-600 uppercase">
                    Preset
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-300">
                    {currentTuning.name}
                  </p>
                  {currentTuning.subtitle ? (
                    <p className="mt-1 px-2 text-[11px] leading-snug text-zinc-500">
                      {currentTuning.subtitle}
                    </p>
                  ) : null}
                </div>
              </motion.section>
            </div>

            <section>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Strings
                </h2>
                <span className="text-xs text-zinc-600">
                  {activeMode === "play"
                    ? "Tap a string or use Play cycle"
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
              ) : referencePlaying || referenceCycleRunning ? (
                <button
                  type="button"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800/60 px-4 py-3.5 text-sm font-medium text-zinc-100 backdrop-blur-md transition-colors hover:border-zinc-500 sm:w-auto sm:min-w-[200px]"
                  onClick={stopReference}
                >
                  {referenceCycleRunning
                    ? "Stop reference / cycle"
                    : "Stop reference tone"}
                </button>
              ) : (
                <p className="flex w-full items-center rounded-lg border border-dashed border-zinc-700/80 bg-zinc-900/30 px-4 py-3.5 text-sm text-zinc-500 sm:w-auto">
                  Tap a string or start Play cycle in the sidebar.
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
