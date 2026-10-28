# @forma/cms

Payload 3 CMS for FORMA, running on Neon Postgres. Pinned to Payload `3.92.1`.

## Local setup

1. Copy `.env.example` to `.env` and set a local Postgres `DATABASE_URL` and a
   random `PAYLOAD_SECRET`.
2. From the repository root:

   ```powershell
   pnpm install
   pnpm --filter @forma/cms dev
   ```

The CMS runs at `http://localhost:3001`; the admin is at `/admin`.

## Commands

```powershell
pnpm --filter @forma/cms dev
pnpm --filter @forma/cms build
pnpm --filter @forma/cms typecheck
pnpm --filter @forma/cms generate:types
pnpm --filter @forma/cms generate:importmap
```

## Content rules

- Romanian is the default locale; English is the fallback locale.
- The CMS owns editorial pages, projects, journal articles, materials, and
  legal copy. Commerce records (products, prices, inventory, orders, reviews)
  stay in Medusa.
- Never publish invented reviews, counts, scarcity, or delivery promises.
- Do not store customer photographs or private uploads in the CMS media
  collection; those belong in private R2 storage.

## Scope

This is a Phase 0 scaffold with Users and Media collections. The content model
is implemented in Phase 5. See `PLAN.md`.
