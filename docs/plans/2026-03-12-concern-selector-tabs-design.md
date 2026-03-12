# Concern Selector — iOS Tab Style Redesign

**Date:** 2026-03-12

---

## Problem

The current 2-column card grid takes ~270px before the user sees any products. On mobile this is nearly half the viewport. The concern selector should be compact and out of the way — a navigation aid, not a hero.

---

## Design Decision

Replace the 2-column grid with a single horizontal scroll tab row.

- **Height:** ~56px total
- **Layout:** Single row, `overflow-x-auto`, `snap-x snap-mandatory`
- **Each tab:** concern label (bold, line 1) + symptom text (small, secondary, line 2)
- **No emoji icons** — symptom text carries the meaning
- **Selected state:** neutral-900 background, white text (both lines)
- **Unselected state:** white background, subtle shadow, neutral-900 label, neutral-400 symptom
- **Min tap target:** 56px height ✓

```
┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐
│██ Mụn  ██│ │ Lỗ chân   │ │ Dưỡng ẩm │ │ Sáng da  │  →
│██Mụn,bít██│ │ Lỗ to,dầu │ │ Da khô   │ │ Thâm nám │
└──────────┘ └───────────┘ └──────────┘ └──────────┘
```

---

## Component Changes

### `ConcernSelector.tsx`

Replace the `grid grid-cols-2` layout with a horizontal flex scroll container.

- Container: `flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4`
- Each tab: `shrink-0 snap-start px-4 py-3 rounded-2xl min-h-[56px] flex flex-col justify-center`
- Selected: `bg-neutral-900 text-white`
- Unselected: `bg-white text-neutral-900` with subtle box-shadow

No changes to `ConcernHub`, `page.tsx`, or any data.

---

## What Does Not Change

- Concern data (id, label, symptom, icon all remain in data — icon just not rendered)
- Selection logic (single-select toggle)
- Dictionary strings
