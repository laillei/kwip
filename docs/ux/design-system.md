# Kwip Design System

Standards: **Apple HIG** (primary) · **Material Design 3** (secondary)
Strict compliance — no arbitrary sizes, no raw hex in component code.

---

## Typefaces

Two typefaces only. No exceptions.

| Font | Role | Usage |
|---|---|---|
| **Pretendard** | Primary | Korean body text, headings, article content |
| **Plus Jakarta Sans** | Secondary | English labels, wordmark, dates, badges, overline, tab labels |

**Removed:** Noto Sans, Noto Serif — no longer in the system.

---

## Type Scale

Apple HIG Dynamic Type roles. Only these sizes are permitted.

| Role | Size | Weight | Font | Tailwind | Usage in Kwip |
|---|---|---|---|---|---|
| Large Title | 34px | Bold | Pretendard | `text-[34px] font-bold` | Empty state decorative |
| Title 1 | 28px | Bold | Pretendard | `text-[28px] font-bold` | Reserved |
| Title 2 | 22px | Bold | Pretendard | `text-[22px] font-bold` | Section headings ("추천 제품"), page titles |
| Title 3 | 20px | Semibold | Pretendard | `text-[20px] font-semibold` | Reserved |
| Headline | 17px | Semibold | Pretendard | `text-[17px] font-semibold` | Article card titles, product names, wordmark |
| Body | 17px | Regular | Pretendard | `text-[17px]` | General body text, article content |
| Callout | 16px | Regular | Pretendard | `text-base` | Reserved |
| Subheadline | 15px | Regular | Pretendard | `text-[15px]` | Article subtitles, CTAs, descriptions |
| Footnote | 13px | Regular/Semibold | Pretendard | `text-[13px]` | Product names in grids, brand labels |
| Caption 1 | 12px | Regular | Plus Jakarta Sans | `text-xs` | Tab bar labels, filter chip labels, overline |
| Caption 2 | 11px | Regular | Plus Jakarta Sans | `text-[11px]` | Dates, editorial badge text |

### Wordmark

| Property | Value |
|---|---|
| Font | Plus Jakarta Sans |
| Role | Headline (17px Semibold) |
| Transform | `uppercase` |
| Letter spacing | `tracking-[-1px]` |
| Color | `text-on-surface` |

```jsx
<span className="font-semibold text-[17px] tracking-[-1px] uppercase text-on-surface">
  KWIP
</span>
```

### Forbidden sizes

`text-sm` (14px), `text-2xl` (24px), 10px, 18px — not HIG Dynamic Type roles. Do not use.

---

## Color System

MD3 semantic color roles. Every color has a named role — no raw hex values in component code.

### Primary (Deep Forest)

| Role | Hex | Token | Usage |
|---|---|---|---|
| Primary | `#1A3D2B` | `primary` | Filled buttons, active chips, editorial badges, links |
| On Primary | `#FFFFFF` | `on-primary` | Text/icons on primary |
| Primary Container | `#A8D5BA` | `primary-container` | Tonal chips, subtle highlights |
| On Primary Container | `#0D2016` | `on-primary-container` | Text on primary container |

### Secondary

| Role | Hex | Token | Usage |
|---|---|---|---|
| Secondary | `#4A6355` | `secondary` | Secondary actions |
| On Secondary | `#FFFFFF` | `on-secondary` | Text on secondary |
| Secondary Container | `#CCE5D5` | `secondary-container` | Tag badge bg, inactive chip tonal fill |
| On Secondary Container | `#072015` | `on-secondary-container` | Tag label text |

### Tertiary (warm complement)

| Role | Hex | Token | Usage |
|---|---|---|---|
| Tertiary | `#6B5C4D` | `tertiary` | Accent, warm differentiation |
| On Tertiary | `#FFFFFF` | `on-tertiary` | Text on tertiary |
| Tertiary Container | `#F4DFCE` | `tertiary-container` | Warm highlight surfaces |
| On Tertiary Container | `#24180D` | `on-tertiary-container` | Text on warm surfaces |

### Error

| Role | Hex | Token | Usage |
|---|---|---|---|
| Error | `#BA1A1A` | `error` | Error states, destructive actions |
| On Error | `#FFFFFF` | `on-error` | Text on error |
| Error Container | `#FFDAD6` | `error-container` | Error background |
| On Error Container | `#410002` | `on-error-container` | Text on error bg |

