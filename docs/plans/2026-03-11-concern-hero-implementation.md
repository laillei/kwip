# Concern Hero Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace flat concern pills with a hero prompt + 2-column concern cards that invite engagement without blocking product browsing.

**Architecture:** Three changes: (1) add `symptom` field to `concerns.json`, (2) rewrite `ConcernSelector.tsx` as 2-column card grid, (3) add `concernPrompt` dictionary key and update `page.tsx`. Everything else (ConcernHub logic, IngredientHighlight, routing) stays unchanged.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS. Working directory: `/Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign`

---

### Task 1: Add symptom text to concerns.json

**Files:**
- Modify: `src/data/concerns.json`

Each concern needs a `symptom` field with `vi` and `en` keys — short descriptor shown under the concern label in the card.

**Step 1: Edit `src/data/concerns.json`**

Add a `symptom` field to each concern object. Final result for each entry:

```json
{ "id": "acne", "symptom": { "vi": "Mụn, bít lỗ chân lông", "en": "Breakouts & clogged pores" } }
{ "id": "pores", "symptom": { "vi": "Da bóng, lỗ chân lông to", "en": "Oily skin, large pores" } }
{ "id": "hydration", "symptom": { "vi": "Da khô, thiếu ẩm", "en": "Dry & dehydrated skin" } }
{ "id": "brightening", "symptom": { "vi": "Da xỉn, thâm nám", "en": "Dull skin & dark spots" } }
{ "id": "soothing", "symptom": { "vi": "Da kích ứng, đỏ", "en": "Irritated & sensitive skin" } }
{ "id": "anti-aging", "symptom": { "vi": "Da lão hóa, nếp nhăn", "en": "Fine lines & aging" } }
{ "id": "sun-protection", "symptom": { "vi": "Cần chống nắng", "en": "Sun protection" } }
```

**Step 2: Verify build still passes**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
```

Expected: clean build, no TypeScript errors.

**Step 3: Commit**

```bash
cd /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
git add src/data/concerns.json
git commit -m "feat: add symptom text to concerns data"
```

---

### Task 2: Add dictionary keys

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Add `concernPrompt` to `src/dictionaries/vi.json`**

In the `"home"` object, add:
```json
"concernPrompt": "Bạn đang gặp vấn đề gì với da?"
```

**Step 2: Add `concernPrompt` to `src/dictionaries/en.json`**

In the `"home"` object, add:
```json
"concernPrompt": "What's your skin concern?"
```

**Step 3: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
```

Expected: clean build.

**Step 4: Commit**

```bash
cd /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
git add src/dictionaries/vi.json src/dictionaries/en.json
git commit -m "feat: add concernPrompt dictionary key"
```

---

### Task 3: Rewrite ConcernSelector as 2-column card grid

**Files:**
- Modify: `src/components/home/ConcernSelector.tsx`

The current component receives `concerns: { id, label, icon }[]`. We need to add `symptom: string` to each item. The card shows: icon (large) + label (bold) + symptom (secondary text).

**Step 1: Replace the full content of `src/components/home/ConcernSelector.tsx`**

```tsx
"use client";

import type { Concern } from "@/lib/types";

interface ConcernSelectorProps {
  concerns: {
    id: Concern;
    label: string;
    icon: string;
    symptom: string;
  }[];
  selected: Concern[];
  onToggle: (id: Concern) => void;
}

export default function ConcernSelector({
  concerns,
  selected,
  onToggle,
}: ConcernSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {concerns.map((c) => {
        const isActive = selected.includes(c.id);
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all min-h-[56px] ${
              isActive
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-900"
            }`}
            style={
              !isActive
                ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }
                : undefined
            }
          >
            <span className="text-xl shrink-0">{c.icon}</span>
            <div className="min-w-0">
              <p className={`text-sm font-semibold leading-tight ${isActive ? "text-white" : "text-neutral-900"}`}>
                {c.label}
              </p>
              <p className={`text-xs mt-0.5 leading-tight truncate ${isActive ? "text-neutral-300" : "text-neutral-400"}`}>
                {c.symptom}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
