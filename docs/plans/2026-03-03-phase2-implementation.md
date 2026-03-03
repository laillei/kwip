# Phase 2: Core Pages — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the 3 core pages (Home, Ranking, Detail) with dark K-beauty theme, static data, and page navigation.

**Architecture:** All server components. Pages import JSON directly — no API calls, no client state. Dark theme via Tailwind classes. Minimal color: black/white/neutral with emerald for "good" and amber for "caution" badges.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS 4

---

### Task 1: Dark theme + layout update

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/app/not-found.tsx`

**Step 1: Update src/app/globals.css**

```css
@import "tailwindcss";

@layer base {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

**Step 2: Update src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kwip - Kiểm tra thành phần K-beauty",
  description: "Kiểm tra thành phần mỹ phẩm Hàn Quốc bằng tiếng Việt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${notoSans.className} bg-black text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
```

**Step 3: Create src/app/not-found.tsx**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Trang không tồn tại
      </p>
      <Link
        href="/"
        className="mt-6 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        ← Về trang chủ
      </Link>
    </main>
  );
}
```

**Step 4: Verify**

Run: `npm run dev` — check localhost:3000, confirm dark background, white text. Then stop.

---

### Task 2: Home page with concern grid

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Rewrite src/app/page.tsx**

```tsx
import Link from "next/link";
import concerns from "@/data/concerns.json";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold tracking-tight">Kwip</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Kiểm tra thành phần K-beauty bằng tiếng Việt
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-sm">
        {concerns.map((concern) => (
          <Link
            key={concern.id}
            href={`/products?concern=${concern.id}`}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-6 min-h-[120px] transition-colors hover:bg-neutral-800 active:bg-neutral-700"
          >
            <span className="text-2xl">{concern.icon}</span>
            <span className="text-sm font-medium">{concern.label.vi}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

**Step 2: Verify**

Run: `npm run dev` — home shows 4 concern cards in 2x2 grid. Clicking one navigates to `/products?concern=acne` (will 404 for now, that's OK).

---

### Task 3: Products listing page

**Files:**
- Create: `src/app/products/page.tsx`

**Step 1: Create src/app/products/page.tsx**

```tsx
import Link from "next/link";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ concern?: string }>;
}) {
  const { concern: concernParam } = await searchParams;
  const activeConcern = concernParam || "acne";

  const filtered = products
    .filter((p) => p.concerns.includes(activeConcern as never))
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Kwip
        </Link>
      </header>

      {/* Concern tabs */}
      <nav className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex gap-1 px-4 overflow-x-auto">
          {concerns.map((c) => (
            <Link
              key={c.id}
              href={`/products?concern=${c.id}`}
              className={`shrink-0 px-4 py-3 text-sm transition-colors ${
                c.id === activeConcern
                  ? "text-white border-b-2 border-white font-medium"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {c.icon} {c.label.vi}
            </Link>
          ))}
        </div>
      </nav>

      {/* Product list */}
      <main className="px-4 py-4">
        <p className="text-xs text-neutral-500 mb-4">
          Phổ biến tại Việt Nam
        </p>

        {filtered.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">
            Chúng tôi đang cập nhật thêm sản phẩm
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:bg-neutral-800 active:bg-neutral-700"
              >
                <span className="text-2xl font-bold text-neutral-600 w-8 shrink-0 text-right">
                  {product.popularity.rank}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-sm leading-tight truncate">
                    {product.name.vi}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {product.brand} · {product.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 2: Verify**

Run: `npm run dev` — navigate from home to `/products?concern=moisturizing`. Should see 2 products (COSRX rank 1, Anua rank 3). Switch tabs — "brightening" shows 1 product (Beauty of Joseon). "Anti-aging" shows 1 product (COSRX).

---

### Task 4: Product detail page

**Files:**
- Create: `src/app/products/[slug]/page.tsx`

**Step 1: Create src/app/products/[slug]/page.tsx**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import products from "@/data/products.json";
import ingredientsData from "@/data/ingredients.json";
import type { Product, Ingredient } from "@/lib/types";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug) as Product | undefined;
  if (!product) notFound();

  const ingredientMap = new Map(
    ingredientsData.map((i) => [i.id, i as Ingredient])
  );

  const keyIngredients = product.ingredients
    .filter((pi) => pi.isKey)
    .map((pi) => ({ ...pi, detail: ingredientMap.get(pi.ingredientId)! }));

  const allIngredients = [...product.ingredients]
    .sort((a, b) => a.order - b.order)
    .map((pi) => ({ ...pi, detail: ingredientMap.get(pi.ingredientId)! }));

  const purchaseLinks = [
    { platform: "Shopee", url: product.purchase.shopee },
    { platform: "TikTok Shop", url: product.purchase.tiktokShop },
    { platform: "Hasaki", url: product.purchase.hasaki },
  ].filter((l): l is { platform: string; url: string } => Boolean(l.url));

  return (
    <div className="min-h-screen pb-24">
      {/* Back button */}
      <header className="px-4 py-4">
        <Link
          href={`/products?concern=${product.concerns[0]}`}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          ← Quay lại
        </Link>
      </header>

      <main className="px-4">
        {/* Product info */}
        <h1 className="text-xl font-bold leading-tight">
          {product.name.vi}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {product.brand} · {product.category}
        </p>

        {/* Key ingredients */}
        <section className="mt-8">
          <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Thành phần chính
          </h2>
          <div className="flex flex-col gap-2">
            {keyIngredients.map(({ detail }) => (
              <div
                key={detail.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
              >
                <p className="text-sm font-medium">{detail.name.inci}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {detail.name.vi}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  {detail.description.vi}
                </p>
                {detail.effects.length > 0 && (
                  <div className="flex flex-col gap-1 mt-2">
                    {detail.effects.map((effect) => (
                      <span
                        key={effect.concern}
                        className={`text-xs ${
                          effect.type === "good"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {effect.type === "good" ? "✓" : "⚠"} {effect.reason.vi}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Full ingredient list */}
        <section className="mt-8">
          <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Tất cả thành phần
          </h2>
          <div className="flex flex-col divide-y divide-neutral-800">
            {allIngredients.map(({ ingredientId, order, detail }) => (
              <div key={ingredientId} className="flex items-start gap-3 py-3">
                <span className="text-xs text-neutral-600 w-5 shrink-0 pt-0.5 text-right">
                  {order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{detail.name.inci}</p>
                  <p className="text-xs text-neutral-500">{detail.name.vi}</p>
                  {detail.effects.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {detail.effects.map((effect) => (
                        <span
                          key={effect.concern}
                          className={`text-xs ${
                            effect.type === "good"
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {effect.type === "good" ? "✓" : "⚠"}{" "}
                          {effect.reason.vi}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky purchase buttons */}
      {purchaseLinks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-neutral-800 p-4">
          <div className="flex gap-2 max-w-lg mx-auto">
            {purchaseLinks.map(({ platform, url }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-white text-black text-center text-sm font-medium py-3 transition-opacity hover:opacity-90 active:opacity-80"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify**

Run: `npm run dev` — navigate Home → "Cấp ẩm" → tap COSRX product. Should see:
- Back button "← Quay lại"
- Product name in Vietnamese
- 3 key ingredients (Snail Secretion Filtrate, Sodium Hyaluronate, Panthenol) with green effect badges
- Full ingredient list (8 items) with numbered rows
- Sticky purchase buttons at bottom (Shopee, TikTok Shop, Hasaki)

---

### Task 5: Build and commit

**Step 1: Run build**

Run: `npm run build`
Expected: Build succeeds. Should show static routes for `/`, `/products`, `/products/cosrx-snail-mucin-essence`, `/products/anua-heartleaf-toner`, `/products/beauty-of-joseon-relief-sun`.

**Step 2: Commit**

```bash
git add src/app/ docs/plans/2026-03-03-phase2-core-pages-design.md docs/plans/2026-03-03-phase2-implementation.md
git commit -m "feat: add core pages — home, product ranking, ingredient detail"
```
