# Kwip — Product Brief
**Last updated:** March 2026

---

## What Is Kwip

Kwip is Vietnam's first concern-first K-beauty discovery tool.

It answers one question: **"I have a skin problem — what should I use, and why?"**

Not a product catalog. Not an ingredient checker. Not a review site.
The shortest path from skin concern → ingredient logic → confident purchase, in Vietnamese.

---

## The Problem

Vietnamese women are the most ingredient-literate skincare consumers in Southeast Asia — **51% actively research ingredients before buying** (highest in SEA, Global Market Surfer). But every tool built for ingredient research is English-first or Korean-only: CosDNA, SkinCarisma, INCIDecoder. Vietnamese e-commerce (Shopee, Hasaki, TikTok Shop) has zero ingredient education layer.

The result: women who want to understand what they're buying have no Vietnamese-language system that connects their skin concern to the right ingredient to the right product. They piece it together from TikTok influencers (opinionated, agenda-driven) and foreign-language databases (accurate, but inaccessible).

**The gap:** Vietnamese language + concern-first framing + ingredient logic + direct purchase path. No competitor does all four.

---

## The Market

**Vietnam skincare market:** USD 1.20B (2024) → USD 2.97B by 2034, CAGR 9.5%
*(Expert Market Research, 2025)*

**K-beauty dominance:** ~30% of all imported cosmetics sold in Vietnam — largest single origin. Innisfree, Laneige, Some by Mi lead on active ingredient marketing.
*(MEIYUME Vietnam Trend Report 2023–2024)*

**Consumer base:** 95% of urban women (25–45) use skincare products regularly, spending ~$30/month. 12M+ urban consumers actively seeking premium skincare.
*(Q&Me Vietnam Cosmetic Usage Analysis 2022 / Expert Market Research)*

**Top skin concerns** (61.4M social media discussions, Oct 2024–Sep 2025, Buzzmetrics):
- Oily skin: **47.4%** of all skin condition mentions
- Sensitive skin: **23.7%**
- Survey-stated: wrinkles, uneven skin tone, acne (Q&Me, 200 urban women 25–44)

**Ingredient awareness:**
- 51% of Vietnamese Gen Z women carefully research ingredients before buying — highest in SEA
- 49% cite ingredients as a top-3 purchase driver
- 27.78% of female buyers name ingredient transparency specifically as a purchase reason
*(Global Market Surfer / Statista 2023)*

**Discovery channels:**
- TikTok Shop: 39% of Vietnam e-commerce (H1 2025), up from 29% in 2024, Beauty is #1 category
- 77% of Vietnamese online consumers have bought based on KOL recommendation
- Zalo: 76.5M monthly users — primary peer recommendation platform
- Facebook groups: primary channel for skincare discussion and peer reviews

---

## Target Users

### Primary: The Ingredient Researcher
Vietnamese urban woman, 20–32, K-beauty user.
- Knows actives by name: niacinamide, BHA, centella, hyaluronic acid
- Oily or acne-prone skin (dominant concern in market data)
- Currently researches on CosDNA or SkinCarisma — English, no Vietnamese, no purchase path
- Discovers products on TikTok but wants the science to back it up before buying
- **Job to be done:** Build a routine that actually works for her skin, not just what's trending

### Secondary: The Trust-Seeker
Vietnamese urban woman, 28–40, meaningful spending power.
- Concerned about dark spots, uneven tone, early aging
- Doesn't know ingredient names but wants a trusted source — not a salesperson, not an influencer
- Currently relies on beauty counter staff or Facebook group advice
- **Job to be done:** Make a confident purchase decision without being misled

---

## Value Proposition

### For the Ingredient Researcher:
> For Vietnamese women who research ingredients before buying K-beauty, Kwip is a concern-first discovery tool that explains the science behind every recommendation in Vietnamese — unlike ingredient checkers, we connect the why directly to the buy.

### For the Trust-Seeker:
> For Vietnamese women who want effective skincare but feel lost decoding ingredient labels, Kwip is a trusted advisor that translates ingredient science into Vietnamese and turns it into a concrete routine — unlike beauty counters or KOLs, we have no sales agenda.

---

## Competitive Position

| Tool | Vietnamese | Concern-first | Ingredient logic | Purchase path |
|---|---|---|---|---|
| CosDNA | ✗ | ✗ | Partial | ✗ |
| SkinCarisma | ✗ | ✗ | ✓ | Affiliate |
| INCIDecoder | ✗ | ✗ | ✓ (best in class) | ✗ |
| Hwahae (Korea) | ✗ | ✓ | ✓ | ✓ |
| Hasaki / Shopee | ✓ | ✗ | ✗ | ✓ |
| TikTok KOLs | ✓ | Partial | ✗ | ✓ |
| **Kwip** | **✓** | **✓** | **✓** | **✓** |

