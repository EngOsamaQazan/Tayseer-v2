# Tayseer ERP v2 - Agent Instructions

## Project Overview

Tayseer ERP (نظام تيسير) is a multi-tenant installment/financing company management system built with NestJS + TypeScript + PostgreSQL. The API lives in the `api/` directory.

## Cursor Cloud specific instructions

### Services

| Service | How to run |
|---|---|
| PostgreSQL | `sudo pg_ctlcluster 16 main start` (must be running before the API) |
| NestJS API | `cd api && pnpm run start:dev` (dev mode with hot reload on port 3000) |
| Swagger UI | Available at `http://localhost:3000/api/docs` once API is running |

### Database setup (one-time, already done in snapshot)

PostgreSQL is pre-installed. The dev database uses:
- DB: `tayseer_dev`, User: `tayseer`, Password: `tayseer123`
- Config is in `api/.env` (gitignored)
- TypeORM `synchronize: true` in dev mode auto-creates/updates tables

### Key gotchas

- **ESLint glob pattern**: The `pnpm run lint` script uses escaped braces that may not expand in all shells. Run `npx eslint "src/**/*.ts"` directly from `api/` if the npm script fails.
- **pnpm build warnings**: pnpm may warn about ignored build scripts (`@nestjs/core`, `@scarf/scarf`, `unrs-resolver`). These do not affect functionality.
- **Tenant isolation**: All data operations require a valid JWT. Register first via `POST /api/v1/auth/register` to create a tenant + admin user, then login via `POST /api/v1/auth/login`.

### Standard commands (from `api/`)

See `api/package.json` scripts and `api/README.md` for full reference:
- Lint: `pnpm run lint` or `npx eslint "src/**/*.ts"`
- Test: `pnpm run test`
- Build: `pnpm run build`
- Dev server: `pnpm run start:dev`
