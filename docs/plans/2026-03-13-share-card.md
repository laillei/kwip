# Share Card Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Chia sẻ" button to the saved routine detail page that generates a 1080×1920 PNG image card and shares it via the native share sheet on mobile (Web Share API) or triggers a file download on desktop.

**Architecture:** A Next.js API route at `/api/share/routine/[id]` fetches the saved routine from Supabase, resolves product names from the static `products.json`, renders a dark 9:16 image card using `ImageResponse` from `next/og` (Satori, built into Next.js 15 — no extra package), and returns a PNG. A `ShareButton` client component calls this route, gets the blob, and uses `navigator.share()` on mobile or `<a download>` on desktop.

**Tech Stack:** Next.js 15 App Router, `next/og` (ImageResponse/Satori, built-in), Supabase (existing), Noto Sans TTF fonts (to be added to `public/fonts/`), TypeScript

---

### Task 1: Download Noto Sans fonts and commit

The image API route uses Satori to render text. Satori requires font data as an `ArrayBuffer` — it cannot use CSS font stacks. We commit the font files to `public/fonts/` so the API route can load them with `fs.readFileSync`.

**Files:**
- Create: `public/fonts/NotoSans-Regular.ttf`
- Create: `public/fonts/NotoSans-Bold.ttf`

**Step 1: Download the font files**

Go to https://fonts.google.com/noto/specimen/Noto+Sans, click **Download family**. Unzip. Find `NotoSans-Regular.ttf` and `NotoSans-Bold.ttf` inside the zip (they may be inside a subfolder like `static/`).

Copy them to `public/fonts/`:
```bash
mkdir -p public/fonts
# Copy the two TTF files from your Downloads folder
cp ~/Downloads/Noto_Sans/static/NotoSans-Regular.ttf public/fonts/
cp ~/Downloads/Noto_Sans/static/NotoSans-Bold.ttf public/fonts/
```

The exact zip structure may vary — look for files matching `*Regular.ttf` and `*Bold.ttf`.

**Step 2: Verify files exist**

```bash
ls -lh public/fonts/
```
Expected: two `.ttf` files, each ~300–600KB.

**Step 3: Commit**

```bash
git add public/fonts/NotoSans-Regular.ttf public/fonts/NotoSans-Bold.ttf
git commit -m "feat: add Noto Sans fonts for share card image generation"
```

---

### Task 2: Add "sharing" dictionary key

`shareButton` and `shareCardTagline` already exist in both dictionaries. We only need to add the `sharing` key (shown while the PNG is being generated).

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Add to vi.json**

In `src/dictionaries/vi.json`, inside the `"routine"` object, add after `"shareButton": "Chia sẻ",`:

```json
"sharing": "Đang tạo ảnh...",
```

Result — the `routine` block should include:
```json
"shareButton": "Chia sẻ",
"sharing": "Đang tạo ảnh...",
```

**Step 2: Add to en.json**

In `src/dictionaries/en.json`, inside the `"routine"` object, add after `"shareButton": "Share",`:

```json
"sharing": "Generating...",
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: build passes with no TypeScript or lint errors.

**Step 4: Commit**

```bash
git add src/dictionaries/vi.json src/dictionaries/en.json
git commit -m "feat: add sharing loading string to dictionaries"
```

---

### Task 3: Create the share image API route

This route fetches the routine from Supabase, resolves product names from the static JSON, and returns a 1080×1920 PNG using `ImageResponse` from `next/og`.

**Key notes for implementer:**
- `ImageResponse` is built into Next.js 15 via `next/og` — no extra package needed.
- `export const runtime = 'nodejs'` is required because we use `fs.readFileSync` for font loading.
- Satori (the renderer inside `ImageResponse`) only supports a **subset of CSS**: flexbox layout, basic box model, and text properties. No CSS Grid. Every container div needs `display: 'flex'`. Inline elements (`<span>`) work inside flex containers.
- All styles are **inline** (`style={{ ... }}`). No Tailwind classes — Satori doesn't process them.
- `RoutineProduct` only has `{ productId, category, step }`. Product names and brands are resolved from `products.json` by matching `productId` to `product.id`.

**Files:**
- Create: `src/app/api/share/routine/[id]/route.ts`

**Step 1: Create the file with this exact content**

```typescript
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import allProducts from "@/data/products.json";
import type { Routine, RoutineProduct } from "@/lib/types";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";

