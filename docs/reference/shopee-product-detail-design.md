# Shopee Product Detail Page — Design Format

> Canonical template: `public/shopee-detail-v5.html` (Anua Heartleaf 77% Toner)
> This document records the design decisions and how they map to Kwip's design system.

---

## Design Principles

- Mobile-first canvas: `max-width: 480px`
- Minimal white tone — no heavy blacks, no decorative color fills
- Surface separation via alternating white / soft backgrounds + 2px gaps (not shadows)
- Icons: Google Material Symbols Outlined only. **No emoji.**
- Font: Noto Sans KR

---

## Color Tokens

These map directly to Kwip design system tokens:

| CSS Variable | Hex | Design System Role |
|---|---|---|
| `--bg` | `#ffffff` | Surface (white) |
| `--bg-soft` | `#f9f9f8` | Surface Dim |
| `--border` | `#efefed` | Divider |
| `--text-primary` | `#111110` | neutral-900 — headings, primary content |
| `--text-secondary` | `#666664` | neutral-500 — overlines, subtitles, body |
| `--text-tertiary` | `#767674` | neutral-400 — brand labels, INCI, supporting info |
| `--accent` | `#2a6e4a` | emerald-600 — positive/beneficial (semantic only) |
| `--accent-bg` | `#f0f7f3` | emerald tint — accent surface |
| `--accent-mid` | `#c8e6d6` | emerald border — accent chip border |

---

## Typography Scale

All sizes follow HIG Dynamic Type roles. **Forbidden: 9px, 10px, 11px, 14px, 24px, 28px.**

| Element | Size | Weight | Color |
|---|---|---|---|
| Hero headline | 28px | 900 | text-primary *(decorative — only exception to HIG scale)* |
| Section headline | 22px | 800 | text-primary |
| Product name | 17px | 700 | text-primary |
| Stat ingredient name | 15px | 700 | text-primary |
| Body text | 13px | 400 | text-secondary |
| Overline | 12px | 600 + uppercase + tracking | text-secondary |
| Caption / chips / card desc | 12px | 400–600 | text-secondary or text-tertiary |
| Brand label / size / INCI | 12px | 400–600 | text-tertiary |
| Big stat number | 80px | 900 | text-primary *(decorative)* |

**Rule:** The hero headline 28px is the only exception to HIG scale — it's decorative display type, never used in the app UI.

---

## Spacing — 8pt Grid

Base unit: 8px. All spacing must be a multiple of 8px (or minimum 4px).

| Usage | Value |
|---|---|
| Section horizontal padding | `24px` |
| Section vertical padding | `32px` |
| Hero top padding | `40px` |
| Page gap between sections | `2px` (visual rule, not 8pt — intentional) |
| Card internal padding | `18px 16px` |
| Grid gap | `10px` |

---

## Surfaces

Sections alternate between two surface types, separated by 2px gaps (page background shows through):

| Surface | Background | Used for |
|---|---|---|
| `.section` | `#ffffff` (white) | Primary content: hero, ingredient stat, sourcing, guarantee, spec table |
| `.section-soft` | `#f9f9f8` (soft) | Secondary content: who it's for, why it works, routine, how to use |

**Cards inside `.section-soft` must use `background: var(--bg)` (white)** to maintain contrast. Cards inside `.section` use `border: 1px solid var(--border)` only.

---

## Section Structure & Order

| # | Section | Class | Surface |
|---|---|---|---|
| 1 | Hero | `.hero` | white |
| 2 | Who is this for | `.section` | white |
| 3 | Core Ingredient stat | `.stat-section` | white |
| 4 | Why it works | `.section-soft` | soft |
| 5 | Authenticity / Sourcing flow | `.section` | white |
| 6 | Routine step | `.section-soft` | soft |
| 7 | Formulation / Free-from | `.section` | white |
| 8 | How to use | `.section-soft` | soft |
| 9 | Kwip's Promise | `.section` | white |
| 10 | Product Spec table | `.section-soft` | soft |
| 11 | Footer | `.kwip-footer` | accent-bg |

---

## Component Patterns

### Overline
```css
font-size: 12px; font-weight: 600; letter-spacing: 0.1em;
text-transform: uppercase; color: var(--text-secondary);
```
- Always `text-secondary` (neutral-500)
- Exception: hero overline uses `var(--accent)` — only when it carries semantic meaning (category label)

### Section Headline
```css
font-size: 22px; font-weight: 800; color: var(--text-primary);
line-height: 1.3; letter-spacing: -0.3px;
```

### Concern Chips
- Default: `bg-soft`, `text-secondary`, `border: 1px solid var(--border)`
- Active: `bg-accent-bg`, `color: accent`, `border-color: accent-mid`
- Font: 12px weight 500
- Icon: 14px Material Symbol

### 2×2 Works Cards
- Background: `var(--bg)` (always white, even in section-soft)
- Border: `1px solid var(--border)`
- Icon container: 32×32px, `bg-soft`, radius 8px
- Title: 12px 700 text-primary
- Desc: 12px 400 text-secondary

### Sourcing Flow
- Connector line: `::after` pseudo, 1px `var(--border)`, left-aligned at 13px
- Active node: `background: var(--accent)`, icon white
- Inactive node: `border: 1px solid var(--border)`, icon text-tertiary
- Pill labels: 11px 600, `bg-soft`, radius 20px

### Routine List
- Active row: `bg-accent-bg`, `border-color: accent-mid`
- Inactive row: `bg-white`, `border: 1px solid var(--border)`

---

## What NOT to Do

- No emoji — Material Symbols Outlined only
- No `box-shadow` on surfaces — use border + background contrast
- No text below 12px (exception: decorative/non-readable elements only)
- No 14px text (`text-sm`) — forbidden in design system
- No fabricated claims, rankings, or comparison numbers in copy
- No accent color for overlines unless semantically meaningful
