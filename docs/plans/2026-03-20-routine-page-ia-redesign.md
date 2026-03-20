# Routine Page IA Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Routine tab into a clean segmented control (Saved | Routines) with a fully redesigned routine detail screen (category overlines, inline rename, no footer cruft).

**Architecture:** The `/me` page gains a segmented control — Saved shows the saved product list + Build CTA, Routines shows RoutineCards with rename support. Routine detail replaces raw step integers with category overlines and enables inline rename via a new `renameRoutine` store function. The routine builder redirects to `/me?tab=routines` after saving.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, localStorage via `src/store/localRoutines.ts`

---

## Design Reference

Before implementing, read:
- `docs/design/design-system.md` — type scale, colors, surface patterns
- `docs/design/hig-mobile-first.md` — HIG segmented control, overline patterns

### Segmented Control Pattern (iOS HIG)
```
bg-neutral-100 rounded-xl p-1 container
  active segment: bg-white rounded-lg shadow-sm
  inactive segment: text-neutral-500
  both: text-[15px] font-semibold, min-h-[36px], flex-1
```

### Category Overline Pattern (Kwip design system)
```
text-[11px] font-semibold uppercase tracking-wide text-neutral-400
shown above each product row in the list
```

---

## Task 1: Add `renameRoutine` to localRoutines store

**Files:**
- Modify: `src/store/localRoutines.ts`

**Step 1: Add the function after `deleteRoutine`**

```typescript
export function renameRoutine(id: string, name: string): void {
  save(load().map((r) => (r.id === id ? { ...r, name } : r)));
}
```

**Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```
Expected: no TypeScript errors on this file.

**Step 3: Commit**

```bash
git add src/store/localRoutines.ts
git commit -m "feat: add renameRoutine to localRoutines store"
```

---

## Task 2: Dictionary updates (vi + en)

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

Add these new keys to the `"me"` block in both files.

**Step 1: Update `src/dictionaries/vi.json`**

In the `"me"` block, add after `"noRoutinesBody"`:
```json
"tabSaved": "Đã lưu",
"tabRoutines": "Routine",
"rename": "Đổi tên",
"renameCancel": "Huỷ"
```

**Step 2: Update `src/dictionaries/en.json`**

In the `"me"` block, add after `"noRoutinesBody"`:
```json
"tabSaved": "Saved",
"tabRoutines": "Routines",
"rename": "Rename",
"renameCancel": "Cancel"
```

**Step 3: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```
Expected: no errors.

**Step 4: Commit**

```bash
git add src/dictionaries/vi.json src/dictionaries/en.json
git commit -m "feat: add rename + tab labels to me dictionary"
```

---

## Task 3: Redesign MePageClient with segmented control

**Files:**
- Modify: `src/app/[locale]/me/MePageClient.tsx`
- Modify: `src/app/[locale]/me/page.tsx`

### 3a: Update the `Dict` interface and page.tsx

In `src/app/[locale]/me/page.tsx`, add the 4 new dict keys to the `dict` prop:

```tsx
tabSaved: dict.me.tabSaved,
tabRoutines: dict.me.tabRoutines,
rename: dict.me.rename,
renameCancel: dict.me.renameCancel,
```

Add to the `Dict` interface in `MePageClient.tsx`:
```typescript
tabSaved: string;
tabRoutines: string;
rename: string;
renameCancel: string;
```

### 3b: Full MePageClient.tsx rewrite

Replace the entire file content with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Routine, Product } from "@/types";
import { getRoutines, deleteRoutine, renameRoutine } from "@/store/localRoutines";
import { getSavedProducts } from "@/store/localSaved";
import Image from "next/image";
import RoutineCard from "@/components/routine/RoutineCard";
import { EmptyState } from "@/components/ui";
import { getBrandName } from "@/lib/brands";

interface Dict {
  myRoutines: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  viewButton: string;
  deleteButton: string;
  productsCount: string;
  backToHome: string;
  savedProducts: string;
  createRoutineFromSaved: string;
  noSavedProducts: string;
  pageLabel: string;
  buildRoutine: string;
  noRoutinesTitle: string;
  noRoutinesBody: string;
  tabSaved: string;
  tabRoutines: string;
  rename: string;
  renameCancel: string;
}

interface Props {
  locale: string;
  products: Product[];
  concernLabels: Record<string, string>;
  dict: Dict;
}

