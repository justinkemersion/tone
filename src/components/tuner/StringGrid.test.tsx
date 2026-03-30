import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StringGrid } from "./StringGrid";

const SAMPLE_STRINGS = [
  { stringIndex: 6, note: "E2", hz: 82.41 },
  { stringIndex: 5, note: "A2", hz: 110 },
];

describe("StringGrid", () => {
  it("invokes onStringPress when a string is tapped in play mode", async () => {
    const user = userEvent.setup();
    const onStringPress = vi.fn();
    render(
      <StringGrid
        tuningKey="test"
        strings={SAMPLE_STRINGS}
        mode="play"
        activeStringIndex={null}
        onStringPress={onStringPress}
      />
    );

    await user.click(screen.getByRole("button", { name: /string 6/i }));
    expect(onStringPress).toHaveBeenCalledWith(6);
  });

  it("does not fire onStringPress when listen mode (buttons disabled)", async () => {
    const user = userEvent.setup();
    const onStringPress = vi.fn();
    render(
      <StringGrid
        tuningKey="test"
        strings={SAMPLE_STRINGS}
        mode="listen"
        activeStringIndex={null}
        onStringPress={onStringPress}
      />
    );

    const btn = screen.getByRole("button", { name: /string 6/i });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onStringPress).not.toHaveBeenCalled();
  });
});