### Surface

| Role | Hex | Token | Usage |
|---|---|---|---|
| Surface | `#FAFAF7` | `surface` | Page background |
| Surface Container Lowest | `#FFFFFF` | `surface-lowest` | Cards, content blocks |
| Surface Container Low | `#F4F4F1` | `surface-low` | Subtle separation |
| Surface Container | `#EEEFEB` | `surface-container` | Gaps between sections |
| Surface Container High | `#E8E9E5` | `surface-high` | Image placeholder bg |
| Surface Container Highest | `#E3E3E0` | `surface-highest` | Inactive chip fill |

### On Surface

| Role | Hex | Token | Usage |
|---|---|---|---|
| On Surface | `#1A1C19` | `on-surface` | Headings, primary text |
| On Surface Variant | `#414942` | `on-surface-variant` | Subtitles, secondary text, dates, brand labels |

### Outline

| Role | Hex | Token | Usage |
|---|---|---|---|
| Outline | `#717972` | `outline` | Borders, dividers |
| Outline Variant | `#C1C9C0` | `outline-variant` | Subtle dividers, tab bar border |

### Inverse

| Role | Hex | Token | Usage |
|---|---|---|---|
| Inverse Surface | `#2F312E` | `inverse-surface` | Dark banners, tooltips |
| Inverse On Surface | `#F0F1ED` | `inverse-on-surface` | Text on inverse surface |

### Scrim

`bg-black/40` — semi-transparent overlay behind modals and drawers.

### Removed tokens

These are no longer valid — do not use:
- `neutral-*` (100, 300, 400, 500, 600, 700, 800, 900)
- `emerald-600`, `amber-600`
- Raw hex: `#00855d`, `#777`, `#5e5e5e`, `#85f8c4`, `#f3f3f3`, `#eee`

---

## Surfaces

MD3 surface terminology. No elevation shadows — surfaces are separated by gaps and dividers only.

| Surface role | Implementation | Usage |
|---|---|---|
| **Surface** | `bg-surface-lowest` full-width block | Content sections (article cards, product info) |
| **Surface Container** | `<div className="h-4 bg-surface-container" />` | Gap separating Surface blocks |
| **Surface Dim** | `bg-surface` | Page background behind Surface blocks |
| **Surface Divider** | `divide-y divide-outline-variant` | Row separators within a Surface |

```
[Surface Dim — bg-surface]
  [Surface — bg-surface-lowest] article card
  [Surface Container — h-4 bg-surface-container]
  [Surface — bg-surface-lowest] featured products
  [Surface Container — h-4 bg-surface-container]
  [Surface — bg-surface-lowest] more content
```

No `shadow-*` on surfaces. `bg-surface-lowest` + `border-outline-variant` is the only acceptable alternative for menus/overlays.

---

## Elevation & Scrim

**Scrim** (MD3): `bg-black/40` behind modals and drawers.

**Material Surface** (Apple HIG): surfaces that float above scrolling content:
- `bg-surface-lowest/90 backdrop-blur-md`
- Applied to: purchase bar, save bar
- Navigation Bar uses its own translucent material (see App Shell)

---

## Spacing — 8pt Grid (strict)

Base unit: 8px. All spacing must be a multiple of 4px (minimum), 8px (preferred). **No exceptions.**

| Usage | Token | Px |
|---|---|---|
| Section horizontal padding | `px-4` | 16px |
| Section vertical padding | `py-12` | 48px |
| Surface Container gap | `h-4` | 16px |
| Grid column gap | `gap-x-4` | 16px |
| Grid row gap | `gap-y-8` | 32px |
| Card internal gap | `gap-3` | 12px |
| Chip gap | `gap-2` | 8px |
| Overline-to-title gap | `gap-1` | 4px |

**Forbidden values:** `gap-[11px]`, `gap-[15.99px]`, `gap-y-[40px]` — not on 8pt grid.

---

## App Shell

### Navigation Bar (Apple HIG)

