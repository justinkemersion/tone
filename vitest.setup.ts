import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

process.env.AUTH_SECRET ??= "test-auth-secret-minimum-32-chars";
process.env.AUTH_GITHUB_ID ??= "test-github-id";
process.env.AUTH_GITHUB_SECRET ??= "test-github-secret";
