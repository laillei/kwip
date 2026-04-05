# Kwip Design System

Standards: **Apple HIG** (primary) · **Material Design 3** (structure)
Neutral-first editorial palette with green accent (text only).
Target: Korean consumers. Language: Korean (primary) + English.

---

## 01 · Color

### Neutral (Primary UI)

| Token | Hex | Usage |
|---|---|---|
| Black | `#000000` | Active tabs, headings, active tab bar icons |
| Neutral 900 | `#171717` | Inverse surface |
| Neutral 600 | `#525252` | Body text |
| Neutral 550 | `#5E5E5E` | Subtitles, descriptions (`on-surface-variant`) |
| Neutral 500 | `#777777` | Dates, brand labels, overline, action links (`tertiary`) |
| Neutral 400 | `#A3A3A3` | Inactive tab icons, inactive tab text, placeholders |
| Neutral 200 | `#EEEEEE` | Borders, dividers (`outline`) |
| Neutral 100 | `#F3F3F3` | Tag/chip background, product thumbnail bg (`surface-variant`) |
| Neutral 50 | `#F5F5F5` | Page background behind 375px container, surface gaps (`surface-container`) |
| White | `#FFFFFF` | Cards, content blocks, nav bar, tab bar (`surface`) |

### Accent — Green (text only)

| Token | Hex | Usage |
|---|---|---|
| Green 600 | `#00855D` | Editorial tag text only (`accent`) |

> Green is ONLY used as text color on `#F3F3F3` background. **Never as a fill/background color.**

### Semantic

| Token | Hex | Usage |
|---|---|---|
| Error | `#BA1A1A` | Error states |
| Caution | `#D97706` | Potential irritant ingredients |

### MD3 Role Mapping

| Role | Token | Hex |
|---|---|---|
| Primary | `primary` | `#000000` |
| On Primary | `on-primary` | `#FFFFFF` |
| Surface | `surface` | `#FFFFFF` |
| Surface Container | `surface-container` | `#F5F5F5` |
| Surface Variant | `surface-variant` | `#F3F3F3` |
| On Surface | `on-surface` | `#000000` |
| On Surface Variant | `on-surface-variant` | `#5E5E5E` |
| Outline | `outline` | `#EEEEEE` |
| Tertiary | `tertiary` | `#777777` |
| Accent | `accent` | `#00855D` |

---

## 02 · Typography

### Typefaces — 3 fonts, strict roles

| Font | Role | Usage |
|---|---|---|
| **Noto Serif** (Black 900) | Wordmark only | KWIP logotype — 20px, uppercase, tracking -1px |
| **Pretendard** | Korean text | Headings, body, article content, product names, tab labels |
| **Plus Jakarta Sans** | English/labels | Brand labels (uppercase), dates, tab bar labels, overline |

### Apple HIG Dynamic Type Scale

| Role | Size | Weight | Font | Usage |
|---|---|---|---|---|
| Title 2 | 22px | Bold | Pretendard | Section headings ("추천 제품"), article detail titles |
| Headline | 17px | Semibold | Pretendard | Article card titles, product names in detail, empty state title |
| Body | 17px | Regular | Pretendard | Article body text |
| Subheadline | 15px | Regular | Pretendard | Article subtitles, descriptions, empty state body |
| Footnote | 13px | Semibold | Pretendard | Product names in grid, scrollable tab labels, action links |
| Caption 1 | 12px | Regular | Plus Jakarta Sans | Bottom tab bar labels |
| Caption 2 | 11px | Regular | Plus Jakarta Sans | Dates, brand labels, tag/chip text |

**Forbidden sizes:** 14px, 18px, 24px, 10px — not HIG Dynamic Type roles.

### Language rules

- All UI text in Korean (primary) + English (secondary) via dictionaries
- Ingredient names: show Korean from DB. Exception: "PDRN" stays as "PDRN"
- Product descriptions: Korean. Fallback chain: `ko` → `inci` → `vi`
- Brand names: English uppercase (e.g. "ANUA", "ROUND LAB")

