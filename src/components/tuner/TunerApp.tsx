"use client";

import { TunerMeter } from "@/components/tuner/TunerMeter";
import { TuningSelector } from "@/components/tuner/TuningSelector";
import { useTunerContext } from "@/context/TunerContext";

function formatHz(hz: number | null): string {
  if (hz == null || !Number.isFinite(hz)) return "—";
  return `${hz.toFixed(1)} Hz`;
}

export function TunerApp() {
  const {
    status,
    error,
    start,
    stop,
    frequencyHz,
    noteLabel,
    cents,
    inTune,
    tuningId,
    setTuningId,
    tuning,
    tuningList,
    openStrings,
  } = useTunerContext();

  const listening = status === "running";
  const busy = status === "starting";

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10 sm:px-8">
        <header className="mb-12 border-b border-neutral-200 pb-8">
          <p className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">
            Tone
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Guitar tuner
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
            Chromatic readout with equal temperament. Choose a tuning preset to
            see open-string targets; the meter tracks the nearest semitone.
          </p>
        </header>

        <main className="flex flex-1 flex-col gap-10">
          <TuningSelector
            value={tuningId}
            onChange={setTuningId}
            options={tuningList}
          />

          <section className="border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="text-center">
              <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                Note
              </p>
              <p
                className="mt-2 font-mono text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl"
                aria-live="polite"
              >
                {noteLabel ?? "—"}
              </p>
              <p className="mt-4 font-mono text-lg tabular-nums text-neutral-700">
                {formatHz(frequencyHz)}
              </p>
            </div>

            <div className="mt-10">
              <TunerMeter cents={cents} inTune={inTune} />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
              Open strings ({tuning.name})
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {openStrings.map((s) => (
                <li
                  key={s.stringIndex}
                  className="flex items-baseline justify-between border border-neutral-200 bg-white px-3 py-2.5"
                >
                  <span className="text-xs text-neutral-500">
                    Str. {s.stringIndex}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-neutral-900">
                    {s.note}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {error ? (
            <p
              className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row">
            {!listening ? (
              <button
                type="button"
                className="w-full border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void start()}
                disabled={busy}
              >
                {busy ? "Starting…" : "Use microphone"}
              </button>
            ) : (
              <button
                type="button"
                className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900"
                onClick={stop}
              >
                Stop
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
