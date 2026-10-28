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

- `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, CORS origins,
  Stripe keys, R2 credentials, and Resend credentials come from the environment.
- Production startup must fail when required values are missing or still set to
  placeholders. CORS origins must be exact HTTPS origins; never use `*` or
  `null`.
- Public catalogue assets and private customer uploads use separate R2 buckets
  and credentials. Never put a private upload in the public bucket.
- Do not commit `.env`, keys, customer photographs, or uploaded files.

## Scope

This is a Phase 0 scaffold. Catalogue seeding, Stripe, R2 providers, the Redis
workflow engine, custom commissions/quotes modules, and Admin customization are
implemented in later phases. See `PLAN.md` for the authoritative task list.
