import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NoteDisplay } from "./NoteDisplay";
import { MicGate } from "./MicGate";
import { TunerNeedle } from "./TunerNeedle";
import type { TunerView } from "@/lib/tuner/state";

function view(partial: Partial<TunerView>): TunerView {
  return {
    mic: "listening",
    mode: "guitar",
    intonation: "none",
    hz: null,
    cents: null,
    note: null,
    target: null,
    confidence: 0,
    amplitude: 0,
    stale: true,
    ...partial,
  };
}

describe("tuner states", () => {
  it("prompts to allow the microphone", () => {
    render(<NoteDisplay view={view({ mic: "idle" })} />);
    expect(screen.getByText("Allow microphone")).toBeInTheDocument();
  });

  it("shows permission denied copy", () => {
    render(<NoteDisplay view={view({ mic: "permission-denied" })} />);
    expect(screen.getByText("Permission denied")).toBeInTheDocument();
  });

  it("shows play a string when listening with no pitch", () => {
    render(<NoteDisplay view={view({ mic: "listening", stale: true })} />);
    expect(screen.getByText("Play a string")).toBeInTheDocument();
  });

  it("shows the detected note and in-tune copy", () => {
    render(
      <NoteDisplay
        view={view({
          stale: false,
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
        })}
      />,
    );
    expect(screen.getByText("A2")).toBeInTheDocument();
    expect(screen.getByText("In tune")).toBeInTheDocument();
  });

  it("renders a microphone button for idle and denied, not while listening", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MicGate mic="idle" onStart={() => undefined} />);
    expect(screen.getByRole("button", { name: "Allow microphone" })).toBeInTheDocument();
    rerender(<MicGate mic="listening" onStart={() => undefined} />);
    expect(screen.queryByRole("button", { name: "Allow microphone" })).not.toBeInTheDocument();
    rerender(<MicGate mic="permission-denied" onStart={() => undefined} />);
    expect(screen.getByRole("button", { name: "Try microphone again" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try microphone again" }));
  });

  it("renders flat/sharp labels on the needle", () => {
    render(<TunerNeedle cents={-18} intonation="flat" />);
    expect(screen.getByText("Flat")).toBeInTheDocument();
    expect(screen.getByText("Sharp")).toBeInTheDocument();
    expect(screen.getByText("-18¢")).toBeInTheDocument();
  });
});
