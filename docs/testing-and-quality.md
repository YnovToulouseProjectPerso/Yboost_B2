# Testing and quality checks

Run the relevant checks before requesting review. Run commands from the
repository root unless noted otherwise.

## Continuous integration

GitHub Actions runs the [CI workflow](../.github/workflows/ci.yml) for pull
requests targeting `develop` or `main` and for pushes to those branches. It
installs each application's locked dependencies, tests and builds the frontend, and
type checks and tests the backend.

The [pull request policy workflow](../.github/workflows/pull-request-policy.yml)
checks that source and target branches follow the allowed
[Git workflow](./git-workflow.md#pull-request-policy), then validates all
non-merge commit subjects. A failed check blocks merging when branch
protection is configured to require the status checks.

```mermaid
flowchart TD
    PR[Pull request to develop or main] --> Branches[Validate source and target branches]
    Branches --> Commits[Validate commit messages]
    Branches --> Frontend[Install frontend dependencies, test, and build]
    Branches --> Backend[Install backend dependencies and run tests]
    Commits --> Result{All required checks pass?}
    Frontend --> Result
    Backend --> Result
    Result -->|Yes| Merge[Eligible to merge when branch protection is enabled]
    Result -->|No| Fix[Update branch or commits]
    Fix --> PR
```

## Current checks

### Frontend

Run the frontend tests, then create a production build to catch type,
compilation, and bundling errors:

```sh
npm --prefix frontend test
npm --prefix frontend run build
```

The frontend tests use Vitest, Testing Library, and jsdom. Test files sit next
to the component they cover (`*.test.tsx`).

### Backend

Run the backend type check and tests:

```sh
npm --prefix backend run typecheck
npm --prefix backend test
```

The backend tests use Vitest and Fastify's request injection. They live in
[`backend/tests/`](../backend/tests/).

## Expectations for changes

- Add or update tests when changing API behavior or business logic.
- For UI changes, verify the production build and manually check the affected
  page in the browser at common viewport sizes.
- For API changes, test expected responses and relevant invalid-input or
  failure cases.
- Run both checks when a change affects the frontend/backend integration.
- Include any manual verification steps that cannot be automated in the pull
  request description.

Linting and formatting commands are not configured yet. Add them as
application scripts when the project adopts the corresponding tools.
