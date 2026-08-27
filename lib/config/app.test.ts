import { describe, expect, it } from "vitest";
import { formatPackageNameAsDisplay } from "./app";

describe("formatPackageNameAsDisplay", () => {
  it("title-cases kebab-case package names", () => {
    expect(formatPackageNameAsDisplay("foundry-sandbox-roommates")).toBe("Foundry Sandbox Roommates");
  });

  it("handles underscores", () => {
    expect(formatPackageNameAsDisplay("my_app")).toBe("My App");
  });
});
