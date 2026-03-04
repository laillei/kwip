# UI Polish — Pill Tabs, Consistent Header, Better Readability

## Summary

Fix readability, margins, tab style, and header consistency across home and products pages. Both pages share the same layout (home IS products). Language switcher moves from floating to inline in header.

## Header

- Row: "Kwip" logo left (`text-xl font-bold`), language switcher right (inline, not floating)
- Same header on both pages. On `/products`, "Kwip" links back to home.
- Padding: `px-5 py-4`
- Language switcher: `text-sm text-neutral-400 hover:text-white`, no border/pill — just text

## Concern Tabs

- Pill style: `rounded-full px-4 py-2`
- Inactive: `bg-neutral-800 text-neutral-400`
- Active: `bg-white text-black font-medium`
- Container: horizontal scroll, `gap-2`, `px-5` padding
- Sticky below header with `bg-black/95 backdrop-blur-sm`, no border line
- Padding: `py-3` vertical within sticky nav

## Product Cards

- Text area padding: `p-4` (up from `p-3`)
- Category label: `text-sm text-white/80` (up from `text-xs text-white/70`)
- Product name: `text-base font-semibold` (up from `text-sm`)
- Gradient: `from-black/90 via-black/30 to-transparent` (stronger for readability)
- Grid: `gap-4` (up from `gap-3`)

## Page Layout

- Consistent `px-5` horizontal padding (header, tabs, grid)
- Grid section: `pt-5` top, `pb-10` bottom
- No visual difference between home and `/products` — same page, `/products` is a deep-link alias

## Components Changed

- `src/components/shared/LanguageSwitcher.tsx` — remove `fixed` positioning, make inline
- `src/app/[locale]/layout.tsx` — remove LanguageSwitcher from layout (moves into page headers)
- `src/app/[locale]/page.tsx` — new header with LanguageSwitcher, pill tabs, updated grid spacing
- `src/app/[locale]/products/page.tsx` — same layout as home, Kwip logo links back
- `src/components/products/ProductCard.tsx` — larger text, stronger gradient, more padding
