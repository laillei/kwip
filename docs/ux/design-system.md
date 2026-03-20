# Kwip Design System

Standards: **Apple HIG** (primary) · **Material Design 3** (secondary where HIG has no guidance)

---

## Type Scale

Apple HIG Dynamic Type roles, rendered in Noto Sans. Only these sizes are permitted.

| Role | Size | Weight | Tailwind | Usage in Kwip |
|---|---|---|---|---|
| Large Title | 34px | Bold | `text-[34px] font-bold` | Empty state decorative icons |
| Title 2 | 22px | Bold | `text-[22px] font-bold` | Page headings (routine detail, desktop wordmark) |
| Headline | 17px | Semibold | `text-[17px] font-semibold` | Product names, routine names, empty state titles |
| Body | 17px | Regular | `text-[17px]` | General body text |
| Callout | 16px | Regular/Semibold | `text-base` | Navigation Bar wordmark ("Kwip") |
| Subheadline | 15px | Regular | `text-[15px]` | CTAs, product names in lists, form text, ingredient descriptions |
| Footnote | 13px | Regular | `text-[13px]` | Brand labels, INCI names, tertiary info, Scrollable/Fixed Tab labels |
| Overline | 12px | Semibold + uppercase | `text-xs font-semibold uppercase tracking-wide` | Section labels ("Key Ingredients", category headers) |
| Caption | 12px | Regular | `text-xs` | Tab Bar labels, badges, Secondary Tab labels |

**Forbidden sizes:** `text-sm` (14px) and `text-2xl` (24px) are not HIG sizes — do not use them.

Title 3 (20px, `text-xl font-semibold`) is a valid HIG role but not currently used in Kwip. Default to Headline (17px) or Title 2 (22px).

---

## Color

### Content colors
| Role | Token | Usage |
|---|---|---|
| Primary | `text-neutral-900` | Headings, primary content, active states |
| Secondary | `text-neutral-500` | Overline labels, subtitles |
| Tertiary | `text-neutral-400` | Brand names, INCI, placeholders, inactive tabs |
| Body | `text-neutral-600` | Ingredient descriptions, body copy |
| On-dark | `text-white` / `text-white/60` | Text on `bg-neutral-900` surfaces |

### Semantic colors (meaning only — never decorative)
| Token | Meaning |
|---|---|
| `text-emerald-600` | Positive / beneficial ingredient effect |
| `text-amber-600` | Caution / potential irritant |

### Forbidden text tokens
`text-neutral-300`, `text-neutral-700`, `text-neutral-800` — not in the palette.

---

## Surfaces

MD3 surface terminology applied to Kwip's flat design language. No elevation shadows — surfaces are separated by gaps and dividers only.

| Surface role | Implementation | Usage |
|---|---|---|
| **Surface** | `bg-white` full-width block | Content sections (product info, ingredient lists) |
| **Surface Container** | `<div className="h-4 bg-neutral-100" />` | Gap separating Surface blocks |
| **Surface Dim** | `bg-neutral-100` | Page background behind Surface blocks |
| **Surface Divider** | `divide-y divide-neutral-100` | Row separators within a Surface |

```
[Surface Dim — bg-neutral-100]
  [Surface — bg-white] product image + info
  [Surface Container — h-4 bg-neutral-100]
  [Surface — bg-white] key ingredients (Surface Dividers inside)
  [Surface Container — h-4 bg-neutral-100]
  [Surface — bg-white] all ingredients (Surface Dividers inside)
```

No `shadow-*` on surfaces. White background + border is the only acceptable alternative to `divide-y` for menus/overlays.

---

## Elevation & Scrim

**Scrim** (MD3): semi-transparent overlay behind modals and drawers — `bg-black/40`.

**Material Surface** (Apple HIG): surfaces that float above scrolling content use a translucent material:
- `bg-white/90 backdrop-blur-md`
- Applied to: purchase bar (product detail), routine builder save bar
- The **Navigation Bar** does NOT use this — it sits above the content area, not over it

---

## Spacing — 8pt Grid

Base unit: 8px. All spacing must be a multiple of 4px minimum, 8px preferred.

