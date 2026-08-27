# Design contract

## Tone

Operational, editorial, minimal, industrial, calm. Reliable rather than trendy.

## Avoid

- Excessive gradients and glow effects
- Animation-heavy dashboards
- One-off spacing/typography per page
- Startup hype aesthetics

## Tokens

Use CSS variables in `app/globals.css`:

- `--background`, `--foreground`, `--muted`, `--border`, `--accent`
- Spacing via Tailwind scale only (`p-4`, `gap-6`, etc.)
- Typography: system stack; `text-sm` for UI, `text-lg` for page titles

## Components

All interactive UI uses primitives from `components/ui/`. Shell layout uses `components/shell/`.

## Status colors

- draft: muted
- active: accent
- archived: muted + strikethrough context

## Markdown

Notes render through `MarkdownBody` with safe defaults (no raw HTML).
