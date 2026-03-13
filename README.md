# Kwip — Technical Specification

**K-beauty skin-issue solver for Vietnamese users.**
Core value: "I have a skin problem. Help me fix it." — not a catalog, not a review site.

---

## Overview

Vietnamese women discover K-beauty on TikTok but have no way to understand ingredients in Vietnamese. Kwip shows the shortest path from skin concern → ingredient logic (why it works) → purchase. Concern-first, not product-first.

**Target user:** Vietnamese women 20–35, K-beauty interested, buying on Shopee/TikTok Shop/Hasaki.

**Core flow:** Select concern → See ingredient highlights → Browse routine-grouped products → View product detail → Buy

---

## Tech Stack

| Area | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack dev) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth v4 (Google OAuth) |
| Database | Supabase (routine storage) |
| Data | Static JSON (309 products, ingredients, concerns) |
| Share card | `next/og` (Satori/ImageResponse) |
| i18n | Vietnamese + English (dictionaries in `src/dictionaries/`) |
| Font | Noto Sans |
| Deploy | Vercel |

---

## Commands

```bash
npm run dev              # Dev server with Turbopack (clears .next cache)
npm run build            # Production build — source of truth for errors
npm run pipeline:run     # Product discovery pipeline
npm run pipeline:promote # Promote staged product data
```

---

## Architecture

Single-page browsing model — all product discovery happens on the home page.

```
/[locale]/                      ← Home: concern filter → ingredient cards → routine-grouped products
/[locale]/products/[slug]       ← Product detail: ingredient breakdown + purchase links
/[locale]/me                    ← User profile: saved routines list
/[locale]/routine/new           ← Routine builder (requires auth)
/[locale]/routine/[id]          ← Routine detail + share card
```

### API Routes

```
GET/POST  /api/routines                  Routine CRUD
GET/DELETE /api/routines/[id]            Single routine
GET       /api/share/routine/[id]        Returns 1080×1920 PNG share card
GET/POST  /api/auth/[...nextauth]        NextAuth handlers
```

---

## Directory Structure

```
kwip/
├── public/
│   ├── fonts/                    # NotoSans-Regular.ttf, NotoSans-Bold.ttf (for share card)
│   └── images/products/          # Local product images (CDN URLs preferred)
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx          # Home
│   │   │   ├── products/[slug]/  # Product detail
│   │   │   ├── me/               # User profile
│   │   │   └── routine/
│   │   │       ├── new/          # Routine builder
│   │   │       └── [id]/         # Routine detail
│   │   └── api/
│   │       ├── routines/         # Routine CRUD
│   │       ├── share/routine/    # Share card image generation
│   │       └── auth/             # NextAuth
│   ├── components/
│   │   ├── home/                 # ConcernHub, ingredient cards, product groups
│   │   ├── routine/              # RoutineBuilderClient, ShareButton, etc.
│   │   └── shared/               # AuthButton, LanguageSwitcher, SearchButton
│   ├── data/
│   │   ├── products.json         # 309 products
│   │   ├── ingredients.json      # Ingredient dictionary (vi + inci + ko)
│   │   └── concerns.json         # 7 concerns with key ingredients
│   ├── dictionaries/
│   │   ├── vi.json               # Vietnamese strings
│   │   └── en.json               # English strings
│   └── lib/
│       ├── types.ts              # All type definitions
│       ├── supabase.ts           # Supabase client
│       ├── i18n.ts               # getDictionary, Locale type
│       └── brands.ts             # Brand display name lookup
├── docs/
│   ├── product-brief.md          # Product direction & strategy — READ BEFORE product decisions
│   ├── prd.md                    # Tactical requirements & launch scope
│   ├── design-system.md          # Type scale, colors, spacing rules
│   └── plans/                    # Feature design docs & implementation plans
└── scripts/
    └── pipeline/                 # Product data ingestion pipeline
```

---

## Data Schemas

### Product (`products.json`)

```typescript
interface Product {
  id: string;
  slug: string;
  name: { ko: string; vi: string; en: string };
  brand: string;
  category: Category;             // "cleanser" | "pad" | "toner" | "essence" | "serum" | "ampoule" | "mask" | "cream" | "sunscreen"
  image: string;                  // CDN URL or "/images/products/..."
  concerns: Concern[];            // ["acne", "hydration", ...]
  ingredients: ProductIngredient[];
  popularity: { rank: number; updatedAt: string };
  purchase: {
    shopee?: string;
    lazada?: string;
    oliveyoung?: string;
    tiktokShop?: string;
    hasaki?: string;
  };
  tags: string[];                 // ["best-seller", "sensitive-safe"]
}
```

### Ingredient (`ingredients.json`)

```typescript
interface Ingredient {
  id: string;
  name: { inci: string; vi: string; ko: string };  // no "en" — use "inci" for English
  description: { vi: string; en: string };
  effects: { concern: Concern; type: "good" | "caution"; reason: { vi: string; en: string } }[];
  ewgGrade?: string;
  category: string;
}
```

### Routine (Supabase `routines` table)

```typescript
interface Routine {
  id: string;
  user_id: string;
  name: string;
  concern: string;
  products: RoutineProduct[];     // sorted by step
  created_at: string;
}

interface RoutineProduct {
  productId: string;
  category: Category;
  step: number;                   // 1=cleanser → 9=sunscreen
}
```

---

## Concerns

7 concerns: `acne` | `pores` | `hydration` | `brightening` | `soothing` | `anti-aging` | `sun-protection`

## Routine Step Order

1. Cleanser → 2. Pad → 3. Toner → 4. Essence → 5. Serum → 6. Ampoule → 7. Mask → 8. Cream → 9. Sunscreen

---

## Key Rules

- All UI text via `src/dictionaries/vi.json` and `en.json` — no hardcoded strings
- Follow design system: `docs/design-system.md`
- Mobile-first, min 44px touch targets
- Ingredient `name` has no `en` field — use `inci` for English locale
- Bundle/deal products (names containing `[deal]`, `bundle`, `2-pack`, `3-pack`, ` kit`) are filtered from display
- `/[locale]/products` redirects to home — all browsing is on `/[locale]/`
- `.next` cache can corrupt — `npm run dev` auto-clears it; restart if you see webpack errors

---

## Environment Variables

```
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```