| Usage | Value |
|---|---|
| Section horizontal padding (mobile) | `px-4` (16px) |
| Section horizontal padding (desktop) | `px-8` (32px) |
| Surface Container gap | `h-4` (16px) |
| Grid column gap | `gap-x-3` (12px) |
| Grid row gap | `gap-y-6` (24px) |
| Surface Divider | `divide-y divide-neutral-100` |

---

## App Shell

The app shell wraps every page. Implemented in `MobileShell` (server component).

### Navigation Bar (Apple HIG) — Top App Bar (MD3)
- Component: `MobileShell` header
- Height: `h-14` (56px) + `env(safe-area-inset-top)`
- Background: solid `bg-white` (no blur — sits above content, not over it)
- Left slot: wordmark or back button (`headerLeft` prop)
- Right slot: contextual actions (`headerRight` prop) — empty by default
- Hidden at `md` breakpoint and above

### Tab Bar (Apple HIG) — Navigation Bar (MD3)
- Component: `BottomTabBar`
- Height: `h-[49px]` + `env(safe-area-inset-bottom)`
- Background: `bg-white`, `border-t border-neutral-100`
- Two destinations: Explore · Saved
- Hidden at `md` breakpoint and above

### Content Area
- `padding-top`: `calc(56px + env(safe-area-inset-top))`
- `padding-bottom`: `calc(49px + env(safe-area-inset-bottom))`

### Max-width by page
| Page | Max-width |
|---|---|
| Home | `max-w-6xl mx-auto` (desktop only, no max-width on mobile) |
| Product detail | `max-w-3xl mx-auto` |
| Routine detail | `max-w-2xl mx-auto` |
| /me, /routine/new | no max-width on mobile |

---

## Navigation Components

### Tab Bar (Apple HIG) — bottom destination navigation
**Component:** `BottomTabBar`

| Property | Value |
|---|---|
| Label style | Caption — `text-xs` |
| Active | `font-semibold text-neutral-900` |
| Inactive | `font-normal text-neutral-400` |
| Active indicator | color + weight only — no underline |
| Container height | `h-[49px]` |
| Item min touch target | `min-h-[44px]` |

### Scrollable Tabs (MD3) — horizontal content filter
**Component:** `ConcernFilterBar`

Used when there are many mutually exclusive filter options that overflow horizontally.

| Property | Value |
|---|---|
| Label style | Footnote — `text-[13px]` |
| Active | `font-semibold text-neutral-900 border-b-2 border-neutral-900 -mb-px` |
| Inactive | `font-normal text-neutral-400 border-b-2 border-transparent -mb-px` |
| Container | `border-b border-neutral-100` |
| Item height | `h-11` (44px) |

### Fixed Tabs (MD3) — section switcher
**Component:** `MePageClient` tab bar (Products · Routines)

Used when there are 2–3 equal-weight sections on the same screen. Full-width, no scrolling.

| Property | Value |
|---|---|
| Label style | Footnote — `text-[13px]` |
| Active | `font-semibold text-neutral-900 border-b-2 border-neutral-900 -mb-px` |
| Inactive | `font-normal text-neutral-400 border-b-2 border-transparent -mb-px` |
| Container | `border-b border-neutral-100` |
| Item height | `h-11` (44px) — same as Scrollable Tabs, never `py-*` |
| Text alignment | `flex items-center justify-center` |

### Secondary Tabs (MD3) — subordinate filter
**Component:** `StepFilterBar`

One hierarchy level below Scrollable Tabs. Color-only active state, no underline indicator.

| Property | Value |
|---|---|
| Label style | Caption — `text-xs` |
| Active | `font-semibold text-neutral-900` |
| Inactive | `font-normal text-neutral-400` |
| Active indicator | none — color + weight only |
| Height | `h-7` (28px) — see Minimum Touch Target exception below |

### Tab active indicator — implementation standard
Scrollable Tabs and Fixed Tabs share the same indicator implementation:
- Active button: `border-b-2 border-neutral-900 -mb-px`
- Inactive button: `border-b-2 border-transparent -mb-px`
- Container: `border-b border-neutral-100`
- The `-mb-px` makes the 2px active border visually replace the container's 1px border

**Never** implement the indicator with an absolutely-positioned element or background div.

---

## Minimum Touch Target (Apple HIG)

