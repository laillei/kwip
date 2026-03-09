# Kwip — Claude Code Instructions

## Repository
- **Organization:** difisoft-kr
- **Repository:** kwip
- **URL:** https://github.com/difisoft-kr/kwip

## Core Value
**"I have a skin problem. Help me fix it."**
Kwip is a skin-issue solver for Vietnamese K-beauty consumers. Not a product catalog, not a review platform, not an ingredient database — the shortest path from a skin concern to a trustworthy product recommendation.

**Differentiator:** Trust through understanding. Shows WHY a product works (ingredient logic) — not just what's popular.

## Tech Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Data: Local JSON (~100 products, ~150 ingredients, 7 concerns)
- Deploy: Vercel
- No login, no database — localStorage only

## Key Commands
- `npm run dev` — Start dev server (auto-clears .next cache)
- `npm run build` — Build for production

## Information Architecture

```
/[locale]/                        ← Home (filter + browse)
  ├── Concern pills (multi-select, OR with relevance sorting)
  ├── Ingredient highlight cards (horizontal scroll, trust layer)
  ├── Products grouped by skincare routine steps (when concern selected)
  └── Flat product grid (when no concern selected)

/[locale]/products?...            ← Redirects to home (preserves params)
/[locale]/products/[slug]         ← Product Detail (verify + buy)
```

### Skincare Routine Order
1. Cleanser → 2. Pad (exfoliate) → 3. Toner → 4. Essence → 5. Serum → 6. Ampoule → 7. Mask → 8. Cream (moisturize) → 9. Sunscreen

### Filter Logic
- Multi-select concerns: OR with relevance (products matching more concerns rank higher)
- Each product card shows a "why" badge — the key ingredient + reason matching the selected concern

## Design System

### Type Scale (7 roles only)
| Role | Classes | Used For |
|------|---------|----------|
| Title | `text-2xl font-bold text-neutral-900` | "Kwip" logo |
| Headline | `text-lg font-semibold text-neutral-900` | Product name (detail) |
| Subhead | `text-sm font-semibold text-neutral-900` | Ingredient names, card titles |
| Body | `text-sm text-neutral-600` | Descriptions, reasons |
| Caption | `text-xs font-medium text-neutral-500` | Brand, INCI, badges |
| Overline | `text-xs font-semibold uppercase tracking-wide text-neutral-400` | Section headers |
| Label | `text-sm font-medium` | Buttons, tabs, pills |

### Color Rules
- Primary text: neutral-900
- Secondary text: neutral-500
- Tertiary: neutral-400
- Body: neutral-600
- Semantic only: emerald-600 (good), amber-600 (caution)
- NO arbitrary pixel sizes (text-[11px] etc.)
- NO text-neutral-300/700/800

## Rules
- All user-facing text must be localized (Vietnamese + English via dictionaries)
- Mobile-first design (min touch target 44px)
- Font: Noto Sans (Vietnamese diacritics support)
- No hardcoded strings — use `src/dictionaries/vi.json` and `en.json`
- Category names must be translated (e.g., toner → Nước hoa hồng)

## Key Files
- `src/components/home/ConcernHub.tsx` — Main page orchestrator (concern filter + routine groups)
- `src/components/home/ConcernSelector.tsx` — Multi-select concern pills
- `src/components/home/IngredientHighlight.tsx` — Ingredient trust layer cards
- `src/components/products/ProductCard.tsx` — Product card with optional "why" badge
- `src/app/[locale]/products/[slug]/page.tsx` — Product detail page
- `src/data/` — products.json, ingredients.json, concerns.json
- `docs/plans/2026-03-09-core-vision-design.md` — Core vision document
