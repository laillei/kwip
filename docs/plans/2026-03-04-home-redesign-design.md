# Home Page Redesign — Concern Tabs + Product Card Grid

## Summary

Replace the current 2x2 concern selector home page with concern filter tabs + a 2-column product card grid. This merges the original concern-first flow with a visual product browsing experience — users select a concern via tabs and immediately see filtered products as full-bleed image cards.

The products page (`/products`) is kept as a deep-linkable version of the same filtered view.

## Pages

### Home (`/[locale]/`)

- Top bar: "Kwip" logo left
- Concern filter tabs (sticky): Acne, Moisturizing, Brightening, Anti-aging
  - Default tab: first concern ("acne")
  - Tabs use `?concern=` query param for bookmarkability
- 2-column grid of product cards, filtered by selected concern, sorted by popularity rank
- Each card:
  - Product image fills entire card as background (`object-cover`)
  - Bottom gradient: transparent → black (~40% of card height)
  - White text over gradient: category label (small, muted) + product name
- Tapping a card → `/[locale]/products/[slug]`

### Products (`/[locale]/products`)

- Same layout as home (concern tabs + card grid)
- Exists as a separate route for deep linking and SEO
- Back button navigates to home

## Card Design

```
┌─────────────────┐
│                  │
│  [product image  │
│   covers full    │
│   card]          │
│                  │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← gradient overlay
│▓ Toner          ▓│  ← category (muted white)
│▓ Anua Heartleaf ▓│  ← product name (white, bold)
│▓ 77% Toner      ▓│
└─────────────────┘
```

## Technical Notes

- Home page filters by concern and sorts by popularity rank
- Card component is shared between both pages
- Image: Next.js `<Image>` with `fill` + `object-cover`
- Gradient: CSS `bg-gradient-to-t from-black/80 to-transparent`
- Mobile-first: 2 columns, gap 8-12px, 16px horizontal padding
- Concern tabs use query params, not client-side state (SSR-friendly)
