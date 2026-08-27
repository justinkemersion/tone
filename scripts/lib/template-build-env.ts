/**
 * Stub env for template CI / verify:template builds only.
 * Not real secrets — matches .github/workflows/ci.yml.
 */
export const TEMPLATE_BUILD_ENV: Record<string, string> = {
  AUTH_SECRET: "ci-build-secret-min-32-characters-long",
  AUTH_GITHUB_ID: "ci",
  AUTH_GITHUB_SECRET: "ci",
  FLUX_URL: "https://flux.example",
  FLUX_GATEWAY_JWT_SECRET: "ci-gateway-secret-min-16",
};
