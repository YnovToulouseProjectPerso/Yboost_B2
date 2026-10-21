# ADR 0002: Backend stack

- **Status:** Accepted, language superseded by [ADR 0003](./0003-typescript.md)
- **Date:** 2026-10-21

## Context

The backend framework options considered were Fastify on Node.js and FastAPI
on Python. The frontend is planned in JavaScript, so using Node.js also allows
the project to use JavaScript across both application layers. FastAPI is a
valid alternative, but it would introduce a separate language and runtime.

## Decision

Build the backend with **Node.js and Fastify**. Do not use Python with FastAPI
for the backend at this stage.

## Consequences

- Frontend and backend application code can share the JavaScript language and
  ecosystem, while remaining separate applications with their own dependencies.
- Fastify provides the HTTP server and plugin structure for backend routes and
  services.
- The project does not need a Python runtime for the backend.
- If future requirements call for Python-specific libraries or workflows,
  FastAPI can be reconsidered in a new ADR.
