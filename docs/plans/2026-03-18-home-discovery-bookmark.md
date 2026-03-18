# Home Discovery + Bookmark Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Replace the empty-on-load concern-first home with an always-visible product list + two independent filter rows (concern + category), and add a bookmark feature so users can save products and create routines from them.

**Architecture:** New `DiscoveryHub` client component replaces `ConcernHub`. Two `FilterBar` chip rows (concern + category) filter a single flat `ProductListItem` list. Bookmark state lives in `localStorage` via new `localSaved.ts` helpers. `BottomTabBar` shows a badge count. Product detail page gets a `BookmarkButton` client component in its header.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, localStorage (no new dependencies)

---

## Context

- Worktree: `/Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list`
- Branch: `feature/vertical-product-list`
- Key existing files:
  - `src/lib/localRoutines.ts` — mirror this pattern for `localSaved.ts`
  - `src/components/home/ProductListItem.tsx` — add bookmark icon
  - `src/components/home/StepFilterBar.tsx` — reuse for category filter
  - `src/components/shell/BottomTabBar.tsx` — add badge
  - `src/app/[locale]/me/MePageClient.tsx` — add saved products section
  - `src/app/[locale]/products/[slug]/page.tsx` — add bookmark in header

---

## Task 1: Create `src/lib/localSaved.ts`

**Files:**
- Create: `src/lib/localSaved.ts`

**Step 1: Write the file**

```ts
// src/lib/localSaved.ts
const KEY = "kwip_saved_products";

function dispatchUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kwip_saved_updated"));
  }
}

export function getSavedProducts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveProduct(id: string): void {
  const saved = getSavedProducts();
  if (!saved.includes(id)) {
    localStorage.setItem(KEY, JSON.stringify([...saved, id]));
    dispatchUpdate();
  }
}

export function unsaveProduct(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getSavedProducts().filter((s) => s !== id)));
  dispatchUpdate();
}

export function isProductSaved(id: string): boolean {
  return getSavedProducts().includes(id);
}

export function getSavedCount(): number {
  return getSavedProducts().length;
}
```

**Step 2: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add src/lib/localSaved.ts
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "feat: add localSaved — bookmark localStorage helpers"
```

---

## Task 2: Create `src/components/home/ConcernFilterBar.tsx`

**Files:**
- Create: `src/components/home/ConcernFilterBar.tsx`

Same chip pattern as `StepFilterBar` but typed for `Concern | "all"`.

**Step 1: Write the file**

```tsx
// src/components/home/ConcernFilterBar.tsx
"use client";

import type { Concern } from "@/lib/types";

interface ConcernOption {
  id: Concern | "all";
  label: string;
}

interface ConcernFilterBarProps {
  options: ConcernOption[];
  selected: Concern | "all";
  onSelect: (id: Concern | "all") => void;
}

export default function ConcernFilterBar({ options, selected, onSelect }: ConcernFilterBarProps) {
  return (
    <div className="-mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {options.map((option) => {
          const active = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.id)}
              className={`shrink-0 px-4 h-9 rounded-full text-[13px] font-medium transition-all ${
                active
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-600 border border-neutral-200"
              }`}
            >
              {option.label}
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
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add src/components/home/ConcernFilterBar.tsx
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "feat: add ConcernFilterBar — concern chip filter row"
```

---

## Task 3: Update `ProductListItem` — add bookmark icon

**Files:**
- Modify: `src/components/home/ProductListItem.tsx`

Add `"use client"`, `saved?: boolean`, `onBookmark?: (e: React.MouseEvent) => void` props. When `onBookmark` is undefined the bookmark button is not rendered — backward compatible with `RoutineStepSection`.

**Step 1: Replace the file**

```tsx
// src/components/home/ProductListItem.tsx
"use client";

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
  saved?: boolean;
  onBookmark?: (e: React.MouseEvent) => void;
}

