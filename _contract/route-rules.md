# Route rules

## Data loading

- **RSC pages** fetch lists and details via `auth()` + `lib/flux/*` helpers
- **Server actions** handle mutations with Zod validation
- Return `{ ok: true, data? }` or `{ ok: false, error: string }`

## Auth

- Public: `/`, `/login`
- Protected: `app/(dashboard)/**` — layout calls `auth()` and redirects to `/login`

## Actions location

Prefer `app/(dashboard)/actions/<feature>.ts` or colocated `actions.ts` next to the feature.

## CRUD

- Create/update/archive via server actions
- Archive = set `status: archived` and `archived_at`; no hard delete in UI
- Log activity via `logActivity` helper after successful mutations

## API routes

Only `app/api/auth/[...nextauth]/route.ts` for Auth.js. No ad-hoc REST unless a plan adds it.

## Size

Max 300 LOC per `page.tsx` / `route.ts`. Extract components when approaching limit.