---

## 03 · Shape

| Element | Radius | Notes |
|---|---|---|
| **Chips, tags, badges** | `rounded-full` | All pill-shaped |
| **Images** | `0px` | Square, no border-radius |
| **Buttons** | `0px` | Square |

---

## 04 · Spacing — 8pt Grid

| Value | Token | Usage |
|---|---|---|
| 4px | `gap-1` | Overline-to-title gap |
| 8px | `gap-2` | Chip/tag gap |
| 12px | `gap-3` | Card internal gap, article card gap |
| 16px | `px-4` | Section horizontal padding |
| 24px | `gap-6` | Product grid column gap |
| 32px | `gap-8` | Product grid row gap |
| 48px | `py-12` | Section vertical padding |

---

## 05 · Elevation

**Flat — no shadows.** Surfaces separated by:
- Gaps: `h-4 bg-surface-container` (`#F5F5F5`)
- Dividers: `border-b border-outline` (`#EEEEEE`)

---

## 06 · Viewport

**Fixed 375×812.** No responsive breakpoints. Same layout on all viewports.

- Body: `bg-[#F5F5F5]` (gray behind the white container)
- Container: `width: 375px`, `bg-white`, centered with `mx-auto`
- All `fixed` elements: `left-1/2 -translate-x-1/2 w-[375px]`
- Overlays/scrims: `left-1/2 -translate-x-1/2 w-[375px]` — NEVER `inset-0` or portal to `document.body`
- NO `md:`, `lg:` or any responsive Tailwind classes

---

## 07 · Components

### Navigation Bar

| Property | Value |
|---|---|
| Height | `h-14` (56px) |
| Position | `fixed top-0 left-1/2 -translate-x-1/2 w-[375px] z-50` |
| Background | `bg-white` solid |
| Border | `border-b border-outline` |
| Wordmark | Noto Serif Black, 20px, uppercase, tracking -1px |
| Right icon | Search only (no hamburger menu), `min-w-[44px] min-h-[44px]` |

### Primary Tabs (Scrollable with Chevron)

Used on: 홈 page (전체, 최근), 발견 page (전체, 클렌저, 토너, ...)

| Property | Active | Inactive |
|---|---|---|
| Height | `h-11` (44px) | Same |
| Text | `font-semibold text-black` | `font-normal text-[#A3A3A3]` |
| Indicator | `border-b-2 border-black` | `border-b-2 border-transparent` |
| Container | `border-b border-outline bg-white` | — |
| Font | Footnote (13px), Pretendard | Same |
| Position | `sticky top-14 z-40` | — |
| Chevron | Right-aligned arrow button (발견 page only) — opens 2-column grid overlay with scrim |
| Drag scroll | Mouse drag-to-scroll enabled for desktop |

### Snackbar / Toast (MD3)

| Property | Value |
|---|---|
| Height | `h-12` (48px) |
| Text | 13px, `font-medium`, white |
| Background | `#171717` |
| Width | `w-fit` (content-sized), centered |
| Position | `fixed bottom, left-1/2 -translate-x-1/2 w-[375px]` area |

### Editorial Tags

| Property | Value |
|---|---|
| Background | `#F3F3F3` (`surface-variant`) |
| Text | `#00855D` (`accent`) |
| Font | Caption 2 (11px) |
| Padding | `px-2 py-0.5` |
| Shape | `rounded-full` |

Home article cards use tag text "최근". 홈 curation products use "올리브영 랭킹".

### Ingredient Chips (on product cards)

| Property | Value |
|---|---|
| Background | `#F3F3F3` (`surface-variant`) |
| Text | `#5E5E5E` (`on-surface-variant`) |
| Font | 10px |
| Padding | `px-2 py-0.5` |
| Shape | `rounded-full` |
| Content | Korean ingredient names from DB (exception: PDRN stays "PDRN") |

### Product Thumbnail

