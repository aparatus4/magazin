# FORMA — Storefront & Medusa Migration Plan

> **Single source of truth.** Read this before starting work.
>
> **Last updated:** 2026-10-27  
> **Status:** Static concept site complete. Migration plan created; implementation not started.  
> **Next action:** Confirm the open decisions in Section 3, then begin Phase 0.

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
| State | Planning complete — awaiting decisions; implementation not started |
| Next action | Review Section 3 with the user, then initialize git and make a baseline commit |
| Blocking decisions | Catalog depth, portrait pricing, custom-quote rules, CMS, hosting/accounts |
| Current app | Vite + React concept storefront at `http://127.0.0.1:5173` |
| Current verification | `npm run build` passes; `node scripts/functional-test.mjs` passes 13/13 |
| Workspace | `E:\dev\rob\maga` (Windows, PowerShell, Node 20.10) |

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
| Catalogue taxonomy | **Categories** (nested) | 10 top-level; leaf categories only when justified |
| Merchandising | **Collections** | Studio Picks, Ready to Ship, Gifts, Under $100, Architectural Models |
| Product options | **Options** | Finish, size; keep the matrix controlled |
| Sellable combinations | **Variants** | Price, SKU, inventory, weight, dimensions |
| Availability | Variant inventory + metadata | Ready-to-ship tracked; made-to-order allows backorder |
| Process/material filters | **Tags** + metadata | FDM, SLA, SLS; porcelain, sandstone, nylon, resin, metal |
| Editorial grouping | Collections + tags | Do not overload categories with marketing |
| Personalisation | Line-item metadata | Gift note, engraving, dedication |
| Markets | Regions + currencies | USD launch; structure for UK/EU |
| Taxes | Medusa tax regions / provider | Confirm Stripe Tax or manual rates |
| Shipping | Shipping options/providers | Lead time messaging per option |
| Payments | Stripe provider | Deposits and balances for commissions |

### 5.2 Product metadata schema

Metadata is schemaless in Medusa; validate it with Zod in the seed and storefront. Expected keys:

