# @forma/medusa

Medusa v2 backend for FORMA. Pinned to Medusa `2.22.1`.

## Local setup

1. Copy `.env.example` to `.env` and fill in local values.
2. Start PostgreSQL and Redis.
3. From the repository root:

   ```powershell
   pnpm install
   pnpm --filter @forma/medusa exec medusa db:migrate
   pnpm --filter @forma/medusa dev
   ```

The backend runs at `http://localhost:9000`; Medusa Admin is served at
`http://localhost:9000/app` by default. Phase 1 moves Admin to the standalone
Vite build described in `PLAN.md`.

## Commands

```powershell
pnpm --filter @forma/medusa build
pnpm --filter @forma/medusa typecheck
pnpm --filter @forma/medusa exec medusa db:migrate
pnpm --filter @forma/medusa exec medusa db:generate <module-name>
pnpm --filter @forma/medusa seed
```

## Environment rules

- `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, and the three CORS
  origins are required for every command except `medusa build`.
- `medusa build` intentionally skips the required-value check so CI can build
  with dummy values. It still validates formats for any value that is present.
- In production (`NODE_ENV=production`) Stripe, public R2, and Resend values are
  also required. Placeholder values such as `replace_me`, `changeme`, or
  `supersecret` are rejected, and every CORS origin must be exact HTTPS.
- `ADMIN_PATH` defaults to `/app`. Set `ADMIN_BACKEND_URL` only when the Admin
  SPA is hosted separately from the API.
- Stripe, the Redis workflow engine, and the public R2 file provider are
  registered only when their values are present. Missing values in development
  fall back to Medusa's in-memory/local defaults.
- Public catalogue assets and private customer uploads use separate R2 buckets
  and credentials. Never put a private upload in the public bucket.
- Do not commit `.env`, keys, customer photographs, or uploaded files.

Validation lives in `src/lib/env.ts`; `medusa-config.ts` calls it before boot.
Missing or malformed values produce one `EnvValidationError` listing every
problem instead of a partial boot.

## Scope

This is a Phase 1 scaffold. Catalogue seeding, the standalone Admin build, and
the remaining Stripe/R2 flows are implemented in Phase 1; commissions, quotes,
and private uploads follow in later phases. See `PLAN.md` for the authoritative
task list.
