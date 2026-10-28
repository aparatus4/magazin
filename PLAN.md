# FORMA — Storefront & Medusa Migration Plan

> **Single source of truth.** Read this before starting work.
>
> **Last updated:** 2026-10-28
>
> **Status:** Static concept site complete. Medusa v2 architecture corrections, implementation-ready Phase 1–4 specifications, and adopted security hardening are documented; implementation not started.
>
> **Next action:** Complete Phase 0 workspace/runtime/hosting setup: create the `migration/medusa` branch, pin Node/pnpm, create the pnpm workspace and `packages/contracts`, move the Vite app to `legacy/`, scaffold the apps, add env examples/README/CI, and create the managed-service projects.

---

## Document map

| Section | Use it for |
| --- | --- |
| 0 | Resume/update protocol and definition of done |
| 1 | Current project state, inventory, metrics, quirks |
| 2–3 | Confirmed decisions, recommended defaults, open questions |
| 4 | Target routes, navigation, home structure, page templates |
| 5 | Medusa entities, metadata, custom modules, CMS, seed mapping |
| 6–8 | Frontend architecture, integrations, SEO/performance/a11y/security and Section 8.7 threat model/release gates |
| 9 | Phased task list and acceptance criteria |
| 10–14 | Risks, decision log, backlog, session log, quick reference |

**If you only read one thing:** Section 0.1 → Section 9.1 → the next unchecked task.

---

## 0. How to use this plan

### 0.1 Current focus

| Field | Value |
| --- | --- |
| Current phase | **Phase 0 — Foundation** |
| State | Workspace scaffolded and verified on 2026-10-28: Node 24.22.2 + pnpm 11.25.0 pinned; pnpm workspace with `apps/storefront` (Next.js 16.4.3), `apps/medusa` (Medusa 2.22.1), `apps/cms` (Payload 3.92.1), `packages/contracts`, and the preserved Vite app in `legacy/`. `pnpm build`, `pnpm typecheck`, `pnpm lint`, and the 13-check legacy Playwright suite pass. Phase 0 decisions remain recorded; portrait/product pricing and legal details stay open. |
| Next action | Add CI (lint/typecheck/build/legacy tests, then security invariants when `scripts/security/check-invariants.sh` exists), add the `apps/private-media-worker` Phase 0 placeholder, document the visual baseline, and create the managed-service projects (user-assisted). Then start Phase 1 (Medusa foundation). |
| Blocking decisions | Phase 0: portrait pricing (deferred; config-driven, no published numbers), product price migration to RON, legal entity/address/contact/domain, and managed-service accounts. Before the first Commission DML migration: staff-role policy. Before enabling cancellation/refund commands: cancellation/refund policy. Before Phase 3 release: private-asset delivery, retention periods, and hard upload-size gateway. |
| Current app | Legacy Vite + React concept storefront in `legacy/` at `http://127.0.0.1:5173`; new apps are scaffolds, not runnable storefronts yet. |
| Current verification | `pnpm build` passes (contracts, storefront, CMS, Medusa backend + Admin, legacy); `pnpm typecheck` and `pnpm lint` pass; `pnpm test:legacy` passes 13/13 on 2026-10-28. |
| Workspace | `E:\dev\rob\maga` (Windows, PowerShell; Node 24.22.2 via Nodist, pnpm 11.25.0) |

### 0.2 Resume protocol

When starting a new session, do this in order:

1. Read Sections 0–3 and the task list for the current phase.
2. Check repository state:
   ```powershell
   git status
   git log --oneline -5
   ```
3. Check the current app still builds and the dev server starts:
   ```powershell
   npm run build
   npm run dev
   ```
   The current concept app uses port `5173`. Future Next.js/Medusa ports are listed in Section 14.
4. Open Section 9 and pick the next unchecked task in the current phase.
5. If the task depends on an unresolved decision in Section 3, ask only about that decision. Otherwise use the documented default.
6. Work in small increments. Keep the current site runnable until the replacement reaches parity.
7. Before ending a session, update:
   - Section 0.1 (current phase / next action)
   - The phase status table in Section 9
   - Completed checkboxes
   - Section 11 decision log if a decision changed
   - Section 13 session log with a one-paragraph note
8. Commit the plan update with the code.

### 0.3 Update protocol

- This file is the source of truth for scope, decisions, routes, data model, and phase status.
- Do not silently re-litigate confirmed decisions. Record changes in the decision log.
- If a task reveals a missing requirement, add it to the relevant phase or the backlog rather than expanding scope mid-phase.
- Prefer adding a short note over rewriting history. The decision log and session log are append-only.
- Use `- [ ]` / `- [x]` checklists so progress is visible.

### 0.4 Definition of done (global)

A task is done only when:

- Code builds and type-checks.
- Relevant tests pass, or a failure is documented with a follow-up task.
- Desktop and mobile layouts have been checked.
- Keyboard and screen-reader basics are checked for new interactive UI.
- SEO metadata exists for new public pages.
- No secrets, private customer photos, or API keys are committed.
- This plan is updated.
- The change is committed with a descriptive message.

---

## 1. Project snapshot

### 1.1 Brand and product

**FORMA** — a Brooklyn 3D-printing atelier. Tagline: **“Objects, made personal.”**

The store covers everything a 3D printer can do, but the flagship is a personalised portrait bust made from customer photographs. The experience should feel premium, quiet, editorial, and Apple-inspired: warm ivory, sage, sand, generous whitespace, rounded forms, soft glass/light effects, serif-italic accents.

Product principles:

- The portrait commission is the emotional flagship.
- Show range through curated categories and clear paths, not an exhaustive homepage.
- 3D should be functional — configurable finishes, product turntables, AR, instant quote previews — not only decoration.
- Claims must be honest: no fake reviews, stock counts, scarcity, or “86+ pieces” if the catalogue has 14.
- Human craft, real materials, and process are differentiators.
- Mobile-first; performance and accessibility are part of the premium feel.
- Keep the current visual language unless a deliberate redesign is approved.

### 1.2 Current stack

| Area | Current |
| --- | --- |
| Frontend | React 18.3.1, TypeScript 5.6.3, Vite 5.4.11 |
| 3D | Three.js 0.170.0, procedural objects + one GLB head scan |
| Icons | lucide-react 0.468.0 |
| Styling | Custom CSS (`src/styles/*.css`), locally hosted fonts |
| State | React context (`src/state/store.tsx`), localStorage cart |
| Backend | None — static/demo only |
| Tests | Playwright functional smoke suite (13 checks) |
| Build | `tsc -b && vite build` |
| Dev server | `http://127.0.0.1:5173` |
| Git | Repository on `main`; baseline tag `baseline-static-site` marks the pre-migration static site |

### 1.3 Current inventory

**App shell**

- `src/App.tsx` — single-page composition
- `src/components/Header.tsx`, `MegaMenu.tsx`, `MobileMenu.tsx`, `Footer.tsx`

**Home sections**

- `Hero.tsx`, `HeroScene.tsx`
- `TrustStrip.tsx`
- `PortraitStudio.tsx`
- `CategoryGrid.tsx`
- `Collection.tsx`, `ProductCard.tsx`
- `CustomBureau.tsx`
- `Materials.tsx`
- `Projects.tsx`
- `Reviews.tsx`
- `Newsletter.tsx`
- `Reveal.tsx`

**Overlays**

- `src/components/overlays/CartDrawer.tsx`
- `QuickView.tsx`
- `SearchOverlay.tsx`
- `ProjectModal.tsx`
- `Toast.tsx`

**3D and rendering**

- `src/lib/three/studio.ts`, `portrait.ts`, `printer.ts`, `objects.ts`
- `src/components/PortraitViewer.tsx`, `PrinterViewer.tsx`, `FinishViewer.tsx`
- `src/render/RenderStudio.tsx` — internal route for generating product/project renders
- `scripts/renders.mjs` — render generator

**Data and state**

- `src/data/catalog.ts` — 10 categories, 14 products, 6 projects, 6 reviews, finishes, services, process steps, trust items
- `src/state/store.tsx` — cart, overlays, collection filters, toast

**Assets**

- `public/renders/` — 20 JPEG product/project images (about 0.9 MB total)
- `public/fonts/` — Inter Tight + Instrument Serif italic, local WOFF2
- `public/models/portrait-head.glb`, texture, and licence
- `public/favicon.svg`

**Scripts**

- `scripts/functional-test.mjs` — 13-check Playwright suite
- `scripts/renders.mjs` — product/project image generation

### 1.4 Current metrics

- Catalogue: **14 products** across 10 categories; 6 projects; 6 seeded reviews.
- Mobile homepage height: roughly **18,500 px at 390 px wide** (about 22 screens).
- Production JS: **920.13 kB** (252.11 kB gzip); CSS: **115.52 kB** (21.54 kB gzip).
- Images: 20 files, about **0.9 MB total**, average 44 kB.
- Functional suite: **13/13 (six consecutive runs, 2026-10-28)**. The mobile-menu check now waits for hydration after closing the desktop page, removing the software-rendered 3D contention that caused intermittent timeouts.
- Build: passing.

### 1.5 Known constraints and quirks

- **UTF-8 without BOM** is required for JSON/config files. A BOM previously crashed Vite. The `write`/`edit` tools should be safe, but verify if a config file is created by another tool.
- Windows/PowerShell environment. Use repo-relative paths in docs.
- React StrictMode was removed in the concept app to avoid double WebGL scene initialization. Revisit deliberately in Next.js; do not disable it without understanding the 3D lifecycle.
- The built-in browser screenshot tool is unreliable here. Playwright with local Chrome works; headless WebGL uses SwiftShader.
- Full-page screenshots of the long concept page duplicate content. Use viewport/section screenshots during QA.
- 3D element screenshots do not capture WebGL canvas content; use viewport screenshots.
- The head scan is **LeePerrySmith.glb**, CC BY 3.0. Attribution is required in the footer and in any new product page that uses it.
- The current catalogue copy advertises “86+”, “64+”, etc. while only 14 products exist. Resolve this before launch.
- The current app is the design reference. Do not delete it until the replacement reaches parity; it is preserved in the `baseline-static-site` tag and now lives in `legacy/`.

### 1.6 Demo-only features (must become real or be labelled)

- Cart and checkout: localStorage only, no payment.
- Newsletter and project forms: simulated.
- Reviews: seeded, not verified purchases.
- Search: local filtering only.
- No customer accounts, order history, inventory, shipping rates, tax, emails, analytics, consent, or legal pages.
- No backend or content management.

---

## 2. Confirmed decisions and recommended defaults

### 2.1 Confirmed

- Keep the FORMA brand and current visual direction.
- Use **Medusa** (MedusaJS) for the backend.
- Move from a single long page to a **hub-and-spoke** structure: a curated home that drives to dedicated pages.
- Home should showcase the strongest selling points and only a little of the rest.
- Add dedicated product/category pages, a portrait commission flow, a custom-print quote flow, deeper catalogue content, human proof, performance, and accessibility work.
- The current static site is the baseline/reference, not the final architecture.
- **Launch catalogue:** seed the truthful 14 products, design taxonomy/collections for 40–60, and remove “86+”/“64+” style claims immediately.
- **CMS:** Payload 3 (Next.js-native) on Neon Postgres for projects, journal, materials, homepage modules, and About content. Commerce data stays in Medusa.
- **Launch market:** Romania only; checkout in **RON**. **EUR is an indicative display currency** until an EU/EUR region with shipping is approved. Never treat the EUR conversion as a checkout price.
- **Languages:** Romanian primary and English secondary, routed as `/ro` (default) and `/en`, with hreflang and localized metadata.
- **Tax/pricing:** VAT-inclusive displayed prices, Romanian VAT configured in Medusa; no multi-country tax at launch.
- **Returns:** EU 14-day withdrawal right on stock items; custom/commission pieces non-returnable after proof approval.
- **Reviews:** custom Medusa verified-review module plus an optional attributed Google reviews band. Google reviews never count as verified product ratings.
- **Photography:** CGI renders for launch; real studio/people/product photography before public launch.
- **Infrastructure:** managed services (Vercel, Railway/Fly/Render, Neon, Upstash, Cloudflare R2, Meilisearch Cloud, Payload app, Resend, Stripe).
- **Trade/wholesale:** out of launch scope.
- **Open:** portrait pricing and product RON prices remain configuration/business decisions; do not publish placeholder numbers.

### 2.2 Recommended defaults — confirm during Phase 0

| Decision | Recommendation | Why |
| --- | --- | --- |
| Frontend | **Next.js App Router + TypeScript**, keep custom CSS | SSR/ISR, SEO, metadata, server cart, product pages |
| Repo layout | **pnpm workspace**: `apps/storefront`, `apps/medusa`, `apps/cms`, `apps/private-media-worker`, `packages/contracts`, `legacy/` | One CI and one place for docs; current app preserved |
| CMS | **Payload 3** (Next.js-native) on Neon Postgres for projects, journal, materials editorial, homepage modules, About | Commerce stays in Medusa; editors get a real CMS; no separate content SaaS |
| Search | **Meilisearch** | Typo tolerance, synonyms, instant search, easy indexing |
| Reviews | **Custom Medusa module** tied to orders, plus an attributed Google reviews band | Verified reviews, commission reviews, full design control; Google reviews are never verified product ratings |
| 3D | Keep Three.js hero; **GLB + `<model-viewer>`** for product AR; custom viewer for finish switching | Best balance of quality, AR support, and control |
| Hosting | Vercel (storefront + Payload CMS), Railway/Fly/Render (Medusa), Neon (Postgres), Upstash (Redis), Cloudflare R2, Meilisearch Cloud, Resend, Stripe | Managed, low-ops, scales with a small studio |
| Analytics | **PostHog** with consent; GA4 optional | Funnels, session replay, experiments |
| Currency/markets | Romania region in **RON** at launch; **EUR indicative display only**; Romanian primary / English secondary (`/ro`, `/en`); structure for an EU/EUR region later | Native Medusa one-currency-per-region model; avoids a custom dual-currency checkout |
| Payments | Stripe via Medusa payment provider | Deposits, balances, webhooks, PCI compliance |
| Portrait deposit | 30% at booking; pricing and deposit remain provisional until portrait pricing is confirmed | Standard for commissioned work; confirm |
| Custom quote deposit | 50% at acceptance; Phase 4 v1 uses one full-payment checkout unless a deposit decision is recorded | Confirm |
| Catalogue | Seed the current 14, structure for 40–60, fix misleading counts immediately | Honest content now, room to grow |
| Launch markets | Romania only; EU later once shipping/tax is proven | Confirmed 2026-10-28 |

### 2.3 Explicitly out of scope for launch

- AR is desirable but can follow the commerce spine.
- Trade/wholesale portal, net terms, and volume accounts.
- Additional currencies beyond RON/EUR and additional languages beyond Romanian/English.
- Loyalty, referrals, gift cards.
- AI-generated portrait likenesses. The commission flow should be honest about artist-led sculpting unless a vetted 3D-scan/AI pipeline is added later.
- Full ERP integration. Medusa Admin plus focused widgets is enough.

---

## 3. Open decisions

| # | Decision | Why it matters | Default if no answer | Status |
| --- | --- | --- | --- | --- |
| 1 | **Catalogue depth:** expand to 40–60 products or consolidate to a truthful 14? | Determines category pages, seed data, merchandising, and copy | Seed 14 now; design for 40+; fix “86+” claims immediately | **Confirmed 2026-10-28** — seed 14, design for 40–60, remove inflated counts |
| 2 | **Portrait pricing:** sizes, finishes, plinth options, lead time, deposit | Needed for configurator, checkout, and copy | 18/24/30 cm; from $189; 3–5 weeks; 30% deposit | **Open** — explicitly deferred; build config-driven pricing, publish no numbers until real costs/margins are supplied |
| 3 | **Custom quote rules:** processes, materials, max build volume, formats, pricing formula, turnaround | Needed for quote module and pricing engine | FDM/SLA/SLS; STL/OBJ/3MF instant; STEP manual review; 3–5 days for complex | **Confirmed 2026-10-28** — defaults accepted; actual rates/build envelope still required before instant pricing |
| 4 | **Shipping/returns/tax:** regions, DDP/DDU, returns policy | Checkout and legal copy | US/UK/EU; DDP where possible; 30-day returns on stock; custom non-returnable after proof approval | **Confirmed 2026-10-28** — Romania-only launch; VAT-inclusive RON prices with Romanian VAT via Medusa tax; EU 14-day withdrawal on stock; custom non-returnable after proof approval; carrier/rates TBD |
| 5 | **CMS:** Sanity vs Payload vs MDX | Content workflow and deployment | Sanity; MDX only if launch speed matters more than editor workflow | **Confirmed 2026-10-28** — Payload 3 on Neon Postgres |
| 6 | **Reviews:** custom vs third-party | Verification, moderation, commission reviews | Custom Medusa module | **Confirmed 2026-10-28** — custom verified module plus attributed Google reviews band (not verified product ratings) |
| 7 | **Photography:** CGI-only or real studio/people/product shoot? | The biggest remaining trust gap | Keep CGI for launch; commission real photos for About/studio/portrait before launch | **Confirmed 2026-10-28** — CGI now; real photos before public launch |
| 8 | **Infrastructure/accounts:** managed services vs self-host | Cost, ops, deployment | Managed services listed in 2.2 | **Confirmed 2026-10-28** — managed services; accounts still to create |
| 9 | **Legal/entity/address:** business name, address, policies, contact email | Required for policies, emails, local SEO | Treat the current address and `studio@forma.example` as placeholders; replace with verified details before launch | **Open** — placeholders until verified; launch blocker |
| 10 | **Trade/wholesale at launch?** | Adds account and pricing complexity | No; phase 7 | **Confirmed 2026-10-28** — no wholesale at launch |
| 11 | **Multi-currency/language at launch?** | Region and content complexity | No; USD/English | **Confirmed 2026-10-28** — RON checkout + EUR indicative display; `/ro` default + `/en`; EU/EUR region later |
| 12 | **Domain, email, and social handles** | Launch requirement | TBD | **Open** — placeholders until verified; launch blocker |
| 13 | **Product price migration to RON:** how to convert/reprice the 14 seed products | Wrong prices/margins and misleading savings | Keep current numbers as placeholders; do not seed them as RON until a documented conversion/margin review | **Open** — blocks Phase 1 catalogue seeding |

When a decision is confirmed, move it to Section 2.1 and add an entry to the decision log in Section 11.

---

## 4. Target architecture

### 4.1 Hub-and-spoke model

- **Home is the trailer, not the film.** Every section either creates desire/trust or routes to a page with the detail.
- Inventory lists belong in `/shop`; long explanations belong on their own pages; proof points get a short home strip and a deeper page.
- Home budget: **8–10 sections, roughly 6–8 mobile screens, one primary CTA per section.**
- Keep the emotional brand moments — hero, portrait story, selected projects — on home. Move the exhaustive content elsewhere.

### 4.2 Sitemap

| Route | Job | Primary CTA |
| --- | --- | --- |
| `/` | Brand, flagship portrait, curated objects, pathways | Commission a portrait / Shop objects |
| `/shop` | Full catalogue with filters, sort, search | Add to bag |
| `/shop/[category]` | Category landing with unique intro and products | View product |
| `/shop/[category]/[subcategory]` | Leaf category, only when it has 3+ products and unique content | View product |
| `/collections/[slug]` | Curated edits: Studio Picks, Ready to Ship, Gifts, Under $100 | Shop the edit |
| `/products/[handle]` | Product detail, finishes, 3D/AR, reviews, shipping | Add to bag |
| `/portrait-studio` | Flagship service, gallery, process, pricing, FAQ | Start a portrait |
| `/portrait-studio/start` | Photo upload, style/size/finish, deposit | Book the commission |
| `/portrait-studio/gallery` | Completed commissions, before/after | Start yours |
| `/custom-printing` | Capabilities, materials, tolerances, use cases | Get a quote |
| `/custom-printing/quote` | Upload, preview, instant estimate | Accept estimate / request review |
| `/projects` | Case-study index with filters | Read the story |
| `/projects/[slug]` | Full case study with process, specs, result | Start a similar project |
| `/materials` | Material library, comparison, care, sample pack | Order samples / Shop objects |
| `/about` | Studio, people, machines, quality, sustainability | Visit / Contact |
| `/journal` + `/journal/[slug]` | Guides and editorial for SEO and trust | Read / Shop related |
| `/reviews` | Verified reviews across products and commissions | Shop / Commission |
| `/help` + `/contact` | FAQ, shipping, returns, care, file guidelines | Contact the studio |
| `/cart` | Medusa cart, cross-sell, shipping progress | Checkout |
| `/checkout` | Address, shipping, tax, Stripe payment | Place order |
| `/account` | Orders, addresses, commissions, proof approvals | Track order |
| `/account/commissions/[id]` | Commission timeline and proof approval | Approve proof |
| `/privacy`, `/terms`, `/accessibility` | Legal and trust | — |

### 4.3 Navigation

Top navigation, maximum five items:

**Shop · Portrait Studio · Custom Printing · Projects · Studio**

- Shop opens the mega menu with the 10 categories, featured collection, and “Shop all”.
- Reviews, Journal, Help, Materials, and legal live in the footer and in context.
- Header utilities: search, account, bag.
- Mega menu links to real category pages, not filters on the homepage.
- Mobile: accordion categories, clear “Shop all”, search, account, bag.

### 4.4 Home page

| # | Section | Purpose | Source | CTA |
| --- | --- | --- | --- | --- |
| 1 | Hero (3 slides) | Portrait flagship, objects, custom printing | CMS + product refs | One CTA per slide |
| 2 | Trust strip | Materials, lead times, guarantee, worldwide delivery | CMS/config | — |
| 3 | The Portrait | The signature offer, price from, process, gallery | CMS + commission config | Commission a portrait |
| 4 | Studio picks / ready to ship | 8 products, not the full catalogue | Medusa collection | Shop all |
| 5 | The ten disciplines | Compact index of all categories | Medusa categories | Explore category |
| 6 | Custom printing | One proposition + quote CTA | CMS | Get a quote |
| 7 | Selected projects | 3 case studies | CMS | All projects |
| 8 | Materials + reviews | Two compact proof bands | CMS + reviews module | Materials / Reviews |
| 9 | Newsletter + footer | Capture interest | Email provider | Subscribe |

Remove from home:

- The full 14-product grid (move to `/shop`).
- The ten large category cards (replace with the compact index).
- The full four-step process explainer (move to `/portrait-studio`).
- The full materials section (move to `/materials`).
- All six projects (show three).
- The full reviews carousel (show a short band).
- The full custom-bureau form (move to `/custom-printing/quote`).

Use “Studio picks” or “Ready to ship” until real sales data exists. Do not label products “best sellers” without evidence.

### 4.5 Page templates

#### Product page — `/products/[handle]`

- Breadcrumbs.
- Gallery: 4–6 images + 3D viewer; zoom; poster image.
- Title, price, availability, lead time, rating summary.
- Finish and size swatches; unavailable combinations disabled.
- Quantity, add to bag, gift note.
- Shipping estimate and returns link.
- Accordions: dimensions, materials, care, what’s included.
- Designer/studio note.
- Reviews with verified badge and photos.
- Related objects and “commission something similar”.
- Sticky mobile buy bar.
- Product + Offer + Review + Breadcrumb JSON-LD.
- Loading skeleton, out-of-stock, variant-unavailable, and error states.

#### Category page — `/shop/[category]`

- Category hero with unique 100–250-word intro.
- Subcategory chips and filters.
- Product grid with quick view.
- Editorial module: related project, material, or service.
- FAQ block targeting real search questions.
- CTA to custom printing or portrait studio where relevant.
- No thin pages: only create a leaf category when it has 3+ products and unique copy.

#### Portrait Studio — `/portrait-studio`

- Emotional hero with a completed bust.
- Gallery of real commissions (with permission).
- Process: photographs → artist sculpt → preview → print → hand-finish.
- Pricing tiers, sizes, finishes, plinth, lead time.
- What makes a good photo.
- Gift and memorial positioning, handled sensitively.
- FAQ and reviews.
- Start flow: 3–5 photos, style, size, finish, plinth, gift note, deadline, shipping, deposit.
- Account timeline and proof approval after booking.
- Privacy/consent and photo-retention explanation.
- Do not imply automatic photorealistic AI conversion. Set expectations: artist-led sculpt, one preview round.

#### Custom Printing — `/custom-printing`

- Who it is for: studios, architects, engineers, hobbyists, small businesses.
- Processes and materials: FDM, SLA, SLS; build volumes; tolerances; finishes.
- Use cases and case studies.
- File requirements and supported formats.
- Instant quote flow: upload → validate → preview → configure → estimate.
- Human review path for STEP, complex supports, or large jobs.
- Trade/wholesale teaser (later).
- IP/NDA and privacy note.

#### Project case study — `/projects/[slug]`

- Hero image and one-line result.
- Brief, constraints, process, materials, machine time, dimensions.
- Gallery and detail shots.
- Client quote.
- Services/products used, with internal links.
- Related projects.
- CTA to start a similar project.

#### Collection page — `/collections/[slug]`

- Editorial hero explaining the edit.
- Product grid, optionally with a featured product or project.
- Link back to the relevant category/service.
- Canonical handle from Medusa; unique copy only when the collection has search value.

#### Materials page — `/materials`

- Swatch gallery with real macro texture where possible.
- Comparison table: strength, heat resistance, food safety, UV stability, finish, process.
- Care and use-case guidance.
- Compatible products and services.
- Sample-pack product and CTA.

#### Reviews page — `/reviews`

- Aggregate rating and rating distribution.
- Filters by product/service and photos.
- Verified badge and link to the reviewed object or commission.
- Moderation policy and “write a review” path from a delivered order.
- No invented reviews or ratings.

#### Journal and article pages — `/journal`, `/journal/[slug]`

- Index with categories and featured article.
- Article with author, date, reading time, portable-text body, related products, and CTA.
- Article schema and OG image.

#### Help, contact, and account

- Help: FAQ accordion, shipping, returns, care, file guidelines, contact.
- Contact: form with spam protection, studio address/email, response time.
- Account: orders, tracking, addresses, commission timeline, proof approvals, reorder.

### 4.6 URL and SEO rules

- One canonical URL per product, category, project, and article.
- Filters and sort use query params; keep the canonical at the category URL unless a filter has meaningful search demand.
- Search, cart, checkout, account, and filter-only URLs are `noindex`.
- Pagination uses crawlable links.
- Every public page has a unique title, meta description, Open Graph image, and canonical.
- Structured data: Organization/LocalBusiness, Product, Offer, Review, BreadcrumbList, Article, FAQPage where appropriate.
- Category pages need genuine editorial copy, not just a product grid.
- Internal-link product ↔ category ↔ material ↔ project ↔ journal.
- Sitemap and robots generated at build/revalidation.
- 404 and 500 pages designed, not default.

### 4.7 Page-worthiness test

Before creating a page, all three must be true:

1. It has a distinct user intent or search intent.
2. It has enough unique content/products to justify existing.
3. It has a clear next action.

If not, keep it as a section, filter, or anchor on an existing page.

---

## 5. Medusa data model

### 5.1 Commerce entities

| Concept | Medusa model | Notes |
| --- | --- | --- |
| Catalogue taxonomy | **Product Categories** (nested) | 10 top-level; add leaf categories only when justified |
| Merchandising | **Product Collections** | Studio Picks, Ready to Ship, Gifts, Under $100, Architectural Models |
| Product options | **Product Options** | Finish, size; keep the variant matrix controlled |
| Sellable combinations | **Product Variants** | Price, SKU, inventory, weight, dimensions |
| Availability | **Inventory Items / Levels + variant policy** | Track ready-to-ship inventory; represent made-to-order lead time and capacity separately |
| Process/material filters | **Tags + validated metadata** | FDM, SLA, SLS; porcelain, sandstone, nylon, resin, metal |
| Editorial grouping | Collections + tags | Do not overload categories with marketing labels |
| Personalisation | Cart line-item metadata | Gift note, engraving, dedication; validate and bound user input |
| Customers, carts, orders | **Native Commerce Modules** | Do not recreate these in custom tables; use core workflows and APIs |
| Custom-domain relations | **Module Links** | Associate Quote/Commission with Customer, Cart, and Order across module boundaries |
| Markets | Regions + currencies | Romania region in RON at launch; EUR is indicative display only; add an EU/EUR region when EU shipping is approved |
| Taxes | Medusa tax regions / provider | Confirm Stripe Tax or a Medusa tax provider |
| Shipping | Shipping options/providers | Keep production lead time distinct from transit time |
| Payments | Medusa Payment Module + Stripe provider | Use provider-backed payment collections/sessions for deposits and balances |

### 5.2 Product metadata schema

Medusa metadata is schemaless and is not validated by the API. Treat it as a versioned application contract: validate on seed/import and when data enters the storefront, and expose only fields needed by each route. Use Zod (or an equivalent runtime schema) and fail closed on invalid values. Expected product keys:

```json
{
  "schema_version": 1,
  "availability": "ready | made_to_order | custom",
  "processes": ["FDM", "SLA", "SLS", "MJF"],
  "lead_time_days": 14,
  "lead_time_label": "Ships in 2–3 weeks",
  "materials": ["porcelain", "sandstone"],
  "finishes": ["porcelain", "sage", "obsidian"],
  "dimensions": { "width": 18, "height": 24, "depth": 18, "unit": "cm" },
  "weight_grams": 900,
  "care": "Dust with a soft cloth. Avoid direct sunlight.",
  "edition": "Open edition",
  "designer_note": "…",
  "glb_url": "https://cdn.example.com/models/mobius-vase.glb",
  "poster_url": "https://cdn.example.com/products/mobius-vase-poster.jpg",
  "seo": { "title": "…", "description": "…" }
}
```

Rules:

- Store public, stable product specifications in product fields or validated metadata. Keep quote analysis, commission state, upload keys, consent records, and other transactional or sensitive data in their owning custom data models.
- Store valid keys and values through the seed/import path and validate API responses at the storefront boundary; do not rely on free-text admin entry for machine-readable values.
- Product images and public GLBs live in R2/S3 via Medusa’s file provider or a public asset CDN, not in the repository. Customer uploads use the private upload pipeline in Section 6.4 and never share the public product bucket.
- Keep image alt text and 3D poster images with the product.

### 5.3 Custom modules