| Property | Value |
|---|---|
| Height | `h-14` (56px) + `env(safe-area-inset-top)` |
| Background | `bg-surface-lowest/80 backdrop-blur-[12px]` (HIG translucent material) |
| Padding | `px-4` (16px) |
| Left slot | Wordmark (Headline 17px, Plus Jakarta Sans, uppercase) |
| Right slot | Search + Menu icons, `gap-4`, `min-w-[44px] min-h-[44px]` each |
| Hidden at | `md` breakpoint and above |

### Tab Bar (Apple HIG)

| Property | Value |
|---|---|
| Height | `h-[49px]` + `env(safe-area-inset-bottom)` |
| Background | `bg-surface-lowest` |
| Border | `border-t border-outline-variant` |
| Tabs | HOME · PRODUCTS |
| Label | Caption 1 (12px), Plus Jakarta Sans |
| Active | `text-primary font-semibold` |
| Inactive | `text-on-surface-variant font-normal` |
| Item touch target | `min-h-[44px]` |
| Hidden at | `md` breakpoint and above |

### Content Area

- `padding-top`: `calc(56px + env(safe-area-inset-top))`
- `padding-bottom`: `calc(49px + env(safe-area-inset-bottom))`

### Max-width by page

| Page | Max-width |
|---|---|
| Home | `max-w-6xl mx-auto` (desktop only) |
| Article detail | `max-w-3xl mx-auto` |
| Product detail | `max-w-3xl mx-auto` |

---

## Filter Chips (MD3)

MD3 Filter Chip with HIG touch target compliance.

| Property | Selected | Unselected |
|---|---|---|
| Background | `bg-primary` | `bg-surface-highest` |
| Text color | `text-on-primary` | `text-on-surface-variant` |
| Font | Caption 1 — 12px, Plus Jakarta Sans | Same |
| Shape | `rounded-full` | `rounded-full` |
| Visual height | `h-8` (32px) | `h-8` (32px) |
| Touch target | `min-h-[48px]` (MD3 48dp — larger than HIG 44) | Same |
| Padding | `px-4` (16px) | Same |
| Container gap | `gap-2` (8px) | — |

```jsx
<button className="min-h-[48px] flex items-center">
  <span className="h-8 rounded-full bg-primary text-on-primary text-xs px-4 flex items-center">
    전체
  </span>
</button>
```

### Filter chip values

| Korean | Meaning |
|---|---|
| 전체 | All |
| 지금 뜨는 | Rising now |
| 숨겨진 명품 | Hidden gem |
| 성분 주목 | Ingredient watch |
| 편집장 픽 | Editor's pick |

---

## Article Card

| Element | Style | Type role |
|---|---|---|
| Container | `bg-surface-lowest p-4 flex flex-col gap-3` | — |
| Image | `aspect-video w-full rounded-xl overflow-clip` | MD3 medium shape |
| Tag badge | `bg-secondary-container text-on-secondary-container rounded-full px-2 py-0.5` | Caption 2 (11px) |
| Headline | `text-on-surface` | Headline (17px Semibold, Pretendard) |
| Subtitle | `text-on-surface-variant` | Subheadline (15px Regular, Pretendard) |
| Date | `text-on-surface-variant` | Caption 2 (11px, Plus Jakarta Sans) |
| Touch target | Entire card tappable | — |

```
[Image — 16:9, rounded-xl]
  gap-3
[Tag — rounded-full, secondary-container]
  gap-3
[Headline — 17px semibold, on-surface]
  gap-3
[Subtitle — 15px regular, on-surface-variant]
  gap-3
[Date — 11px, on-surface-variant]
```

---

## Editorial Tag Badge

Inline label identifying the editorial category of an article.

| Property | Value |
|---|---|
| Background | `bg-secondary-container` |
| Text color | `text-on-secondary-container` |
| Font | Caption 2 (11px), Plus Jakarta Sans |
| Padding | `px-2 py-0.5` (8px / 2px) |
| Shape | `rounded-full` |

---

## Editorial Product Badge

Applied to curated product cards below the product name.

| Property | Value |
|---|---|
| Background | `bg-primary` |
| Text color | `text-on-primary` |
| Font | Caption 2 (11px), Plus Jakarta Sans Bold |
| Padding | `px-2 py-0.5` (8px / 2px) |
| Shape | `rounded-full` |

Labels: `BEST` · `SALE` · `NEW` · `EDITOR'S PICK`

