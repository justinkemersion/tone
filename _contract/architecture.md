# Architecture contract

## Layers

1. **app/** — routes, layouts, server actions (feature-colocated under route groups)
2. **components/** — UI and shell; may use `lib/ui` helpers only
3. **lib/** — shared server utilities; **lib/flux/** is the only Flux HTTP surface
4. **sql/migrations/** — schema source of truth

## Import directions

- `components/**` → `components/ui`, `lib/ui` (presentation helpers only)
- `app/**` → `components/**`, `lib/**`, `auth.ts`
- `lib/flux/**` → may use `jose`, `undici`; must not import React or `components/`
- **Forbidden:** `components/**` → `lib/flux`, `auth.ts`, `sql/`
- **Forbidden:** `"use client"` files → server-only modules

## Server vs client

- Flux calls and JWT minting are **server-only** (`fluxJson`, server actions, RSC loaders).
- Client components receive serializable props and call server actions for mutations.

## File size

See `anti-drift.md`. Split files before exceeding limits.

## Feature layout

```
app/(dashboard)/<feature>/
  page.tsx
  actions.ts   # or ../actions/<feature>.ts
```

No random `services/` or `repositories/` folders unless a plan explicitly adds them.
