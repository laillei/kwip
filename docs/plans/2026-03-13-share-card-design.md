# Share Card — Design Document

**Date:** March 13, 2026
**Feature:** F4 (Share Routine Image Card) — saved routine variant
**Status:** Approved, ready for implementation

---

## What We're Building

A "Chia sẻ" button on the saved routine detail page (`/[locale]/routine/[id]`) that generates a 9:16 PNG image card of the user's personal routine and shares it via the native share sheet (mobile) or downloads it (desktop).

**Scope:** Saved routine share only. The concern-view share (home page) is deferred.

---

## Card Visual Design

**Format:** 1080 × 1920px, PNG, 9:16 aspect ratio (Facebook/Zalo Stories)

**Color scheme:** Dark — `#171717` (neutral-900) background, white text

**Layout (top to bottom):**

```
┌─────────────────────────────────────┐
│  kwip                [concern badge] │  ← header
│                                      │
│  [routine name]                      │  ← large, bold
│                                      │
│  ─────────────────────────────────── │
│  1  Sữa rửa mặt                      │
│     COSRX Low pH Cleanser            │  ← step row × N
│  ─────────────────────────────────── │
│     ... (up to 9 steps)              │
│                                      │
│  kwip.app                            │  ← footer
│  Được xây dựng dựa trên thành phần,  │
│  không phải quảng cáo.               │
└─────────────────────────────────────┘
```

**Typography (Noto Sans, all sizes in px for Satori):**

| Element | Size | Weight | Color |
|---|---|---|---|
| "kwip" wordmark | 48 | 700 | white |
| Concern badge text | 28 | 500 | white |
| Routine name | 72 | 700 | white |
| Step number | 32 | 500 | #737373 (neutral-500) |
| Category name | 28 | 500 | #737373 (neutral-500) |
| Product name | 36 | 600 | white |
| Brand | 28 | 400 | #737373 (neutral-500) |
| Footer URL | 28 | 500 | white |
| Footer tagline | 24 | 400 | #737373 (neutral-500) |

**Concern badge:** white text on `rgba(255,255,255,0.15)` pill, 12px border-radius

---

## Architecture

### New Files

**`src/app/api/share/routine/[id]/route.ts`**
- GET handler
- Fetches routine from Supabase by `id`
- Resolves product names/brands from `src/data/products.json`
- Renders `ImageResponse` using `@vercel/og` (Satori)
- Returns `Content-Type: image/png`
- Font: loads `NotoSans-Regular.ttf` and `NotoSans-Bold.ttf` from `public/fonts/`

**`src/components/routine/ShareButton.tsx`**
- Client component (`"use client"`)
- Props: `routineId: string`, `routineName: string`, `dict: { share: string; sharing: string }`
- On click:
  1. `setLoading(true)`
  2. `fetch(/api/share/routine/${routineId})` → blob
  3. Create `File` from blob (`routine-kwip.png`, `image/png`)
  4. If `navigator.canShare({ files: [file] })` → `navigator.share({ files: [file], title: routineName })`
  5. Else → create object URL → `<a download>` → click → revoke URL
  6. `setLoading(false)`

**`public/fonts/NotoSans-Regular.ttf`**
**`public/fonts/NotoSans-Bold.ttf`**
- Required by Satori for text rendering
- Download from Google Fonts, commit to repo

### Modified Files

**`src/app/[locale]/routine/[id]/page.tsx`**
- Import and render `<ShareButton routineId={id} routineName={routine.name} dict={...} />`

**`src/dictionaries/vi.json`** — add under `"routine"`:
```json
"shareButton": "Chia sẻ routine",
"sharing": "Đang tạo ảnh..."
```

**`src/dictionaries/en.json`** — add under `"routine"`:
```json
"shareButton": "Share routine",
"sharing": "Generating..."
```

### Package Dependency

`@vercel/og` — check if already in `package.json` (included in Next.js 15 by default on Vercel). If not, `npm install @vercel/og`.

---

## Data Flow

```
User taps "Chia sẻ"
  → ShareButton: fetch /api/share/routine/[id]
    → API route: Supabase → routine { name, concern, products[] }
    → API route: products.json → resolve { name, brand, category } per productId
    → API route: sort by step order, render ImageResponse JSX
    → Returns PNG blob
  → ShareButton: blob received
  → Mobile (navigator.canShare): native share sheet → Zalo / Facebook
  → Desktop (fallback): trigger <a download="routine-kwip.png">
```

---

## Routine Step Order

Satori renders steps sorted by `step` integer (matches existing routine order):
1 Cleanser → 2 Pad → 3 Toner → 4 Essence → 5 Serum → 6 Ampoule → 7 Mask → 8 Cream → 9 Sunscreen

---

## Out of Scope

- Product thumbnail images in the card (deferred)
- Concern-view share from home page (deferred)
- Copy link / share URL (deferred)
- OG meta tag update for routine detail page (deferred)
