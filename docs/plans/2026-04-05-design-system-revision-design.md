# Design System Revision — Apple HIG + MD3 Strict Compliance

**Date:** 2026-04-05
**Status:** Approved
**Figma source:** `Kwip — Screen Ideation` (file key `ZOwSR9rXcG6IstCzXeqmBF`)

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Compliance level | **Strict** | Full HIG Dynamic Type + MD3 color roles + 44/48px touch targets |
| Typefaces | **Pretendard + Plus Jakarta Sans** | 2-typeface max per Apple/Google. Pretendard for Korean body, Plus Jakarta Sans for English/labels |
| Primary color | **Deep Forest `#1A3D2B`** | Premium, natural, editorial — replaces `#00855d` |
| Color system | **MD3 semantic roles** | Primary/Secondary/Tertiary/Error/Surface families |
| Wordmark | **Headline 17px** Plus Jakarta Sans Semibold | Standard iOS nav bar sizing |
| Approach | **Doc-first, then Figma** | Design system doc is source of truth |

## What Changed from Previous Design System

### Typography
- 4 typefaces → 2 (dropped Noto Sans, Noto Serif)
- Non-HIG sizes removed: 18px → 17px, 24px → 22px, 14px → 15px, 10px → 11px
- Wordmark: Noto Serif Black 20px → Plus Jakarta Sans Semibold 17px
- Forbidden sizes enforced: no 14px, 18px, 24px, 10px

### Color
- Raw hex values eliminated — all colors mapped to MD3 semantic roles
- `#00855d` → `#1A3D2B` (Deep Forest) as primary
- `neutral-*` Tailwind tokens → Surface family tokens
- `emerald-600` / `amber-600` → removed (use semantic roles)

### Components
- Filter chips: flat rectangles → `rounded-full` pills with 48px touch target
- Article card image: no radius → `rounded-xl` (MD3 medium shape)
- Editorial badges: flat rectangles → `rounded-full` pills
- All gaps normalized to 8pt grid (removed 11px, 15.99px, 40px outliers)

### Surfaces
- `bg-white` → `bg-surface-lowest`
- `bg-neutral-100` → `bg-surface-container`
- `border-neutral-100` → `border-outline-variant`
