# Home Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the concern-selector home page with concern filter tabs + 2-column product card grid. Preserves the concern-first flow from the original spec while adding visual product browsing. Update products page to use the same card grid style.

**Architecture:** Shared `ProductCard` component used by both home and products pages. Home shows concern-filtered products sorted by popularity. Products page is the same layout (deep-linkable). Both are server components reading from static JSON data.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Next/Image

**Status:** Tasks 1–3 already completed (ProductCard component, dictionary entries, initial home page). Tasks 4–6 revise the home page and products page to use concern tabs.

---

### Task 1: Create ProductCard component [DONE]

Already completed — `src/components/products/ProductCard.tsx` exists.

---

### Task 2: Add dictionary entries for "View More" [DONE]

Already completed — `viewMore` added to both vi.json and en.json.

---

### Task 3: Initial home page rewrite [DONE]

Already completed — but needs revision in Task 4 to add concern tabs.

---

### Task 4: Revise home page to add concern filter tabs

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Replace the entire file**

```tsx
import Link from "next/link";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import ProductCard from "@/components/products/ProductCard";

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ concern?: string }>;
}) {
  const { locale } = await params;
  const { concern: concernParam } = await searchParams;
  const dict = await getDictionary(locale as Locale);
  const activeConcern = concernParam || "acne";

  const filtered = products
    .filter((p) => p.concerns.includes(activeConcern as never))
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="px-4 py-4">
        <span className="text-lg font-bold tracking-tight">Kwip</span>
      </header>

      {/* Concern filter tabs */}
      <nav className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex gap-1 px-4 overflow-x-auto">
          {concerns.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}?concern=${c.id}`}
              className={`shrink-0 px-4 py-3 text-sm transition-colors ${
                c.id === activeConcern
                  ? "text-white border-b-2 border-white font-medium"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {c.icon} {t(c.label, locale as Locale)}
            </Link>
          ))}
        </div>
      </nav>

      {/* Product grid */}
      <main className="px-4 py-4 pb-8">
        {filtered.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">
            {dict.products.emptyState}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name[locale as Locale] || product.name.vi}
                category={product.category}
                image={product.image}
                locale={locale}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/\[locale\]/page.tsx
git commit -m "feat: add concern filter tabs to home page"
```

---

### Task 5: Update products page to use ProductCard grid

**Files:**
- Modify: `src/app/[locale]/products/page.tsx`

**Step 1: Replace the entire file**

```tsx
import Link from "next/link";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import ProductCard from "@/components/products/ProductCard";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ concern?: string }>;
}) {
  const { locale } = await params;
  const { concern: concernParam } = await searchParams;
  const dict = await getDictionary(locale as Locale);
  const activeConcern = concernParam || "acne";

  const filtered = products
    .filter((p) => p.concerns.includes(activeConcern as never))
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="px-4 py-4">
        <Link
          href={`/${locale}`}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          {dict.detail.back}
        </Link>
      </header>

      {/* Concern filter tabs */}
      <nav className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex gap-1 px-4 overflow-x-auto">
          {concerns.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/products?concern=${c.id}`}
              className={`shrink-0 px-4 py-3 text-sm transition-colors ${
                c.id === activeConcern
                  ? "text-white border-b-2 border-white font-medium"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {c.icon} {t(c.label, locale as Locale)}
            </Link>
          ))}
        </div>
      </nav>

      {/* Product grid */}
      <main className="px-4 py-4">
        {filtered.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">
            {dict.products.emptyState}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name[locale as Locale] || product.name.vi}
                category={product.category}
                image={product.image}
                locale={locale}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/\[locale\]/products/page.tsx
git commit -m "feat: update products page to use ProductCard grid with concern filters"
```

---

### Task 6: Visual verification

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Verify home page**

Open: `http://localhost:3000/vi`
Expected:
- "Kwip" top-left
- Sticky concern filter tabs (Mụn, Cấp ẩm, Sáng da, Chống lão hóa)
- 2-column grid of product cards filtered by selected concern
- Default tab: "Mụn" (acne)
- Switching tabs filters products and updates URL
- Clicking a card navigates to product detail page

**Step 3: Verify products page**

Open: `http://localhost:3000/vi/products`
Expected:
- "← Quay lại" back link top-left
- Same concern filter tabs and card grid as home page
- Switching tabs filters products correctly

**Step 4: Verify English**

Open: `http://localhost:3000/en`
Expected: English concern labels, English product names

**Step 5: Commit all remaining changes (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: visual adjustments from manual verification"
```