```jsx
<span className="rounded-full bg-primary text-on-primary text-[11px] font-bold px-2 py-0.5">
  BEST
</span>
```

---

## Section Header

Pattern for named editorial sections.

| Element | Style | Type role |
|---|---|---|
| Overline | `text-on-surface-variant uppercase tracking-[2px]` | Caption 2 (11px, Plus Jakarta Sans Bold) |
| Title | `text-on-surface` | Title 2 (22px Bold, Pretendard) |
| SEE ALL link | `text-primary underline decoration-primary` | Caption 1 (12px Bold, Plus Jakarta Sans) |
| Gap overline→title | `gap-1` (4px) | — |
| Layout | `flex items-end justify-between` | — |

```
[CURATION — 11px uppercase tracking-wide, on-surface-variant]
[추천 제품 — 22px bold, on-surface]          [SEE ALL — 12px underline, primary]
```

---

## Product Grid

| Property | Value |
|---|---|
| Mobile columns | 2 — `grid-cols-2` |
| Desktop columns | 4 — `md:grid-cols-4` |
| Column gap | `gap-x-4` (16px) |
| Row gap | `gap-y-8` (32px) |
| Section padding | `px-4 py-12` (16px / 48px) |
| Image | `aspect-square bg-surface-high rounded-xl overflow-clip` |
| Brand label | Caption 2 (11px), `text-on-surface-variant`, Plus Jakarta Sans, uppercase |
| Product name | Footnote Semibold (13px), `text-on-surface`, max 2 lines |
| Badge | Editorial product badge below product name |
| Bookmark | Top-right overlay, `min-w-[44px] min-h-[44px]` |

---

## Product Detail

| Element | Style |
|---|---|
| Product image | `aspect-[4/3] object-contain p-6 bg-surface-lowest` |
| Brand | Caption 2 (11px), `text-on-surface-variant uppercase tracking-wide` |
| Product name | Headline (17px Semibold), `text-on-surface` |
| Section labels | Overline — Caption 1 (12px), `font-semibold uppercase tracking-wide text-on-surface-variant` |
| Surface separation | `<div className="h-4 bg-surface-container" />` |
| Purchase bar position | Fixed, `bottom: calc(49px + env(safe-area-inset-bottom))` |
| Purchase bar surface | `bg-surface-lowest/90 backdrop-blur-md border-t border-outline-variant` |
| Purchase buttons | `min-h-[50px] text-[15px] font-semibold rounded-xl bg-primary text-on-primary` |

---

## Minimum Touch Target

All interactive elements must meet **44pt minimum** (Apple HIG) or **48dp** (MD3) — use the larger.

| Element | Implementation |
|---|---|
| Navigation Bar actions | `min-w-[44px] min-h-[44px]` |
| Tab Bar items | `min-h-[44px]` |
| Filter Chips | `min-h-[48px]` (visual 32px + padding) |
| Form inputs | `min-h-[44px]` |
| Icon-only buttons | `min-w-[44px] min-h-[44px]` |
| List rows | `min-h-[44px]` |
| Product grid bookmark | `min-w-[44px] min-h-[44px]` |

No exceptions documented. Every interactive element meets this requirement.

---

## Empty States (Apple HIG — No Content state)

Centered in available viewport using optical centering.

```jsx
<div
  className="flex items-center justify-center"
  style={{ minHeight: "calc(100dvh - 56px - 49px)" }}
>
  <div className="-mt-16">
    {/* EmptyState component */}
  </div>
</div>
```

- `56px` = Navigation Bar, `49px` = Tab Bar
- `-mt-16` is optical correction
- For inline empty states: `<p className="text-[15px] text-on-surface-variant text-center py-12">`

---

## Skincare Routine Order

1. Cleanser → 2. Pad → 3. Toner → 4. Essence → 5. Serum → 6. Ampoule → 7. Mask → 8. Cream → 9. Sunscreen

---

## Category Translations

| ID | Korean | English |
|----|--------|---------|
| cleanser | 클렌저 | Cleanser |
| pad | 패드 | Pad |
| toner | 토너 | Toner |
| essence | 에센스 | Essence |
| serum | 세럼 | Serum |
| ampoule | 앰플 | Ampoule |
| mask | 마스크 | Mask |
| cream | 크림 | Cream |
| sunscreen | 선크림 | Sunscreen |