export default function ProductListItem({
  slug,
  name,
  brand,
  category,
  image,
  locale,
  reason,
  saved,
  onBookmark,
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
            alt={`${brand} ${name}`}
            width={72}
            height={72}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-50" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 mb-0.5">{brand}</p>
        <p className="text-[15px] font-semibold text-neutral-900 leading-tight line-clamp-2">{name}</p>
        {reason && (
          <p className="text-xs text-emerald-600 mt-1 line-clamp-1">{reason}</p>
        )}
      </div>

      {/* Bookmark button — only rendered when onBookmark is provided */}
      {onBookmark && (
        <button
          type="button"
          onClick={onBookmark}
          className="shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] text-neutral-400 hover:text-neutral-900 transition-colors"
          aria-label={saved ? "Remove bookmark" : "Save product"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
      )}

      {/* Chevron */}
      <svg
        className="shrink-0 text-neutral-400"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
```

**Step 2: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add src/components/home/ProductListItem.tsx
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "feat: ProductListItem — add bookmark icon + use client"
```

---

## Task 4: Create `src/components/home/DiscoveryHub.tsx`

**Files:**
- Create: `src/components/home/DiscoveryHub.tsx`

This replaces `ConcernHub`. Two filter rows (concern + category), always-visible product list, bookmark state, first-save toast.

**Step 1: Write the file**

```tsx
// src/components/home/DiscoveryHub.tsx
"use client";

import { useState, useEffect } from "react";
import type { Product, Concern, Ingredient, Category } from "@/lib/types";
import ConcernFilterBar from "./ConcernFilterBar";
import StepFilterBar from "./StepFilterBar";
import ProductListItem from "./ProductListItem";
import { getSavedProducts, saveProduct, unsaveProduct } from "@/lib/localSaved";

const CATEGORIES: { category: Category; label: Record<string, string> }[] = [
  { category: "cleanser", label: { vi: "Sữa rửa mặt", en: "Cleanser" } },
  { category: "pad", label: { vi: "Tẩy da chết", en: "Exfoliator" } },
  { category: "toner", label: { vi: "Toner", en: "Toner" } },
  { category: "essence", label: { vi: "Essence", en: "Essence" } },
  { category: "serum", label: { vi: "Serum", en: "Serum" } },
  { category: "ampoule", label: { vi: "Ampoule", en: "Ampoule" } },
  { category: "mask", label: { vi: "Mặt nạ", en: "Mask" } },
  { category: "cream", label: { vi: "Kem dưỡng", en: "Moisturizer" } },
  { category: "sunscreen", label: { vi: "Chống nắng", en: "Sunscreen" } },
];

interface ConcernData {
  id: Concern;
  label: string;
  icon: string;
  symptom: string;
  keyIngredientIds: string[];
}

interface DiscoveryHubProps {
  concerns: ConcernData[];
  products: Product[];
  ingredients: Ingredient[];
  locale: string;
  dict: {
    allItems: string;
    emptyState: string;
    savedToast: string;
    productsCount: string; // "{{count}} sản phẩm" — use {{count}} as placeholder
  };
}

export default function DiscoveryHub({
  concerns,
  products,
  ingredients,
  locale,
  dict,
}: DiscoveryHubProps) {
  const [selectedConcern, setSelectedConcern] = useState<Concern | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const loc = locale as "vi" | "en";

  useEffect(() => {
    setSavedIds(new Set(getSavedProducts()));
  }, []);

  function handleBookmark(productId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        unsaveProduct(productId);
      } else {
        next.add(productId);
        saveProduct(productId);
        // Show toast only on very first save ever
        if (next.size === 1 && !localStorage.getItem("kwip_toast_shown")) {
          localStorage.setItem("kwip_toast_shown", "1");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500);
        }
      }
      return next;
    });
  }

  function handleConcernSelect(id: Concern | "all") {
    setSelectedConcern(id);
    setSelectedCategory("all");
  }

  function getProductReason(product: Product): string | undefined {
    if (selectedConcern === "all") return undefined;
    for (const pi of product.ingredients) {
      if (!pi.isKey) continue;
      const ing = ingredients.find((i) => i.id === pi.ingredientId);
      if (!ing) continue;
      const effect = ing.effects.find(
        (e) => e.concern === selectedConcern && e.type === "good"
      );
      if (effect) {
        const name = loc === "vi" ? ing.name.vi : ing.name.inci;
        return `${name} — ${effect.reason[loc] || effect.reason.vi}`;
      }
    }
    return undefined;
  }

  // Filter products
  const concernFiltered = products.filter(
    (p) => selectedConcern === "all" || p.concerns.includes(selectedConcern)
  );
  const filtered = concernFiltered.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

  // Concern options: All + active concerns (have products)
  const concernOptions = [
    { id: "all" as const, label: dict.allItems },
    ...concerns
      .filter((c) => products.some((p) => p.concerns.includes(c.id)))
      .map((c) => ({ id: c.id, label: c.label })),
  ];

  // Category options: All + categories present in concern-filtered products
  const availableCategories = CATEGORIES.filter((cat) =>
    concernFiltered.some((p) => p.category === cat.category)
  );
  const categoryOptions = [
    { category: "all" as const, label: dict.allItems },
    ...availableCategories.map((cat) => ({
      category: cat.category,
      label: cat.label[loc] || cat.label.vi,
    })),
  ];

  const countLabel = dict.productsCount.replace("{{count}}", String(filtered.length));

  return (
    <div className="space-y-3">
      {/* Concern filter */}
      <ConcernFilterBar
        options={concernOptions}
        selected={selectedConcern}
        onSelect={handleConcernSelect}
      />

      {/* Category filter */}
      <StepFilterBar
        steps={categoryOptions}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Result count */}
      <p className="text-xs text-neutral-500 px-1">{countLabel}</p>

      {/* Product list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-[15px] text-neutral-400 text-center py-12">{dict.emptyState}</p>
        ) : (
          filtered.map((product) => (
            <ProductListItem
              key={product.id}
              slug={product.slug}
              name={product.name[loc] || product.name.vi}
              brand={product.brand}
              category={product.category}
              image={product.image}
              locale={locale}
              reason={getProductReason(product)}
              saved={savedIds.has(product.id)}
              onBookmark={(e) => handleBookmark(product.id, e)}
            />
          ))
        )}
      </div>

      {/* First-save toast */}
      {showToast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-neutral-900 text-white text-[14px] font-medium px-4 py-3 rounded-2xl text-center shadow-lg animate-fade-in">
          {dict.savedToast}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```
Expected: `✓ Compiled successfully` — fix any TypeScript errors before proceeding.

**Step 3: Commit**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add src/components/home/DiscoveryHub.tsx
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "feat: add DiscoveryHub — always-visible product list with concern + category filters"
```

---

## Task 5: Add dictionary strings

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Add to `vi.json` — `home` section**

Add these keys inside the `"home"` object:
```json
"allItems": "Tất cả",
"savedToast": "Đã lưu. Xem trong Của tôi",
"productsCount": "{{count}} sản phẩm"
```

**Step 2: Add to `vi.json` — `me` section**

Add these keys inside the `"me"` object (create the section if it doesn't exist, check first):
```json
"savedProducts": "Đã lưu",
"createRoutineFromSaved": "Tạo routine từ sản phẩm đã lưu",
"noSavedProducts": "Chưa lưu sản phẩm nào"
```

**Step 3: Add to `en.json` — `home` section**

```json
"allItems": "All",
"savedToast": "Saved. View in My Routines",
"productsCount": "{{count}} products"
```

**Step 4: Add to `en.json` — `me` section**

```json
"savedProducts": "Saved",
"createRoutineFromSaved": "Create routine from saved",
"noSavedProducts": "No saved products yet"
```

**Step 5: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```

**Step 6: Commit**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add src/dictionaries/vi.json src/dictionaries/en.json
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "feat: add discovery + bookmark dictionary strings"
```

---

## Task 6: Wire `page.tsx` — use DiscoveryHub

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Replace ConcernHub import with DiscoveryHub**

In `src/app/[locale]/page.tsx`:

1. Replace `import ConcernHub from "@/components/home/ConcernHub";` with:
```tsx
import DiscoveryHub from "@/components/home/DiscoveryHub";
```

2. Replace the `<ConcernHub ... />` JSX block with:
```tsx
<DiscoveryHub
  concerns={concernData}
  products={allProducts}
  ingredients={rawIngredients as Ingredient[]}
  locale={locale}
  dict={{
    allItems: dict.home.allItems,
    emptyState: dict.products.emptyState,
    savedToast: dict.home.savedToast,
    productsCount: dict.home.productsCount,
  }}
/>
```

**Step 2: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add -A
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "feat: wire DiscoveryHub into home page"
```

---

## Task 7: Update `BottomTabBar` — saved count badge

**Files:**
- Modify: `src/components/shell/BottomTabBar.tsx`

Add `useEffect` to read saved count from localStorage and display a badge on the Me tab. Listen for `kwip_saved_updated` custom event dispatched by `localSaved.ts`.

**Step 1: Modify BottomTabBar**

Add imports and state at the top of the component:

```tsx
import { useState, useEffect } from "react";
import { getSavedCount } from "@/lib/localSaved";
```

Inside the component function, before the `tabs` array:

```tsx
const [savedCount, setSavedCount] = useState(0);

useEffect(() => {
  const update = () => setSavedCount(getSavedCount());
  update();
  window.addEventListener("kwip_saved_updated", update);
  window.addEventListener("storage", update);
  return () => {
    window.removeEventListener("kwip_saved_updated", update);
    window.removeEventListener("storage", update);
  };
}, []);
```

In the Me tab's Link JSX, wrap the icon in a `relative` div and add the badge:

```tsx
{
  href: `/${locale}/me`,
  label: navLabels.routine,
  icon: (
    <div className="relative">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
      {savedCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
          {savedCount > 9 ? "9+" : savedCount}
        </span>
      )}
    </div>
  ),
},
```

**Step 2: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```

**Step 3: Commit**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add src/components/shell/BottomTabBar.tsx
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "feat: BottomTabBar — saved products badge on Me tab"
```

---

## Task 8: Create `BookmarkButton` for product detail page

**Files:**
- Create: `src/components/shared/BookmarkButton.tsx`
- Modify: `src/app/[locale]/products/[slug]/page.tsx`

The product detail page is a server component. Add a small client component for the bookmark toggle in the header.

**Step 1: Create `BookmarkButton.tsx`**

```tsx
// src/components/shared/BookmarkButton.tsx
"use client";

import { useState, useEffect } from "react";
import { isProductSaved, saveProduct, unsaveProduct } from "@/lib/localSaved";

interface BookmarkButtonProps {
  productId: string;
  ariaLabelSave: string;
  ariaLabelRemove: string;
}

export default function BookmarkButton({ productId, ariaLabelSave, ariaLabelRemove }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isProductSaved(productId));
  }, [productId]);

  function handleToggle() {
    if (saved) {
      unsaveProduct(productId);
      setSaved(false);
    } else {
      saveProduct(productId);
      setSaved(true);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center justify-center min-w-[44px] min-h-[44px] text-neutral-900 transition-colors"
      aria-label={saved ? ariaLabelRemove : ariaLabelSave}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    </button>
  );
}
```

**Step 2: Add to product detail page header**

In `src/app/[locale]/products/[slug]/page.tsx`:

1. Add import at the top:
```tsx
import BookmarkButton from "@/components/shared/BookmarkButton";
```

2. In the `headerRight` prop of `MobileShell`, add `BookmarkButton` alongside `LanguageSwitcher`:
```tsx
headerRight={
  <div className="flex items-center gap-1">
    <BookmarkButton
      productId={product.id}
      ariaLabelSave={dict.detail.saveProduct ?? "Save product"}
      ariaLabelRemove={dict.detail.removeBookmark ?? "Remove bookmark"}
    />
    <Suspense>
      <LanguageSwitcher />
    </Suspense>
  </div>
}
```

3. Add `saveProduct` and `removeBookmark` strings to both dictionaries `detail` section:

`vi.json` detail section:
```json
"saveProduct": "Lưu sản phẩm",
"removeBookmark": "Bỏ lưu"
```

`en.json` detail section:
```json
"saveProduct": "Save product",
"removeBookmark": "Remove bookmark"
```

**Step 3: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```
Fix any TypeScript errors. If `dict.detail.saveProduct` is not typed yet, use string literals directly.

**Step 4: Commit**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add -A
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "feat: BookmarkButton — save/unsave from product detail page"
```

---

## Task 9: Update `MePageClient` — saved products section

**Files:**
- Modify: `src/app/[locale]/me/MePageClient.tsx`
- Modify: `src/app/[locale]/me/page.tsx`

Show saved products at the top of the Me page with a "Create routine from saved" CTA.

**Step 1: Read `src/app/[locale]/me/page.tsx`** to understand what it currently passes to MePageClient.

**Step 2: Update `me/page.tsx`** — add `getAllProducts` fetch and pass products + me dict strings to MePageClient.

Add to the server component:
```tsx
import { getAllProducts } from "@/lib/db";
import type { Product } from "@/lib/types";

// In the page function, fetch products alongside existing data:
const [routinesData, allProductsRaw] = await Promise.all([
  Promise.resolve(), // routines are client-side
  getAllProducts(),
]);
const allProducts = allProductsRaw as Product[];
```

Pass to MePageClient:
```tsx
<MePageClient
  locale={locale}
  dict={{
    ...existingDict,
    savedProducts: dict.me.savedProducts,
    createRoutineFromSaved: dict.me.createRoutineFromSaved,
    noSavedProducts: dict.me.noSavedProducts,
  }}
  products={allProducts}
/>
```

**Step 3: Update `MePageClient.tsx`**

Add imports:
```tsx
import { getSavedProducts } from "@/lib/localSaved";
import type { Product } from "@/lib/types";
import ProductListItem from "@/components/home/ProductListItem";
import Link from "next/link";
```

Add `products: Product[]` to Props interface and `savedProducts`, `createRoutineFromSaved`, `noSavedProducts` to Dict interface.

Add saved products state inside the component:
```tsx
const [savedProductIds, setSavedProductIds] = useState<string[]>([]);

useEffect(() => {
  setRoutines(getRoutines());
  setSavedProductIds(getSavedProducts());
  setLoaded(true);

  const update = () => setSavedProductIds(getSavedProducts());
  window.addEventListener("kwip_saved_updated", update);
  return () => window.removeEventListener("kwip_saved_updated", update);
}, []);
```

Add saved products section before the routines list:
```tsx
const savedProducts = products.filter((p) => savedProductIds.includes(p.id));
const loc = locale as "vi" | "en";
```

In the JSX, add a saved products section above routines:
```tsx
{/* Saved products section */}
{savedProducts.length > 0 && (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[17px] font-semibold text-neutral-900">
        {dict.savedProducts} ({savedProducts.length})
      </h2>
      <Link
        href={`/${locale}/routine/new`}
        className="text-[13px] font-medium text-neutral-500"
      >
        {dict.createRoutineFromSaved}
      </Link>
    </div>
    <div className="space-y-2">
      {savedProducts.map((product) => (
        <ProductListItem
          key={product.id}
          slug={product.slug}
          name={product.name[loc] || product.name.vi}
          brand={product.brand}
          category={product.category}
          image={product.image}
          locale={locale}
        />
      ))}
    </div>
  </div>
)}
```

**Step 4: Verify build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```
Fix any TypeScript errors.

**Step 5: Commit**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add -A
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "feat: Me page — saved products section with create routine CTA"
```

---

## Task 10: Final build + smoke test

**Step 1: Full build**

```bash
npm run build --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```
Expected: `✓ Compiled successfully`, no TypeScript errors.

**Step 2: Smoke test checklist**

Start dev server:
```bash
npm run dev --prefix /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list
```

Open `http://localhost:3001/vi` (or whatever port) and verify:

- [ ] Home loads immediately with full product list (no empty state)
- [ ] Concern chips [Tất cả][Mụn][Khô da]... scroll horizontally
- [ ] Category chips [Tất cả][Toner][Serum]... scroll horizontally
- [ ] Selecting a concern filters products and shows ingredient reason in emerald
- [ ] Selecting a category filters further (intersection)
- [ ] Result count updates live
- [ ] Bookmark icon visible on each product row
- [ ] Tap bookmark → icon fills
- [ ] First ever bookmark → toast appears at bottom
- [ ] Me tab badge shows saved count
- [ ] Product detail page → bookmark icon in header right
- [ ] Me page → saved products section appears

**Step 3: Commit any final tweaks**

```bash
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list add -A
git -C /Users/seongyeonhwang/Projects/Kwip/.worktrees/vertical-list commit -m "fix: final polish for home discovery + bookmark"
```
