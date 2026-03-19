# Kwip — Product Requirements Document
**Scope:** March 2026 Launch
**Last updated:** March 2026

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

### F1 — Concern Hero `[FEATURE]`

**What:** Home screen opens with a 2-column card grid of concern cards. Each card shows icon + concern label + symptom text (e.g. "Mụn, bít lỗ chân lông"). Selecting a card reconfigures the entire page — ingredient highlights and product list update instantly. Selecting the same card deselects it and returns to the default state.

**Acceptance criteria:**
- 7 concern cards displayed in 2-column grid
- Each card shows icon, label, and symptom text
- Active card: dark background, white text
- Selecting a concern → ingredient highlights appear + products filter + group by routine step
- Deselecting → page returns to full unfiltered product grid
- Min touch target: 56px height

**Status:** Done ✓

---

### F2 — Ingredient Highlight `[FEATURE]`

**What:** When a concern is active, a row of key ingredient cards appears between the concern selector and the product grid. Each card shows ingredient name, icon, and a one-line Vietnamese explanation of what it does for that specific concern. This is the "why" layer — without it, Kwip is just a filtered catalog.

**Acceptance criteria:**
- Appears only when a concern is selected
- Shows 2–6 key ingredients for the active concern
- Each card: ingredient name (Vietnamese) + icon + one-line reason in Vietnamese
- Tapping an ingredient card does nothing at launch (detail pages are Q2)
- Disappears when concern is deselected

**Status:** Done ✓

---

### F3 — Routine-Grouped Product Grid `[FEATURE]`

**What:** When a concern is active, products are grouped by routine step in application order: Cleanser → Pad → Toner → Essence → Serum → Ampoule → Mask → Cream → Sunscreen. Each step shows only steps that have matching products. Each product card shows the ingredient reason it was surfaced for the selected concern.

**Acceptance criteria:**
- Routine groups appear only when concern is selected
- Only routine steps with matching products are shown
- Step label shows routine order number + category name in Vietnamese
- Each product card shows: image, brand, product name, ingredient reason (why it fits the concern)
- Empty state shown if no products match a concern
- Without concern selected: flat grid of all products sorted by popularity rank

**Status:** Done ✓

---

### F4 — Share Routine Image Card `[FEATURE]`

**What:** When a concern is active, a "Chia sẻ routine của bạn" button appears. Tapping it generates a shareable image card containing: concern label at the top, 2–3 key ingredients with one-line Vietnamese reasons, routine steps with product names, and the Kwip URL watermarked at the bottom. The card is formatted for Facebook and Zalo stories (vertical, 9:16 ratio).

**Acceptance criteria:**
- Button appears only when a concern is active
- Card contains: concern label, 2–3 key ingredients + reasons, routine steps (step name + top 1–2 product names per step), Kwip URL
- Card is downloadable as an image (PNG)
- Card design is visually clean and brand-consistent — uses Kwip's neutral-900/white palette
- Works on mobile (primary) and desktop

**Status:** Not started

---

### F5 — Product Detail Page `[FEATURE]`

**What:** Each product has a detail page at `/[locale]/products/[slug]`. Shows full ingredient breakdown with key ingredients highlighted, Vietnamese descriptions, and purchase links to Hasaki.vn and Shopee.

**Acceptance criteria:**
- Product name, brand, category shown
- Full ingredient list with key ingredients flagged
- Purchase links open in new tab
- Bilingual: vi + en

**Status:** Done ✓

---

### F6 — Bilingual support `[FEATURE]`

**What:** All UI text available in Vietnamese (`/vi`) and English (`/en`). Vietnamese is the primary locale. No hardcoded strings — all text via `src/dictionaries/vi.json` and `en.json`.

**Status:** Done ✓

---

### D1 — Full catalog coverage `[DATA]`

**What:** All 7 concerns have products at every key routine step. No concern shows an empty state at launch.

**Acceptance criteria:**

| Concern | Min products | Must have steps |
|---|---|---|
| acne | 10+ | cleanser, toner, serum, cream, sunscreen |
| pores | 5+ | toner, serum, cream |
| hydration | 10+ | cleanser, toner, serum, cream, sunscreen |
| brightening | 8+ | toner, serum, cream, sunscreen |
| soothing | 8+ | cleanser, toner, serum, cream |
| anti-aging | 8+ | toner, serum, cream, sunscreen |
| sun-protection | 5+ | sunscreen |

**Status:** Done ✓ (309 products, all concerns covered)

---

### D2 — Ingredient effects accuracy `[DATA]`

**What:** Key ingredients are correctly mapped to concerns they address. Concern mapping requires ≥2 ingredients with "good" effects for that concern (exception: sun-protection requires ≥1 UV filter ingredient, or product is sunscreen category).

**Status:** Done ✓

---

### DIST1 — Paid acquisition at launch `[DISTRIBUTION]`

**What:** Facebook and YouTube ads targeting Vietnamese women 20–35 interested in K-beauty. Ads lead with the skin problem ("Da mụn mãi không hết?"), not the product or brand. Landing URL goes directly to the concern view, not the homepage.

**Acceptance criteria:**
- Facebook ad set targeting: Vietnam, female, 20–35, interests: K-beauty brands (COSRX, Anua, Beauty of Joseon), skincare, beauty
- Ad creative leads with concern/problem copy
- Landing URL: `/vi/?concern=acne` (or relevant concern)
- UTM parameters on all ad URLs for tracking

**Status:** Not started (post-build)

---

## Out of Scope — March 2026

These are confirmed for later phases. Do not build now.

| Feature | Phase |
|---|---|
| Ingredient detail pages | Q2 2026 |
| Affiliate purchase links | Q2 2026 |
| Editorial starter routines (curated brand combos) | Q2 2026 |
| User accounts / saved routines | 2027 |
| K-Routine Builder (drag & drop) | 2027 |
| Creator/KOL partnerships | Q3 2026 |
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
| **Defend** | 2027 | K-Routine Builder + skin profiles | Personalization creates retention moat |
