# Routine Builder Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the routine builder to show only saved/selected products in a focused list, with an inline "Add more products" browser below — and fix the language toggle and back-button bugs.

**Architecture:** `RoutineBuilderClient` splits into two sections: (1) a selected-products list grouped by routine step with step-label headers, and (2) a collapsible inline browser with concern chips + step filter + full unselected product catalog. The builder page (`/routine/new`) passes `headerRight={<></>}` to suppress the language switcher, and its back link points to `/${locale}/me`.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind CSS, localStorage via `getSavedProducts`

---

### Task 1: Add dictionary strings

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Add `addMoreProducts` and `backToMe` to vi.json**

In `src/dictionaries/vi.json`, inside the `"routine"` object, add after `"backToHome"`:

```json
"backToMe": "Của tôi",
"addMoreProducts": "Thêm sản phẩm",
```

**Step 2: Add the same keys to en.json**

In `src/dictionaries/en.json`, inside the `"routine"` object, add after `"backToHome"`:

```json
"backToMe": "Me",
"addMoreProducts": "Add more products",
```

**Step 3: Verify build compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (zero errors)

---

### Task 2: Fix page.tsx — back button and language toggle

**Files:**
- Modify: `src/app/[locale]/routine/new/page.tsx`

**Step 1: Fix the headerLeft back link**

Change `href={`/${locale}`}` → `href={`/${locale}/me`}` and change the label from `dict.routine.backToHome` → `dict.routine.backToMe`:

```tsx
headerLeft={
  <Link
    href={`/${locale}/me`}
    className="flex items-center gap-1 text-neutral-900 -ml-1 px-1 min-h-[44px] min-w-[44px]"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
    <span className="text-[15px] font-medium">{dict.routine.backToMe}</span>
  </Link>
}
```

**Step 2: Suppress the language switcher**

Add `headerRight={<></>}` to the `MobileShell` props. MobileShell uses `headerRight ?? <LanguageSwitcher />` — passing an empty fragment (truthy) prevents the fallback from rendering:

```tsx
<MobileShell
  locale={locale}
  headerLeft={...}
  headerRight={<></>}
>
```

**Step 3: Add `addMoreProducts` to the dict passed into RoutineBuilderClient**

```tsx
dict={{
  namePlaceholder: dict.routine.namePlaceholder,
  saveButton: dict.routine.saveButton,
  saving: dict.routine.saving,
  allItems: dict.home.allItems,
  emptyState: dict.products.emptyState,
  addMoreProducts: dict.routine.addMoreProducts,
}}
```

**Step 4: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

---

### Task 3: Rewrite RoutineBuilderClient

**Files:**
- Modify: `src/components/routine/RoutineBuilderClient.tsx`

This is a full replacement of the component's logic and JSX. Replace the entire file with the following:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product, Category, Concern } from "@/lib/types";
import type { RoutineProduct } from "@/lib/types";
import { saveRoutine } from "@/lib/localRoutines";
import { getSavedProducts } from "@/lib/localSaved";
import { getBrandName } from "@/lib/brands";
import type { Brand } from "@/lib/types";
import { Button } from "@/components/ui";

