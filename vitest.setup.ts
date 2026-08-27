import "@testing-library/jest-dom/vitest";

process.env.AUTH_SECRET ??= "test-auth-secret-minimum-32-chars";
process.env.AUTH_GITHUB_ID ??= "test-github-id";
process.env.AUTH_GITHUB_SECRET ??= "test-github-secret";
