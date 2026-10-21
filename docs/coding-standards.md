# Coding standards

These conventions keep the frontend, API, and future database code consistent.
Follow the existing patterns in each application and keep changes focused.

## General practices

- Use clear, descriptive names and small functions with one responsibility.
- Prefer explicit error handling over silent fallbacks.
- Avoid duplicating logic; extract shared behavior only when it has more than
  one real use.
- Do not commit secrets, generated build output, or installed dependencies.
- Update documentation and tests when behavior or setup changes.

## React frontend

- Use function components and React hooks.
- Keep page-level views in `src/pages/` and reusable UI in `src/components/`.
- Put reusable hooks in `src/hooks/`; name custom hooks with the `use` prefix.
- Keep API request code in `src/services/`.
- Use semantic HTML and provide accessible labels and status feedback.
- Use Tailwind utility classes for component styling. Keep global resets and
  shared base styles in `src/styles/`.
- Avoid adding a CSS framework or component library without recording and
  agreeing on the choice.

## Fastify backend

- Register routes and plugins through the application in `src/app.ts`.
- Keep route handlers focused on HTTP input/output; put business rules in
  `src/services/`.
- Validate external input and document expected response shapes with Fastify
  schemas.
- Keep environment parsing and validation in `src/config/`.
- Return appropriate HTTP status codes and explicit error responses.
- Add tests for new endpoints and meaningful service behavior.

## Dependencies

- Add runtime packages to the relevant application's `dependencies`.
- Add build, development, or test tools to `devDependencies`.
- Keep each application's lockfile in version control and update it with
  dependency changes.
- Prefer a small dependency footprint and explain non-obvious additions in the
  pull request.
