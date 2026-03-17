# Kwip Design System Design

**Date:** 2026-03-17
**Approach:** CVA-based primitive components + `/design-system` showcase page

---

## Goals

- Consistent color, typography, and UX flow across all screens
- Shared React primitives so no component hand-codes classes twice
- Visual showcase page viewable on any device (phone + desktop)
- Zero new heavy dependencies — only `class-variance-authority` (2KB)

---

## Component Inventory (8 primitives)

| Component | Variants | Usage |
|---|---|---|
| `Button` | primary / tonal / secondary / ghost · md / lg · fullWidth | CTAs, actions, back nav |
| `IconButton` | default · subtle | Back chevron, close, language switcher |
| `Card` | padding: sm / md / none | ProductCard, IngredientCard, RoutineCard, key ingredients |
| `Badge` | default / success / warning · pill / tag | Category tags, best-seller, sensitive-safe, EWG, ingredient effects |
| `Input` | default / focused / filled / disabled | Routine name field |
| `EmptyState` | — | Me page (no routines), ConcernHub (no results) |
| `SectionHeader` | — | Overline labels above sections throughout the app |
| `Divider` | — | Between list items, inside cards |

---

## Typography (Apple HIG — enforced via primitives)

| HIG Role | Tailwind | Forbidden alternatives |
|---|---|---|
| Large Title | `text-[34px] font-bold` | `text-4xl` |
| Title 2 | `text-[22px] font-bold` | `text-2xl` |
| Title 3 | `text-xl font-semibold` | — |
| Headline | `text-[17px] font-semibold` | `text-base font-semibold` |
| Body | `text-[17px]` | `text-base`, `text-sm` |
| Subhead | `text-[15px]` | `text-sm` |
| Footnote | `text-[13px]` | `text-xs font-normal` |
| Caption / Overline | `text-xs` | — |

---

## Color System

**Text:**
- Primary: `text-neutral-900`
- Secondary: `text-neutral-500`
- Tertiary: `text-neutral-400`
- Body: `text-neutral-600`
- On dark (bg-neutral-900): `text-white`, `text-white/60`
- Semantic good: `text-emerald-600`
- Semantic caution: `text-amber-600`

**Forbidden text colors:** neutral-300, neutral-700, neutral-800

**Surfaces:**
- Page: `bg-neutral-50`
- Card: `bg-white` + shadow `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Selected: `bg-neutral-900 text-white`

---

## Spacing (8pt Grid)

- Section horizontal padding: `px-4` (16px) for full-width layouts
- Card padding sm: `p-3.5`, md: `p-5`
- Card gap: `gap-4` (16px)
- Section vertical gap: `gap-6` (24px)

---

## Touch Targets

- All interactive elements: `min-h-[44px]`
- IconButton: `min-h-[44px] min-w-[44px]`
- Large buttons (purchase, save): `min-h-[50px]`

---

## Architecture

```
src/
  components/
    ui/
      Button.tsx          ← cva variants: primary/tonal/secondary/ghost, md/lg
      IconButton.tsx      ← cva variants: default/subtle
      Card.tsx            ← cva variants: sm/md/none padding
      Badge.tsx           ← cva variants: default/success/warning, pill/tag
      Input.tsx           ← cva variants: default/focused/filled/disabled
      EmptyState.tsx      ← props: icon, title, body, actionLabel, actionHref
      SectionHeader.tsx   ← props: children
      Divider.tsx         ← no props
      index.ts            ← re-exports all

src/app/[locale]/design-system/
  page.tsx                ← showcase: colors, typography, all components + variants
```

---

## Showcase Page (`/[locale]/design-system`)

Sections rendered top to bottom:
1. Colors — neutral swatches + emerald/amber semantic swatches
2. Typography — all 9 HIG roles rendered with labels
3. Button — all variants × sizes, fullWidth, disabled
4. IconButton — all variants
5. Card — all padding variants
6. Badge — all variants × shapes
7. Input — all states
8. EmptyState — full example
9. SectionHeader + Divider — in context (mini ingredient list)

**Hidden from nav** — accessible by URL only. No auth required.

---

## Out of Scope (pre-launch)

- Animation library — CSS transitions only
- Dark mode — light only
- Unit tests — visual verification via showcase page is sufficient
- Storybook — `/design-system` route replaces this for now

---

## Migration

After primitives are built, existing components are updated to import from `@/components/ui/` instead of repeating Tailwind classes inline. Priority order:

1. Button — used in 8+ places
2. Card — used in 6+ places
3. Badge — used in product detail + cards
4. SectionHeader — used in 5+ places
5. Remaining primitives

---

## Not Changing

- Page layouts and routing
- Data fetching (Supabase)
- MobileShell / BottomTabBar (already consistent)
- Dictionary/i18n system
