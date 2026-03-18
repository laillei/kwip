# Home Discovery + Bookmark Design

**Date:** 2026-03-18
**Status:** Design approved, implementation pending

---

## Goal

Replace the empty-on-load concern-first home with an always-visible product list and two independent filter rows. Add a bookmark-to-routine flow.

**Core principle:** Show products immediately. Filters narrow — they don't reveal.

---

## Home Screen

### Filter Row 1 — Concern Chips

- Horizontal scroll, single-select pill chips
- Options: `[All]` + all 7 concerns from DB (Mụn, Khô da, Sáng da, Nhạy cảm, Lỗ chân lông, Thâm nám, Lão hóa)
- Default: All selected
- Active state: `bg-neutral-900 text-white`
- Inactive state: `bg-white text-neutral-600 border border-neutral-200`
- Same chip style as `StepFilterBar`

### Filter Row 2 — Category Chips

- Horizontal scroll, single-select pill chips
- Options: `[All]` + 9 categories (Sữa rửa mặt, Tẩy da chết, Toner, Essence, Serum, Ampoule, Mặt nạ, Kem dưỡng, Chống nắng)
- Default: All selected
- Same chip style as concern chips

### Product List

- Vertical list of `ProductListItem` rows
- Sorted by `popularity.rank` ascending
- Filtered by selected concern AND selected category (intersection)
- Result count displayed above list: e.g. "47 sản phẩm" (small, `neutral-500`)
- When a concern is selected: ingredient reason line appears on each product (`emerald-600`)
- When no concern selected (All): no reason line — just brand + name + chevron

### Removed from Home

The following elements are removed as part of this redesign:

- Routine step grouping headers
- "Build My Routine" CTA button
- Ingredient highlight cards
- Empty state / "pick a concern" prompt

---

## Bookmark Feature

### Icon Placement

- **Product list row (`ProductListItem`):** right side, before the chevron
- **Product detail page:** in the header navigation bar, right side
- Icon: outline bookmark when unsaved, filled bookmark when saved

### Interaction

- Tap bookmark → fills with animation
- Tap again → unfills (toggle)
- Haptic feedback on mobile (if supported by the device)
- First save ever: bottom toast appears for 2.5s — "Đã lưu. Xem trong Của tôi →"

### Me Tab Badge

- Shows count of saved (bookmarked) products
- Updates instantly on bookmark tap
- Disappears when count reaches 0

---

## Me Tab — Saved Products + Routine Creation

### Saved Products Section (new)

- Shows all bookmarked products as `ProductListItem` rows
- "Tạo routine từ sản phẩm đã lưu" CTA button appears when ≥1 product is saved
- Tap CTA → existing routine builder page pre-populated with saved products

### Existing Routines Section (unchanged)

- List of saved routines (`RoutineCard`) — no changes to this section

---

## Data / State

Saved product IDs are stored in `localStorage`:

| Key | Value |
|-----|-------|
| `kwip_saved_products` | `string[]` — array of product IDs |

Helper functions live in `src/lib/localSaved.ts` (new file, mirrors `localRoutines.ts` pattern):

```ts
getSavedProducts(): string[]
saveProduct(id: string): void
unsaveProduct(id: string): void
isProductSaved(id: string): boolean
```

---

## Architecture Changes

| File | Change |
|------|--------|
| `ConcernHub.tsx` | Replace with new `DiscoveryHub.tsx` (or refactor in place) |
| `CategoryFilterBar.tsx` | New component — same as `StepFilterBar` but for product categories |
| `ProductListItem.tsx` | Accept `saved` prop + `onBookmark` callback; add bookmark icon |
| `src/app/[locale]/products/[slug]/page.tsx` | Add bookmark button to header |
| `src/lib/localSaved.ts` | New file — saved products localStorage helpers |
| `MePageClient.tsx` | Add saved products section above existing routines list |
| `MobileShell.tsx` (or tab bar component) | Add badge to Me tab showing saved product count |