**Closest global analog:** Hwahae — Korea's #1 beauty app (13M downloads), concern + ingredient + community → commerce. Built for Korean users, inaccessible to Vietnamese users. Kwip is Hwahae for Vietnam.

**Moat:** Vietnamese is not a language anyone else is building for in this category. The combination of localization + concern framing + ingredient logic is the defensible position. A global player could localize, but they would need to rebuild the concern-first UX and Vietnamese ingredient explanations from scratch.

---

## Product (Current State — March 2026)

Single-page web app (Next.js, mobile-first):

```
/[locale]/
  Concern selector (filter chips, single-select)
    → Ingredient highlight (key actives for selected concern)
    → Routine-grouped product grid (cleanser → sunscreen)
      → Each product card shows why it fits the concern

/[locale]/products/[slug]
  Full ingredient breakdown
  Purchase links
```

**What works:**
- Concern → product flow in Vietnamese and English
- Ingredient logic visible on every product card
- Routine grouping (step order: cleanser → pad → toner → essence → serum → ampoule → mask → cream → sunscreen)
- 7 concern categories covering the top Vietnamese skin issues

**What's missing (near-term):**
- More products in the catalog (current catalog is small)
- Ingredient detail pages (what does niacinamide actually do?)
- Search
- Purchase links (affiliate integration)

---

## Roadmap

### By End of March 2026 — Service Brief Complete
- [ ] Product brief finalized (this document)
- [ ] Core UX validated: concern → ingredient → product flow working cleanly
- [ ] Design system consistent across all screens
- [ ] Catalog quality: no duplicate images, all concern-product mappings accurate
- [ ] Both locales (vi/en) fully functional

### Q2 2026 — Catalog & Content Depth
- Expand product catalog (target: 50–80 products across all 7 concerns)
- Add ingredient detail pages — Vietnamese explanations for top 20 actives
- Add purchase links via Hasaki/Shopee affiliate
- Basic search functionality

### Q3 2026 — Distribution
- Partner with 2–3 Vietnamese skincare KOLs as authentic users (not paid placements)
- TikTok-native content format: "why this ingredient works for [concern]"
- Entry point: TikTok/Zalo share link → Kwip discovery session
- Target: first 1,000 monthly active users

### Q4 2026 — Revenue
- Affiliate commission live (Hasaki + Shopee, ~3–8% per sale)
- Track conversion: concern selection → product click → purchase
- Identify which concerns drive the most purchase intent

### 2027 — Defensibility
- User skin profiles: save your concern + routine
- Personalized new product alerts
- Routine history — this is what makes Kwip sticky and hard to replicate

---

## Business Model

**Phase 1 (now–Q3 2026): Build trust, zero monetization**
Establish editorial independence. Never take brand money to influence recommendations. This is the foundation of the trust advantage.

**Phase 2 (Q4 2026): Affiliate commerce**
Affiliate links to Hasaki.vn, Shopee, Tiki. Commission per purchase (~3–8%). Incentive stays aligned: Kwip only earns when users actually buy, so recommendations must be genuinely good.

**Phase 3 (2027+): Brand partnerships (with guardrails)**
K-beauty brands pay for "ingredient spotlight" content — not to change product rankings, but to explain the science behind their hero ingredients. Editorial policy must be public and enforced.

**Why not subscription:** Only viable once users depend on the product daily (personalized routines, skin tracking). Premature before 10K engaged users.

**Revenue benchmark (Hwahae analog):** Hwahae generated $10M+ revenue in Korea through a combination of brand partnerships and in-app commerce. Vietnam is a smaller market but the ingredient-education gap is larger — first-mover advantage is significant.

---

## Key Risks

| Risk | Mitigation |
|---|---|
| Catalog too small to be useful | Focus depth over breadth — cover 7 concerns well before expanding |
| Users trust KOLs more than tools | Partner with KOLs as users, not competitors |
| Global player localizes Vietnamese | Move fast on content moat (ingredient explanations) — data is copiable, but quality Vietnamese content takes time |
| Affiliate links damage trust | Never hide affiliate status; editorial policy public from day one |
| Vietnamese consumers won't pay (if subscription) | Avoid subscription until retention data supports it |

---

## Success Metrics (End of 2026)

- **Activation:** >40% of visitors select a concern
- **Engagement:** >25% of concern-selectors click through to a product
- **Retention:** >20% return within 30 days
- **Revenue:** First affiliate commission earned
- **Trust signal:** Organic mentions in Vietnamese skincare communities (Facebook groups, Zalo)
