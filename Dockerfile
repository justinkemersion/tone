# syntax=docker/dockerfile:1
# Tone at https://tone.vsl-base.com
# Production image for Tone (build from repo root).
#   docker compose --env-file .env.docker build
#
# Private runtime secrets are NOT baked into the image. At runtime, inject via docker compose `env_file`.
# Build-args are public branding only: NEXT_PUBLIC_APP_NAME / TAGLINE / URL.

FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_NAME=Tone
ARG NEXT_PUBLIC_APP_TAGLINE="Open the site, play a string, tune the guitar."
ARG NEXT_PUBLIC_APP_URL=https://tone.vsl-base.com

ENV NEXT_TELEMETRY_DISABLED=1 \
  NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME} \
  NEXT_PUBLIC_APP_TAGLINE=${NEXT_PUBLIC_APP_TAGLINE} \
  NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
  AUTH_SECRET=ci-build-secret-min-32-characters-long \
  AUTH_DEV_LOGIN=0 \
  FLUX_URL=https://flux.example \
  FLUX_GATEWAY_JWT_SECRET=ci-gateway-secret-min-16 \
  FLUX_POSTGREST_SCHEMA=t_ci_api

RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000 \
  HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
