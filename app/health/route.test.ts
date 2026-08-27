import { describe, expect, it } from "vitest";
import { GET } from "@/app/health/route";

describe("GET /health", () => {
  it("returns a public ok payload with no secrets", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, service: "tone" });
    expect(JSON.stringify(body)).not.toMatch(/secret|token|jwt/i);
  });
});
