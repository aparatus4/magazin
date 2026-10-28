# @forma/storefront

Next.js App Router storefront for FORMA. Pinned to Next.js `16.4.3` and React
`19.3.1`.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in local values.
2. Start the Medusa backend.
3. From the repository root:

   ```powershell
   pnpm install
   pnpm --filter @forma/storefront dev
   ```

The storefront runs at `http://localhost:3000`.

## Commands

```powershell
pnpm --filter @forma/storefront dev
pnpm --filter @forma/storefront build
pnpm --filter @forma/storefront typecheck
pnpm --filter @forma/storefront lint
```

## Routing and currency

- Public routes are `/ro` (default) and `/en`. `/` redirects to `/ro`.
- Romanian is primary; English is secondary. Emit `hreflang` alternates.
- RON is authoritative for catalogue prices, carts, checkout, orders, payment,
  analytics purchase values, and JSON-LD.
- EUR is an indicative display only, labelled with its rate date. Never send a
  converted EUR value to Medusa, checkout, payment, analytics, or structured
  data.

## Scope

This is a Phase 0 scaffold. The shared layout, navigation, catalogue, cart,
checkout, portrait flow, custom quote flow, CMS pages, and SEO metadata are
implemented in later phases. See `PLAN.md`.
