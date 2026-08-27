import { describe, expect, it } from "vitest";
import { isFluxPersistenceConfigured, isR2Configured, readR2Env } from "./availability";

describe("availability", () => {
  it("treats missing Flux/R2 as unavailable", () => {
    delete process.env.FLUX_URL;
    delete process.env.FLUX_GATEWAY_JWT_SECRET;
    delete process.env.R2_ACCOUNT_ID;
    expect(isFluxPersistenceConfigured()).toBe(false);
    expect(isR2Configured()).toBe(false);
    expect(readR2Env()).toBeNull();
  });
});
