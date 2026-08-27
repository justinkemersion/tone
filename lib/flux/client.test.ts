import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fluxJson } from "./client";

describe("fluxJson", () => {
  beforeEach(() => {
    process.env.FLUX_URL = "https://flux.example";
    process.env.FLUX_GATEWAY_JWT_SECRET = "test-secret-at-least-32-chars-long";
    process.env.FLUX_POSTGREST_SCHEMA = "public";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.FLUX_URL;
    delete process.env.FLUX_GATEWAY_JWT_SECRET;
    delete process.env.FLUX_POSTGREST_SCHEMA;
  });

  it("sends Bearer auth and PostgREST profile headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "[]",
    });
    vi.stubGlobal("fetch", fetchMock);

    await fluxJson("user-123", "/records");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toMatch(/^Bearer /);
    expect(headers.get("Accept-Profile")).toBe("public");
  });
});
