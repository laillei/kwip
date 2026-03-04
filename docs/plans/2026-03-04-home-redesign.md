# Home Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the concern-selector home page with a 2-column product card grid (full-bleed image, gradient overlay, category + name). Add "View More" link that navigates to a filtered products page.

**Architecture:** Shared `ProductCard` component used by both home and products pages. Home shows all products randomly. Products page adds concern filter tabs. Both are server components reading from static JSON data.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Next/Image

---

### Task 1: Create ProductCard component

**Files:**
- Create: `src/components/products/ProductCard.tsx`

**Step 1: Create the component**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

interface ProductCardProps {
  slug: string;
  name: string;
  category: string;
  image: string;
  locale: string;
}

export default function ProductCard({
  slug,
  name,
  category,
  image,
  locale,
}: ProductCardProps) {
  return (
    <Link
      href={`/${locale}/products/${slug}`}
      className="relative block aspect-[3/4] rounded-xl overflow-hidden group"
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-xs text-white/70 capitalize">{category}</p>
        <p className="text-sm font-semibold text-white leading-tight mt-0.5">
          {name}
        </p>
      </div>
    </Link>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/products/ProductCard.tsx
git commit -m "feat: add ProductCard component with full-bleed image and gradient overlay"
```

---

### Task 2: Add dictionary entries for "View More"

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Add entries**

In `vi.json`, add to the `"home"` object:
```json
"viewMore": "Xem thêm"
```

In `en.json`, add to the `"home"` object:
```json
"viewMore": "View More"
```

**Step 2: Commit**

```bash
git add src/dictionaries/vi.json src/dictionaries/en.json
git commit -m "feat: add viewMore dictionary entries"
```

---

### Task 3: Rewrite home page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Replace the entire file**

```tsx
import Link from "next/link";
import products from "@/data/products.json";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import ProductCard from "@/components/products/ProductCard";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const shuffledProducts = shuffle(products);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-4">
        <span className="text-lg font-bold tracking-tight">Kwip</span>
        <Link
          href={`/${locale}/products`}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          {dict.home.viewMore} →
        </Link>
      </header>

      {/* Product grid */}
      <main className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {shuffledProducts.map((product) => (
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
git commit -m "feat: redesign home page with product card grid"
```

---

### Task 4: Update products page to use ProductCard and same grid style

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

### Task 5: Visual verification

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Verify home page**

Open: `http://localhost:3000/vi`
Expected:
- "Kwip" top-left, "Xem thêm →" top-right
- 2-column grid of 3 product cards
- Each card: full-bleed image, gradient at bottom, category + name in white text
- Cards appear in random order
- Clicking a card navigates to product detail page

**Step 3: Verify products page**

Open: `http://localhost:3000/vi/products`
Expected:
- "← Quay lại" back link top-left
- Sticky concern filter tabs (Mụn, Cấp ẩm, Sáng da, Chống lão hóa)
- Same card grid style as home page
- Switching tabs filters products correctly

**Step 4: Verify English**

Open: `http://localhost:3000/en`
Expected: "View More →" link, English product names

**Step 5: Commit all remaining changes (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: visual adjustments from manual verification"
```
