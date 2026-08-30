import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteDisplay } from "./NoteDisplay";
import { MicGate } from "./MicGate";
import { TunerNeedle } from "./TunerNeedle";
import { TuningBar } from "./TuningBar";
import { emptyTunerView, type TunerView } from "@/lib/tuner/state";

function view(partial: Partial<TunerView>): TunerView {
  return {
    ...emptyTunerView("listening", "guitar"),
    ...partial,
  };
}

const inTuneA2: Partial<TunerView> = {
  stale: false,
  held: false,
  intonation: "in-tune",
  hz: 110,
  cents: 0.2,
  note: {
    letter: "A",
    octave: 2,
    label: "A2",
    midi: 45,
    cents: 0.2,
    referenceHz: 110,
  },
  target: {
    index: 1,
    stringNumber: 5,
    note: "A2",
    hz: 110,
    midi: 45,
    cents: 0.2,
  },
};

describe("tuner states", () => {
  it("prompts to allow the microphone", () => {
    render(<NoteDisplay view={view({ mic: "idle", stale: false })} />);
    expect(screen.getByText("Allow microphone")).toBeInTheDocument();
  });

  it("shows permission denied copy", () => {
    render(<NoteDisplay view={view({ mic: "permission-denied", stale: false })} />);
    expect(screen.getByText("Permission denied")).toBeInTheDocument();
  });

  it("shows unsupported-browser copy", () => {
    render(<NoteDisplay view={view({ mic: "unsupported", stale: false })} />);
    expect(screen.getByText("Microphone unavailable")).toBeInTheDocument();
    expect(screen.getByText("Use a modern browser on HTTPS or localhost.")).toBeInTheDocument();
  });

  it("shows play a string when listening with no pitch", () => {
    render(<NoteDisplay view={view({ mic: "listening", stale: true })} />);
    expect(screen.getByText("Play a string")).toBeInTheDocument();
  });

  it("shows the detected note, cents direction, and frequency", () => {
    render(
      <NoteDisplay
        view={view({
          ...inTuneA2,
          intonation: "flat",
          cents: -12,
          note: { ...inTuneA2.note!, cents: -12 },
          target: { ...inTuneA2.target!, cents: -12 },
        })}
      />,
    );
    expect(screen.getByText("A2")).toBeInTheDocument();
    expect(screen.getByText("Tune up · -12¢")).toBeInTheDocument();
    expect(screen.getByText("110.0 Hz")).toBeInTheDocument();
  });

  it("makes in-tune unmistakable and hides stale frequency while held", () => {
    const { rerender } = render(<NoteDisplay view={view(inTuneA2)} />);
    expect(screen.getByText("A2")).toBeInTheDocument();
    expect(screen.getByText("In tune")).toBeInTheDocument();
    expect(screen.getByText("110.0 Hz")).toBeInTheDocument();
    rerender(<NoteDisplay view={view({ ...inTuneA2, held: true })} />);
    expect(screen.getByText("In tune")).toBeInTheDocument();
    expect(screen.queryByText("110.0 Hz")).not.toBeInTheDocument();
  });

  it("renders start, waiting, stop, and retry microphone controls", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    const onStop = vi.fn();
    const { rerender } = render(<MicGate mic="idle" onStart={onStart} onStop={onStop} />);
    expect(screen.getByRole("button", { name: "Allow microphone" })).toBeInTheDocument();
    rerender(<MicGate mic="requesting" onStart={onStart} onStop={onStop} />);
    expect(screen.getByRole("button", { name: "Waiting for permission" })).toBeDisabled();
    rerender(<MicGate mic="listening" onStart={onStart} onStop={onStop} />);
    expect(screen.queryByRole("button", { name: "Allow microphone" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Stop microphone" }));
    expect(onStop).toHaveBeenCalledOnce();
    rerender(<MicGate mic="permission-denied" onStart={onStart} onStop={onStop} />);
    expect(screen.getByRole("button", { name: "Try microphone again" })).toBeInTheDocument();
    rerender(<MicGate mic="unavailable" onStart={onStart} onStop={onStop} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    rerender(<MicGate mic="unsupported" onStart={onStart} onStop={onStop} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("renders flat/sharp labels on the needle", () => {
    render(<TunerNeedle cents={-18} intonation="flat" />);
    expect(screen.getByText("Flat")).toBeInTheDocument();
    expect(screen.getByText("Sharp")).toBeInTheDocument();
    expect(screen.getByText("-18¢")).toBeInTheDocument();
  });

  it("hides the guitar tuning picker in chromatic mode", () => {
    const { rerender } = render(
      <TuningBar
        options={[{ id: "standard", name: "Standard", notes: ["E2"] }]}
        selectedId="standard"
        mode="guitar"
        onSelect={() => undefined}
        onMode={() => undefined}
      />,
    );
    expect(screen.getByLabelText("Tuning")).toBeInTheDocument();
    rerender(
      <TuningBar
        options={[{ id: "standard", name: "Standard", notes: ["E2"] }]}
        selectedId="standard"
        mode="chromatic"
        onSelect={() => undefined}
        onMode={() => undefined}
      />,
    );
    expect(screen.queryByLabelText("Tuning")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "chromatic" })).toHaveAttribute("aria-pressed", "true");
  });
});
