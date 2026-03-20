# Me Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Me page and bottom nav tab to clarify the core user journey — saved products → build routine — and rename the tab from "Me" to "Routine."

**Architecture:** MePageClient.tsx handles all rendering logic for both states (saves only vs. saves + routines). RoutineCard.tsx gets enriched with a product image preview strip. BottomTabBar.tsx gets a new icon and label. All string changes go through dictionaries.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, localStorage (via src/store/)

---

## Context

### Current state
- Bottom nav tab: "Me" / "Của tôi" with a document/list icon
- Me page: two sections (saved products list, my routines list) with no clear hierarchy
- Saved products: full list with concern pills
- RoutineCard: name + concern·count + two buttons (View, Delete) side by side
- Build routine CTA: small link at top-right of saved section — easy to miss

### Target state
- Bottom nav tab: "Routine" in both locales, new person+check icon
- Page label: "Your routine" / "Routine của bạn" (overline style, neutral-400)
- Saved section: full vertical list (thumbnail + name + brand), no concern pills
- Build Routine CTA: full-width dark button directly below the saved list
- Routines section: enriched cards with product image strip + overflow menu (delete moved off main card)
- Two states adapt layout:
  - **State 1** (saves only): saved list → Build Routine CTA → muted empty routines state
  - **State 2** (saves + routines): same structure, routines section fully populated

### Key constraint
- Routine type only stores `productId` — not product image/name
- MePageClient receives `products: Product[]` from server — image lookup is `products.find(p => p.id === rp.productId)`
- No auth, all data is localStorage

---

## Task 1: Update dictionaries

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Update vi.json nav label and Me page strings**

In `src/dictionaries/vi.json`, find the `nav` object and `me` object. Make these changes:

```json
"nav": {
  "explore": "Khám phá",
  "routine": "Routine"
},
"me": {
  "pageLabel": "Routine của bạn",
  "savedProducts": "Đã lưu",
  "buildRoutine": "Xây routine từ sản phẩm đã lưu →",
  "noRoutinesTitle": "Chưa có routine nào",
  "noRoutinesBody": "Lưu sản phẩm và xây routine đầu tiên của bạn",
  "createRoutineFromSaved": "Tạo routine từ sản phẩm đã lưu",
  "noSavedProducts": "Chưa lưu sản phẩm nào"
}
```

Note: the nav key changes from `"me"` to `"routine"`. Check the full nav object and rename accordingly.

**Step 2: Update en.json**

```json
"nav": {
  "explore": "Explore",
  "routine": "Routine"
},
"me": {
  "pageLabel": "Your routine",
  "savedProducts": "Saved",
  "buildRoutine": "Build routine from saved →",
  "noRoutinesTitle": "No routines yet",
  "noRoutinesBody": "Save products and build your first routine above",
  "createRoutineFromSaved": "Create routine from saved",
  "noSavedProducts": "No saved products yet"
}
```

**Step 3: Run build to catch any dictionary reference errors**

```bash
npm run build
```

