# Share Routine Image Card — Design

**Date:** 2026-03-17

## Goal

Make routine sharing feel aspirational — like a beauty account post — while staying visually consistent with the Kwip app. One share moment only: the saved routine.

## Scope

Two changes:

1. **Remove** `ShareConcernButton` from the home page — consolidate to one share moment (the saved routine on `/routine/[id]`).
2. **Redesign** the share image card (`/api/share/route.tsx`) — same light palette as the app, but more polished and with a subtle ingredients line.

## Image Card Design

**Canvas:** 1080×1920px (9:16, Facebook/Zalo Stories)
**Palette:** Neutral-50 (`#FAFAFA`) background, white product card, Kwip design system colors

### Layout (top to bottom)

**Header**
- `Kwip` — small overline, top-left (`#A3A3A3`, 28px)
- Routine name — hero text, bold (`#171717`, 72px, line-height 1.1)
- `Routine cho da [concern]` — secondary (`#A3A3A3`, 28px)
- Ingredients line — `BHA · Niacinamide · Centella` (`#A3A3A3`, 26px) — INCI names of concern's `keyIngredients`, joined by ` · `, max 3

**Product list** (white card, borderRadius 28px)
- Each row: 112×112px product image + category label (overline, 24px, `#A3A3A3`) + product name (bold, 32px, `#171717`) + brand (24px, `#A3A3A3`)
- Row padding: 36px vertical, 40px horizontal
- Divider lines between rows (`#F5F5F5`)

**Footer**
- `Kwip` bold + tagline `Được xây dựng dựa trên thành phần, không phải quảng cáo.`
- `kwip.app`

### Data needed

The `/api/share` route receives `{ name, concern, products }` via base64url query param. To add the ingredients line, it needs to:
1. Query Supabase `concerns` table for the matching concern row
2. Read `key_ingredients` array (ingredient IDs)
3. Query Supabase `ingredients` table for those IDs
4. Take first 3, use `name.inci` field, join with ` · `

## What Does NOT Change

- `/api/share-concern/route.tsx` — kept as-is (unused but no harm)
- `ShareButton` component — logic unchanged, only image output changes
- `/routine/[id]` page layout — unchanged
- `/me` page — unchanged

## Removal Details

In `src/components/home/ConcernHub.tsx`:
- Remove `import ShareConcernButton`
- Remove `<ShareConcernButton ... />` and its wrapping fragment
- Remove `shareConcern` from the `dict` prop interface and usage

In `src/app/[locale]/page.tsx` (or wherever `ConcernHub` is called):
- Remove `shareConcern` from the dict passed to `ConcernHub`

In `src/dictionaries/vi.json` and `en.json`:
- Remove `shareConcern` key from the home dict section
