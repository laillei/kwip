# Mobile-First HIG Redesign

**Date:** 2026-03-17
**Approach:** Option B — New layout shell + component-by-component updates

---

## Goals

- Mobile web as primary viewport (375px canvas)
- Apple HIG as primary standard; Material Design 3 as fallback where HIG has no guidance
- Responsive: desktop (768px+) restores current nav behavior
- Each pass is independently shippable

---

## Layout Shell

### Bottom Tab Bar
- 3 tabs: **Explore** (house) · **Routine** (list) · **Me** (person)
- `position: fixed; bottom: 0; width: 100%`
- Height: 49px + `env(safe-area-inset-bottom)`
- Active: neutral-900 icon + label. Inactive: neutral-400
- White background, 1px top border neutral-100
- Hidden at `md` breakpoint (768px+); top nav links restore

### Compact Fixed Header
- Height: 44px
- `padding-top: env(safe-area-inset-top)`
- Left: Kwip wordmark (`text-base font-semibold`)
- Right: LanguageSwitcher + AuthButton
- White background with `backdrop-blur` on scroll

### Content Area
- `padding-top`: 44px + `env(safe-area-inset-top)`
- `padding-bottom`: 49px + `env(safe-area-inset-bottom)`
- No max-width on mobile; `max-w-lg mx-auto` on tablet; `max-w-6xl mx-auto` on desktop

---

## HIG Typography Scale (Noto Sans)

| HIG Role | Size | Weight | Tailwind | Usage |
|---|---|---|---|---|
| Large Title | 34px | Bold | `text-[34px] font-bold` | Page titles |
| Title 2 | 22px | Bold | `text-[22px] font-bold` | Section headers |
| Title 3 | 20px | Semibold | `text-xl font-semibold` | Card headlines |
| Headline | 17px | Semibold | `text-[17px] font-semibold` | Subheadings |
| Body | 17px | Regular | `text-[17px]` | Body text |
| Callout | 16px | Regular | `text-base` | Secondary body |
| Subhead | 15px | Regular | `text-[15px]` | Captions |
| Footnote | 13px | Regular | `text-[13px]` | Tertiary / INCI |
| Caption | 12px | Regular | `text-xs` | Badges |

Key change: body text moves from `text-sm` (14px) → `text-[17px]` (17px).

---

## Spacing — 8pt Grid

- Base unit: 8px
- Section horizontal padding: `px-4` (16px) — was `px-6` (24px)
- Card gap: `gap-4` (16px) — was `gap-3` (12px)
- Section vertical gap: `gap-6` (24px)

---

## Touch Targets

- Minimum 44×44px on all interactive elements
- Tab bar items: 44px height minimum
- Form inputs: 44px height minimum

---

## Component Passes

### Pass 1 — Layout Shell
- New `MobileShell` layout component with bottom tab bar + compact header
- Replaces current per-page header pattern
- Safe area insets on all edges

### Pass 2 — Home Page (Concern Selector + Header)
- Compact header replaces current logo+tagline header
- Concern chips: 44px height, `text-base` label, 8pt grid padding

### Pass 3 — Ingredient Highlight Cards
- Card width: `w-[180px]`
- Body text: `text-[17px]`
- Icon size: minimum 24px

### Pass 4 — Routine Step Row & Product Cards
- Section header: Title 3 style (20px semibold)
- Product card body text bump
- Touch target audit on all card tap areas

### Pass 5 — Product Detail Page
- Back button: HIG chevron.left, 44px tap target
- Ingredient list rows: full-width, 44px min height
- Purchase buttons: full-width, 50px height

### Pass 6 — Routine Builder & Me Page
- 8pt grid alignment
- Form inputs: 44px height, `text-base`

### Pass 7 — F4 Share Card
- Built after shell + home passes complete

---

## Responsive Breakpoints

| Viewport | Layout |
|---|---|
| `< 768px` (mobile) | Bottom tab bar, compact header, full-width content |
| `768px–1024px` (tablet) | Top nav, `max-w-lg` container |
| `> 1024px` (desktop) | Top nav, `max-w-6xl` container, current behavior |
