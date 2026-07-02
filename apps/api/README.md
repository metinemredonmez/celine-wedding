# apps/api — Celine Gelinlik API

NestJS 11 + Prisma + PostgreSQL. Serves the public showcase reads (collections,
dresses) and appointment intake. This is the **basic v1** foundation — JWT auth,
media/Cloudinary signing, and admin CRUD are intentionally **not** wired up yet
(see `docs/DATA-MODEL.md` for the full target contract).

## Prerequisites

- Node.js 20+ and pnpm 9+
- A reachable PostgreSQL instance

## Setup

From the **monorepo root**:

```bash
# 1. Install all workspace deps
pnpm install

# 2. Create the API env file from the template and fill in real values
cp apps/api/.env.example apps/api/.env
#   at minimum set: DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Generate the Prisma client, create + apply the first migration
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate      # prisma migrate dev

# 4. Seed the DB (admin user, site settings, 2 collections, 4 dresses)
pnpm --filter api db:seed

# 5. Run the API in watch mode
pnpm --filter api start:dev
```

The API listens on `PORT` (default **3001**). Swagger UI is served at
<http://localhost:3001/docs>.

## Endpoints (v1)

| Method | Route                | Notes                                              |
| ------ | -------------------- | -------------------------------------------------- |
| GET    | `/health`            | Liveness `{ status: 'ok', ts }`                    |
| GET    | `/collections`       | List, ordered                                      |
| GET    | `/collections/:slug` | Collection + its published dresses                 |
| GET    | `/dresses`           | Paginated PUBLISHED list (`?collection`, `?featured`, `?page`, `?limit`, `?sort`, `?dir`) |
| GET    | `/dresses/slugs`     | Published slugs for Next `generateStaticParams`    |
| GET    | `/dresses/:slug`     | Published dress + images + collection + related    |
| POST   | `/appointments`      | Create request (honeypot `website` must be empty)  |
| GET    | `/appointments`      | List newest first — **TODO: protect with admin JWT** |

## Scripts

| Script            | What it does                          |
| ----------------- | ------------------------------------- |
| `build`           | `nest build`                          |
| `start` / `dev`   | `nest start` (`dev` = watch)          |
| `start:dev`       | `nest start --watch`                  |
| `start:prod`      | `node dist/main.js`                   |
| `prisma:generate` | `prisma generate`                     |
| `prisma:migrate`  | `prisma migrate dev`                  |
| `prisma:deploy`   | `prisma migrate deploy`               |
| `db:seed`         | Run the idempotent seed               |
| `lint`            | ESLint over `src` + `prisma`          |

## Notes / deviations from docs

- **Prisma generator:** uses the stable `prisma-client-js` provider (import from
  `@prisma/client`) instead of the bleeding-edge `prisma-client` + custom
  `output` shown in `docs/DATA-MODEL.md`. The models, enums, relations and
  indexes still match the doc exactly.
- **Auth / media / admin CRUD:** deferred to a later push. `GET /appointments`
  is currently public and marked with a `TODO` to add the admin JWT guard.
