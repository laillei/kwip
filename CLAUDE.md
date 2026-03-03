# Kwip — Project Specification

**K-beauty ingredient verification web service for Vietnamese Gen Z**

---

## Overview

Vietnamese Gen Z discovers K-beauty on TikTok but has no way to verify ingredients in Vietnamese. Kwip fills that gap: check ingredients, see what's popular, and buy — all in Vietnamese.

**Target user:** 18–28 year-old Vietnamese women. They discover K-beauty on TikTok, can read English but prefer Vietnamese, and buy through Shopee, TikTok Shop, or Hasaki. Their need is not discovery — it's **verification** ("Is this actually good for my skin?").

**Core flow:** Skin concern → Popularity ranking → Ingredient card → Purchase link

---

## Tech Stack

| Area | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSG for 100 products, SEO |
| Language | TypeScript | Type safety for ingredient data |
| Styling | Tailwind CSS | Mobile-first |
| Data | Local JSON (Phase 1) | 100 products, no server needed |
| Storage | localStorage (Phase 1) | No login |
| Deploy | Vercel | Global CDN via Cloudflare |
| Weather API | OpenWeatherMap (Free) | Daily context feature |
| Analytics | Vercel Analytics + GA4 | KPI tracking |

---

## Directory Structure

```
kwip/
├── public/
│   ├── images/products/          # Product images (100)
│   ├── og-image.png
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (fonts, meta, analytics)
│   │   ├── page.tsx              # Home: concern selection
│   │   ├── products/
│   │   │   ├── page.tsx          # Popularity ranking list
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Ingredient card detail
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── home/
│   │   │   ├── ConcernSelector.tsx     # 4 concern cards
│   │   │   └── DailyContext.tsx         # Weather-based context
│   │   ├── products/
│   │   │   ├── ProductCard.tsx          # Ranking list item
│   │   │   ├── ProductList.tsx          # Ranked list container
│   │   │   ├── RankBadge.tsx            # Rank badge (top 3 highlighted)
│   │   │   └── ConcernFilter.tsx        # Concern filter tabs (sticky)
│   │   ├── detail/
│   │   │   ├── IngredientCard.tsx       # Main ingredient card
│   │   │   ├── IngredientItem.tsx       # Single ingredient row
│   │   │   ├── SkinMatchBadge.tsx       # "Good for / Caution" badge
│   │   │   └── PurchaseLinks.tsx        # Shopee/TikTok Shop/Hasaki
│   │   └── shared/
│   │       ├── ZaloShareButton.tsx
│   │       ├── BackButton.tsx
│   │       └── LoadingSpinner.tsx
│   ├── data/
│   │   ├── products.json               # 100 product master data
│   │   ├── ingredients.json            # Ingredient dictionary (Vietnamese)
│   │   └── concerns.json              # Concern-to-ingredient mapping
│   ├── lib/
│   │   ├── types.ts                    # All type definitions
│   │   ├── storage.ts                  # localStorage wrapper
│   │   ├── weather.ts                  # Weather API call
│   │   ├── products.ts                # Product filter/sort utils
│   │   └── tracking.ts                # Event tracking helper
│   └── styles/
│       └── globals.css                 # Tailwind base + custom vars
├── scripts/
│   └── validate-data.ts               # JSON schema validation
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Data Schemas

### Product (`products.json`)

```typescript
interface Product {
  id: string;                    // "anua-heartleaf-toner"
  slug: string;                  // URL slug
  name: {
    ko: string;                  // Korean name
    vi: string;                  // Vietnamese name
    en: string;                  // English/original name
  };
  brand: Brand;
  category: Category;
  image: string;                 // "/images/products/anua-toner.webp"
  concerns: Concern[];           // ["acne", "moisturizing"]
  ingredients: ProductIngredient[];
  popularity: {
    rank: number;                // Shopee Vietnam ranking
    updatedAt: string;           // "2026-03-01" (weekly update)
  };
  purchase: {
    shopee?: string;
    tiktokShop?: string;
    hasaki?: string;
  };
  tags: string[];                // ["best-seller", "sensitive-safe"]
}

