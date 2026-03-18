# Vertical Product List Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the horizontal carousel product layout with a vertical list and step filter, making the home flow concern-first and mobile-friendly.

**Architecture:** `ConcernHub` manages all state (selected concern + selected step). When no concern is selected, show the concern chips prominently with no product list below — push users to pick a concern first. When a concern is selected, show: compact ingredient chips → step filter bar → vertical product list grouped by step. New `ProductListItem` replaces the card inside carousels. `RoutineStepRow` is replaced by `RoutineStepSection` which renders vertical lists. `StepFilterBar` is a new chip row that filters by routine step.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, existing `Product`/`Ingredient`/`Concern` types from `@/lib/types`.

---

## New Home Flow

```
Home (no concern selected)
  └─ Concern prompt headline
  └─ ConcernSelector chips (already good)
  └─ Empty prompt: "Pick a concern to see recommendations"

Home (concern selected)
  └─ ConcernSelector chips (active one highlighted)
  └─ IngredientChips (compact inline — replaces big IngredientHighlight cards)
  └─ BuildRoutineButton (keep as-is)
  └─ StepFilterBar: [All] [Cleanser] [Toner] [Serum] …
  └─ RoutineStepSection × N (vertical ProductListItem rows per step)
     └─ [img 72px] Brand / Name / Ingredient reason
```

---

### Task 1: Create `ProductListItem` component

**Files:**
- Create: `src/components/home/ProductListItem.tsx`

This is the new mobile-optimised product row — horizontal layout, small image left, text right.

**Step 1: Create the component**

```tsx
// src/components/home/ProductListItem.tsx
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

interface ProductListItemProps {
  slug: string;
  name: string;
  brand: string;
  category: Category;
  image: string | null;
  locale: string;
  reason?: string;
}

export default function ProductListItem({
  slug,
  name,
  brand,
  category,
  image,
  locale,
  reason,
}: ProductListItemProps) {
  return (
    <Link
      href={`/${locale}/products/${slug}`}
      className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 min-h-[80px] active:scale-[0.99] transition-transform"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {/* Product image */}
      <div className="shrink-0 w-[72px] h-[72px] rounded-xl bg-neutral-50 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            width={72}
            height={72}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs uppercase tracking-wide">
            {category}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-neutral-500 mb-0.5">{brand}</p>
        <p className="text-[15px] font-semibold text-neutral-900 leading-tight line-clamp-2">
          {name}
        </p>
        {reason && (
          <p className="text-[12px] text-emerald-600 mt-1 line-clamp-1">{reason}</p>
        )}
      </div>

      {/* Chevron */}
      <svg className="shrink-0 text-neutral-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
```

**Step 2: Verify it builds**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add src/components/home/ProductListItem.tsx
git commit -m "feat: add ProductListItem — vertical row layout for product list"
```

---

### Task 2: Create `StepFilterBar` component

**Files:**
- Create: `src/components/home/StepFilterBar.tsx`

Horizontal chip row to filter products by routine step. "All" shows all steps.

**Step 1: Create the component**

```tsx
// src/components/home/StepFilterBar.tsx
"use client";

import type { Category } from "@/lib/types";

interface StepOption {
  category: Category | "all";
  label: string;
}

interface StepFilterBarProps {
  steps: StepOption[];
  selected: Category | "all";
  onSelect: (step: Category | "all") => void;
}