const CATEGORY_NAMES: Record<string, string> = {
  cleanser: "Sữa rửa mặt",
  pad: "Pad",
  toner: "Nước hoa hồng",
  essence: "Tinh chất",
  serum: "Serum",
  ampoule: "Tinh chất cô đặc",
  mask: "Mặt nạ",
  cream: "Kem",
  sunscreen: "Chống nắng",
};

const CONCERN_LABELS: Record<string, string> = {
  acne: "Mụn",
  pores: "Lỗ chân lông",
  hydration: "Cấp ẩm",
  brightening: "Sáng da",
  soothing: "Dịu da",
  "anti-aging": "Chống lão hóa",
  "sun-protection": "Chống nắng",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return new Response("Routine not found", { status: 404 });
  }

  const routine = data as unknown as Routine;
  const products = allProducts as Product[];

  const routineProducts = (routine.products as RoutineProduct[])
    .sort((a, b) => a.step - b.step)
    .map((rp) => ({
      ...rp,
      product: products.find((p) => p.id === rp.productId),
    }))
    .filter(
      (rp): rp is typeof rp & { product: Product } => !!rp.product
    );

  const fontRegular = readFileSync(
    join(process.cwd(), "public/fonts/NotoSans-Regular.ttf")
  );
  const fontBold = readFileSync(
    join(process.cwd(), "public/fonts/NotoSans-Bold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          backgroundColor: "#171717",
          display: "flex",
          flexDirection: "column",
          padding: "80px 72px",
          fontFamily: "Noto Sans",
        }}
      >
        {/* Header: kwip wordmark + concern badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "60px",
          }}
        >
          <span
            style={{ fontSize: 48, fontWeight: 700, color: "white" }}
          >
            kwip
          </span>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 12,
              padding: "8px 20px",
              display: "flex",
            }}
          >
            <span
              style={{ fontSize: 28, fontWeight: 400, color: "white" }}
            >
              {CONCERN_LABELS[routine.concern] ?? routine.concern}
            </span>
          </div>
        </div>

        {/* Routine name */}
        <div style={{ display: "flex", marginBottom: "60px" }}>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
            }}
          >
            {routine.name}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.1)",
            marginBottom: "40px",
            display: "flex",
          }}
        />

        {/* Routine steps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {routineProducts.map((rp, index) => (
            <div
              key={rp.productId}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 32,
                  paddingTop: 24,
                  paddingBottom: 24,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 400,
                    color: "#737373",
                    width: 40,
                    flexShrink: 0,
                    paddingTop: 4,
                    display: "flex",
                  }}
                >
                  {rp.step}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 400,
                      color: "#737373",
                    }}
                  >
                    {CATEGORY_NAMES[rp.category] ?? rp.category}
                  </span>
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {rp.product.name.vi ?? rp.product.name.en}
                  </span>
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 400,
                      color: "#737373",
                    }}
                  >
                    {rp.product.brand}
                  </span>
                </div>
              </div>
              {index < routineProducts.length - 1 && (
                <div
                  style={{
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    display: "flex",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
            kwip.app
          </span>
          <span style={{ fontSize: 22, fontWeight: 400, color: "#737373" }}>
            Được xây dựng dựa trên thành phần, không phải quảng cáo.
          </span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: "Noto Sans", data: fontRegular, weight: 400 },
        { name: "Noto Sans", data: fontBold, weight: 700 },
      ],
    }
  );
}
```

**Step 2: Verify the route compiles**

```bash
npm run build
```
Expected: build passes. If you see a Satori-related error about unsupported CSS property, check that all divs have `display: 'flex'`.

**Step 3: Commit**

```bash
git add src/app/api/share/routine/[id]/route.ts
git commit -m "feat: add share card image API route"
```

---

### Task 4: Create ShareButton client component

This is a `"use client"` component. It calls the API route, gets a PNG blob, then either uses the Web Share API (mobile) or triggers a file download (desktop/unsupported browsers).

**Files:**
- Create: `src/components/routine/ShareButton.tsx`

**Step 1: Create the file with this exact content**

```typescript
"use client";

import { useState } from "react";

interface ShareButtonProps {
  routineId: string;
  routineName: string;
  dict: {
    shareButton: string;
    sharing: string;
  };
}

export default function ShareButton({
  routineId,
  routineName,
  dict,
}: ShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/share/routine/${routineId}`);
      if (!response.ok) throw new Error("Failed to generate share card");
      const blob = await response.blob();
      const file = new File([blob], "routine-kwip.png", {
        type: "image/png",
      });

      if (
        typeof navigator.share === "function" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: routineName });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "routine-kwip.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // Share cancelled by user (AbortError) or failed — silently ignore
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex-1 text-center py-2 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? dict.sharing : dict.shareButton}
    </button>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: passes with no TypeScript errors.

**Step 3: Commit**

```bash
git add src/components/routine/ShareButton.tsx
git commit -m "feat: add ShareButton client component with Web Share API"
```

---

### Task 5: Wire ShareButton into the routine detail page

Add `getDictionary` to the server component and render `<ShareButton>` alongside the existing "View" button pattern.

**Files:**
- Modify: `src/app/[locale]/routine/[id]/page.tsx`

**Step 1: Replace the file with this content**

```typescript
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import type { Routine, RoutineProduct } from "@/lib/types";
import ShareButton from "@/components/routine/ShareButton";

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const routine = data as unknown as Routine;
  const loc = locale as "vi" | "en";
  const dict = await getDictionary(locale as Locale);
  const allProducts = products as Product[];

  const routineProducts = (routine.products as RoutineProduct[])
    .sort((a, b) => a.step - b.step)
    .map((rp) => ({
      ...rp,
      product: allProducts.find((p) => p.id === rp.productId),
    }))
    .filter((rp): rp is typeof rp & { product: Product } => !!rp.product);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link
          href={`/${locale}/me`}
          className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 block"
        >
          {loc === "vi" ? "← Routine của tôi" : "← My Routines"}
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          {routine.name}
        </h1>
        <p className="text-sm text-neutral-500 mb-6">{routine.concern}</p>

        {/* Share button */}
        <div className="flex gap-2 mb-8">
          <ShareButton
            routineId={id}
            routineName={routine.name}
            dict={{
              shareButton: dict.routine.shareButton,
              sharing: dict.routine.sharing,
            }}
          />
        </div>

        <div className="space-y-6">
          {routineProducts.map((rp) => (
            <div key={rp.productId} className="flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-400 w-5 text-center">
                {rp.step}
              </span>
              <Image
                src={rp.product.image}
                alt={rp.product.name[loc] ?? rp.product.name.vi}
                width={56}
                height={56}
                className="rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {rp.product.name[loc] ?? rp.product.name.vi}
                </p>
                <p className="text-xs text-neutral-500">{rp.product.brand}</p>
              </div>
              <Link
                href={`/${locale}/products/${rp.product.slug}`}
                className="text-xs text-neutral-400 hover:text-neutral-900 flex-shrink-0"
              >
                →
              </Link>
            </div>
          ))}
        </div>

        <p className="text-xs text-neutral-400 text-center mt-12">
          {loc === "vi"
            ? "Routine của tôi — được xây dựng dựa trên thành phần, không phải quảng cáo."
            : "My routine — built on ingredient science, not ads."}
        </p>
        <p className="text-xs text-neutral-400 text-center mt-1 font-medium">
          kwip.app
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: build passes. If you see a TypeScript error about `dict.routine.sharing` not existing, ensure Task 2 (adding the dict key) was completed first.

