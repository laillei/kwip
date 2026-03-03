# Phase 2 Design: Core Pages

**Date:** 2026-03-03
**Scope:** 3 core pages with navigation, static data, no weather/localStorage/tracking

## Style Direction

- Black/dark background, white text, minimal color
- K-beauty platform aesthetic — clean, editorial, not playful
- Only color accents: subtle green for "good" ingredients, subtle amber for "caution"
- Purchase buttons are the only bold UI elements

## Pages

### Home (`/`)

- Full-screen centered layout
- Kwip title + Vietnamese subtitle
- 4 concern cards in 2x2 grid (loaded from concerns.json)
- Each card: icon + Vietnamese label, dark gray card with subtle border
- Tap navigates to `/products?concern={id}`
- No weather banner (Phase 3)
- No "Continue with" shortcut (Phase 3, needs localStorage)

### Ranking (`/products?concern=X`)

- Concern filter tabs at top (sticky), 4 tabs from concerns.json
- Active tab: white underline
- Default tab: first concern ("acne") if no query param
- Product cards in vertical list, sorted by popularity.rank ascending
- Each card: rank number, Vietnamese product name, brand, category
- Tap navigates to `/products/[slug]`
- Label: "Phổ biến tại Việt Nam"
- Empty state message if no products match
- Back to home via Kwip logo/link in header

### Detail (`/products/[slug]`)

- Statically generated (generateStaticParams from products.json)
- Back button at top
- Product Vietnamese name, brand, category
- Key ingredients section (isKey=true): cards with INCI name, Vietnamese description, good/caution badges
- Full ingredient list: numbered by INCI order, each with Vietnamese name and effect badge per concern
- Badge colors: green text = good, amber text = caution, no badge = neutral
- Purchase links: sticky bottom buttons, only show platforms with URLs
- No Zalo share (Phase 3)
- No OG meta (Phase 4)

## Component Strategy

Page-level components. Extract shared components only when something repeats:
- Ingredient row (used in both key ingredients and full list)
- No premature component extraction

## Data Flow

All pages read from static JSON imports:
- `src/data/concerns.json`
- `src/data/products.json`
- `src/data/ingredients.json`

No API calls, no client state, no localStorage in Phase 2.

## Navigation

```
Home (/) → /products?concern=acne
                ↓
         /products/cosrx-snail-mucin-essence
                ↓
         Back to /products (browser back or back button)
```
