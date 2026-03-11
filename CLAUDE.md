# Kwip — Claude Code Instructions

Kwip is a K-beauty skin-issue solver for Vietnamese users.
Core value: **"I have a skin problem. Help me fix it."**
Not a catalog, not a review site — the shortest path from concern → understanding → purchase.

## Commands
- `npm run dev` — Dev server (auto-clears .next cache)
- `npm run build` — Production build (use to verify changes)
- `npm run pipeline:run` — Product discovery pipeline
- `npm run pipeline:promote` — Promote staged data

## Rules
- All text localized via `src/dictionaries/vi.json` and `en.json` — no hardcoded strings
- Follow design system exactly — see `docs/design-system.md`
- Mobile-first (min 44px touch targets)
- Font: Noto Sans

## Gotchas
- `.next` cache corrupts on hot reload → restart dev server if you see webpack/module errors
- Ingredient `name` has `inci`/`vi`/`ko` but NO `en` — use `inci` for English locale
- Products page (`/[locale]/products`) redirects to home — all browsing is on `/[locale]/`
- `npm run build` is the source of truth for errors, not the dev server

## Architecture (single-page browsing)
```
/[locale]/                    ← Home: concern filter → ingredient cards → routine-grouped products
/[locale]/products/[slug]     ← Detail: ingredient breakdown → purchase links
```

## Key References
- Full tech spec: `README.md`
- **Product direction & strategy: `docs/product-brief.md` — read this before making any product decisions**
- Design system & type scale: `docs/design-system.md`
- Core vision: `docs/plans/2026-03-09-core-vision-design.md`
- Data: `src/data/products.json`, `ingredients.json`, `concerns.json`
