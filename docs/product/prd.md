# Kwip — Product Requirements Document
**Scope:** April 2026 Pivot — Editorial Site v1
**Last updated:** April 2, 2026

---

## Problem Statement

Korean skincare consumers have no trusted editorial voice that consistently surfaces emerging K-beauty products and trends *before* they go mainstream. Hwahae has user reviews. Olive Young has sales rankings. Influencers have personal brands. Nobody has independent, brand-agnostic editorial conviction.

Kwip fills that gap: a bilingual (KR + EN) editorial site that publishes trend articles and curated product picks, written as a brand voice with no named author.

---

## Target User

**Korean consumers interested in skincare discovery** — curious readers who want to find something new, not verify something they already know. Primary arrival path: short-form video (TikTok/Shorts) → Kwip article for the full story.

---

## Launch Scope — April 2026

### Content model

Two content types power the site:

1. **Articles** — editorial trend pieces, product roundups, ingredient deep-dives. Korean (primary) + English. 500–1,500 words. Embedded product cards inline.
2. **Product cards** — curated product entries with editorial tags. Every product has a reason it's here.

### Classification framework

- `[FEATURE]` — user-facing UI
- `[DATA]` — content that powers the experience
- `[DISTRIBUTION]` — how users find it

---

## Requirements

### F1 — Home: Articles Feed `[FEATURE]`

**What:** Homepage is a feed of the latest articles, newest first. Each article entry shows: cover image, title, short description, editorial tag, date. Below the fold: featured product picks grid.

**Acceptance criteria:**
- Article cards: cover image (16:9) + title + 1-line description + tag chip + date
- Featured products section below articles feed
- Mobile-first layout, 1-col article list on mobile / 2-col on desktop
- Korean as default locale (`/ko/`), English at `/en/`

**Status:** Not started ⬜

---

### F2 — Article Detail Page `[FEATURE]`

**What:** Full article at `/[locale]/article/[slug]`. Long-form editorial content with inline product cards. Ends with subscribe CTA.

**Acceptance criteria:**
- Title, cover image, date, estimated read time
- Rich text body (markdown or CMS-driven)
- Inline product cards embedded within article body
- Subscribe CTA block at end of every article: "Kwip의 다음 발견을 가장 먼저 받아보세요"
- Share button (KakaoTalk + copy link)
- Related articles section at bottom
- Bilingual: `/ko/article/[slug]` and `/en/article/[slug]`

**Status:** Not started ⬜

---

### F3 — Product Discovery Grid `[FEATURE]`

**What:** Browsable product grid at `/[locale]/products`. Curated products with editorial tags. Filterable by editorial tag. No concern filter — editorial signal is the organising principle.

**Acceptance criteria:**
- 2-col mobile / 4-col desktop grid
- Editorial tag filter chips at top (All + 지금 뜨는 / 숨겨진 명품 / 성분 주목 / 편집장 픽)
- Each card: image + brand + product name + editorial tag + one-line editorial note
- Tapping card goes to product detail page

**Status:** Not started ⬜

---

### F4 — Product Detail Page `[FEATURE]`

**What:** Each product at `/[locale]/products/[slug]`. Full product info, key ingredients, editorial note, purchase links, related articles.

**Acceptance criteria:**
- Product image + brand + name + editorial tag
- Short editorial note explaining why this product is featured
- Key ingredients with brief descriptions
- Purchase links (Olive Young, Coupang — open in new tab)
- Related articles that feature this product
- Bilingual: ko + en

**Status:** Partially done (adapt from existing product detail) ⬜

---

### F5 — Subscribe Page + CTA `[FEATURE]`

**What:** `/subscribe` — single-focus page to capture email and/or KakaoTalk Channel subscribers. Value prop: get Kwip's early picks before they go mainstream.

**Acceptance criteria:**
- Single CTA, no distractions
- Email capture form
- KakaoTalk Channel follow link
- Copy: "올리브영이 알기 전에 먼저 알아보세요" (know it before Olive Young does)
- Embedded CTA block also appears at bottom of every article (F2)

**Status:** Not started ⬜

---

### F6 — Bilingual Support (KO + EN) `[FEATURE]`

**What:** All UI text available in Korean (`/ko`) and English (`/en`). Korean is the primary locale. All text via `src/dictionaries/ko.json` and `en.json`. No hardcoded strings.

**Status:** Requires migration from `vi` → `ko` as primary ⬜

---

### D1 — Article Content `[DATA]`

**What:** Initial editorial content — 10 articles before launch promotion.

**Content plan:**
- 5 hidden gem product roundups
- 3 ingredient trend pieces
- 2 brand discovery pieces

**Acceptance criteria:**
- Each article has: title, cover image, body, at least 2 embedded product cards
- Each article has a Korean and English version
- All articles reviewed for editorial voice consistency before publish

**Status:** Not started ⬜

---

### D2 — Curated Product Catalog `[DATA]`

**What:** Initial curated product set. Not a large catalog — every product must have an editorial reason to be included. Starting point: existing 22 curated products from Olive Young KR Awards 2025 + Daiso KR best sellers.

**Acceptance criteria:**
- Each product has: name, brand, images, key ingredients, editorial tag, editorial note (1–2 sentences)
- Purchase links (Olive Young KR, Coupang)
- Products linked to relevant articles

**Status:** Adapt from existing data ⬜

---

## What's Cut from Old Kwip

| Feature | Reason |
|---|---|
| Routine Builder (`/routine/new`) | Not relevant for editorial model |
| Personal page (`/me`) | No routine builder, no need |
| Share routine image card | Replaced by article share |
| Concern filter + step filter | Replaced by editorial tags |
| Vietnamese locale | Korean is new primary |
| Google OAuth / accounts | Not needed at launch |

These are removed, not deferred. The editorial model does not require user accounts at launch.

---

## Out of Scope — April 2026

| Feature | When |
|---|---|
| TikTok/Shorts video pipeline | After article foundation is established |
| Brand partnership / sponsored content | After 500 subscribers |
| Personalization / user accounts | Not planned for 2026 |
| Native app | Not planned |
| Community / comments | Not planned |

---

## Success Metrics — First 90 Days

| Metric | Target | Why |
|---|---|---|
| Subscribers (email + KakaoTalk) | 500 | Only metric that matters in phase 1 |
| Articles published | 2/week | Editorial consistency builds algorithm trust |
| Article share rate | >10% of readers share | Measures editorial resonance |
| Return visit rate (7-day) | >20% | Readers coming back = editorial trust |
