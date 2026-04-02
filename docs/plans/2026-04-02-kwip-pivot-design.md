# Kwip — Pivot Design Doc
**Date:** April 2, 2026
**Status:** Draft

---

## Why We're Pivoting

The original Kwip was built for Vietnamese consumers — concern-first K-beauty discovery with ingredient education in Vietnamese. The geopolitical situation has made the Vietnamese market inaccessible for now.

New direction: **Kwip becomes a Korean-language editorial K-skincare discovery site**, starting as a personal blog, growing into a trusted trend authority.

---

## The New Core Thesis

Korean consumers are drowning in K-beauty content — Hwahae has reviews, Olive Young has sales data, Instagram has influencers. But nobody is consistently surfacing **what's emerging before it goes mainstream** with real editorial conviction.

Kwip's new bet: **Be the person who calls it first.** A trusted editorial voice that discovers underrated and rising K-skincare products and trends before they blow up. The Pitchfork of K-beauty, not the Billboard.

**The character:** Not a reviewer. Not an influencer. The person in your friend group who always knew about the product 3 months before everyone else — and can explain exactly why it works.

---

## Target Audience

**Korean consumers interested in skincare** — broad entry point, no demographic restriction. The common thread is curiosity: they want to discover something new, not confirm what they already know.

**Primary visitor archetype:** Someone who watched a TikTok/YouTube Short and wants the full story — the complete product list, the ingredient reasoning, the context they can't get in 60 seconds.

---

## Editorial Angle

**Trend + Discovery** — surface emerging K-skincare products and ingredients before they go mainstream.

This means:
- Products that are rising but not yet household names
- Ingredients getting traction in Korean dermatology/lab circles before hitting mass market
- Brand stories that haven't been told in mainstream beauty media
- "Why this will be huge" takes, not "this is already huge" recaps

The editorial value is **being early and being right**. One accurate early call builds more audience trust than ten good retrospective reviews.

---

## Product Structure

### Content Model

Two content types:

**1. Articles (editorial entry point)**
- Trend pieces, product roundups, ingredient deep-dives
- Format: "아무도 모르는 숨겨진 명품 5개", "2026년 하반기를 지배할 성분", "올리브영보다 먼저 알아야 할 브랜드"
- Length: 500–1500 words — long enough to be useful, short enough to read on mobile
- Each article embeds product cards inline

**2. Product Cards (browsing layer)**
- Curated product entries: image, brand, name, short editorial note ("왜 주목해야 하는가")
- Not a catalog — every product has a reason it's here
- Linked from articles and browsable independently

### Information Architecture

```
/                        ← Home: latest articles feed + featured products
/article/[slug]          ← Article detail: editorial piece + embedded product cards
/products                ← Product discovery: browsable curated grid with editorial tags
/products/[slug]         ← Product detail: full info + purchase links + related articles
/subscribe               ← Newsletter/KakaoTalk Channel subscription CTA
```

### Editorial Tags on Products

Replace concern-filter with editorial signal tags:
- `지금 뜨는` (Rising now)
- `숨겨진 명품` (Hidden gem)
- `성분 주목` (Ingredient watch)
- `편집장 픽` (Editor's pick)
- `곧 품절` (About to sell out)

---

## Distribution Strategy

### Primary: TikTok + YouTube Shorts → Kwip

The content loop:
1. **Short-form video** (60s) covers the trend/product angle with a hook
2. **"전체 리스트/기사는 링크에서"** — drives to the full article on Kwip
3. **Kwip article** delivers the depth: full product list, ingredient reasoning, context
4. **Subscribe CTA** at the end of every article converts visitors to subscribers

This is the only distribution that matters in the first 3 months. Everything else is secondary.

### Secondary: Comment Authority

Comment on popular K-skincare TikToks with specific, sharp insight. Not promotion — genuine value. Builds profile clicks organically. Zero cost.

### KakaoTalk Channel + Email

The real core audience = subscribers, not visitors. Visitors are fleeting. Subscribers are the business.

Every article ends with a single CTA: subscribe to get early picks before they go mainstream. Frame it as exclusive access, not a newsletter.

---

## Core Visitor Acquisition — Phase 1 Goal

**The only metric that matters in months 1–3: subscriber count.**

Not pageviews. Not social followers. Subscribers — people who opted in to hear from Kwip again.

**Why:** Pageviews don't compound. Subscribers do. A visitor who subscribes after reading one article is worth 50x a visitor who leaves.

**Target:** 500 subscribers before any other growth initiative.

**How to get there:**
1. Publish 2 articles/week minimum — consistency builds algorithm trust on TikTok
2. Every video has one CTA: "링크에서 전체 리스트 + 구독"
3. First 10 articles should be the "hidden gem" format — highest shareability on KakaoTalk
4. Engage in skincare communities (NaverCafe, DC Inside 뷰티 갤러리) as a contributor, not a promoter

---

## What Changes vs. Old Kwip

| | Old Kwip | New Kwip |
|---|---|---|
| Target market | Vietnam | Korea |
| Language | Vietnamese + English | Korean (primary) |
| Entry point | Concern filter | Articles feed |
| Core content | Ingredient education | Trend editorial |
| Product curation basis | Concern + routine step | Editorial picks |
| Distribution | Facebook/YouTube ads (paid) | TikTok/Shorts (organic) |
| Monetization | Affiliate → brand deals | None now → brand partnerships later |
| Auth/accounts | Core feature (routine builder) | Not needed at launch |
| Success metric | Concern selection rate | Subscriber count |

---

## What Stays from Old Kwip

- **Product cards** — core UI component, reuse with editorial tags instead of ingredient signal
- **Product detail pages** — keep, add purchase links
- **Design system** — type scale, colors, spacing unchanged
- **Next.js/Supabase stack** — no change
- **Bilingual routing** — keep `/[locale]/` structure, add `ko` as primary locale

---

## What Gets Cut

- **Routine Builder** — not relevant for editorial site
- **Personal page (/me)** — not relevant without routine builder
- **Shareable routine image card (F4)** — replaced by article share cards
- **Concern filter + step filter** — replaced by editorial tags
- **Vietnamese locale as primary** — Korean becomes primary

---

## New Content Priorities (First 30 Days)

1. **5 "hidden gem" product roundups** — highest KakaoTalk shareability
2. **3 ingredient trend pieces** — "왜 이 성분이 2026년을 지배하는가"
3. **2 brand discovery pieces** — underrated brands with strong formulations
4. **Subscribe page** — single focused page, clear value prop

Total: ~10 articles before any paid promotion. This is the editorial foundation.

---

## Monetization (Future)

No monetization at launch. Build audience first.

When ready:
- **Sponsored content / brand partnerships** — brands pay for editorial features (clearly labeled as sponsored)
- **Never:** algorithmic ranking manipulation, undisclosed affiliate links, pay-to-play product placement

Editorial independence is the product. Once compromised, the trust that makes Kwip valuable is gone.

---

## Success Metrics

| Phase | Metric | Target |
|---|---|---|
| Month 1–3 | Subscribers | 500 |
| Month 3–6 | Monthly returning visitors | 2,000 |
| Month 6+ | Article shares (KakaoTalk + TikTok) | >50 per article |
| Long-term | "Called it first" reputation | Qualitative — readers cite Kwip as discovery source |

---

## Resolved Decisions

| Question | Decision |
|---|---|
| Author identity | Kwip as the editorial voice — no named author, brand-first |
| Content language | Korean (primary) + English — bilingual for SEO reach |
| Content pipeline | Article-first. Video (TikTok/Shorts) comes later as distribution layer |
| Brand name | Kwip stays — it's a brand, not a keyword |
