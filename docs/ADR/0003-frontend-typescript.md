# ADR 0003: TypeScript for the frontend

- **Status:** Proposed
- **Date:** 2026-10-21

## Context

[ADR 0001](./0001-frontend-stack.md) chose React with JavaScript and noted that
TypeScript could be evaluated later. The game exchanges structured data with
the API (game state, clues, notebook entries, interrogation results). Typing
these shapes helps the team keep components and API calls consistent with the
API contract and catches mistakes before the application runs.

## Decision

Write the frontend in **TypeScript** (`.ts` and `.tsx` files) with strict
type checking. Shared data shapes live in `frontend/src/types/`.

## Consequences

- `npm --prefix frontend run build` runs the type check (`tsc --noEmit`)
  before the Vite build, so the CI rejects type errors.
- `npm --prefix frontend run typecheck` runs the type check alone.
- Every team member working on the frontend needs basic TypeScript knowledge.
- The backend is not affected by this decision and stays in JavaScript unless
  a separate ADR changes it.
