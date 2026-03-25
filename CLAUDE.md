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
- Follow design system exactly — see `docs/ux/design-system.md`
- Mobile-first (min 44px touch targets)
- Font: Noto Sans

## Gotchas
- `.next` cache corrupts on hot reload → restart dev server if you see webpack/module errors
- Ingredient `name` has `inci`/`vi`/`ko` but NO `en` — use `inci` for English locale
- Products page (`/[locale]/products`) redirects to home — all browsing is on `/[locale]/`
- `npm run build` is the source of truth for errors, not the dev server

## Architecture
```
/[locale]/                    ← Home: concern filter tabs → step filter tabs → product grid
/[locale]/products/[slug]     ← Detail: flat sections (image, key ingredients, full list)
/[locale]/me                  ← Personal: saved products grid + saved routines list
/[locale]/routine/new         ← Routine builder (auth required)
/[locale]/routine/[id]        ← Shareable routine detail (public)
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
- Every UI change must respect the design system in `docs/ux/design-system.md`
- 44px minimum touch targets on all interactive elements — non-negotiable
- Typography must follow the HIG scale defined in `docs/ux/hig-mobile-first.md`
- Run `/design-review` after any significant UI work to audit aesthetic + UX quality

## Source Structure
```
src/
├── app/           # Next.js App Router — pages, layouts, API routes
├── components/
│   ├── ui/        ← Design system primitives (Button, Card, Badge, etc.)
│   ├── layout/    ← App shell: MobileShell, BottomTabBar
│   ├── home/      ← Home page feature components
│   ├── products/  ← Product feature components
│   ├── routine/   ← Routine feature components
│   ├── shared/    ← Cross-feature components (BookmarkButton, AuthButton, etc.)
│   └── providers/ ← React context providers
├── store/         ← Client-side state: localRoutines.ts, localSaved.ts
├── types/         ← TypeScript types: Product, Ingredient, Routine, Concern, etc.
├── lib/           ← Infrastructure: db.ts, supabase.ts, i18n.ts, brands.ts
└── dictionaries/  ← Localization JSON: vi.json, en.json

scripts/
├── pipeline/      ← Product discovery pipeline
└── db/            ← Database scripts: seed-supabase.ts, migrate-concern-taxonomy.ts

logs/              ← Pipeline runtime output (gitignored): audit-log.json, etc.
```

## Docs Structure
All agents must follow this structure when reading and writing documentation.

```
docs/
├── product/       # PM — permanent strategy & requirements. Read before any product/feature decision.
│   ├── product-brief.md     ← Product direction, evidence, competitive position, roadmap, value prop
│   └── prd.md               ← Feature requirements, acceptance criteria, launch scope
│
├── ux/            # Design standards — permanent reference. Read before any UI work.
│   ├── design-system.md     ← Type scale, colors, spacing, surface patterns
│   ├── hig-mobile-first.md  ← HIG typography & layout rules
│   └── core-vision.md       ← Visual design direction
│
├── plans/         # Claude Code workflow files — all dated feature work goes here.
│   ├── YYYY-MM-DD-feature-design.md   ← Brainstorming output / design spec
│   └── YYYY-MM-DD-feature.md          ← Implementation plan
│
└── reference/     # External specs — Supabase schema, API docs, pipeline specs (future)
```

**When reading:** Always read `docs/product/product-brief.md` + `docs/product/prd.md` before product decisions. Always read `docs/ux/design-system.md` + `docs/ux/hig-mobile-first.md` before UI changes.

**When writing:** New feature specs and implementation plans → `docs/plans/YYYY-MM-DD-feature[-design].md`. Never write dated files into `docs/product/` or `docs/ux/` — those are permanent reference docs, updated in place.

## Key References
- Full tech spec: `README.md`
- **Product direction & strategy: `docs/product/product-brief.md` — READ THIS before any product decisions**
- **Tactical requirements & launch scope: `docs/product/prd.md` — READ THIS before building any feature**
- Design system & type scale: `docs/ux/design-system.md`
- HIG typography scale: `docs/ux/hig-mobile-first.md`
- Core vision: `docs/ux/core-vision.md`
- Data: Supabase PostgreSQL (concerns, ingredients, products tables) — see `src/lib/db.ts`
