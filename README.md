# OCM

OCM is a full-stack sports management app with a FastAPI backend and a Next.js-style frontend. The repository includes Docker Compose infrastructure for local development.

## Repository structure

- `backend/`
  - `Dockerfile` - backend container build instructions
  - `app/` - FastAPI application package
- `frontend/`
  - Next.js-style frontend source files
- `docker-compose.yml` - local development environment with PostgreSQL, Redis, and backend services
- `.env` - local environment overrides for secrets and optional database URL

## Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local backend development outside Docker)
- Node.js / npm or Yarn (if you want to run the frontend locally)

## Environment

The project supports a `.env` file at the repo root. The following variables are used:

- `JWT_SECRET` - secret key for JWT signing
- `API_KEY` - API key for internal endpoints
- `DATABASE_URL` - optional override for database connection

A sample `.env` is already present with secrets and the default database URL.

## Docker Compose setup

The application uses the following database configuration in `docker-compose.yml`:

- `POSTGRES_USER=ocm_user`
- `POSTGRES_PASSWORD=secret`
- `POSTGRES_DB=ocm`

The backend connects to PostgreSQL using:

- `postgresql://ocm_user:secret@db:5432/ocm`

### Fix applied

The PostgreSQL healthcheck now explicitly targets the configured database:

- `pg_isready -U ocm_user -d ocm`

This prevents `pg_isready` from defaulting to the user-name database `ocm_user`, which was causing the `database "ocm_user" does not exist` error.

### Start the app with Docker

```bash
docker compose up --build
```

This brings up:

1. `db` - PostgreSQL
2. `redis` - Redis
3. `backend` - FastAPI app on `http://localhost:8000`
4. `frontend` - Next.js app on `http://localhost:3000`

### Access the application

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Docs (Swagger)**: `http://localhost:8000/docs`

## Backend details

The backend package is under `backend/app/` and the Docker image launches the app as:

- `uvicorn app.main:app --host 0.0.0.0 --port 8000`

If you run the backend directly outside Docker, use the same environment variables and the same command.

## Frontend details

The repository contains a `frontend/` directory with Next.js pages and components. The frontend is configured with a `package.json` file.

### Running frontend locally

If you want to run the frontend separately from Docker:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Running frontend in Docker

When you run `docker compose up --build`, the frontend Docker service will build and start automatically on port 3000.

## Troubleshooting

### Stale database volume

If the database container has been created previously with a different database name, you may need to recreate the volume:

```bash
docker compose down -v
docker compose up --build
```

### Backend import error

The backend image builds `backend/app` into the container and exposes it as the `app` Python package. The compose service command has been corrected to:

```yaml
command: uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - root health message
- `GET /health` - health check
- `POST /login` - user login endpoint
- `POST /users` - create user
- `GET /teams`, `GET /players`, `GET /leagues`, `GET /seasons`, `GET /matches` - list resources

## Notes

- `backend/app/db.py` reads `DATABASE_URL` from environment variables and falls back to the default connection string.
- Redis is started for future state or caching support.
- If you add frontend package configuration, update the README with the exact install commands.