```

Expected: TypeScript error — `ConcernHub.tsx` passes concerns without `symptom` field. Fix in next task.

**Step 3: Commit**

```bash
cd /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
git add src/components/home/ConcernSelector.tsx
git commit -m "feat: redesign ConcernSelector as 2-col card grid"
```

---

### Task 4: Pass symptom through ConcernHub and page.tsx

**Files:**
- Modify: `src/components/home/ConcernHub.tsx`
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Update `ConcernData` interface in `src/components/home/ConcernHub.tsx`**

Find the interface (line ~22):
```ts
interface ConcernData {
  id: Concern;
  label: string;
  icon: string;
  keyIngredientIds: string[];
}
```

Replace with:
```ts
interface ConcernData {
  id: Concern;
  label: string;
  icon: string;
  symptom: string;
  keyIngredientIds: string[];
}
```

**Step 2: Pass `symptom` to `ConcernSelector` in `ConcernHub.tsx`**

Find the `<ConcernSelector` usage (near bottom of file). It currently passes:
```tsx
<ConcernSelector
  concerns={concerns}
  selected={selected}
  onToggle={handleToggle}
/>
```

No change needed here — `concerns` already includes `symptom` since it comes from `ConcernHubProps`. The type will propagate correctly.

**Step 3: Update `concernData` mapping in `src/app/[locale]/page.tsx`**

Find (line ~25):
```ts
const concernData = concerns.map((c) => ({
  id: c.id as import("@/lib/types").Concern,
  label: t(c.label, loc),
  icon: c.icon,
  keyIngredientIds: c.keyIngredients,
}));
```

Replace with:
```ts
const concernData = concerns.map((c) => ({
  id: c.id as import("@/lib/types").Concern,
  label: t(c.label, loc),
  icon: c.icon,
  symptom: t(c.symptom, loc),
  keyIngredientIds: c.keyIngredients,
}));
```

**Step 4: Verify build passes**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
```

Expected: clean build, no TypeScript errors.

**Step 5: Commit**

```bash
cd /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
git add src/components/home/ConcernHub.tsx src/app/[locale]/page.tsx
git commit -m "feat: wire symptom field through ConcernHub and page"
```

---

### Task 5: Add hero prompt to the home page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

Replace the current small gray label with a proper hero prompt heading.

**Step 1: Update `src/app/[locale]/page.tsx` — pass `concernPrompt` and replace the label**

Find the dict prop being passed to ConcernHub (line ~58):
```tsx
dict={{
  emptyState: dict.products.emptyState,
  helpfulIngredients: dict.home.helpfulIngredients,
}}
```

Replace with:
```tsx
dict={{
  emptyState: dict.products.emptyState,
  helpfulIngredients: dict.home.helpfulIngredients,
  concernPrompt: dict.home.concernPrompt,
}}
```

Find the prompt text above ConcernHub (line ~51):
```tsx
<p className="text-sm text-neutral-500 mb-4">
  {dict.home.selectConcern}
</p>
```

Remove it entirely — the prompt will live inside ConcernHub.

**Step 2: Update `ConcernHubProps` dict in `src/components/home/ConcernHub.tsx`**

Find:
```ts
dict: {
  emptyState: string;
  helpfulIngredients: string;
};
```

Replace with:
```ts
dict: {
  emptyState: string;
  helpfulIngredients: string;
  concernPrompt: string;
};
```

**Step 3: Add the hero prompt heading inside `ConcernHub.tsx`**

Find the `return (` block with `<div className="space-y-5">`. Replace the opening with:

```tsx
return (
  <div className="space-y-5">
    <div>
      <p className="text-base font-medium text-neutral-900 mb-3">
        {dict.concernPrompt}
      </p>
      <ConcernSelector
        concerns={concerns}
        selected={selected}
        onToggle={handleToggle}
      />
    </div>
```

(The rest of the return stays exactly the same — just wrap the existing `<ConcernSelector>` in this new div.)

**Step 4: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
```

Expected: clean build.

**Step 5: Visual check — start dev server**

```bash
npm run dev --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
```

Open http://localhost:3001 (or next available port). Verify:
- Hero prompt text appears above the 2-col card grid
- Cards are readable with icon + label + symptom text
- Selecting a card activates it (dark background)
- Products appear below and reorganize when concern selected

**Step 6: Commit**

```bash
cd /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
git add src/app/[locale]/page.tsx src/components/home/ConcernHub.tsx
git commit -m "feat: add hero concern prompt to home page"
```

---

### Task 6: Final build verification

**Step 1: Full build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/concern-redesign
```

Expected: clean build, all routes generate successfully.

**Step 2: Check both locales**

Open http://localhost:3001/vi — verify Vietnamese text
Open http://localhost:3001/en — verify English text

Both should show correct symptom text under each concern card.
