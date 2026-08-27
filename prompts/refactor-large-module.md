# Refactor large module

1. Check LOC with `pnpm check:file-sizes`.
2. Split by responsibility; do not change behavior.
3. Preserve import boundaries per `_contract/architecture.md`.
4. Run full test + drift suite.