All interactive elements must meet **44×44pt minimum** (Apple HIG requirement).

| Element | Implementation |
|---|---|
| Navigation Bar actions | `min-w-[44px] min-h-[44px]` |
| Tab Bar items | `min-h-[44px]` |
| Scrollable Tab items | `h-11` (44px) |
| Fixed Tab items | `min-h-[44px]` |
| Form inputs | `min-h-[44px]` |
| Icon-only buttons | `min-w-[44px] min-h-[44px]` |
| List rows | `min-h-[44px]` |

**Exception — Secondary Tabs (`StepFilterBar`):** uses `h-7` (28px). This is the only documented exception. Reasons: secondary filter with low interaction frequency; 44px height was tried and reverted — visually too heavy, pushed product content below the fold. Do not change.

---

## Overline

Overline is a label style used above grouped content to name a section. It is not a standalone HIG role but a widely used professional convention.

```
text-xs font-semibold uppercase tracking-wide text-neutral-500
```

- Color: always `text-neutral-500` (Secondary) — never `text-neutral-400`
- Used in: product detail (Key Ingredients, All Ingredients), routine detail (step category labels)
- Can be implemented via `SectionHeader` UI component or inline element with the above classes

---

## Empty States (Apple HIG — No Content state)

Empty states are centered in the available viewport using optical centering.

```jsx
<div
  className="flex items-center justify-center"
  style={{ minHeight: "calc(100dvh - 56px - 49px)" }}
>
  <div className="-mt-16">
    {/* EmptyState component or custom content */}
  </div>
</div>
```

- `56px` = Navigation Bar height, `49px` = Tab Bar height
- Subtract additional fixed UI height when present: e.g. `calc(100dvh - 56px - 49px - 44px)` on /me (internal Fixed Tabs bar)
- `-mt-16` is optical correction — mathematically centered content reads as too low; shifting 64px upward corrects this
- Do NOT add `pt-*` / `pb-*` to the centering wrapper
- For inline empty states (e.g. no filter results): `<p className="text-[15px] text-neutral-400 text-center py-12">`
- For full-page empty states: use the `EmptyState` UI component

---

## Product Grid

| Property | Value |
|---|---|
| Mobile columns | 2 — `grid-cols-2` |
| Desktop columns | 4 — `md:grid-cols-4` |
| Gap | `gap-x-3 gap-y-6` |
| Image | `aspect-square rounded-xl bg-neutral-100 object-contain` |
| Brand label | Caption — `text-xs text-neutral-400` |
| Product name | Footnote Semibold — `text-[13px] font-semibold`, max 2 lines |
| Reason chip | Caption — `text-xs text-emerald-600`, max 1 line, optional |
| Bookmark | Top-right overlay, `min-w-[44px] min-h-[44px]` |

---

## Product Detail

| Element | Style |
|---|---|
| Product image | `aspect-[4/3] object-contain p-6 bg-white` |
| Brand | `text-[13px] text-neutral-400 uppercase tracking-wide` |
| Product name | Headline — `text-[17px] font-semibold text-neutral-900` |
| Section labels | Overline — `text-xs font-semibold uppercase tracking-wide text-neutral-500` |
| Surface separation | `<div className="h-4 bg-neutral-100" />` |
| Purchase bar position | Fixed, `bottom: calc(49px + env(safe-area-inset-bottom))` |
| Purchase bar surface | `bg-white/90 backdrop-blur-md border-t border-neutral-100` |
| Purchase buttons | `min-h-[50px] text-[15px] font-semibold rounded-xl bg-neutral-900 text-white` |

---

## Skincare Routine Order

1. Cleanser → 2. Pad → 3. Toner → 4. Essence → 5. Serum → 6. Ampoule → 7. Mask → 8. Cream → 9. Sunscreen

---

## Category Translations

| ID | Vietnamese | English |
|----|-----------|---------|
| cleanser | Sữa rửa mặt | Cleanser |
| pad | Pad | Pad |
| toner | Nước hoa hồng | Toner |
| essence | Tinh chất | Essence |
| serum | Serum | Serum |
| ampoule | Tinh chất cô đặc | Ampoule |
| mask | Mặt nạ | Mask |
| cream | Kem | Cream |
| sunscreen | Chống nắng | Sunscreen |
