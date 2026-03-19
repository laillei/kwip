# Kwip — Core Vision & Essential Structure

## Core Value

**"I have a skin problem. Help me fix it."**

Kwip is a skin-issue solver for Vietnamese K-beauty consumers. Not a product catalog, not a review platform, not an ingredient database — a tool that gives the shortest path from a skin concern to a trustworthy product recommendation.

## Why Kwip Exists

Brands upload product info on Shopee/Lazada, but users still don't understand what ingredients DO for their skin. AI search requires knowing what to ask. YouTube takes 10-20 minutes for one recommendation. Nobody shows the ingredient logic — the WHY — in a simple, visual way connected to your specific concern.

## Kwip's Differentiator

**Trust through understanding.** Not just "buy this top-ranked product" but "here's WHY this works for your concern, because of THESE ingredients."

> Salicylic Acid — unclogs pores from inside → these 5 products have it → buy here

That connection — concern → ingredient logic → product — in one glance. No other platform does this.

## What Kwip Is NOT

- Not a product catalog (Oliveyoung does that)
- Not a review platform (Hwahae does that)
- Not an ingredient database (CosDNA does that)
- Not a marketplace (Shopee/Lazada do that)

## Essential IA

```
Home (Concern Selector)
│   Multi-select concerns → instant filter
│   Shows: key ingredients + matching products together
│
├── Product Detail (/products/[slug])
│   Hero + ingredient breakdown with per-concern effects
│   Purchase links (Shopee, Lazada, Hasaki, etc.)
│
└── Search (overlay modal)
    Quick escape hatch for users who know what they want
```

### User Flow

1. User sees 7 concern buttons on home
2. Taps "Acne" → results appear below (ingredients that help + products containing them)
3. Optionally taps another concern (e.g., "Hydration") → results update to show products addressing BOTH
4. Taps a product → detail page with full ingredient breakdown
5. Taps purchase link → goes to Shopee/Lazada/Hasaki

### Design Principles

- **Quick and simple** — value in under 10 seconds
- **Skin-issue first** — everything starts from the user's concern
- **Ingredient = trust layer** — not a feature, but the reason users believe the recommendation
- **Show value before asking anything** — no surveys, no sign-up, no friction
- **Multi-select, not quiz** — let users refine naturally by tapping multiple concerns
- **Mobile-first** — min 44px touch targets, Vietnamese text with Noto Sans

### Data Model (unchanged)

- 7 Concerns with keyIngredients per concern
- ~150 Ingredients with effects[] (good/caution per concern)
- ~100 Products with concerns[], ingredients[], purchase links
- Products filtered by matching ALL selected concerns
