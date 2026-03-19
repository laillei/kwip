# Kwip Design System

## Type Scale (Apple HIG — Noto Sans)

| HIG Role | Size | Weight | Tailwind | Usage |
|---|---|---|---|---|
| Large Title | 34px | Bold | `text-[34px] font-bold` | Page titles |
| Title 2 | 22px | Bold | `text-[22px] font-bold` | Section headers |
| Title 3 | 20px | Semibold | `text-xl font-semibold` | Card headlines |
| Headline | 17px | Semibold | `text-[17px] font-semibold` | Product names, subheadings |
| Body | 17px | Regular | `text-[17px]` | Body text, ingredient descriptions |
| Callout | 16px | Regular | `text-base` | Secondary body, wordmark |
| Subhead | 15px | Regular | `text-[15px]` | Primary filter tabs, secondary labels |
| Footnote | 13px | Regular | `text-[13px]` | Tertiary text, INCI names, brand labels |
| Caption | 12px | Regular | `text-xs` | Secondary filter tabs, badges, tab bar labels |
| Overline | 12px | Semibold uppercase | `text-xs font-semibold uppercase tracking-wide` | Section headers (e.g. "Key Ingredients") |

**Only these sizes are allowed.** Do not use `text-sm` (14px) or `text-2xl` (24px) — they are not in the HIG scale.

## Forbidden
- NO `text-sm` (14px is not a HIG size — use 13px or 15px)
- NO `text-2xl` (24px is not a HIG size — use 22px or 34px)
- NO `text-neutral-300/700/800` for text
- NO `font-black`
- NO card UI (white bg + shadow) — use flat sections with dividers or gap separators instead

## Surface Pattern — Flat + Gap Separator
Kwip does not use card UI (white box + shadow). Instead:
- **Content sections:** `bg-white` full-width block
- **Gap between sections:** `<div className="h-4 bg-neutral-100" />` — 16px neutral gap
- **Page outer background:** `bg-neutral-100` (provides contrast behind white sections)
- **Dividers within a section:** `divide-y divide-neutral-100`

```
[bg-neutral-100 page]
  [bg-white] image + product info
  [h-4 bg-neutral-100 gap]
  [bg-white] key ingredients (divide-y inside)
  [h-4 bg-neutral-100 gap]
  [bg-white] full ingredient list (divide-y inside)
```

## Text Colors
- **Primary:** neutral-900
- **Secondary:** neutral-500
- **Tertiary:** neutral-400
- **Body:** neutral-600
- **On dark background (neutral-900):** white, white/60 for secondary
- **Semantic only:** emerald-600 (good), amber-600 (caution)

## Spacing — 8pt Grid
- Base unit: 8px
- Section horizontal padding: `px-4` (16px) on mobile, `px-8` on desktop
- Item gap in grids: `gap-x-3 gap-y-6`
- Section vertical gap: `h-4` (16px neutral-100 block between white sections)
- Divider within section: `divide-y divide-neutral-100`

## Empty States
- Empty states are **always vertically centered** in the available viewport — never top-aligned or padded down
- The `EmptyState` component handles its own internal layout (icon, title, body, CTA) but not vertical placement
- The parent container must provide centering:
  ```jsx
  <div className="flex-1 flex items-center justify-center" style={{ minHeight: "calc(100dvh - 56px - 49px)" }}>
    <EmptyState ... />
  </div>
  ```
- The `56px` is the header height, `49px` is the tab bar height
- Apply `-mt-16` inside the centering wrapper for optical centering — mathematically centered content always feels slightly low; shifting 64px above true center corrects this
- Do NOT add `pt-*` or `pb-*` to the empty state wrapper — it breaks centering
- Inline empty states (e.g. no filter results) use a simple `<p className="text-[15px] text-neutral-400 text-center py-12">` instead of the `EmptyState` component

## Touch Targets
- Minimum 44×44px on all interactive elements
- Tab bar items: 44px height minimum
- Form inputs: `min-h-[44px]`
- Icon-only buttons: `min-w-[44px] min-h-[44px]`

## Glass Surface
All sticky/fixed surfaces (header, sticky filter bars, purchase bar) use the same glass treatment:
- `bg-white/90 backdrop-blur-md` — semi-transparent white with blur
- This lets background content show through as the user scrolls

## Layout Shell
- Fixed header: 56px (`h-14`) + `env(safe-area-inset-top)`
- Bottom tab bar: 49px + `env(safe-area-inset-bottom)`
- Content padding-top: `calc(56px + env(safe-area-inset-top))`
- Content padding-bottom: `calc(49px + env(safe-area-inset-bottom))`
- No max-width on mobile; `max-w-2xl mx-auto` on detail pages; `max-w-6xl mx-auto` on home desktop

## Filter Tab Hierarchy (Two-Level)
Home page has two filter rows with intentional visual hierarchy:

| Level | Component | Style | Role |
|---|---|---|---|
| Primary | ConcernFilterBar | 15px medium, underline active indicator | Concern selection |
| Secondary | StepFilterBar | 12px, plain text, semibold when active | Product type filter |

- Both rows are sticky, flush to the header
- Active concern: `border-b-2 border-neutral-900 text-neutral-900`
- Inactive concern: `border-transparent text-neutral-400`
- Active step: `font-semibold text-neutral-900`
- Inactive step: `font-normal text-neutral-400`

## Product Grid
- **Mobile:** 2 columns — `grid-cols-2`
- **Desktop:** 4 columns — `md:grid-cols-4`
- **Gap:** `gap-x-3 gap-y-6`
- **Item layout:** square image (`aspect-square`, `rounded-xl`, `bg-neutral-100`) → brand (12px, neutral-400) → name (13px, semibold, 2 lines) → reason (12px, emerald-600, optional)
- **Bookmark:** overlay on image, top-right, `w-11 h-11` minimum tap target

## Product Detail Page Layout
- Image: `aspect-[4/3]`, `object-contain`, white bg, no padding rank watermark
- Product name: `text-[17px] font-semibold` (Headline role)
- Brand: `text-[13px] text-neutral-400 uppercase tracking-wide`
- Section header: Overline style (`text-xs font-semibold uppercase tracking-wide text-neutral-500`)
- Sections separated by `h-4 bg-neutral-100` gaps
- Purchase bar: fixed, above tab bar, `backdrop-blur-xl`

## Skincare Routine Order (for product grouping)
1. Cleanser → 2. Pad (exfoliate) → 3. Toner → 4. Essence → 5. Serum → 6. Ampoule → 7. Mask → 8. Cream (moisturize) → 9. Sunscreen

## Category Translations
| ID | Vietnamese | English |
|----|-----------|---------|
| cleanser | Sữa rửa mặt | Cleanser |
| pad | Pad | Pad |
| toner | Nước hoa hồng | Toner |
| essence | Tinh chất | Essence |
| serum | Serum | Serum |
| ampoule | Tinh chất cô đặc | Ampoule |
| mask | Mặt nạ | Mask |
| cream | Kem | Cream |
| sunscreen | Chống nắng | Sunscreen |