**Step 3: Manual test**

```bash
npm run dev
```

1. Sign in at `http://localhost:3000/vi`
2. Build and save a routine via `/vi/routine/new`
3. Go to `/vi/me` and click View on a saved routine
4. Verify the "Chia sẻ" button appears below the routine name
5. Click it — on desktop it should trigger a PNG download named `routine-kwip.png`
6. Open the downloaded PNG — verify: dark background, kwip wordmark top-left, concern badge top-right, routine name large, steps list, kwip.app footer

**Step 4: Commit**

```bash
git add src/app/[locale]/routine/[id]/page.tsx
git commit -m "feat: wire ShareButton into routine detail page"
```

---

### Task 6: Final build verification

**Step 1: Clean build**

```bash
npm run build
```
Expected: exits 0, no TypeScript errors, no lint errors.

**Step 2: Verify the API route is recognized**

In the build output, look for a route entry like:
```
├ /api/share/routine/[id]   ...
```

**Step 3: Commit if any final fixes were needed**

If the build revealed issues (unlikely if previous tasks were done correctly), fix them and commit with a descriptive message.

---

## Summary

| Task | Files | Purpose |
|---|---|---|
| 1 | `public/fonts/*.ttf` | Font data for Satori text rendering |
| 2 | `vi.json`, `en.json` | Add "sharing" loading string |
| 3 | `api/share/routine/[id]/route.ts` | PNG generation via ImageResponse |
| 4 | `ShareButton.tsx` | Web Share API + download fallback |
| 5 | `routine/[id]/page.tsx` | Wire button into detail page |
| 6 | — | Build verification |
