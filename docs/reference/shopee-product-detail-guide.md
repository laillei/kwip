# Shopee Product Detail Page — Kwip Format Guide

> Reference for writing and building Shopee product detail pages in Kwip's style.
> Template HTML: `public/shopee-detail-v5.html` (Anua Heartleaf 77% Toner — canonical example)

---

## Content Sourcing Rules

**Before writing any copy, collect from these sources in order:**

1. **Olive Young KR product page** — official product name, key claims, awards, category rank if stated
2. **Brand's official website** (KR preferred, global as fallback) — ingredient %, clinical claims, free-from list, pH, certifications
3. **Brand's official SNS / press releases** — for any stat or comparison claim

**Hard rules:**
- Never fabricate rankings ("올리브영 1위") unless explicitly stated on Olive Young
- Never fabricate percentages or comparisons (e.g. "일반 토너 0.1%") — these must come from official sources
- Never use "7종 히알루론산" or any multi-type ingredient claim unless the brand explicitly states it for that product
- If a claim can't be sourced, cut it — do not estimate or infer

---

## Page Sections (in order)

### 1. HERO
**Purpose:** Hook — the skin moment this product is for

- Overline: skin type / concern category (e.g. `Soothing · Trouble Skin`)
- Headline: a moment or situation, not a product spec. Short, punchy.
  - Good: "진정이 필요한 날엔, 이것부터"
  - Bad: "당신의 피부에 진정이 필요할 때" (too formal/translated)
- Sub-desc: one factual sentence — the core ingredient story
- Product name, size, awards badge (only if officially awarded)

### 2. WHO IS THIS FOR
**Purpose:** Help the reader self-identify — not product categories, but real skin situations

- Headline: "이런 고민이라면 잘 맞을 거예요" (or similar — conversational, not directive)
- Chips: 4–5 specific skin situations. Write as the person's actual problem, not a category label.
  - Good: "이유 없이 올라오는 좁쌀 트러블"
  - Bad: "민감성 피부 타입" (too generic/cold)

### 3. CORE INGREDIENT
**Purpose:** Build ingredient trust — the main active, what % it is, what it does

- Big number: the % concentration (must be official)
- INCI name
- One-line sub: "전체 성분 중 X%가 [ingredient] 원액입니다"
- 3 ingredient action points (항균/진정/항산화 etc.) — sourced from brand or published literature on the ingredient
- No comparisons to other products unless brand-published

### 4. WHY IT WORKS
**Purpose:** Explain the mechanism simply — 4 cards, 2×2 grid

- Card title: short label (2–4 chars ideally)
- Card desc: 1–2 sentences in ~해요 tone. Explain what it does to the skin, not just what it contains.
- Stick to what's verifiable. If an effect is inferred (not clinically tested), write it as a natural consequence of the ingredient, not a tested claim.

### 5. AUTHENTICITY / SOURCING FLOW
**Purpose:** Build trust for cross-border purchase

- Steps reflect the actual logistics. Do NOT add steps that don't exist (e.g. "베트남 현지 창고" if shipping direct from Korea).
- Current Kwip model: Olive Young KR purchase → Kwip inspection → Direct ship from Korea → Customer
- Adjust per actual logistics as it evolves

### 6. ROUTINE STEP
**Purpose:** Tell the customer exactly where in their routine this goes

- Show 4 steps: cleanser → this product → serum/essence → cream
- Highlight the current product's step in accent color
- Body text: one sentence on timing + why it goes at this step

### 7. FORMULATION / FREE FROM
**Purpose:** Remove anxiety — list what's NOT in it

- Headline: certification first if available (e.g. "EWG 그린 등급, 전 성분 안심 설계")
- Grid: only list free-from claims that are officially stated by the brand
- Common: 무알코올, 무향, 파라벤 프리, 인공색소 無, 피부 자극 테스트 완료

### 8. HOW TO USE
**Purpose:** Practical — reduce friction, reduce returns

- 4 steps: cleanse → dispense → apply → frequency
- Factual, not copywritten. Just tell them what to do.

### 9. KWIP'S PROMISE
**Purpose:** Reduce purchase risk

- 100% 정품 보장 (올리브영 직소싱)
- 안전 포장
- 신선 유통기한 (입고일 기준 18개월 이상)
- Do NOT promise exchange/return policies you can't fulfill on Shopee

### 10. PRODUCT SPEC TABLE
**Purpose:** Reference info — brand, product name, volume, formulation type, country, sourcing

### 11. FOOTER
> 성분을 알면 스킨케어가 달라집니다 · 한국 뷰티 성분 해설, 베트남어로

---

## Kwip Copywriting Style

**Voice:** "The friend who studied cosmetic science" — warm, direct, knowledgeable. Not a brand, not an influencer.

**Tone rules:**
- Use ~해요/~예요 body (polite but casual) — never ~합니다 in descriptive copy
- Lead with the skin situation, not the ingredient
- Short sentences. Mix punchy with flowing.
- No "당신" — omit subject or use context
- No parallel spec-sheet formatting ("탁월한 X / 최적의 Y / 무자극 Z") — these feel robotic
- No translation-feel phrases: "피부 편을 들어드립니다", "~야 합니다", "~해드립니다"

**What to write in Korean first, then translate to Vietnamese:**
All copy is drafted in Korean → reviewed → translated. Never write Vietnamese first.

---

## Design Tokens (do not change)

```
--bg: #ffffff
--bg-soft: #f9f9f8
--border: #efefed
--text-primary: #111110
--text-secondary: #666664
--text-tertiary: #767674
--accent: #2a6e4a
--accent-bg: #f0f7f3
--accent-mid: #c8e6d6
```

Cards inside `section-soft` backgrounds must use `background: var(--bg)` for contrast.
Icons: Google Material Symbols Outlined only. No emoji.

---

## Checklist for Each New Product

- [ ] Fetch brand official site — do NOT rely on memory or product name alone
- [ ] Verify key ingredient % by fetching official product page (exact quote required)
- [ ] Verify ingredient list order via INCIDecoder or official page
- [ ] Note only claims explicitly stated on official page: free-from, certifications, pH, awards
- [ ] Cross-check: does the product name number (e.g. "96") match the stated % on the page?
- [ ] Draft copy in Korean — hero moment, who it's for, ingredient story
- [ ] Review: any number, %, ranking, or comparison not from official source? Remove.
- [ ] Review: does any sentence sound like a translation? Rewrite.
- [ ] Build HTML from `shopee-detail-v5.html` template
- [ ] Update sourcing flow to match actual logistics
- [ ] Translate to Vietnamese

## What Requires Explicit Verification Before Use

These must come from the official brand page (fetched, not assumed):
- Ingredient percentages (e.g. 77%, 96%) — product name ≠ confirmed %
- Free-from claims (alcohol-free, fragrance-free, etc.)
- Certifications (EWG, dermatologist-tested, hypoallergenic)
- pH values
- Awards and rankings
- Country of manufacture

Ingredient functions (e.g. allantoin soothes, niacinamide brightens) may be stated based on published cosmetic science — but must be presented as ingredient properties, not brand claims.
