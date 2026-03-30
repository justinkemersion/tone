import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTunerContext } from "./TunerContext";

describe("useTunerContext", () => {
  it("throws when used outside TunerProvider", () => {
    expect(() => {
      renderHook(() => useTunerContext());
    }).toThrow(/useTunerContext must be used within TunerProvider/);
  });
});