export default function StepFilterBar({ steps, selected, onSelect }: StepFilterBarProps) {
  return (
    <div className="-mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {steps.map((step) => {
          const active = selected === step.category;
          return (
            <button
              key={step.category}
              onClick={() => onSelect(step.category)}
              className={`shrink-0 px-4 h-9 rounded-full text-[13px] font-medium transition-all ${
                active
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-600 border border-neutral-200"
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add src/components/home/StepFilterBar.tsx
git commit -m "feat: add StepFilterBar — step filter chips for product list"
```

---

### Task 3: Create `RoutineStepSection` component

**Files:**
- Create: `src/components/home/RoutineStepSection.tsx`

Replaces `RoutineStepRow`. Renders a vertical list of `ProductListItem` rows with a step label header. No horizontal scroll.

**Step 1: Create the component**

```tsx
// src/components/home/RoutineStepSection.tsx
import type { Product, Category } from "@/lib/types";
import ProductListItem from "./ProductListItem";

interface RoutineStepSectionProps {
  step: number;
  label: string;
  category: Category;
  products: Product[];
  locale: string;
  getProductReason: (product: Product) => string | undefined;
}

export default function RoutineStepSection({
  step,
  label,
  products,
  locale,
  getProductReason,
}: RoutineStepSectionProps) {
  const loc = locale as "vi" | "en";

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{step}</span>
        <span className="text-[15px] font-semibold text-neutral-900">{label}</span>
      </div>
      <div className="space-y-2">
        {products.map((product) => (
          <ProductListItem
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
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add src/components/home/RoutineStepSection.tsx
git commit -m "feat: add RoutineStepSection — vertical product list per routine step"
```

---

### Task 4: Create compact `IngredientChips` component

**Files:**
- Create: `src/components/home/IngredientChips.tsx`

Replaces the large `IngredientHighlight` card row with a compact inline chip strip — shows ingredient name + effect in a small pill.

**Step 1: Create the component**

```tsx
// src/components/home/IngredientChips.tsx
import type { Ingredient, Concern } from "@/lib/types";

interface IngredientChipsProps {
  ingredients: Ingredient[];
  concern: Concern;
  locale: string;
}

export default function IngredientChips({ ingredients, concern, locale }: IngredientChipsProps) {
  const loc = locale as "vi" | "en";

  return (
    <div className="-mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ingredients.map((ing) => {
          const effect = ing.effects.find((e) => e.concern === concern && e.type === "good");
          const name = loc === "vi" ? ing.name.vi : ing.name.inci;
          return (
            <div
              key={ing.id}
              className="shrink-0 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 h-8"
            >
              <span className="text-[12px] font-semibold text-emerald-700">{name}</span>
              {effect && (
                <span className="text-[12px] text-emerald-600">
                  — {effect.reason[loc] || effect.reason.vi}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add src/components/home/IngredientChips.tsx
git commit -m "feat: add IngredientChips — compact inline ingredient reason pills"
```

---

### Task 5: Refactor `ConcernHub` — wire everything together

**Files:**
- Modify: `src/components/home/ConcernHub.tsx`

This is the main change. Replace `IngredientHighlight` + `RoutineStepRow` with `IngredientChips` + `StepFilterBar` + `RoutineStepSection`. Add `selectedStep` state. Remove the no-selection product grid.

**Step 1: Replace ConcernHub content**

```tsx
"use client";

import { useState } from "react";
import type { Product, Concern, Ingredient, Category } from "@/lib/types";
import ConcernSelector from "./ConcernSelector";
import IngredientChips from "./IngredientChips";
import StepFilterBar from "./StepFilterBar";
import RoutineStepSection from "./RoutineStepSection";
import BuildRoutineButton from "./BuildRoutineButton";
import { EmptyState } from "@/components/ui";

const ROUTINE_STEPS: { category: Category; label: Record<string, string>; step: number }[] = [
  { category: "cleanser", step: 1, label: { en: "Cleanse", vi: "Làm sạch" } },
  { category: "pad", step: 2, label: { en: "Exfoliate", vi: "Tẩy tế bào chết" } },
  { category: "toner", step: 3, label: { en: "Toner", vi: "Nước hoa hồng" } },
  { category: "essence", step: 4, label: { en: "Essence", vi: "Tinh chất" } },
  { category: "serum", step: 5, label: { en: "Serum", vi: "Serum" } },
  { category: "ampoule", step: 6, label: { en: "Ampoule", vi: "Tinh chất cô đặc" } },
  { category: "mask", step: 7, label: { en: "Mask", vi: "Mặt nạ" } },
  { category: "cream", step: 8, label: { en: "Moisturize", vi: "Dưỡng ẩm" } },
  { category: "sunscreen", step: 9, label: { en: "Sun Protection", vi: "Chống nắng" } },
];

interface ConcernData {
  id: Concern;
  label: string;
  icon: string;
  symptom: string;
  keyIngredientIds: string[];
}

interface ConcernHubProps {
  concerns: ConcernData[];
  products: Product[];
  ingredients: Ingredient[];
  locale: string;
  dict: {
    emptyState: string;
    helpfulIngredients: string;
    concernPrompt: string;
    buildCta: string;
    pickConcernPrompt: string;  // new: "Pick a concern to see recommendations"
    allSteps: string;           // new: "All"
  };
}

export default function ConcernHub({
  concerns,
  products,
  ingredients,
  locale,
  dict,
}: ConcernHubProps) {
  const [selected, setSelected] = useState<Concern | null>(null);
  const [selectedStep, setSelectedStep] = useState<Category | "all">("all");
  const loc = locale as "vi" | "en";

  function handleToggle(id: Concern) {
    setSelected((prev) => {
      if (prev === id) { setSelectedStep("all"); return null; }
      setSelectedStep("all");
      return id;
    });
  }

  const hasSelection = selected !== null;

  const filteredProducts = products
    .filter((p) => !hasSelection || p.concerns.includes(selected!))
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  const keyIngredientIds = hasSelection
    ? concerns.find((c) => c.id === selected)?.keyIngredientIds ?? []
    : [];

  const keyIngredients = keyIngredientIds
    .map((id) => ingredients.find((i) => i.id === id))
    .filter((i): i is Ingredient => i !== undefined);

  function getProductReason(product: Product): string | undefined {
    if (!hasSelection) return undefined;
    for (const pi of product.ingredients) {
      if (!pi.isKey) continue;
      const ing = ingredients.find((i) => i.id === pi.ingredientId);
      if (!ing) continue;
      const matchingEffect = ing.effects.find(
        (e) => e.concern === selected && e.type === "good"
      );
      if (matchingEffect) {
        const name = loc === "vi" ? ing.name.vi : ing.name.inci;
        return `${name} — ${matchingEffect.reason[loc] || matchingEffect.reason.vi}`;
      }
    }
    return undefined;
  }

  const activeConcerns = concerns.filter((c) =>
    products.some((p) => p.concerns.includes(c.id))
  );

  // Build routine groups for steps that have products
  const seenIds = new Set<string>();
  const routineGroups = hasSelection
    ? ROUTINE_STEPS
        .map((step) => ({
          ...step,
          products: filteredProducts
            .filter((p) => p.category === step.category && !seenIds.has(p.id))
            .map((p) => { seenIds.add(p.id); return p; }),
        }))
        .filter((group) => group.products.length > 0)
    : [];

  // Step filter options: All + steps that have products
  const stepOptions = [
    { category: "all" as const, label: dict.allSteps },
    ...routineGroups.map((g) => ({
      category: g.category,
      label: g.label[loc] || g.label.vi,
    })),
  ];

  // Sections to render based on step filter
  const visibleGroups = selectedStep === "all"
    ? routineGroups
    : routineGroups.filter((g) => g.category === selectedStep);

  return (
    <div className="space-y-5">
      {/* Concern selector */}
      <div className="space-y-3">
        <p className="text-[17px] font-medium text-neutral-900">{dict.concernPrompt}</p>
        <ConcernSelector
          concerns={activeConcerns}
          selected={selected}
          onToggle={handleToggle}
        />
      </div>

      {/* No selection state */}
      {!hasSelection && (
        <p className="text-[15px] text-neutral-400 text-center py-12">
          {dict.pickConcernPrompt}
        </p>
      )}

      {/* Selection state */}
      {hasSelection && (
        <div className="space-y-4">
          {/* Compact ingredient chips */}
          {keyIngredients.length > 0 && (
            <IngredientChips
              ingredients={keyIngredients}
              concern={selected!}
              locale={locale}
            />
          )}

          {/* Build Routine CTA */}
          <BuildRoutineButton locale={locale} concern={selected!} label={dict.buildCta} />

          {/* Step filter */}
          {routineGroups.length > 1 && (
            <StepFilterBar
              steps={stepOptions}
              selected={selectedStep}
              onSelect={setSelectedStep}
            />
          )}

          {/* Vertical product list */}
          {visibleGroups.length > 0 ? (
            <div className="space-y-6">
              {visibleGroups.map((group) => (
                <RoutineStepSection
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
            <EmptyState icon="🔍" title={dict.emptyState} />
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add src/components/home/ConcernHub.tsx
git commit -m "feat: refactor ConcernHub — vertical list, step filter, concern-first flow"
```

---

### Task 6: Add new dictionary strings

**Files:**
- Modify: `src/dictionaries/en.json`
- Modify: `src/dictionaries/vi.json`
- Modify: `src/app/[locale]/page.tsx` (pass new dict keys)

**Step 1: Add strings to en.json**

In the `"home"` section, add:
```json
"pickConcernPrompt": "Pick a skin concern to see recommendations",
"allSteps": "All"
```

**Step 2: Add strings to vi.json**

In the `"home"` section, add:
```json
"pickConcernPrompt": "Chọn vấn đề da để xem sản phẩm phù hợp",
"allSteps": "Tất cả"
```

**Step 3: Pass new keys in page.tsx**

Find where `dict` is passed to `ConcernHub` and add:
```tsx
dict={{
  emptyState: dict.home.emptyState,
  helpfulIngredients: dict.home.helpfulIngredients,
  concernPrompt: dict.home.concernPrompt,
  buildCta: dict.routine.buildCta,
  pickConcernPrompt: dict.home.pickConcernPrompt,  // add
  allSteps: dict.home.allSteps,                    // add
}}
```

**Step 4: Verify build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

**Step 5: Commit**

```bash
git add src/dictionaries/en.json src/dictionaries/vi.json src/app/[locale]/page.tsx
git commit -m "feat: add pickConcernPrompt + allSteps dictionary strings"
```

---

### Task 7: Add `no-scrollbar` utility CSS

**Files:**
- Modify: `src/app/globals.css` (or wherever global CSS is)

`StepFilterBar` and `IngredientChips` use `no-scrollbar` to hide the horizontal scrollbar on mobile. Add this utility if not already present.

**Step 1: Check if it already exists**

```bash
grep -r "no-scrollbar" src/
```

**Step 2: If missing, add to globals.css**

```css
@layer utilities {
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
}
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add no-scrollbar utility CSS"
```

---

### Task 8: Final build + smoke test

**Step 1: Full build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`, no type errors.

**Step 2: Visual smoke test**

```bash
npm run dev
```

Open `http://localhost:3000/vi` and verify:
- [ ] No concern selected → concern chips show + "Pick a skin concern" prompt, no product list
- [ ] Select "Acne" → ingredient chips appear + BuildRoutine button + step filter + vertical product list
- [ ] Step filter "Toner" → only toner products show
- [ ] Step filter "All" → all steps show
- [ ] Tap a product row → navigates to product detail
- [ ] Ingredient reason shows in emerald text below product name
- [ ] No horizontal carousel anywhere on mobile

**Step 3: Commit if any final tweaks**

```bash
git add -A
git commit -m "fix: final visual tweaks for vertical product list redesign"
git push
```
