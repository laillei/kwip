# Multi-Select Concerns Home Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the home page from per-concern sections into a multi-select concern filter that shows key ingredients and matching products together.

**Architecture:** The current server-rendered home page passes ALL data (concerns, ingredients, products) to a new client component `ConcernHub`. This client component handles multi-select state and filters/renders ingredients + products reactively. The server page becomes a thin data-fetching shell.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, client-side state (useState)

---

### Task 1: Create ConcernSelector component

**Files:**
- Create: `src/components/home/ConcernSelector.tsx`

**Step 1: Create the component**

```tsx
"use client";

import type { Concern } from "@/lib/types";

interface ConcernSelectorProps {
  concerns: {
    id: Concern;
    label: string;
    icon: string;
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
    <div className="flex flex-wrap gap-2">
      {concerns.map((c) => {
        const isActive = selected.includes(c.id);
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              isActive
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-white text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200"
            }`}
            style={
              !isActive
                ? {
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                  }
                : undefined
            }
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

**Step 2: Verify it builds**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (component is not imported yet, just must compile)

**Step 3: Commit**

```bash
git add src/components/home/ConcernSelector.tsx
git commit -m "feat: add ConcernSelector multi-select button component"
```

---

### Task 2: Create IngredientHighlight component

Shows key ingredients for the selected concerns — the "trust layer" that explains WHY.

**Files:**
- Create: `src/components/home/IngredientHighlight.tsx`

**Step 1: Create the component**

```tsx
import type { Ingredient, Concern } from "@/lib/types";

interface IngredientHighlightProps {
  ingredients: Ingredient[];
  concerns: Concern[];
  locale: string;
}

export default function IngredientHighlight({
  ingredients,
  concerns,
  locale,
}: IngredientHighlightProps) {
  if (ingredients.length === 0) return null;

  const loc = locale as "vi" | "en";

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
        {loc === "vi" ? "Thành phần hữu ích" : "Helpful Ingredients"}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {ingredients.map((ing) => {
          const relevantEffects = ing.effects.filter(
            (e) => concerns.includes(e.concern) && e.type === "good"
          );
          return (
            <div
              key={ing.id}
              className="flex-shrink-0 w-[200px] bg-white rounded-xl p-3.5"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <p className="text-sm font-semibold text-neutral-900">
                {ing.name[loc] || ing.name.vi}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {ing.name.inci}
              </p>
              {relevantEffects.length > 0 && (
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed line-clamp-2">
                  {relevantEffects[0].reason[loc] || relevantEffects[0].reason.vi}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Verify it builds**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/home/IngredientHighlight.tsx
git commit -m "feat: add IngredientHighlight horizontal scroll component"
```

---

### Task 3: Create ConcernHub client component (orchestrator)

Combines ConcernSelector + IngredientHighlight + product grid with multi-select filtering logic.

**Files:**
- Create: `src/components/home/ConcernHub.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product, Concern, Ingredient } from "@/lib/types";
import ConcernSelector from "./ConcernSelector";
import IngredientHighlight from "./IngredientHighlight";
import ProductCard from "@/components/products/ProductCard";

interface ConcernData {
  id: Concern;
  label: string;
  icon: string;
  keyIngredientIds: string[];
}

interface ConcernHubProps {
  concerns: ConcernData[];
  products: Product[];
  ingredients: Ingredient[];
  locale: string;
  dict: {
    viewMore: string;
    emptyState: string;
    helpfulIngredients: string;
  };
}

export default function ConcernHub({
  concerns,
  products,
  ingredients,
  locale,
  dict,
}: ConcernHubProps) {
  const [selected, setSelected] = useState<Concern[]>([]);
  const loc = locale as "vi" | "en";

  function handleToggle(id: Concern) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  // If nothing selected, show all products (sorted by rank)
  const hasSelection = selected.length > 0;

  // Filter products that match ALL selected concerns
  const filteredProducts = hasSelection
    ? products.filter((p) => selected.every((c) => p.concerns.includes(c)))
    : products;

  const displayProducts = filteredProducts.slice(0, 12);

  // Get key ingredients for selected concerns
  const keyIngredientIds = hasSelection
    ? [
        ...new Set(
          concerns
            .filter((c) => selected.includes(c.id))
            .flatMap((c) => c.keyIngredientIds)
        ),
      ]
    : [];

  const keyIngredients = keyIngredientIds
    .map((id) => ingredients.find((i) => i.id === id))
    .filter((i): i is Ingredient => i !== undefined);

  // Build concern query param for "view more" link
  const concernParam = hasSelection
    ? selected.join(",")
    : "all";

  return (
    <div className="space-y-6">
      <ConcernSelector
        concerns={concerns}
        selected={selected}
        onToggle={handleToggle}
      />

      {hasSelection && keyIngredients.length > 0 && (
        <IngredientHighlight
          ingredients={keyIngredients}
          concerns={selected}
          locale={locale}
        />
      )}

      {displayProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name[loc] || product.name.vi}
                brand={product.brand}
                category={product.category}
                image={product.image}
                locale={locale}
                rank={product.popularity.rank}
              />
            ))}
          </div>

          {filteredProducts.length > 12 && (
            <div className="flex justify-center">
              <Link
                href={`/${locale}/products?concern=${concernParam}`}
                className="text-sm text-neutral-500 hover:text-neutral-700 active:text-neutral-900 transition-colors min-h-[44px] flex items-center gap-0.5"
              >
                {dict.viewMore}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-neutral-400 text-center py-8">
          {dict.emptyState}
        </p>
      )}
    </div>
  );
}
```

