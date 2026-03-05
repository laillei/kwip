# IA Revision — "Hwahae-style" Concern Hub

**Date:** 2026-03-05
**Status:** Approved

---

## Problem

Current site has 3 routes but only 2 distinct experiences. Home (`/`) and Products (`/products`) are essentially the same product grid with concern pills + category tabs. There's no real "home" experience — no orientation, no daily context, no hierarchy.

## Decision

Option A: "Hwahae-style" — Concern Hub + Ranking

## Site Map

```
/                          → Home (concern hub + daily context + featured)
/products?concern=acne     → Product ranking list (filtered by concern)
/products/[slug]           → Product detail (ingredients + purchase)
```

3 routes, 3 distinct purposes:

| Page | Purpose | Primary Action |
|------|---------|----------------|
| Home `/` | Orient: "What do I care about?" | Pick a concern |
| Products `/products` | Browse: "What's popular for my concern?" | Pick a product |
| Detail `/products/[slug]` | Verify: "Is this good for me?" | Buy or share |

## Home Page (`/`)

```
┌──────────────────────────────┐
│  Kwip              [🔍] [EN] │
│                              │
│  ☀️ Hôm nay: UV cao, nên    │
│  dùng kem chống nắng         │
│                              │
│  Bạn quan tâm điều gì?      │
│  ┌──────────┐ ┌──────────┐   │
│  │ 🧴 Mụn   │ │ 💧 Cấp ẩm│   │
│  │  32 sp   │ │  28 sp   │   │
│  └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐   │
│  │ ✨ Sáng  │ │ 🌿 Lão   │   │
│  │  25 sp   │ │  15 sp   │   │
│  └──────────┘ └──────────┘   │
│                              │
│  🔥 Sản phẩm nổi bật        │
│  [horizontal scroll cards]   │
└──────────────────────────────┘
```

Sections:
1. **Header**: Logo + search icon + language switcher
2. **Daily context banner**: Weather-based skincare tip (1 line). Hide on API fail.
3. **Concern grid**: 2×2 cards with icon, label, product count. Tap → `/products?concern=X`
4. **Featured products**: Horizontal scroll of top 5 best-sellers across all concerns. Tap → detail page.

## Products Page (`/products?concern=acne`)

```
┌──────────────────────────────┐
│  ← Mụn               [🔍]   │
│  [Tất cả][Serum][Kem]...    │
│                              │
│  Product grid (ranked)       │
└──────────────────────────────┘
```

Changes from current:
- Header shows back arrow + concern name (not "Kwip" logo)
- Concern pills REMOVED — user already chose concern on home page
- Category tabs remain (Serum, Cream, Toner, Sunscreen, Pad)
- Search icon in header

## Detail Page (`/products/[slug]`)

No structural changes. Keep current layout:
- Back button → returns to product list (with concern param)
- Product hero with rank number
- Key ingredients cards
- Full ingredient list
- Sticky purchase bar

## Search

- Small search icon (🔍) in header on all pages
- Tapping opens a full-screen overlay/sheet
- Simple text input, filters products by name and brand
- Results show as a compact list
- Phase 1: client-side filter over 100 products (no API needed)

## Key Principles

- **Concern-first**: Every user journey starts with "what's my skin concern?"
- **3 distinct levels**: Each page has one clear job
- **Daily revisit**: Weather context gives a reason to come back
- **Search as escape hatch**: For users who already know what they want
