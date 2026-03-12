# Product Grid Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the vertical stacked grid (one grid per routine step) with horizontal scroll rows on mobile and a collapsed "show top 4 + expand" grid on desktop — so the full routine is visible without excessive scrolling at any catalog size.

**Architecture:** Create a new `RoutineStepRow` component that handles both layouts via responsive CSS. Modify `ConcernHub` to pass all products per step (not sliced to 4) and render `RoutineStepRow` instead of the current `<section>` + grid. No data changes, no dictionary changes, no changes to `ProductCard`.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS. No test framework — verify with `npm run build` and visual inspection on dev server.

---

## Task 1: Remove the 4-product slice from ConcernHub

The current `routineGroups` computation slices each step to 4 products. `RoutineStepRow` will handle limiting internally, so we need to pass all products per step.

**Files:**
- Modify: `src/components/home/ConcernHub.tsx` (lines 98–109)

**Step 1: Read the current routineGroups computation**

Open `src/components/home/ConcernHub.tsx` and find this block (around line 98):

```ts
const seenIds = new Set<string>();
const routineGroups = hasSelection
  ? routineSteps
      .map((step) => ({
        ...step,
        products: filteredProducts
          .filter((p) => p.category === step.category && !seenIds.has(p.id))
          .slice(0, 4)
          .map((p) => { seenIds.add(p.id); return p; }),
      }))
      .filter((group) => group.products.length > 0)
  : [];
```

**Step 2: Remove the `.slice(0, 4)` call**

Replace the block above with:

```ts
const seenIds = new Set<string>();
const routineGroups = hasSelection
  ? routineSteps
      .map((step) => ({
        ...step,
        products: filteredProducts
          .filter((p) => p.category === step.category && !seenIds.has(p.id))
          .map((p) => { seenIds.add(p.id); return p; }),
      }))
      .filter((group) => group.products.length > 0)
  : [];
```

**Step 3: Verify build passes**

```bash
npm run build
```

Expected: build completes with no errors. (Visual output unchanged for now — still renders the old grid.)

**Step 4: Commit**

```bash
git add src/components/home/ConcernHub.tsx
git commit -m "refactor: pass all products per step to routine groups (no slice)"
```

---

## Task 2: Create RoutineStepRow component

**Files:**
- Create: `src/components/home/RoutineStepRow.tsx`

**Step 1: Create the file with this exact content**

```tsx
"use client";

import { useState } from "react";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";

interface RoutineStepRowProps {
  step: number;
  label: string;
  category: Category;
  products: Product[];
  locale: string;
  getProductReason: (product: Product) => string | undefined;
}

const DESKTOP_INITIAL = 4;

export default function RoutineStepRow({
  step,
  label,
  products,
  locale,
  getProductReason,
}: RoutineStepRowProps) {
  const [expanded, setExpanded] = useState(false);
  const loc = locale as "vi" | "en";
  const hasMore = products.length > DESKTOP_INITIAL;
  const desktopProducts = expanded ? products : products.slice(0, DESKTOP_INITIAL);

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">
        {step} · {label}
      </h3>

      {/* Mobile: horizontal scroll row */}
      <div className="md:hidden -mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
          {products.map((product) => (
            <div key={product.id} className="shrink-0 w-40 snap-start">
              <ProductCard
                slug={product.slug}
                name={product.name[loc] || product.name.vi}
                brand={product.brand}
                category={product.category}
                image={product.image}
                locale={locale}
                reason={getProductReason(product)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: collapsed grid with expand */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-5">
          {desktopProducts.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name[loc] || product.name.vi}
              brand={product.brand}
              category={product.category}
              image={product.image}
              locale={locale}
              reason={getProductReason(product)}
            />
          ))}
        </div>
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            + {products.length - DESKTOP_INITIAL} more
          </button>
        )}
      </div>
    </section>
  );
}
```

**Step 2: Verify build passes**

```bash
npm run build
```

Expected: build passes. (Component not used yet, but no errors.)

**Step 3: Commit**

```bash
git add src/components/home/RoutineStepRow.tsx
git commit -m "feat: add RoutineStepRow with horizontal scroll (mobile) and collapsed grid (desktop)"
```

---

## Task 3: Wire RoutineStepRow into ConcernHub

**Files:**
- Modify: `src/components/home/ConcernHub.tsx`

**Step 1: Add the import at the top of ConcernHub**

After the existing imports, add:

```ts
import RoutineStepRow from "./RoutineStepRow";
```

**Step 2: Replace the routine-grouped render block**

Find the current `hasSelection` render block (around line 134):

```tsx
{hasSelection ? (
  routineGroups.length > 0 ? (
    <div className="space-y-8">
      {routineGroups.map((group) => (
        <section key={group.category}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">
            {group.label[loc] || group.label.vi}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {group.products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name[loc] || product.name.vi}
                brand={product.brand}
                category={product.category}
                image={product.image}
                locale={locale}
                reason={getProductReason(product)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  ) : (
```

Replace with:

```tsx
{hasSelection ? (
  routineGroups.length > 0 ? (
    <div className="space-y-8">
      {routineGroups.map((group) => (
        <RoutineStepRow
          key={group.category}
          step={group.step}
          label={group.label[loc] || group.label.vi}
          category={group.category}
          products={group.products}
          locale={locale}
          getProductReason={getProductReason}
        />
      ))}
    </div>
  ) : (
```

**Step 3: Run build**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

**Step 4: Start dev server and visually verify**

```bash
npm run dev
```

Open `http://localhost:3000/vi` and:
- Select a concern (e.g. Mụn)
- On mobile viewport (375px): each routine step shows horizontal scroll row, 2 cards + peek of third
- On desktop viewport: each step shows 4 cards, "+ N more" button appears if more exist
- Without concern selected: flat grid unchanged
- Tapping a product card still navigates to detail page

**Step 5: Commit**

```bash
git add src/components/home/ConcernHub.tsx
git commit -m "feat: render routine steps as RoutineStepRow (horizontal mobile, collapsed desktop)"
```

---

## Task 4: Final verification and push

**Step 1: Full build check**

```bash
npm run build
```

Expected: clean build.

**Step 2: Mobile visual check**

In Chrome DevTools, set viewport to 390×844 (iPhone 14). Select a concern. Verify:
- All routine steps visible with minimal scroll
- Horizontal rows swipeable
- Third card peeks on the right edge
- Ingredient reason shows on each card

**Step 3: Desktop visual check**

At full desktop width. Select a concern. Verify:
- 4 products per step shown by default
- "+ N more" button shows for steps with more products
- Clicking expands that step inline
- Other steps remain collapsed

**Step 4: Deselect concern**

Click the active concern card to deselect. Verify flat grid returns, identical to before.

**Step 5: Push**

```bash
git push
```
