# @forma/medusa

Medusa v2 backend for FORMA. Pinned to Medusa `2.22.1`.

## Local setup

1. Copy `.env.example` to `.env` and fill in local values.
2. Create the managed Neon Postgres and Upstash Redis services described in
   `docs/managed-services.md` (or run local equivalents).
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
pnpm --filter @forma/medusa verify:catalog
pnpm --filter @forma/medusa verify:payments
pnpm --filter @forma/medusa verify:payment-truth
pnpm --filter @forma/medusa verify:notifications
```

`seed` is idempotent: it looks up sales channels, regions, tax regions, stock
locations, shipping options, categories, collections, products, and inventory
levels by stable natural keys before creating anything. Existing products are
left untouched, so reset the development database when the catalogue shape
changes. The seed writes **provisional development prices only**; see the
"Product price migration to RON" entry in the `PLAN.md` decision log.

`verify:catalog` checks the seeded counts, RON prices, tax-inclusive
preferences, 21% VAT, 25 RON shipping, inventory levels, `ro`/`en` locales,
store defaults, and the publishable-key link. `verify:payments` fails until real
Stripe test credentials replace the `.env.example` placeholders.

`verify:payment-truth` reads the payment, capture, and refund records through
Medusa's Query API and enforces the capture gate. Set `ORDER_ID` (or
`PAYMENT_COLLECTION_ID`), and optionally `EXPECT_PROVIDER` and
`EXPECT_CAPTURED_AMOUNT` in minor units:

```powershell
$env:ORDER_ID = "order_..."
$env:EXPECT_PROVIDER = "pp_stripe_stripe"
$env:EXPECT_CAPTURED_AMOUNT = "42000"
pnpm --filter @forma/medusa verify:payment-truth
```

It requires exactly one payment, one full-amount capture, and no refunds, and
it matches the collection totals against the individual captures and refunds.
It never calls the provider and never reads provider metadata, so it works
whether or not a `payment.captured` event was delivered.

`verify:notifications` renders the registered transactional templates, checks
HTML escaping and unknown-template failure, and dispatches one notification
through the Notification Module using the local `feed` provider. It never calls
Resend. The adapter lives in `src/modules/resend-notification/`, with templates
in `src/modules/resend-notification/templates/`. The Resend provider is
registered only when `RESEND_API_KEY` and `RESEND_FROM` contain real,
non-placeholder values; otherwise Medusa keeps its local provider. The provider
logs the Resend message ID and never the API key or recipient address. Add and
register a template before emitting a new template name.

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
  registered only when their values are present and are not `.env.example`
  placeholders. Missing values in development fall back to Medusa's
  in-memory/local defaults.
- Resend is registered only when `RESEND_API_KEY` and `RESEND_FROM` are real
  values. `RESEND_FROM` must be a verified sender such as
  `FORMA <orders@your-domain>`; configure SPF, DKIM, and DMARC before sending
  production order email.
- `PUBLIC_ASSET_BASE_URL` is the public origin used to build catalogue image
  URLs during seeding. It defaults to `http://localhost:3000`; production must
  use the public R2/custom-domain origin.
- Public catalogue assets and private customer uploads use separate R2 buckets
  and credentials. Never put a private upload in the public bucket.
- Do not commit `.env`, keys, customer photographs, or uploaded files.

Validation lives in `src/lib/env.ts`; `medusa-config.ts` calls it before boot.
Missing or malformed values produce one `EnvValidationError` listing every
problem instead of a partial boot.

## Scope

This is a Phase 1 scaffold. Catalogue seeding and verification are in place;
the standalone Admin build and the remaining Stripe/R2 flows are still being
completed in Phase 1. Commissions, quotes, and private uploads follow in later
phases. See `PLAN.md` for the authoritative task list.
