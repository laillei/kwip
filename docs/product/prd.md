# Kwip — Product Requirements Document
**Scope:** March 2026 Launch
**Last updated:** March 19, 2026

---

## Problem Statement

Vietnamese women who research K-beauty skincare ingredients have no Vietnamese-language tool that starts with their skin concern and explains the ingredient science behind a recommended routine. Every existing tool (CosDNA, SkinCarisma, INCIDecoder) is English-first. Reviewty covers ingredients in Vietnamese but is product-first, not concern-first, and provides safety ratings rather than ingredient logic. The result: users discover products on TikTok with no structured way to understand why they work or how to build a complete routine.

---

## Target User

**Primary:** Vietnamese urban woman, 20–32. Already ingredient-literate (knows niacinamide, BHA, centella). Frustrated that every ingredient tool is in English. Discovers products on TikTok but wants the science before committing. Wants a complete routine, not just one product.

---

## Launch Scope — End of March 2026

### Classification framework

Each requirement is tagged by layer:
- `[FEATURE]` — what the user interacts with
- `[DATA]` — what powers the experience
- `[DISTRIBUTION]` — how users find it
- `[REVENUE]` — business model (none at launch)

---

## Requirements

### F1 — Concern Filter `[FEATURE]`

**What:** Home screen opens with a horizontally scrollable tab bar of concern labels (All + 6 concerns). Selecting a tab filters the product grid and step filter bar instantly. A chevron button expands a full-screen overlay grid showing all concern options at once (Olive Young-style dropdown: white options panel + dark scrim below, header and tab bar float above). Selecting the same concern returns to "All."

**Acceptance criteria:**
- Scrollable tab row: "All" + 6 concern labels, active tab has bottom border + bold text
- Chevron button rotates when overlay is open; 44×44px minimum touch target
- Overlay: fixed position below header (top: 100px), 2-column grid of all concerns, dark scrim below options panel closes on tap
- Concern tabs and header float above overlay (z-index layering correct)
- Selecting a concern → product grid and step filter update instantly
- Concern filter persists as sticky bar below the fixed header (top: 56px)

**Status:** Done ✓

---

### F2 — Step Filter `[FEATURE]`

**What:** Below the concern filter bar, a horizontally scrollable row of routine step labels (All + available categories). Filters the product grid to one step. Only shows steps that have products matching the active concern. Resets to "All" when concern changes.

**Acceptance criteria:**
- Steps shown in routine order: Cleanser → Pad → Toner → Essence → Serum → Ampoule → Mask → Cream → Sunscreen
- Only steps with matching products are shown
- Active step: semibold text, neutral-900; inactive: regular text, neutral-400
- Step bar sticky below concern bar (top: 100px); lower visual weight than concern bar (neutral-50 background)
- 44×44px minimum touch target per step button

**Status:** Done ✓

---

### F3 — Product Grid with Ingredient Signal `[FEATURE]`

**What:** Flat 2-column (mobile) / 4-column (desktop) product grid, sorted by popularity rank. Each product card shows: product image (square), brand name, product name, and the key ingredient name connecting the product to the active concern. When "All" concern is selected, shows the first key ingredient of each product regardless of concern.

**Acceptance criteria:**
- 2-col mobile, 4-col desktop grid
- Each card: square image → brand (xs, neutral-400) → product name (13px semibold, 2-line clamp) → ingredient signal (xs, emerald-600, 1-line clamp)
- No card UI — flat layout on neutral-50 page background
- Ingredient signal: ingredient name only (no description)
- Empty state centered vertically with optical offset (-mt-16) when no products match
- Products filtered by active concern and active step simultaneously

**Status:** Done ✓

---

### F4 — Share Routine Image Card `[FEATURE]`

**What:** From the saved routine detail page (`/routine/[id]`), a "Chia sẻ" button generates a shareable image card. Card contains: concern label, key ingredients with Vietnamese reasons, routine steps with product names, and Kwip URL. Formatted for Facebook/Zalo stories (9:16 vertical).

