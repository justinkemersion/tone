# Component rules

## Location

- `components/ui/` — primitives (Button, Input, Card, …)
- `components/shell/` — AppShell, SidebarNav, TopBar
- `components/providers.tsx` — client providers only

## Client boundary

Files with `"use client"` must not import `lib/flux`, `auth`, or SQL.

## Props

Prefer explicit typed props. Avoid `any`.

## Composition

Pages compose shell + ui primitives. No 200-line page-specific styled div trees.

## Naming

PascalCase components, one default export per file unless re-exporting a barrel (avoid large barrels).

## Testing

Pure UI helpers may have colocated tests; Flux integration tests mock at `fluxJson` only.

## Size

Max 250 LOC per `.tsx` in `components/`. Split when larger.
