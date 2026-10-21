# ADR 0001: Frontend stack

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The frontend needs a user interface and styling. React, JavaScript, and CSS
were discussed, but they are complementary technologies rather than competing
choices: React builds the interface, JavaScript provides its application
logic, and CSS styles it.

## Decision

Build the frontend with **React and JavaScript**, using **CSS** for styling.
No CSS framework or component library is selected by this decision.

## Consequences

- The UI can be organized into reusable React components.
- The frontend uses the JavaScript ecosystem without adding a separate
  language or styling framework.
- The team is responsible for keeping styles organized and consistent with
  plain CSS.
- A CSS framework or TypeScript can be evaluated later if project needs
  justify the added tooling and conventions.
