# YBP Backend (Node.js / Express + Prisma / PostgreSQL)

Yashvi Bagga Productions API — Milestone 1 foundation with PostgreSQL via Prisma 7.

## Layout

| Folder | Role |
|--------|------|
| `src/api` | Express host, routes, Swagger |
| `src/domain` | Aggregates, value objects, enums, events |
| `src/shared` | Result, Guard, pagination, clock |
| `src/persistence` | Prisma client (`@prisma/adapter-pg`) |
| `prisma/` | Schema, migrations, seed |
| `src/application` | Use-cases (empty shell) |
| `src/infrastructure` | External adapters (empty shell) |
| `src/contracts` | API DTOs (empty shell) |

## PostgreSQL (pgAdmin)

1. Install PostgreSQL + pgAdmin (or use Docker below).
2. In pgAdmin: create database **`ybp`**.
3. Copy env file and set your password:

```bash
cp .env.example .env
```

`.env` example:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ybp?schema=public"
```

### Optional: Docker Postgres

```bash
docker run -d --name ybp-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=ybp `
  -p 5432:5432 `
  postgres:16
```

Then point pgAdmin at `localhost:5432` (user `postgres` / password `postgres`, DB `ybp`).

## Setup

```bash
cd ybp-node
npm install
npx prisma generate
npm run prisma:deploy
npm run prisma:seed
npm run dev
```

### Prisma scripts

| Script | Purpose |
|--------|---------|
| `npm run prisma:generate` | Generate client |
| `npm run prisma:migrate` | Create/apply migrations (dev) |
| `npm run prisma:deploy` | Apply existing migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed roles + permissions |
| `npm run prisma:reset` | Reset DB + re-seed |

## Endpoints

- API: `http://localhost:5041`
- Ping: `GET /api/v1/ping`
- Health: `GET /health` (includes DB ping)
- Swagger: `http://localhost:5041/swagger`

## Database tables

Users, refresh tokens, roles, permissions, registration requests, leads, talent/casting/media/manpower applications, workforce roles, application status events, documents, OTP verification requests, notification deliveries, audit logs.
