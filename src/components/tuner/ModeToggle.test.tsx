import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModeToggle } from "./ModeToggle";

describe("ModeToggle", () => {
  it("calls onChange with listen when Listen tab is activated", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ModeToggle mode="play" onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: /listen/i }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("listen");
  });

  it("calls onChange with play when Reference tab is activated", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ModeToggle mode="listen" onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: /reference/i }));
    expect(onChange).toHaveBeenCalledWith("play");
  });
});