**Step 2: Verify it builds**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/home/ConcernHub.tsx
git commit -m "feat: add ConcernHub orchestrator with multi-select filtering"
```

---

### Task 4: Update dictionaries

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Add new keys to vi.json**

Add to `"home"` section:
```json
{
  "home": {
    "heading": "Kwip",
    "viewMore": "Xem thêm",
    "helpfulIngredients": "Thành phần hữu ích",
    "selectConcern": "Chọn vấn đề da của bạn"
  }
}
```

**Step 2: Add new keys to en.json**

Add to `"home"` section:
```json
{
  "home": {
    "heading": "Kwip",
    "viewMore": "View More",
    "helpfulIngredients": "Helpful Ingredients",
    "selectConcern": "Select your skin concern"
  }
}
```

**Step 3: Commit**

```bash
git add src/dictionaries/vi.json src/dictionaries/en.json
git commit -m "feat: add dictionary keys for concern hub"
```

---

### Task 5: Rewrite home page to use ConcernHub

Replace the current per-section layout with the new ConcernHub.

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Rewrite page.tsx**

```tsx
import { Suspense } from "react";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import ingredients from "@/data/ingredients.json";
import type { Product, Ingredient } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import SearchButton from "@/components/shared/SearchButton";
import ConcernHub from "@/components/home/ConcernHub";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const loc = locale as Locale;

  const allProducts = (products as Product[]).sort(
    (a, b) => a.popularity.rank - b.popularity.rank
  );

  const concernData = concerns.map((c) => ({
    id: c.id as import("@/lib/types").Concern,
    label: t(c.label, loc),
    icon: c.icon,
    keyIngredientIds: c.keyIngredients,
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4">
          <div>
            <span className="text-2xl font-bold tracking-tight">Kwip</span>
            <p className="text-[13px] text-neutral-400 mt-0.5">
              {dict.site.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SearchButton locale={locale} />
            <Suspense>
              <LanguageSwitcher />
            </Suspense>
          </div>
        </header>

        {/* Concern Hub */}
        <main className="px-6 md:px-8 pt-2 pb-20">
          <p className="text-sm text-neutral-500 mb-4">
            {dict.home.selectConcern}
          </p>
          <ConcernHub
            concerns={concernData}
            products={allProducts}
            ingredients={ingredients as Ingredient[]}
            locale={locale}
            dict={{
              viewMore: dict.home.viewMore,
              emptyState: dict.products.emptyState,
              helpfulIngredients: dict.home.helpfulIngredients,
            }}
          />
        </main>
      </div>
    </div>
  );
}
```

**Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds, `/[locale]` page renders

**Step 3: Manual verification**

Run: `npm run dev` and open http://localhost:3000/vi

Verify:
- [ ] 7 concern buttons render as pill/chip style
- [ ] No selection → all products shown (12 max, sorted by rank)
- [ ] Tap "Mụn" → filters to acne products + shows ingredient cards
- [ ] Tap "Cấp ẩm" too → shows only products matching BOTH acne + hydration
- [ ] Tap "Mụn" again → deselects, only hydration remains
- [ ] Ingredient cards scroll horizontally
- [ ] "View more" link appears when >12 products match
- [ ] Empty state shows when no products match the combination
- [ ] Language switcher still works

**Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: rewrite home page with multi-select ConcernHub"
```

---

### Task 6: Update products page to support multi-concern query param

The "View More" link from home now passes `?concern=acne,hydration`. The products page needs to handle comma-separated concerns.

**Files:**
- Modify: `src/app/[locale]/products/page.tsx`

**Step 1: Read current products page**

Read `src/app/[locale]/products/page.tsx` to understand the current concern filtering logic.

**Step 2: Update concern param parsing**

Where the page currently reads `searchParams.concern` and filters by a single concern, update to:
- Split `concern` param by comma: `const concernList = concern?.split(",") ?? []`
- Filter products matching ALL concerns in the list
- Highlight all selected concern pills in the UI

**Step 3: Build and verify**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/[locale]/products/page.tsx
git commit -m "feat: support multi-concern filtering on products page"
```

---

### Task 7: Clean up unused code

**Files:**
- Check: `src/components/products/ProductCard.tsx` — remove `rank` from interface if unused everywhere
- Check: Any unused imports in modified files

**Step 1: Audit and clean**

Check if `rank` prop is still used by any caller. If not, remove from `ProductCardProps` interface.

**Step 2: Final build**

Run: `npm run build 2>&1 | grep -E "(Warning|Error)"`
Expected: No warnings, no errors

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: clean up unused props and imports"
```
