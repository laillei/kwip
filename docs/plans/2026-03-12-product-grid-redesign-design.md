# Product Grid Redesign — Design Document
**Date:** 2026-03-12

---

## Problem

The current product grid stacks all routine steps vertically, each with a 2-column card grid. At 309 products and 9 routine steps, this creates excessive vertical scroll on mobile. At 1000+ products the experience breaks entirely. The share card feature (F4) is also blocked by this layout — no natural placement exists at the bottom of a scroll that never ends.

---

## Design Decision

### Behavior by state

| State | Layout |
|---|---|
| No concern selected | Flat grid — 2-col mobile, 4-col desktop. Sorted by popularity. No change from current. |
| Concern selected | Horizontal scroll rows per routine step on mobile. Collapsed grid with "see more" on desktop. |

### Mobile — horizontal scroll rows

When a concern is active, each routine step becomes a horizontal scroll row:

- Step label + arrow indicator on the left
- **2 full cards + peek of a third** — the half-visible third card signals "swipe right"
- Card width: ~168px on 390px screen (16px side padding, 12px gap)
- Each card: image + brand + product name + ingredient reason (why it fits the concern)
- Tapping a card navigates to product detail page (no change)

```
1 · Làm sạch              →
┌──────┐ ┌──────┐ ┌────
│ img  │ │ img  │ │ img   (peek)
│ name │ │ name │ │
│reason│ │reason│ │
└──────┘ └──────┘ └────

3 · Toner                 →
┌──────┐ ┌──────┐ ┌────
│      │ │      │ │
└──────┘ └──────┘ └────
```

### Desktop — collapsed grid with "see more"

When a concern is active, each routine step shows the top 4 products in a 4-column grid. If more products exist for that step, a "+ N more" link expands the section inline.

```
1 · Làm sạch                         + 6 more ↓
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│      │ │      │ │      │ │      │
└──────┘ └──────┘ └──────┘ └──────┘
```

Clicking "+ N more" expands that step to show all products. Other steps remain collapsed.

---

## Component Changes

### `ConcernHub.tsx`
- When `hasSelection`: render `RoutineStepRow` per step instead of current grid
- Pass `isMobile` detection or use CSS — horizontal scroll on mobile, collapsed grid on desktop
- `routineGroups` already computed — no data change needed

### New component: `RoutineStepRow.tsx`
- Props: `step` (label, number), `products`, `locale`, `getProductReason`
- Mobile: `overflow-x-auto` horizontal scroll container, `snap-x snap-mandatory` for smooth swiping
- Desktop: 4-col grid, shows first 4, "+ N more" button toggles expanded state
- Responsive: CSS controls which layout renders

### `ProductCard.tsx`
- No change to card content
- Card width becomes fixed on mobile (168px) inside horizontal scroll container

---

## What Does Not Change

- No concern selected: flat grid is untouched
- Routine step order: cleanser → pad → toner → essence → serum → ampoule → mask → cream → sunscreen
- Ingredient reason display per card
- Product detail navigation on tap
- Dictionary strings (no new copy needed)

---

## Out of Scope

- Share card (F4) — separate feature, addressed after this
- Product selection / "my routine" builder — Q2
- Infinite scroll or pagination — not needed at current catalog size

---

## Success Criteria

- Mobile: full routine visible with minimal vertical scroll (all steps on screen within 2-3 scrolls)
- Desktop: no step shows more than 4 products by default
- No regression: flat grid when no concern selected works identically to current
- Build passes: `npm run build` clean