**Acceptance criteria:**
- Accessible from `/routine/[id]` detail page (public, no auth required to view)
- Card contains: concern label, 2–3 key ingredients + reasons, routine steps (step name + top 1–2 product names per step), Kwip URL watermark
- Downloadable as PNG
- Card design uses neutral-900/white palette, Noto Sans, Kwip branding
- Works on mobile (primary) and desktop

**Status:** Not started ⬜

---

### F5 — Product Detail Page `[FEATURE]`

**What:** Each product has a detail page at `/[locale]/products/[slug]`. Flat section layout (no cards): product image (4:3 ratio) + info block → key ingredients section → full ingredient list. Purchase links to Hasaki.vn and Shopee. Save button to add product to personal saved list.

**Acceptance criteria:**
- Layout: bg-neutral-100 outer, bg-white content blocks separated by h-4 gaps
- Product image: 4:3 aspect ratio
- Product name: 17px semibold (not large title — this is a detail, not a hero)
- Key ingredients: ingredient name + concern mapping + Vietnamese description
- Full ingredient list with key ingredients flagged
- Purchase links open in new tab
- Save button (bookmark): 44×44px, saves to localStorage
- Bilingual: vi + en

**Status:** Done ✓

---

### F6 — Bilingual Support `[FEATURE]`

**What:** All UI text available in Vietnamese (`/vi`) and English (`/en`). Vietnamese is the primary locale. No hardcoded strings — all text via `src/dictionaries/vi.json` and `en.json`.

**Status:** Done ✓

---

### F7 — Routine Builder `[FEATURE]`

**What:** Authenticated users can build a personal routine at `/[locale]/routine/new`. Select a concern (pre-loaded from active concern if arrived from home). Pick multiple products per routine step. Name and save the routine to Supabase.

**Acceptance criteria:**
- Requires Google OAuth sign-in
- Concern pre-loaded if navigating from home with active concern
- Multi-product selection per step
- Routine name editable
- Saved routine accessible at `/[locale]/me`

**Status:** Done ✓

---

### F8 — Personal Page `[FEATURE]`

**What:** `/[locale]/me` shows the user's saved routines list and saved (bookmarked) products grid. Empty states with CTAs to build a routine or browse products. Requires auth for routines; saved products from localStorage are visible without auth.

**Acceptance criteria:**
- Saved products: 2-col grid matching home product card style
- Saved routines: list with concern label, product count, date
- Delete routine action
- Empty state centered vertically (-mt-16 optical offset)
- Bottom tab bar badge shows saved product count

**Status:** Done ✓

---

### F9 — Shareable Routine Detail `[FEATURE]`

**What:** Each saved routine has a public detail page at `/[locale]/routine/[id]`. Shows concern, products organized by step, and a share button (F4). No auth required to view — anyone with the link can see it.

**Acceptance criteria:**
- Public page (no auth gate)
- Products grouped by routine step in application order
- Share button triggers image card generation (F4 — pending)

**Status:** Done ✓ (share button pending F4)

---

### D1 — Curated Catalog `[DATA]`

**What:** 22 curated products across 6 concerns, sourced from Olive Young KR Annual Awards 2025 and Daiso KR best sellers. All active products are proven bestsellers based on real purchase data. No concern shows an empty state at launch.

**Source:**
- Olive Young KR Annual Awards 2025 — 13 products (based on 180M+ purchase records, July 2024–June 2025)
- Daiso KR community-verified best sellers — 9 products (cross-referenced across 5+ independent sources)

**Implementation:** All 309 legacy products set to `is_active = false`. The 22 curated products are activated (or seeded). No data deleted — legacy products can be re-activated later.

**Acceptance criteria:**