```json
{
  "availability": "ready | made_to_order | custom",
  "process": "FDM | SLA | SLS | MJF",
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

- Structured specs go in metadata or a custom module, not buried in the description.
- Store valid keys and values through the seed script; do not rely on free-text admin entry.
- Product images and GLBs live in R2/S3 via Medusa’s file provider or a CDN, not in the repo.
- Keep image alt text and 3D poster images with the product.

### 5.3 Custom modules

Medusa’s standard product/order model is not enough for commissions and custom quotes. Build focused custom modules with workflows and admin extensions.

#### Quote module

Purpose: instant and reviewed custom-print quotes.

Suggested fields:

- `id`, `customer_id`, `email`
- `status`: `draft | uploaded | estimated | review | quote_sent | accepted | converted | expired | cancelled`
- `files[]`: storage key, filename, size, MIME, checksum
- `geometry`: bounding box, volume, triangle count, watertight flag, unit
- `process`, `material`, `color`, `infill`, `layer_height`, `quantity`
- `estimate_cents`, `final_cents`, `currency`
- `pricing_breakdown` (material, machine time, setup, post-processing, margin)
- `notes`, `expires_at`
- `cart_id`, `order_id`
- timestamps

Workflows:

- create quote / attach uploads
- validate and parse model (server-side)
- calculate estimate
- request human review / override price
- send quote
- accept quote → cart/order
- expire quote

Admin needs: quote queue, file preview/download, geometry summary, price override, status changes, convert to order.

#### Commission module

Purpose: portrait (and later other made-to-order sculpture) commissions.

Suggested fields:

- `id`, `customer_id`, `email`
- `status`: `brief | review | quote_sent | deposit_paid | sculpting | proof_sent | changes_requested | approved | printing | finishing | shipped | cancelled`
- `subject_type`: single / couple / pet / family / memorial
- `style`, `size`, `finish`, `plinth`, `gift_note`
- `photos[]`: private storage keys, signed URLs only
- `proof_images[]`
- `price_cents`, `deposit_cents`, `balance_cents`, `currency`
- `artist`, `due_at`
- `order_id`
- `consent_likeness`, `consent_marketing`, `retention_delete_at`
- timestamps

Workflows:

- create commission brief
- upload photos
- artist review / quote
- take deposit
- upload proof / request approval
- approve or request changes
- mark printing / finishing / shipped
- request balance payment
- cancel / refund
- delete photos after retention period

Admin needs: commission board by stage, assignment, proof upload, customer messages, due dates, balance link, export.

#### Review module

- `id`, `product_id`, `order_id`, `customer_id`
- `rating` (1–5), `title`, `body`, `photos[]`
- `service_type`: product / portrait / custom
- `verified` (derived from a real order)
- `status`: pending / published / rejected
- timestamps

Rules: only verified purchases; moderation queue; no invented reviews; aggregate ratings computed or cached.

#### Capacity / booking (optional, phase 3)

Made-to-order capacity is the real constraint, not stock. Options:

- Use inventory as monthly slots (simple but semantically awkward).
- Add a `capacity` custom module keyed by service/month, with total/booked slots.
- Use metadata on a “booking window” product.

Decide during Phase 3; the storefront needs a single source for “Now booking November” and remaining slots.

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

- Stripe test mode first; webhooks verified; idempotency keys on mutations.
- Standard products: full payment at checkout.
- Portrait commissions: 30% deposit; balance before shipping.
- Custom quotes: 50% deposit or full payment at acceptance; confirm.
- Ready-to-ship: track inventory and decrement on order.
- Made-to-order: allow backorder, show lead time, track capacity separately.
- Shipping: flat/calculated options per region; lead time messaging; tracking numbers.
- Tax: configure regions; use Stripe Tax or a Medusa tax provider. Confirm DDP/DDU.
- Refunds/returns: standard stock returns; custom/commission terms after proof approval (confirm).
- Emails: order confirmation, commission stages, quote ready, proof ready, shipped, review request.

---

## 6. Frontend architecture

### 6.1 Next.js App Router

- Migrate from Vite SPA to **Next.js App Router + TypeScript**.
- Server components for catalogue, category, product, project, and editorial pages.
- Client components only where needed: 3D hero, product viewer, quote uploader, portrait configurator, cart drawer, search overlay.
- ISR/revalidation for product/category pages; revalidate on Medusa webhooks.
- Metadata API for titles, descriptions, canonical, OG; generate sitemap/robots.
- Keep the custom CSS/design tokens; no requirement to adopt Tailwind.
- Use `next/font/local` for the existing fonts.
- Wrap 3D components in client boundaries and dynamic imports; do not SSR WebGL.

### 6.2 State and cart

- Medusa is the source of truth for cart and customer state.
- Store the cart ID in an httpOnly cookie; hydrate via Medusa JS SDK.
- Use server actions/route handlers for add/update/remove and checkout.
- UI-only state (search open, quick view, mobile menu) can use Zustand/context.
- Remove localStorage cart as the primary source; optionally keep a local snapshot for optimism only.
- Handle stale carts, expired variants, price changes, and out-of-stock errors gracefully.

### 6.3 3D and AR

- **Hero:** port the existing Three.js scenes; lazy-load, cap DPR, pause when offscreen/hidden, respect reduced motion.
- **Product pages:** export GLB for each product from the existing render pipeline; use `<model-viewer>` for turntable + AR Quick Look, with poster images and lazy loading.
- **Finish switching:** use a custom Three.js viewer for material swaps, or pre-generated GLB variants if necessary. Do not ship one GLB per finish unless size is acceptable.
- **Portrait preview:** show a stylized bust with selected finish/size; state clearly that the final likeness is artist-sculpted from photos. Do not fake a photoreal result.
- **Quote preview:** client-side STL/OBJ/3MF preview for feedback; server-side parse is authoritative for pricing.
- **Performance:** code-split Three.js; load only on pages that need it; adaptive geometry/material quality on mobile; pause rendering offscreen.
- **Export risk:** procedural Three.js materials may not translate cleanly to GLB. Create a dedicated GLB material set and test on iOS Quick Look and Android Scene Viewer; always provide a poster/turntable fallback.
- **AR requirement:** `<model-viewer>` AR needs HTTPS and a supported device; do not make AR the only way to inspect an object.

### 6.4 Images and fonts

- Store originals in R2/S3; serve through a CDN or Next Image loader.
- Configure CORS and cache headers for the R2/CDN (images, GLB, and any fonts); keep customer uploads private with short-lived signed URLs.
- Generate AVIF/WebP variants; responsive `sizes`; width/height to prevent CLS.
- Provide high-resolution images for product zoom (current renders are 1000×1250; verify at 2x).
- Keep poster images for 3D/AR and OG images.
- Keep fonts local and subset; preload only what is used above the fold.
- Alt text for every meaningful image; decorative images empty alt.

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
- Quote upload errors (wrong format, too large, non-manifold, too big for printer).
- Checkout/payment failure with recovery.
- Commission status empty/error states.
- 404 and 500 pages.
- Offline/network error messaging for uploads.

### 6.7 Analytics events

Instrument at minimum:

- `view_item_list`, `select_item`, `view_item`
- `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `purchase`
- `portrait_start`, `portrait_photo_upload`, `portrait_deposit`
- `quote_start`, `quote_upload`, `quote_estimate`, `quote_request_review`, `quote_checkout`
- `newsletter_signup`
- `search`, `search_no_results`
- `project_inquiry`