Expected: compiles successfully (dictionary changes alone won't break build).

**Step 4: Commit**

```bash
git add src/dictionaries/vi.json src/dictionaries/en.json
git commit -m "feat: update dictionaries for Me page redesign"
```

---

## Task 2: Update BottomTabBar — new icon and label key

**Files:**
- Modify: `src/components/layout/BottomTabBar.tsx`

### Context
BottomTabBar receives `navLabels: { explore: string; me: string }`. The `me` key is now `routine`. The icon changes from a document/list SVG to a person+checklist SVG.

**Step 1: Update the NavLabels interface**

Change:
```typescript
interface NavLabels {
  explore: string;
  me: string;
}
```

To:
```typescript
interface NavLabels {
  explore: string;
  routine: string;
}
```

**Step 2: Update the tabs array**

In the `tabs` array, the second tab currently uses `navLabels.me`. Change to `navLabels.routine`.

Also replace the icon SVG (the document/list rect icon) with a person+check icon:

```tsx
icon: (
  <div className="relative">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      <polyline points="14 14 16 16 20 12" />
    </svg>
    {savedCount > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
        {savedCount > 9 ? "9+" : savedCount}
      </span>
    )}
  </div>
),
```

**Step 3: Find where navLabels is passed to BottomTabBar**

Search for `navLabels` in `src/components/layout/MobileShell.tsx`. The shell reads from dictionary and passes nav labels. Update the key from `dict.nav.me` to `dict.nav.routine`.

**Step 4: Run build**

```bash
npm run build
```

Expected: builds successfully.

**Step 5: Commit**

```bash
git add src/components/layout/BottomTabBar.tsx src/components/layout/MobileShell.tsx
git commit -m "feat: rename Me tab to Routine, update icon"
```

---

## Task 3: Redesign RoutineCard

**Files:**
- Modify: `src/components/routine/RoutineCard.tsx`

### Context
RoutineCard currently receives `routine: Routine` which has `products: RoutineProduct[]` — only `productId`, `category`, `step`. The full product objects (with images) are available in MePageClient as `products: Product[]`. We need to pass a product lookup map or the resolved product images to RoutineCard.

### Design
```
┌─────────────────────────────┐
│  Acne routine               │  ← name, 17px semibold, neutral-900
│  Acne · 5 products          │  ← concern · count, 13px, neutral-500
│                             │
│  ○ ○ ○ ○ ○                 │  ← product image strip: 40×40, rounded-lg
│                             │    max 5 shown, overflow hidden
│  [View routine]    [···]    │  ← View: full-width secondary; ··· = overflow
└─────────────────────────────┘
```

**Step 1: Add productImages prop to RoutineCard**

```typescript
interface RoutineCardProps {
  routine: Routine;
  locale: string;
  concernLabel?: string;
  productImages: { id: string; image: string; name: string }[];  // ADD
  onDelete: (id: string) => void;
  dict: {
    deleteButton: string;
    productsCount: string;
    viewButton: string;
  };
}
```

**Step 2: Add overflow menu state and product image strip**

Replace the current card JSX with:

```tsx
export default function RoutineCard({
  routine, locale, concernLabel, productImages, onDelete, dict,
}: RoutineCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="py-4 border-b border-neutral-100 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-semibold text-neutral-900 truncate">
            {routine.name}
          </h3>
          <p className="text-[13px] text-neutral-500 mt-0.5">
            {concernLabel ?? routine.concern} · {routine.products.length} {dict.productsCount}
          </p>
        </div>
        {/* Overflow menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-[44px] h-[44px] flex items-center justify-center text-neutral-400 -mr-2"
            aria-label="More options"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-10 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 min-w-[140px]">
              <button
                onClick={() => { setMenuOpen(false); onDelete(routine.id); }}
                className="w-full text-left px-4 py-3 text-[15px] text-red-500 min-h-[44px] flex items-center"
              >
                {dict.deleteButton}
              </button>
            </div>
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

Note: add `import Image from "next/image"` and `import { useState } from "react"` if not present.

**Step 3: Run build**

```bash
npm run build
```

Expected: build succeeds (MePageClient will have a TypeScript error about missing `productImages` prop — fix in Task 4).

**Step 4: Commit**

```bash
git add src/components/routine/RoutineCard.tsx
git commit -m "feat: enrich RoutineCard with product image strip and overflow menu"
```

---

## Task 4: Redesign MePageClient

**Files:**
- Modify: `src/app/[locale]/me/MePageClient.tsx`
- Modify: `src/app/[locale]/me/page.tsx` (add new dict keys)

### Context
MePageClient receives `products: Product[]` (all products from DB) and knows saved product IDs from localStorage. Routines come from localStorage via `getRoutines()`.

### Layout target

**State 1 — saves exist, no routines:**
```
Your routine                    ← page label, 13px, neutral-400
── Saved (N) ─────────────────  ← section label, 15px semibold
[img] Product name              ← list row, 56px thumb
      Brand · step category
[img] Product name
      Brand
[Build routine from saved →]    ← full-width dark CTA
── My Routines ────────────────
No routines yet.                ← 15px, neutral-500
Save products above to start.
```

**State 2 — saves + routines:**
```
Your routine
── Saved (N) ─────────────────
[img] Product name
[img] Product name
[Build routine from saved →]
── My Routines (N) ───────────
[RoutineCard]
[RoutineCard]
```

**State 3 — nothing saved, nothing built (empty):**
Keep existing EmptyState centered component.

**Step 1: Update the Dict interface**

Add `pageLabel`, `buildRoutine`, `noRoutinesTitle`, `noRoutinesBody` fields:

```typescript
interface Dict {
  pageLabel: string;
  myRoutines: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  viewButton: string;
  deleteButton: string;
  productsCount: string;
  backToHome: string;
  savedProducts: string;
  buildRoutine: string;
  noRoutinesTitle: string;
  noRoutinesBody: string;
  createRoutineFromSaved: string;
  noSavedProducts: string;
}
```

**Step 2: Build a product image lookup from routine products**

Inside the component, create a helper to get product images for a given routine:

```typescript
const productMap = new Map(products.map((p) => [p.id, p]));

function getRoutineProductImages(routine: Routine) {
  return routine.products
    .map((rp) => {
      const p = productMap.get(rp.productId);
      if (!p) return null;
      const loc = locale as "vi" | "en";
      return { id: p.id, image: p.image, name: p.name[loc] || p.name.vi };
    })
    .filter(Boolean) as { id: string; image: string; name: string }[];
}
```

**Step 3: Replace the JSX return**

Remove the current conditional render tree. Replace with:

```tsx
// Empty state — nothing at all
if (savedProducts.length === 0 && routines.length === 0) {
  return (
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
  );
}

return (
  <div className="min-h-screen bg-white">
    <div className="max-w-2xl mx-auto w-full px-4 pt-4 pb-8">

      {/* Page label */}
      <p className="text-[13px] text-neutral-400 mb-5">{dict.pageLabel}</p>

      {/* Saved section */}
      {savedProducts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[15px] font-semibold text-neutral-900 mb-3">
            {dict.savedProducts} ({savedProducts.length})
          </h2>
          <div className="divide-y divide-neutral-100">
            {savedProducts.map((product) => {
              const loc = locale as "vi" | "en";
              return (
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
              );
            })}
          </div>

          {/* Build Routine CTA */}
          <Link
            href={`/${locale}/routine/new?saved=${savedProductIds.join(",")}`}
            className="mt-4 flex items-center justify-center w-full h-[52px] rounded-2xl bg-neutral-900 text-white text-[17px] font-semibold"
          >
            {dict.buildRoutine}
          </Link>
        </div>
      )}

      {/* My Routines section */}
      <div>
        <h2 className="text-[15px] font-semibold text-neutral-900 mb-3">
          {dict.myRoutines}{routines.length > 0 ? ` (${routines.length})` : ""}
        </h2>
        {routines.length === 0 ? (
          <div className="py-6">
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
                dict={{
                  viewButton: dict.viewButton,
                  deleteButton: dict.deleteButton,
                  productsCount: dict.productsCount,
                }}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  </div>
);
```

**Step 4: Update page.tsx to pass new dict keys**

In `src/app/[locale]/me/page.tsx`, add the new keys to the dict object passed to MePageClient:

```typescript
dict={{
  pageLabel: dict.me.pageLabel,
  myRoutines: dict.routine.myRoutines,
  emptyTitle: dict.routine.emptyTitle,
  emptyBody: dict.routine.emptyBody,
  emptyAction: dict.routine.emptyAction,
  viewButton: dict.routine.viewButton,
  deleteButton: dict.routine.deleteButton,
  productsCount: dict.routine.productsCount,
  backToHome: dict.routine.backToHome,
  savedProducts: dict.me.savedProducts,
  buildRoutine: dict.me.buildRoutine,
  noRoutinesTitle: dict.me.noRoutinesTitle,
  noRoutinesBody: dict.me.noRoutinesBody,
  createRoutineFromSaved: dict.me.createRoutineFromSaved,
  noSavedProducts: dict.me.noSavedProducts,
}}
```

**Step 5: Run build**

```bash
npm run build
```

Expected: 603 static pages, no errors.

**Step 6: Commit**

```bash
git add src/app/[locale]/me/MePageClient.tsx src/app/[locale]/me/page.tsx
git commit -m "feat: redesign Me page — saves-first layout, build routine CTA"
```

---

## Task 5: Final verification

**Step 1: Run full build**

```bash
npm run build
```

Expected: ✓ Compiled successfully, ✓ Generating static pages (603/603)

**Step 2: Check no stale "me" nav references**

```bash
grep -r "navLabels\.me\|nav\.me\|\"me\":" src/components/layout/ src/app/ --include="*.tsx" --include="*.ts"
```

Expected: no matches (all replaced with `routine`).

**Step 3: Commit automation change**

```bash
git add .github/workflows/product-discovery.yml
git commit -m "chore: disable nightly pipeline schedule — manual trigger only"
```

**Step 4: Final commit if any loose changes**

```bash
git status
```

If clean, done. If any modified files: stage and commit with appropriate message.