| Concern | Min products | Steps covered |
|---|---|---|
| acne | 3+ | cleanser, pad, toner, essence, serum, cream |
| pores | 3+ | cleanser, pad, serum |
| hydration | 3+ | cleanser, toner, essence, serum, cream, mask |
| brightening | 3+ | cleanser, toner, serum, mask |
| soothing | 3+ | cleanser, pad, toner, essence, cream, mask |
| anti-aging | 3+ | ampoule, cream, mask |

`sun-protection` concern removed — sunscreen is a separate product category. No sunscreen products in the curated set.

**Full product list:** See `docs/plans/2026-03-25-product-curation-design.md`

**Status:** Not started ⬜ (replaces previous D1)

---

### D2 — Ingredient Effects Accuracy `[DATA]`

**What:** Key ingredients are correctly mapped to concerns they address. Concern mapping requires ≥2 ingredients with "good" effects for that concern (exception: sun-protection requires ≥1 UV filter ingredient, or product is sunscreen category).

**Status:** Done ✓

---

### F10 — Deep Link Concern Pre-selection `[FEATURE]`

**What:** The URL param `?concern=acne` (or any valid concern ID) pre-selects the matching concern tab on page load. Required for paid ad landing pages — ads promise a concern-specific view, and the landing page must deliver it immediately without the user having to tap anything.

**Acceptance criteria:**
- `?concern=<id>` on `/[locale]/` pre-selects the concern tab and filters the product grid on load
- Invalid or unknown concern values are silently ignored (fall back to "All")
- Works with any of the 6 concern IDs: `acne`, `pores`, `hydration`, `brightening`, `soothing`, `anti-aging`
- No flash of unfiltered state on load

**Status:** Not started ⬜ (blocking DIST1)

---

### DIST1 — Paid Acquisition at Launch `[DISTRIBUTION]`

**What:** Facebook and YouTube ads targeting Vietnamese women 20–35 interested in K-beauty. Ads lead with the skin problem ("Da mụn mãi không hết?"), not the product or brand. Landing URL goes directly to the concern view, not the homepage.

**Acceptance criteria:**
- Facebook ad set targeting: Vietnam, female, 20–35, interests: K-beauty brands (COSRX, Anua, Beauty of Joseon), skincare, beauty
- Ad creative leads with concern/problem copy
- Landing URL: `/vi/?concern=acne` (or relevant concern from: acne, pores, hydration, brightening, soothing, anti-aging) — deep link pre-selects the concern tab
- UTM parameters on all ad URLs for tracking

**Status:** Not started ⬜ (post-build)

---

## Out of Scope — March 2026

These are confirmed for later phases. Do not build now.

| Feature | Phase |
|---|---|
| Ingredient detail pages | Q2 2026 |
| Affiliate purchase links | Q2 2026 |
| Editorial starter routines (curated brand combos) | Q2 2026 |
| Creator/KOL partnerships | Q3 2026 |
| Skin profile / personalization | 2027 |
| Reviews or community features | Not planned |
| Native app (iOS/Android) | Not planned |

---

## Success Metrics — 30 Days Post-Launch

| Metric | Target | Why |
|---|---|---|
| Concern selection rate | >60% of sessions | Core loop activation |
| Product click-through | >1 product per concern session | Loop closure |
| Share card generated | >1 per 20 sessions | Organic growth seed |
| 7-day return rate | >15% | Retention signal |
| Bounce rate on concern view | <70% | Landing page quality |

---

## Long-Term Roadmap Summary

| Phase | Horizon | Key deliverable | Hypothesis tested |
|---|---|---|---|
| **Launch** | End of March 2026 | Core loop + share card | Users convert concern → product click |
| **Deepen** | Q2 2026 | Ingredient pages + affiliate links + starter routines | Users bookmark Kwip as a reference |
| **Distribute** | Q3 2026 | Creator partnerships, organic > paid | Share card + creators compound growth |
| **Monetize** | Q4 2026 | Affiliate revenue live | Trust converts to purchase intent |
| **Defend** | 2027 | Skin profiles + personalization | Personalization creates retention moat |