Use consent-gated analytics; send server-side purchase events where possible.

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
- CSRF protection and rate limits on quote, contact, newsletter, and auth endpoints.
- Validate uploads by extension, MIME, magic bytes, size, and file count.
- Virus scan uploads; isolate the parser; never execute customer files.
- Add spam protection (Cloudflare Turnstile or a honeypot + rate limit) to contact, newsletter, and project forms.
- Presigned uploads to a private bucket; signed download URLs; no public photo bucket.
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
- Quote parser load test and malformed-file tests.
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
| 0 | Foundation & decisions | **Planning complete** | 0.5–1 day |
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

- [ ] Review Section 3 with the user and record decisions.
- [ ] Initialize git; add `.gitignore`; make a baseline commit and tag the current static site.
- [x] Create `AGENTS.md` pointing to this plan (done during planning).
- [ ] Create a `migration/medusa` branch for the rebuild; merge in phase-sized increments.
- [ ] Create pnpm workspace: `apps/storefront`, `apps/medusa`, `legacy/`.
- [ ] Move the current Vite app to `legacy/` (or preserve it in git history and keep a reference copy).
- [ ] Scaffold Medusa v2 and Next.js apps; pin exact versions; document them.
- [ ] Add `.env.example` for both apps and a root README.
- [ ] Add CI: install, lint, typecheck, build, tests.
- [ ] Create accounts/projects (user-assisted): Neon, Upstash, R2, Stripe test, Resend, Meilisearch, Sanity, Vercel, Railway/Fly.
- [ ] Document the visual baseline and screenshot references.
- [ ] Update the current-focus block.

**Done when:** the workspace installs and builds; the legacy site is recoverable; apps start; env docs exist; CI is green; decisions are recorded.

### 9.4 Phase 1 — Medusa foundation

- [ ] Configure Medusa v2 with Postgres and Redis.
- [ ] Create admin user; document admin URL and roles.
- [ ] Configure US region, USD, tax, and shipping options.
- [ ] Configure Stripe test provider and webhooks.
- [ ] Configure S3/R2 file storage.
- [ ] Configure Resend (or stub notifications) for order email.
- [ ] Seed 10 categories + justified subcategories.
- [ ] Seed products with options/variants, images, metadata, and collections.
- [ ] Define the metadata schema and validate with Zod in the seed.
- [ ] Create collections: Studio Picks, Ready to Ship, Gifts, Under $100.
- [ ] Generate a publishable API key for the storefront.
- [ ] Verify catalogue API, images, prices, and inventory.
- [ ] Place a test order through the API.

