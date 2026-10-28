# FORMA — Storefront & Medusa Migration Plan

> **Single source of truth.** Read this before starting work.
>
> **Last updated:** 2026-10-28
>
> **Status:** Static concept site complete. Medusa v2 architecture corrections and implementation-ready Phase 1–4 specifications documented; implementation not started.
>
> **Next action:** Review the open decisions in Section 3, then complete the remaining Phase 0 workspace/runtime/hosting setup.

---

## Document map

| Section | Use it for |
| --- | --- |
| 0 | Resume/update protocol and definition of done |
| 1 | Current project state, inventory, metrics, quirks |
| 2–3 | Confirmed decisions, recommended defaults, open questions |
| 4 | Target routes, navigation, home structure, page templates |
| 5 | Medusa entities, metadata, custom modules, CMS, seed mapping |
| 6–8 | Frontend architecture, integrations, SEO/performance/a11y/security |
| 9 | Phased task list and acceptance criteria |
| 10–14 | Risks, decision log, backlog, session log, quick reference |

**If you only read one thing:** Section 0.1 → Section 9.1 → the next unchecked task.

---

## 0. How to use this plan

### 0.1 Current focus

| Field | Value |
| --- | --- |
| Current phase | **Phase 0 — Foundation** |
| State | Planning complete — Sections 5–6 corrected and Phases 1–4 expanded into implementation specifications; awaiting business/infrastructure decisions; implementation not started |
| Next action | Review remaining Section 3 decisions, then complete Phase 0 workspace/runtime/hosting setup |
| Blocking decisions | Catalog depth, portrait pricing, custom-quote rules, CMS, hosting/accounts |
| Current app | Vite + React concept storefront at `http://127.0.0.1:5173` |
| Current verification | `npm run build` passes; `node scripts/functional-test.mjs` passes 13/13 |
| Workspace | `E:\dev\rob\maga` (Windows, PowerShell; current Node 20.10 must be upgraded to the pinned Medusa-supported runtime in Phase 0) |

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
| Git | **Not a git repository yet** |

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
- Functional suite: **13/13 passing**.
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
- The current app is the design reference. Do not delete it until the replacement reaches parity; after git is initialized it will also live in history.

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

### 2.2 Recommended defaults — confirm during Phase 0

| Decision | Recommendation | Why |
| --- | --- | --- |
| Frontend | **Next.js App Router + TypeScript**, keep custom CSS | SSR/ISR, SEO, metadata, server cart, product pages |
| Repo layout | **pnpm workspace**: `apps/storefront`, `apps/medusa`, `legacy/` | One CI and one place for docs; current app preserved |
| CMS | **Sanity** for projects, journal, materials editorial, homepage modules | Commerce stays in Medusa; editors get a real CMS |
| Search | **Meilisearch** | Typo tolerance, synonyms, instant search, easy indexing |
| Reviews | **Custom Medusa module** tied to orders | Verified reviews, commission reviews, full design control |
| 3D | Keep Three.js hero; **GLB + `<model-viewer>`** for product AR; custom viewer for finish switching | Best balance of quality, AR support, and control |
| Hosting | Vercel (storefront), Railway/Fly/Render (Medusa), Neon (Postgres), Upstash (Redis), Cloudflare R2, Meilisearch Cloud, Sanity, Resend, Stripe | Managed, low-ops, scales with a small studio |
| Analytics | **PostHog** with consent; GA4 optional | Funnels, session replay, experiments |
| Currency/markets | USD + English at launch; structure for regions | Avoid multi-currency complexity before launch |
| Payments | Stripe via Medusa payment provider | Deposits, balances, webhooks, PCI compliance |
| Portrait deposit | 30% at booking | Standard for commissioned work; confirm |
| Custom quote deposit | 50% at acceptance | Confirm |
| Catalogue | Seed the current 14, structure for 40–60, fix misleading counts immediately | Honest content now, room to grow |
| Launch markets | US, UK, EU; DDP where practical | Confirm with shipping provider |

### 2.3 Explicitly out of scope for launch

- AR is desirable but can follow the commerce spine.
- Trade/wholesale portal, net terms, and volume accounts.
- Multi-currency and multi-language.
- Loyalty, referrals, gift cards.
- AI-generated portrait likenesses. The commission flow should be honest about artist-led sculpting unless a vetted 3D-scan/AI pipeline is added later.
- Full ERP integration. Medusa Admin plus focused widgets is enough.

---

## 3. Open decisions

| # | Decision | Why it matters | Default if no answer | Status |
| --- | --- | --- | --- | --- |
| 1 | **Catalogue depth:** expand to 40–60 products or consolidate to a truthful 14? | Determines category pages, seed data, merchandising, and copy | Seed 14 now; design for 40+; fix “86+” claims immediately | Open |
| 2 | **Portrait pricing:** sizes, finishes, plinth options, lead time, deposit | Needed for configurator, checkout, and copy | 18/24/30 cm; from $189; 3–5 weeks; 30% deposit | Open |
| 3 | **Custom quote rules:** processes, materials, max build volume, formats, pricing formula, turnaround | Needed for quote module and pricing engine | FDM/SLA/SLS; STL/OBJ/3MF instant; STEP manual review; 3–5 days for complex | Open |
| 4 | **Shipping/returns/tax:** regions, DDP/DDU, returns policy | Checkout and legal copy | US/UK/EU; DDP where possible; 30-day returns on stock; custom non-returnable after proof approval | Open |
| 5 | **CMS:** Sanity vs Payload vs MDX | Content workflow and deployment | Sanity; MDX only if launch speed matters more than editor workflow | Open |
| 6 | **Reviews:** custom vs third-party | Verification, moderation, commission reviews | Custom Medusa module | Open |
| 7 | **Photography:** CGI-only or real studio/people/product shoot? | The biggest remaining trust gap | Keep CGI for launch; commission real photos for About/studio/portrait before launch | Open |
| 8 | **Infrastructure/accounts:** managed services vs self-host | Cost, ops, deployment | Managed services listed in 2.2 | Open |
| 9 | **Legal/entity/address:** business name, address, policies, contact email | Required for policies, emails, local SEO | Treat the current address and `studio@forma.example` as placeholders; replace with verified details before launch | Open |
| 10 | **Trade/wholesale at launch?** | Adds account and pricing complexity | No; phase 7 | Open |
| 11 | **Multi-currency/language at launch?** | Region and content complexity | No; USD/English | Open |
| 12 | **Domain, email, and social handles** | Launch requirement | TBD | Open |

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
| Markets | Regions + currencies | USD launch; structure for UK/EU |
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

#### Capacity / booking (optional, phase 3)

Made-to-order capacity is operational capacity, not sellable inventory. Prefer a small `capacity` module keyed by service and booking period with reserved/booked counts and expiry-aware reservations if launch messaging requires a real booking limit. Do not use inventory as monthly slots or expose “remaining slots” unless the reservation workflow is authoritative. Decide during Phase 3; the storefront needs one source for “now booking” messaging.

### 5.4 Content model (CMS)

Keep commerce in Medusa and long-form content in the CMS (Sanity by default).

| Content type | Fields |
| --- | --- |
| **Homepage** | Hero slides (eyebrow, title, copy, CTAs, media/product refs), featured collection, selected products, selected projects, review refs, announcement |
| **Project** | Title, slug, client, location, year, services, products used, cover, gallery, brief, challenge, process, result, client quote, SEO |
| **Journal post** | Title, slug, excerpt, cover, portable-text body, author, categories, related products, SEO |
| **Material** | Name, slug, processes, properties, colours, care, image, description, compatible products, SEO |
| **About/studio** | Story, team, machines, values, gallery, press, SEO |
| **Testimonial** | Quote, name, context, product/service, permission, image (optional) |

References use Medusa product handles or IDs, never duplicated product data. If Sanity is not ready, use MDX/local content for launch and migrate later.

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
- Portrait commissions: proposed 30% deposit and balance before shipping; confirm the commercial terms and model each charge with Medusa's Payment Module/provider. Keep commission production status separate from payment status.
- Custom quotes: proposed 50% deposit or full payment at acceptance; confirm. Lock quote revision and amount server-side before cart conversion, then let Medusa recalculate tax, discounts, shipping, and totals.
- Never treat a browser redirect as proof of payment; transition paid states only from verified Medusa/provider events.
- Ready-to-ship: track inventory and decrement through Medusa order workflows.
- Made-to-order: allow backorder only where configured, show production lead time, and track capacity separately.
- Shipping: flat/calculated options per region; keep production lead time separate from carrier transit time; store tracking through the appropriate fulfillment/provider flow.
- Tax: configure regions; use Stripe Tax or a Medusa tax provider. Confirm DDP/DDU.
- Refunds/returns: standard stock returns; custom/commission terms after proof approval (confirm).
- Emails: order confirmation, commission stages, quote ready, proof ready, shipped, review request; dispatch through idempotent workflow/subscriber handling.

---

## 6. Frontend architecture

### 6.1 Next.js App Router