Use Medusa v2 modules as domain packages inside the Medusa application, not as separate microservices and not as replacements for core commerce. A module owns its data models and service; workflows coordinate its operations with native Customer, Cart, Order, Payment, Notification, and file-storage capabilities. Module isolation is intentional: do not import another module’s service or write directly to its tables. Use Module Links for cross-module associations and Query for cross-module reads. Use durable Medusa workflows for multi-step operations, compensation, and retries. ([Medusa modules](https://docs.medusajs.com/learn/fundamentals/modules), [Module Links](https://docs.medusajs.com/learn/fundamentals/module-links), [Workflows](https://docs.medusajs.com/learn/fundamentals/workflows))

Implement focused `quotes` and `commissions` modules under `apps/medusa/src/modules/`. They may be developed together in the same Medusa app and share typed helpers, but must keep separate domain ownership. Do not duplicate Customer, Cart, Order, Payment, or Inventory entities. Do not put multi-module orchestration in a module service; put it in workflows invoked by authenticated API routes, subscribers, or scheduled jobs.

#### Quote module

Purpose: supported-format custom-print requests, server-validated estimates, and human-reviewed quotes.

Suggested data models:

- `Quote`: `id`, `status`, optional customer association, guest contact email when needed, requested process/material/color/finish/infill/layer-height/quantity, canonical units, geometry summary, pricing snapshot, pricing-rule version, currency, expiry, revision, staff notes, timestamps.
- `QuoteAsset`: `id`, quote association within the module, server-generated private object key, sanitized display filename, declared format/content type, actual byte length, SHA-256, upload/scan/parse state, retention deadline, timestamps. Store no presigned URL, public URL, local path, or customer filename as an object key.
- `QuoteAnalysis`: validated parser result fields only: bounds, volume, triangle/face count, units, watertight/manifold indicators, parser version, and completion time. Preserve raw parser output only in short-lived quarantine storage if operationally required.
- `QuoteRevision` or an append-only quote event record: actor, prior/new status, price snapshot, reason, and timestamp for auditable staff overrides and customer acceptance.

Suggested states: `draft | upload_pending | quarantined | processing | review_required | estimated | sent | accepted | converted | expired | cancelled | rejected`. Enforce allowed transitions in workflows; never accept a status value directly from the storefront.

Relationships:

- Define Module Links from Quote to Customer (optional for guest checkout), Cart (when a quote is added to a cart), and Order (when that cart places an order). Use one-to-many from Customer to Quotes and one-to-one for a quote’s active conversion where appropriate. Link definitions store IDs, not foreign-key constraints; validate both records and ownership in workflows and handle deletion/anonymization explicitly.
- Keep QuoteAsset and QuoteAnalysis relations inside the quotes module using normal data-model relationships. Do not put arrays of file records in unvalidated JSON metadata.
- Carry only a non-sensitive quote ID and accepted revision on the custom cart line item. The quote module remains authoritative for the agreed configuration and amount; the cart/order remains authoritative for commerce totals and payment.

Workflows:

- Create quote and upload intent: validate input, authenticate or create a guest-scoped request, apply rate/size/file-count quotas, create a Quote/QuoteAsset, and return a short-lived upload instruction.
- Finalize upload: verify private R2 object existence, actual byte length, checksum, expected key, expiry, and intent state; atomically claim it for processing and enqueue an idempotent analysis job.
- Accept parser result: authenticate the worker callback/message, validate a strict result schema and bounded numeric values, persist analysis, and route unsupported/ambiguous/unsafe geometry to `review_required`.
- Estimate quote: compute all prices server-side from versioned rules, store integer minor units and currency plus a reproducible breakdown, and set expiry. Never use geometry or price supplied by the browser as authoritative.
- Staff review/revise/send: require admin authorization, record actor/reason/revision, and notify through a compensatable workflow step.
- Accept and convert: verify quote ownership, status, expiry, and accepted revision; create or update a normal Medusa cart and add a controlled custom-print line using a server-authorized, price-locked custom item path for the pinned Medusa version. Recalculate tax, discounts, shipping, and totals through Medusa. Never accept a client-supplied unit price or create an Order directly. Link Quote to Cart, then associate the placed Order from the order workflow/subscriber.
- Expire/cancel and cleanup: transition idempotently, invalidate unused upload intents, delete/quarantine files per retention policy, and compensate or refund through Medusa workflows where applicable.

Admin needs: Medusa Admin UI route/widget for the quote queue, geometry summary, private preview/download through short-lived authorized URLs, review/override with reason, status transition, and convert-to-cart/order. The Admin extension calls protected Medusa Admin API routes; it must not expose storage credentials or customer assets publicly.

#### Commission module

Purpose: artist-led portrait (and later other made-to-order sculpture) commissions with a private photo/proof lifecycle.

Suggested data models:

- `Commission`: `id`, `status`, optional Customer association, guest contact email if supported, subject type, style, size, finish, plinth, validated gift note, due date, assigned artist, current revision, retention/deletion deadline, timestamps.
- `CommissionAsset`: commission association within the module, role (`source_photo | proof | final`), private object key, sanitized display filename, checksum, byte length, upload state, retention deadline, explicit consent snapshot where relevant, timestamps. Never persist signed URLs.
- `CommissionEvent` / `CommissionRevision`: append-only actor, stage transition, proof revision, change request, approval, message reference, and audit timestamp. Keep private message content under access control and a defined retention policy.
- Price/deposit/balance snapshots in integer minor units and currency, with `pricing_version`; payment state must be derived from Medusa Payment/Order records and verified provider webhooks, not from a customer-editable Commission status.

Suggested states: `brief_received | review | quote_sent | deposit_pending | sculpting | proof_sent | changes_requested | approved | printing | finishing | balance_pending | shipped | cancelled`. Keep payment state and production state separate; enforce production transitions in workflows.

Relationships:

- Define Module Links from Commission to Customer, Cart, and Order. Allow an optional Customer link only if a secure guest ownership mechanism is implemented; do not use an email address alone as authorization to retrieve a commission or its photos.
- Keep assets/events as relations inside the commissions module. Store customer photos and proofs only under private R2 keys governed by Section 6.4.
- Link the Medusa Order(s) used for deposit and balance. The workflow must use the Medusa Payment Module/provider for charge, capture, refund, and webhook-confirmed status. Do not store payment credentials or create shadow payment records as the source of truth.

Workflows:

- Create brief and private upload intents; capture likeness, retention, and separate optional marketing consent.
- Validate and finalize uploads using the same quarantine and private R2 policy as custom-print files, with image-specific limits and scanning.
- Artist review, quote, and deposit request; validate that the quote revision and deposit amount are server-authored before creating Medusa cart/order/payment state.
- On verified deposit payment event, move production state to sculpting; upload proof revision and issue a private expiring preview link.
- Approve proof or request a bounded number of changes; require authenticated owner action and record the revision and actor.
- Mark printing/finishing/shipped through authorized staff transitions; create balance collection/order/payment through Medusa and send an idempotent payment link.
- Cancel/refund through Medusa workflows; delete or anonymize source photos/proofs on the documented retention schedule, while retaining only legally required order records.

Admin needs: Medusa Admin UI route/widget for queue by production stage, assignment, due dates, proof revision, customer-approved messages, and balance action. Staff-only APIs enforce role checks and emit audit events. Downloadable assets use short-lived signed GET URLs after authorization; do not put signed URLs in logs or long-lived records.

#### Review module

- `Review`: product/service association, Order and Customer association, rating (1–5), title/body, moderation state, published timestamp, and permitted photo asset references.
- Model product/service/order associations with Module Links. Derive `verified` server-side from an eligible fulfilled order/commission; never accept a client-supplied verification flag.
- State: `pending | published | rejected`; require moderation, rate limits, abuse controls, and a deletion/reporting path.
- Compute or cache aggregate ratings from published reviews only. Do not seed placeholder reviews as verified, and do not publish ratings or review counts without real records.
- Google Business Profile reviews may be displayed as a separately attributed external source. They are not verified purchase reviews, must not be labelled as verified, and must not feed product rating aggregates or `Review` structured data. Fetch them server-side under the API's caching/attribution terms and fail closed to an empty band.

#### Capacity / booking (optional, phase 3)

Made-to-order capacity is operational capacity, not sellable inventory. Prefer a small `capacity` module keyed by service and booking period with reserved/booked counts and expiry-aware reservations if launch messaging requires a real booking limit. Do not use inventory as monthly slots or expose “remaining slots” unless the reservation workflow is authoritative. Decide during Phase 3; the storefront needs one source for “now booking” messaging.

### 5.4 Content model (CMS)

Keep commerce in Medusa and long-form content in **Payload 3** (Next.js-native, Neon Postgres, `apps/cms`). Payload owns projects, journal, materials editorial, homepage modules, About/studio content, and testimonials. Collections/globals are localized in Romanian and English; the storefront reads published content server-side and revalidates through signed webhooks.

Payload collections and globals:

| Content type | Fields |
| --- | --- |
| **Homepage** | Hero slides (eyebrow, title, copy, CTAs, media/product refs), featured collection, selected products, selected projects, review refs, announcement |
| **Project** | Title, slug, client, location, year, services, products used, cover, gallery, brief, challenge, process, result, client quote, SEO |
| **Journal post** | Title, slug, excerpt, cover, portable-text/rich-text body, author, categories, related products, SEO |
| **Material** | Name, slug, processes, properties, colours, care, image, description, compatible products, SEO |
| **About/studio** | Story, team, machines, values, gallery, press, SEO |
| **Testimonial** | Quote, name, context, product/service, permission, image (optional) |

References use Medusa product handles or IDs, never duplicated product data. If Payload is not ready, use MDX/local content for launch and migrate later.

### 5.5 Seed and migration mapping

Build a seed script that imports the current static catalogue into Medusa:

- `catalog.ts` categories → Medusa categories (nested).
- `catalog.ts` products → products, options, variants, images, metadata.
- Finishes → options/values or tags.
- Collections → Medusa collections.
- Projects → CMS seed.
- Reviews → do **not** seed as verified reviews; use as design placeholders only, or seed as clearly labelled testimonials until real reviews exist.
- Materials → CMS/materials data.
- Homepage modules → CMS seed.

Preserve:

- Product names, slugs, prices, descriptions, dimensions, materials, images.
- The visual tone and image aspect ratios.
- Attribution for the head scan.

Fix during migration:

- Product counts vs “86+” claims.
- Category/product coverage so no top-level category is empty and public leaf pages meet the 3+ product rule.
- Do not display seeded ratings or review counts as real. Replace them with verified reviews or hide them until real reviews exist.
- “Made to order” vs “ready to ship” labels and lead times.
- Broken or missing product detail content.

### 5.6 Payments, shipping, tax

- Stripe test mode first; verify webhook signatures; use idempotency keys for payment/order mutations and make event handlers replay-safe.
- Standard products: full payment at checkout using Medusa's native cart, payment collection/session, and order workflows.
- Portrait commissions: proposed 30% deposit and balance before shipping; portrait pricing and deposit remain provisional until Section 3 decision 2 is resolved. Model each charge with Medusa's Payment Module/provider and keep commission production status separate from payment status.
- Custom quotes: Phase 4 v1 uses one full-payment checkout. A 50% deposit requires a separate recorded decision, a QuoteCharge model, and revised payment links before implementation. Lock quote revision and amount server-side before cart conversion, then let Medusa recalculate tax, discounts, shipping, and totals.
- Never treat a browser redirect as proof of payment; transition paid states only from verified Medusa/provider events.
- Ready-to-ship: track inventory and decrement through Medusa order workflows.
- Made-to-order: allow backorder only where configured, show production lead time, and track capacity separately.
- Shipping: Romania-only flat-rate/manual options at launch; keep production lead time separate from carrier transit time; add an EU/EUR region and carrier integrations after launch. Store tracking through the appropriate fulfillment/provider flow.
- Tax: Romania region with Romanian VAT; display VAT-inclusive prices. Confirm the current standard VAT rate with the accountant before launch. No multi-country tax at launch.
- Refunds/returns: EU 14-day withdrawal right on stock items; custom/commission pieces non-returnable after proof approval. Publish the policy before checkout goes live.
- Currency: checkout is RON only. EUR is a server-rendered indicative conversion with a versioned rate and timestamp; it never becomes a cart, order, or payment amount.
- Emails: order confirmation, commission stages, quote ready, proof ready, shipped, review request; dispatch through idempotent workflow/subscriber handling.

---

## 6. Frontend architecture

### 6.1 Next.js App Router

- Migrate from the Vite SPA to a separately deployed **Next.js App Router + TypeScript** storefront. Pin compatible, supported Next.js, React, `@medusajs/js-sdk`, and `@medusajs/types` versions in the lockfile; do not use floating `latest` dependencies in production.
- Route the storefront as `/ro` (default) and `/en` with locale-aware metadata, canonical URLs, and hreflang. Use next-intl or the framework-native equivalent; keep one canonical URL per locale and localize Payload content in both languages.
- Run **Payload 3** as a separate Next.js app in `apps/cms` on Neon Postgres. The storefront reads published content server-side and revalidates through signed webhooks. Payload admin credentials and database secrets are server-only; the CMS admin is noindex and is never embedded in storefront browser code.
- Keep pages/layouts as Server Components by default. Fetch public catalogue, category, product, collection, and CMS data on the server through a server-only Medusa SDK instance; render project/editorial pages on the server as appropriate. Use Client Components only for browser state, event handlers, browser APIs, WebGL, and genuinely interactive query surfaces. ([Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components))
- Do not use the legacy `medusa-react` package or the v1 JS client. Medusa v2 no longer supports Medusa React; use `@medusajs/js-sdk` and TanStack Query (or an equivalent current query library) only where client-side cache/interaction is needed. ([Medusa v1-to-v2 changes](https://docs.medusajs.com/learn/introduction/from-v1-to-v2), [Medusa JS SDK](https://docs.medusajs.com/resources/js-sdk))
- Create separate server and browser SDK configurations. The publishable API key and public backend URL may be exposed to the browser; admin tokens, secret API keys, R2 credentials, revalidation secrets, and private customer data must remain server-only. Never call Medusa Admin APIs from storefront browser code.
- Scope every Store API request with the publishable API key and intended sales channel. Use narrowly selected fields and validate custom linked data before returning it. ([Publishable API Keys](https://docs.medusajs.com/resources/storefront-development/publishable-api-keys))
- Make caching explicit for each data class: public product/editorial reads may use deliberate Next.js cache/revalidation policy and SDK `next.tags`; cart, customer, quote, commission, pricing, inventory-sensitive checkout, and private asset responses are request-scoped/no-store. Invalidate tags from authenticated Medusa/CMS webhooks only after verifying signatures and replay protection. Do not assume framework default caching semantics across Next.js releases. ([Medusa SDK caching](https://docs.medusajs.com/resources/js-sdk), [Next.js revalidation](https://nextjs.org/docs/app/getting-started/revalidating))
- Use the Next.js Metadata API for titles, descriptions, canonical URLs, Open Graph, sitemap, and robots.
- Keep custom CSS/design tokens; no requirement to adopt Tailwind. Use `next/font/local` for existing fonts.
- Wrap WebGL in client boundaries and dynamic imports; do not server-render a WebGL canvas.
- Deploy the storefront, Medusa API/workers, database, Redis, storage, and Admin SPA as separate runtime services with explicit network boundaries. **FORMA deploys Medusa Admin as a standalone Vite single-page dashboard, not as a Next.js route or a backend app page.** Build it with `medusa build --admin-only` to `.medusa/admin`, host that static artifact separately, configure `admin.path` and `admin.backendUrl` in `medusa-config.ts`, and allow only the exact Admin origin in backend CORS. Medusa's default combined build can serve the same SPA from `.medusa/server/public/admin` at `/app`, but that is not the FORMA deployment target. ([Medusa Admin](https://docs.medusajs.com/learn/fundamentals/admin), [Medusa build command](https://docs.medusajs.com/resources/medusa-cli/commands/build))

### 6.2 State and cart

- Medusa is the source of truth for cart, customer, order, quote conversion, and payment state. A client cache is only a view/optimistic layer and never an authority for price, inventory, ownership, or payment.
- Cart and checkout are RON-only at launch. EUR is a server-rendered indicative conversion using a versioned rate and timestamp; it is never sent to Medusa as a price and never used for order totals, structured data, or payment.
- Keep the opaque cart ID in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie scoped to the storefront. Read/update it only on the server; validate the cart, sales channel, customer association, and item eligibility before each mutation. Do not expose admin credentials or trust cart/quote IDs passed by the client without ownership checks.
- Use Server Actions for normal same-origin form mutations and Route Handlers for explicit HTTP endpoints, signed webhooks, upload-intent/finalization, and operations requiring streaming or protocol controls. Treat every Server Action and Route Handler as a public endpoint: validate input with Zod, authenticate, authorize resource ownership, rate-limit, enforce CSRF/origin policy, use idempotency for non-repeatable operations, and return minimal DTOs. Never accept client-calculated prices, customer IDs, status transitions, or payment success. ([Next.js Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data), [Next.js data security](https://nextjs.org/docs/app/guides/data-security))
- Use a server-side data-access layer to centralize Medusa SDK calls, session handling, ownership checks, field selection, and DTO mapping. Keep secrets and session credentials in server-only modules; use secure cookies for authentication state.
- Use TanStack Query v5 with the browser-safe Medusa SDK only for interactive client data such as search suggestions, live filters, or optimistic cart controls. Hydrate/dehydrate only when client reuse materially helps; use stable query keys and invalidate/refetch after server mutations. Public SEO pages should not become client-fetched shells. Authenticated/private operations should go through the server boundary unless the chosen Medusa session flow is deliberately configured and protected.
- UI-only state (search open, quick view, mobile menu) may use local component state or Zustand/context.
- Do not keep localStorage cart as the primary cart or store auth tokens, private upload keys, or presigned URLs there. If an optimistic local snapshot is used, it must be reconciled with Medusa before checkout.
- Handle stale carts, expired variants/quotes, price changes, tax/shipping recalculation, and out-of-stock errors gracefully; require explicit customer confirmation when a total changes.

### 6.3 3D and AR

- **Hero:** port the existing Three.js scenes; lazy-load, cap DPR, pause when offscreen/hidden, respect reduced motion.
- **Product pages:** export GLB for each product from the existing render pipeline; use `<model-viewer>` for turntable + AR Quick Look, with poster images and lazy loading.
- **Finish switching:** use a custom Three.js viewer for material swaps, or pre-generated GLB variants if necessary. Do not ship one GLB per finish unless size is acceptable.
- **Portrait preview:** show a stylized bust with selected finish/size; state clearly that the final likeness is artist-sculpted from photos. Do not fake a photoreal result.
- **Quote preview:** client-side STL/OBJ/3MF preview is an untrusted visual aid only. Never use browser-derived measurements for pricing or printing; the isolated server parser is authoritative for accepted geometry and limits.
- **Performance:** code-split Three.js; load only on pages that need it; adaptive geometry/material quality on mobile; pause rendering offscreen.
- **Export risk:** procedural Three.js materials may not translate cleanly to GLB. Create a dedicated GLB material set and test on iOS Quick Look and Android Scene Viewer; always provide a poster/turntable fallback.
- **AR requirement:** `<model-viewer>` AR needs HTTPS and a supported device; do not make AR the only way to inspect an object.

### 6.4 Images and fonts

- Store public product originals and GLBs in a public-asset bucket or CDN; serve through a configured Next Image loader/CDN. Keep customer uploads in a separate private R2 bucket with no public domain or anonymous read access.
- Configure exact production/staging origins, methods, and headers for R2 CORS. Use long-lived immutable caching only for versioned public product assets. Private uploads use short-lived signed GET URLs only after an ownership/admin authorization check; never store or log signed URLs.
- Generate AVIF/WebP variants; responsive `sizes`; width/height to prevent CLS.
- Provide high-resolution images for product zoom (current renders are 1000×1250; verify at 2x).
- Keep poster images for 3D/AR and OG images.
- Keep fonts local and subset; preload only what is used above the fold.
- Alt text for every meaningful image; decorative images empty alt.

**Customer file pipeline (STL, OBJ, 3MF, portrait photos):**

1. **Authorize and reserve:** a Next.js Route Handler or authenticated Medusa Store API route validates the session/guest token, ownership, CSRF/origin, rate limits, file count, declared format, and claimed byte limit. A claimed size is not a hard ingress cap. Create an upload-intent record linked to Quote/Commission with an opaque server-generated key, canonical MIME, and short expiry. Never use a supplied filename as a path or key.
2. **Upload to private staging:** issue a short-lived R2 presigned `PUT` URL for one opaque object key; sign the server-assigned content type and `If-None-Match: *` where supported, and configure bucket CORS for the exact storefront origin, `PUT`, and required signed headers only. Treat URL/token as bearer credentials until expiry; conditional create prevents a successful upload from being overwritten. Never issue `GET` or `DELETE` authority to the browser. R2 presigned URLs do not support HTML-form `POST`; use `PUT` for this flow. For a hard ingress byte ceiling, enforce streaming limits at an upload gateway; post-upload `HEAD` rejection alone does not prevent temporary storage abuse. ([Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/))
3. **Finalize and quarantine:** a server endpoint recomputes the HMAC upload token, verifies the intent is live and unused, then atomically claims it in the custom-module transaction. The finalize service copies the object to a unique quarantine key using its separate quarantine-writer credential, verifies actual byte length, calculates a trusted checksum while streaming, and enqueues an idempotent job that the supervisor reads from quarantine; the parser sandbox receives no R2 credential. Do not assume an R2 copy/delete sequence is an atomic rename. Declared MIME, extension, browser preview, ETag, and client checksum are hints only; inspect magic bytes and format structure. Reject mismatches. Apply per-user/IP daily quotas, object-count quotas, staging lifecycle deletion, and storage/worker cost alarms.
4. **Parse in a hostile-input sandbox:** parsing never runs in Next.js, a Medusa API process, Admin, or a shared web worker. Run one job per short-lived microVM or sandboxed runtime such as gVisor; a plain OCI container must not be the only isolation boundary for untrusted parser input. Also use a non-root UID, read-only root filesystem, drop all Linux capabilities, `no-new-privileges`, seccomp policy, bounded tmpfs, and strict CPU, memory, process-count, disk, and wall-clock limits. Deny inbound traffic and general outbound network; provide only narrowly scoped access to the one input object and a result queue. Do not mount the Docker socket, host paths, application secrets, database credentials, or broad R2 credentials. Destroy the sandbox after each job; patch and pin parser dependencies. ([gVisor isolation model](https://gvisor.dev/docs/), [Docker security options](https://docs.docker.com/reference/cli/docker/container/run), [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints))
5. **Format-specific limits:** allow only STL, OBJ, and 3MF by explicit allowlist; reject archives other than 3MF. Enforce configurable maximum compressed/input bytes, expanded 3MF bytes, archive entry count, compression ratio, path depth, vertices/faces/triangles, coordinate magnitude, and parse time before full allocation. Reject path traversal, symlinks, duplicate/ambiguous archive paths, encrypted entries, unsupported compression, XML DTD/external entities, external OBJ/MTL/texture references, non-finite coordinates, excessive mesh complexity, and geometry outside supported build volumes. Never invoke shell commands, execute file content, load plugins/macros, or fetch remote references. Malware scanning may supplement validation but does not make a geometry parser safe. ([OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html))
6. **Validate result and price:** the worker emits a small versioned JSON result, never a path or executable artifact. The Medusa workflow validates schema, numeric ranges, units, parser version, and job/intent ownership before storing the analysis. The pricing engine independently calculates an estimate from accepted values and versioned rules; fail closed or route unsupported, ambiguous, non-manifold, or over-limit files to manual review.
7. **Serve, retain, and delete:** keep source files private throughout; serve them through the proxy or short-lived signed redirect chosen in Section 11 after per-request ownership/role/state checks. Set separate retention periods for rejected files, source models, portrait photos, and proofs; provide deletion/anonymization jobs, audit access, and ensure backups/lifecycle rules match the policy. Never use customer photos or models for marketing without separate explicit consent.

### 6.5 CSS and design system

- Port `src/styles/*.css` and tokens into the Next app.
- Consider CSS Modules for new interactive components; avoid a wholesale rewrite.
- Preserve the brand palette, typography, radii, shadows, grain/glass effects, and motion language.
- Document tokens in one place (CSS variables) and avoid one-off colors.
- Add focus-visible states, reduced-motion variants, and high-contrast-safe text.

### 6.6 Error, loading, and empty states

Design and implement:

- Product loading skeleton and image blur placeholders.
- Out-of-stock and unavailable variant states.
- Empty cart, empty search, no filter results, and no reviews.
- Quote upload states: intent expiry, transfer interruption, unsupported format, byte/geometry/archive limit, checksum mismatch, malware/quarantine failure, parse timeout, non-manifold geometry, manual-review routing, and retry without duplicate quote/order creation.
- Checkout/payment failure with recovery; distinguish pending, authorized, captured, failed, and refunded provider-confirmed states.
- Commission status empty/error states and explicit private-asset authorization failures.
- 404 and 500 pages.
- Offline/network error messaging for uploads; never imply that a file is accepted until server finalization and parsing complete.

### 6.7 Analytics events

Instrument at minimum:

- `view_item_list`, `select_item`, `view_item`
- `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `purchase`
- `portrait_start`, `portrait_photo_upload`, `portrait_deposit`
- `quote_start`, `quote_upload`, `quote_estimate`, `quote_request_review`, `quote_checkout`
- `newsletter_signup`
- `search`, `search_no_results`
- `project_inquiry`

Use consent-gated analytics; send server-side purchase events where possible. Do not send photos, model files, upload keys, signed URLs, quote geometry, payment data, or other sensitive/personal fields to analytics.

---

## 7. Integrations and infrastructure

| Service | Purpose | Key env vars | Phase |
| --- | --- | --- | --- |
| **Medusa v2** | Commerce backend, admin, orders | `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` | 1 |
| **Postgres (Neon)** | Medusa database | `DATABASE_URL` | 1 |
| **Redis (Upstash)** | Workflows, events, caching | `REDIS_URL` | 1 |
| **Stripe** | Payments, deposits, webhooks | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 1/2 |
| **Cloudflare R2 / S3** | Public product images/GLBs plus isolated private staging/quarantine | Public: `R2_PUBLIC_ENDPOINT`, `R2_PUBLIC_BUCKET`, `R2_PUBLIC_ACCESS_KEY_ID`, `R2_PUBLIC_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL`; private: `R2_PRIVATE_ENDPOINT`, `R2_PRIVATE_REGION`, `R2_UPLOAD_STAGING_BUCKET`, `R2_UPLOAD_STAGING_ACCESS_KEY_ID`, `R2_UPLOAD_STAGING_SECRET_ACCESS_KEY`, `R2_UPLOAD_QUARANTINE_BUCKET`, `R2_UPLOAD_QUARANTINE_ACCESS_KEY_ID`, `R2_UPLOAD_QUARANTINE_SECRET_ACCESS_KEY`, `R2_WORKER_ACCESS_KEY_ID`, `R2_WORKER_SECRET_ACCESS_KEY`, `R2_DOWNLOAD_SIGNER_ACCESS_KEY_ID`, `R2_DOWNLOAD_SIGNER_SECRET_ACCESS_KEY`, `UPLOAD_INTENT_SECRET` | 1/3/4 |
| **Resend** | Transactional email, stage notifications | `RESEND_API_KEY`, `RESEND_FROM` | 1/3 |
| **Meilisearch** | Product/category/project search | `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY` | 2 |
| **Payload 3** | Projects, journal, materials, homepage, About | `PAYLOAD_DATABASE_URL`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL` | 5 |
| **PostHog** | Product analytics, funnels, experiments | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | 6 |
| **Sentry** | Error monitoring | `SENTRY_DSN` | 6 |
| **Vercel** | Storefront + Payload CMS hosting | — | 6 |
| **Railway/Fly/Render** | Medusa hosting | — | 6 |
| **Stripe CLI** | Local webhook testing | — | 1 |

Storefront secrets (examples):

```env
NEXT_PUBLIC_MEDUSA_URL=
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
MEDUSA_BACKEND_URL=
MEDUSA_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
REVALIDATE_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
PAYLOAD_DATABASE_URL=
PAYLOAD_SECRET=
PAYLOAD_PUBLIC_SERVER_URL=
NEXT_PUBLIC_CMS_URL=
EUR_TO_RON_DISPLAY_RATE=
EUR_TO_RON_DISPLAY_RATE_DATE=
```

Rules:

- Never commit real `.env` files; provide `.env.example` only.
- Use separate development, staging, and production credentials.
- Use R2/S3 presigned URLs for customer uploads; keep commission photos private.
- Verify webhooks, use idempotency keys, and rate-limit public endpoints.
- Back up Postgres and document restore steps.
- Configure SPF, DKIM, and DMARC before sending order email.

---

## 8. Non-functional requirements

### 8.1 SEO

- Unique title/meta/canonical per public page.
- Locale-aware canonicals and hreflang for `/ro` and `/en`; Romanian is the default and `x-default`.
- Open Graph and Twitter images, including dynamic product/OG images.
- JSON-LD: Organization/LocalBusiness, Product, Offer, Review, BreadcrumbList, Article, FAQPage.
- Sitemap and robots generated from real routes.
- Category and journal content with genuine search intent.
- Internal linking between products, categories, materials, projects, and articles.
- Noindex search, cart, checkout, account, and thin filter URLs.
- 301 redirects from any old URLs; custom 404.
- Local SEO: address, map, hours, Google Business Profile, LocalBusiness schema.
- Reviews schema only for real, verified reviews.

### 8.2 Performance budgets

Targets for mobile (75th percentile):

- LCP < 2.5 s
- CLS < 0.1
- INP < 200 ms
- Initial JS (excluding lazy 3D) < 300 kB gzip
- 3D loaded only on pages that use it; paused offscreen
- Product images AVIF/WebP, responsive sizes
- Font preload only for above-the-fold text
- No layout shift from 3D canvas or images
- Lighthouse/axe checks in CI or release checklist

Current 920 kB JS is the main performance debt. Code-splitting Three.js and moving to Next.js should reduce initial payload.

### 8.3 Accessibility (WCAG 2.2 AA target)

- Keyboard access for mega menu, mobile menu, overlays, carousel, quote upload, and checkout.
- Focus trap and focus return for modals/drawers.
- Visible focus states.
- Skip link.
- Semantic headings and landmarks.
- `aria-live` for cart, toast, quote estimate, and upload status.
- Carousel auto-rotation pause on hover/focus and a persistent pause control.
- Reduced-motion support for hero, reveals, and transitions.
- Colour contrast check; do not rely on colour alone.
- Alt text and captions; 3D alternatives (poster + description).
- Form labels, error messages tied to fields, and no time limits on checkout.
- Test with keyboard and at least one screen reader before launch.

### 8.4 Security and privacy

- HTTPS everywhere; secure, httpOnly cookies.
- Treat Server Actions, Route Handlers, and Medusa custom Store API routes as public endpoints: validate input, authenticate/authorize ownership, enforce CSRF/origin checks, rate limits, and idempotency where required.
- Implement the full private R2 intake, quarantine, format validation, sandboxed parsing, resource caps, and cleanup pipeline in Section 6.4. Extension/MIME checks and antivirus alone are insufficient; never execute customer files or parse them in the web/API process.
- Add spam protection (Cloudflare Turnstile or a honeypot + rate limit) to contact, newsletter, and project forms.
- Presigned URLs are bearer tokens: use a private bucket, short expiry, exact CORS origins, unique keys, and authorization-scoped downloads; never use a public customer-photo bucket.
- Customer photo/file retention policy, deletion workflow, and consent.
- Privacy policy, terms, cookie consent, and data processing notes.
- Stripe handles card data; never store card numbers.
- Least-privilege admin roles; audit admin actions where possible.
- Enable R2 versioning/lifecycle rules for uploads; back up Postgres and document restore. Run the object-existence and tombstone verification drill before restoring traffic.
- Dependency updates and secret rotation.
- No customer photos in marketing without a separate, versioned marketing-consent record; processing consent never authorizes publication.

### 8.5 Testing

- Unit tests for pricing, metadata parsing, and utilities.
- Integration tests for Medusa workflows: quote → order, commission stages, deposit/balance.
- E2E (Playwright) against seeded Medusa:
  1. Browse → product → cart → Stripe test checkout.
  2. Portrait brief → photos → deposit → account status → admin proof approval.
  3. Quote upload → estimate → checkout; invalid file handling.
  4. Search → product; no-results state.
  5. CMS project → published page.
  6. Account order history and commission timeline.
  7. Mobile navigation and mega menu.
  8. Keyboard-only checkout and modal focus.
- Visual regression for home, product, category, portrait, quote, project.
- Quote parser load and resource-exhaustion tests: malformed files, decompression bombs, hostile STL/OBJ/3MF fixtures, parser timeouts, memory/CPU/file-count caps, no-network/no-host-access sandbox policy, and cleanup after worker failure. Run the route-authentication sweep, private-asset IDOR matrix, invariants check, migration drift check, and Phase 3/4 staging gates in Section 8.7.5.
- Stripe webhook tests with Stripe CLI through the Medusa native provider route; include duplicate, out-of-order refund, amount/currency mismatch, and charge-idempotency cases from Section 8.7.4.

### 8.6 Observability

- Sentry for storefront and Medusa errors.
- Structured logs for uploads, quotes, commissions, payments.
- Uptime monitoring for storefront, Medusa, Postgres.
- Alerting for failed payments, webhook failures, quote parser errors, and email failures.
- Analytics dashboards for funnel and conversion.
- Backups and documented restore process.

---

### 8.7 Security hardening and threat model

This section adopts the adversarial review as the security POV for Phases 3 and 4. Its threat model, controls, findings, and staging acceptance gates are normative for implementation. The compatibility rules below are canonical where an imported example conflicts with the Medusa v2 or Next.js architecture in Sections 5–6:

- Keep Stripe webhook ingress on Medusa's native Stripe provider route (/hooks/payment/stripe_stripe). The provider validates/processes Stripe events and emits Medusa payment events. Custom workflows/subscribers re-read authoritative Medusa Payment, Capture, Refund, Payment Collection, and Module Link state; do not add a second raw Stripe webhook processor or parallel payment ledger. Deduplicate the custom charge effect by charge plus Medusa payment/capture identity.
- Implement compare-and-set and event append operations inside the owning Quotes or Commissions custom module service using Medusa DML/repositories and its transaction manager (InjectManager / InjectTransactionManager). Workflows coordinate modules; use Query and Module Link APIs for core entities. SQL in this section describes constraints/atomic conditions only: generate Medusa module migrations for DML changes and keep any custom SQL/indexes inside custom module migrations. Never write Commerce Module tables directly.
- Preserve the security review's stale-action invariant in Medusa DML: aggregate_version is the compare-and-set row version; proof_revision binds commission proof uploads/approval; spec_revision binds quote model/options/pricing content. Every proof approval must name and compare both expected aggregate_version and the latest proof_revision; quote acceptance must name and compare expected aggregate_version and spec_revision. Thus any concurrent state change or replacement proof invalidates a stale action.
- Cloudflare R2 supports signed Content-Type and atomic If-None-Match: * PUTs. Do not treat signed Content-Length as a maximum-size enforcement mechanism unless the chosen browser + SDK + R2 path proves it in staging. For a hard pre-storage cap use a streaming upload gateway; otherwise retain finalize-time size checks, quotas, alarms, and the residual-risk decision in Section 11. [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [conditional writes](https://developers.cloudflare.com/r2/api/s3/extensions/)
- Keep Medusa-generated IDs as opaque strings. If UUIDv7 is required for public asset identifiers, store a separate UUID field; never validate a prefixed Medusa DML ID as a UUID.
- Retention periods, cancellation/refund rules, upload gateway, asset proxy strategy, and staff-role granularity remain decisions until recorded in Section 11. The values in the security review are proposed defaults, not legal or commercial approval.
- Header examples are policy templates: replace example domains with exact deployed origins, test the CSP with Next.js, Three.js, and Stripe in report-only mode, then enforce it. Do not ship preload HSTS or a COOP value until domain and Stripe authentication flows are verified.

#### 8.7.0 Scope, assets, trust boundaries, invariants

##### Assets, ranked by damage if lost

| Rank | Asset | Why it matters |
| --- | --- | --- |
| A1 | Customer source photographs | Likeness data. Often deceased relatives, children, unreleased products. Cannot be re-created. GDPR/UK-GDPR special-category-adjacent. |
| A2 | Commission proofs and final renders | Commercial secret of the customer; pre-publication product designs. |
| A3 | Customer 3D models (quote flow) | Frequently unreleased industrial design under NDA. |
| A4 | Payment state (deposit/balance) | Direct revenue; a forged "paid" is a shipped-for-free bug. |
| A5 | Pricing rules and margin basis points | Competitive; also the input to under-pricing attacks. |
| A6 | Admin sessions, Stripe webhook secret, R2 credentials, worker credential, private-download signer | Full compromise of everything above. |
| A7 | Quote/commission status and revision history | Dispute evidence; drives production and shipping. |

##### Trust boundaries

```
 B1 browser ──▶ B2 Next.js server ──▶ B3 Medusa API ──▶ B4 Postgres
      │                                   │
      │ (presigned PUT, direct)           └──▶ B5 R2 staging (write-only cred)
      ▼
 B6 R2 staging ──▶ B7 worker supervisor ──▶ B8 gVisor sandbox (no creds, no net)
                                              │
 B9 Stripe ──▶ B10 Medusa webhook ingress ◀───┘ (result via queue)
```

Everything crossing B1→B2, B9→B10, B7→B8 and B8→B7 is attacker-controlled. B4, B5 credentials and B10's
signing secret are the only things that must never reach B1 or B8.

##### Non-negotiable invariants

Each invariant has an enforcement point and a CI check (8.7.5). Violating one is a release blocker.

| # | Invariant |
| --- | --- |
| I1 | No value that affects money, ownership, or state is ever taken from the browser as authoritative: not price, currency, status, revision, `customer_id`, object key, byte size, MIME, geometry, or payment result. |
| I2 | Every private-asset read performs a **fresh** ownership check against the database. The URL is never the authorization. |
| I3 | Every state transition is a compare-and-set on (status, aggregate_version) inside the owning custom-module transaction that also appends the event row. No other code path writes status. |
| I4 | Every payment effect is keyed by a deterministic idempotency key derived from the *charge*, never from the event. |
| I5 | Webhook handlers act on state re-fetched from Stripe, not on the event payload snapshot. |
| I6 | Object keys are server-generated, opaque, and never derived from a customer filename. |
| I7 | The parser sandbox holds no credentials, has no route to the internet, and is destroyed after one job. |
| I8 | A file is not "accepted" until finalize + scan + parse have all succeeded; every earlier state is provisional. |
| I9 | Signed URLs never persist in the DB, logs, analytics, email, or `localStorage`. |
| I10 | Fail closed: unknown enum, missing link, ambiguous link, scanner outage, parser timeout and clock skew all deny. |
| I11 | Marketing reuse of a photo requires its own consent record, separate from processing consent. |
| I12 | The admin surface is never reachable from storefront browser code, and admin tokens never leave the server. |

---

#### 8.7.1 Threat model

`Likelihood` is for a motivated attacker who has read this plan. `S` = critical, `A` = high, `B` = medium.

| ID | Boundary | Attack path | Impact | L | Control | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| T-01 | B1→B2 | Enumerate `asset_id` (cuid, monotonic-ish) on `/api/private/...` and read other customers' photos. | S | High | I2; opaque UUIDv7 + ownership query; uniform 404 | Playwright two-account matrix |
| T-02 | B1→B2 | Reuse a signed URL seen in a shared screenshot/Referer after logout. | A | High | 300 s TTL, `no-referrer`, proxy for models/proofs | Manual + header assertion |
| T-03 | B1→B2 | PUT a different body to a captured presigned URL after finalize (URL still live). | A | Med | Finalize deletes staging; quarantine copy is immutable; `If-None-Match:*` | Replay test |
| T-04 | B1→B2 | Upload 4 GiB to a 100 MiB intent (R2 does not enforce size on presigned PUT). | B | High | Streaming gateway cap, or finalize-time streamed byte cap plus delete, quotas, and cost alarms; signed Content-Length is not a cap | Upload with forced size |
| T-05 | B1→B2 | Upload `text/html` as `.stl`; served inline later → stored XSS on the storefront origin. | A | Med | Magic-byte check; `nosniff`; `Content-Disposition: attachment` for non-image; CSP | Polyglot fixture |
| T-06 | B1→B3 | POST `{"status":"shipped","deposit_minor":1}` to a commission route. | A | High | I1; Zod `.strict()`; server re-derives | Contract test |
| T-07 | B3 internal | Swap a `commission→order` link to a $1 order; deposit webhook marks the $2,000 commission paid. | S | Med | Link written only by workflow; amount/currency equality assertion | Link-swap unit test |
| T-08 | B9→B10 | Replay a captured payment provider event. | A | High | Native Medusa Stripe provider verification plus charge/payment/capture idempotency and aggregate_version CAS | Duplicate delivery ×5 through the Medusa provider |
| T-09 | B9→B10 | Deliver `charge.refunded` before a later success event; commission ends "paid" after refund. | A | Med | Re-fetch authoritative Medusa Payment/Capture/Refund state; hold if net captured funds fail policy | Out-of-order test |
| T-10 | B1→B3 | Double-click "pay balance" → two carts → two charges. | S | High | Unique partial index on active balance charge; `Idempotency-Key` | Concurrent curl |
| T-11 | B1→B3 | Accept a quote at `spec_revision=3` while staff is revising to 4; pay the old price. | A | Med | `expected_aggregate_version` + `accepted_spec_revision` CAS; price re-derivation; `PRICE_DRIFT` 409 | Race test |
| T-12 | B1→B3 | Tamper `line_item.metadata.quote_id` in the cart to a cheaper quote. | A | Med | Metadata is a claim; resolve via `quote-cart` link; recompute | Cart tamper test |
| T-13 | B8 | 3MF zip bomb: 200 KiB archive → 8 GiB inflated → worker OOM → queue stalls → all uploads fail. | A | High | Streaming inflate with counting abort; 512 MiB cap; 20:1 ratio | `bomb.3mf` fixture |
| T-14 | B8 | `[Content_Types].xml` billion-laughs. | A | Med | `defusedxml`, `forbid_dtd/entities/external`, XML byte + element caps | `laughs.3mf` fixture |
| T-15 | B8 | Binary STL header claims `0xFFFFFFFF` facets → `Float32Array(4e9)` throw. | B | High | Pre-allocation count check against file size and cap | `liar.stl` fixture |
| T-16 | B8 | OBJ with 20 M `f` lines and negative indices → CPU/memory exhaustion. | B | Med | Line/face/vertex caps; per-line byte cap; soft deadline | `big.obj` fixture |
| T-17 | B8 | Self-intersecting mesh reports 0.01 cm³ → estimate $2 → customer accepts. | A | Med | Volume/bbox sanity ratio; non-manifold → `review_required` | `thin.obj` fixture |
| T-18 | B7→B3 | Forge a worker result with `volume_mm3: 1` and a valid-looking schema. | A | Med | Rotating worker credential + `input_sha256` + `asset_id` + `parser_version` allowlist | Forged POST |
| T-19 | B1 | 100 MiB 3MF preview on a phone freezes the tab; user assumes the site is broken. | B | High | 25 MiB preview cap, 8 s worker timeout, `terminate()` | Device test |
| T-20 | B1→B2 | Missing `authenticate()` on one of ~12 custom routes. | S | High | Route-table test that asserts 401 for every `/store/custom/**` and `/admin/custom/**` | Automated route sweep |
| T-21 | B2 | Signed URL logged by the access log / Sentry breadcrumb → permanent hotlink. | A | High | Redaction middleware; log `key` hash only | Log assertion |
| T-22 | B2 | `next/image` `remotePatterns: ['**']` → image-optimizer fetch amplification. | B | Low | Exact R2 hostname + `formats`/`sizes` allowlist | Config test |
| T-23 | B3 | Delete a customer; commissions lose their link; photos orphaned but still readable. | B | Med | Anonymization job; no `deleteCascade` on commission→customer; tombstone | Deletion drill |
| T-24 | B8 | Parser dependency CVE (trimesh/lxml/numpy). | S | Med | Pinned + `pip-audit` gate + rebuild cadence | CI |

##### Threat actors

Semi-technical competitor (T-01, T-17), cost-abusing hobbyist (T-04, T-13), customer disputing a charge
(T-08, T-09), compromised dependency (T-24), and — the highest-value case — someone who wants a $2,000 bust
for $1 (T-07, T-10, T-11, T-12, T-18).

---

#### 8.7.2 Findings against the current plan

Severity: **P0** blocks Phase 3/4 sign-off, **P1** must land in the same PR as the feature, **P2** before launch.

| ID | Sev | Location | Finding | Required fix |
| --- | --- | --- | --- | --- |
| F-01 | P0 | §9.6 CommissionCharge | No payment collection/session/payment mapping or charge status exists, so payment.captured cannot deterministically resolve one custom charge. | Resolve Medusa Payment by `payment_collection_id`, then resolve exactly one CommissionCharge through the Payment Collection Module Link. Persist payment/session IDs as assertions. Stripe metadata is an optional assertion only, never a resolver; do not add a second webhook. |
| F-02 | P0 | §9.6 `CommissionCharge` | No uniqueness: two concurrent balance checkouts create two charges and two carts. | Add one active `(commission_id, purpose)` partial unique index and `Idempotency-Key`; exclude only `canceled`, `expired`, and audited `mismatch_resolved`. A `mismatch` remains blocking until provider exposure is audited and resolved. |
| F-03 | P0 | §9.6 state machine | `deposit_pending → sculpting` is driven by a payment event but no guard asserts authoritative capture, exact amount/currency, or refund state. A duplicate or forged event starts production. | Gate with a re-read of linked Medusa Payment/Payment Collection: `captured_at != null`, captured amount exactly equals charge and deposit, currency matches, zero refunds, no dispute, and `payment_hold=false`; the event only wakes reconciliation. |
| F-04 | P0 | §9.6 state machine | The commission state machine omits cancellation edges after proof review/approval and during production, leaving cancellation behavior undefined. | Add `proof_sent`, `approved`, `printing`, and `finishing → cancelled` edges; make them staff-only and policy-gated, with an audited refund decision and no automatic refund. |
| F-05 | P1 | §9.7 `QuoteAsset` | The plan permits one model per content revision but does not persist which revision an asset belongs to. | Add `spec_revision`; unique `(quote_id, spec_revision)` for live model assets; key prefix includes the opaque asset identifier. |
| F-06 | P1 | §9.7 `QuoteAnalysis` | `MeshAnalysisResultSchema` requires `input_sha256` and `job_id`, but the DML has no columns to persist or compare them. | Add `input_sha256` and `job_id`; enforce idempotency on `(asset_id, parser_version, input_sha256)` and compare all worker claims before persist. |
| F-07 | P1 | §9.7 `QuoteAsset` | `staging_key`/`quarantine_key` are `unique` but nothing constrains prefix, extension, or that the two differ. | Code-side `assertKeyShape()`; DB `CHECK` on prefix. |
| F-08 | P1 | §9.7 `QuoteAsset` | No `finalized_at` / claim column; a replayed finalize re-copies and re-enqueues. | `finalized_at` + single-statement atomic claim (8.7.3 B). |
| F-09 | P1 | §9.6 `CommissionAsset` | Only one `consent_version`/`consent_at` pair — processing consent and marketing consent are conflated. The gallery page will publish photos without marketing consent. | Add `marketing_consent_version`, `marketing_consent_at`, `public_derivative_key`. |
| F-10 | P1 | §5.2, §9.6 | `MeshAnalysisResultSchema.bounds_mm` uses `.positive()` on all three axes — a flat panel or decal has zero thickness and is rejected. | `.nonnegative()` per axis, plus `.refine` that at least one axis > 0. |
| F-11 | P1 | §9.7 client preview | 100 MiB client preview cap. `ThreeMFLoader` inflates into worker heap with no expanded-size limit; a phone will die. | 25 MiB preview cap with "too large to preview" fallback; 8 s timeout; `terminate()`. |
| F-12 | P1 | §9.6 admin | The plan specifies authenticated Admin users but no application-level role assignment or per-route policy. | Add ops, artist, finance, admin roles and server-side requireRole checks for every Admin custom route. |
| F-13 | P1 | §6.2, §9.6 | "Origin/CSRF checks" named but no mechanism. Medusa Store API is CORS-permissive by default and the publishable key is public. | Exact `STORE_CORS` list plus an exact-origin check at the Next.js BFF for browser mutations; reject missing/foreign browser Origin. Do not treat CORS or the publishable key as authorization. |
| F-14 | P1 | §8.4 | No CSP, no security headers anywhere in the plan, on a site that renders customer filenames and CMS HTML. | Header set in 8.7.3 L. |
| F-15 | P1 | §9.6, §9.7 | `UPLOAD_INTENT_SECRET` is listed but its purpose is never defined. | Define it as the server-only HMAC key for a short-lived `upload_token`, bound to intent ID, exact object key, and expiry; verify it at finalize and never persist/log the raw token. |
| F-16 | P1 | §6.4 step 2 | Signed Content-Type and browser CORS headers are underspecified. | Sign the allowlisted Content-Type; allow only exact origins, PUT, and the headers the browser actually sends. Do not treat signed Content-Length as a hard size cap. |
| F-17 | P1 | §9.6 | Proofs are staff-uploaded and rendered in Admin, but go through no scan and have no format restriction. An SVG or PDF proof can carry script. | Raster-only proofs (JPEG/PNG/WebP) or sanitize; scan anyway. |
| F-18 | P2 | §9.6 `display_filename` | "Sanitized" undefined; it is echoed in `Content-Disposition` → header injection / extension spoofing. | RFC 5987 encoding + strict charset + forced extension (8.7.3 D). |
| F-19 | P2 | §8.6 | "Structured logs for uploads" — presigned URLs are the classic leak. | Redaction list; log key hash, not key. |
| F-20 | P2 | §9.6 deletion | Deletion job deletes R2 objects and marks rows; a Postgres restore then yields rows pointing at deleted objects. | Restore ordering + tombstone + `deleted_at`; verify before restore. |
| F-21 | P2 | §9.7 | `review_required → processing → review_required` can loop forever; parser retries have no ceiling. | Increment `parse_attempt_count` only in enqueue-analysis, once per distinct job ID; issue at most three jobs, and after the third failed/timed-out job transition to terminal `rejected` with `reason='retry_exhausted'`. |
| F-22 | P0 | §8.7.3 H2/H5 | An event-only payment transition can stall when automatic capture has completed but the workflow does not emit the expected `payment.captured` event. | Treat events as wake-ups; re-read `Payment.captured_at`, captured amount, captures, and refunds. Pin `capture: true`; add a 60-second reconciliation job and require an exact-capture guard before production transitions. |
| F-23 | P0 | §8.7.3 H3 | Provider metadata propagation varies by Medusa release and cannot be a payment-to-charge resolver. | Resolve through `Payment.payment_collection_id` → the one linked Payment Collection → exactly one CommissionCharge. Use Stripe metadata only as an optional mismatch assertion. Payment Collection is the single payment-side anchor; Charge↔Cart is not authoritative. |
| F-24 | P2 | §5.3 links | A direct CommissionCharge→Order link creates ambiguous payment authority, and a 1:1 Module Link cardinality would not model multiple aggregate orders. | Keep Charge→Payment Collection as the sole payment-side link. If an aggregate Commission→Order link supports multiple orders, define `isList: true` on the Commission linkable. Never create CommissionCharge→Order. |

---

#### 8.7.3 Control specifications

Each control is written to be implemented literally. `MUST` is a release blocker; `SHOULD` needs a written
reason in the PR if skipped.

##### A. Upload intent and presigned PUT

**A1.** Key format `MUST` be `v1/{module}/{owner_id}/{public_asset_id}/{nonce}.{ext}` where
`module ∈ {quotes,commissions}`, `owner_id` is the custom Quote/Commission ID, `public_asset_id` is a separate
UUIDv7 generated by the server, `nonce` is 16 random bytes base64url, and `ext` is the allowlisted extension.
Do not assume a Medusa DML ID is a UUID. No customer input enters the key. `MUST` validate with:

```ts
const KEY_RE = /^v1\/(quotes|commissions)\/[a-z0-9_]+\/[0-9a-f-]{36}\/[A-Za-z0-9_-]{22}\.(stl|obj|3mf|jpg|jpeg|png|webp)$/
export function assertKeyShape(key: string, module: string, ownerId: string) {
  if (!KEY_RE.test(key)) throw new Error("BAD_KEY")
  const [, m, o] = key.split("/")
  if (m !== module || o !== ownerId) throw new Error("KEY_PREFIX_MISMATCH")
}
```

**A2.** The intent request may carry provisional byte_size, declared_content_type, and client SHA-256 claims. Reject a claimed size above the configured cap before signing, but treat every client claim as untrusted. Sign the allowlisted Content-Type and `If-None-Match: *` where supported. Do not sign or require Content-Length as a maximum-size control. At finalize, verify R2-reported object length, metadata, magic bytes, and the byte count/hash while streaming into quarantine; abort and delete if the stream exceeds the cap. If the cap must apply before bytes reach storage, use the streaming upload gateway and document its path in Section 11. Otherwise retain the stated residual storage/cost risk, quotas, and alarms.
**A3.** Signing recipe — `MUST` be the only place in the codebase that calls `getSignedUrl`:

```ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createHmac } from "node:crypto"

const SIGNED_HEADERS = new Set([
  "content-type", "if-none-match", "x-amz-checksum-sha256", "x-amz-meta-intent",
])

export async function presignUpload(intent: UploadIntentRow, claims: { client_sha256?: string }) {
  const key = buildKey(intent)                       // A1
  const token = createHmac("sha256", env.UPLOAD_INTENT_SECRET)
    .update(`${intent.id}.${key}.${intent.intent_expires_at.toISOString()}`).digest("base64url")

  const cmd = new PutObjectCommand({
    Bucket: env.R2_UPLOAD_STAGING_BUCKET,
    Key: key,
    ContentType: intent.declared_content_type,       // exact string, from the allowlist
    ...(claims.client_sha256 ? { ChecksumSHA256: Buffer.from(claims.client_sha256, "hex").toString("base64") } : {}),
    IfNoneMatch: "*",                                // create-once
    Metadata: { intent: intent.id },                  // HMAC token is sent to finalize, not stored with the object
  })

  const url = await getSignedUrl(stagingClient, cmd, {
    expiresIn: 900,                                  // 15 min, never more
    signableHeaders: SIGNED_HEADERS,
  })

  return {
    upload_url: url,
    upload_token: token,
    required_headers: {
      "content-type": intent.declared_content_type,
      "if-none-match": "*",
      "x-amz-meta-intent": intent.id,
      ...(claims.client_sha256 ? { "x-amz-checksum-sha256": Buffer.from(claims.client_sha256, "hex").toString("base64") } : {}),
    },
    expires_at: new Date(Date.now() + 900_000).toISOString(),
  }
}
```

**A4.** Use separate bucket-scoped credentials. The upload signer gets only the staging-bucket operations needed
to presign PUT, HEAD, read for finalization, and delete expired objects. The finalize service gets a separate
quarantine-writer credential for conditional PUT, HEAD, and cleanup; it has no public-bucket access. The trusted
worker supervisor gets read-only quarantine access; the parser sandbox gets no R2 credentials. No token may list
or access a bucket outside its assigned role. Because R2 tokens are bucket-scoped and cannot be prefix-scoped,
bucket separation — not key prefixes — is the security boundary.

**A5.** CORS on the staging bucket:

```json
[{ "AllowedOrigins": ["https://forma.example", "https://staging.forma.example"],
   "AllowedMethods": ["PUT"],
   "AllowedHeaders": ["content-type","if-none-match","x-amz-checksum-sha256","x-amz-meta-intent"],
   "ExposeHeaders": ["ETag"],
   "MaxAgeSeconds": 600 }]
```

No `*` origin. No `GET`/`DELETE` method. The quarantine bucket has **no** CORS configuration at all.

**A6.** Intent row: QuoteAsset state `intent` with `intent_expires_at = now + 15 min`; on expiry mark it `expired`,
`sign_count = 1`. Re-signing is not allowed; issue a new intent if the upload attempt expires or the file changes.

**A7.** One live intent per `(quote_id, spec_revision)` for quotes. Enforced by a partial unique index, not by a
read-then-write check:

```sql
CREATE UNIQUE INDEX quote_asset_one_live_per_revision
  ON quote_asset (quote_id, spec_revision)
  WHERE state NOT IN ('rejected','deleted','expired','abandoned');
```

##### B. Finalize — atomic claim

The Quotes module service claims the asset inside its Medusa transaction manager: lock the module-owned asset row;
require matching quote, `state='intent'`, unexpired intent, current `spec_revision`, and expected
`aggregate_version`; atomically set `state='uploaded'`, `finalized_at`, and increment
`finalize_attempt_count`; append the corresponding QuoteEvent; commit before R2 I/O. This must use a conditional
update/compare-and-set, not an unprotected read-modify-write. Zero rows → `409 INTENT_NOT_CLAIMABLE` (already
finalized, expired, stale revision, or wrong parent). Then, in order:

1. `HeadObject` the exact key. Missing → `410`.
2. Recompute the expected HMAC token from intent ID, exact key, and expiry; constant-time compare it with the
   token submitted to the authenticated finalize route. Assert the R2 `ContentLength` is within the configured
   cap and matches any accepted size claim; assert `ContentType === declared_content_type` and
   `Metadata.intent === asset_id`.
3. Assert magic bytes (8.7.3 E2) — `ContentType` is a hint, the bytes are truth.
4. Stream `GetObject` → bounded `PutObject` into a unique quarantine key, hashing on the fly. Abort as soon as
   the stream exceeds the cap; use conditional create (`IfNoneMatch: "*"`) and bind the source to the HEAD ETag.
5. Hash mismatch vs the signed checksum → `state='rejected'`, delete both objects, `422 CHECKSUM_MISMATCH`.
6. `UPDATE ... SET state='quarantined', quarantine_key=$1, sha256=$2 WHERE id=$1 AND state='uploaded'`.
7. Only now `DeleteObject` the staging key. Copy and delete are separate idempotent steps — never assume a rename.
8. Invoke the Medusa `enqueue-analysis.ts` workflow, which atomically increments `parse_attempt_count`, persists a unique `job_id`, and queues `{ asset_id, quote_id, job_id, spec_revision, sha256 }`. Never enqueue directly from finalize or let the worker update the counter. Never the URL, never the bytes.

Replay of a completed finalize `MUST` return `200` with the stored state when `sha256` matches, and `409`
otherwise. Only `enqueue-analysis.ts` increments `parse_attempt_count`, once per distinct job ID; queue-delivery retries reuse that ID. Issue at most three jobs. A failed third job becomes terminal `rejected` with `retry_exhausted`; no fourth job is enqueued.

##### C. Download authorization — the IDOR core

**C1.** Route shape `GET /api/private/{module}/{asset_id}`. `module ∈ {commission-asset, quote-asset, proof}`.
The handler `MUST NOT` accept a key, bucket, filename, or parent id as input.

**C2.** Authorization resolver — load the asset/parent and owner Module Link through Medusa Query APIs; fail
closed on 0 or >1 asset/owner results:

```ts
type Actor = { kind: "customer"; id: string } | { kind: "user"; id: string; roles: Role[] }

export async function authorizeAsset(actor: Actor, assetId: string) {
  const { data: rows } = await query.graph({
    entity: "commission_asset",
    fields: ["id", "state", "role", "object_key", "display_filename", "content_type",
      "commission.id", "commission.status", "commission.owner_customer_id"],
    filters: { id: assetId },
  })
  if (rows.length !== 1) throw notFound()            // ambiguous result == deny
  const a = rows[0]
  if (a.state !== "available" || !a.object_key) throw notFound() // provisional files are invisible

  if (actor.kind === "customer") {
    const { data: links } = await query.graph({
      entity: "commission",
      fields: ["id", "owner_customer_id", "customer.id"], // customer relation comes from Module Link
      filters: { id: a.commission.id },
    })
    const customerIds = links.flatMap((row) => row.customer?.id ? [row.customer.id] : [])
    if (links.length !== 1 || customerIds.length !== 1 || links[0].owner_customer_id !== actor.id || customerIds[0] !== actor.id)
      throw notFound()                                // missing/duplicate/mismatched owner link fails closed
  }

  // role/state visibility matrix (C3)
  if (a.role === "proof" && !["proof_sent","changes_requested","approved","printing","finishing","balance_pending","shipped"].includes(a.commission.status)) throw notFound()
  if (a.role === "final" && !["shipped"].includes(a.commission.status)) throw notFound()

  if (actor.kind === "user") {
    const need = a.role === "final" ? "ops" : "artist"
    if (!actor.roles.includes(need) && !actor.roles.includes("admin")) throw notFound()
  }
  return a
}
```

For quote `model` assets, resolve the Quote's Customer association through the Quote↔Customer Module Link with
the same Query API pattern; compare exactly one linked customer ID to `Quote.owner_customer_id` and the actor.
Permit the customer owner to download only after the quoted model reaches the policy-approved visibility state;
require ops, artist, finance, or admin role for staff access. Do not read Module Link tables directly or
authorize from `owner_customer_id` alone.

**C3.** Visibility matrix — the only legal combinations. Anything else is `404`.

| Asset role | Customer, own | Artist | Finance/Ops | Visible from state |
| --- | --- | --- | --- | --- |
| `source_photo` | yes | yes | no | `brief_received` onward |
| `proof` | yes | yes | no | `proof_sent` onward |
| `final` | yes | yes | no | `shipped` only |
| quote `model` | yes | yes | yes | `quarantined` onward |

**C4.** Signing a download. `downloadSignerClient` is created only in Medusa from the dedicated
`R2_DOWNLOAD_SIGNER_ACCESS_KEY_ID` / `R2_DOWNLOAD_SIGNER_SECRET_ACCESS_KEY`; scope this credential to read
private object data only. The worker supervisor's `workerReadClient` is not a download signer and is never used
to return customer downloads.

```ts
const cmd = new GetObjectCommand({
  Bucket: env.R2_UPLOAD_QUARANTINE_BUCKET,
  Key: a.object_key,
  ResponseContentType: safeType(a.content_type),        // forced, never echoed
  ResponseContentDisposition: disposition(a),           // D
  ResponseCacheControl: "private, max-age=300",
})
const url = await getSignedUrl(downloadSignerClient, cmd, { expiresIn: a.role === "source_photo" ? 300 : 120 })
res.setHeader("Cache-Control", "private, no-store")
res.setHeader("Referrer-Policy", "no-referrer")
return Response.redirect(url, 302)
```

**C5.** Proofs and models `SHOULD` be proxied through the Next route instead of redirected, so the signed URL
never reaches the browser at all. Proxy `MUST` forward `Range`, force `Content-Type`, set
`X-Content-Type-Options: nosniff`, and cap the response at the object's `byte_size`.

**C6.** TTL: 300 s for photos, 120 s for models and proofs. There is no single-use presigned GET; short TTL plus
`no-referrer` plus no logging is the mitigation. Do not "extend on demand" — re-sign on each page load.

**C7.** Uniform 404 for: unknown id, foreign id, ambiguous link, wrong state, deleted object. Never 403 — a 403
confirms existence.

##### D. Object keys and filenames

**D1.** `display_filename` derivation, applied once at intent creation and stored:

```ts
export function sanitizeFilename(raw: string, ext: string): string {
  const base = raw.normalize("NFC").replace(/^.*[\\/]/, "").replace(/\.[^.]*$/, "")
  const safe = base.replace(/[^A-Za-z0-9._ -]/g, "_").replace(/[ ]{2,}/g, " ").trim().slice(0, 96)
  return `${safe || "file"}.${ext}`                       // extension forced from detection, not from input
}
```

**D2.** `Content-Disposition` `MUST` be built as
`attachment; filename="<ascii-fallback>"; filename*=UTF-8''<percent-encoded>` with the ASCII fallback reduced to
`[A-Za-z0-9._-]`. Never interpolate the raw name.

**D3.** `safeType()` allowlist: `image/jpeg`, `image/png`, `image/webp`, `model/stl`, `text/plain` (OBJ),
`application/octet-stream` (3MF). Everything else → `application/octet-stream`.

##### E. Parser sandbox and hostile-input limits

**E1. Isolation.** One job = one fresh gVisor (`runsc`) sandbox or microVM. Startup `MUST` fail if the runtime
probe fails. Flags:

```
--user=10001:10001 --read-only --cap-drop=ALL --security-opt=no-new-privileges
--network=none --pids-limit=64 --memory=2g --cpus=2 --tmpfs=/work:rw,noexec,nosuid,size=768m
--ulimit=nofile=256 --ulimit=core=0
```

No bind mounts. No Docker socket. The input is delivered as a read-only fd or a bounded copy into `/work`; the
result leaves as JSON on stdout, capped at 64 KiB. Sandbox lifetime ≤ 65 s, then `SIGKILL` and destroy.

**E2. Stage order.** Every stage has a hard cap and a distinct failure code. A stage may not start before the
previous one passes.

| # | Stage | Check | Fail code |
| --- | --- | --- | --- |
| 1 | size | `0 < size ≤ 100 MiB` | `E_SIZE` |
| 2 | magic | STL: `solid` + `facet` in first 1 KiB **or** `84 + 50*n == size`; OBJ: first non-comment token ∈ `{v,vt,vn,o,g,s,mtllib,usemtl,f,l,p}`; 3MF: `PK\x03\x04` and `[Content_Types].xml` present | `E_MAGIC` |
| 3 | container | ZIP central directory: entries ≤ 256, total declared ≤ 512 MiB, per-entry ≤ 64 MiB, ratio ≤ 20:1, depth ≤ 8, path ≤ 240 B | `E_ARCHIVE` |
| 4 | inflate | stream each needed entry through a counting writer, abort at the cap — **never** `ZipFile.read()` | `E_BOMB` |
| 5 | xml | `defusedxml` with `forbid_dtd=True, forbid_entities=True, forbid_external=True`; XML ≤ 10 MiB; depth ≤ 64; elements ≤ 2e6; attributes ≤ 32/element | `E_XML` |
| 6 | references | no `p:path` outside the archive; no `mtllib` fetch; no `file://` | `E_REF` |
| 7 | counts | vertices ≤ 2e6, triangles ≤ 2e6, faces ≤ 2e6, edges ≤ 6e6, components ≤ 1e4 | `E_COMPLEXITY` |
| 8 | geometry | finite, `|coord| ≤ 1e5 mm`, triangle area ≥ 1e-9 mm², bbox ≤ build envelope × 1.5 | `E_GEOMETRY` |
| 9 | result | schema + hash + version + sanity ratios | `E_RESULT` |

**E3. ZIP rules.** Reject: encryption flag bit 0, method ∉ {0, 8}, `..` segments, absolute paths, drive letters,
backslashes, NUL, duplicate path after NFC + lowercase, symlinks (external attr `S_IFLNK`), entries whose declared
`file_size` is 0 but `compress_size` > 0, and any entry outside `[Content_Types].xml`, `_rels/.rels`,
`3D/*.model`, `3D/_rels/*.rels`. ZIP64 is allowed only when the EOCD64 record is well-formed and consistent.

**E4. Streaming inflate — the actual zip-bomb defence.** The central directory lies; only bytes counted during
decompression are trustworthy.

```python
class ExpansionBudget:
    def __init__(self, cap: int = 512 * 1024 * 1024):
        self.remaining = cap
    def consume(self, n: int) -> None:
        self.remaining -= n
        if self.remaining < 0:
            raise LimitExceeded("E_BOMB")

class LimitedWriter(io.RawIOBase):
    def __init__(self, entry_cap: int, budget: ExpansionBudget):
        self.entry_cap, self.n, self.budget = entry_cap, 0, budget
        self.file = open_bounded_tmpfile()
    def writable(self): return True
    def write(self, b) -> int:
        self.n += len(b)
        if self.n > self.entry_cap:
            raise LimitExceeded("E_BOMB")
        self.budget.consume(len(b))                  # aggregate cap across every archive entry
        self.file.write(b)
        return len(b)

def read_entry(zf: zipfile.ZipFile, info: zipfile.ZipInfo, entry_cap: int, budget: ExpansionBudget):
    if info.flag_bits & 0x1: raise Reject("E_ARCHIVE")          # encrypted
    if info.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED): raise Reject("E_ARCHIVE")
    if info.file_size > entry_cap: raise Reject("E_ARCHIVE")
    if info.compress_size and info.file_size / max(info.compress_size, 1) > 20: raise Reject("E_BOMB")
    w = LimitedWriter(entry_cap, budget)
    with zf.open(info) as src:
        while chunk := src.read(65536):                          # bounded read, not .read()
            w.write(chunk)
    w.file.flush()
    w.file.seek(0)
    return w.file
```

**E5. XML.** Reject each 3MF XML part over 10 MiB before parsing. Preflight with `defusedxml.ElementTree` and
`forbid_dtd=True`, `forbid_entities=True`, `forbid_external=True`; then parse only the bounded, preflighted part
with a pinned `lxml.etree.XMLParser(resolve_entities=False, load_dtd=False, no_network=True, huge_tree=False,
recover=False)`. Enforce depth ≤64, elements ≤2,000,000, and attributes ≤32 per element while walking the tree.
Never enable `huge_tree`, recovery mode, DTD loading, entity resolution, or network access.

**E6. OBJ.** Line-oriented reader, never a whole-file regex. Reject lines > 8 KiB, > 20 M lines, `f` with > 64
vertices (fan-triangulate), index `0`, `|index| > vertex_count`, and any `v` line whose coordinates do not parse
with `float()` into a finite value. Negative indices resolve relative to the current vertex count. `mtllib`,
`usemtl`, `vt`, `vn` are parsed but never resolved.

**E7. STL.** Binary: read the 4-byte count, then require `84 + 50*n == size` (allow ≤ 84 trailing bytes for
publishers that append a signature; anything more → `E_GEOMETRY`). ASCII: count `facet normal` occurrences while
streaming and abort past the cap. Never allocate from the header before the size check — this is the T-15 bug.

**E8. Geometry.** Compute bounds and signed volume with `numpy.float64` from the index array, take `abs()`, and
apply sanity ratios:

```python
bbox_vol = max(bx * by * bz, 1e-9)
if volume <= 0 or volume > bbox_vol * 3.0:      result = "review_required"   # T-17
if volume / bbox_vol < 1e-6:                    result = "review_required"   # degenerate shell
```

Watertight/manifold from an edge map, not from `trimesh.is_watertight` on unmerged vertices (`process=False`
leaves every triangle separate, so the flag is always false):

```python
e = np.sort(np.concatenate([t[:, [0,1]], t[:, [1,2]], t[:, [2,0]]]), axis=1)
uniq, counts = np.unique(e, axis=0, return_counts=True)
manifold  = bool((counts == 2).all())
watertight = manifold and boundary_edges == 0
```

**E9. Result.** Strict schema, `input_sha256` equals the value stored at finalize, `asset_id` equals the job,
`parser_version` ∈ allowlist, counts within the caps from E2, and `bounds` ≤ envelope. Any mismatch → `E_RESULT`,
never a partial persist.

**E10. Timeouts.** Soft deadline 45 s checked between stages and inside the inflate/parse loops; hard kill at 60 s
by the supervisor. A killed job `MUST` be recorded as `timeout`, not `error`. Its attempt was already counted by `enqueue-analysis.ts`; the supervisor reports a fixed failure code to Medusa, and neither supervisor nor parser mutates `parse_attempt_count`.

##### F. Client-side preview (untrusted, cosmetic)

**F1.** Preview `MUST` be skipped entirely when `file.size > 25 MiB`; show "preview unavailable — server analysis
still running". The 100 MiB hard cap stays for upload.

**F2.** Worker contract: transfer the `ArrayBuffer`, never the `File`; 8 s timeout then `terminate()`; dispose
geometry, materials, renderer, and `renderer.forceContextLoss()` on unmount; `devicePixelRatio` capped at 1.5.

**F3.** Guard the STL header before handing bytes to `STLLoader` (pinned three.js may predate the length check):

```ts
function stlLooksSane(buf: ArrayBuffer) {
  if (buf.byteLength < 84) return false
  const n = new DataView(buf).getUint32(80, true)
  return n > 0 && n <= 2_000_000 && 84 + 50 * n <= buf.byteLength
}
```

**F4.** No `eval`, no `new Function`, no `importScripts` of a remote URL, no `setPath`/`mtllib` resolution.
`ThreeMFLoader` may create `blob:` URLs for embedded textures — CSP `img-src` `MUST` include `blob:`.

**F5.** Preview output is display-only. It `MUST NOT` be sent to the server, and the UI `MUST` say
"preview only — server analysis pending" until the validated result arrives.

---

##### G. Module Links and workflow integrity

**G1. Link declarations.** Cardinality is a security property here, not a convenience. `isList` marks the side
that may have many. Get it wrong and a second deposit order silently becomes legal.

```ts
// apps/medusa/src/links/commission-customer.ts — one customer, many commissions; no cascade (financial record)
export default defineLink(
  { linkable: Customer.linkable.customer, isList: true },
  Commission.linkable.commission
)

// apps/medusa/src/links/commission-order.ts — one commission, many orders (deposit + balance)
export default defineLink(
  Commission.linkable.commission,
  { linkable: Order.linkable.order, isList: true }
)

// apps/medusa/src/links/commission-charge-payment-collection.ts — sole payment-side charge anchor
export default defineLink(
  CommissionCharge.linkable.commissionCharge,
  PaymentCollection.linkable.paymentCollection
)

// apps/medusa/src/links/quote-cart.ts — exactly one active cart per quote
export default defineLink(Quote.linkable.quote, Cart.linkable.cart)
```

`deleteCascade` `MUST NOT` be set on commission→customer or commission→order. A deleted customer must not take
the accounting record with them (T-23).

**G2. Denormalized owner column.** Add owner_customer_id to Quote and Commission, written only by the create workflow from authenticated req.auth_context.actor_id. This is an O(1) authorization index and tamper detector, not a replacement for the Module Link. The authorization resolver reads the custom module record and customer association through Query/Link APIs and requires exactly one matching customer link. A nightly apps/medusa/src/jobs/verify-link-consistency.ts reports missing, duplicate, or mismatched owner links; any mismatch is a P1 alert and access fails closed.
**G3. The transition engine.** Single entry point. No other code may write `status`.

```ts
type Actor = { kind: "customer" | "user" | "system" | "worker"; id: string | null; roles: Role[] }

const GUARDS: Record<string, { actors: Actor["kind"][]; roles?: Role[]; pre?: (r: any) => Promise<void> }> = {
  "brief_received>review":        { actors: ["user"], roles: ["artist", "admin"] },
  "brief_received>cancelled":     { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "review>quote_sent":            { actors: ["user"], roles: ["finance", "admin"] },
  "review>cancelled":             { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "quote_sent>review":            { actors: ["user"], roles: ["finance", "admin"] },
  "quote_sent>deposit_pending":   { actors: ["user"], roles: ["finance", "admin"] },
  "quote_sent>cancelled":         { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "deposit_pending>sculpting":    { actors: ["system", "user"], roles: ["finance", "admin"], pre: assertDepositCaptured },
  "deposit_pending>cancelled":    { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "sculpting>proof_sent":         { actors: ["user"], roles: ["artist", "admin"], pre: assertDepositAndLatestProof },
  "sculpting>cancelled":          { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "proof_sent>approved":          { actors: ["customer"], pre: assertLatestProof },
  "proof_sent>changes_requested": { actors: ["customer"], pre: assertLatestProof },
  "proof_sent>cancelled":         { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "changes_requested>sculpting":  { actors: ["user"], roles: ["artist", "admin"], pre: assertDepositStillCaptured },
  "changes_requested>cancelled":  { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "approved>printing":            { actors: ["user"], roles: ["artist", "admin"], pre: assertDepositStillCaptured },
  "approved>cancelled":           { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "printing>finishing":           { actors: ["user"], roles: ["artist", "admin"], pre: assertDepositStillCaptured },
  "printing>cancelled":           { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "finishing>balance_pending":    { actors: ["user"], roles: ["finance", "admin"], pre: assertDepositStillCaptured },
  "finishing>shipped":            { actors: ["user"], roles: ["ops", "admin"], pre: assertAllChargesSettled },
  "finishing>cancelled":          { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
  "balance_pending>shipped":      { actors: ["user"], roles: ["ops", "admin"], pre: assertAllChargesSettled },
  "balance_pending>cancelled":    { actors: ["user"], roles: ["finance", "admin"], pre: assertCancellationPolicy },
}

async function assertDepositCaptured(c: Commission) {
  const ch = await charges.retrieveByPurpose(c.id, "deposit")
  if (!ch || ch.status !== "captured" || ch.payment_hold || ch.disputed_at) throw conflict("PAYMENT_HOLD_OR_UNRECONCILED")
  const payment = await readPaymentTruthFromCollection(ch.payment_collection_id)
  if (!payment?.captured_at) throw conflict("NOT_CAPTURED")
  if (payment.captured_amount !== ch.amount_minor || ch.amount_captured_minor !== payment.captured_amount || ch.amount_minor !== c.deposit_minor) throw conflict("AMOUNT_MISMATCH")
  if (payment.currency_code !== c.currency_code || ch.currency_code !== c.currency_code) throw conflict("CURRENCY_MISMATCH")
  if (payment.refunded_amount !== 0) throw conflict("PAYMENT_HOLD")
}

async function assertDepositAndLatestProof(c: Commission) {
  await assertDepositStillCaptured(c)
  await assertLatestProof(c)
}

async function assertDepositStillCaptured(c: Commission) {
  await assertDepositCaptured(c)
}

async function assertBalanceCaptured(c: Commission) {
  if (c.balance_minor === 0) return assertDepositStillCaptured(c)
  const ch = await charges.retrieveByPurpose(c.id, "balance")
  if (!ch || ch.status !== "captured" || ch.payment_hold || ch.disputed_at) throw conflict("PAYMENT_HOLD_OR_UNRECONCILED")
  const payment = await readPaymentTruthFromCollection(ch.payment_collection_id)
  if (!payment?.captured_at) throw conflict("NOT_CAPTURED")
  if (payment.captured_amount !== ch.amount_minor || ch.amount_captured_minor !== payment.captured_amount || payment.currency_code !== c.currency_code || ch.currency_code !== c.currency_code) throw conflict("AMOUNT_OR_CURRENCY_MISMATCH")
  if (payment.refunded_amount !== 0) throw conflict("PAYMENT_HOLD")
}

async function assertAllChargesSettled(c: Commission) {
  const chargesForCommission = await charges.listByCommission(c.id)
  const activeCharges = chargesForCommission.filter(ch => !["canceled", "expired", "mismatch_resolved"].includes(ch.status))
  if (activeCharges.some(ch => ch.payment_hold || ch.disputed_at || ch.status !== "captured")) throw conflict("PAYMENT_HOLD_OR_UNSETTLED")
  const pairs = await readPaymentPairsForChargeIds(activeCharges.map(ch => ch.id))
  if (pairs.length !== activeCharges.length) throw conflict("MISSING_PAYMENT_LINK")
  for (const { charge, payment } of pairs) {
    if (!payment?.captured_at || payment.captured_amount !== charge.amount_minor || charge.amount_captured_minor !== payment.captured_amount) throw conflict("PAYMENT_NOT_SETTLED")
    if (payment.refunded_amount !== 0 || payment.currency_code !== charge.currency_code || charge.currency_code !== c.currency_code) throw conflict("PAYMENT_HOLD_OR_CURRENCY_MISMATCH")
  }
  if (pairs.reduce((sum, pair) => sum + pair.payment.captured_amount, 0) !== c.total_minor) throw conflict("AMOUNT_MISMATCH")
}
```

**G4. The CAS.** Each domain module exposes one transition method in its custom module service. The workflow
passes `id`, `expectedStatus`, `expectedAggregateVersion`, the authenticated actor, and a bounded reason. Within
one Medusa transaction scoped to that module, the service: (1) loads and locks the Quote/Commission row using a
module-owned repository operation; (2) checks the transition table, actor/role, and payment/proof preconditions;
(3) updates only when ID, status, and `aggregate_version` still match; (4) increments `aggregate_version`; and
(5) creates the append-only QuoteEvent/CommissionEvent before commit. A lost compare-and-set returns typed
`409 STALE_STATE`. If the pinned Medusa DML repository API cannot express the conditional update/lock, implement
that one operation in a module-owned transaction-aware repository; SQL may touch only that module's custom
tables, never Commerce Module tables or Module Link tables. The only direct status update must be the CAS line in
`apps/medusa/src/modules/commissions/service.ts` or `quotes/service.ts` and carry the inline marker
`// @transition: status CAS`; `check-invariants.sh` rejects every unmarked status write. The workflow coordinates cross-module calls and
compensations; API routes, subscribers, and jobs never write status directly.

```ts
// Contract pseudocode; implement with the pinned Medusa transaction manager and module repository.
await moduleService.withTransaction(async (tx) => {
  const row = await tx.commission.lockById(id)
  assertTransitionAllowed(row.status, toStatus, actor, expectedAggregateVersion)
  assertTransitionPreconditions(row, tx) // e.g. verified captured charge or latest proof revision
  const updated = await tx.commission.compareAndSet({
    id, expectedStatus: row.status, expectedAggregateVersion,
    patch: { status: toStatus, aggregate_version: expectedAggregateVersion + 1 },
  })
  if (!updated) throw conflict("STALE_STATE")
  await tx.commissionEvent.create({ ...eventFrom(row, updated, actor, reason) })
})
```

**G5. Revision semantics.** Map the review's `current_revision` safety requirement to explicit Medusa DML fields: aggregate_version increments on every successful row/state mutation and is used by CAS; proof_revision increments only when a new commission proof is created; spec_revision increments only when a quote model or pricing input changes. Commission approval compares expected aggregate_version and the latest proof_revision. Quote acceptance compares expected aggregate_version and spec_revision. Asset processing binds to spec_revision. A stale row mutation, replaced proof, or changed quote input must fail closed.
**G6. Actor derivation.** `actor.kind` and `actor.id` come from `req.auth_context`, never from the body.
`actor_type` in the event row is therefore unforgeable. A customer route that accepts `actor_type` in the payload
is a bug.

**G7. Route protection is table-driven and tested.** Every route under `/store/custom/**` and `/admin/custom/**`
gets an explicit `authenticate()` in `middlewares.ts`, plus `validateBody`/`validateQuery` with the shared Zod
schema. A generated test enumerates the router and asserts `401` without credentials for each (T-20):

```ts
for (const r of listRoutes()) {
  if (!r.path.startsWith("/store/custom") && !r.path.startsWith("/admin/custom")) continue
  it(`${r.method} ${r.path} rejects anonymous`, async () => {
    expect((await request(r.method, r.path)).status).toBe(401)
  })
}
```

**G8. Origin policy.** The Next.js BFF `MUST` reject missing or non-allowlisted browser `Origin` on every
browser mutation. Browser-facing Route Handlers require `Content-Type: application/json`; Server Actions may
accept `FormData` only with same-origin validation and the framework's origin/host check. Browser-callable Medusa
custom routes apply the exact-origin allowlist and JSON requirement. A server-to-server BFF call uses server-only
credentials and a verified request context, not a fabricated browser Origin. Do not make that trusted SDK
request fail because the browser Origin header is absent. `SameSite=Lax` alone is not sufficient on a
multi-subdomain deployment.

**G9. Price integrity on conversion.** `convert-quote-to-cart` re-reads `pricing_snapshot`, re-runs the pricing
engine at the stored `pricing_version`, and compares:

```ts
const recomputed = calculatePrice(snapshot.inputs, rules[snapshot.pricing_version])
if (recomputed.total_minor !== quote.total_minor) throw conflict("PRICE_DRIFT")
if (sha256(canonicalJson(quote.pricing_snapshot)) !== quote.snapshot_sha256) throw conflict("SNAPSHOT_TAMPERED")
```

Add `snapshot_sha256` to `Quote` (F-06 sibling). A drift sets `review_required` and requires re-acceptance.

**G10. Line-item metadata is a claim.** Store `{ quote_id, accepted_spec_revision }` on the line item, but resolve
authority through the `quote-cart` link. On `order.placed`, verify: the link exists, `cart.id` matches the linked
cart, the line's `quote_id` matches, and the line's `unit_price` equals the snapshot. Mismatch → place the order
but flag `review_required` and alert; never silently accept.

**G11. Custom-print variant floor.** The hidden service variant `MUST` carry `minimum_minor` as its real price, so
a customer who adds it through the native Store API (bypassing the custom route) gets a safe floor rather than $0.

**G12. Admin RBAC.** Roles `ops`, `artist`, `finance`, `admin`. `authenticate("user")` proves identity only; every
admin route additionally checks a role via the RBAC module (or an explicit policy table on the pinned release).
`finance` alone may change price and refund; `artist` alone may send proofs.

##### H. Medusa payment events and split-payment idempotency

**H1. Native ingress.** Register the Medusa Stripe provider and use its native webhook endpoint at /hooks/payment/stripe_stripe. The provider verifies Stripe signatures and processes provider events. Do not create a second raw Stripe webhook route, duplicate signature-verification pipeline, or parallel Stripe payment ledger.

**H2. Events are wake-ups, not payment truth.** `apps/medusa/src/subscribers/commission-payment.ts` consumes `payment.captured`, `payment.refunded`, and applicable dispute notifications only to invoke the shared reconciliation workflow. The payload is an identifier. Re-query the Medusa Payment, Capture, Refund, Payment Collection, Payment Session, CommissionCharge, and Module Link state before any transition. Independently run `apps/medusa/src/jobs/reconcile-commission-payments.ts` every 60 seconds so a missing event cannot strand captured payment. Automatic capture can complete before `processPaymentWorkflow` runs and may skip its capture event path; never advance production from an event payload.

**H3. Deterministic charge mapping.** At checkout creation, persist `payment_collection_id` and `payment_session_id` on CommissionCharge and create exactly one Charge↔Payment Collection Module Link. Resolve a Medusa Payment by its `payment_collection_id`; resolve that collection through Query/Module Link to exactly one CommissionCharge. The Payment Collection's native links to Cart and Order are the single payment-side anchor. Commission↔Cart/Order links may describe the aggregate but are not charge-payment authority; do not create or trust Charge↔Cart or Charge↔Order links. Store `payment_id` and `provider_payment_id` as consistency checks. Optional `payment_intent.metadata.commission_charge_id` may be compared only when the pinned provider version propagates custom metadata; mismatch sets `mismatch` and alerts, but metadata is never the resolver. If collection mapping is missing, duplicated, or inconsistent, fail closed; never table-scan heuristically.

**H4. Capture truth and amount guard.** Read the current Payment and related Capture/Refund records through Medusa Query/Payment APIs. A charge can transition to `captured` only when `Payment.captured_at` is non-null, `Payment.captured_amount === CommissionCharge.amount_minor`, `Payment.refunded_amount === 0`, and payment/charge/commission currencies match after currency-exponent normalization. `authorized` without `captured_at` remains unpaid and cannot advance production. Missing capture, partial capture, amount/currency mismatch, refund, or payment hold blocks the guard and sets/retains `mismatch` or `payment_hold`; no browser redirect or event payload can satisfy it.

**H5. Atomic charge claim.** In the Commissions custom module transaction, CAS CommissionCharge from `requires_payment|processing|authorized` to `captured` using charge ID, Payment Collection ID, payment ID, exact captured amount, and currency; append a CommissionEvent with a unique `payment_event_key` for each Medusa capture/refund identity in that transaction. Include `authorized` in source states because an authorization without capture must remain unpaid. A duplicate subscriber or reconciliation attempt returns the recorded result. Only after the claim succeeds may a guarded Commission transition run. If the production transition is stale, retain verified Payment truth and retry reconciliation; never capture again or regress state.

**H6. Idempotency and mismatch recovery.** Use a deterministic idempotency key derived from commission_id, purpose, amount_minor, and pricing_version when creating a charge/cart. The active-charge unique index excludes only `canceled`, `expired`, and audited `mismatch_resolved` rows. A `mismatch` charge remains blocking until an authorized finance workflow re-reads the provider-backed Medusa Payment Collection, verifies zero outstanding/captured exposure or completed refund/void, appends an audit event, and moves it to `mismatch_resolved`; only then may a corrected charge be created. Payment side effects deduplicate by charge + Medusa payment/capture/refund identity, not a raw Stripe event ID.

**H7. Refunds, disputes, and holds.** On `payment.refunded` or a dispute notification, re-query Medusa Refund/Capture/Payment totals and recompute net captured funds. Persist `payment_hold` only on affected CommissionCharge rows when the deposit/total falls below policy or a dispute is open; do not add a Commission-level hold field. Every production and shipment guard loads all relevant charges and rejects if any has `payment_hold=true`. `assertBalanceCaptured` rejects a held charge, missing `captured_at`, amount/currency mismatch, or non-zero refunded amount; `assertDepositStillCaptured` applies the equivalent deposit checks. Clear a hold only through a finance/admin workflow after re-reading authoritative Medusa state and appending an audit event. Never use a monotonic status rank instead of current capture/refund totals.

**H8. Balance checkout race.** Require the approved lifecycle state, a fully captured deposit, every relevant CommissionCharge `payment_hold === false`, a current immutable CommissionPriceSnapshot, and an idempotency key. Compute remaining balance from approved total minus net captured amounts re-read through linked Payment Collections; if `balance_minor === 0`, return no checkout and create no charge. Concurrent duplicate requests return the existing charge, Payment Collection, cart, and session; they do not create a second Payment Collection or Stripe intent.

**H9. Provider configuration and version floor.** Configure the Stripe provider with explicit `capture: true` for the launch payment policy: collect the approved deposit at checkout; the deposit percentage remains a separate Section 3 decision. Do not rely on Stripe provider defaults (`capture` defaults to false). Pin every Medusa package to one exact aligned release at or above v2.11.1 if custom Stripe metadata assertions are retained, because PR #13801 added custom metadata propagation; payment resolution remains correct without metadata. Before adopting the exact pin, verify that the chosen release includes the auto-capture cart-completion race fix in PR #13588 and run the capture regression gate. Separate Stripe credentials per environment and verify provider/region/test-live isolation. Capture/refund calls remain inside Medusa workflows and Payment Module APIs. ([Stripe provider options](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe), [PR #13801](https://github.com/medusajs/medusa/pull/13801), [PR #13588](https://github.com/medusajs/medusa/pull/13588))

**H10. Verification matrix.** Phase 1 Stripe gate: a test payment with `capture: true` results in one captured Medusa Payment with exact amount/currency and no duplicate capture/refund; observe exactly one `payment.captured` event, or prove one reconciliation hit when the event is absent. Before Phase 3 sign-off also test duplicate/out-of-order events ×5; event absent with capture present; event present before Payment state is captured; `authorized` but never captured; automatic-capture double-call regression; stale transition; captured amount mismatch; currency mismatch; missing/ambiguous Payment Collection link; metadata absent/mismatch; partial/full refund; refund before subscriber retry; dispute/`payment_hold` before production or shipment; mismatch resolution then corrected charge; deleted Commission; concurrent balance checkout; canceled checkout; missed scheduled tick; and job restart without duplicated effects. Use only Payment Module data; no direct Stripe Payment Intent calls in custom code.
##### I. Rate limits and quotas

Redis token buckets, keyed by both IP and customer, applied at the Medusa middleware and at the Next route.

| Endpoint | Per customer | Per IP | Burst |
| --- | --- | --- | --- |
| `POST /store/custom/commissions` | 5 / h | 20 / h | 3 |
| `POST .../assets/upload-intents` | 30 / h, 3 concurrent | 60 / h | 5 |
| `POST .../finalize` | 30 / h | 60 / h | 5 |
| `POST /store/custom/quotes` | 5 / h | 20 / h | 3 |
| `POST .../accept` | 10 / h | 30 / h | 3 |
| `POST .../checkout/*` | 10 / h | 30 / h | 2 |
| `POST /auth/customer/emailpass` | — | 5 / 15 min | 5 |
| `GET /api/private/*` | 300 / h | 600 / h | 30 |
| Stripe webhook | — | 600 / min | — |

Daily storage quota per customer: 500 MiB and 40 objects. Exceeding it returns `429 QUOTA_EXCEEDED` with the reset
time. Turnstile on quote/commission creation for accounts younger than 24 h.

##### J. Logging without leaking

Allowed: `asset_id`, `quote_id`, `commission_id`, `sha256` (first 12 hex), `byte_size`, `state`, `parser_version`,
`duration_ms`, `error_code`, and the opaque CommissionEvent idempotency marker.

Forbidden: presigned URLs, full object keys (log `sha256(key).slice(0,12)`), raw customer filenames, EXIF, email
addresses (log a hash), gift notes, Stripe payloads, `Authorization`/`Cookie`/`Set-Cookie`.

A Sentry `beforeSend` and a pino redact list `MUST` both strip `X-Amz-Signature`, `X-Amz-Credential`,
`token`, `client_secret`, `payment_intent_client_secret`.

##### K. Retention and deletion

| Class | Deadline | On expiry |
| --- | --- | --- |
| Staging object | 24 h after intent expiry | lifecycle rule deletes |
| Rejected asset | 7 days | hard delete + row `deleted` |
| Quote model (accepted) | 24 months after conversion | hard delete, keep analysis row |
| Source photo | 24 months after `shipped`, or 30 days after `cancelled` | hard delete |
| Proof | 36 months after `shipped` | hard delete |
| `*_event` audit | 7 years | archive |

Deletion job order: mark `deleted` → delete all object versions (versioning makes delete a soft delete — you must
delete versions to satisfy erasure) → write tombstone. A Postgres restore `MUST` run `verify-object-existence.ts`
before the app is re-enabled (F-20).

Marketing consent: `marketing_consent_version`/`_at` per asset plus `public_derivative_key` pointing at the public
bucket. Only assets with consent get a derivative. Revoking consent deletes the derivative, not the source.

##### L. Headers

Storefront:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{n}' 'strict-dynamic';
  style-src 'self' 'nonce-{n}'; img-src 'self' blob: data: https://cdn.forma.example;
  connect-src 'self' https://api.forma.example https://api.stripe.com https://*.posthog.com;
  worker-src 'self' blob:; frame-src https://js.stripe.com; object-src 'none';
  base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")
Cross-Origin-Opener-Policy: same-origin
```

Admin SPA gets the same baseline, with `frame-ancestors 'none'` and no `unsafe-inline` for scripts. Set Admin
headers at the standalone static host/CDN response layer; Vite build configuration does not emit response
headers. Asset responses served by proxy get `Content-Security-Policy: default-src 'none'; img-src 'self'` and
`nosniff`. Staging must verify actual storefront, Admin, and asset response headers, not only config files.

The Payload admin gets the same strict baseline, is `noindex`, and is isolated from storefront public pages; Payload
database/admin secrets never reach the browser. The EUR indicative conversion is display-only: checkout totals, order
records, and structured data always use the server-authoritative RON price from Medusa.

Cookies: `__Host-forma_session` and `__Host-forma_cart` — `Secure; HttpOnly; SameSite=Lax; Path=/`, no `Domain`.

---

#### 8.7.4 Validation scripts

##### V1. Canonical `packages/contracts/src/mesh-analysis.ts` contract (single definition)

This is the only `MeshAnalysisResultSchema` definition. Implement it once at
`packages/contracts/src/mesh-analysis.ts`; `packages/contracts/src/quote.ts`, Medusa, the worker,
storefront, and tests import this shared schema/type instead of copying or redefining it. It fixes F-06 and
F-10 and makes `rejected` results expressible without fake bounds.

```ts
import { z } from "zod"

const finite = z.number().finite()
const mm = finite.nonnegative().max(200_000)

const Base = z.object({
  schema_version: z.literal(1),
  job_id: z.string().uuid(),
  asset_id: z.string().min(1).max(128), // opaque Medusa DML ID; do not require UUID format
  spec_revision: z.number().int().positive(),
  input_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  parser_version: z.string().regex(/^\d+\.\d+\.\d+$/),
})

const Ok = Base.extend({
  result: z.enum(["valid", "review_required"]),
  unit: z.enum(["mm", "inch", "unknown"]),
  bounds_mm: z.object({ x: mm, y: mm, z: mm }).strict()
    .refine(b => Math.max(b.x, b.y, b.z) > 0, "degenerate bounds"),
  volume_mm3: finite.nonnegative().max(1e12),
  vertex_count: z.number().int().nonnegative().max(2_000_000),
  triangle_count: z.number().int().nonnegative().max(2_000_000),
  component_count: z.number().int().nonnegative().max(10_000),
  watertight: z.boolean(),
  manifold: z.boolean(),
  reasons: z.array(z.enum([
    "unknown_unit", "non_manifold", "open_shell", "multi_shell",
    "volume_ratio_low", "volume_ratio_high", "near_build_limit",
  ])).max(8),
}).strict()

const Bad = Base.extend({
  result: z.literal("rejected"),
  reason: z.enum(["E_SIZE","E_MAGIC","E_ARCHIVE","E_BOMB","E_XML","E_REF",
                  "E_COMPLEXITY","E_GEOMETRY","E_TIMEOUT","E_RESULT"]),
}).strict()

export const MeshAnalysisResultSchema = z.discriminatedUnion("result", [Ok, Bad])
```

##### V2. Worker result verification (Medusa side)

```ts
export async function acceptAnalysis(rawBody: Uint8Array, headers: Headers) {
  if (rawBody.byteLength > 64 * 1024) throw badRequest("RESULT_TOO_LARGE")
  await verifyWorkerHmac(rawBody, headers)                        // V3: verify before parsing
  const r = MeshAnalysisResultSchema.parse(JSON.parse(Buffer.from(rawBody).toString("utf8")))

  const asset = await quotes.retrieveQuoteAsset(r.asset_id)
  if (!asset || asset.state !== "processing") throw conflict("NOT_PROCESSING")
  if (asset.sha256 !== r.input_sha256) throw conflict("HASH_MISMATCH")
  if (asset.analysis_job_id !== r.job_id) throw conflict("JOB_MISMATCH")
  if (asset.spec_revision !== r.spec_revision) throw conflict("STALE_REVISION")
  if (!PARSER_ALLOWLIST.has(r.parser_version)) throw conflict("PARSER_VERSION")

  const q = await quotes.retrieveQuote(asset.quote_id)
  if (q.spec_revision !== r.spec_revision) throw conflict("STALE_REVISION")

  if (r.result !== "rejected") {
    if (r.bounds_mm.x > ENVELOPE.x * 1.5 || r.bounds_mm.y > ENVELOPE.y * 1.5 || r.bounds_mm.z > ENVELOPE.z * 1.5)
      r.result = "review_required"
    if (r.volume_mm3 > r.bounds_mm.x * r.bounds_mm.y * r.bounds_mm.z * 3)
      r.result = "review_required"
  }

  await quotes.acceptAnalysisResult({ assetId: asset.id, quoteId: q.id, result: r })
  // Module service persists the analysis idempotently and CAS-updates QuoteAsset + Quote + QuoteEvent
  // in one transaction, matching job_id, input hash, parser version, spec_revision, and processing state.
}
```

##### V3. Worker HMAC

```ts
async function verifyWorkerHmac(rawBody: Uint8Array, h: Headers) {
  const kid = h.get("x-forma-kid"), ts = h.get("x-forma-ts"), nonce = h.get("x-forma-nonce"), sig = h.get("x-forma-sig")
  if (!kid || !ts || !nonce || !sig) throw unauthorized()
  if (!/^\d{10}$/.test(ts) || !/^[A-Za-z0-9_-]{22}$/.test(nonce) || !/^[A-Za-z0-9_-]{43}$/.test(sig)) throw unauthorized("FORMAT")
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) throw unauthorized("SKEW")
  const secret = WORKER_KEYS[kid]
  if (!secret) throw unauthorized("KID")
  const expect = createHmac("sha256", secret)
    .update(`${ts}.${nonce}.${sha256(rawBody)}`).digest()
  const supplied = Buffer.from(sig, "base64url")
  if (supplied.length !== expect.length || !timingSafeEqual(expect, supplied)) throw unauthorized("SIG")
  if (!(await redis.set(`wk:${kid}:${nonce}`, "1", "EX", 600, "NX"))) throw unauthorized("REPLAY")
}
```

Keys rotate monthly with a 7-day overlap; `kid` is the key id. A retired key `MUST` be removed from `WORKER_KEYS`
so a stale worker cannot post.

##### V4. `scripts/security/check-invariants.sh` — CI gate

```bash
#!/usr/bin/env bash
set -euo pipefail
fail=0
pass() { printf 'ok   %s\n' "$1"; }
fail_check() { printf 'FAIL %s\n' "$1"; fail=1; }
command -v rg >/dev/null 2>&1 || { printf 'FAIL ripgrep is required by this gate\n'; exit 1; }

# I3: the only direct status CAS lines carry the inline marker in the two module services
status_writes="$(rg -n --no-heading --glob '*.ts' '\.update[A-Za-z]*\(.*status:' apps/medusa/src || true)"
marked_writes="$(rg -n --no-heading --glob '*.ts' '\.update[A-Za-z]*\(.*status:.*// @transition: status CAS' apps/medusa/src/modules/commissions/service.ts apps/medusa/src/modules/quotes/service.ts || true)"
if [[ -n "$status_writes" && "$status_writes" == "$marked_writes" ]]; then pass "status writes are transition-marked CAS only"; else fail_check "unmarked or non-transition status write"; fi

# I9: signed URLs generated in one module only
signers="$(rg -l --glob '*.ts' 'getSignedUrl' apps/medusa/src || true)"
if [[ "$signers" == "apps/medusa/src/lib/r2/presign.ts" ]]; then pass "getSignedUrl confined"; else fail_check "getSignedUrl confined"; fi

# I6: no customer filename in a key
if rg -n --glob '*.ts' 'Key:\s*`?[^`]*\$\{[a-zA-Z]*[Ff]ilename' apps/medusa/src; then
  fail_check "keys built centrally"
else
  pass "keys built centrally"
fi

# I1: no NEXT_PUBLIC secret smells
if rg -n 'NEXT_PUBLIC_.*(secret|admin|private|r2_|stripe_sk)' apps/storefront/src -i; then
  fail_check "no secret in public env"
else
  pass "no secret in public env"
fi

# I2: every private route calls the resolver
private_routes="$(rg --files apps/storefront/src/app/api/private -g route.ts || true)"
if [[ -z "$private_routes" ]]; then fail_check "private routes authorized: no route files found"; else
  while IFS= read -r f; do if rg -q 'authorizeAsset' "$f"; then :; else fail_check "private route missing authorizeAsset: $f"; fi; done <<< "$private_routes"
  [[ "$fail" -ne 0 ]] || pass "private routes authorized"
fi

# F-14: CSP present
if rg -q 'Content-Security-Policy' apps/storefront/next.config.ts; then pass "csp configured"; else fail_check "csp configured"; fi

# F-12: admin routes role-checked
admin_routes="$(rg --files apps/medusa/src/api/admin/custom -g route.ts || true)"
if [[ -z "$admin_routes" ]]; then fail_check "admin routes role-checked: no route files found"; else
  while IFS= read -r f; do if rg -q 'requireRole' "$f"; then :; else fail_check "admin route missing requireRole: $f"; fi; done <<< "$admin_routes"
  [[ "$fail" -ne 0 ]] || pass "admin routes role-checked"
fi

# webhook tolerance not disabled
if rg -n 'constructEvent.*,[[:space:]]*0\)' apps/medusa/src; then fail_check "stripe tolerance"; else pass "stripe tolerance"; fi

# parser caps unchanged without a decision-log entry
if rg -q 'MAX_TRIANGLES = 2_000_000' apps/private-media-worker/parser/src/forma_mesh_parser/limits.py; then pass "limits pinned"; else fail_check "limits pinned"; fi

exit $fail
```

##### V5. IDOR matrix test (Playwright)

```ts
const CASES = [
  ["A reads own source photo",        A, "available", 200],
  ["B reads A source photo",          B, "available", 404],
  ["B reads A proof before proof_sent", B, "sculpting", 404],
  ["A reads proof before proof_sent", A, "sculpting", 404],
  ["A reads proof after proof_sent",  A, "proof_sent", 200],
  ["A reads final before shipped",    A, "finishing", 404],
  ["anonymous reads A source photo",  null, "available", 401],
  ["admin reads any",                 ADMIN, "available", 200],
  ["artist reads final",              ARTIST, "shipped", 200],
  ["finance reads source photo",      FINANCE, "available", 404],
  ["deleted asset",                   A, "deleted", 404],
  ["random uuid",                     A, "available", 404],
]
```

Assert status **and** that every failure body is byte-identical (no existence oracle).

##### V6. Custom-module migration additions

Generate schema migrations from the DML models in `apps/medusa/src/modules/commissions/` and
`apps/medusa/src/modules/quotes/`; never alter Medusa Commerce Module tables. Add the following supplemental
constraints/indexes inside those custom-module migrations, using the actual generated table names from the
pinned Medusa release:

- CommissionCharge: unique active charge on `(commission_id, purpose)` where status is not `canceled` or
  `expired` or audited `mismatch_resolved`; a `mismatch` remains unique/blocking until the audited resolution workflow confirms provider-side exposure is reconciled.
- CommissionEvent: unique non-null `payment_event_key` for Medusa payment/capture/refund side-effect deduplication.
- QuoteAsset: unique live model on `(quote_id, spec_revision)` where state is not `rejected`, `deleted`, `expired`, or `abandoned`.
- QuoteAnalysis: unique `(asset_id, parser_version, input_sha256)`; `job_id` also uniquely identifies one job result.
- Quote and Commission event records are append-only through their module services; application paths never update
  or delete an event. If database-level append-only privileges are available for the deployed role setup, verify
  them in staging without breaking Medusa's migration/runtime role separation.

##### V7. Hostile fixtures (must exist before Phase 4 sign-off)

| Fixture | Asserts |
| --- | --- |
| `bomb-ratio.3mf` | deterministic compressed entry exceeds the test-only ratio cap; abort before mesh allocation |
| `bomb-absolute.3mf` | several stored entries each under the per-entry cap exceed an injected test-only aggregate budget; abort while streaming |
| `laughs.3mf` | DTD entity expansion rejected |
| `xxe.3mf` | external entity not fetched |
| `traversal.3mf` | `../../etc/passwd` entry rejected |
| `dup-path.3mf` | `3D/A.model` + `3d/a.model` rejected |
| `encrypted.3mf` | flag bit 0 rejected |
| `liar.stl` | header count 0xFFFFFFFF rejected pre-allocation |
| `truncated.stl` | size/count mismatch rejected |
| `nan.obj` | `v nan 0 0` rejected |
| `negative-index.obj` | out-of-range negative index rejected |
| `big-poly.obj` | 200-vertex face fan-triangulated or rejected |
| `thin.obj` | volume ratio → `review_required` |
| `mtllib.obj` | no network fetch |
| `cpu.obj` | 60 s kill, `E_TIMEOUT` |
| `valid.stl/obj/3mf` | happy path, exact hash |

Generate them in `parser/tests/fixtures/build.py` so they are reproducible, and run the whole set in CI against the
real sandbox adapter.

---

#### 8.7.5 CI gates and acceptance criteria

CI `MUST` fail on: `check-invariants.sh`, `pip-audit` / `pnpm audit --prod`, a parser image rebuild when
`pyproject.lock` changes, migration drift, the route-authentication sweep, the IDOR matrix, and the fixture suite.

Phase 3/4 are not "done" until all of the following are demonstrated on staging, not just asserted:

1. Two accounts cannot read each other's photos, proofs, or models (V5 green).
2. Redeliver the same Stripe test payment through Medusa's native Stripe provider route ×5; the Medusa payment state and custom Commission side effects resolve to one captured charge/event.
3. Two concurrent `POST /checkout/balance` return one cart and one charge.
4. Accepting revision 3 after a revision-4 revision returns `409 STALE_STATE`.
5. A tampered `line_item.metadata.quote_id` is caught at `order.placed`.
6. Every hostile fixture produces the expected code and the worker survives.
7. A killed sandbox leaves no container, temp file, or credential behind.
8. `grep -r "X-Amz-Signature"` in the log sink returns nothing.
9. Deleting a commission removes every object version and leaves a tombstone.
10. Restoring the DB from backup into an empty bucket is detected by `verify-object-existence.ts`.
11. Staging storefront, standalone Admin, and private-asset responses pass the deployed-header smoke test; Admin has strict CSP at its static host and no third-party scripts.

---

#### 8.7.6 Residual risks and decisions needed

| # | Residual risk | Why it stays | Owner action |
| --- | --- | --- | --- |
| R-1 | R2 does not establish a presigned maximum-body-size gate | The presigned PUT path may accept more bytes than the user claimed before finalize rejects it. | Use a Cloudflare Worker streaming cap, or record acceptance of this residual risk with quota alarms and finalize rejection before launch. |
| R-2 | Presigned GET is not single-use | S3/R2 semantics | Accept 120–300 s TTL; proxy models and proofs |
| R-3 | gVisor availability on the chosen host | Not all PaaS expose `runsc` | Confirm host in Phase 0; if unavailable, use a microVM (Firecracker) rather than a plain container |
| R-4 | Client preview can still be slow on low-end phones | Cosmetic only | 25 MiB cap; measure on a real mid-range Android |
| R-5 | Stripe webhook secret is a single point of compromise | Platform design | 90-day provider-secret rotation drill; CommissionEvent payment-event idempotency markers survive rotation |
| R-6 | Admin XSS = full compromise (Medusa stores its token in `localStorage`) | Framework behaviour | Strict CSP at the standalone Admin origin; no third-party scripts there |
| R-7 | Link tables have no FK, so dangling rows are possible | Medusa design | `verify-link-consistency.ts` nightly |

- D-1: proxy or redirect private assets (recommend proxy for proofs/models, redirect for thumbnails); resolve before Phase 3 release.
- D-2: retention durations in 8.7.3 K (recommend the table as written, pending legal review); resolve before Phase 3 release.
- D-3: RBAC granularity; resolve before the first Commission DML migration.
- D-4: upload gateway — Cloudflare Worker streaming cap, or accept R-1 with quota alarms; resolve before Phase 4 release.
- D-5: cancellation/refund policy — define cancellation window, refund/void behavior, and authorizing staff role before enabling cancellation/refund commands.

---

#### 8.7.7 Mapping to plan tasks

Add to §9.6: `G-1` link cardinality + `owner_customer_id`; `G-2` transition engine + guard table; `G-3` RBAC; `G-4` charge columns + unique index; `G-5` native-payment event idempotency; `G-6` marketing consent columns; `G-7` private asset proxy; `G-8` retention job + tombstone; `G-9` header/CSP config; `G-10` rate-limit middleware; `G-11` 60-second missed-payment-event reconciler.

Add to §9.7: `Q-1` `spec_revision` + unique index; `Q-2` `finalized_at` claim; `Q-3` `input_sha256`/`job_id` +
unique; `Q-4` `snapshot_sha256`; `Q-5` worker HMAC + nonce; `Q-6` fixture suite; `Q-7` `parse_attempt_count` ceiling;
`Q-8` hardened result union; `Q-9` client preview caps.

Add to §8.5: the IDOR matrix, the replay matrix, the fixture suite, and `check-invariants.sh` as named suites.

Add to §11 decision log on acceptance: "Security POV adopted as Section 8.7; list residual risks and unresolved D-1…D-5 decisions with owners. Do not mark an open residual-risk choice as accepted by implication."

---

#### 8.7.8 Open decisions

Section 11 is the sole source of truth for decision status, owner, and gate. Resolve D-3 before the first Commission DML migration; resolve D-1, D-2, D-4, and D-5 before the phase gates stated in their decision rows. Security controls are specified in Sections 8.7.1–8.7.7 and are not duplicated here.

*End of section.*


## 9. Roadmap

### 9.1 Phase status

| Phase | Name | Status | Est. effort |
| --- | --- | --- | --- |
| 0 | Foundation & decisions | **In progress — workspace scaffolded and verified; CI, worker placeholder, visual baseline, and managed-service accounts next** | 0.5–1 day |
| 1 | Medusa foundation | Not started | 3–5 days |
| 2 | Next.js storefront spine | Not started | 5–8 days |
| 3 | Portrait Studio flow | Not started | 5–8 days |
| 4 | Custom quote flow | Not started | 5–8 days |
| 5 | Content, trust & SEO | Not started | 4–6 days |
| 6 | Polish, QA & launch | Not started | 4–6 days |
| 7 | Post-launch growth | Not started | Ongoing |

Estimates are planning ranges, not commitments. Update the table as work progresses.

### 9.2 Launch MVP

The first public launch should include:

- Home, shop, category, product, cart, checkout, account basics.
- Portrait Studio landing + start flow + deposit + status/proof approval.
- Custom Printing landing + upload/estimate + checkout.
- Projects index + at least 6 case studies.
- Materials, About, Reviews, Help/FAQ, Contact, legal.
- At least 3 journal articles.
- Real emails, analytics with consent, sitemap/OG/JSON-LD.
- Accessibility and performance pass.
- No fake reviews, counts, or scarcity.

AR, trade/wholesale, multi-currency, loyalty, and advanced personalization can follow.

### 9.3 Phase 0 — Foundation & decisions

- [x] Review and correct the Medusa v2 / Next.js architecture in Sections 5–6.
- [x] Expand Phases 1–4 with implementation paths, data contracts, workflow boundaries, library choices, and security acceptance criteria.
- [x] Integrate the payment-hardening follow-up reviews into Section 8.7 and the Phase 1/3/4 contracts; keep unresolved role and infrastructure choices as explicit gates.
- [x] Review Section 3 with the user and record decisions (2026-10-28; see Section 11).
- [x] Initialize git; the repository has initial commit 4a658c6.
- [x] Add `.gitignore` and remove tracked generated output (`dist/`, `node_modules/`, and `npm-cache-temp/`) from the Git index while preserving local files.
- [x] Create a baseline tag for the current static site before restructuring: `baseline-static-site` (2026-10-28).
- [x] Create `AGENTS.md` pointing to this plan (done during planning).
- [x] Create a `migration/medusa` branch for the rebuild; merge in phase-sized increments.
- [x] Pin the workspace runtime: Node 24.22.2 (Nodist + `.node-version`), pnpm 11.25.0 (`packageManager`), and record the versions in the root README and lockfile.
- [x] Create pnpm workspace: `apps/storefront`, `apps/medusa`, `apps/cms`, `packages/contracts`, and `legacy/`.
- [ ] Add the `apps/private-media-worker` Phase 0 placeholder package; the functional worker belongs to Phase 3.
- [x] Create `packages/contracts` as workspace package `@forma/contracts`; build strict TypeScript/Zod contracts to `dist/` and export `./product`, `./commission`, `./quote`, and `./mesh-analysis` for both apps.
- [x] Document the RON/EUR display model and `/ro` + `/en` routing in the root README and app env examples; never let EUR display values reach checkout.
- [x] Resolve the current mobile-menu Playwright timeout (`node scripts/functional-test.mjs`: 12/13 on two runs), rerun the 13-check baseline, and update these metrics before moving the Vite app to `legacy/`. Closed the desktop page before the mobile check and wait for header hydration; 13/13 on six consecutive runs.
- [x] Move the current Vite app to `legacy/` (or preserve it in git history and keep a reference copy).
- [x] Scaffold Medusa v2, Next.js storefront, and Payload CMS apps; pin exact versions; document them.
- [x] Add `.env.example` for each app and a root README.
- [ ] Add CI: install pnpm and ripgrep before running `scripts/security/check-invariants.sh`; run lint, typecheck, build, tests, security invariants, and migration checks.
- [ ] Create accounts/projects (user-assisted): Neon (Medusa + Payload), Upstash, R2, Stripe test, Resend, Meilisearch, Vercel, Railway/Fly.
- [ ] Document the visual baseline and screenshot references.
- [x] Update the current-focus block.

**Done when:** the workspace installs and builds; the legacy site is recoverable; apps start; env docs exist; CI is green; decisions are recorded.

### 9.4 Phase 1 — Medusa foundation

- [ ] **Pin runtime and dependencies.** Set the root Node version to one supported by the exact pinned Medusa CLI/framework release; the current CLI docs require Node 22.22.0 or later. Record Node, pnpm, Medusa, Next.js, and React versions in the root README and lockfile. Pin all aligned Medusa packages to one exact release, never floating `latest`; require Medusa ≥2.11.1 if retaining Stripe custom-metadata assertions, and verify the selected release includes PR #13588's automatic-capture race fix. Payment resolution must work without provider metadata. Use monorepo paths apps/medusa, apps/storefront, apps/cms, packages/contracts, and preserve the existing app in legacy/.
- [ ] **Install backend packages in apps/medusa/package.json.** Runtime: @medusajs/medusa, @medusajs/framework, @medusajs/cli, zod (or @medusajs/framework/zod inside Medusa code), @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, and resend. Keep Medusa packages on one pinned release. Use @medusajs/medusa/core-flows for commerce workflows; do not write commerce tables or duplicate core services.
- [ ] **Configure apps/medusa/medusa-config.ts.** Read database, Redis, JWT, cookie, CORS, Stripe, public R2, and Resend configuration only from process.env; validate required production variables at boot and fail startup when missing. Configure PostgreSQL with projectConfig.databaseUrl, JWT_SECRET, and COOKIE_SECRET. Set `STORE_CORS` to the storefront HTTPS origin only, `ADMIN_CORS` to the standalone Admin HTTPS origin only, and `AUTH_CORS` to the exact allowed auth client origins; no wildcard or `null` origins. `.env.example` may use obvious placeholders, but deployment validation must reject placeholders and require exact origins. Register Redis Workflow Engine from @medusajs/medusa/workflow-engine-redis with redis.redisUrl from REDIS_URL; do not use deprecated url configuration.
- [ ] **Create apps/medusa/.env.example and apps/medusa/README.md.** Document DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET, STORE_CORS, ADMIN_CORS, AUTH_CORS, STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, R2_PUBLIC_ENDPOINT, R2_PUBLIC_BUCKET, R2_PUBLIC_ACCESS_KEY_ID, R2_PUBLIC_SECRET_ACCESS_KEY, R2_PUBLIC_URL, R2_PRIVATE_ENDPOINT, R2_PRIVATE_REGION, R2_UPLOAD_STAGING_BUCKET, R2_UPLOAD_STAGING_ACCESS_KEY_ID, R2_UPLOAD_STAGING_SECRET_ACCESS_KEY, R2_UPLOAD_QUARANTINE_BUCKET, R2_UPLOAD_QUARANTINE_ACCESS_KEY_ID, R2_UPLOAD_QUARANTINE_SECRET_ACCESS_KEY, R2_WORKER_ACCESS_KEY_ID, R2_WORKER_SECRET_ACCESS_KEY, R2_DOWNLOAD_SIGNER_ACCESS_KEY_ID, R2_DOWNLOAD_SIGNER_SECRET_ACCESS_KEY, UPLOAD_INTENT_SECRET, RESEND_API_KEY, and RESEND_FROM. Use dummy values only. Scope each R2 key to its assigned bucket/role; the private-download signer is Medusa-only and separate from the worker read key; never share public-asset credentials with private upload or worker services. Never commit populated environment files.
- [ ] **Configure the public file provider.** Register @medusajs/medusa/file and @medusajs/medusa/file-s3 in apps/medusa/medusa-config.ts. Map file_url, access_key_id, secret_access_key, bucket, region: "auto", and R2 endpoint from environment variables. This provider serves public catalogue images and GLBs only. Customer uploads use a separate private R2 bucket and never receive a public URL.
- [ ] **Configure Stripe in Medusa.** Register @medusajs/medusa/payment-stripe under @medusajs/medusa/payment with apiKey, webhook secret, and explicit `capture: true` from validated server configuration; the launch flow captures the approved amount at checkout, while deposit percentage remains a Section 3 business decision. Preserve Medusa's native `/hooks/payment/stripe_stripe` route; do not add a second Stripe webhook endpoint or persist card data. Enable Stripe only for the configured RON region. Provider metadata is not a resolver; if the optional metadata assertion is retained, obey the v2.11.1 version floor above.
- [ ] **Seed the initial commerce configuration in apps/medusa/src/scripts/seed.ts.** Idempotently create/retrieve one Romania region with country `ro`, currency `ron`, Romanian default locale, VAT-inclusive tax configuration, and the storefront sales channel. Add only tax and shipping providers/options approved in Section 3. Create Romania flat-rate/manual shipping options; do not create an EU/EUR region, enable EU shipping, or promise DDP/returns beyond the approved policy. Seed product prices in RON only after the product price migration decision (Section 3 decision 13) is recorded; never reuse the current USD-style numbers as RON.
- [ ] **Provision the first Admin user.** Run pnpm --dir apps/medusa exec medusa user --email <operator-email> --invite, or use --password only through a secure terminal that does not record the secret. Verify login at the configured Admin URL. Use least privilege supported by the pinned release and document provisioning/offboarding in apps/medusa/README.md.
- [ ] **Build the Medusa Admin as FORMA's standalone Vite SPA.** Put custom routes/widgets in apps/medusa/src/admin/ and use @medusajs/admin-sdk (defineRouteConfig) and @medusajs/ui. Add an `admin:build` script in apps/medusa/package.json that runs the pinned `medusa build --admin-only`; deploy its `.medusa/admin` output to the dedicated Admin static host with SPA fallback. Set `admin.path` and `admin.backendUrl` in apps/medusa/medusa-config.ts, configure exact-origin backend CORS and static-host security headers, and keep Admin API routes in the Medusa server. Add `scripts/security/check-deployed-headers.mjs` to verify the staging storefront, Admin, and private-asset response headers. The normal combined build's `/app` path is a supported Medusa v2 mode but is not the FORMA deployment target. Do not implement Admin as a Next.js route. ([Admin](https://docs.medusajs.com/learn/fundamentals/admin), [build](https://docs.medusajs.com/resources/medusa-cli/commands/build))
- [ ] **Define packages/contracts/src/product.ts.** Export ProductMetaV1Schema and ProductMetaV1 = z.infer<typeof ProductMetaV1Schema>. Use a strict Zod schema: schema_version is literal 1; availability is ready|made_to_order|custom; processes is an array of FDM|SLA|SLS|MJF with max 4; lead_time_days is a non-negative integer; lead_time_label is bounded; materials and finishes are bounded arrays of controlled keys; dimensions have positive width/height/depth and unit mm|cm; weight_grams is a positive integer; care, edition, designer_note are bounded; glb_url and poster_url require HTTPS; seo.title/description are bounded. Reject unknown keys and invalid URLs. Do not put quote analysis, consent, private keys, custom-work prices, or commission state in product metadata.

~~~ts
import { z } from "zod"

const httpsUrl = z.string().url().refine((value) => new URL(value).protocol === "https:")

export const ProductMetaV1Schema = z.object({
  schema_version: z.literal(1),
  availability: z.enum(["ready", "made_to_order", "custom"]),
  processes: z.array(z.enum(["FDM", "SLA", "SLS", "MJF"])).max(4),
  lead_time_days: z.number().int().nonnegative(),
  lead_time_label: z.string().trim().min(1).max(80).optional(),
  materials: z.array(z.string().trim().min(1).max(48)).max(16),
  finishes: z.array(z.string().trim().min(1).max(48)).max(16),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    depth: z.number().positive(),
    unit: z.enum(["mm", "cm"]),
  }).strict(),
  weight_grams: z.number().int().positive(),
  care: z.string().max(500).optional(),
  edition: z.string().max(100).optional(),
  designer_note: z.string().max(1000).optional(),
  glb_url: httpsUrl.optional(),
  poster_url: httpsUrl.optional(),
  seo: z.object({
    title: z.string().trim().min(1).max(70).optional(),
    description: z.string().trim().min(1).max(160).optional(),
  }).strict().optional(),
}).strict()

export type ProductMetaV1 = z.infer<typeof ProductMetaV1Schema>
~~~

- [ ] **Seed catalogue using native workflows.** Keep catalog input in apps/medusa/src/data/catalog.json; validate every record with ProductMetaV1Schema before calling workflows in apps/medusa/src/scripts/seed.ts. Use createProductCategoriesWorkflow, createProductCollectionsWorkflow, and createProductsWorkflow from @medusajs/medusa/core-flows; verify exports against the pinned release before coding. Seed idempotently by stable handle/SKU. Follow Section 4's ten disciplines and the Section 3 default of 14 products unless the catalogue decision changes. Never seed placeholder reviews or unsupported product counts.
- [ ] **Create the ten top-level categories and justified leaves.** Preserve the existing concept handles and order from legacy/src/data/catalog.ts: personalised (Personalised), home (Home & Living), art (Art & Collectibles), jewellery (Jewellery & Wear), tech (Tech & Hobby), toys (Toys & Games), food (Food & Events), prototypes (Prototypes & Industry), health (Health & Science), automotive (Automotive & Repair). Migrate each category's existing subcategories[].name and editorial description into apps/medusa/src/data/categories.json; map every product using the legacy category ID. Do not migrate the legacy display counters, badges, ratings, or scarcity copy as Medusa data. Create a public leaf page only with at least three real products and unique approved copy; otherwise expose it as a filter or mega-menu link to its parent.
- [ ] **Create collections in apps/medusa/src/data/collections.json.** Add Studio Picks, Ready to Ship, Gifts, Under $100, and Architectural Models only when each has qualifying products. Derive membership from real catalog/prices; never claim a price threshold or ready-to-ship availability unless the variant/inventory satisfies it.
- [ ] **Create products and variants with native fields.** Seed title, handle, status, description, category/collection IDs, options, variants, SKU, Medusa Pricing amounts in integer minor currency units, inventory policy/stock where applicable, weight/dimensions, images/alt text, and validated metadata.forma. Keep made-to-order lead time distinct from stock quantity. Public images/GLBs must use the public asset origin, never private uploads.
- [ ] **Create a publishable key.** Use Medusa Admin or the native publishable-key workflow and associate the key only with the storefront sales channel. Store it server-side as MEDUSA_PUBLISHABLE_KEY; expose only the publishable value as NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY. Keep secret API keys and Admin tokens server-only.
- [ ] **Implement the transactional email adapter.** Dispatch through Medusa Notification Module. Use npm package resend only inside apps/medusa/src/modules/resend-notification/ and register the provider in medusa-config.ts. Templates live in src/modules/resend-notification/templates/. Use a local provider in development. Log delivery state/provider message IDs, never API keys.
- [ ] **Add verification scripts.** Put apps/medusa/src/scripts/verify-catalog.ts and verify-payment-provider.ts in place, plus server-only `src/lib/payments/read-payment-truth.ts` for re-reading current Medusa Payment/Capture/Refund/Payment Collection state. Use Medusa Query/SDK APIs, not direct SQL. Verify region currency, publishable-key sales-channel association, seeded counts, prices, inventory policy, image URLs, Stripe provider availability, `capture: true`, and that capture truth can be reconstructed by Payment Collection ID without provider metadata.
- [ ] **Exercise normal Stripe test checkout.** Create a cart, add a seeded variant, set address and an approved shipping option, create a payment collection/session through Store API or native workflow, complete through Medusa, and verify Order/Payment Module records. With `capture: true`, assert one captured Medusa Payment with exact amount/currency and no duplicate capture/refund. The Phase 1 capture gate passes when exactly one `payment.captured` event arrives or the same re-read path records exactly one reconciliation hit; test both event-present and event-absent outcomes. Never mark an order paid from browser state.
- [ ] **Run migration commands from apps/medusa.** Generate module migrations after DML changes with pnpm exec medusa db:generate <module-name>, then apply pnpm exec medusa db:migrate. After link changes run pnpm exec medusa db:migrate or pnpm exec medusa db:sync-links. Record commands in apps/medusa/README.md. ([DML](https://docs.medusajs.com/learn/fundamentals/data-models), [S3 provider](https://docs.medusajs.com/resources/infrastructure-modules/file/s3), [Stripe provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe))

**Done when:** Medusa Admin can manage the catalogue; the storefront can fetch products/categories/collections; images are served from R2; a test order completes in Stripe test mode.

### 9.5 Phase 2 — Next.js storefront spine

- [ ] **Create apps/storefront.** Use Next.js App Router, strict TypeScript, and React compatible with the pinned Next.js/Medusa SDK. Add @medusajs/js-sdk, @medusajs/types, @tanstack/react-query v5, zod, next-intl, @stripe/stripe-js, @stripe/react-stripe-js, @google/model-viewer, three, lucide-react, and meilisearch only where used. Keep package.json, next.config.ts, tsconfig.json, eslint.config.mjs, and .env.example inside apps/storefront/.
- [ ] **Use this App Router structure.** apps/storefront/src/app/layout.tsx owns fonts, global CSS, metadata defaults, and providers; app/[locale]/layout.tsx owns locale providers and `generateStaticParams` for `ro` and `en`; app/[locale]/(store)/layout.tsx owns announcement/header/footer; app/[locale]/(store)/page.tsx is home. Add pages at `[locale]/(store)/shop/page.tsx`, `shop/[category]/page.tsx`, `shop/[category]/[subcategory]/page.tsx`, `products/[handle]/page.tsx`, `collections/[slug]/page.tsx`, `search/page.tsx`, `portrait-studio/page.tsx`, `custom-printing/page.tsx`, `projects/page.tsx`, `projects/[slug]/page.tsx`, `materials/page.tsx`, `reviews/page.tsx`, `cart/page.tsx`, `checkout/page.tsx`, and `account/...`. Redirect `/` to `/ro`; add app/sitemap.ts, app/robots.ts, app/not-found.tsx, and app/error.tsx.
- [ ] **Create the shared presentation tree.** Put components in apps/storefront/src/components/: site/announcement-bar.tsx, site/header.tsx, site/mega-menu.tsx, site/mobile-menu.tsx, site/footer.tsx, home/hero-slider.tsx, home/discipline-index.tsx, product/product-gallery.tsx, product/product-3d-viewer.tsx, cart/cart-drawer.tsx, checkout/checkout-form.tsx, and ui/. Put tokens and ported CSS in src/styles/tokens.css and src/styles/globals.css. Preserve premium spacing, rounded surfaces, subtle glass/light, white space, and reduced-motion behavior; do not replace the brand system with a generic UI kit.
- [ ] **Create the Medusa SDK boundary.** Add apps/storefront/src/lib/medusa/sdk.server.ts with server-only and @medusajs/js-sdk, initialized from MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY. Add sdk.browser.ts with only NEXT_PUBLIC_MEDUSA_URL and NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY. Never import the server SDK into a Client Component. Never expose Admin API keys, Stripe secret keys, R2 credentials, or customer session secrets through NEXT_PUBLIC_*. Add src/lib/medusa/queries/ and mappers/ for narrow reads and DTO mapping. Validate metadata.forma with ProductMetaV1Schema before rendering.
- [ ] **Fetch public SEO data in Server Components.** Product, category, collection, and region reads execute on the server with @medusajs/js-sdk and request only fields used by the page. Set explicit Next cache/revalidation tags for public catalog data; invalidate only from signature-verified webhooks. Use no-store for cart, customer, stock-sensitive checkout, quotes, commissions, pricing, and private assets. Do not make SEO routes into client-fetch shells.
- [ ] **Use Client Components only at interaction boundaries.** Add "use client" only for event handlers, browser APIs, TanStack Query, WebGL, Stripe Elements, or local state. Create apps/storefront/src/components/providers/query-provider.tsx with one browser QueryClient and stable query keys. Use TanStack Query v5 for typeahead, filter updates, upload progress, and optimistic cart controls; reconcile all mutations with server responses. Do not install/import medusa-react, @medusajs/medusa-react, the v1 JS client, or replace Server Component reads with client fetching. ([SDK](https://docs.medusajs.com/resources/js-sdk), [v1-to-v2 changes](https://docs.medusajs.com/learn/introduction/from-v1-to-v2), [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components))
- [ ] **Create the cart data-access layer.** Store the opaque Medusa cart ID in a Secure, HttpOnly, SameSite=Lax cookie scoped to the storefront. Implement server-only src/lib/cart/get-cart.ts, create-cart.ts, mutate-cart.ts, and cookie.ts. Before every mutation, load the cart and verify region, sales channel, owner/customer association, line-item eligibility, and server totals. Never trust client prices, discounts, inventory, quote IDs, commission IDs, or ownership.
- [ ] **Implement the EUR indicative display.** Add a server-only `src/lib/currency/display.ts` that converts RON totals to EUR using `EUR_TO_RON_DISPLAY_RATE` and its date, rounds deterministically, and returns a DTO with a “indicative EUR” label. Never send the converted amount to Medusa, checkout, analytics purchase values, or JSON-LD. Show the RON total as authoritative everywhere.
- [ ] **Implement UI-to-backend mutation boundaries.** Add Server Actions in apps/storefront/src/app/(store)/actions/ for same-origin cart/account forms. Add Route Handlers in apps/storefront/src/app/api/ only for streaming uploads, explicit HTTP APIs, signed revalidation webhooks, and callbacks. Every handler parses a strict Zod schema, authenticates, authorizes ownership, checks origin/CSRF, rate-limits, uses idempotency for create/charge actions, and returns a minimal DTO. Private Medusa calls run in the server data-access layer; never call Admin APIs from browser code. Treat every Server Action as a public POST endpoint. ([Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data), [data security](https://nextjs.org/docs/app/guides/data-security))
- [ ] **Build site navigation.** Implement announcement bar, desktop mega menu, mobile accordion, search overlay, account/bag controls, and footer. Mega-menu links derive from Medusa's ten categories and point to real category/collection routes. Implement keyboard disclosure semantics, Escape, focus return, active route state, and touch-sized targets.
- [ ] **Build the home page from real records.** Implement three hero slides with personalized busts first, curated objects second, custom printing third. Each slide has one primary CTA, keyboard controls, persistent pause control, and disables rotation for reduced motion. Follow Section 4 ordering: hero, trust strip, portrait, studio picks/ready to ship, ten disciplines, custom printing, selected projects, materials/reviews, newsletter/footer. Show only genuine products/projects/reviews; use the designed empty review state until real reviews exist.
- [ ] **Build catalog pages.** /shop uses server-rendered search/filter/sort/pagination with URL query parameters as canonical state. Category/subcategory pages resolve Medusa handles and unique copy; suppress a leaf page unless it has at least three real products and distinct content. Product pages resolve by handle and show variants, price, availability/lead time, gallery, related products, real reviews or empty state, and optional GLB/AR poster.
- [ ] **Build server-only Meilisearch integration.** Create src/lib/search/meilisearch.server.ts; only server code reads MEILISEARCH_API_KEY. Index published products/categories and later CMS projects through a controlled sync job. Search overlay calls a same-origin Route Handler with bounded Zod query/page-size fields and receives a minimal result DTO. Never index private quotes or commissions.
- [ ] **Implement Medusa cart and checkout.** Cart drawer/page reads server cart state. Checkout order: validate cart → collect address → fetch available Romania shipping options → select option → refresh cart/tax/total → create/reuse Payment Collection → initialize Stripe Payment Session through Medusa → render @stripe/react-stripe-js with only Medusa session client data → complete cart through Medusa. Keep the cart and all payment totals in RON; display EUR only as the labelled indicative conversion. Handle 3DS/additional action, pending authorization, and payment failure. Never call Stripe secret APIs from the storefront.
- [ ] **Implement order confirmation and account basics.** Use Medusa customer auth/session APIs through server SDK and secure cookies. Add order list/detail pages with ownership-scoped queries. Return the same neutral not-found response for an unknown ID and another customer's ID. Do not put auth tokens in localStorage.
- [ ] **Add loading/error states.** Add route loading.tsx/error.tsx, skeletons, empty cart/search, unavailable variant, stale quote, payment recovery, 404, and 500. Keep errors free of SQL, provider, storage, and stack details.
- [ ] **Add SEO metadata.** Use Next Metadata API per public page; canonical URLs for products/categories/collections/projects; `hreflang` alternates for `/ro` and `/en`; sitemap.ts from published content; robots.ts noindex for search/cart/checkout/account; JSON-LD only for real Organization/Product/Offer/Review/Breadcrumb records and only in RON. Never output fabricated rating aggregates or inventory counts.
- [ ] **Port 3D with budgets.** Use three only in dynamically imported Client Components; cap DPR, pause when hidden/offscreen, respect prefers-reduced-motion, and show a poster while loading. Put product GLBs in the public asset bucket and render through @google/model-viewer. Never use customer uploads in the public GLB flow. Provide image/description fallbacks.
- [ ] **Add consent-gated analytics.** Keep allowlisted events in src/lib/analytics/consent.ts and events.ts. Never send emails, names, addresses, photos, model files, object keys, signed URLs, quote geometry, payment identifiers, or free-text notes. Deduplicate server-verified purchase events by Order ID.
- [ ] **Verify against the current design baseline.** Compare desktop/mobile home, mega menu, shop, category, product, cart, checkout, and portrait landing. Check keyboard navigation, focus, reduced motion, image loading, and horizontal overflow. Keep Vite runnable in legacy/ until route/content parity is accepted.

**Done when:** a customer can browse → product → cart → Stripe test checkout; the home page is curated and links to real pages; mobile navigation works; core SEO metadata exists; the build passes.

### 9.6 Phase 3 — Portrait Studio flow

**Shared private media worker created in Phase 3 and extended for mesh parsing in Phase 4:**

- [ ] Create apps/private-media-worker/package.json, tsconfig.json, Dockerfile, src/consumer.ts, src/scanner.ts, src/image-normalizer.ts, and src/sandbox/adapter.ts. Use bullmq, ioredis, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, zod, sharp, and ClamAV clamd. The supervisor uses a dedicated Redis queue; the isolated image process receives only a read-only bounded input and writable bounded output, with no R2/Medusa/Redis secrets or network.
- [ ] Configure source-photo limits in apps/private-media-worker/src/image-limits.ts: JPEG/PNG/WebP only, source ≤20 MiB, decoded image ≤40 megapixels, normalized preview longest edge ≤3000 px, and wall time ≤15 seconds. Reject animated/multi-frame files. Re-encode preview with sharp, strip EXIF/GPS/ICC metadata, and keep original only in private R2 storage. These are technical launch limits; increase only after resource/security review.

**Exact shared input contract in packages/contracts/src/commission.ts:**

~~~ts
import { z } from "zod"

export const COMMISSION_STATUSES = [
  "brief_received", "review", "quote_sent", "deposit_pending", "sculpting",
  "proof_sent", "changes_requested", "approved", "printing", "finishing",
  "balance_pending", "shipped", "cancelled",
] as const
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number]

export const CreateCommissionInputSchema = z.object({
  subject_type: z.string().trim().min(1).max(40),
  style_key: z.string().trim().min(1).max(48),
  size_key: z.string().trim().min(1).max(48),
  finish_key: z.string().trim().min(1).max(48),
  plinth_key: z.string().trim().min(1).max(48).optional(),
  gift_note: z.string().trim().max(500).optional(),
  requested_deadline: z.string().datetime().optional(),
  source_photo_consent: z.object({
    accepted: z.literal(true),
    consent_version: z.string().trim().min(1).max(32),
  }).strict(),
}).strict()
export const ApproveProofSchema = z.object({
  expected_aggregate_version: z.number().int().positive(),
  proof_revision: z.number().int().positive(),
}).strict()
export const RequestProofChangesSchema = z.object({
  expected_aggregate_version: z.number().int().positive(),
  proof_revision: z.number().int().positive(),
  message: z.string().trim().min(1).max(1000),
}).strict()
export const CommissionPriceSnapshotSchema = z.object({
  schema_version: z.literal(1),
  pricing_version: z.string().min(1).max(64),
  currency_code: z.string().regex(/^[a-z]{3}$/),
  total_minor: z.number().int().positive(),
  deposit_minor: z.number().int().nonnegative(),
  balance_minor: z.number().int().nonnegative(),
}).strict().superRefine((v, ctx) => {
  if (v.deposit_minor + v.balance_minor !== v.total_minor) {
    ctx.addIssue({ code: "custom", path: ["balance_minor"], message: "deposit plus balance must equal total" })
  }
})
export const CommissionChargeSnapshotSchema = z.object({
  schema_version: z.literal(1),
  commission_id: z.string().min(1).max(128),
  purpose: z.enum(["deposit", "balance"]),
  amount_minor: z.number().int().positive(),
  currency_code: z.string().regex(/^[a-z]{3}$/),
  pricing_version: z.string().min(1).max(64),
  commission_snapshot_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  commission_aggregate_version_at_creation: z.number().int().positive(),
}).strict()
export const SetCommissionPriceSchema = z.object({
  expected_aggregate_version: z.number().int().positive(),
  snapshot: CommissionPriceSnapshotSchema,
}).strict()
export type CreateCommissionInput = z.infer<typeof CreateCommissionInputSchema>
export type ApproveProofInput = z.infer<typeof ApproveProofSchema>
export type RequestProofChangesInput = z.infer<typeof RequestProofChangesSchema>
export type CommissionPriceSnapshot = z.infer<typeof CommissionPriceSnapshotSchema>
export type CommissionChargeSnapshot = z.infer<typeof CommissionChargeSnapshotSchema>
~~~

**DML field and relationship contract for apps/medusa/src/modules/commissions/models/:**

~~~ts
import { model } from "@medusajs/framework/utils"
import { COMMISSION_STATUSES } from "@forma/contracts/commission"

export const Commission = model.define("commission", {
  id: model.id().primaryKey(),
  owner_customer_id: model.text(),
  status: model.enum(COMMISSION_STATUSES),
  subject_type: model.text(),
  style_key: model.text(),
  size_key: model.text(),
  finish_key: model.text(),
  plinth_key: model.text().nullable(),
  gift_note: model.text().nullable(),
  requested_deadline: model.dateTime().nullable(),
  assigned_user_id: model.text().nullable(),
  aggregate_version: model.number().default(1),
  proof_revision: model.number().default(0),
  pricing_version: model.text().nullable(),
  currency_code: model.text().nullable(),
  total_minor: model.number().nullable(),
  deposit_minor: model.number().nullable(),
  balance_minor: model.number().nullable(),
  pricing_snapshot: model.json().nullable(),
  snapshot_sha256: model.text().nullable(),
  retention_deadline: model.dateTime().nullable(),
  assets: model.hasMany(() => CommissionAsset, { mappedBy: "commission" }),
  events: model.hasMany(() => CommissionEvent, { mappedBy: "commission" }),
  charges: model.hasMany(() => CommissionCharge, { mappedBy: "commission" }),
})

export const CommissionAsset = model.define("commission_asset", {
  id: model.id().primaryKey(),
  public_asset_id: model.text().unique(),
  role: model.enum(["source_photo", "proof", "final"]),
  staging_key: model.text().unique().nullable(),
  quarantine_key: model.text().unique().nullable(),
  object_key: model.text().unique().nullable(),
  display_filename: model.text(),
  content_type: model.text(),
  claimed_byte_size: model.number(),
  byte_size: model.number().nullable(),
  client_sha256_claim: model.text().nullable(),
  sha256: model.text().nullable(),
  state: model.enum(["intent", "uploaded", "quarantined", "processing", "available", "rejected", "deleted", "expired"]),
  intent_expires_at: model.dateTime().nullable(),
  finalized_at: model.dateTime().nullable(),
  finalize_attempt_count: model.number().default(0),
  sign_count: model.number().default(0),
  virus_scan_state: model.enum(["pending", "clean", "infected", "error"]),
  virus_scanner_version: model.text().nullable(),
  virus_scan_completed_at: model.dateTime().nullable(),
  consent_version: model.text().nullable(),
  consent_at: model.dateTime().nullable(),
  marketing_consent_version: model.text().nullable(),
  marketing_consent_at: model.dateTime().nullable(),
  public_derivative_key: model.text().nullable(),
  retention_deadline: model.dateTime().nullable(),
  deleted_at: model.dateTime().nullable(),
  commission: model.belongsTo(() => Commission, { mappedBy: "assets" }),
})

export const CommissionEvent = model.define("commission_event", {
  id: model.id().primaryKey(),
  event_type: model.text(),
  from_status: model.text().nullable(),
  to_status: model.text().nullable(),
  actor_type: model.enum(["customer", "user", "system", "worker"]),
  actor_id: model.text().nullable(),
  payment_event_key: model.text().nullable().unique(),
  public_message: model.text().nullable(),
  private_note: model.text().nullable(),
  aggregate_version: model.number(),
  proof_revision: model.number(),
  commission: model.belongsTo(() => Commission, { mappedBy: "events" }),
})

export const CommissionCharge = model.define("commission_charge", {
  id: model.id().primaryKey(),
  purpose: model.enum(["deposit", "balance"]),
  status: model.enum(["requires_payment", "processing", "authorized", "captured", "partially_refunded", "refunded", "canceled", "expired", "mismatch", "mismatch_resolved"]),
  amount_minor: model.number(),
  amount_captured_minor: model.number().nullable(),
  currency_code: model.text(),
  pricing_version: model.text(),
  pricing_snapshot: model.json(),
  snapshot_sha256: model.text(),
  payment_collection_id: model.text().nullable(),
  payment_session_id: model.text().nullable(),
  payment_id: model.text().nullable(),
  provider_payment_id: model.text().nullable(),
  commission_aggregate_version_at_creation: model.number(),
  paid_at: model.dateTime().nullable(),
  disputed_at: model.dateTime().nullable(),
  payment_hold: model.boolean().default(false),
  mismatch_resolved_at: model.dateTime().nullable(),
  commission: model.belongsTo(() => Commission, { mappedBy: "charges" }),
})
~~~

- [ ] **Create contracts in packages/contracts/src/commission.ts.** Export COMMISSION_STATUSES as the exact tuple ["brief_received","review","quote_sent","deposit_pending","sculpting","proof_sent","changes_requested","approved","printing","finishing","balance_pending","shipped","cancelled"] as const, CommissionStatus, CreateCommissionInputSchema, ApproveProofSchema, RequestProofChangesSchema, CommissionPriceSnapshotSchema, CommissionChargeSnapshotSchema, SetCommissionPriceSchema, CommissionAssetRoleSchema, CommissionStatusTransitionSchema, and response DTO schemas. Commission price snapshots are strict/versioned, and the schema rejects unless `deposit_minor + balance_minor === total_minor`. Charge snapshots include purpose, exact amount/currency/pricing version, source Commission snapshot hash, and aggregate version; hash canonical JSON and persist `snapshot_sha256`. Public create input contains subject_type, controlled style_key, size_key, finish_key, optional plinth_key, gift_note (max 500 chars), optional ISO requested_deadline, and source_photo_consent with accepted: true and current consent_version. Proof actions require expected_aggregate_version and the exact proof_revision being approved/requested for changes. Derive customer ID from authenticated Medusa request context; reject customer_id, status, price, deposit, balance, object key, and payment state from the browser. MVP requires a signed-in customer before brief creation/upload. Guest access requires a separately designed expiring high-entropy capability-token contract and security review.
- [ ] **Create module files.** Use apps/medusa/src/modules/commissions/index.ts, service.ts, models/commission.ts, models/commission-asset.ts, models/commission-event.ts, and models/commission-charge.ts. Export COMMISSIONS_MODULE = "commissions" and register Module(COMMISSIONS_MODULE, { service: CommissionsModuleService }). Extend MedusaService({ Commission, CommissionAsset, CommissionEvent, CommissionCharge }). This service persists only these custom models; it never accesses Customer, Cart, Order, Payment, or File tables directly. ([Medusa modules](https://docs.medusajs.com/learn/fundamentals/modules))
- [ ] **Define the Medusa v2 DML models.** Implement the exact model files above with DML fields and same-module relations; apply supplemental partial unique indexes only through the Commissions custom-module migration. Commission persists server-derived `owner_customer_id`, `aggregate_version`, and `proof_revision`; CommissionAsset persists opaque `public_asset_id`, private object key, separate processing/marketing consent, scan state, retention, and deletion tombstone; CommissionEvent is append-only and stores aggregate/proof revisions; CommissionCharge stores payment mapping, charge state, captured amount, currency, strict pricing snapshot/hash, dispute/hold state, and aggregate version at creation. Never store payment credentials or treat custom charge state as payment truth. Define strict Zod contracts for persisted JSON snapshots. Resolve Section 11 D-3 before generating/applying the first Commission migration.
- [ ] **Use same-module relationships and cross-module Module Links.** Commission↔asset/event/charge uses DML hasMany/belongsTo, never Module Links. Add apps/medusa/src/links/commission-customer.ts, commission-cart.ts, commission-order.ts, and commission-charge-payment-collection.ts using defineLink and each module's linkable export. Do not create commission-charge-cart.ts or commission-charge-order.ts. Define Customer→Commission with `isList: true` on the Commission linkable (one customer, many commissions); define Commission→Cart and Commission→Order as one commission to many carts/orders. The one-to-one Charge→Payment Collection Module Link is the charge's only payment-side anchor; use Medusa's native PaymentCollection→Cart (1:1) and PaymentCollection→Order (1:N) links to traverse to commerce records. Commission↔Cart/Order links may represent the aggregate but cannot resolve payment ownership. Links store cross-module IDs, not foreign keys. Validate owner/link on every workflow. Use current Module Link/Link APIs; do not hand-write link rows. Run `pnpm --dir apps/medusa exec medusa db:migrate` after link definitions. ([Module Links](https://docs.medusajs.com/learn/fundamentals/module-links), [Payment Module links](https://docs.medusajs.com/resources/commerce-modules/payment/relations-to-other-modules))
- [ ] **Implement workflows in apps/medusa/src/workflows/commissions/.** Files: create-commission.ts, create-upload-intent.ts, finalize-upload.ts, transition-commission.ts, set-commission-price.ts, send-deposit-checkout.ts, record-payment-captured.ts, reconcile-commission-payment.ts, resolve-charge-mismatch.ts, create-proof-revision.ts, approve-proof.ts, request-proof-changes.ts, create-balance-checkout.ts, cancel-commission.ts, delete-expired-assets.ts. Use createWorkflow/createStep/StepResponse/WorkflowResponse and compensation handlers from @medusajs/framework/workflows-sdk. create-commission.ts sets status=brief_received, aggregate_version=1, and proof_revision=0 server-side. DML counter defaults are safety backstops; create-intent always explicitly sets `claimed_byte_size` from the validated request, and event workflows explicitly set captured revisions. Workflow inputs are strict schemas. API routes never orchestrate multiple modules by directly calling service methods.
- [ ] **Enforce the production state machine.** Allowed transitions: brief_received → review|cancelled; review → quote_sent|cancelled; quote_sent → deposit_pending|review|cancelled; deposit_pending → sculpting|cancelled; sculpting → proof_sent|cancelled; proof_sent → changes_requested|approved|cancelled; changes_requested → sculpting|cancelled; approved → printing|cancelled; printing → finishing|cancelled; finishing → balance_pending|shipped|cancelled; balance_pending → shipped|cancelled. shipped/cancelled are terminal. GUARDS in Section 8.7.3 G3 must contain an entry for every listed edge, including `finishing>shipped` guarded by all charges settled and the four late cancellation edges. Cancellation edges are staff-only finance/admin actions gated by the approved cancellation/refund policy; until that policy is recorded in Section 11, keep the cancellation command disabled. Cancellation never implies an automatic refund. Re-read current state, require actor/role, compare-and-set status + aggregate_version, append CommissionEvent in the same custom-module transaction, and reject browser status changes. `deposit_pending>sculpting` permits the system reconciler or finance/admin confirmation only after the same authoritative captured-payment guard passes; bank transfer, if enabled, must first be recorded as a captured Medusa Payment through its native/manual provider. Proof actions compare expected_aggregate_version and proof_revision. Customer can approve/request changes only on the latest proof revision; staff-only stages require Admin authentication.
- [ ] **Use the private image pipeline from Section 6.4.** Create separate private R2 staging and quarantine buckets using R2_PRIVATE_ENDPOINT, R2_PRIVATE_REGION, R2_UPLOAD_STAGING_BUCKET, R2_UPLOAD_STAGING_ACCESS_KEY_ID, R2_UPLOAD_STAGING_SECRET_ACCESS_KEY, R2_UPLOAD_QUARANTINE_BUCKET, R2_UPLOAD_QUARANTINE_ACCESS_KEY_ID, R2_UPLOAD_QUARANTINE_SECRET_ACCESS_KEY, R2_WORKER_ACCESS_KEY_ID, R2_WORKER_SECRET_ACCESS_KEY, R2_DOWNLOAD_SIGNER_ACCESS_KEY_ID, R2_DOWNLOAD_SIGNER_SECRET_ACCESS_KEY, and UPLOAD_INTENT_SECRET in the assigned Medusa/worker secret stores. Medusa signs a single short-lived PUT to staging and uses the separate private-download signer only after ownership/staff authorization; the finalize service has the quarantine-writer key; the worker supervisor receives a distinct read-only quarantine key; the sandbox receives no credentials. Commission upload-intent workflows accept JPEG/PNG/WebP source photos/proofs, enforce Phase 3 byte/pixel caps, run ClamAV scan, decode/re-encode previews with sharp in the isolated image process, strip EXIF/GPS, and store source/preview under different private opaque R2 keys. Never place photos in the public product bucket, Next public directory, CMS, email, or analytics. Store only key/hash/byte count/consent/lifecycle fields in CommissionAsset.
- [ ] **Create Store API routes in apps/medusa/src/api/store/custom/commissions/.** route.ts POST creates brief; [id]/route.ts GET returns only owner's safe DTO; [id]/assets/upload-intents/route.ts POST creates intent; [id]/assets/[asset_id]/finalize/route.ts POST finalizes upload; [id]/proof/approval/route.ts POST approves a specified revision; [id]/proof/changes/route.ts POST requests changes with bounded text; [id]/checkout/deposit/route.ts POST creates deposit checkout; [id]/checkout/balance/route.ts POST creates balance checkout. Put request/response Zod schemas in validators.ts.
- [ ] **Protect routes in apps/medusa/src/api/middlewares.ts.** Use authenticate("customer", ["session","bearer"]) for customer routes and authenticate("user", ["session","bearer","api-key"]) for Admin routes, matching the pinned Medusa version. Explicitly protect every /store/custom/commissions/** route, then compare req.auth_context.actor_id with the Customer Module Link in the workflow. Require publishable-key scoping, origin/CSRF checks, request-size limits, per-customer/IP rate limits, and idempotency keys for create/upload/checkout. Never authorize by email alone. ([Protected routes](https://docs.medusajs.com/learn/fundamentals/api-routes/protected-routes))
- [ ] **Build customer pages and components.** Add apps/storefront/src/app/(store)/portrait-studio/page.tsx, apps/storefront/src/app/(store)/portrait-studio/gallery/page.tsx, apps/storefront/src/app/(store)/portrait-studio/start/page.tsx, apps/storefront/src/app/(store)/account/commissions/page.tsx, and apps/storefront/src/app/(store)/account/commissions/[id]/page.tsx. Add apps/storefront/src/components/portrait/commission-form.tsx, photo-uploader.tsx, commission-timeline.tsx, proof-viewer.tsx, proof-actions.tsx, and commission-summary.tsx. Use Server Components for landing/gallery/account reads and narrow Client Components for upload/progress/proof actions. Explain that an artist sculpts the likeness from reference photos; do not imply AI generation.
- [ ] **Set and preserve the Commission price snapshot.** `set-commission-price.ts` accepts only finance/admin-authenticated integer minor-unit fields and `expected_aggregate_version`; parse `SetCommissionPriceSchema` with a nested strict `CommissionPriceSnapshotSchema`, reject stale CAS, and require deposit + balance = total. Canonicalize and hash the snapshot, save immutable `pricing_snapshot` + `snapshot_sha256`, and append a versioned event in the same transaction. Before charge creation, build/validate `CommissionChargeSnapshotSchema`; each charge stores its strict JSON snapshot and own `snapshot_sha256`. Commission and charge rows have no unrestricted metadata field; use declared columns and typed snapshots only.
- [ ] **Implement deposit and balance using normal Medusa commerce.** A server workflow calculates each charge, creates a cart, adds a dedicated non-merchandised commission-charge variant at the server-computed amount using Medusa's custom line-item pricing workflow, creates the normal Payment Collection/Stripe Payment Session, and links CommissionCharge to that Payment Collection. The Payment Collection's native Cart/Order relations are authoritative; do not add Charge↔Cart/Order links. Create a separate balance charge/cart/order after finishing only when `balance_minor > 0`; when it is zero, skip balance checkout and require the captured deposit to equal total. Use Stripe `capture: true`; do not reuse an old authorization, call Stripe Payment Intents directly, capture again when Medusa already reports captured, or mark Commission paid from a browser redirect. `payment.captured` and `payment.refunded` only wake reconciliation. ([Custom item pricing](https://docs.medusajs.com/resources/examples/guides/custom-item-price), [payment events](https://docs.medusajs.com/resources/references/payment/events), [payment flow](https://docs.medusajs.com/resources/commerce-modules/payment/payment-flow))
- [ ] **Build the Admin commission board as an Admin extension.** Add apps/medusa/src/admin/routes/commissions/page.tsx and routes/commissions/[id]/page.tsx; optional widgets go in apps/medusa/src/admin/widgets/. Use @medusajs/admin-sdk and @medusajs/ui. Call protected /admin/custom/commissions APIs with Admin SDK. Provide filters by status/artist/due date; show safe photo/proof previews, revision history, assignment, due date, transition controls, price snapshot, and charge-order links. Create short-lived private GET URLs only after staff authorization; never log them.
- [ ] **Add Admin APIs under apps/medusa/src/api/admin/custom/commissions/.** Implement list/detail, assign, staff transition, send proof, set price, and create balance checkout. Require Admin auth/role, validate transition/reason, record actor ID, and execute workflows. Admin is the separately hosted Vite SPA built with `medusa build --admin-only`; APIs remain on Medusa.
- [ ] **Send idempotent emails.** Add apps/medusa/src/subscribers/commission-notification.ts and templates under src/modules/resend-notification/templates/. Send only after successful workflow/event: brief received, quote ready, deposit captured, proof ready, changes requested, approval recorded, printing, shipped, balance checkout. Deduplicate by (commission_id,event_type,revision). Do not attach photos or long-lived signed URLs; link to the authenticated account.
- [ ] **Make consent/deletion operational.** Version text in apps/medusa/src/config/commission-consent.ts and store accepted version/time per source upload. Keep likeness-processing consent separate from optional marketing consent. Implement delete-expired-assets.ts as an idempotent scheduled Medusa job that deletes R2 objects, marks records deleted, preserves legally required order/accounting records, and writes access/deletion audit events. Set retention duration only after policy approval.
- [ ] **Do not fabricate capacity.** Keep now-booking copy disabled unless optional capacity/booking is implemented. If enabled, add a separate capacity model/workflow with expiring reservations and one authoritative availability read; never derive slots from inventory or a hard-coded string.
- [ ] **Instrument the portrait funnel without PII.** Emit portrait_start, portrait_photo_upload, portrait_deposit, portrait_proof_view, portrait_proof_approved, and portrait_balance_paid through consent-gated analytics. Send only allowlisted event name, anonymous session ID, non-sensitive option keys, and deduplicated order IDs after consent; never send photos, notes, keys, or signed URLs.
- [ ] **Verify lifecycle and failure recovery.** Verify idempotency, duplicate Stripe webhook delivery, upload expiry/retry, proof revision race, ownership, Admin authorization, email failure, canceled checkout, partial payment, refund, and retention deletion. Exercise brief → deposit → sculpting → proof → approval → printing/finishing → balance → shipment. Medusa Order/Payment records, not Commission flags, are payment truth.

**Security POV implementation additions (required; see Section 8.7):**

- [ ] **Implement the security review's stale-action invariant.** In Commission DML use aggregate_version for every state CAS and proof_revision to identify the exact approved proof. Each new proof increments proof_revision; each successful state mutation increments aggregate_version. Store both on CommissionEvent. ApproveProofSchema must require expected_aggregate_version and proof_revision; reject if either is stale so a changed state or replacement proof invalidates the approval.
- [ ] **Harden owner and asset records.** Add server-derived owner_customer_id to Commission and compare it with the Commission↔Customer Module Link on every customer read/mutation. Extend CommissionAsset with separate opaque public_asset_id; staging_key, quarantine_key, and accepted private object_key; claimed_byte_size/client_sha256_claim separate from actual byte_size/trusted sha256; sign_count/finalize_attempt_count; intent_expires_at/finalized_at; source_photo consent_version/consent_at; marketing_consent_version/marketing_consent_at; optional public_derivative_key; deleted_at/tombstone state; and explicit source/proof/final lifecycle. Never derive object keys from filenames.
- [ ] **Apply the shared upload-intent controls to photos and proofs.** Use the central R2 presigner from Section 8.7.3 with one-time intent signing, server-generated keys, exact server-owned JPEG/PNG/WebP Content-Type, 15-minute expiry, HMAC token bound to intent/key/expiry, and `If-None-Match: *`. Keep claimed byte size/hash separate from server-verified values. Never use signed Content-Length as the size cap; enforce byte/pixel limits while streaming/decoding and keep originals quarantined until scan and re-encode succeed. No raw token, URL, or key in logs.
- [ ] **Make state transitions atomic.** Implement one transition method inside apps/medusa/src/modules/commissions/service.ts using Medusa DML repositories and InjectManager/InjectTransactionManager. Its transaction compares status + aggregate_version, applies actor/role/precondition guards, updates aggregate_version, and appends CommissionEvent. Zero-row CAS returns a typed 409 STALE_STATE. No route, subscriber, or job writes status directly.
- [ ] **Add charge-payment mapping and uniqueness.** CommissionCharge stores status requires_payment|processing|authorized|captured|partially_refunded|refunded|canceled|expired|mismatch|mismatch_resolved; payment_collection_id, payment_session_id, payment_id, provider_payment_id, amount_captured_minor, paid_at, commission_aggregate_version_at_creation, disputed_at, payment_hold default(false), mismatch_resolved_at, strict pricing_snapshot, and snapshot_sha256. Link Charge to Payment Collection as its sole payment-side anchor; never link Charge directly to Cart or Order. Add one-active-charge partial unique index on (commission_id, purpose), excluding only canceled, expired, and audited mismatch_resolved; mismatch remains blocking until provider exposure is reconciled. Create checkout with idempotency key. Add nullable unique CommissionEvent.payment_event_key for Medusa payment/capture/refund identities.
- [ ] **Gate production on authoritative payment state.** The payment.captured, payment.refunded, and dispute subscribers are wake-ups only and call the same reconciliation workflow as the scheduled job. Resolve Payment by payment_collection_id, then the unique Charge↔Payment Collection Module Link; re-read Payment.captured_at, captured_amount, refunded_amount, currency, dispute state, and Charge.payment_hold from Medusa. Require exact captured amount and currency, zero refund, no dispute/hold before deposit_pending → sculpting or balance_pending → shipped. Never trust the event payload or browser redirect as payment truth; deduplicate by charge plus Medusa payment/capture/refund identity.
- [ ] **Add the 60-second payment reconciler.** Create `apps/medusa/src/jobs/reconcile-commission-payments.ts` and call the `reconcile-commission-payment.ts` workflow for each active CommissionCharge in `requires_payment|processing|authorized`, plus `captured` charges whose Commission transition is still pending, with a Payment Collection link. Run every 60 seconds. Resolve PaymentCollection→CommissionCharge through the Module Link; read Payment/Capture/Refund through Medusa Query/Payment APIs; derive capture/refund identity and compare the unique successful `payment_event_key`. If a captured Payment has no marker, run the atomic charge claim. If marker exists but the Commission transition is stale, retry only that guarded transition. If payment is only authorized, leave it unpaid and alert after the configured authorization-age threshold without calling Stripe or advancing production. Missing/ambiguous links or amount/currency mismatch fail closed and alert. Subscriber and job share one idempotent workflow, so missed events/overlapping ticks cannot duplicate effects.
- [ ] **Define and enforce staff roles.** Add apps/medusa/src/modules/staff-access/ or an explicit versioned policy module with ops|artist|finance|admin role assignment. Every Admin custom route authenticates the user and then calls requireRole. finance controls price overrides/refunds; artist controls proof upload/send; ops controls assignment/shipping; admin manages all. Record role, actor, reason, and aggregate_version in events. Do not treat authenticate(user) as role authorization.
- [ ] **Protect customer and private-media routes.** Require signed-in customer auth for all commission Store API routes; derive actor from auth_context. On every owner check, require exactly one matching Customer Module Link and matching owner_customer_id. Add an exact Origin allowlist and JSON content type for browser mutations at the Next.js BFF/Medusa boundary; missing or foreign browser Origin fails closed. Create apps/storefront/src/app/api/private/[module]/[asset_id]/route.ts as the private asset resolver; never accept a bucket, object key, parent ID, or filename from the caller. Check owner, role, Commission state, asset state, and deletion status on every request; use uniform 404 for unknown/foreign/wrong-state IDs.
- [ ] **Secure asset delivery and proof intake.** Select proxy versus signed redirect in Section 11. Use short-lived reads only after authorization; proxy proofs/models if the signed URL must not reach the browser; set no-store, no-referrer, nosniff, safe Content-Disposition, and fixed MIME types. Scan staff proofs as well as customer uploads; accept raster JPEG/PNG/WebP only unless another format is explicitly sanitized. Enforce separate processing and marketing consent; publish only a derivative after marketing consent and delete it on revocation.
- [ ] **Add operational controls.** Apply the Section 8.7.3 I rate limits by both customer and IP, per-customer storage/object quotas, and Turnstile for new/high-risk accounts. Redact presigned URLs, query signatures, auth/cookie headers, client secrets, raw filenames, EXIF, notes, and Stripe payloads from pino/Sentry; log only IDs, a short key hash, checksum prefix, state, duration, and error code.
- [ ] **Make deletion and restore safe.** Keep retention durations as a blocked policy decision until approved. Implement an idempotent tombstone-first deletion job that removes every R2 object version and derivative, records deletion/access audit events, and preserves required accounting records. Before restoring Postgres or reopening service, run verify-object-existence.ts and reconcile tombstones with R2 state.
- [ ] **Pass security gates before Phase 3 sign-off.** Run the two-account IDOR matrix and byte-identical failure-body assertions; role matrix; route-authentication sweep; duplicate capture ×5; amount/currency mismatch; out-of-order/partial refund; concurrent balance-checkout test; proof revision race; cancellation/refund tests; signed URL log-sink scan; and R2 orphan/tombstone restore drill. Staging must demonstrate each gate in Section 8.7.5.

**Done when:** a test customer can book, pay a deposit, see status, approve a proof, and receive stage emails; staff can manage the commission without a spreadsheet.

### 9.7 Phase 4 — Custom quote flow

**State machine:** draft → upload_pending|cancelled; upload_pending → quarantined|rejected|cancelled; quarantined → processing|rejected; processing → estimated|review_required|rejected; review_required → processing|sent|rejected|cancelled; estimated → sent|review_required|expired|cancelled; sent → accepted|review_required|expired|cancelled; accepted → converted|cancelled. converted, expired, cancelled, and rejected are terminal. Increment spec_revision whenever the uploaded model or process/material/finish/quantity/price inputs change. Every state mutation compare-and-sets status + aggregate_version and appends QuoteEvent in the same custom-module transaction. Acceptance binds to spec_revision, aggregate_version, and snapshot_sha256.

**Exact shared contracts in packages/contracts/src/quote.ts and mesh-analysis.ts:**

~~~ts
import { z } from "zod"

export const QUOTE_STATUSES = [
  "draft", "upload_pending", "quarantined", "processing", "review_required",
  "estimated", "sent", "accepted", "converted", "expired", "cancelled", "rejected",
] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const CreateQuoteInputSchema = z.object({
  process_key: z.string().trim().min(1).max(48),
  material_key: z.string().trim().min(1).max(48),
  finish_key: z.string().trim().min(1).max(48),
  quantity: z.number().int().min(1).max(100),
  infill_percent: z.number().min(0).max(100).optional(),
  layer_height_mm: z.number().positive().max(10).optional(),
  customer_notes: z.string().trim().max(2000).optional(),
}).strict()

export const CreateUploadIntentSchema = z.object({
  extension: z.enum(["stl", "obj", "3mf"]),
  byte_size: z.number().int().positive().max(104857600),
  declared_content_type: z.string().trim().max(128).optional(), // untrusted claim; server maps extension to canonical MIME
  client_sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
}).strict()

export const UploadHeadersSchema = z.object({
  "content-type": z.string().min(1).max(128),
  "if-none-match": z.literal("*"),
  "x-amz-meta-intent": z.string().min(1).max(128),
  "x-amz-checksum-sha256": z.string().optional(),
}).strict()

export const UploadIntentSchema = z.object({
  asset_id: z.string().min(1).max(128),
  upload_url: z.string().url().refine((value) => new URL(value).protocol === "https:"),
  upload_token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  required_headers: UploadHeadersSchema,
  max_bytes: z.number().int().positive().max(104857600),
  expires_at: z.string().datetime(),
}).strict()

export const AcceptQuoteSchema = z.object({
  expected_aggregate_version: z.number().int().positive(),
  accepted_spec_revision: z.number().int().positive(),
  snapshot_sha256: z.string().regex(/^[a-f0-9]{64}$/),
}).strict()

export const QuotePriceSnapshotSchema = z.object({
  schema_version: z.literal(1),
  pricing_version: z.string().min(1).max(64),
  currency_code: z.string().regex(/^[a-z]{3}$/),
  quantity: z.number().int().min(1).max(100),
  volume_cm3: z.number().finite().nonnegative(),
  machine_seconds: z.number().finite().nonnegative(),
  material_rate_minor_per_cm3: z.number().finite().nonnegative(),
  machine_rate_minor_per_second: z.number().finite().nonnegative(),
  unit_minor: z.number().int().positive(),
  total_minor: z.number().int().positive(),
  setup_minor: z.number().int().nonnegative(),
  material_minor: z.number().int().nonnegative(),
  machine_minor: z.number().int().nonnegative(),
  postprocess_minor: z.number().int().nonnegative(),
  minimum_minor: z.number().int().nonnegative(),
  margin_bps: z.number().int().nonnegative().max(100_000),
  rounding: z.literal("ceil_each_component_then_total"),
}).strict()

export { MeshAnalysisResultSchema } from "./mesh-analysis"
export type { MeshAnalysisResult } from "./mesh-analysis"

export type CreateQuoteInput = z.infer<typeof CreateQuoteInputSchema>
export type CreateUploadIntentInput = z.infer<typeof CreateUploadIntentSchema>
export type UploadIntent = z.infer<typeof UploadIntentSchema>
export type AcceptQuote = z.infer<typeof AcceptQuoteSchema>
export type QuotePriceSnapshot = z.infer<typeof QuotePriceSnapshotSchema>
~~~

**Exact Medusa v2 DML shape in apps/medusa/src/modules/quotes/models/:**

~~~ts
import { model } from "@medusajs/framework/utils"
import { QUOTE_STATUSES } from "@forma/contracts/quote"

export const Quote = model.define("quote", {
  id: model.id().primaryKey(),
  owner_customer_id: model.text(),
  status: model.enum(QUOTE_STATUSES),
  process_key: model.text(),
  material_key: model.text(),
  finish_key: model.text(),
  quantity: model.number(),
  infill_percent: model.number().nullable(),
  layer_height_mm: model.number().nullable(),
  customer_notes: model.text().nullable(),
  aggregate_version: model.number().default(1),
  spec_revision: model.number().default(1),
  currency_code: model.text().nullable(),
  total_minor: model.number().nullable(),
  pricing_version: model.text().nullable(),
  snapshot_sha256: model.text().nullable(),
  expires_at: model.dateTime().nullable(),
  accepted_at: model.dateTime().nullable(),
  converted_at: model.dateTime().nullable(),
  pricing_snapshot: model.json().nullable(),
  assets: model.hasMany(() => QuoteAsset, { mappedBy: "quote" }),
  analyses: model.hasMany(() => QuoteAnalysis, { mappedBy: "quote" }),
  events: model.hasMany(() => QuoteEvent, { mappedBy: "quote" }),
})

export const QuoteAsset = model.define("quote_asset", {
  id: model.id().primaryKey(),
  public_asset_id: model.text().unique(),
  role: model.enum(["model"]),
  spec_revision: model.number(),
  original_filename: model.text(),
  extension: model.enum(["stl", "obj", "3mf"]),
  declared_content_type: model.text(),
  claimed_byte_size: model.number(),
  byte_size: model.number().nullable(),
  client_sha256_claim: model.text().nullable(),
  sha256: model.text().nullable(),
  staging_key: model.text().unique(),
  quarantine_key: model.text().unique().nullable(),
  state: model.enum(["intent", "uploaded", "quarantined", "processing", "retryable_error", "accepted", "rejected", "deleted", "expired", "abandoned"]),
  finalized_at: model.dateTime().nullable(),
  finalize_attempt_count: model.number().default(0),
  parse_attempt_count: model.number().default(0),
  sign_count: model.number().default(0),
  analysis_job_id: model.text().nullable(),
  intent_expires_at: model.dateTime(),
  retention_deadline: model.dateTime().nullable(),
  deleted_at: model.dateTime().nullable(),
  virus_scan_state: model.enum(["pending", "clean", "infected", "error"]),
  virus_scanner_version: model.text().nullable(),
  virus_scan_completed_at: model.dateTime().nullable(),
  analyses: model.hasMany(() => QuoteAnalysis, { mappedBy: "asset" }),
  quote: model.belongsTo(() => Quote, { mappedBy: "assets" }),
})

export const QuoteAnalysis = model.define("quote_analysis", {
  id: model.id().primaryKey(),
  job_id: model.text().unique(),
  input_sha256: model.text(),
  spec_revision: model.number(),
  schema_version: model.number(),
  parser_version: model.text(),
  unit: model.enum(["mm", "inch", "unknown"]).nullable(),
  bounds_x_mm: model.number().nullable(),
  bounds_y_mm: model.number().nullable(),
  bounds_z_mm: model.number().nullable(),
  volume_mm3: model.number().nullable(),
  vertex_count: model.number().nullable(),
  triangle_count: model.number().nullable(),
  component_count: model.number().nullable(),
  watertight: model.boolean().nullable(),
  manifold: model.boolean().nullable(),
  rejection_reason: model.text().nullable(),
  analysis_state: model.enum(["valid", "review_required", "rejected"]),
  completed_at: model.dateTime(),
  quote: model.belongsTo(() => Quote, { mappedBy: "analyses" }),
  asset: model.belongsTo(() => QuoteAsset, { mappedBy: "analyses" }),
})

export const QuoteEvent = model.define("quote_event", {
  id: model.id().primaryKey(),
  event_type: model.text(),
  actor_type: model.enum(["customer", "user", "system", "worker"]),
  actor_id: model.text().nullable(),
  from_status: model.text().nullable(),
  to_status: model.text().nullable(),
  aggregate_version: model.number(),
  spec_revision: model.number(),
  reason: model.text().nullable(),
  occurred_at: model.dateTime(),
  quote: model.belongsTo(() => Quote, { mappedBy: "events" }),
})
~~~

- [ ] **Create shared contracts.** Add packages/contracts/src/quote.ts and mesh-analysis.ts. Define `MeshAnalysisResultSchema` exactly once in `mesh-analysis.ts` using Section 8.7.4 V1; `quote.ts` imports/re-exports that definition and never recreates it. Export QUOTE_STATUSES = ["draft","upload_pending","quarantined","processing","review_required","estimated","sent","accepted","converted","expired","cancelled","rejected"] as const; QuoteStatus; strict CreateQuoteInputSchema, CreateUploadIntentSchema, UploadIntentSchema, QuotePriceSnapshotSchema, AcceptQuoteSchema, and customer/Admin DTO schemas. CreateQuoteInputSchema accepts controlled process_key/material_key/finish_key, quantity integer 1–100, optional infill_percent and layer_height_mm, and customer_notes max 2,000 chars. Do not accept file name, IDs, status, geometry, price, currency, expiry, or object key as trusted values. The upload-intent request accepts extension and provisional byte_size, optional declared_content_type/client SHA-256 claims; derive canonical Content-Type from extension on the server, reject any declared-type mismatch, and verify actual object bytes/hash before acceptance. Validate option keys against server-side versioned capabilities.
- [ ] **Create apps/medusa/src/modules/quotes/.** Files: index.ts, service.ts, models/quote.ts, quote-asset.ts, quote-analysis.ts, and quote-event.ts. Export QUOTES_MODULE = "quotes"; register Module(QUOTES_MODULE, { service: QuotesModuleService }); extend MedusaService({ Quote, QuoteAsset, QuoteAnalysis, QuoteEvent }). The module service owns custom persistence only and never reads/writes Customer, Cart, Order, Payment, or File tables.
- [ ] **Define DML models using @medusajs/framework/utils.** Use model.define, model.id().primaryKey(), model.text(), model.number(), model.boolean(), model.enum(...), model.dateTime(), model.json(), `.default(...)`, and same-module belongsTo/hasMany. Timestamps are automatic. Quote fields: id, server-derived owner_customer_id, status enum above, process_key, material_key, finish_key, quantity, nullable infill_percent/layer_height_mm/customer_notes, `aggregate_version` default 1, `spec_revision` default 1, currency_code, nullable total_minor/pricing_version/expires_at/accepted_at/converted_at/pricing_snapshot/snapshot_sha256, and assets/analyses/events hasMany. QuoteAsset: id, belongsTo quote, role enum ["model"], unique public_asset_id, spec_revision, finalized_at, sanitized original_filename, extension enum ["stl","obj","3mf"], server-assigned declared_content_type, claimed_byte_size explicitly set from validated create-intent claim, nullable verified byte_size, client_sha256_claim, trusted sha256, unique opaque staging_key/quarantine_key, state enum ["intent","uploaded","quarantined","processing","retryable_error","accepted","rejected","deleted","expired","abandoned"], intent_expires_at, nullable deleted_at, retention_deadline, sign_count/finalize_attempt_count/parse_attempt_count each default 0, analysis_job_id. QuoteAnalysis: id, belongsTo quote and asset, unique job_id, input_sha256, spec_revision, schema_version, parser_version, nullable unit and geometry/count metrics for rejected results, rejection_reason, analysis_state enum ["valid","review_required","rejected"], completed_at. QuoteEvent: id, belongsTo quote, event_type, actor_type enum ["customer","user","system","worker"], actor_id, from_status/to_status, aggregate_version, spec_revision, nullable bounded reason, occurred_at. Validate every JSON with a strict shared Zod schema. Never put asset lists, analysis rows, or status history in metadata. ([DML](https://docs.medusajs.com/learn/fundamentals/data-models), [properties](https://docs.medusajs.com/learn/fundamentals/data-models/properties))
- [ ] **Persist virus-scan facts on QuoteAsset.** Add virus_scan_state enum pending|clean|infected|error, nullable virus_scanner_version, and nullable virus_scan_completed_at. Set state to clean only on a completed clean scan; infected/error/unavailable input cannot enter parser queue. Do not duplicate scanner findings in customer-facing metadata.
- [ ] **Implement Quote and QuoteAsset model source in the paths above using this DML shape.** Quote includes server-derived owner_customer_id, aggregate_version, spec_revision, pricing_snapshot, and snapshot_sha256. QuoteAsset includes separate public_asset_id, spec_revision, finalized_at, sign_count, finalize_attempt_count, parse_attempt_count, analysis_job_id, trusted SHA-256, and quarantine lifecycle. QuoteAnalysis includes job_id, input_sha256, spec_revision, parser/schema versions, nullable geometry metrics for rejected results, rejection_reason, and Quote/Asset relations. QuoteEvent includes aggregate_version/spec_revision and is append-only. Keep model definitions in separate files and import them into service.ts. Generate and apply the custom-module migration; add supplemental unique indexes inside that module migration for `(quote_id, spec_revision)` live assets and `(asset_id, parser_version, input_sha256)` analysis idempotency. Do not create Commerce Module tables or write to them directly. ([Relationships](https://docs.medusajs.com/learn/fundamentals/data-models/relationships))
- [ ] **Create Module Links in apps/medusa/src/links/.** Add quote-customer.ts, quote-cart.ts, and quote-order.ts between the custom Quote and native Customer/Cart/Order linkables. Phase 4 v1 cardinality: one Quote to one owner, one current checkout Cart, and one converted Order; one Customer to many Quotes. Define Customer→Quote with `isList: true` on the Quote linkable. Quote deposit/balance is not part of v1 unless the Section 3 commercial decision explicitly approves it; an approved deposit feature requires a QuoteCharge DML model and revised Cart/Order/Payment Collection links before implementation. Link IDs are stored in Module Link tables; validate ownership in workflows. Guest quotes, if approved, require a separate expiring capability token; email equality is never authorization. Run `pnpm --dir apps/medusa exec medusa db:migrate` after changes. ([Module Links](https://docs.medusajs.com/learn/fundamentals/module-links))
- [ ] **Create workflows in apps/medusa/src/workflows/quotes/.** Files: create-quote.ts, create-upload-intent.ts, finalize-upload.ts, enqueue-analysis.ts, record-analysis-failure.ts, accept-analysis-result.ts, calculate-estimate.ts, send-for-review.ts, staff-revise-quote.ts, accept-quote.ts, convert-quote-to-cart.ts, expire-quote.ts, delete-expired-assets.ts. Use createWorkflow/createStep/StepResponse/WorkflowResponse, compensation, @medusajs/medusa/core-flows, and strict schema input. create-quote.ts sets status=draft, aggregate_version=1, and spec_revision=1 server-side. Add idempotency keys and expected-state/revision checks. API routes do not orchestrate modules by calling service methods directly.
- [ ] **Create Store API routes under apps/medusa/src/api/store/custom/quotes/.** route.ts POST creates a quote; [id]/route.ts GET returns owner-safe DTO; [id]/assets/upload-intents/route.ts POST reserves one upload; [id]/assets/[asset_id]/finalize/route.ts POST finalizes upload; [id]/analysis/route.ts GET returns validated analysis/estimate only; [id]/accept/route.ts POST accepts exact revision; [id]/checkout/route.ts POST creates/updates Medusa cart. Add `apps/medusa/src/api/internal/custom/quotes/analysis-failures/route.ts` accepting only signed supervisor reports with `{job_id, asset_id, spec_revision, failure_code}` where failure_code is a fixed enum `timeout|sandbox_exit|resource_limit|transient_parser_error`; reject details, paths, stack traces, and arbitrary codes. Route verifies HMAC/timestamp/nonce before calling `record-analysis-failure.ts`. Keep validators in validators.ts. Protect routes in apps/medusa/src/api/middlewares.ts with customer/worker authentication as appropriate, owner checks, origin/CSRF, request limits, per-customer/IP quotas, and idempotency.
- [ ] **Create upload intent and private R2 transfer.** Configure separate public-assets, private-staging, and private-quarantine R2 buckets. Add R2_PRIVATE_ENDPOINT, R2_PRIVATE_REGION=auto, R2_UPLOAD_STAGING_BUCKET, R2_UPLOAD_STAGING_ACCESS_KEY_ID, R2_UPLOAD_STAGING_SECRET_ACCESS_KEY, R2_UPLOAD_QUARANTINE_BUCKET, R2_UPLOAD_QUARANTINE_ACCESS_KEY_ID, R2_UPLOAD_QUARANTINE_SECRET_ACCESS_KEY, R2_WORKER_ACCESS_KEY_ID, R2_WORKER_SECRET_ACCESS_KEY, R2_DOWNLOAD_SIGNER_ACCESS_KEY_ID, R2_DOWNLOAD_SIGNER_SECRET_ACCESS_KEY, and UPLOAD_INTENT_SECRET in assigned secret stores. Medusa receives the staging signer/reader, quarantine-writer, and separate download-signer credentials; only the worker supervisor receives a distinct read-only quarantine key; the parser sandbox receives no storage credential. On create, derive customer from authenticated Medusa context and create Quote↔Customer link. Validate claimed byte_size is an integer in 1..100 MiB before signing, but treat it only as a claim and verify actual bytes at finalize. Upload-intent route verifies owner/status, allowlists .stl/.obj/.3mf, maps extension to server-owned canonical Content-Type, and issues one exact-key 15-minute PUT instruction plus short-lived HMAC token. On an unfinalized retry for the same spec_revision, atomically mark the prior live intent abandoned and append QuoteEvent before inserting its replacement, in the same custom-module transaction; do not abandon finalized/processing assets. Replacing finalized model content increments spec_revision and records an event. Sign only exact Content-Type, optional checksum, and If-None-Match: *. Do not sign Content-Length as a size cap. Exact storefront-origin PUT-only CORS; browser never chooses bucket/key or receives GET/DELETE rights. Initial input cap is 100 MiB. A strict pre-storage cap requires the streaming upload gateway; otherwise enforce at finalize, delete oversized staging objects, and alert on quota/cost thresholds.
- [ ] **Finalize using server-side evidence.** Atomically claim the live intent with row lock/revision check; recompute and constant-time validate the HMAC token; HEAD the exact private key; reject missing, expired, reused, claimed-size-mismatched, or >100 MiB files. Copy to a unique quarantine key through a byte-counting stream while calculating SHA-256; abort immediately above the cap, verify any checksum claim, and record trusted hash. Treat copy/delete as separate idempotent operations, not an atomic rename. Delete staging only after verified quarantine copy. Extension/MIME/browser preview/client hash/ETag are hints only. Enqueue only asset_id, quote_id, job_id, spec_revision, and trusted hash; never put file bytes, upload_token, or presigned URL in Redis payloads/logs.
- [ ] **Virus-scan quarantined input as a secondary control.** Add apps/private-media-worker/src/scanner.ts and run ClamAV clamd against the bounded quarantine stream before parsing. The scanner receives no R2 credentials, customer-facing network access, or mutable host paths. Require a healthy scanner and current signature database; fail closed on infected result, timeout, or scanner outage. Store scanner version/state/completion on QuoteAsset and append a QuoteEvent scan audit record. Malware scanning never replaces archive preflight, parser limits, or the gVisor/microVM boundary.
- [ ] **Enqueue mesh analysis with a bounded attempt counter.** Implement `apps/medusa/src/workflows/quotes/enqueue-analysis.ts`. For a first attempt, lock QuoteAsset and require current spec_revision, state=quarantined, and trusted sha256; for retries require state=retryable_error and the same current revision/hash. The Quotes module transaction allocates/persists a new job_id and increments parse_attempt_count exactly once before publishing to BullMQ. If the counter is already 3, transition asset and Quote to terminal rejected with retry_exhausted, append QuoteEvent, and do not enqueue. Publish only quote_id, asset_id, job_id, spec_revision, and sha256; use job_id as BullMQ jobId. If queue acknowledgement is uncertain, retry publishing the same jobId without another increment. The worker never increments parse_attempt_count. A completed transient failure is recorded by `record-analysis-failure.ts`; if fewer than three attempts have run, set asset=retryable_error and schedule a new enqueue workflow; after the third failed/timed-out job, set asset and Quote rejected with retry_exhausted.
- [ ] **Create the parser worker in apps/private-media-worker/.** Files: package.json, tsconfig.json, Dockerfile, src/consumer.ts, src/job-schema.ts, src/r2-reader.ts, src/result-client.ts, src/sandbox/adapter.ts, parser/pyproject.toml, and parser/src/forma_mesh_parser/{__init__.py,main.py,preflight.py,parse_mesh.py,result_schema.py,limits.py}. Trusted Node supervisor uses bullmq, ioredis, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, and zod. Give it a dedicated Redis endpoint supporting BullMQ blocking commands and separate prefix/credentials from Medusa workflow-engine Redis. Parser uses Python 3.12 with pinned trimesh, numpy, lxml, networkx, and defusedxml; use stdlib zipfile for 3MF preflight. Do not install trimesh[easy], arbitrary format plugins, shell utilities, or floating dependencies.
- [ ] **Fail closed unless a real parser sandbox is configured.** src/sandbox/adapter.ts accepts only a deployment adapter that starts a fresh gVisor (runsc) sandbox or microVM for each parse; worker startup fails if neither isolation mode is proven. Sandbox: UID 10001 non-root; read-only root filesystem; drop all Linux capabilities; no-new-privileges; seccomp; no host mounts/Docker socket; no database, queue, or R2 credentials; no inbound/general outbound network; bounded tmpfs; CPU 2 cores; memory 2 GiB; PIDs 64; temporary disk 768 MiB; wall timeout 60 seconds. Supervisor alone reads quarantine data and submits bounded JSON. Never parse in Next.js, Medusa API, Admin, shared web process, or plain OCI container without gVisor/microVM. ([gVisor](https://gvisor.dev/docs/), [Docker security](https://docs.docker.com/reference/cli/docker/container/run), [resource limits](https://docs.docker.com/engine/containers/resource_constraints))
- [ ] **Enforce hostile-input caps before mesh allocation.** Initial limits: input ≤100 MiB; 3MF ≤256 ZIP entries, ≤64 MiB per entry, and ≤512 MiB total actually expanded bytes; compression ratio ≤20:1; path depth ≤8 and path length ≤240 bytes; each XML part ≤10 MiB, depth ≤64, elements ≤2,000,000, and attributes ≤32 per element. Reject encryption, symlinks, duplicate normalized paths, absolute paths, .., unsupported compression, nested archive extraction, XML DTD/entities/external references, remote OBJ/MTL/texture references, NaN/Infinity, coordinate magnitude >100,000 mm, >2,000,000 vertices or triangles, and parse time >60 seconds. Store exact values in parser/src/forma_mesh_parser/limits.py. Raise caps only after benchmark/load/security review and a Section 11 decision-log entry.
- [ ] **Implement parser preflight and parse separately.** preflight.py validates extension allowlist, magic/header, raw size, ZIP central directory and compressed/expanded sizes, normalized paths, XML parser flags, and OBJ external references before trimesh loads anything. parse_mesh.py supports only STL/OBJ/3MF via pinned trimesh APIs, process=False, no resolver/network, no plugin discovery. Normalize known units to mm; compute bounds, volume, vertex/triangle/component counts, watertight/manifold flags, and finite-coordinate checks. Never evaluate scripts, execute binaries, invoke a shell, fetch URLs, or write outside sandbox tmpfs.
- [ ] **Validate parser output before persistence.** MeshAnalysisResultSchema is strict/versioned: schema_version: 1, job_id, opaque string asset_id, spec_revision, input_sha256, parser_version, unit, bounds_mm: {x,y,z}, volume_mm3, vertex_count, triangle_count, component_count, watertight, manifold, and a valid|review_required|rejected discriminator. Require finite numbers, non-negative bounds with at least one positive axis for non-rejected results, bounded non-negative integer counts, exact asset/hash/job/spec_revision match, and reject unknown fields. Worker returns JSON only, never path/raw mesh/URL/trace. Medusa internal result route authenticates a rotating worker credential, validates schema, verifies job ownership/idempotency, persists QuoteAnalysis, and transitions Quote to estimated/review_required/rejected.
- [ ] **Add non-authoritative browser preview.** Implement apps/storefront/src/app/(store)/custom-printing/quote/page.tsx and apps/storefront/src/components/quote/model-preview.tsx. Use three addon loaders STLLoader from three/addons/loaders/STLLoader.js, OBJLoader from three/addons/loaders/OBJLoader.js, and ThreeMFLoader from three/addons/loaders/3MFLoader.js. Skip preview for files over 25 MiB; transfer smaller local files to a dedicated Web Worker, terminate after 8 seconds or unmount, and do not load MTL/texture references, URLs, or remote resources. Browser bounds are display-only and never sent as trusted data. Show “preview only; server analysis pending” until validated backend result; preserve upload when preview fails. ([STLLoader](https://threejs.org/docs/pages/STLLoader.html), [OBJLoader](https://threejs.org/docs/pages/OBJLoader.html), [ThreeMFLoader](https://threejs.org/docs/pages/3MFLoader.html))
- [ ] **Implement the pricing engine under apps/medusa/src/modules/quotes/pricing/.** Files: rules.schema.ts, rules.ts, calculate-price.ts, index.ts. Version server-only approved machine/material rates, setup fee, post-process fee, minimum charge, margin basis points constrained to integer 0–100,000, build limits, quantity rules, currency, and effective date. Use decimal.js for intermediate arithmetic; convert volume_cm3 = volume_mm3 / 1000; derive machine_seconds from approved process/profile estimator, never client input; persist integer minor units. Formula: material_minor = ceil(volume_cm3 × material_rate_minor_per_cm3); machine_minor = ceil(machine_seconds × machine_rate_minor_per_second); base_minor = setup_minor + material_minor + machine_minor + postprocess_minor; unit_minor = ceil(base_minor × margin_bps / 10000); total_minor = unit_minor × quantity, then apply configured minimum. Snapshot every input/rate/formula version/rounding rule/currency/result. Until Section 3 approves actual rates/processes/build envelope, all valid files go to review_required; never show a fabricated instant price.
- [ ] **Route ambiguous/high-risk geometry to human review.** Manual review is required for STEP/IGES and every non-allowlisted format; unknown units; non-watertight/non-manifold geometry; multiple ambiguous shells; build-envelope/complexity overflow; timeout; parser disagreement; uncertain scale; or missing approved pricing rules. Never silently repair geometry or use client values to price. Staff may request replacement upload or revise with an audit reason.
- [ ] **Accept and convert only the current revision.** accept-quote.ts verifies authenticated owner, status sent, expiry, exact aggregate_version + spec_revision, and server price snapshot hash. convert-quote-to-cart.ts creates/reuses the customer Medusa cart, adds a dedicated custom-print service variant with server-set custom unit price through Medusa custom item pricing workflow, writes only {quote_id, accepted_spec_revision} in line-item metadata, links Quote↔Cart, and delegates tax/shipping/promotions/totals to Medusa. Reject client unit price. On order.placed, apps/medusa/src/subscribers/quote-order-link.ts verifies cart/quote link and idempotently associates Quote↔Order. Never insert directly into Order Module.
- [ ] **Use one full-payment checkout for Phase 4 v1.** Convert an accepted Quote into one server-priced cart and one Medusa Order through normal Payment Collection/Stripe session/cart-completion workflows. Deposits/balances are out of v1 unless a Section 3 decision explicitly approves them. If approved, add QuoteCharge DML + strict snapshot/hash, one-active-charge uniqueness, QuoteCharge↔Payment Collection Module Link only, PaymentCollection-native Cart/Order traversal, native Medusa capture/refund reconciliation plus 60-second recovery, and revised security tests before implementation. Never add Charge↔Cart/Order authority, call Stripe directly, trust redirects, or maintain a shadow ledger.
- [ ] **Create Admin quote APIs and screens.** APIs under apps/medusa/src/api/admin/custom/quotes/ provide list/filter/detail, short-lived authorized preview, assignment, approve/reject/revise price, replacement upload request, and send quote. Require Admin auth, record actor/reason/revision, and call workflows. UI at apps/medusa/src/admin/routes/quotes/page.tsx and routes/quotes/[id]/page.tsx uses @medusajs/admin-sdk and @medusajs/ui. Show sanitized filename, parser state, dimensions, volume, triangle count, watertightness, price snapshot, expiry, and order links. Build and deploy it as the standalone Admin SPA artifact.
- [ ] **Add expiry, retention, and emails.** A Medusa scheduled job runs expire-quote.ts for expired quotes and unused intents; revoke intent state and delete staging/quarantine objects under approved retention rules, but preserve accepted quote/order records. Send received, analysis-ready/manual-review, quote-sent, expiring, accepted, and rejected emails through Notification Module with deduplication keys. Email links require account authentication; never attach source models or expose keys.
- [ ] **Exercise hostile inputs and cleanup in isolated infrastructure.** Add apps/private-media-worker/parser/tests/fixtures/ for valid STL/OBJ/3MF, truncated data, bad headers, XML DTD/entity payloads, traversal, duplicate ZIP paths, encrypted ZIP, compression bomb, remote OBJ references, NaN/Infinity, excessive triangles, non-manifold meshes, and CPU/memory timeout. Assert no sandbox egress/secrets/host mounts/process leaks, and verify staging/quarantine cleanup plus idempotent retry. Never run hostile parser fixtures in the production API process.
- [ ] **Verify the complete test checkout.** Exercise intent → bounded private PUT → finalize/hash/quarantine → parser job → safe analysis → manual review or approved estimate → staff revision → customer acceptance → cart/custom price → Stripe test payment → order/quote links. Assert totals match server snapshot, retries do not duplicate charge/order, unsupported files fail safely, and errors reveal no infrastructure/storage details.

**Security POV implementation additions (required; see Section 8.7):**

- [ ] **Separate Quote versions and bind every artifact.** Add owner_customer_id, aggregate_version, spec_revision, and snapshot_sha256 to Quote. aggregate_version increments on state changes; spec_revision increments only when the uploaded model or print options/quantity/price snapshot changes. QuoteAsset stores spec_revision, finalized_at, unique public_asset_id, final trusted SHA-256, analysis_job_id, finalize_attempt_count, and parse_attempt_count. QuoteAnalysis stores job_id, input_sha256, spec_revision, schema_version, parser_version, and a uniqueness constraint on (asset, parser_version, input_sha256). QuoteEvent stores aggregate_version and spec_revision. Never use one counter for both row CAS and quote content revision.
- [ ] **Replace the mesh result contract with the hardened discriminated union.** Use packages/contracts/src/mesh-analysis.ts and Section 8.7.4 V1. The result must carry job_id, opaque Medusa asset_id string, exact input_sha256, and allowlisted parser_version. valid/review_required results require finite bounded geometry/counts but permit a zero axis if another axis is positive; rejected results carry a reason and no fake bounds. Compare job, asset, hash, spec_revision, processing state, and parser version before persistence.
- [ ] **Make upload intents immutable and replay-safe.** Request byte_size, declared_content_type, and optional client SHA-256 as claims only; validate extension/claimed size before signing but verify actual byte count, MIME signature, metadata, and hash at finalize. Generate opaque server keys with module/owner/asset/random nonce; bind a short-lived HMAC upload token to intent ID, key, and expiry, return it once, and never log/store the raw token. Sign the exact allowlisted Content-Type and If-None-Match: *; test checksum headers against the configured R2 endpoint. CORS allows only exact storefront origins, PUT, and headers actually sent. A hard size ceiling uses the Cloudflare Worker streaming gateway; signed Content-Length alone is not treated as a hard cap.
- [ ] **Implement an idempotent atomic finalize operation.** In the Quotes custom module service, claim only an unexpired state=intent row with an atomic compare-and-set on state + aggregate_version/spec_revision, record finalized_at and `finalize_attempt_count`, then HEAD the exact server-generated staging key. Recompute and constant-time validate `upload_token`; verify R2 ContentLength is within the configured cap, signed Content-Type matches the server canonical type, intent metadata is exact, and magic bytes match the allowed extension. Stream staging to a unique quarantine key while computing SHA-256; enforce the byte cap during streaming; verify any client checksum claim against the trusted stream hash; conditionally create quarantine object; persist quarantined state; delete staging only after verified copy; enqueue only quote_id, asset_id, job_id, spec_revision, and hash. Replay of a successful finalize returns the stored result idempotently; stale/expired/reused intents return typed conflict/not-found errors. Use compensations for copy/delete failures.
- [ ] **Enforce parser pre-allocation and archive limits.** Add explicit preflight stages in apps/private-media-worker/parser/src/forma_mesh_parser/: STL binary requires 84 + 50*n to match the file size and n ≤ 2,000,000 before allocating; ASCII STL counts facets while streaming; OBJ is line-oriented with 8 KiB max line, vertex/face/line caps, finite values, checked positive/negative indices, and no MTL/network resolution; 3MF validates ZIP entries/paths/compression/XML before parsing and streams decompression through a byte-counting bounded temp file, never ZipFile.read() or a growing in-memory bytearray. Enforce 256 entries, 512 MiB total expanded cap, per-entry/XML/ratio/depth caps, reject DTD/entities, traversal, duplicates, encryption, links, and unsupported compression. Fail with a fixed error code before resource exhaustion.
- [ ] **Validate geometry without false negatives or unsafe pricing.** Normalize/weld vertices deterministically before topology checks; do not rely on watertightness computed from unmerged per-triangle indices. Check finite coordinates, bounds, triangle/face/edge/component caps, manifoldness, volume-to-bounds sanity, units, build envelope, and parser timeout. Route degenerate, self-intersecting, ambiguous, non-manifold, unknown-unit, or out-of-envelope inputs to review_required; never silently repair or price from browser geometry.
- [ ] **Authenticate worker results.** Worker posts bounded JSON only through apps/medusa/src/api/internal/custom/quotes/analysis-results/route.ts using rotating HMAC credentials, key ID, timestamp tolerance, random nonce replay store, and constant-time signature comparison over raw-body SHA-256. Persist only after strict Zod validation, exact job/asset/hash/spec_revision match, parser allowlist check, idempotency claim, and current asset state=processing. Worker has no Medusa/R2/Redis credentials inside gVisor/microVM.
- [ ] **Keep client preview cosmetic and bounded.** Skip preview above 25 MiB, transfer ArrayBuffer to a dedicated Web Worker, terminate after 8 seconds or unmount, guard STL counts before Three.js loader allocation, cap devicePixelRatio at 1.5, dispose geometry/materials/renderers, and show “preview unavailable — server analysis still running.” No browser-derived geometry reaches pricing.
- [ ] **Revalidate quote price and conversion.** Add snapshot_sha256 over canonical versioned price inputs/results. At acceptance compare sent status, expiry, expected aggregate_version/spec_revision, and snapshot hash. At conversion recompute using the stored pricing_version and server rules; mismatch returns 409 PRICE_DRIFT and requires a new customer acceptance. Treat line-item metadata quote_id as a claim; resolve authority through the Quote↔Cart Module Link, verify accepted revision and exact server unit price at order.placed, and alert/hold on mismatch.
- [ ] **Protect retries, route entry, and staff operations.** The enqueue-analysis workflow alone increments `parse_attempt_count`; allow at most three distinct parser job IDs, reuse the same ID for queue-delivery retries, and after the third failed/timed-out attempt write terminal `rejected` with `retry_exhausted`. Rate-limit by customer and IP using Section 8.7.3 I. Require exact Origin on browser mutations, authenticate each route, authorize quote ownership, require staff roles for assignment/price/send actions, and run the route sweep. Keep signed URLs and object keys out of logs and queue payloads.
- [ ] **Pass hostile-input and recovery gates before Phase 4 sign-off.** Generate the fixtures in Section 8.7.4 V7 reproducibly and run them through the real gVisor/microVM adapter in CI/staging. Include zip bombs, XML entities/XXE, traversal, duplicate normalized paths, encrypted ZIP, liar/truncated STL, NaN and negative-index OBJ, oversized faces, remote references, thin/self-intersecting geometry, timeout, memory cap, worker-result forgery/replay, stale revision, finalize replay, and DB/R2 restore reconciliation. Run all Section 8.7.5 staging acceptance criteria.

**Done when:** a customer can upload a supported model and receive a server-validated estimate when approved pricing rules exist, or an explicit manual-review state while those rules remain unapproved; an accepted quote checks out through Medusa; staff can review/revise; unsupported or complex files route to human review.

### 9.8 Phase 5 — Content, trust & SEO

- [ ] Set up Payload 3 in `apps/cms` with Neon Postgres, collections/globals for projects, journal, materials, homepage, About, and testimonials, ro/en localization, editor auth, strict CSP, and signed revalidation webhooks.
- [ ] Migrate projects to Payload; build index + detail pages.
- [ ] Add 3 journal articles with SEO intent in Romanian and English.
- [ ] Build materials library + sample-pack product.
- [ ] Build About/studio page with people, machines, and process.
- [ ] Build verified reviews module and `/reviews`; add the optional attributed Google reviews band without mixing it into product ratings.
- [ ] Build Help/FAQ, shipping, returns, care, file guidelines, and Contact.
- [ ] Add internal linking between products, categories, projects, materials, and articles.
- [ ] Add OG images, structured data, sitemap, robots, hreflang, and redirects.
- [ ] Commission and add real studio/people/product photography before public launch; label any remaining CGI or placeholder imagery clearly.
- [ ] Add review request email after fulfillment.
- [ ] Replace seeded reviews with real or clearly labelled testimonials.
- [ ] Localize all customer-facing pages, legal copy, emails, and metadata into Romanian and English; keep RON as the only checkout currency.

**Done when:** an editor can publish a project/article without a deploy; catalogue and service pages have unique SEO content; reviews are verified; help/legal pages are live.

### 9.9 Phase 6 — Polish, QA & launch

- [ ] Accessibility audit (axe + manual keyboard + screen reader).
- [ ] Performance audit against budgets; code-split 3D and optimize images.
- [ ] Analytics/consent verification and funnel dashboards.
- [ ] Sentry, uptime monitoring, and alerting.
- [ ] Legal pages and cookie consent; replace placeholders with the verified Romanian entity, address, contact email, and policy text.
- [ ] Verify Romanian/EU consumer compliance: VAT-inclusive pricing, 14-day withdrawal right, custom/commission exemptions, ANPC/ODR links, and GDPR/cookie consent.
- [ ] Cross-browser and real-device QA.
- [ ] E2E suite, visual regression, and workflow integration tests.
- [ ] Load test quote parser and checkout endpoints.
- [ ] Verify RON checkout, EUR indicative display, Romanian VAT, and bilingual `/ro` + `/en` metadata before launch.
- [ ] Deploy staging; run full purchase/commission/quote journeys.
- [ ] Configure production domain, DNS, SSL, SPF/DKIM/DMARC.
- [ ] Switch Stripe to live keys and webhooks; test a low-value RON order.
- [ ] Verify backups and restore process.
- [ ] Prepare launch checklist, support inbox, and order notifications.
- [ ] Update this plan and remove `legacy/` after parity.

**Done when:** no P0/P1 issues; all launch MVP pages are live; payments and emails work in production; accessibility/performance budgets are met or documented; backups and monitoring are active.

### 9.10 Phase 7 — Post-launch growth

- [ ] Use real sales data for best sellers and recommendations.
- [ ] AR product previews and finish configurator refinements.
- [ ] A/B test hero, home section order, and CTAs.
- [ ] Trade/wholesale portal, saved quotes, net terms.
- [ ] EU/EUR region, additional currencies/languages beyond RON/EUR and Romanian/English.
- [ ] Gift cards, loyalty, referrals.
- [ ] Journal cadence and SEO iterations.
- [ ] Reviews with photos and UGC.
- [ ] Advanced personalization: engraving, dedication, packaging.
- [ ] Capacity forecasting and booking.
- [ ] Sample-pack promotion and trade outreach.

---

## 10. Risks and guardrails

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope creep across commerce, CMS, 3D, and custom flows | Launch slips | Phase gates; ship the commerce spine first; keep Section 2.3 out of scope |
| Custom quote/commission modules take longer than expected | Blocks flagship | Timebox a spike in Phase 3/4; start with manual review and simple pricing |
| File upload security | Malware, parser exploits, abuse | Presigned uploads, validation, virus scan, isolated parser, rate limits |
| Customer photo privacy | Serious trust/legal issue | Private bucket, signed URLs, retention/deletion, consent, access controls |
| 3D performance on mobile | Slow LCP, battery drain | Lazy load, adaptive DPR/geometry, pause offscreen, posters, reduced motion |
| Thin category pages | Poor SEO/UX | Page-worthiness test; 3+ products + unique copy; filters otherwise |
| Fake reviews/counts/scarcity | Trust damage | Verified reviews only; fix catalogue claims; honest lead times |
| Catalogue data migration errors | Wrong prices/specs | Seed script with Zod validation; snapshot; compare against source |
| Payment/deposit complexity | Lost revenue, support load | Stripe test mode, webhooks, idempotency, clear terms, manual fallback |
| Shipping/tax complexity | Surprise costs | Configure regions early; DDP where possible; clear lead times |
| CMS/Medusa duplication | Inconsistent content | One source per data type; reference handles/IDs |
| No real photography | Concept-like feel | Plan a studio shoot before launch; use CGI as interim |
| Migration baseline | Losing the reference implementation | Baseline tag `baseline-static-site` created; keep `legacy/` until parity |
| RON price migration | Wrong margins or misleading “from” prices | Record the conversion/reprice decision; seed only reviewed RON prices; remove USD-style placeholders |
| Romanian VAT/consumer law | Non-compliant pricing, returns or cookie consent | Confirm VAT rate with the accountant; publish EU 14-day withdrawal and custom-goods exemptions; legal review before launch |
| Payload CMS ops | Editor lockout or stale content | Managed Neon Postgres, backups, signed revalidation webhooks, least-privilege editor roles |
| Chunk size / Three.js | Slow initial load | Code-split, lazy-load, performance budget |
| Accessibility regressions | Excludes users, legal risk | Keyboard/focus tests, axe, reduced motion, manual audit |
| Admin operational burden | Orders/commissions fall through | Commission board, quote queue, email notifications, clear SLAs |

### Guardrails

- Do not launch with invented reviews or product counts.
- Do not promise instant quotes for formats that require human review.
- Do not imply a photoreal AI portrait when the process is artist-led.
- Do not create a page for every subcategory by default.
- Do not expose customer photos or uploaded files publicly.
- Do not publish placeholder addresses, `.example` emails, or unverified testimonials.
- Only use 3D assets with clear licences; record attribution (including the head scan).
- Do not put card data or secrets in the repo.
- Do not delete the current site until the replacement is verified.
- Keep the premium, quiet visual language; avoid marketplace clutter.

---

## 11. Decision log

| Date | Decision | Status | Notes |
| --- | --- | --- | --- |
| 2026-10-27 | FORMA brand, palette, typography, and premium direction | Confirmed | Static concept site built |
| 2026-10-27 | Use Medusa (MedusaJS) for backend | Confirmed | Version to pin in Phase 0 |
| 2026-10-27 | Move to hub-and-spoke page architecture | Confirmed | Home is curated; details on dedicated pages |
| 2026-10-27 | Keep custom CSS/design system rather than adopting a UI kit | Recommended | Confirm with Next.js migration |
| 2026-10-27 | Migrate to Next.js App Router | Recommended | Needed for SEO, SSR, product pages, server cart |
| 2026-10-27 | Use pnpm workspace with `apps/storefront` and `apps/medusa` | Recommended | Current app preserved as `legacy/` |
| 2026-10-27 | Sanity as default CMS | Recommended | Payload/MDX alternatives open |
| 2026-10-27 | Meilisearch for search | Recommended | Revisit if catalogue stays small |
| 2026-10-27 | Custom Medusa review module | Recommended | Verified purchases only |
| 2026-10-27 | Stripe for payments and deposits | Recommended | Confirm deposit percentages |
| 2026-10-27 | 3D: Three.js hero + GLB/model-viewer product AR | Recommended | Export GLBs from render pipeline |
| 2026-10-27 | Launch with USD/English; expand later | Recommended | Confirm markets |
| 2026-10-27 | Fix “86+”/“64+” catalogue claims before launch | Confirmed | Current catalogue has 14 products |
| 2026-10-28 | Medusa v2 data and workflow architecture; Next.js data access; private upload/parser boundary | Recommended | Sections 5–6 now use native commerce modules, custom domain modules + links/workflows, JS SDK/App Router, and an isolated R2 file pipeline; not a substitute for remaining business/infrastructure decisions |
| 2026-10-28 | Implementation-level Phase 1–4 roadmap | Recommended | Added concrete monorepo paths, Medusa v2 DML/Zod contracts, workflows/Module Links, App Router/SDK boundaries, Admin SPA deployment, and bounded private mesh parsing; unresolved Section 3 business/infrastructure choices remain open |
| 2026-10-28 | Adopt adversarial security POV as Section 8.7 and mandatory Phase 3/4 gates | Confirmed | The threat model, release blockers, hardening controls, and acceptance tests are now part of this plan. Proxy/redirect, retention, role implementation, and hard upload gateway remain open decisions. |
| 2026-10-28 | Stripe capture policy | Confirmed | Set Stripe `capture: true` explicitly for launch. Deposit percentage remains a separate Section 3 business decision; Medusa Payment state is authoritative. |
| 2026-10-28 | Private asset delivery method | Open | Decide authorized proxy versus short-lived signed redirect; recommendation is proxy for proofs/models and redirect only for thumbnails. |
| 2026-10-28 | Private media retention durations | Open | Security review proposes durations in Section 8.7.3 K; obtain legal/privacy approval before configuration. |
| 2026-10-28 | Staff role granularity | Open | Security review proposes ops, artist, finance, admin with server-side per-route checks; confirm the staffing policy before the first Commission DML migration, not merely before Phase 3. |
| 2026-10-28 | Hard upload-size gateway | Open | Prefer Cloudflare Worker streaming cap. If not selected, document residual R2 size/cost risk and require finalize checks, quotas, and alarms before Phase 4 release. |
| 2026-10-28 | Cancellation/refund policy | Open | Define the commercial cancellation window, refund/void handling, and role required before enabling Commission cancellation or refunds. Until approved, keep cancellation commands disabled. |
| 2026-10-28 | Section 3 launch decisions: truthful 14-product seed designed for 40–60; custom quote rules (FDM/SLA/SLS, STL/OBJ/3MF instant, STEP manual review); managed services; no wholesale | Confirmed | Recorded in Sections 2.1, 2.2, and 3. Actual quote rates/build envelope still required before enabling instant pricing. |
| 2026-10-28 | CMS: **Payload 3** on Neon Postgres (`apps/cms`) instead of Sanity | Confirmed | Supersedes the 2026-10-27 Sanity default. Payload runs as a Next.js app with ro/en localization; commerce stays in Medusa. |
| 2026-10-28 | Launch market/currency: Romania only; RON checkout; EUR indicative display only; `/ro` default and `/en` | Confirmed | Medusa enforces one currency per region and one region per country, so a real EUR checkout requires an EU/EUR region with shipping. EUR conversion is display-only and never reaches cart/order/payment totals. |
| 2026-10-28 | Tax/returns: VAT-inclusive prices, Romanian VAT via Medusa tax; EU 14-day withdrawal on stock; custom/commission non-returnable after proof approval | Confirmed | Confirm the current Romanian VAT rate with the accountant before launch. Carrier and shipping rates remain TBD. |
| 2026-10-28 | Reviews: custom verified Medusa module plus an optional attributed Google reviews band | Confirmed | Google reviews are not verified purchase reviews and never feed product rating aggregates or `Review` structured data. |
| 2026-10-28 | Photography: CGI for launch; real studio/people/product photography before public launch | Confirmed | Label any remaining CGI or placeholder imagery clearly. |
| 2026-10-28 | Portrait pricing | Open | Explicitly deferred. Build config-driven pricing; publish no portrait numbers until real costs/margins are supplied. |
| 2026-10-28 | Product price migration to RON | Open | Blocks Phase 1 catalogue seeding. Current USD-style numbers are placeholders; do not seed them as RON without a documented conversion/margin review. |
| 2026-10-28 | Legal entity/address/contact email/domain/social handles | Open | Placeholders remain (`studio@forma.example`, Brooklyn address). Replace with verified Romanian details before launch; never publish placeholders. |
| 2026-10-28 | Baseline tag `baseline-static-site` created | Confirmed | Marks the pre-migration Vite concept site; `npm run build` passes with 920.13 kB JS (252.11 kB gzip). |

---

## 12. Backlog / post-launch ideas

- Product AR with room placement.
- Live finish/material switching on product pages.
- Portrait photo quality checker (lighting, resolution, angle) before upload.
- “View your bust in 3D” stylized preview after artist sculpt.
- Trade/wholesale portal with saved quotes and net terms.
- Sample pack subscription or credit-toward-order.
- Gift cards and gift wrapping.
- Multi-currency and localized sizing.
- Loyalty/referral program.
- Reviews with customer photos.
- Journal series: material guides, file-prep guides, behind-the-scenes.
- Capacity calendar and “next available month” messaging.
- A/B testing framework for hero and home modules.
- Personalized engraving/dedication options.
- Packaging and unboxing content.
- Sustainability report: recycled materials, packaging, waste.
- Studio visit booking.
- Press page.
- Affiliate/creator collaborations.
- Search synonyms and merchandising rules.
- Recommendation engine based on real sales data.

---

## 13. Session log
### 2026-10-28 — Phase 0 workspace scaffold

- Pinned Node 24.22.2 (Nodist + `.node-version`) and pnpm 11.25.0; created the root pnpm workspace (`package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `README.md`) and moved the Vite app to `legacy/` with `git mv`.
- Built `packages/contracts` (`@forma/contracts`) with strict Zod contracts for products, commissions, quotes, and mesh analysis, exported as `./product`, `./commission`, `./quote`, and `./mesh-analysis`.
- Scaffolded `apps/storefront` (Next.js 16.4.3), `apps/medusa` (Medusa 2.22.1, Admin included), and `apps/cms` (Payload 3.92.1 on Postgres, ro/en localization). Added `.env.example` and README files for each app.
- Fixed the Medusa Admin build by declaring `@medusajs/admin-shared` directly in `apps/medusa/package.json`; pnpm's strict layout does not expose the bundler's transitive copy to the generated `virtual:medusa/i18n` module.
- Fixed the manually scaffolded Payload app: removed the removed `generatePayloadViewport` export, switched `build` from the removed `payload build` command to `next build`, pointed Turbopack at the workspace root so pnpm links resolve, added an ESLint 9 flat config, and replaced the raw `<a>` admin link with `next/link`.
- Fixed legacy typechecking in the monorepo: aligned `@types/react`/`@types/react-dom` with Medusa's React 18 types and mapped `react` to the legacy copy so hoisted React 19 types from the new apps cannot leak into `legacy/`; replaced `tsc -b --noEmit` with explicit project checks. Removed the obsolete `inApp` option from the Medusa health integration test.
- Verified on 2026-10-28: `pnpm install`, `pnpm build` (contracts, storefront, CMS, Medusa backend + Admin, legacy), `pnpm typecheck`, `pnpm lint`, and `pnpm test:legacy` (13/13) all pass. Remaining Phase 0 work: CI, the `apps/private-media-worker` placeholder, visual baseline docs, and user-assisted managed-service projects.

### 2026-10-28 — Phase 0 mobile-menu baseline stabilized

- Reproduced the intermittent mobile-menu failure: `getByRole('button', { name: 'Open menu' })` timed out because the mobile page had not hydrated while the desktop page's software-rendered 3D hero was still running.
- Updated `scripts/functional-test.mjs` to close the desktop page before opening the mobile page and to wait for `.header-action--menu` visibility instead of a fixed delay. The mobile menu itself needed no source change.
- Verified `node scripts/functional-test.mjs` passes 13/13 on six consecutive runs. Updated Section 0.1, Section 1.4, and the Phase 0 checklist.
- Next: create `migration/medusa`, pin the runtime, and build the pnpm workspace.

### 2026-10-28 — Phase 0 decisions, baseline tag

- Created annotated tag `baseline-static-site` on the clean `main` tree after verifying `npm run build` (920.13 kB JS / 252.11 kB gzip, CSS 115.52 kB / 21.54 kB gzip).
- Reviewed and recorded Section 3 decisions with the user: truthful 14-product seed designed for 40–60; Payload 3 on Neon Postgres instead of Sanity; Romania-only launch with RON checkout and EUR indicative display; Romanian-primary/English-secondary `/ro` + `/en` routing; VAT-inclusive pricing with Romanian VAT via Medusa tax; EU 14-day stock returns and custom non-returnable after proof approval; custom verified reviews plus an attributed Google band; CGI now with real photography before launch; managed infrastructure; no wholesale.
- Kept portrait pricing and product RON pricing explicitly open; documented them as Phase 0/Phase 1 blockers rather than inventing numbers. Legal entity, address, contact email, and domain remain placeholders until verified.
- Updated Sections 0–2, 3, 5–7, 8, 9.3–9.10, 10, 11, and 14 to remove the Sanity/USD assumptions. No application source changed; the mobile-menu Playwright timeout remains the next engineering task.

### 2026-10-28 — Adversarial security POV adopted

- Added Section 8.7 with the supplied threat model, findings, control specifications, validation contracts, hostile fixtures, CI gates, staging acceptance criteria, residual risks, and Phase 3/4 task mapping.
- Added implementation clarifications for Medusa v2 module transactions, native Stripe webhook processing, separate row/content revisions, R2 upload-size limits, opaque Medusa IDs, generated module migrations, and unresolved retention/RBAC/asset-delivery/gateway decisions.
- Added concrete security implementation tasks and sign-off gates to Phases 3 and 4. Phase 0 remains the current phase; no application implementation was started. This was a documentation-only change; application builds/tests were not run.


### 2026-10-28 — Phase 1–4 implementation blueprint

- Expanded roadmap Sections 9.4–9.7 with concrete pnpm monorepo paths, package choices, data contracts, Medusa v2 DML/Module Links/workflows, Next.js Server Component/Server Action/TanStack Query boundaries, Admin SPA build/deployment, and an isolated STL/OBJ/3MF parser pipeline.
- Added explicit customer/admin authorization, payment ownership, quote/commission lifecycle, private R2 intake, parser resource caps, and manual-review gates. Kept rates, shipping/tax, consent retention, catalogue depth, and hosting decisions open where Section 3 has no confirmed choice.
- Current repository has an initial commit (4a658c6), but no .gitignore or baseline tag; those Phase 0 tasks remain unchecked. This was a documentation-only change; application build/tests were not run.

### 2026-10-28 — Security plan verification

- Verified `npm run build` succeeds for the current Vite application; Vite reports its existing large-chunk advisory.
- Verified `node scripts/functional-test.mjs` passes all 13/13 functional checks.
- Verified the documentation diff with `git diff --check`; only PLAN.md is intended for commit. The test run touched temporary npm log files, which were restored/removed before commit.

### 2026-10-28 — Medusa v2 and Next.js architecture review

- Rewrote Sections 5–6 against current Medusa v2, Next.js App Router, Cloudflare R2, OWASP upload, and Docker security guidance.
- Clarified Admin as a Vite SPA: served at `/app` by default, with `medusa build --admin-only` available for separate static hosting; updated the Section 14 quick reference.
- Added private R2 upload intents, quarantine, sandbox/resource bounds, archive/mesh limits, workflow boundaries, and security test requirements.
- The workspace has no `.git` directory, so Git status/commit is unavailable. This was a documentation-only change; application build/tests were not run.

### 2026-10-27 — Concept site complete, migration planned

- Built and polished the static FORMA concept storefront: hero, mega menu, catalogue, portrait studio, custom bureau, materials, projects, reviews, overlays, 3D scenes, local assets, functional tests.
- Verified `npm run build` and 13/13 Playwright checks.
- Decided to move to Medusa + a hub-and-spoke page architecture.
- Created this plan and the agent pointer.
- Next: confirm open decisions, initialize git, and start Phase 0.

---

### 2026-10-28 — Payment hardening follow-up adopted

- Adopted the payment review as implementation requirements: `payment.captured` is a wake-up, Medusa Payment/Payment Collection state is authoritative, and an idempotent 60-second reconciler recovers missing events. Pinned launch capture behavior to explicit `capture: true` and kept deposit percentage separate.
- Clarified Charge→Payment Collection as the sole payment-side Module Link; added authorized-state handling, captured amount/currency/refund/hold guards, mismatch-resolution lifecycle, and price snapshot equality/CAS requirements.
- Added the Quote intent-abandonment retry transaction, enqueue-owned three-attempt parser counter, R2 download-signer credential boundary, shared mesh contract rule, pricing bound, explicit DML defaults, and CI invariant-tool prerequisites. Staff roles and cancellation/refund policy remain gated decisions.
- Documentation-only update. `npm run build` passes (Vite retains its >500 kB chunk advisory). `node scripts/functional-test.mjs` passed 12/13 checks on two runs; `mobile menu expands a category and links into the collection` timed out on both. No storefront implementation changed during this update; the baseline timeout is an unchecked Phase 0 follow-up. Only PLAN.md is intended for commit.

### 2026-10-28 — Git hygiene audit

- Added a root `.gitignore` for dependencies, build output, framework/tool caches, test artifacts, local environment files, and logs. Removed tracked `dist/`, `node_modules/`, and `npm-cache-temp/` contents from the Git index without deleting local files; retained `package-lock.json`, source files, `public/` assets, and the portrait attribution.
- Verified the current Vite production build with `npm run build`; it passes with the existing large-chunk advisory. Ignore-rule checks confirmed build/dependency/cache paths and local `.env` files are ignored while the lockfile, `.env.example`, and attribution remain eligible for tracking. No application source changed.

## 14. Quick reference

### Current commands

```powershell
npm run dev          # http://127.0.0.1:5173
npm run build
npm run typecheck
node scripts/functional-test.mjs
node scripts/renders.mjs
```

### Current key paths

```text
src/App.tsx
src/components/
src/components/overlays/
src/data/catalog.ts
src/state/store.tsx
src/lib/three/
src/render/RenderStudio.tsx
src/styles/
public/renders/
public/fonts/
public/models/
scripts/functional-test.mjs
scripts/renders.mjs
```

### Future ports

```text
Next.js storefront   3000
Payload CMS          3001
Medusa backend       9000
Medusa Admin SPA     standalone `.medusa/admin` artifact from `medusa build --admin-only`; `/app` only in the default combined Medusa build
Meilisearch          7700
```

### Baseline

- `baseline-static-site` tag marks the pre-migration Vite concept site (commit 6fb1cf4).
- The current Vite app stays runnable until the replacement reaches parity; then move it to `legacy/`.

### Attribution

- Portrait head scan: **LeePerrySmith**, CC BY 3.0. Keep the footer credit and the licence file at `public/models/LICENSE-portrait-head.txt`.
- Customer photographs and uploaded files are private; never use them in marketing without explicit consent.

### If lost

1. Read Section 0.1 (current focus).
2. Read Section 9.1 (phase status).
3. Pick the next unchecked task.
4. If unsure, ask the user only about the blocking decision in Section 3.