interface ProductIngredient {
  ingredientId: string;          // Reference to ingredients.json
  order: number;                 // INCI order (by concentration)
  isKey: boolean;                // Key ingredient (shown at top)
}
```

### Ingredient (`ingredients.json`)

```typescript
interface Ingredient {
  id: string;                    // "niacinamide"
  name: {
    inci: string;                // "Niacinamide" (international standard)
    vi: string;                  // Vietnamese
    ko: string;                  // Korean
  };
  description: {
    vi: string;                  // Simple Vietnamese explanation (1-2 lines)
  };
  effects: {
    concern: Concern;
    type: "good" | "caution";
    reason: {
      vi: string;                // Vietnamese explanation
    };
  }[];
  ewgGrade?: string;
  category: IngredientCategory;
}
```

### Concern Map (`concerns.json`)

```typescript
interface ConcernMap {
  id: Concern;
  label: {
    vi: string;                  // "Mụn"
    ko: string;                  // "여드름"
  };
  icon: string;
  keyIngredients: string[];      // Key ingredient IDs for this concern
  weatherTrigger: {
    condition: string;           // "high_humidity" | "high_uv" | "dry"
    message: {
      vi: string;               // Weather-based context message
    };
  };
}
```

### Shared Types

```typescript
type Brand = "cosrx" | "anua" | "torriden" | "beauty-of-joseon" | "round-lab" | "skin1004";
type Category = "toner" | "serum" | "sunscreen" | "cream" | "pad";
type Concern = "acne" | "moisturizing" | "brightening" | "anti-aging";
type IngredientCategory = "active" | "moisturizer" | "emollient" | "surfactant" | "preservative" | "fragrance" | "other";
```

---

## Pages

### Home (`/`)

- **Purpose:** Select skin concern to begin exploration
- **Layout:** Daily context (1-line weather banner, top) + 4 concern cards (2x2 grid)
- **Daily context effect:** Weather condition highlights the matching concern card (e.g., high UV → sunscreen/brightening card gets a subtle "Recommended today" badge). This creates a daily reason to revisit.
- **Concern persistence:** If `selectedConcern` exists in localStorage, show a "Continue with [concern]" shortcut above the grid for returning users.
- **Action:** Selecting a concern stores it in localStorage and navigates to `/products?concern=acne`
- **Weather fallback:** If weather API fails, hide the daily context banner entirely. Do not show an error.
- **Data:** Weather API (client-side), concerns.json (static)

### Ranking (`/products?concern=acne`)

- **Purpose:** Browse products by popularity for selected concern
- **Layout:** Concern filter tabs (sticky top) + product card list
- **Sort:** `popularity.rank` ascending (global Shopee rank, filtered by concern — ranks may be non-contiguous, this is intentional)
- **Ranking label:** Display as "Phổ biến tại Việt Nam" (Popular in Vietnam). Do NOT claim exact sales ranking.
- **Sub-filter:** Category tabs (toner/serum/sunscreen/cream/pad)
- **Concern tab behavior:** Switching concern tabs updates URL query param and stores selection in localStorage. Default tab on page load = `selectedConcern` from localStorage, or "acne" if none.
- **Empty state:** If no products match concern + category combo, show message: "Chúng tôi đang cập nhật thêm sản phẩm" (We're adding more products)
- **Action:** Tapping a product navigates to `/products/[slug]`

### Ingredient Detail (`/products/[slug]`)

- **Purpose:** Final ingredient verification before purchase
- **Layout:** Product image + key ingredient summary + full ingredient list + purchase links
- **Key ingredients:** `isKey=true` items shown as cards at top
- **Full list:** INCI order, each with good/caution badge
- **Purchase:** Shopee/TikTok Shop/Hasaki buttons (show only available ones). If ALL links are missing, show a "Search on Shopee" button that links to a Shopee search query with the product name.
- **Share:** Zalo share button (sticky bottom, next to purchase button)
- **OG meta:** Each product page must have dynamic OG tags (title=product Vietnamese name, description=key ingredient summary in Vietnamese, image=product image). Critical for Zalo link previews.
- **Data:** SSG (statically generated at build time)

### API Route

```
GET /api/weather?city=hochiminh
```

OpenWeatherMap free tier, 1-hour cache via Next.js revalidate. Only API route in Phase 1.

---

## Event Tracking

```typescript
type TrackingEvent =
  | { event: "concern_select"; concern: Concern }
  | { event: "product_view"; productId: string; rank: number }
  | { event: "ingredient_expand"; productId: string }
  | { event: "purchase_click"; productId: string; platform: "shopee" | "tiktok" | "hasaki" }
  | { event: "zalo_share"; productId: string }
  | { event: "daily_context_view"; weatherCondition: string }
  | { event: "category_filter"; category: Category };
```

| KPI | Target | Tracking |
|---|---|---|
| Monthly visitors | 3,000 | GA4 pageviews |
| 7-day retention | 15% | GA4 retention |
| Purchase click rate | 10% | `purchase_click` / total visits |
| Zalo share rate | 0.05/visit | `zalo_share` / total visits |
| Ingredient card depth | avg 2+ | `product_view` per session |
| Ranking → detail rate | 30% | `product_view` / `concern_select` |

---

## localStorage

```typescript
interface KwipStorage {
  selectedConcern: Concern | null;  // Persists across sessions, used as default filter
  recentProducts: string[];         // Last viewed slugs (max 20)
  lastVisit: string;                // ISO date
}

const STORAGE_KEY = "kwip_v1";
```

---

## Mobile UI Rules

- Min touch target: 44px
- Concern selector: 2x2 grid, card height min 120px
- Ranking list: Card-based, vertical scroll (no swipe)
- Ingredient card: Accordion expand/collapse for key ingredients
- Purchase button: Sticky bottom
- Zalo share: Next to purchase button
- Font: **Noto Sans** (full Vietnamese diacritics support guaranteed)
- All user-facing text in Vietnamese

---

## Development Phases

### Phase 1 — Project Setup
1. Initialize Next.js 14 + TypeScript + Tailwind
2. Create directory structure
3. Define types (`lib/types.ts`)
4. Write sample data (3 products in products.json, ingredients.json, concerns.json)
5. Data validation script

### Phase 2 — Core Pages
1. Home → ConcernSelector (4 concern cards)
2. Product list → ProductList + ConcernFilter + RankBadge
3. Ingredient detail → IngredientCard + IngredientItem + SkinMatchBadge
4. Purchase links → PurchaseLinks
5. Page navigation

### Phase 3 — Supporting Features
1. DailyContext (weather API integration)
2. ZaloShareButton
3. localStorage save/load
4. Event tracking integration

### Phase 4 — Polish
1. Mobile responsive optimization
2. OG image / SEO meta tags
3. Performance (webp images, font subsetting)
4. Vercel deployment config

---

## What We Don't Build

- No native app (web only)
- No monetization (validate traffic first)
- No multi-language (Vietnamese only)
- No AI ingredient analysis (human-curated data is more trustworthy)
- No user reviews (content moderation cost > value)
- No community, comparison, or wishlist features
- No login in Phase 1 (localStorage only; Zalo login at 3,000 MAU)
