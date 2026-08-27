# Plan 009 — Roommating first domain

**Where:** New app repo **`roommating`** — fork Foundry; do **not** build product features inside `flux-app-foundry`.

**Scope:** Modest v1 for shared households. Manual money tracking only. No Stripe, no AI.

## Prerequisites

- Foundry milestones 0.1–0.4 complete
- Follow [`docs/FIRST_FORK.md`](../docs/FIRST_FORK.md)
- On fresh clone before app env: `pnpm foundry:verify:template`
- After `.env` + Flux: `pnpm foundry:doctor` then `pnpm foundry:verify`

## Phase 0 — Fork setup

> **Active fork:** `~/Projects/roommating` — implementation tracked in that repo’s copy of this plan.

- [ ] `git clone` / template → `~/Projects/roommating` (new origin remote)
- [ ] `package.json` `name`: `roommating`; UI via `NEXT_PUBLIC_APP_NAME` / tagline
- [ ] Rebrand `README.md` for Roommating
- [ ] `FOUNDRY_BASELINE.md` — baseline commit, last synced, deviations
- [ ] `flux.json` slug + `flux init` / `flux push` / `pnpm flux:schema:sync`
- [ ] `pnpm foundry:doctor` + `pnpm foundry:new-app-check` + `pnpm foundry:verify`
- [ ] Plan file copied or linked: `plans/009-roommating-first-domain.md` in fork

## Phase 1 — Schema (new migrations only)

Add `0006_*` … — never edit applied `0001`–`0005`.

| Entity | Purpose |
|--------|---------|
| `households` | A home / unit tenants share |
| `household_members` | User ↔ household role (`owner`, `member`) |
| `chores` | Recurring or one-off tasks, assignee, due date, done state |
| `house_bills` | Shared bills (amount, due, split hint, paid flag) |
| `settlements` | Manual payment / IOU records between members (no payment processor) |
| `house_activity` | Feed rows (chore completed, bill added, settlement logged, …) |

RLS: every row scoped by household membership via JWT `sub`. Separate `*_grants.sql` per migration group.

## Phase 2 — Flux boundary

- [ ] Types + list/create/update in `lib/flux/` (one module per aggregate)
- [ ] Server actions for mutations; RSC reads only
- [ ] Reuse or retire generic `records` routes only where they still help; prefer `/households/...` for domain UI

## Phase 3 — Dashboard UX (modest)

- [ ] `/households` — list + create household
- [ ] `/households/[id]` — overview: members, open chores, upcoming bills
- [ ] `/households/[id]/chores` — CRUD chores
- [ ] `/households/[id]/bills` — CRUD shared bills
- [ ] `/households/[id]/settlements` — log manual payments / mark settled
- [ ] `/households/[id]/activity` — house activity feed (read-mostly)

Keep components under LOC limits; use existing `components/ui/`.

## Phase 4 — Seed & docs

- [ ] `seed:demo` or household-specific seed for one demo home
- [ ] Update fork `README` quick start for Roommating flows

## Explicitly deferred

- Stripe / card charges / webhooks
- AI chore suggestions, receipt OCR, chat agents
- Real-time push (poll or RSC refresh is fine for v1)
- Multi-household billing products

## Exit

A signed-in user can create a household, invite/add members (by sub or email placeholder), manage chores and bills, log settlements manually, and see activity — all on Flux with RLS, passing `pnpm foundry:verify` in the **roommating** repo.
