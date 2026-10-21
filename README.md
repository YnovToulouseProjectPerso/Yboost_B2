# Yboost B2

Yboost B2 is a web application with a React frontend, a Fastify API running on
Node.js, and a dedicated area for database resources.

## Quick start

Requirements: [Node.js](https://nodejs.org/) and npm, or [Docker](https://www.docker.com/) with Docker Compose.

### Run with Docker Compose

From the repository root:

```sh
docker compose up --build
```

Open <http://localhost:5173> for the frontend and
<http://localhost:3000/api/health> for the API health check. Stop the services
with `docker compose down`.

### Run with Node.js

```sh
npm --prefix frontend install
npm --prefix backend install
```

Start each application in a separate terminal:

```sh
npm --prefix backend run dev
npm --prefix frontend run dev
```

The frontend runs at <http://localhost:5173>. The API health endpoint is
<http://localhost:3000/api/health>.

## Project areas

| Area | Purpose |
| --- | --- |
| [Frontend](./frontend/) | React, TypeScript, Tailwind CSS, and Vite |
| [Backend](./backend/) | Node.js, TypeScript, and Fastify API |
| [Database](./database/) | Database migrations and seed data (engine not selected) |
| [Documentation](./docs/README.md) | Architecture, development practices, and setup |

## Documentation

Start with the [documentation index](./docs/README.md) for guides on:

- [System architecture](./docs/architecture.md)
- [Development setup](./docs/development-setup.md)
- [Coding standards](./docs/coding-standards.md)
- [Testing and quality checks](./docs/testing-and-quality.md)
- [Git workflow](./docs/git-workflow.md)
- [CI workflow](./.github/workflows/ci.yml)
- [Pull request policy workflow](./.github/workflows/pull-request-policy.yml)
- [Architecture Decision Records](./docs/ADR/)

## Useful commands

Run from the repository root:

| Command | Description |
| --- | --- |
| `npm --prefix frontend run dev` | Start the frontend development server |
| `npm --prefix frontend run build` | Build the frontend for production |
| `npm --prefix backend run dev` | Start the API in watch mode |
| `npm --prefix backend test` | Run backend tests |

## Contribution rules

Pull requests must follow the [branch and commit policy](./docs/git-workflow.md#pull-request-policy):
work branches target `develop`, `develop` targets `main`, and exceptional
`hotfix/*` branches may target `main`. Commit subjects must follow the
documented Conventional Commit format. GitHub Actions checks branch flow,
commit messages, the frontend build, and backend tests.

## Environment variables

See [`frontend/.env.example`](./frontend/.env.example) and
[`backend/.env.example`](./backend/.env.example). Keep local secrets in
uncommitted `.env` files; commit only sanitized example files.
