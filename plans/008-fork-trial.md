# Plan 008 — Fork trial (Milestone 0.4)

**Goal:** Prove `flux-app-foundry` survives a real local fork before picking Roommating/HOA/etc.

## Sandbox app

**`foundry-sandbox-roommates`** — disposable roommate-household ledger sandbox. Reuses generic `records` / `workspaces` CRUD; domain tables come later (Roommating path).

Location: `~/Projects/foundry-sandbox-roommates` (local only; not pushed unless you choose).

## Checklist

- [x] Copy or clone template into sandbox directory (`~/Projects/foundry-sandbox-roommates`)
- [x] Rename `package.json` `name` → `foundry-sandbox-roommates`
- [x] Rebrand `README.md` (app purpose, not Foundry template copy)
- [x] Fill `FOUNDRY_BASELINE.md` (baseline commit, last synced, deviations)
- [x] Update `flux.json` slug; trial hash `sandbox01` + `pnpm flux:schema:sync`
- [x] `cp .env.example .env` — env validation still works
- [x] `_contract/` still applies; no edits that violate contracts
- [x] `pnpm foundry:report` — inventories generate
- [x] SQL migrations have no Foundry branding / placeholders
- [x] Routes/components stay generic (`records`, `dashboard`, not foundry-specific)
- [x] `pnpm foundry:new-app-check` passes
- [x] `pnpm foundry:doctor` passes (with configured env + origin)
- [x] `pnpm foundry:verify` passes
- [x] Upstream fix: `lib/config/app.ts` — single rename surface for UI title/tagline

## Exit

Fork trial **passed**. Template is fork-ready in practice, not only on paper. Next: [`009-roommating-first-domain.md`](009-roommating-first-domain.md) in a **roommating** fork (not inside Foundry).

## Trial results

Sandbox: `~/Projects/foundry-sandbox-roommates` (local clone, not pushed).

| Check | Result | Notes |
|-------|--------|-------|
| App rename | Pass | `package.json` + `NEXT_PUBLIC_APP_NAME=Roommate Ledger` |
| README rebrand | Pass | Roommate sandbox README; upstream link only in lineage |
| Env / doctor | Pass | `.env` + `.env.local` from `flux:schema:sync` |
| Contracts | Pass | Unchanged `_contract/`; `check:contracts` in verify |
| foundry:report | Pass | `.local/reports/` + `docs/generated/` |
| Migrations generic | Pass | No Foundry strings in `sql/migrations/` |
| Routes generic | Pass | `records`, `dashboard`, `activity` — domain-neutral |
| FOUNDRY_BASELINE | Pass | Baseline `375c79f…`, deviations documented |
| foundry:new-app-check | Pass | |
| foundry:verify | Pass | lint, typecheck, test, drift, build |

**Leak fixed upstream:** hardcoded `flux-app-foundry` in `app/page.tsx`, `app/layout.tsx`, `TopBar.tsx` → `lib/config/app.ts` + optional `NEXT_PUBLIC_*` overrides.

**Expected Foundry references (OK):** `FOUNDRY_BASELINE.md`, `docs/FIRST_FORK.md`, `_contract/forking.md`, `foundry:*` script names, `pnpm foundry:new-app-check` template detection.
