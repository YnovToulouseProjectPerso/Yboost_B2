# ADR 0003: TypeScript

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

ADR 0001 and ADR 0002 chose JavaScript for both applications. The game state,
the API contract, and the error codes are shared by four people working in
parallel, and mismatches between them would only surface at runtime.

## Decision

Write the frontend and the backend in **TypeScript**. This supersedes the
language part of ADR 0001 and ADR 0002.

- The backend runs `.ts` files directly with Node.js 24 type stripping, without
  a build step. Only erasable syntax is allowed (no `enum`, no namespaces, no
  constructor parameter properties).
- The frontend is compiled by Vite.
- `tsc` checks types in both applications and runs in CI.

## Consequences

- The contract and state shapes are checked at compile time.
- Relative imports use the `.ts` or `.tsx` extension.
- Each application has its own `tsconfig.json` and depends on `typescript`.
