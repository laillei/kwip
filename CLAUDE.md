# Kwip — Claude Code Instructions

Kwip is a Korean editorial K-skincare discovery site.
Target: Korean consumers. Not a catalog, not reviews — editorial trend discovery.

## Commands
- `npm run dev` — Dev server (auto-clears .next cache)
- `npm run build` — Production build (use to verify changes)

## ⚠️ CRITICAL — 375×812 Fixed Viewport

**Both mobile AND desktop use 375×812 format. No responsive breakpoints. No exceptions.**

- Layout: `<div style={{ width: 375 }}>` container wrapping all content
- Fixed elements (header, tab bar): `left-1/2 -translate-x-1/2 w-[375px]`
- Overlays/scrims/modals: `left-1/2 -translate-x-1/2 w-[375px]` — NEVER `inset-0` or portal to `document.body`
- NO `md:`, `lg:`, or any responsive Tailwind classes — forbidden
- Body background: `bg-[#F5F5F5]` (gray behind the 375px white container)

## Rules
- All text localized via `src/dictionaries/ko.json` and `en.json` — no hardcoded strings
- Follow design system exactly — see `docs/ux/design-system.md`
- `npm run build` is the source of truth for errors, not the dev server
- `.next` cache corrupts on hot reload → restart dev server if you see webpack/module errors

## Architecture
```
/[locale]/                    ← Home: tabs → articles feed → curation products
/[locale]/article/[slug]      ← Article: cover → tag → body → products → related
/[locale]/products            ← Discovery: concern tabs → category tabs → grid
/[locale]/products/[slug]     ← Product: image → tag → info → ingredients → related
/[locale]/saved               ← Saved: bookmarked products or empty state
```

Bottom tabs: 홈 · 발견 · 북마크

## Execution Style
- Always use **subagent-driven-development** for multi-step tasks
- Do NOT offer "parallel session" or other execution options — subagents only

## Development Standard
- Senior Next.js/TypeScript developer: type safety, performance, accessibility
- Server components by default — only `"use client"` when interactivity requires it
- Always verify with `npm run build` before calling work done

## Key References
- **Design system: `docs/ux/design-system.md` — READ before any UI work**
- **Product direction: `docs/product/product-brief.md`**
- **Requirements: `docs/product/prd.md`**
