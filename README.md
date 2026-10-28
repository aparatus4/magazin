# FORMA

FORMA is a 3D-printing atelier storefront. This repository is migrating the
existing Vite + React concept site to a production storefront built on Medusa
v2, Next.js, and Payload CMS.

`PLAN.md` is the single source of truth for architecture, decisions, phases,
security requirements, and the session log. Read it before changing the
workspace.

## Status

Phase 0 (foundation) is in progress. The original concept storefront is
preserved under `legacy/` and remains runnable while the replacement is built.
The new applications are scaffolded in phase-sized increments; do not treat
unfinished routes as production-ready.

## Pinned runtime

| Tool | Version |
| --- | --- |
| Node.js | 24.22.2 (`.node-version`) |
| pnpm | 11.25.0 (`packageManager`) |
| TypeScript | 5.9.3 |
| Zod | 4.6.7 |
| Medusa | 2.22.1 (target; see `PLAN.md`) |
| Next.js | 16.4.3 (target; see `PLAN.md`) |
| React | 19.3.1 (target; see `PLAN.md`) |
| Payload CMS | 3.92.1 (target; see `PLAN.md`) |

Medusa requires Node `>=22.22.0`; Payload 3.92 requires Node `^22.23.4` or
`>=24.22.1`. The workspace pins Node 24.22.2 so both are supported. The
repository uses Nodist locally; `.node-version` makes the requirement explicit
for other version managers.

## Layout

```text
apps/storefront          Next.js App Router storefront (planned)
apps/medusa              Medusa v2 backend and Admin SPA (planned)
apps/cms                 Payload 3 CMS on Neon Postgres (planned)
apps/private-media-worker Phase 0 placeholder; functional worker in Phase 3
packages/contracts       Shared strict Zod contracts (@forma/contracts)
legacy/                  Preserved Vite concept storefront
scripts/                 Repository-level functional and security checks
```

## Commands

```powershell
pnpm install
pnpm dev:legacy        # http://127.0.0.1:5173
pnpm build:legacy
pnpm test:legacy       # requires the legacy dev server on port 5173
pnpm baseline:capture  # writes shots/baseline/ from the legacy dev server
pnpm contracts:build
pnpm typecheck
```

`pnpm test:legacy` runs the 13-check Playwright baseline in
`scripts/functional-test.mjs`. It expects Chrome or Edge at the paths the script
probes and a running legacy dev server. Set `CHROME_PATH` to override the
browser location. `pnpm baseline:capture` captures the design reference into
`shots/baseline/` (ignored by Git); see `docs/visual-baseline.md`.

## Currency and locale rules

- **RON is authoritative.** Catalogue prices, carts, checkout, orders, payment
  amounts, analytics purchase values, and JSON-LD always use RON minor units.
- **EUR is display-only.** A server-side converter may show an indicative EUR
  amount with its rate date and label. Converted EUR values must never reach
  Medusa, checkout, payment, analytics purchase values, or structured data.
- **Romanian is primary.** Public routes are `/ro` (default) and `/en`, with
  `hreflang` alternates. Do not add an unprefixed public route.
- The launch market is Romania only. Do not create an EU/EUR region or enable
  international shipping until that decision is recorded in `PLAN.md`.

## Environment and secrets

Each application owns an `.env.example` with placeholder values only. Copy it
to a local `.env` and fill in real values outside version control. Never commit
API keys, database URLs, R2 credentials, Stripe secrets, customer photographs,
or uploaded customer files. Deployment validation must reject placeholder
values and wildcard origins.

## Assets and attribution

The portrait head scan in `legacy/public/models/` is CC BY 3.0. Keep its
attribution and license file with the asset. The current CGI product renders are
launch placeholders; real studio/people/product photography is required before
public launch.

## Content integrity

Do not invent reviews, review counts, product counts, scarcity, delivery
promises, or instant-quote capabilities. Publish only records that exist in
Medusa/Payload. Google Business Profile reviews, when added, are attributed and
never count as verified product ratings or feed `Review` structured data.

## Legal placeholders

The legal entity, registered address, contact email, and production domain are
placeholders until verified. They are launch blockers; do not publish them as
facts.
