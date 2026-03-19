# Kwip Design System

## Type Scale (Apple HIG — Noto Sans)

| HIG Role | Size | Weight | Tailwind | Usage |
|---|---|---|---|---|
| Large Title | 34px | Bold | `text-[34px] font-bold` | Page titles |
| Title 2 | 22px | Bold | `text-[22px] font-bold` | Section headers, product names |
| Title 3 | 20px | Semibold | `text-xl font-semibold` | Card headlines |
| Headline | 17px | Semibold | `text-[17px] font-semibold` | Subheadings |
| Body | 17px | Regular | `text-[17px]` | Body text |
| Callout | 16px | Regular | `text-base` | Secondary body, wordmark |
| Subhead | 15px | Regular | `text-[15px]` | Captions, secondary labels |
| Footnote | 13px | Regular | `text-[13px]` | Tertiary text, INCI names, brand labels |
| Caption | 12px | Regular | `text-xs` | Badges, tab labels |
| Overline | 12px | Semibold uppercase | `text-xs font-semibold uppercase tracking-wide` | Section headers |

**Only these sizes are allowed.** Do not use `text-sm` (14px) or `text-2xl` (24px) — they are not in the HIG scale.

## Forbidden
- NO `text-sm` (14px is not a HIG size — use 13px or 15px)
- NO `text-2xl` (24px is not a HIG size — use 22px or 34px)
- NO `text-neutral-300/700/800` for text
- NO `font-black`

## Surface Colors (Apple HIG)
- **Page background:** neutral-50 — slightly gray base (set on `<body>`)
- **Card / surface:** white + shadow — pops off the neutral-50 base
- **Interactive unselected:** white + shadow — same as cards, clearly tappable
- **Interactive selected:** neutral-900 background, white text

## Text Colors
- **Primary:** neutral-900
- **Secondary:** neutral-500
- **Tertiary:** neutral-400
- **Body:** neutral-600
- **On dark background (neutral-900):** white, white/60 for secondary
- **Semantic only:** emerald-600 (good), amber-600 (caution)

## Spacing — 8pt Grid
- Base unit: 8px
- Section horizontal padding: `px-4` (16px) for full-width mobile layouts
- Card gap: `gap-4` (16px)
- Section vertical gap: `gap-6` (24px)

## Touch Targets
- Minimum 44×44px on all interactive elements
- Tab bar items: 44px height minimum
- Form inputs: `min-h-[44px]`

## Layout Shell
- Fixed header: 44px + `env(safe-area-inset-top)`
- Bottom tab bar: 49px + `env(safe-area-inset-bottom)`
- Content padding-top: `calc(44px + env(safe-area-inset-top))`
- Content padding-bottom: `calc(49px + env(safe-area-inset-bottom))`
- No max-width on mobile; `max-w-lg mx-auto` on tablet; `max-w-6xl mx-auto` on desktop

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