const ROUTINE_STEPS: { category: Category; step: number; label: Record<string, string> }[] = [
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

interface ConcernOption {
  id: Concern | "all";
  label: string;
}

interface RoutineBuilderClientProps {
  locale: string;
  concern: string;
  concerns: ConcernOption[];
  products: Product[];
  initialSelectedIds?: string[];
  dict: {
    namePlaceholder: string;
    saveButton: string;
    saving: string;
    allItems: string;
    emptyState: string;
    addMoreProducts: string;
  };
}

export default function RoutineBuilderClient({
  locale,
  concern,
  concerns,
  products,
  initialSelectedIds,
  dict,
}: RoutineBuilderClientProps) {
  const router = useRouter();
  const loc = locale as "vi" | "en";

  const [routineName, setRoutineName] = useState("");
  const [selectedByCategory, setSelectedByCategory] = useState<Record<string, string[]>>(() => {
    const byCategory: Record<string, string[]> = {};
    if (initialSelectedIds) {
      for (const id of initialSelectedIds) {
        const product = products.find((p) => p.id === id);
        if (product) {
          if (!byCategory[product.category]) byCategory[product.category] = [];
          byCategory[product.category].push(id);
        }
      }
    }
    return byCategory;
  });
  const [showBrowser, setShowBrowser] = useState(false);
  const [filterConcern, setFilterConcern] = useState<Concern | "all">(
    concern && concern !== "" ? (concern as Concern) : "all"
  );
  const [filterStep, setFilterStep] = useState<Category | "all">("all");
  const [saving, setSaving] = useState(false);

  // Auto-preselect saved products when not pre-seeded from URL
  useEffect(() => {
    if (initialSelectedIds) return;
    const savedIds = getSavedProducts();
    if (savedIds.length === 0) return;
    const byCategory: Record<string, string[]> = {};
    for (const id of savedIds) {
      const product = products.find((p) => p.id === id);
      if (product) {
        if (!byCategory[product.category]) byCategory[product.category] = [];
        byCategory[product.category].push(id);
      }
    }
    setSelectedByCategory(byCategory);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleProduct(category: Category, productId: string) {
    setSelectedByCategory((prev) => {
      const current = prev[category] ?? [];
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      return { ...prev, [category]: next };
    });
  }

  const totalSelected = Object.values(selectedByCategory).flat().length;
  const allSelectedIds = Object.values(selectedByCategory).flat();

  function handleSave() {
    if (!routineName.trim() || totalSelected === 0) return;
    setSaving(true);
    const routineProducts: RoutineProduct[] = ROUTINE_STEPS.flatMap((step) =>
      (selectedByCategory[step.category] ?? []).map((productId) => ({
        productId,
        category: step.category,
        step: step.step,
      }))
    );
    saveRoutine({ name: routineName.trim(), concern, products: routineProducts });
    router.push(`/${locale}/me`);
  }

  // Steps with selected products (in routine order)
  const selectedSteps = ROUTINE_STEPS.filter(
    (step) => (selectedByCategory[step.category] ?? []).length > 0
  );

  // Browser: products NOT selected, filtered by concern + step
  function getBrowserProducts(category: Category): Product[] {
    return products.filter((p) => {
      if (p.category !== category) return false;
      if (allSelectedIds.includes(p.id)) return false;
      if (filterConcern !== "all" && !p.concerns.includes(filterConcern)) return false;
      return true;
    });
  }

  const concernOptions: ConcernOption[] = [
    { id: "all", label: dict.allItems },
    ...concerns,
  ];

  const browserAvailableSteps = ROUTINE_STEPS.filter(
    (step) => getBrowserProducts(step.category).length > 0
  );
  const stepOptions = [
    { category: "all" as const, label: dict.allItems },
    ...browserAvailableSteps.map((step) => ({
      category: step.category,
      label: step.label[loc] ?? step.label.vi,
    })),
  ];

  const browserSteps = ROUTINE_STEPS.filter((step) => {
    if (filterStep !== "all" && filterStep !== step.category) return false;
    return getBrowserProducts(step.category).length > 0;
  });

  const browserProducts = browserSteps.flatMap((step) =>
    getBrowserProducts(step.category).map((product) => ({ product }))
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Name input */}
      <div className="px-4 pt-4 pb-3">
        <input
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder={dict.namePlaceholder}
          className="w-full min-h-[44px] rounded-xl bg-neutral-100 px-4 py-3 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-900/10 transition-colors"
        />
      </div>

      {/* Selected products — grouped by routine step */}
      <div className="pb-2">
        {selectedSteps.length === 0 ? (
          <p className="text-[15px] text-neutral-400 text-center py-10">
            {dict.emptyState}
          </p>
        ) : (
          selectedSteps.map((step) => {
            const selectedIds = selectedByCategory[step.category] ?? [];
            const stepProducts = products.filter((p) => selectedIds.includes(p.id));
            return (
              <div key={step.category}>
                <p className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  {step.label[loc] ?? step.label.vi}
                </p>
                <div className="divide-y divide-neutral-100">
                  {stepProducts.map((product) => {
                    const name = product.name[loc] || product.name.vi;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product.category, product.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left transition-colors active:bg-neutral-50"
                      >
                        <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                          <Image
                            src={product.image}
                            alt={name}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-neutral-900 line-clamp-2 leading-snug">
                            {name}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {getBrandName(product.brand as Brand)}
                          </p>
                        </div>
                        {/* Always checked — tap to remove */}
                        <div className="shrink-0 w-6 h-6 rounded-full border-2 border-neutral-900 bg-neutral-900 flex items-center justify-center">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add more products — collapsible inline browser */}
      <div className="border-t border-neutral-100">
        <button
          type="button"
          onClick={() => setShowBrowser((v) => !v)}
          className="w-full flex items-center justify-between px-4 min-h-[44px] py-3 text-left transition-colors active:bg-neutral-50"
        >
          <span className="text-[15px] font-medium text-neutral-900">
            {dict.addMoreProducts}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-neutral-400 transition-transform duration-200 ${
              showBrowser ? "rotate-180" : ""
            }`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {showBrowser && (
          <div>
            {/* Concern chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2 border-t border-neutral-100">
              {concernOptions.map((option) => {
                const active = filterConcern === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setFilterConcern(option.id as Concern | "all");
                      setFilterStep("all");
                    }}
                    className={`shrink-0 h-8 px-4 text-[13px] font-medium rounded-full whitespace-nowrap transition-colors ${
                      active
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Step filter */}
            <div className="flex overflow-x-auto no-scrollbar py-1 border-b border-neutral-100">
              {stepOptions.map((option) => {
                const active = filterStep === option.category;
                return (
                  <button
                    key={option.category}
                    type="button"
                    onClick={() =>
                      setFilterStep(option.category as Category | "all")
                    }
                    className={`shrink-0 px-3 h-7 text-xs whitespace-nowrap transition-all ${
                      active
                        ? "font-semibold text-neutral-900"
                        : "font-normal text-neutral-400"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Browser product list */}
            {browserProducts.length === 0 ? (
              <p className="text-[15px] text-neutral-400 text-center py-10">
                {dict.emptyState}
              </p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {browserProducts.map(({ product }) => {
                  const name = product.name[loc] || product.name.vi;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.category, product.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left transition-colors active:bg-neutral-50"
                    >
                      <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                        <Image
                          src={product.image}
                          alt={name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-neutral-900 line-clamp-2 leading-snug">
                          {name}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {getBrandName(product.brand as Brand)}
                        </p>
                      </div>
                      {/* Unchecked — tap to add */}
                      <div className="shrink-0 w-6 h-6 rounded-full border-2 border-neutral-200" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom padding for fixed action bar */}
      <div className="pb-32" />

      {/* Fixed action bar */}
      <div
        className="fixed left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-neutral-100 px-4 pt-3"
        style={{
          bottom: "calc(49px + env(safe-area-inset-bottom))",
          paddingBottom: "12px",
        }}
      >
        <Button
          fullWidth
          size="lg"
          onClick={handleSave}
          disabled={saving || totalSelected === 0 || !routineName.trim()}
        >
          {saving ? dict.saving : `${dict.saveButton} (${totalSelected})`}
        </Button>
      </div>
    </div>
  );
}
```

**Step 1: Replace the file**

Write the full component above to `src/components/routine/RoutineBuilderClient.tsx`.

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

---

### Task 4: Build verify + commit

**Step 1: Run production build**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` (ignore pre-existing `products/[slug]` PageNotFoundError — it is unrelated to this change)

**Step 2: Commit**

```bash
git add -u
git commit -m "feat: routine builder redesign — selected-only view + inline add-more browser

- Show only saved/selected products grouped by step label (Cleanse, Serum, etc.)
- Remove top filter tabs; add collapsible 'Add more products' section at bottom
- Add more section: concern pill chips + step filter + full unselected product list
- Selected products always show checked; tap to deselect and remove from list
- Adding from browser moves product to selected list; removing returns it to browser
- Fix: suppress language toggle on builder page (headerRight empty fragment)
- Fix: back button now links to Me page instead of Home
- Add backToMe + addMoreProducts dictionary keys (vi + en)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Step 3: Push**

```bash
git push origin main
```
