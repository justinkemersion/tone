import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const INVARIANT =
  "(current_setting('request.jwt.claims', true)::json->>'sub') = user_id";

describe("tone domain migrations", () => {
  it("0007 binds every policy to jwt sub and parent-owns favorites", () => {
    const sql = readFileSync(join(__dirname, "0007_tone_entities.sql"), "utf8");
    expect(sql.split(INVARIANT).length - 1).toBeGreaterThanOrEqual(16);
    expect(sql).toContain("user_preferences");
    expect(sql).toContain("custom_tunings");
    expect(sql).toContain("tuning_favorites");
    expect(sql).toContain("recordings");
    expect(sql).toContain("exists (");
    expect(sql).toContain("from custom_tunings t");
  });

  it("0008 grants authenticated on tone tables", () => {
    const sql = readFileSync(join(__dirname, "0008_tone_grants.sql"), "utf8");
    expect(sql.toLowerCase()).toContain("grant");
    expect(sql).toContain("user_preferences");
    expect(sql).toContain("custom_tunings");
    expect(sql).toContain("tuning_favorites");
    expect(sql).toContain("recordings");
    expect(sql).toContain("authenticated");
  });
});
