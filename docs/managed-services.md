# Managed services checklist

Phase 1 needs a Postgres database and a Redis instance. Phase 2+ adds search,
payments, storage, email, and hosting. Accounts and projects must be created by
the repository owner; this document lists what to create and where each value
belongs.

**Never paste secrets into chat, commit them, or put them in `.env.example`.**
Write real values only to the Git-ignored `.env` file of the owning app.

## Naming and region

Use one environment prefix and the EU region closest to Romania:

| Environment | Prefix | Region |
| --- | --- | --- |
| Development | `forma-dev` | EU (Frankfurt / `eu-central-1`) |
| Staging | `forma-staging` | EU (Frankfurt / `eu-central-1`) |
| Production | `forma-prod` | EU (Frankfurt / `eu-central-1`) |

Do not reuse development credentials in staging or production.

## Phase 1 — required now

### Neon (Postgres)

Create two projects (or one project with two databases):

- [ ] `forma-medusa-dev` — Medusa database.
- [ ] `forma-cms-dev` — Payload database.

Use the pooled connection string for the app and the direct connection string
for migrations. Put the Medusa value in `apps/medusa/.env` as `DATABASE_URL`
and the Payload value in `apps/cms/.env` as `DATABASE_URL`.

### Upstash (Redis)

- [ ] `forma-redis-dev` — Redis database in the EU region.

Use the TLS `rediss://` URL. Put it in `apps/medusa/.env` as `REDIS_URL`.

### Stripe (test mode)

- [ ] Create or use a Stripe account with Romania as the business country.
- [ ] Create a test-mode API key and webhook secret.

Put `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` in `apps/medusa/.env`. Put
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `apps/storefront/.env.local`. Do not
enable live mode before the Phase 6 launch checklist.

## Phase 2–3 — needed before the related flow ships

### Cloudflare R2

- [ ] Public bucket for catalogue images and GLBs.
- [ ] Private staging bucket for customer uploads.
- [ ] Private quarantine bucket.
- [ ] Separate access keys per role: public assets, staging upload, quarantine
      writer, worker read-only, and download signer.

Follow the variable list in `apps/medusa/.env.example`. Never give the parser
sandbox an R2 credential.

### Resend

- [ ] Verify the production sending domain (SPF, DKIM, DMARC).
- [ ] Create a development API key.

Put `RESEND_API_KEY` and `RESEND_FROM` in `apps/medusa/.env`.

### Meilisearch Cloud

- [ ] `forma-search-dev` in the EU region.

Put `MEILISEARCH_HOST` and `MEILISEARCH_API_KEY` in the storefront and Medusa
environment files as required by Phase 2.

## Phase 6 — hosting

- [ ] Vercel project for the storefront.
- [ ] Vercel project for the Payload CMS.
- [ ] Railway/Fly/Render service for Medusa.
- [ ] Separate static host for the Medusa Admin SPA.
- [ ] PostHog project (EU region) and Sentry project.

## After creating the projects

1. Copy the relevant `.env.example` to `.env` (or `.env.local` for Next.js)
   and fill in the values locally.
2. Run `pnpm --dir apps/medusa exec medusa db:migrate` once Phase 1 wiring is in
   place.
3. Confirm `pnpm --filter @forma/medusa dev` starts and `http://localhost:9000/health`
   returns OK.
4. Record completion in `PLAN.md` Section 9.3 and the session log. Never record
   the secret values themselves.
