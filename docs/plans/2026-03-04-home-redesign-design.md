# Home Page Redesign — Product Card Grid

## Summary

Replace the current 2x2 concern selector home page with a 2-column product card grid. Cards show full-bleed product images with a bottom gradient overlay for text (category + product name). A "View More" link in the top bar navigates to the products page which adds concern filter tabs.

## Pages

### Home (`/[locale]/`)

- Top bar: "Kwip" logo left, "View More" link right
- 2-column grid of product cards, randomized order
- Each card:
  - Product image fills entire card as background (`object-cover`)
  - Bottom gradient: transparent → black (~40% of card height)
  - White text over gradient: category label (small, muted) + product name
- Tapping a card → `/[locale]/products/[slug]`
- Tapping "View More" → `/[locale]/products`

### Products (`/[locale]/products`)

- Top bar: back button left
- Sticky concern filter tabs (Acne, Moisturizing, Brightening, Anti-aging)
- Same 2-column card grid as home, but filtered by selected concern
- Cards are identical in style to home page

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

- Home page shows all products in random order (shuffle on load)
- Products page filters by concern, sorted by popularity rank
- Card component is shared between both pages
- Image: Next.js `<Image>` with `fill` + `object-cover`
- Gradient: CSS `bg-gradient-to-t from-black/80 to-transparent`
- Mobile-first: 2 columns, gap 8-12px, 16px horizontal padding
