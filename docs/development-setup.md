# Development setup

## Prerequisites

- [Node.js](https://nodejs.org/) with npm
- Or [Docker](https://www.docker.com/) with Docker Compose
- A terminal opened at the repository root

The frontend and backend are separate npm applications with their own
dependencies and lockfiles.

## Start with Docker Compose

Build the application images and start the frontend and backend from the
repository root:

```sh
docker compose up --build
```

- Frontend: <http://localhost:5173>
- API health endpoint: <http://localhost:3000/api/health>

Compose waits for the backend health check before starting the frontend. The
application source directories are mounted into the containers for live
development updates. Stop and remove the containers with:

```sh
docker compose down
```

The database service is intentionally not included because the database
engine has not been selected.

## Install dependencies

From the repository root:

```sh
npm --prefix frontend install
npm --prefix backend install
```

## Configure the backend

Copy the backend example environment file if you need local overrides:

```powershell
Copy-Item backend/.env.example backend/.env
```

The default values are sufficient for local development. The backend reads
`HOST`, `PORT`, and `FRONTEND_ORIGIN`.

Frontend settings can be overridden in `frontend/.env`. See
[`frontend/.env.example`](../frontend/.env.example) for the API URL setting.

Do not commit `.env` files or secrets. Update the corresponding example file
when adding a new required configuration variable.

## Start the applications

Run each command in a separate terminal from the repository root:

```sh
npm --prefix backend run dev
```

```sh
npm --prefix frontend run dev
```

- Frontend: <http://localhost:5173>
- API health endpoint: <http://localhost:3000/api/health>
- API documentation (Swagger UI): <http://localhost:3000/documentation>

Vite proxies requests under `/api` to the local backend.

## Production frontend build

```sh
npm --prefix frontend run build
npm --prefix frontend run preview
```

The generated files are written to `frontend/dist/` and should not be
committed.