| Property | Value |
|---|---|
| Aspect ratio | `aspect-square` |
| Background | `#F3F3F3` (`surface-variant`) — same as chip bg |
| Border | `border border-outline` (`#EEE`) |
| Image fit | `object-contain p-5` |

### Tab Bar — 3 Tabs

| Property | Value |
|---|---|
| Height | `h-[49px]` |
| Position | `fixed bottom-0 left-1/2 -translate-x-1/2 w-[375px] z-50` |
| Background | `bg-white` |
| Border | `border-t border-outline` |
| Tabs | 홈 · 발견 · 북마크 |
| Active | `text-black font-semibold` |
| Inactive | `text-[#A3A3A3] font-normal` |
| Label | Caption 1 (12px), Plus Jakarta Sans |
| Icons | House (홈), Grid (발견), Bookmark (북마크) |

### Section Header

| Element | Style |
|---|---|
| Overline | 10px Bold, uppercase, tracking-[2px], `#777`, Plus Jakarta Sans |
| Title | Title 2 (22px Bold), `#000`, Pretendard |
| Action link | 13px Semibold, `#777` ("더보기"), not underlined |

### Empty State (북마크 page)

| Property | Value |
|---|---|
| Icon | 48px bookmark SVG, stroke `#DDD` |
| Title | Headline (17px Semibold), "저장한 제품이 없어요" |
| Body | Subheadline (15px), `#777`, "마음에 드는 제품을 북마크해보세요" |
| Layout | Centered vertically, `-mt-16` optical correction |

---

## 08 · Navigation & Screens

**Default landing page:** 홈 (`/[locale]/`)

**Bottom tabs:** 홈 · 발견 · 북마크

### 홈 (Home)

```
Nav Bar (KWIP + Search)
Primary Tabs: 전체 (default) | 최근
Articles Feed (article cards with "최근" tag)
Surface Gap
Section Header: CURATION / 추천 제품 / 더보기
Product Grid (4 products, "올리브영 랭킹" badge)
```

### Article Detail

```
Nav Bar (← Back + Share)
Cover Image (16:9)
Tag + Date + Read time
Article Body (17px, line-height 1.8)
Surface Gap
Inline Product Cards (horizontal)
Surface Gap
Related Articles (2-column thumbnails)
```

### 발견 (Discovery / Products)

```
Nav Bar (KWIP + Search)
Primary Tabs: 전체 | 클렌저 | 토너 | 에센스 | 세럼 | 크림 | 선크림 | 마스크 | 패드 | 앰플 + Chevron
Product Grid (2-col, with ingredient chips per card)
```

- Category tabs filter products by type
- Chevron opens 2-column grid overlay with scrim (scrim starts below tab row)
- Each product card shows: image + brand + name + ingredient chips (Korean, rounded-full)

### Product Detail

```
Nav Bar (← Back + Bookmark + Share)
Product Image (4:3, bg-white border)
Tag + Brand + Name + Description
Surface Gap
Key Ingredients (INCI + Korean name + description)
Surface Gap
Related Articles
```

No purchase buttons.

### 북마크 (Saved)

```
Nav Bar (KWIP + Search)
Saved products grid (from localStorage) OR Empty State
```

---

## 09 · UX Rules

- **44px minimum touch targets** on all interactive elements — non-negotiable
- **Sticky tabs** stay fixed below nav bar on scroll
- **Scrim** for overlays: `bg-black/40`, constrained to 375px, starts below sticky tabs
- **Toast/Snackbar**: MD3 spec, `w-fit` centered, 48px height, appears above tab bar
- **Drag-to-scroll** enabled on tab rows for desktop mouse users
- **No hamburger menu** — removed, only search icon in nav bar
- **No purchase buttons** — removed from product detail
- **No subscribe page** — removed
- **Korean first** — all content in Korean. PDRN exception: stays as "PDRN"
- **Ingredient chip names** — Korean from DB, displayed on product cards in 발견 page
- **Product thumbnail bg** — `#F3F3F3` with `#EEE` border for consistent appearance across different product image backgrounds
