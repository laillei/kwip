# Kwip — Claude Code Instructions

## Context
- **Repo:** https://github.com/difisoft-kr/kwip
- **Tech:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Data:** Static JSON, no database, no auth
- **Full spec:** See [README.md](./README.md) for data schemas and architecture

## Core Value — Always Keep This in Mind
**"I have a skin problem. Help me fix it."**

Kwip is a skin-issue solver. NOT a product catalog, NOT a review platform, NOT an ingredient database. Every feature should serve this: concern → understanding (ingredients) → action (buy).

## Commands
- `npm run dev` — Start dev server (auto-clears .next cache)
- `npm run build` — Build for production
- `npm run pipeline:run` — Run product discovery pipeline
- `npm run pipeline:promote` — Promote staged data to production

## When Writing Code

### Design System — Follow These Exactly
**Type scale (7 roles only, no exceptions):**
| Role | Classes |
|------|---------|
| Title | `text-2xl font-bold text-neutral-900` |
| Headline | `text-lg font-semibold text-neutral-900` |
| Subhead | `text-sm font-semibold text-neutral-900` |
| Body | `text-sm text-neutral-600` |
| Caption | `text-xs font-medium text-neutral-500` |
| Overline | `text-xs font-semibold uppercase tracking-wide text-neutral-400` |
| Label | `text-sm font-medium` |

**Forbidden:**
- NO arbitrary pixel sizes (`text-[11px]`, `text-[13px]`, etc.)
- NO `text-neutral-300/700/800` for text
- NO `font-black`

**Colors:** neutral-900 (primary), neutral-500 (secondary), neutral-400 (tertiary), neutral-600 (body). Semantic: emerald-600 (good), amber-600 (caution) only.

### Localization — No Exceptions
- ALL user-facing text via `src/dictionaries/vi.json` and `en.json`
- NO hardcoded strings in components
- Category names must be translated (toner → Nước hoa hồng, ampoule → Tinh chất cô đặc)

### Mobile-First
- Min touch target: 44px
- Font: Noto Sans (Vietnamese diacritics)
- Test on mobile viewport first

### Skincare Routine Order (when grouping products)
1. Cleanser → 2. Pad (exfoliate) → 3. Toner → 4. Essence → 5. Serum → 6. Ampoule → 7. Mask → 8. Cream (moisturize) → 9. Sunscreen

## Current Architecture

```
/[locale]/                        ← Home (single page: filter + browse)
  ├── Concern pills (multi-select, OR with relevance)
  ├── Ingredient highlight cards (trust layer)
  ├── Routine-grouped products (when concern selected)
  └── Flat grid (when nothing selected)

/[locale]/products?...            ← Redirects to home
/[locale]/products/[slug]         ← Product Detail (verify + buy)
```

### Key Files
- `src/components/home/ConcernHub.tsx` — Main orchestrator
- `src/components/home/ConcernSelector.tsx` — Multi-select pills
- `src/components/home/IngredientHighlight.tsx` — Trust layer cards
- `src/components/products/ProductCard.tsx` — Card with "why" badge
- `src/app/[locale]/products/[slug]/page.tsx` — Detail page
- `src/data/` — products.json, ingredients.json, concerns.json

## Roadmap (don't build unless asked)
- [ ] URL-synced filters (shareable, back button)
- [ ] Product detail refresh (emphasize "why" per concern)
- [ ] Better empty state for no-concern selection
- [ ] SEO / Open Graph meta
- [ ] Ingredient conflict warnings across concerns