- Migrate from the Vite SPA to a separately deployed **Next.js App Router + TypeScript** storefront. Pin compatible, supported Next.js, React, `@medusajs/js-sdk`, and `@medusajs/types` versions in the lockfile; do not use floating `latest` dependencies in production.
- Keep pages/layouts as Server Components by default. Fetch public catalogue, category, product, collection, and CMS data on the server through a server-only Medusa SDK instance; render project/editorial pages on the server as appropriate. Use Client Components only for browser state, event handlers, browser APIs, WebGL, and genuinely interactive query surfaces. ([Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components))
- Do not use the legacy `medusa-react` package or the v1 JS client. Medusa v2 no longer supports Medusa React; use `@medusajs/js-sdk` and TanStack Query (or an equivalent current query library) only where client-side cache/interaction is needed. ([Medusa v1-to-v2 changes](https://docs.medusajs.com/learn/introduction/from-v1-to-v2), [Medusa JS SDK](https://docs.medusajs.com/resources/js-sdk))
- Create separate server and browser SDK configurations. The publishable API key and public backend URL may be exposed to the browser; admin tokens, secret API keys, R2 credentials, revalidation secrets, and private customer data must remain server-only. Never call Medusa Admin APIs from storefront browser code.
- Scope every Store API request with the publishable API key and intended sales channel. Use narrowly selected fields and validate custom linked data before returning it. ([Publishable API Keys](https://docs.medusajs.com/resources/storefront-development/publishable-api-keys))
- Make caching explicit for each data class: public product/editorial reads may use deliberate Next.js cache/revalidation policy and SDK `next.tags`; cart, customer, quote, commission, pricing, inventory-sensitive checkout, and private asset responses are request-scoped/no-store. Invalidate tags from authenticated Medusa/CMS webhooks only after verifying signatures and replay protection. Do not assume framework default caching semantics across Next.js releases. ([Medusa SDK caching](https://docs.medusajs.com/resources/js-sdk), [Next.js revalidation](https://nextjs.org/docs/app/getting-started/revalidating))
- Use the Next.js Metadata API for titles, descriptions, canonical URLs, Open Graph, sitemap, and robots.
- Keep custom CSS/design tokens; no requirement to adopt Tailwind. Use `next/font/local` for existing fonts.
- Wrap WebGL in client boundaries and dynamic imports; do not server-render a WebGL canvas.
- Deploy the storefront, Medusa API/workers, database, Redis, and storage as separate runtime services with explicit network boundaries. **Medusa Admin is a Vite single-page dashboard, not a Next.js route.** The default `medusa build` places its static build in `.medusa/server/public/admin`, served by the Medusa application at `/app`; `medusa build --admin-only` builds it to `.medusa/admin` for separate static hosting. If hosted separately, configure `admin.path`/`admin.backendUrl`, CORS, and the deployed backend URL. Section 14 must describe both supported modes accurately. ([Medusa Admin](https://docs.medusajs.com/learn/fundamentals/admin), [Medusa build command](https://docs.medusajs.com/resources/medusa-cli/commands/build))

### 6.2 State and cart

- Medusa is the source of truth for cart, customer, order, quote conversion, and payment state. A client cache is only a view/optimistic layer and never an authority for price, inventory, ownership, or payment.
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

1. **Authorize and reserve:** a Next.js Route Handler or authenticated Medusa Store API route validates the session/guest token, ownership, CSRF/origin, rate limits, file count, declared format, and configured hard byte limit. Create an upload-intent record linked to Quote/Commission with an opaque server-generated key and short expiry. Never use a supplied filename as a path or key.
2. **Upload to private staging:** issue a short-lived R2 presigned `PUT` URL for one opaque object key; sign the allowed content type where supported and configure bucket CORS for the exact storefront origin and `PUT` only. Treat the URL as a bearer credential: it can be reused until expiry. Never issue `GET` or `DELETE` authority to the browser. R2 presigned URLs do not support HTML-form `POST`; use `PUT` for this flow. For a hard ingress byte ceiling, enforce streaming limits at an upload gateway; post-upload `HEAD` rejection alone does not prevent temporary storage abuse. ([Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/))
3. **Finalize and quarantine:** a server endpoint verifies the intent is live and unused, then atomically claims the intent in the database. Copy the object to a unique worker-only quarantine key, verify actual byte length, calculate a trusted checksum while streaming, and enqueue an idempotent job that reads only the quarantined copy; do not assume an R2 copy/delete sequence is an atomic rename. Declared MIME, extension, browser preview, ETag, and client checksum are hints only; inspect magic bytes and format structure. Reject mismatches. Apply per-user/IP daily quotas, object-count quotas, staging lifecycle deletion, and storage/worker cost alarms.
4. **Parse in a hostile-input sandbox:** parsing never runs in Next.js, a Medusa API process, Admin, or a shared web worker. Run one job per short-lived microVM or sandboxed runtime such as gVisor; a plain OCI container must not be the only isolation boundary for untrusted parser input. Also use a non-root UID, read-only root filesystem, drop all Linux capabilities, `no-new-privileges`, seccomp policy, bounded tmpfs, and strict CPU, memory, process-count, disk, and wall-clock limits. Deny inbound traffic and general outbound network; provide only narrowly scoped access to the one input object and a result queue. Do not mount the Docker socket, host paths, application secrets, database credentials, or broad R2 credentials. Destroy the sandbox after each job; patch and pin parser dependencies. ([gVisor isolation model](https://gvisor.dev/docs/), [Docker security options](https://docs.docker.com/reference/cli/docker/container/run), [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints))
5. **Format-specific limits:** allow only STL, OBJ, and 3MF by explicit allowlist; reject archives other than 3MF. Enforce configurable maximum compressed/input bytes, expanded 3MF bytes, archive entry count, compression ratio, path depth, vertices/faces/triangles, coordinate magnitude, and parse time before full allocation. Reject path traversal, symlinks, duplicate/ambiguous archive paths, encrypted entries, unsupported compression, XML DTD/external entities, external OBJ/MTL/texture references, non-finite coordinates, excessive mesh complexity, and geometry outside supported build volumes. Never invoke shell commands, execute file content, load plugins/macros, or fetch remote references. Malware scanning may supplement validation but does not make a geometry parser safe. ([OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html))
6. **Validate result and price:** the worker emits a small versioned JSON result, never a path or executable artifact. The Medusa workflow validates schema, numeric ranges, units, parser version, and job/intent ownership before storing the analysis. The pricing engine independently calculates an estimate from accepted values and versioned rules; fail closed or route unsupported, ambiguous, non-manifold, or over-limit files to manual review.
7. **Serve, retain, and delete:** keep source files private throughout; staff/customer downloads use short-lived authorization-scoped GET links. Set separate retention periods for rejected files, source models, portrait photos, and proofs; provide deletion/anonymization jobs, audit access, and ensure backups/lifecycle rules match the policy. Never use customer photos or models for marketing without separate explicit consent.

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
| **Cloudflare R2 / S3** | Product images, GLB, customer uploads | `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_PUBLIC_URL` | 1 |
| **Resend** | Transactional email, stage notifications | `RESEND_API_KEY`, `RESEND_FROM` | 1/3 |
| **Meilisearch** | Product/category/project search | `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY` | 2 |
| **Sanity** | Projects, journal, materials, homepage | `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN` | 5 |
| **PostHog** | Product analytics, funnels, experiments | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | 6 |
| **Sentry** | Error monitoring | `SENTRY_DSN` | 6 |
| **Vercel** | Storefront hosting | — | 6 |
| **Railway/Fly/Render** | Medusa hosting | — | 6 |
| **Stripe CLI** | Local webhook testing | — | 1 |

Storefront secrets (examples):

```env
NEXT_PUBLIC_MEDUSA_URL=
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
REVALIDATE_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
SANITY_PROJECT_ID=
SANITY_DATASET=
SANITY_API_TOKEN=
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
- Enable R2 versioning/lifecycle rules for uploads; back up Postgres and document restore.
- Dependency updates and secret rotation.
- No customer photos in marketing without explicit consent.

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
- Quote parser load and resource-exhaustion tests: malformed files, decompression bombs, parser timeouts, memory/CPU/file-count caps, no-network/no-host-access sandbox policy, and cleanup after worker failure.
- Stripe webhook tests with Stripe CLI.

### 8.6 Observability

- Sentry for storefront and Medusa errors.
- Structured logs for uploads, quotes, commissions, payments.
- Uptime monitoring for storefront, Medusa, Postgres.
- Alerting for failed payments, webhook failures, quote parser errors, and email failures.
- Analytics dashboards for funnel and conversion.
- Backups and documented restore process.

---

## 9. Roadmap

### 9.1 Phase status

| Phase | Name | Status | Est. effort |
| --- | --- | --- | --- |
| 0 | Foundation & decisions | **Planning complete — architecture and roadmap specified** | 0.5–1 day |
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
- [ ] Review Section 3 with the user and record decisions.
- [x] Initialize git; the repository has initial commit 4a658c6.
- [ ] Add `.gitignore` and create a baseline tag for the current static site before restructuring; no tag exists yet.
- [x] Create `AGENTS.md` pointing to this plan (done during planning).
- [ ] Create a `migration/medusa` branch for the rebuild; merge in phase-sized increments.
- [ ] Create pnpm workspace: `apps/storefront`, `apps/medusa`, `apps/private-media-worker`, `packages/contracts`, and `legacy/`.
- [ ] Create `packages/contracts` as workspace package `@forma/contracts`; build strict TypeScript/Zod contracts to `dist/` and export `./product`, `./commission`, `./quote`, and `./mesh-analysis` for both apps.
- [ ] Move the current Vite app to `legacy/` (or preserve it in git history and keep a reference copy).
- [ ] Scaffold Medusa v2 and Next.js apps; pin exact versions; document them.
- [ ] Add `.env.example` for both apps and a root README.
- [ ] Add CI: install, lint, typecheck, build, tests.
- [ ] Create accounts/projects (user-assisted): Neon, Upstash, R2, Stripe test, Resend, Meilisearch, Sanity, Vercel, Railway/Fly.
- [ ] Document the visual baseline and screenshot references.
- [ ] Update the current-focus block.

**Done when:** the workspace installs and builds; the legacy site is recoverable; apps start; env docs exist; CI is green; decisions are recorded.

### 9.4 Phase 1 — Medusa foundation

- [ ] **Pin runtime and dependencies.** Set the root Node version to one supported by the exact pinned Medusa CLI/framework release; the current CLI docs require Node 22.22.0 or later. Record Node, pnpm, Medusa, Next.js, and React versions in the root README and lockfile. Do not use floating latest versions. Use monorepo paths apps/medusa, apps/storefront, packages/contracts, and preserve the existing app in legacy/.
- [ ] **Install backend packages in apps/medusa/package.json.** Runtime: @medusajs/medusa, @medusajs/framework, @medusajs/cli, zod (or @medusajs/framework/zod inside Medusa code), @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, and resend. Keep Medusa packages on one pinned release. Use @medusajs/medusa/core-flows for commerce workflows; do not write commerce tables or duplicate core services.
- [ ] **Configure apps/medusa/medusa-config.ts.** Read database, Redis, JWT, cookie, CORS, Stripe, public R2, and Resend configuration only from process.env; validate required production variables at boot and fail startup when missing. Configure PostgreSQL with projectConfig.databaseUrl, STORE_CORS, ADMIN_CORS, AUTH_CORS, JWT_SECRET, and COOKIE_SECRET. Register Redis Workflow Engine from @medusajs/medusa/workflow-engine-redis with redis.redisUrl from REDIS_URL; do not use deprecated url configuration.
- [ ] **Create apps/medusa/.env.example and apps/medusa/README.md.** Document DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET, STORE_CORS, ADMIN_CORS, AUTH_CORS, STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION=auto, S3_PUBLIC_URL, RESEND_API_KEY, and RESEND_FROM. Use dummy values only. Keep private-upload bucket credentials separate from public product-asset storage. Never commit populated environment files.
- [ ] **Configure the public file provider.** Register @medusajs/medusa/file and @medusajs/medusa/file-s3 in apps/medusa/medusa-config.ts. Map file_url, access_key_id, secret_access_key, bucket, region: "auto", and R2 endpoint from environment variables. This provider serves public catalogue images and GLBs only. Customer uploads use a separate private R2 bucket and never receive a public URL.
- [ ] **Configure Stripe in Medusa.** Register @medusajs/medusa/payment-stripe under @medusajs/medusa/payment with apiKey and webhook secret from environment. Preserve Medusa's native /hooks/payment/stripe_stripe route; do not add a second Stripe webhook endpoint or persist card data. Enable Stripe only for the configured USD region.
- [ ] **Seed the initial commerce configuration in apps/medusa/src/scripts/seed.ts.** Idempotently create/retrieve one launch region with currency usd, English defaults, and the storefront sales channel. Add only tax and shipping providers/options approved in Section 3. Do not silently enable US/UK/EU markets, tax collection, DDP, return promises, or shipping rates while decisions remain open.
- [ ] **Provision the first Admin user.** Run pnpm --dir apps/medusa exec medusa user --email <operator-email> --invite, or use --password only through a secure terminal that does not record the secret. Verify login at the configured Admin URL. Use least privilege supported by the pinned release and document provisioning/offboarding in apps/medusa/README.md.
- [ ] **Keep Medusa Admin as a Vite SPA.** Put custom routes/widgets in apps/medusa/src/admin/ and use @medusajs/admin-sdk (defineRouteConfig) and @medusajs/ui. Normal backend build serves the SPA at /app from .medusa/server/public/admin. For separate static deployment configure admin.path and admin.backendUrl in medusa-config.ts, run pnpm --dir apps/medusa exec medusa build --admin-only, and deploy .medusa/admin with an SPA fallback. Do not implement Admin as a Next.js route. ([Admin](https://docs.medusajs.com/learn/fundamentals/admin), [build](https://docs.medusajs.com/resources/medusa-cli/commands/build))
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
- [ ] **Add verification scripts.** Put apps/medusa/src/scripts/verify-catalog.ts and verify-payment-provider.ts in place. Use Medusa Query/SDK APIs, not direct SQL. Verify region currency, publishable-key sales-channel association, seeded counts, prices, inventory policy, image URLs, and Stripe provider availability.
- [ ] **Exercise normal Stripe test checkout.** Create a cart, add a seeded variant, set address and an approved shipping option, create a payment collection/session through Store API or native workflow, complete through Medusa, and verify Order/Payment Module records. Verify the signed Stripe webhook updates payment state. Never mark an order paid from browser state.
- [ ] **Run migration commands from apps/medusa.** Generate module migrations after DML changes with pnpm exec medusa db:generate <module-name>, then apply pnpm exec medusa db:migrate. After link changes run pnpm exec medusa db:migrate or pnpm exec medusa db:sync-links. Record commands in apps/medusa/README.md. ([DML](https://docs.medusajs.com/learn/fundamentals/data-models), [S3 provider](https://docs.medusajs.com/resources/infrastructure-modules/file/s3), [Stripe provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe))

**Done when:** Medusa Admin can manage the catalogue; the storefront can fetch products/categories/collections; images are served from R2; a test order completes in Stripe test mode.

### 9.5 Phase 2 — Next.js storefront spine

- [ ] **Create apps/storefront.** Use Next.js App Router, strict TypeScript, and React compatible with the pinned Next.js/Medusa SDK. Add @medusajs/js-sdk, @medusajs/types, @tanstack/react-query v5, zod, @stripe/stripe-js, @stripe/react-stripe-js, @google/model-viewer, three, lucide-react, and meilisearch only where used. Keep package.json, next.config.ts, tsconfig.json, eslint.config.mjs, and .env.example inside apps/storefront/.
- [ ] **Use this App Router structure.** apps/storefront/src/app/layout.tsx owns fonts, global CSS, metadata defaults, and providers; app/(store)/layout.tsx owns announcement/header/footer; app/(store)/page.tsx is home. Add pages at (store)/shop/page.tsx, (store)/shop/[category]/page.tsx, (store)/shop/[category]/[subcategory]/page.tsx, (store)/products/[handle]/page.tsx, (store)/collections/[slug]/page.tsx, (store)/search/page.tsx, (store)/portrait-studio/page.tsx, (store)/custom-printing/page.tsx, (store)/projects/page.tsx, (store)/projects/[slug]/page.tsx, (store)/materials/page.tsx, (store)/reviews/page.tsx, (store)/cart/page.tsx, (store)/checkout/page.tsx, and (store)/account/.... Add app/sitemap.ts, app/robots.ts, app/not-found.tsx, and app/error.tsx.
- [ ] **Create the shared presentation tree.** Put components in apps/storefront/src/components/: site/announcement-bar.tsx, site/header.tsx, site/mega-menu.tsx, site/mobile-menu.tsx, site/footer.tsx, home/hero-slider.tsx, home/discipline-index.tsx, product/product-gallery.tsx, product/product-3d-viewer.tsx, cart/cart-drawer.tsx, checkout/checkout-form.tsx, and ui/. Put tokens and ported CSS in src/styles/tokens.css and src/styles/globals.css. Preserve premium spacing, rounded surfaces, subtle glass/light, white space, and reduced-motion behavior; do not replace the brand system with a generic UI kit.
- [ ] **Create the Medusa SDK boundary.** Add apps/storefront/src/lib/medusa/sdk.server.ts with server-only and @medusajs/js-sdk, initialized from MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY. Add sdk.browser.ts with only NEXT_PUBLIC_MEDUSA_URL and NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY. Never import the server SDK into a Client Component. Never expose Admin API keys, Stripe secret keys, R2 credentials, or customer session secrets through NEXT_PUBLIC_*. Add src/lib/medusa/queries/ and mappers/ for narrow reads and DTO mapping. Validate metadata.forma with ProductMetaV1Schema before rendering.
- [ ] **Fetch public SEO data in Server Components.** Product, category, collection, and region reads execute on the server with @medusajs/js-sdk and request only fields used by the page. Set explicit Next cache/revalidation tags for public catalog data; invalidate only from signature-verified webhooks. Use no-store for cart, customer, stock-sensitive checkout, quotes, commissions, pricing, and private assets. Do not make SEO routes into client-fetch shells.
- [ ] **Use Client Components only at interaction boundaries.** Add "use client" only for event handlers, browser APIs, TanStack Query, WebGL, Stripe Elements, or local state. Create apps/storefront/src/components/providers/query-provider.tsx with one browser QueryClient and stable query keys. Use TanStack Query v5 for typeahead, filter updates, upload progress, and optimistic cart controls; reconcile all mutations with server responses. Do not install/import medusa-react, @medusajs/medusa-react, the v1 JS client, or replace Server Component reads with client fetching. ([SDK](https://docs.medusajs.com/resources/js-sdk), [v1-to-v2 changes](https://docs.medusajs.com/learn/introduction/from-v1-to-v2), [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components))
- [ ] **Create the cart data-access layer.** Store the opaque Medusa cart ID in a Secure, HttpOnly, SameSite=Lax cookie scoped to the storefront. Implement server-only src/lib/cart/get-cart.ts, create-cart.ts, mutate-cart.ts, and cookie.ts. Before every mutation, load the cart and verify region, sales channel, owner/customer association, line-item eligibility, and server totals. Never trust client prices, discounts, inventory, quote IDs, commission IDs, or ownership.
- [ ] **Implement UI-to-backend mutation boundaries.** Add Server Actions in apps/storefront/src/app/(store)/actions/ for same-origin cart/account forms. Add Route Handlers in apps/storefront/src/app/api/ only for streaming uploads, explicit HTTP APIs, signed revalidation webhooks, and callbacks. Every handler parses a strict Zod schema, authenticates, authorizes ownership, checks origin/CSRF, rate-limits, uses idempotency for create/charge actions, and returns a minimal DTO. Private Medusa calls run in the server data-access layer; never call Admin APIs from browser code. Treat every Server Action as a public POST endpoint. ([Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data), [data security](https://nextjs.org/docs/app/guides/data-security))
- [ ] **Build site navigation.** Implement announcement bar, desktop mega menu, mobile accordion, search overlay, account/bag controls, and footer. Mega-menu links derive from Medusa's ten categories and point to real category/collection routes. Implement keyboard disclosure semantics, Escape, focus return, active route state, and touch-sized targets.
- [ ] **Build the home page from real records.** Implement three hero slides with personalized busts first, curated objects second, custom printing third. Each slide has one primary CTA, keyboard controls, persistent pause control, and disables rotation for reduced motion. Follow Section 4 ordering: hero, trust strip, portrait, studio picks/ready to ship, ten disciplines, custom printing, selected projects, materials/reviews, newsletter/footer. Show only genuine products/projects/reviews; use the designed empty review state until real reviews exist.
- [ ] **Build catalog pages.** /shop uses server-rendered search/filter/sort/pagination with URL query parameters as canonical state. Category/subcategory pages resolve Medusa handles and unique copy; suppress a leaf page unless it has at least three real products and distinct content. Product pages resolve by handle and show variants, price, availability/lead time, gallery, related products, real reviews or empty state, and optional GLB/AR poster.
- [ ] **Build server-only Meilisearch integration.** Create src/lib/search/meilisearch.server.ts; only server code reads MEILISEARCH_API_KEY. Index published products/categories and later CMS projects through a controlled sync job. Search overlay calls a same-origin Route Handler with bounded Zod query/page-size fields and receives a minimal result DTO. Never index private quotes or commissions.
- [ ] **Implement Medusa cart and checkout.** Cart drawer/page reads server cart state. Checkout order: validate cart → collect address → fetch available shipping options → select option → refresh cart/tax/total → create/reuse Payment Collection → initialize Stripe Payment Session through Medusa → render @stripe/react-stripe-js with only Medusa session client data → complete cart through Medusa. Handle 3DS/additional action, pending authorization, and payment failure. Never call Stripe secret APIs from the storefront.
- [ ] **Implement order confirmation and account basics.** Use Medusa customer auth/session APIs through server SDK and secure cookies. Add order list/detail pages with ownership-scoped queries. Return the same neutral not-found response for an unknown ID and another customer's ID. Do not put auth tokens in localStorage.
- [ ] **Add loading/error states.** Add route loading.tsx/error.tsx, skeletons, empty cart/search, unavailable variant, stale quote, payment recovery, 404, and 500. Keep errors free of SQL, provider, storage, and stack details.
- [ ] **Add SEO metadata.** Use Next Metadata API per public page; canonical URLs for products/categories/collections/projects; sitemap.ts from published content; robots.ts noindex for search/cart/checkout/account; JSON-LD only for real Organization/Product/Offer/Review/Breadcrumb records. Never output fabricated rating aggregates or inventory counts.
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
export type CreateCommissionInput = z.infer<typeof CreateCommissionInputSchema>
~~~

**DML field and relationship contract for apps/medusa/src/modules/commissions/models/:**

~~~ts
import { model } from "@medusajs/framework/utils"
import { COMMISSION_STATUSES } from "@forma/contracts/commission"

export const Commission = model.define("commission", {
  id: model.id().primaryKey(),
  status: model.enum(COMMISSION_STATUSES),
  subject_type: model.text(),
  style_key: model.text(),
  size_key: model.text(),
  finish_key: model.text(),
  plinth_key: model.text().nullable(),
  gift_note: model.text().nullable(),
  requested_deadline: model.dateTime().nullable(),
  assigned_user_id: model.text().nullable(),
  current_revision: model.number(),
  pricing_version: model.text().nullable(),
  currency_code: model.text().nullable(),
  total_minor: model.number().nullable(),
  deposit_minor: model.number().nullable(),
  balance_minor: model.number().nullable(),
  retention_deadline: model.dateTime().nullable(),
  metadata: model.json().nullable(),
  assets: model.hasMany(() => CommissionAsset, { mappedBy: "commission" }),
  events: model.hasMany(() => CommissionEvent, { mappedBy: "commission" }),
  charges: model.hasMany(() => CommissionCharge, { mappedBy: "commission" }),
})

export const CommissionAsset = model.define("commission_asset", {
  id: model.id().primaryKey(),
  role: model.enum(["source_photo", "proof", "final"]),
  object_key: model.text().unique(),
  display_filename: model.text(),
  content_type: model.text(),
  byte_size: model.number(),
  sha256: model.text(),
  state: model.enum(["intent", "uploaded", "quarantined", "available", "rejected", "deleted"]),
  virus_scan_state: model.enum(["pending", "clean", "infected", "error"]),
  virus_scanner_version: model.text().nullable(),
  virus_scan_completed_at: model.dateTime().nullable(),
  consent_version: model.text().nullable(),
  consent_at: model.dateTime().nullable(),
  retention_deadline: model.dateTime().nullable(),
  commission: model.belongsTo(() => Commission, { mappedBy: "assets" }),
})

export const CommissionEvent = model.define("commission_event", {
  id: model.id().primaryKey(),
  event_type: model.text(),
  from_status: model.text().nullable(),
  to_status: model.text().nullable(),
  actor_type: model.enum(["customer", "user", "system"]),
  actor_id: model.text().nullable(),
  public_message: model.text().nullable(),
  private_note: model.text().nullable(),
  revision: model.number(),
  commission: model.belongsTo(() => Commission, { mappedBy: "events" }),
})

export const CommissionCharge = model.define("commission_charge", {
  id: model.id().primaryKey(),
  purpose: model.enum(["deposit", "balance"]),
  amount_minor: model.number(),
  currency_code: model.text(),
  pricing_version: model.text(),
  pricing_snapshot: model.json(),
  commission: model.belongsTo(() => Commission, { mappedBy: "charges" }),
})
~~~

- [ ] **Create contracts in packages/contracts/src/commission.ts.** Export COMMISSION_STATUSES as the exact tuple ["brief_received","review","quote_sent","deposit_pending","sculpting","proof_sent","changes_requested","approved","printing","finishing","balance_pending","shipped","cancelled"] as const, CommissionStatus, CreateCommissionInputSchema, CommissionAssetRoleSchema, CommissionStatusTransitionSchema, and response DTO schemas. Public create input contains subject_type, controlled style_key, size_key, finish_key, optional plinth_key, gift_note (max 500 chars), optional ISO requested_deadline, and source_photo_consent with accepted: true and current consent_version. Derive customer ID from authenticated Medusa request context; reject customer_id, status, price, deposit, balance, object key, and payment state from the browser. MVP requires a signed-in customer before brief creation/upload. Guest access requires a separately designed expiring high-entropy capability-token contract and security review.
- [ ] **Create module files.** Use apps/medusa/src/modules/commissions/index.ts, service.ts, models/commission.ts, models/commission-asset.ts, models/commission-event.ts, and models/commission-charge.ts. Export COMMISSIONS_MODULE = "commissions" and register Module(COMMISSIONS_MODULE, { service: CommissionsModuleService }). Extend MedusaService({ Commission, CommissionAsset, CommissionEvent, CommissionCharge }). This service persists only these custom models; it never accesses Customer, Cart, Order, Payment, or File tables directly. ([Medusa modules](https://docs.medusajs.com/learn/fundamentals/modules))
- [ ] **Define the Medusa v2 DML models.** Use model.define, model.id().primaryKey(), model.text(), model.number(), model.boolean(), model.enum(...), model.dateTime(), and model.json() from @medusajs/framework/utils; timestamps are automatic. Commission fields: id, status enum above, subject_type, style_key, size_key, finish_key, nullable plinth_key, nullable gift_note, nullable requested_deadline, nullable assigned_user_id (scalar because Medusa User is another module), current_revision integer, pricing_version, currency_code, nullable integer total_minor/deposit_minor/balance_minor, nullable retention_deadline, metadata only for non-sensitive extensibility, and same-module assets/events/charges hasMany relations. CommissionAsset: id, role enum ["source_photo","proof","final"], unique opaque object_key, sanitized display_filename, content_type, byte_size integer, sha256, state enum ["intent","uploaded","quarantined","available","rejected","deleted"], consent_version, consent_at, retention_deadline, belongsTo commission. CommissionEvent: id, event_type, from_status, to_status, actor_type enum ["customer","user","system"], actor_id, nullable bounded public_message/private_note, revision, belongsTo commission. CommissionCharge: id, purpose enum ["deposit","balance"], positive integer amount_minor, currency_code, pricing_version, Zod-validated pricing_snapshot JSON, belongsTo commission. Do not duplicate payment-provider status/credentials. Define strict Zod contracts for every persisted JSON shape.
- [ ] **Use same-module relationships and cross-module Module Links.** Commission↔asset/event/charge uses DML hasMany/belongsTo, never Module Links. Add apps/medusa/src/links/commission-customer.ts, commission-cart.ts, commission-order.ts, and commission-charge-order.ts using defineLink and each module's linkable export. Associate custom records to native Customer/Cart/Order records; cardinality: many commissions per customer, one active cart per charge, and multiple charge orders per commission. Links store cross-module IDs, not foreign keys. Validate owner/link on every workflow. Use current Module Link/Link APIs; do not hand-write link rows. Run pnpm medusa db:migrate after link definitions. ([Module Links](https://docs.medusajs.com/learn/fundamentals/module-links))
- [ ] **Implement workflows in apps/medusa/src/workflows/commissions/.** Files: create-commission.ts, create-upload-intent.ts, finalize-upload.ts, transition-commission.ts, send-deposit-checkout.ts, record-payment-captured.ts, create-proof-revision.ts, approve-proof.ts, request-proof-changes.ts, create-balance-checkout.ts, cancel-commission.ts, delete-expired-assets.ts. Use createWorkflow/createStep/StepResponse/WorkflowResponse and compensation handlers from @medusajs/framework/workflows-sdk. create-commission.ts sets status=brief_received and current_revision=1 server-side. Workflow inputs are strict schemas. API routes never orchestrate multiple modules by directly calling service methods.
- [ ] **Enforce the production state machine.** Allowed transitions: brief_received → review|cancelled; review → quote_sent|cancelled; quote_sent → deposit_pending|review|cancelled; deposit_pending → sculpting|cancelled; sculpting → proof_sent|cancelled; proof_sent → changes_requested|approved; changes_requested → sculpting|cancelled; approved → printing; printing → finishing; finishing → balance_pending|shipped; balance_pending → shipped. shipped/cancelled are terminal. Re-read current state, require actor/role, use optimistic revision checks, append CommissionEvent, and reject browser status changes. Customer can approve/request changes only on the latest proof revision; staff-only stages require Admin authentication.
- [ ] **Use the private image pipeline from Section 6.4.** Create separate private R2 staging and quarantine buckets using R2_PRIVATE_ENDPOINT, R2_UPLOAD_STAGING_BUCKET, R2_UPLOAD_QUARANTINE_BUCKET, R2_UPLOAD_ACCESS_KEY_ID, R2_UPLOAD_SECRET_ACCESS_KEY, R2_WORKER_ACCESS_KEY_ID, R2_WORKER_SECRET_ACCESS_KEY, and UPLOAD_INTENT_SECRET in backend/worker secret stores only. Medusa signs a single short-lived PUT to staging; the worker supervisor reads quarantine only; the sandbox receives no credentials. Commission upload-intent workflows accept JPEG/PNG/WebP source photos/proofs, enforce Phase 3 byte/pixel caps, run ClamAV scan, decode/re-encode previews with sharp in the isolated image process, strip EXIF/GPS, and store source/preview under different private opaque R2 keys. Never place photos in the public product bucket, Next public directory, CMS, email, or analytics. Store only key/hash/byte count/consent/lifecycle fields in CommissionAsset.
- [ ] **Create Store API routes in apps/medusa/src/api/store/custom/commissions/.** route.ts POST creates brief; [id]/route.ts GET returns only owner's safe DTO; [id]/assets/upload-intents/route.ts POST creates intent; [id]/assets/[asset_id]/finalize/route.ts POST finalizes upload; [id]/proof/approval/route.ts POST approves a specified revision; [id]/proof/changes/route.ts POST requests changes with bounded text; [id]/checkout/deposit/route.ts POST creates deposit checkout; [id]/checkout/balance/route.ts POST creates balance checkout. Put request/response Zod schemas in validators.ts.
- [ ] **Protect routes in apps/medusa/src/api/middlewares.ts.** Use authenticate("customer", ["session","bearer"]) for customer routes and authenticate("user", ["session","bearer","api-key"]) for Admin routes, matching the pinned Medusa version. Explicitly protect every /store/custom/commissions/** route, then compare req.auth_context.actor_id with the Customer Module Link in the workflow. Require publishable-key scoping, origin/CSRF checks, request-size limits, per-customer/IP rate limits, and idempotency keys for create/upload/checkout. Never authorize by email alone. ([Protected routes](https://docs.medusajs.com/learn/fundamentals/api-routes/protected-routes))
- [ ] **Build customer pages and components.** Add apps/storefront/src/app/(store)/portrait-studio/page.tsx, apps/storefront/src/app/(store)/portrait-studio/gallery/page.tsx, apps/storefront/src/app/(store)/portrait-studio/start/page.tsx, apps/storefront/src/app/(store)/account/commissions/page.tsx, and apps/storefront/src/app/(store)/account/commissions/[id]/page.tsx. Add apps/storefront/src/components/portrait/commission-form.tsx, photo-uploader.tsx, commission-timeline.tsx, proof-viewer.tsx, proof-actions.tsx, and commission-summary.tsx. Use Server Components for landing/gallery/account reads and narrow Client Components for upload/progress/proof actions. Explain that an artist sculpts the likeness from reference photos; do not imply AI generation.
- [ ] **Implement deposit and balance using normal Medusa commerce.** Store approved total/deposit/balance as integer minor units and immutable versioned pricing snapshot on Commission. A server workflow calculates each charge, creates a cart, adds a dedicated non-merchandised commission-charge variant at the server-computed amount using Medusa's custom line-item pricing workflow, links CommissionCharge to Cart, and uses normal Payment Collection, Stripe Payment Session, and cart completion. Create a separate balance charge/cart/order after finishing. Do not reuse a months-old Stripe authorization, call Stripe Payment Intents directly, or mark Commission paid from a browser redirect. Configure capture behavior according to approved payment policy. A payment.captured subscriber re-reads Payment/Order via Query, matches CommissionCharge link, and idempotently appends the event/advances production state. ([Custom item pricing](https://docs.medusajs.com/resources/examples/guides/custom-item-price), [payment events](https://docs.medusajs.com/resources/references/payment/events), [payment flow](https://docs.medusajs.com/resources/commerce-modules/payment/payment-flow))
- [ ] **Build the Admin commission board as an Admin extension.** Add apps/medusa/src/admin/routes/commissions/page.tsx and routes/commissions/[id]/page.tsx; optional widgets go in apps/medusa/src/admin/widgets/. Use @medusajs/admin-sdk and @medusajs/ui. Call protected /admin/custom/commissions APIs with Admin SDK. Provide filters by status/artist/due date; show safe photo/proof previews, revision history, assignment, due date, transition controls, price snapshot, and charge-order links. Create short-lived private GET URLs only after staff authorization; never log them.
- [ ] **Add Admin APIs under apps/medusa/src/api/admin/custom/commissions/.** Implement list/detail, assign, staff transition, send proof, set price, and create balance checkout. Require Admin auth/role, validate transition/reason, record actor ID, and execute workflows. Admin is the Vite SPA at /app by default or a separate medusa build --admin-only artifact; APIs remain on Medusa.
- [ ] **Send idempotent emails.** Add apps/medusa/src/subscribers/commission-notification.ts and templates under src/modules/resend-notification/templates/. Send only after successful workflow/event: brief received, quote ready, deposit captured, proof ready, changes requested, approval recorded, printing, shipped, balance checkout. Deduplicate by (commission_id,event_type,revision). Do not attach photos or long-lived signed URLs; link to the authenticated account.
- [ ] **Make consent/deletion operational.** Version text in apps/medusa/src/config/commission-consent.ts and store accepted version/time per source upload. Keep likeness-processing consent separate from optional marketing consent. Implement delete-expired-assets.ts as an idempotent scheduled Medusa job that deletes R2 objects, marks records deleted, preserves legally required order/accounting records, and writes access/deletion audit events. Set retention duration only after policy approval.
- [ ] **Do not fabricate capacity.** Keep now-booking copy disabled unless optional capacity/booking is implemented. If enabled, add a separate capacity model/workflow with expiring reservations and one authoritative availability read; never derive slots from inventory or a hard-coded string.
- [ ] **Instrument the portrait funnel without PII.** Emit portrait_start, portrait_photo_upload, portrait_deposit, portrait_proof_view, portrait_proof_approved, and portrait_balance_paid through consent-gated analytics. Send only allowlisted event name, anonymous session ID, non-sensitive option keys, and deduplicated order IDs after consent; never send photos, notes, keys, or signed URLs.
- [ ] **Verify lifecycle and failure recovery.** Verify idempotency, duplicate Stripe webhook delivery, upload expiry/retry, proof revision race, ownership, Admin authorization, email failure, canceled checkout, partial payment, refund, and retention deletion. Exercise brief → deposit → sculpting → proof → approval → printing/finishing → balance → shipment. Medusa Order/Payment records, not Commission flags, are payment truth.

**Done when:** a test customer can book, pay a deposit, see status, approve a proof, and receive stage emails; staff can manage the commission without a spreadsheet.

### 9.7 Phase 4 — Custom quote flow

**State machine:** draft → upload_pending|cancelled; upload_pending → quarantined|rejected|cancelled; quarantined → processing|rejected; processing → estimated|review_required|rejected; review_required → processing|sent|rejected|cancelled; estimated → sent|review_required|expired|cancelled; sent → accepted|review_required|expired|cancelled; accepted → converted|cancelled. converted, expired, cancelled, and rejected are terminal. Increment current_revision whenever model, process/material/finish selection, quantity, or price snapshot changes. Every transition appends QuoteEvent and compares expected status/revision before update.

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

export const UploadIntentSchema = z.object({
  asset_id: z.string().min(1).max(128),
  upload_url: z.string().url().refine((value) => new URL(value).protocol === "https:"),
  required_headers: z.record(z.string(), z.string()),
  max_bytes: z.number().int().positive().max(104857600),
  expires_at: z.string().datetime(),
}).strict()

export const AcceptQuoteSchema = z.object({
  accepted_revision: z.number().int().positive(),
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
  margin_bps: z.number().int().nonnegative(),
  rounding: z.literal("ceil_each_component_then_total"),
}).strict()

export const MeshAnalysisResultSchema = z.object({
  schema_version: z.literal(1),
  asset_id: z.string().min(1).max(128),
  input_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  parser_version: z.string().min(1).max(64),
  unit: z.enum(["mm", "inch", "unknown"]),
  bounds_mm: z.object({
    x: z.number().finite().positive(),
    y: z.number().finite().positive(),
    z: z.number().finite().positive(),
  }).strict(),
  volume_mm3: z.number().finite().nonnegative(),
  vertex_count: z.number().int().nonnegative(),
  triangle_count: z.number().int().nonnegative(),
  component_count: z.number().int().nonnegative(),
  watertight: z.boolean(),
  manifold: z.boolean(),
  result: z.enum(["valid", "review_required", "rejected"]),
}).strict()

export type CreateQuoteInput = z.infer<typeof CreateQuoteInputSchema>
export type MeshAnalysisResult = z.infer<typeof MeshAnalysisResultSchema>
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
  status: model.enum(QUOTE_STATUSES),
  process_key: model.text(),
  material_key: model.text(),
  finish_key: model.text(),
  quantity: model.number(),
  infill_percent: model.number().nullable(),
  layer_height_mm: model.number().nullable(),
  customer_notes: model.text().nullable(),
  current_revision: model.number(),
  currency_code: model.text().nullable(),
  total_minor: model.number().nullable(),
  pricing_version: model.text().nullable(),
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
  role: model.enum(["model"]),
  original_filename: model.text(),
  extension: model.enum(["stl", "obj", "3mf"]),
  declared_content_type: model.text(),
  byte_size: model.number(),
  sha256: model.text().nullable(),
  staging_key: model.text().unique(),
  quarantine_key: model.text().unique().nullable(),
  state: model.enum(["intent", "uploaded", "quarantined", "processing", "accepted", "rejected", "deleted"]),
  intent_expires_at: model.dateTime(),
  retention_deadline: model.dateTime().nullable(),
  attempt_count: model.number(),
  virus_scan_state: model.enum(["pending", "clean", "infected", "error"]),
  virus_scanner_version: model.text().nullable(),
  virus_scan_completed_at: model.dateTime().nullable(),
  analyses: model.hasMany(() => QuoteAnalysis, { mappedBy: "asset" }),
  quote: model.belongsTo(() => Quote, { mappedBy: "assets" }),
})

export const QuoteAnalysis = model.define("quote_analysis", {
  id: model.id().primaryKey(),
  schema_version: model.number(),
  parser_version: model.text(),
  unit: model.enum(["mm", "inch", "unknown"]),
  bounds_x_mm: model.number(),
  bounds_y_mm: model.number(),
  bounds_z_mm: model.number(),
  volume_mm3: model.number(),
  vertex_count: model.number(),
  triangle_count: model.number(),
  component_count: model.number(),
  watertight: model.boolean(),
  manifold: model.boolean(),
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
  revision: model.number(),
  reason: model.text().nullable(),
  occurred_at: model.dateTime(),
  quote: model.belongsTo(() => Quote, { mappedBy: "events" }),
})
~~~

- [ ] **Create shared contracts.** Add packages/contracts/src/quote.ts and mesh-analysis.ts. Export QUOTE_STATUSES = ["draft","upload_pending","quarantined","processing","review_required","estimated","sent","accepted","converted","expired","cancelled","rejected"] as const; QuoteStatus; strict CreateQuoteInputSchema, UploadIntentSchema, MeshAnalysisResultSchema, QuotePriceSnapshotSchema, AcceptQuoteSchema, and customer/Admin DTO schemas. CreateQuoteInputSchema accepts controlled process_key/material_key/finish_key, quantity integer 1–100, optional infill_percent and layer_height_mm, and customer_notes max 2,000 chars. Do not accept file name/MIME/size, IDs, status, geometry, price, currency, expiry, or object key as trusted values. Validate option keys against server-side versioned capabilities.
- [ ] **Create apps/medusa/src/modules/quotes/.** Files: index.ts, service.ts, models/quote.ts, quote-asset.ts, quote-analysis.ts, and quote-event.ts. Export QUOTES_MODULE = "quotes"; register Module(QUOTES_MODULE, { service: QuotesModuleService }); extend MedusaService({ Quote, QuoteAsset, QuoteAnalysis, QuoteEvent }). The module service owns custom persistence only and never reads/writes Customer, Cart, Order, Payment, or File tables.
- [ ] **Define DML models using @medusajs/framework/utils.** Use model.define, model.id().primaryKey(), model.text(), model.number(), model.boolean(), model.enum(...), model.dateTime(), model.json(), and same-module belongsTo/hasMany. Timestamps are automatic. Quote fields: id, status enum above, process_key, material_key, finish_key, quantity, nullable infill_percent/layer_height_mm/customer_notes, current_revision, currency_code, nullable total_minor/pricing_version/expires_at/accepted_at/converted_at/pricing_snapshot, and assets/analyses/events hasMany. QuoteAsset: id, belongsTo quote, role enum ["model"], sanitized original_filename, extension enum ["stl","obj","3mf"], declared_content_type, actual byte_size, trusted sha256, unique opaque staging_key/quarantine_key, state enum ["intent","uploaded","quarantined","processing","accepted","rejected","deleted"], intent_expires_at, retention_deadline, attempt_count. QuoteAnalysis: id, belongsTo quote and asset, schema_version, parser_version, unit enum ["mm","inch","unknown"], bounds_x_mm/bounds_y_mm/bounds_z_mm, volume_mm3, vertex_count/triangle_count/component_count, watertight, manifold, analysis_state enum ["valid","review_required","rejected"], completed_at. QuoteEvent: id, belongsTo quote, event_type, actor_type enum ["customer","user","system","worker"], actor_id, from_status/to_status, revision, nullable bounded reason, occurred_at. Validate every JSON with a strict shared Zod schema. Never put asset lists, analysis rows, or status history in metadata. ([DML](https://docs.medusajs.com/learn/fundamentals/data-models), [properties](https://docs.medusajs.com/learn/fundamentals/data-models/properties))
- [ ] **Persist virus-scan facts on QuoteAsset.** Add virus_scan_state enum pending|clean|infected|error, nullable virus_scanner_version, and nullable virus_scan_completed_at. Set state to clean only on a completed clean scan; infected/error/unavailable input cannot enter parser queue. Do not duplicate scanner findings in customer-facing metadata.
- [ ] **Implement Quote and QuoteAsset model source in the paths above using this DML shape.** Declare Quote with id primary key; status model.enum(QUOTE_STATUSES); keys/notes as model.text(); quantity/revision/price/counts as model.number(); expires_at/accepted_at/converted_at as model.dateTime().nullable(); pricing_snapshot as model.json().nullable(); assets = model.hasMany(() => QuoteAsset, { mappedBy: "quote" }); analyses/events use the same pattern. QuoteAsset declares quote = model.belongsTo(() => Quote, { mappedBy: "assets" }), object keys as unique text fields, and its state/extension fields as model.enum([...]). QuoteAnalysis belongsTo Quote and QuoteAsset; QuoteEvent belongsTo Quote. Keep model definitions in separate files and import them into service.ts. Generate and apply the module migration; do not create SQL tables by hand. ([Relationships](https://docs.medusajs.com/learn/fundamentals/data-models/relationships))
- [ ] **Create Module Links in apps/medusa/src/links/.** Add quote-customer.ts, quote-cart.ts, quote-order.ts between custom quote and native Customer/Cart/Order linkables. Cardinality: one quote to at most one owner, active cart, and converted order; one customer to many quotes. Use defineLink with module linkable exports and list cardinality on the quote side where needed for one-to-many associations. Link IDs are stored in Module Link tables; validate ownership in workflows. Guest quotes, if approved, require a separate expiring capability token; email equality is never authorization. Run db:migrate or db:sync-links after changes. ([Module Links](https://docs.medusajs.com/learn/fundamentals/module-links))
- [ ] **Create workflows in apps/medusa/src/workflows/quotes/.** Files: create-quote.ts, create-upload-intent.ts, finalize-upload.ts, enqueue-analysis.ts, accept-analysis-result.ts, calculate-estimate.ts, send-for-review.ts, staff-revise-quote.ts, accept-quote.ts, convert-quote-to-cart.ts, expire-quote.ts, delete-expired-assets.ts. Use createWorkflow/createStep/StepResponse/WorkflowResponse, compensation, @medusajs/medusa/core-flows, and strict schema input. create-quote.ts sets status=draft and current_revision=1 server-side. Add idempotency keys and expected-state/revision checks. API routes do not orchestrate modules by calling service methods directly.
- [ ] **Create Store API routes under apps/medusa/src/api/store/custom/quotes/.** route.ts POST creates a quote; [id]/route.ts GET returns owner-safe DTO; [id]/assets/upload-intents/route.ts POST reserves one upload; [id]/assets/[asset_id]/finalize/route.ts POST finalizes upload; [id]/analysis/route.ts GET returns validated analysis/estimate only; [id]/accept/route.ts POST accepts exact revision; [id]/checkout/route.ts POST creates/updates Medusa cart. Keep validators in validators.ts. Protect routes in apps/medusa/src/api/middlewares.ts with customer authentication, owner checks, origin/CSRF, request limits, per-customer/IP quotas, and idempotency.
- [ ] **Create upload intent and private R2 transfer.** Configure separate public-assets, private-staging, and private-quarantine R2 buckets. Add R2_PRIVATE_ENDPOINT, R2_UPLOAD_STAGING_BUCKET, R2_UPLOAD_QUARANTINE_BUCKET, R2_UPLOAD_ACCESS_KEY_ID, R2_UPLOAD_SECRET_ACCESS_KEY, R2_WORKER_ACCESS_KEY_ID, R2_WORKER_SECRET_ACCESS_KEY, R2_PRIVATE_REGION=auto, and UPLOAD_INTENT_SECRET to backend/worker secret stores only. Give Medusa only the staging/quarantine operations required for signed PUT, HEAD, copy, and lifecycle deletion; give the trusted worker supervisor read-only access to the quarantine bucket; give the parser sandbox no storage credentials. On create, derive customer from authenticated Medusa context and create Quote↔Customer link. Upload-intent route verifies owner/status, permits one model per revision, allowlists .stl/.obj/.3mf, creates an opaque staging key and 15-minute expiry, and returns a single-key, single-operation presigned R2 PUT instruction. Sign expected content type where supported. Set staging-bucket CORS to exact production/staging storefront origins and PUT only. Browser never chooses a bucket/key or receives GET/DELETE rights. Initial input cap is 100 MiB. A strict pre-storage cap must use the streaming upload gateway; otherwise enforce at finalize, delete oversized staging objects, and alert on quota/cost thresholds.
- [ ] **Finalize using server-side evidence.** Atomically claim the live intent with row lock/revision check; HEAD the exact private key; reject missing, expired, reused, length-mismatched, or >100 MiB files. Copy to a unique quarantine key while streaming and calculating SHA-256; verify final byte count; record trusted hash. Treat copy/delete as separate idempotent operations, not an atomic rename. Delete staging only after verified quarantine copy. Extension/MIME/browser preview/client hash/ETag are hints only. Enqueue only asset_id, quote_id, and idempotency key; never put file bytes or presigned URL in Redis payloads/logs.
- [ ] **Virus-scan quarantined input as a secondary control.** Add apps/private-media-worker/src/scanner.ts and run ClamAV clamd against the bounded quarantine stream before parsing. The scanner receives no R2 credentials, customer-facing network access, or mutable host paths. Require a healthy scanner and current signature database; fail closed on infected result, timeout, or scanner outage. Store scanner version/state/completion on QuoteAsset and append a QuoteEvent scan audit record. Malware scanning never replaces archive preflight, parser limits, or the gVisor/microVM boundary.
- [ ] **Create the parser worker in apps/private-media-worker/.** Files: package.json, tsconfig.json, Dockerfile, src/consumer.ts, src/job-schema.ts, src/r2-reader.ts, src/result-client.ts, src/sandbox/adapter.ts, parser/pyproject.toml, and parser/src/forma_mesh_parser/{__init__.py,main.py,preflight.py,parse_mesh.py,result_schema.py,limits.py}. Trusted Node supervisor uses bullmq, ioredis, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, and zod. Give it a dedicated Redis endpoint supporting BullMQ blocking commands and separate prefix/credentials from Medusa workflow-engine Redis. Parser uses Python 3.12 with pinned trimesh, numpy, lxml, networkx, and defusedxml; use stdlib zipfile for 3MF preflight. Do not install trimesh[easy], arbitrary format plugins, shell utilities, or floating dependencies.
- [ ] **Fail closed unless a real parser sandbox is configured.** src/sandbox/adapter.ts accepts only a deployment adapter that starts a fresh gVisor (runsc) sandbox or microVM for each parse; worker startup fails if neither isolation mode is proven. Sandbox: UID 10001 non-root; read-only root filesystem; drop all Linux capabilities; no-new-privileges; seccomp; no host mounts/Docker socket; no database, queue, or R2 credentials; no inbound/general outbound network; bounded tmpfs; CPU 2 cores; memory 2 GiB; PIDs 64; temporary disk 768 MiB; wall timeout 60 seconds. Supervisor alone reads quarantine data and submits bounded JSON. Never parse in Next.js, Medusa API, Admin, shared web process, or plain OCI container without gVisor/microVM. ([gVisor](https://gvisor.dev/docs/), [Docker security](https://docs.docker.com/reference/cli/docker/container/run), [resource limits](https://docs.docker.com/engine/containers/resource_constraints))
- [ ] **Enforce hostile-input caps before mesh allocation.** Initial limits: input ≤100 MiB; 3MF ≤256 ZIP entries and ≤500 MiB expanded bytes; compression ratio ≤20:1; path depth ≤8 and path length ≤240 bytes; reject encryption, symlinks, duplicate normalized paths, absolute paths, .., unsupported compression, nested archive extraction; reject XML DTD/entities/external references, remote OBJ/MTL/texture references, NaN/Infinity, coordinate magnitude >100,000 mm, >2,000,000 vertices or triangles, and parse time >60 seconds. Store validated values in parser/src/forma_mesh_parser/limits.py. Raise caps only after benchmark/load/security review and a Section 11 decision-log entry.
- [ ] **Implement parser preflight and parse separately.** preflight.py validates extension allowlist, magic/header, raw size, ZIP central directory and compressed/expanded sizes, normalized paths, XML parser flags, and OBJ external references before trimesh loads anything. parse_mesh.py supports only STL/OBJ/3MF via pinned trimesh APIs, process=False, no resolver/network, no plugin discovery. Normalize known units to mm; compute bounds, volume, vertex/triangle/component counts, watertight/manifold flags, and finite-coordinate checks. Never evaluate scripts, execute binaries, invoke a shell, fetch URLs, or write outside sandbox tmpfs.
- [ ] **Validate parser output before persistence.** MeshAnalysisResultSchema is strict/versioned: schema_version: 1, asset_id, input_sha256, parser_version, unit, bounds_mm: {x,y,z}, volume_mm3, vertex_count, triangle_count, component_count, watertight, manifold, result: valid|review_required|rejected. Require finite numbers, positive bounds, non-negative integer counts within caps, exact asset/hash/job match, and reject unknown fields. Worker returns JSON only, never path/raw mesh/URL/trace. Medusa internal result route authenticates a rotating worker credential, validates schema, verifies job ownership/idempotency, persists QuoteAnalysis, and transitions Quote to estimated/review_required/rejected.
- [ ] **Add non-authoritative browser preview.** Implement apps/storefront/src/app/(store)/custom-printing/quote/page.tsx and apps/storefront/src/components/quote/model-preview.tsx. Use three addon loaders STLLoader from three/addons/loaders/STLLoader.js, OBJLoader from three/addons/loaders/OBJLoader.js, and ThreeMFLoader from three/addons/loaders/3MFLoader.js. Parse only the user's local File in a dedicated Web Worker after enforcing the 100 MiB file cap; do not load MTL/texture references, URLs, or remote resources. Terminate the worker on timeout/unmount. Browser bounds are display-only and never sent as trusted data. Show “preview only; server analysis pending” until validated backend result; preserve upload when preview fails. ([STLLoader](https://threejs.org/docs/pages/STLLoader.html), [OBJLoader](https://threejs.org/docs/pages/OBJLoader.html), [ThreeMFLoader](https://threejs.org/docs/pages/3MFLoader.html))
- [ ] **Implement the pricing engine under apps/medusa/src/modules/quotes/pricing/.** Files: rules.schema.ts, rules.ts, calculate-price.ts, index.ts. Version server-only approved machine/material rates, setup fee, post-process fee, minimum charge, margin basis points, build limits, quantity rules, currency, and effective date. Use decimal.js for intermediate arithmetic; convert volume_cm3 = volume_mm3 / 1000; derive machine_seconds from the approved process/profile estimator, never from client input; persist integer minor units. Formula: material_minor = ceil(volume_cm3 × material_rate_minor_per_cm3); machine_minor = ceil(machine_seconds × machine_rate_minor_per_second); base_minor = setup_minor + material_minor + machine_minor + postprocess_minor; unit_minor = ceil(base_minor × margin_bps / 10000); total_minor = unit_minor × quantity, then apply configured minimum. Snapshot every input/rate/formula version/rounding rule/currency/result. Until Section 3 approves actual rates/processes/build envelope, all valid files go to review_required; never show a fabricated instant price.
- [ ] **Route ambiguous/high-risk geometry to human review.** Manual review is required for STEP/IGES and every non-allowlisted format; unknown units; non-watertight/non-manifold geometry; multiple ambiguous shells; build-envelope/complexity overflow; timeout; parser disagreement; uncertain scale; or missing approved pricing rules. Never silently repair geometry or use client values to price. Staff may request replacement upload or revise with an audit reason.
- [ ] **Accept and convert only the current revision.** accept-quote.ts verifies authenticated owner, status sent, expiry, exact current_revision, and server price snapshot. convert-quote-to-cart.ts creates/reuses the customer's Medusa cart, adds a dedicated custom-print service variant with server-set custom unit price through Medusa custom item pricing workflow, writes only {quote_id, accepted_revision} in line-item metadata, links Quote↔Cart, and delegates tax/shipping/promotions/totals to Medusa. Reject client unit price. On order.placed, apps/medusa/src/subscribers/quote-order-link.ts verifies cart/quote link and idempotently associates Quote↔Order. Never insert directly into Order Module.
- [ ] **Implement optional quote deposit/balance using Medusa orders/payments.** If the approved commercial policy requires a deposit, create a server-priced deposit line item and normal cart checkout; create a second balance line item/order only when due. Link each order to Quote and store charge purpose/amount snapshot in QuoteEvent or a quote charge model. Use Medusa Payment Collections, Stripe sessions, core cart/order workflows, and native Stripe webhook processing. Do not call Stripe directly, trust redirects, or maintain a shadow payment ledger.
- [ ] **Create Admin quote APIs and screens.** APIs under apps/medusa/src/api/admin/custom/quotes/ provide list/filter/detail, short-lived authorized preview, assignment, approve/reject/revise price, replacement upload request, and send quote. Require Admin auth, record actor/reason/revision, and call workflows. UI at apps/medusa/src/admin/routes/quotes/page.tsx and routes/quotes/[id]/page.tsx uses @medusajs/admin-sdk and @medusajs/ui. Show sanitized filename, parser state, dimensions, volume, triangle count, watertightness, price snapshot, expiry, and order links. Admin remains Vite SPA at /app or separate medusa build --admin-only output.
- [ ] **Add expiry, retention, and emails.** A Medusa scheduled job runs expire-quote.ts for expired quotes and unused intents; revoke intent state and delete staging/quarantine objects under approved retention rules, but preserve accepted quote/order records. Send received, analysis-ready/manual-review, quote-sent, expiring, accepted, and rejected emails through Notification Module with deduplication keys. Email links require account authentication; never attach source models or expose keys.
- [ ] **Exercise hostile inputs and cleanup in isolated infrastructure.** Add apps/private-media-worker/parser/tests/fixtures/ for valid STL/OBJ/3MF, truncated data, bad headers, XML DTD/entity payloads, traversal, duplicate ZIP paths, encrypted ZIP, compression bomb, remote OBJ references, NaN/Infinity, excessive triangles, non-manifold meshes, and CPU/memory timeout. Assert no sandbox egress/secrets/host mounts/process leaks, and verify staging/quarantine cleanup plus idempotent retry. Never run hostile parser fixtures in the production API process.
- [ ] **Verify the complete test checkout.** Exercise intent → bounded private PUT → finalize/hash/quarantine → parser job → safe analysis → manual review or approved estimate → staff revision → customer acceptance → cart/custom price → Stripe test payment → order/quote links. Assert totals match server snapshot, retries do not duplicate charge/order, unsupported files fail safely, and errors reveal no infrastructure/storage details.

**Done when:** a customer can upload a supported model and receive a server-validated estimate when approved pricing rules exist, or an explicit manual-review state while those rules remain unapproved; an accepted quote checks out through Medusa; staff can review/revise; unsupported or complex files route to human review.

### 9.8 Phase 5 — Content, trust & SEO

- [ ] Set up Sanity (or chosen CMS) and content schemas.
- [ ] Migrate projects to the CMS; build index + detail pages.
- [ ] Add 3 journal articles with SEO intent.
- [ ] Build materials library + sample-pack product.
- [ ] Build About/studio page with people, machines, and process.
- [ ] Build verified reviews module and `/reviews`.
- [ ] Build Help/FAQ, shipping, returns, care, file guidelines, and Contact.
- [ ] Add internal linking between products, categories, projects, materials, and articles.
- [ ] Add OG images, structured data, sitemap, robots, and redirects.
- [ ] Add real photography where available; label placeholders clearly.
- [ ] Add review request email after fulfillment.
- [ ] Replace seeded reviews with real or clearly labelled testimonials.

**Done when:** an editor can publish a project/article without a deploy; catalogue and service pages have unique SEO content; reviews are verified; help/legal pages are live.

### 9.9 Phase 6 — Polish, QA & launch

- [ ] Accessibility audit (axe + manual keyboard + screen reader).
- [ ] Performance audit against budgets; code-split 3D and optimize images.
- [ ] Analytics/consent verification and funnel dashboards.
- [ ] Sentry, uptime monitoring, and alerting.
- [ ] Legal pages and cookie consent.
- [ ] Cross-browser and real-device QA.
- [ ] E2E suite, visual regression, and workflow integration tests.
- [ ] Load test quote parser and checkout endpoints.
- [ ] Deploy staging; run full purchase/commission/quote journeys.
- [ ] Configure production domain, DNS, SSL, SPF/DKIM/DMARC.
- [ ] Switch Stripe to live keys and webhooks; test a low-value order.
- [ ] Verify backups and restore process.
- [ ] Prepare launch checklist, support inbox, and order notifications.
- [ ] Update this plan and remove `legacy/` after parity.

**Done when:** no P0/P1 issues; all launch MVP pages are live; payments and emails work in production; accessibility/performance budgets are met or documented; backups and monitoring are active.

### 9.10 Phase 7 — Post-launch growth

- [ ] Use real sales data for best sellers and recommendations.
- [ ] AR product previews and finish configurator refinements.
- [ ] A/B test hero, home section order, and CTAs.
- [ ] Trade/wholesale portal, saved quotes, net terms.
- [ ] Multi-currency and localized content.
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
| No git history | Risky migration | Initialize git and tag the baseline before restructuring |
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

### 2026-10-28 — Phase 1–4 implementation blueprint

- Expanded roadmap Sections 9.4–9.7 with concrete pnpm monorepo paths, package choices, data contracts, Medusa v2 DML/Module Links/workflows, Next.js Server Component/Server Action/TanStack Query boundaries, Admin SPA build/deployment, and an isolated STL/OBJ/3MF parser pipeline.
- Added explicit customer/admin authorization, payment ownership, quote/commission lifecycle, private R2 intake, parser resource caps, and manual-review gates. Kept rates, shipping/tax, consent retention, catalogue depth, and hosting decisions open where Section 3 has no confirmed choice.
- Current repository has an initial commit (4a658c6), but no .gitignore or baseline tag; those Phase 0 tasks remain unchecked. This was a documentation-only change; application build/tests were not run.

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
Medusa backend       9000
Medusa Admin SPA     /app in default backend build; optional separate `medusa build --admin-only` static host
Meilisearch          7700
```

### Attribution

- Portrait head scan: **LeePerrySmith**, CC BY 3.0. Keep the footer credit and the licence file at `public/models/LICENSE-portrait-head.txt`.
- Customer photographs and uploaded files are private; never use them in marketing without explicit consent.

### If lost

1. Read Section 0.1 (current focus).
2. Read Section 9.1 (phase status).
3. Pick the next unchecked task.
4. If unsure, ask the user only about the blocking decision in Section 3.
