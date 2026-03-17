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

## Execution Style
- Always use **subagent-driven-development** for multi-step tasks — never ask which execution mode to use
- Do NOT offer "parallel session" or other execution options — subagents only

## Development Standard
- Write code as a **senior Next.js/TypeScript developer**: type safety, performance, accessibility, security
- No `any` types unless absolutely unavoidable (add eslint-disable comment with reason)
- Server components by default — only use `"use client"` when interactivity requires it
- Always verify with `npm run build` before calling work done — dev server is not the source of truth
- Prefer editing existing files over creating new ones; no unnecessary abstractions

## Design Standard
- Act as a **senior UX/UI designer** applying Apple HIG (primary) + Material Design 3 (fallback)
- Every UI change must respect the design system in `docs/design-system.md`
- 44px minimum touch targets on all interactive elements — non-negotiable
- Typography must follow the HIG scale defined in `docs/plans/2026-03-17-mobile-first-hig-design.md`
- Run `/design-review` after any significant UI work to audit aesthetic + UX quality

## Key References
- Full tech spec: `README.md`
- **Product direction & strategy: `docs/product-brief.md` — READ THIS before any product decisions**
- **Tactical requirements & launch scope: `docs/prd.md` — READ THIS before building any feature**
- Design system & type scale: `docs/design-system.md`
- Core vision: `docs/plans/2026-03-09-core-vision-design.md`
- Data: Supabase PostgreSQL (concerns, ingredients, products tables) — see `src/lib/db.ts`