export default function MePageClient({ locale, products, concernLabels, dict }: Props) {
  const searchParams = useSearchParams();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"saved" | "routines">("saved");

  useEffect(() => {
    const routineList = getRoutines();
    const saved = getSavedProducts();
    setRoutines(routineList);
    setSavedProductIds(saved);
    setLoaded(true);

    // Auto-switch to routines tab if URL param set (e.g., after builder redirect)
    if (searchParams.get("tab") === "routines") {
      setTab("routines");
    } else if (saved.length === 0 && routineList.length > 0) {
      // Nothing saved but has routines — default to routines tab
      setTab("routines");
    }

    const update = () => setSavedProductIds(getSavedProducts());
    window.addEventListener("kwip_saved_updated", update);
    return () => window.removeEventListener("kwip_saved_updated", update);
  }, [searchParams]);

  function handleDelete(id: string) {
    deleteRoutine(id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }

  function handleRename(id: string, name: string) {
    renameRoutine(id, name);
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[17px] text-neutral-400">...</div>
      </div>
    );
  }

  const loc = locale as "vi" | "en";
  const savedProducts = products.filter((p) => savedProductIds.includes(p.id));
  const productMap = new Map(products.map((p) => [p.id, p]));

  function getRoutineProductImages(routine: Routine) {
    return routine.products
      .map((rp) => {
        const p = productMap.get(rp.productId);
        if (!p) return null;
        return { id: p.id, image: p.image, name: p.name[loc] || p.name.vi };
      })
      .filter((x): x is { id: string; image: string; name: string } => x !== null);
  }

  // State A — nothing at all
  if (routines.length === 0 && savedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: "calc(100dvh - 56px - 49px)" }}>
          <div className="-mt-16">
            <EmptyState
              icon="🌿"
              title={dict.emptyTitle}
              body={dict.emptyBody}
              actionLabel={dict.emptyAction}
              actionHref={`/${locale}`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 pt-4 pb-8">

        {/* Segmented control */}
        <div className="flex bg-neutral-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("saved")}
            className={`flex-1 rounded-lg text-[15px] font-semibold py-2 transition-all min-h-[36px] ${
              tab === "saved"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            {dict.tabSaved}
            {savedProducts.length > 0 && (
              <span className="ml-1.5 text-[13px] font-normal text-neutral-400">
                {savedProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("routines")}
            className={`flex-1 rounded-lg text-[15px] font-semibold py-2 transition-all min-h-[36px] ${
              tab === "routines"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            {dict.tabRoutines}
            {routines.length > 0 && (
              <span className="ml-1.5 text-[13px] font-normal text-neutral-400">
                {routines.length}
              </span>
            )}
          </button>
        </div>

        {/* Saved tab */}
        {tab === "saved" && (
          <div>
            {savedProducts.length === 0 ? (
              <p className="text-[15px] text-neutral-400 text-center py-8">
                {dict.noSavedProducts}
              </p>
            ) : (
              <>
                <div className="divide-y divide-neutral-100">
                  {savedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.slug}`}
                      className="flex items-center gap-3 py-3 min-h-[44px] active:bg-neutral-50 transition-colors"
                    >
                      <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                        <Image
                          src={product.image}
                          alt={product.name[loc] || product.name.vi}
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-neutral-900 line-clamp-1">
                          {product.name[loc] || product.name.vi}
                        </p>
                        <p className="text-[13px] text-neutral-400 mt-0.5">
                          {getBrandName(product.brand)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/${locale}/routine/new?saved=${savedProductIds.join(",")}`}
                  className="mt-4 flex items-center justify-center w-full h-[52px] rounded-2xl bg-neutral-900 text-white text-[17px] font-semibold"
                >
                  {dict.buildRoutine}
                </Link>
              </>
            )}
          </div>
        )}

        {/* Routines tab */}
        {tab === "routines" && (
          <div>
            {routines.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[15px] text-neutral-500">{dict.noRoutinesTitle}</p>
                <p className="text-[13px] text-neutral-400 mt-1">{dict.noRoutinesBody}</p>
              </div>
            ) : (
              <div>
                {routines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    locale={locale}
                    concernLabel={concernLabels[routine.concern]}
                    productImages={getRoutineProductImages(routine)}
                    onDelete={handleDelete}
                    onRename={handleRename}
                    dict={{
                      viewButton: dict.viewButton,
                      deleteButton: dict.deleteButton,
                      productsCount: dict.productsCount,
                      rename: dict.rename,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
```

**Step 1: Apply the changes above to both files**

**Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -30
```
Expected: no TypeScript errors.

**Step 3: Commit**

```bash
git add src/app/[locale]/me/MePageClient.tsx src/app/[locale]/me/page.tsx
git commit -m "feat: me page — segmented control (Saved | Routines)"
```

---

## Task 4: Add rename to RoutineCard

**Files:**
- Modify: `src/components/routine/RoutineCard.tsx`

**Step 1: Add `onRename` prop and inline rename state**

Replace the entire file with:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Routine } from "@/types";
import { buttonVariants } from "@/components/ui";

interface ProductPreview {
  id: string;
  image: string;
  name: string;
}

interface RoutineCardProps {
  routine: Routine;
  locale: string;
  concernLabel?: string;
  productImages: ProductPreview[];
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  dict: {
    deleteButton: string;
    productsCount: string;
    viewButton: string;
    rename: string;
  };
}

export default function RoutineCard({
  routine,
  locale,
  concernLabel,
  productImages,
  onDelete,
  onRename,
  dict,
}: RoutineCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(routine.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  function commitRename() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== routine.name) {
      onRename(routine.id, trimmed);
    } else {
      setDraftName(routine.name);
    }
    setRenaming(false);
  }

  return (
    <div className="py-4 border-b border-neutral-100 last:border-b-0">
      {/* Header row: name + overflow menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {renaming ? (
            <input
              ref={inputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") { setDraftName(routine.name); setRenaming(false); }
              }}
              className="w-full text-[17px] font-semibold text-neutral-900 bg-transparent border-b-2 border-neutral-900 outline-none pb-0.5"
              maxLength={60}
            />
          ) : (
            <h3 className="text-[17px] font-semibold text-neutral-900 truncate">
              {routine.name}
            </h3>
          )}
          <p className="text-[13px] text-neutral-500 mt-0.5">
            {concernLabel ?? routine.concern} · {routine.products.length} {dict.productsCount}
          </p>
        </div>

        {/* Overflow menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-[44px] h-[44px] flex items-center justify-center text-neutral-400 -mr-2 -mt-1"
            aria-label="More options"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-10 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setDraftName(routine.name);
                    setRenaming(true);
                  }}
                  className="w-full text-left px-4 py-3 text-[15px] text-neutral-900 min-h-[44px] flex items-center"
                >
                  {dict.rename}
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(routine.id);
                  }}
                  className="w-full text-left px-4 py-3 text-[15px] text-red-500 min-h-[44px] flex items-center"
                >
                  {dict.deleteButton}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product image strip */}
      {productImages.length > 0 && (
        <div className="flex gap-2 mt-3">
          {productImages.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0"
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="object-contain p-0.5"
                sizes="40px"
              />
            </div>
          ))}
        </div>
      )}

      {/* View button */}
      <Link
        href={`/${locale}/routine/${routine.id}`}
        className={buttonVariants({ variant: "secondary", fullWidth: true }) + " mt-3"}
      >
        {dict.viewButton}
      </Link>
    </div>
  );
}
```

**Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -30
```
Expected: no TypeScript errors.

**Step 3: Commit**

```bash
git add src/components/routine/RoutineCard.tsx
git commit -m "feat: RoutineCard — rename inline + overflow menu"
```

---

## Task 5: Redesign RoutineDetailClient

**Files:**
- Modify: `src/app/[locale]/routine/[id]/RoutineDetailClient.tsx`
- Modify: `src/app/[locale]/routine/[id]/page.tsx`

### What changes:
1. Remove `shareCardTagline` + `kwip.app` footer text
2. Replace raw `{rp.step}` integer with category overline (CLEANSER, TONER, etc.)
3. Add inline rename: tap routine name → `<input>`, blur/Enter → save
4. Remove `shareCardTagline` from `Dict` interface, add `categories` + `rename`

### 5a: Update `page.tsx`

Replace the `dict` prop passed to `RoutineDetailClient`:
```tsx
dict={{
  shareButton: dict.routine.shareButton,
  sharing: dict.routine.sharing,
  categories: dict.detail.categories,
  rename: dict.me.rename,
}}
```

Note: `dict.me.rename` requires `me.rename` to exist (added in Task 2).

### 5b: Full RoutineDetailClient.tsx rewrite

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRoutineById, renameRoutine } from "@/store/localRoutines";
import type { Product } from "@/types";
import type { Routine, RoutineProduct } from "@/types";
import ShareButton from "@/components/routine/ShareButton";
import { getBrandName } from "@/lib/brands";
import type { Brand } from "@/types";

interface Dict {
  shareButton: string;
  sharing: string;
  categories: Record<string, string>;
  rename: string;
}

interface Props {
  locale: string;
  id: string;
  dict: Dict;
  products: Product[];
  concernLabels: Record<string, string>;
}

export default function RoutineDetailClient({ locale, id, dict, products, concernLabels }: Props) {
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const loc = locale as "vi" | "en";

  useEffect(() => {
    const found = getRoutineById(id);
    if (!found) {
      router.replace(`/${locale}/me`);
      return;
    }
    setRoutine(found);
    setDraftName(found.name);
    setLoaded(true);
  }, [id, locale, router]);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  function commitRename() {
    if (!routine) return;
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== routine.name) {
      renameRoutine(routine.id, trimmed);
      setRoutine((prev) => prev ? { ...prev, name: trimmed } : prev);
    } else {
      setDraftName(routine.name);
    }
    setRenaming(false);
  }

  if (!loaded || !routine) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[13px] text-neutral-400">...</div>
      </div>
    );
  }

  const routineProducts = (routine.products as RoutineProduct[])
    .sort((a, b) => a.step - b.step)
    .map((rp) => ({
      ...rp,
      product: products.find((p) => p.id === rp.productId),
    }))
    .filter((rp): rp is typeof rp & { product: Product } => !!rp.product);

  const shareDict = {
    shareButton: dict.shareButton,
    sharing: dict.sharing,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">

        {/* Routine name — tappable to rename */}
        <div className="mb-1">
          {renaming ? (
            <input
              ref={inputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setDraftName(routine.name);
                  setRenaming(false);
                }
              }}
              className="w-full text-[22px] font-bold text-neutral-900 bg-transparent border-b-2 border-neutral-900 outline-none pb-0.5"
              maxLength={60}
            />
          ) : (
            <button
              onClick={() => { setDraftName(routine.name); setRenaming(true); }}
              className="text-[22px] font-bold text-neutral-900 text-left w-full"
            >
              {routine.name}
            </button>
          )}
        </div>
        <p className="text-[15px] text-neutral-500 mb-5">
          {concernLabels[routine.concern] ?? routine.concern}
        </p>

        <div className="mb-6">
          <ShareButton routine={routine} dict={shareDict} />
        </div>

        {/* Product list with category overlines */}
        <div>
          {routineProducts.map((rp) => (
            <div key={rp.productId}>
              {/* Category overline */}
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mt-4 mb-1 first:mt-0">
                {dict.categories[rp.category] ?? rp.category}
              </p>
              <Link
                href={`/${locale}/products/${rp.product.slug}`}
                className="flex items-center gap-3 py-2 min-h-[44px] active:bg-neutral-50 transition-colors rounded-lg"
              >
                <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                  <Image
                    src={rp.product.image}
                    alt={rp.product.name[loc] ?? rp.product.name.vi}
                    fill
                    className="object-contain p-1"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-neutral-900 line-clamp-2 leading-snug">
                    {rp.product.name[loc] ?? rp.product.name.vi}
                  </p>
                  <p className="text-[13px] text-neutral-400 mt-0.5">
                    {getBrandName(rp.product.brand as Brand)}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
```

**Step 1: Apply changes to both files**

**Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -30
```
Expected: no TypeScript errors.

**Step 3: Commit**

```bash
git add src/app/[locale]/routine/[id]/RoutineDetailClient.tsx src/app/[locale]/routine/[id]/page.tsx
git commit -m "feat: routine detail — category overlines, inline rename, remove footer"
```

---

## Task 6: Redirect builder to /me?tab=routines after save

**Files:**
- Modify: `src/components/routine/RoutineBuilderClient.tsx`

**Step 1: Find the redirect line**

In `src/components/routine/RoutineBuilderClient.tsx`, find (around line 106):
```typescript
router.push(`/${locale}/me`);
```

Replace with:
```typescript
router.push(`/${locale}/me?tab=routines`);
```

**Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```
Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/routine/RoutineBuilderClient.tsx
git commit -m "fix: redirect to /me?tab=routines after routine save"
```

---

## Task 7: Final build + smoke test

**Step 1: Full production build**

```bash
npm run build
```
Expected: Build completes with 0 errors.

**Step 2: Manual smoke test checklist**

Start dev server:
```bash
npm run dev
```

Open `http://localhost:3000/vi/me` and verify:
- [ ] Segmented control renders (Saved | Routines with counts)
- [ ] Saved tab: shows saved product list, Build Routine CTA at bottom
- [ ] Routines tab: RoutineCards render with thumbnail strips
- [ ] RoutineCard overflow menu: Rename + Delete options
- [ ] Rename inline: tap Rename → input appears, blur commits, Escape cancels
- [ ] After building a routine (`/vi/routine/new?saved=...`) → redirects to `/vi/me?tab=routines`
- [ ] Routine detail: category overlines (e.g., "CLEANSER", "TONER") shown above each product
- [ ] Routine detail: tap name → inline input → saves rename → back button shows updated name
- [ ] Routine detail: no `shareCardTagline` or `kwip.app` footer text
- [ ] Empty state (0 saved + 0 routines): EmptyState component renders
- [ ] All touch targets ≥ 44px

**Step 3: Final commit if any fixes made**

```bash
git add -p
git commit -m "fix: post-smoke-test corrections"
```