**Done when:** Medusa Admin can manage the catalogue; the storefront can fetch products/categories/collections; images are served from R2; a test order completes in Stripe test mode.

### 9.5 Phase 2 — Next.js storefront spine

- [ ] Scaffold Next.js App Router; port fonts, tokens, and global CSS.
- [ ] Build layout: announcement bar, header, mega menu, mobile menu, footer.
- [ ] Build home with curated sections (hero, portrait, picks, categories, custom, projects, proof, newsletter).
- [ ] Build `/shop` with filters, sort, pagination, and URL state.
- [ ] Build category pages with unique intros.
- [ ] Build product pages with variants, gallery, 3D/AR, reviews placeholder, related products.
- [ ] Build search overlay + `/search` with Meilisearch.
- [ ] Build cart drawer and cart page on Medusa cart state.
- [ ] Build checkout with address, shipping, tax, Stripe test payment.
- [ ] Build order confirmation and basic account/auth.
- [ ] Add loading, empty, error, 404, and 500 states.
- [ ] Add metadata, canonical, sitemap, robots, and JSON-LD.
- [ ] Port the 3D hero with lazy loading and performance guards.
- [ ] Export product GLBs and add `<model-viewer>` previews.
- [ ] Add analytics event stubs and consent gate.
- [ ] Run mobile and desktop visual QA.

**Done when:** a customer can browse → product → cart → Stripe test checkout; the home page is curated and links to real pages; mobile navigation works; core SEO metadata exists; the build passes.

### 9.6 Phase 3 — Portrait Studio flow

- [ ] Build the commission custom module and statuses.
- [ ] Build `/portrait-studio` landing, gallery, process, pricing, FAQ.
- [ ] Build `/portrait-studio/start` with photo upload, style, size, finish, plinth, gift note, deadline, shipping, deposit.
- [ ] Store photos privately in R2; signed URLs only.
- [ ] Add consent, retention, and deletion policy.
- [ ] Build account commission timeline and proof approval.
- [ ] Build admin commission board: stages, assignment, proofs, messages, due dates, balance link.
- [ ] Add emails: brief received, quote ready, deposit received, proof ready, changes requested, approved, printing, shipped.
- [ ] Add a Stripe deposit and balance payment flow.
- [ ] Add capacity/booking source for “now booking” messaging.
- [ ] E2E test: brief → deposit → proof → approval → shipping.
- [ ] Add analytics events for the portrait funnel.

**Done when:** a test customer can book, pay a deposit, see status, approve a proof, and receive stage emails; staff can manage the commission without a spreadsheet.

### 9.7 Phase 4 — Custom quote flow

- [ ] Build the quote custom module and statuses.
- [ ] Build `/custom-printing` landing with capabilities, materials, tolerances, use cases.
- [ ] Build `/custom-printing/quote` upload flow with drag/drop and file guidance.
- [ ] Add presigned uploads, validation, size limits, and virus scanning.
- [ ] Add a parser worker for STL/OBJ/3MF; compute bounds, volume, triangles, watertightness.
- [ ] Add client-side preview for uploaded models.
- [ ] Build the pricing engine (material, machine time, setup, post-processing, quantity, margin).
- [ ] Add instant estimate and manual-review path for STEP/complex files.
- [ ] Add accept → cart/order and deposit payment.
- [ ] Build admin quote queue, override, status, and convert-to-order.
- [ ] Add quote emails and expiry.
- [ ] Add security tests: malformed, oversized, zip bombs, non-manifold, unsupported formats.
- [ ] E2E test: upload → estimate → checkout; error states.

**Done when:** a customer can upload a supported model, see a server-validated estimate, and check out; staff can review and override; unsupported/complex files route to human review.

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
Medusa Admin         /app on the backend
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
