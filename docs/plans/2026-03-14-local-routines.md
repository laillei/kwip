# Local Routines (No Login) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Google OAuth + Supabase routine storage with localStorage, so users can save and manage routines without logging in.

**Architecture:** Routines are stored in `localStorage` under the key `kwip_routines` as a JSON array. The share image API is kept server-side but receives routine data via query param instead of looking it up from a database. All auth-gating is removed.

**Tech Stack:** Next.js 15 App Router, TypeScript, localStorage (browser native), existing Next.js `ImageResponse` for share image generation.

---

### Task 1: Update dictionary strings

Remove login-related keys, update empty state copy to match the approved UX writing.

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Update vi.json routine section**

Replace the `routine` block with:

```json
"routine": {
  "buildCta": "Xây dựng routine của bạn",
  "builderTitle": "Xây dựng Routine",
  "selectProducts": "Chọn sản phẩm cho mỗi bước",
  "namePlaceholder": "Đặt tên cho routine của bạn...",
  "saveButton": "Lưu Routine",
  "saving": "Đang lưu...",
  "myRoutines": "Routine của tôi",
  "emptyTitle": "Routine của bạn sẽ được lưu tại đây.",
  "emptyBody": "Bắt đầu từ trang chủ — chọn vấn đề da của bạn.",
  "emptyAction": "← Trang chủ",
  "shareButton": "Chia sẻ",
  "sharing": "Đang tạo ảnh...",
  "deleteButton": "Xoá",
  "backToHome": "← Trang chủ",
  "backToRoutines": "← Routine của tôi",
  "createdAt": "Đã tạo",
  "productsCount": "sản phẩm",
  "shareCardTagline": "Routine của tôi — được xây dựng dựa trên thành phần, không phải quảng cáo."
}
```

**Step 2: Update en.json routine section**

```json
"routine": {
  "buildCta": "Build My Routine",
  "builderTitle": "Build Your Routine",
  "selectProducts": "Select products for each step",
  "namePlaceholder": "Name your routine...",
  "saveButton": "Save Routine",
  "saving": "Saving...",
  "myRoutines": "My Routines",
  "emptyTitle": "Your routines will be saved here.",
  "emptyBody": "Start from home — pick your skin concern.",
  "emptyAction": "← Home",
  "shareButton": "Share",
  "sharing": "Generating...",
  "deleteButton": "Delete",
  "backToHome": "← Home",
  "backToRoutines": "← My Routines",
  "createdAt": "Created",
  "productsCount": "products",
  "shareCardTagline": "My routine — built on ingredient science, not ads."
}
```

**Step 3: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no type errors related to missing dict keys.

**Step 4: Commit**

```bash
git add src/dictionaries/vi.json src/dictionaries/en.json
git commit -m "copy: update routine dictionary — remove login strings, new empty state"
```

---

### Task 2: Update Routine type for localStorage

Remove server-only fields (`userId`, `userEmail`, `updatedAt`) — they have no meaning in localStorage.

**Files:**
- Modify: `src/lib/types/routine.ts`

**Step 1: Rewrite the file**

```typescript
import type { Category } from "./product";
import type { Concern } from "./concern";

export interface RoutineProduct {
  productId: string;
  category: Category;
  step: number;
}

export interface Routine {
  id: string;
  name: string;
  concern: Concern;
  products: RoutineProduct[];
  createdAt: string;
}
```

**Step 2: Verify build catches any type breakage**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: may show errors in files that reference `userId`/`userEmail` — those will be fixed in later tasks.

**Step 3: Commit**

```bash
git add src/lib/types/routine.ts
git commit -m "types: simplify Routine — remove server fields userId/userEmail/updatedAt"
```

---

### Task 3: Create localStorage utilities

A single file with all CRUD operations for routines in localStorage.

**Files:**
- Create: `src/lib/localRoutines.ts`

**Step 1: Write the file**

```typescript
import type { Routine, RoutineProduct } from "@/lib/types";

const KEY = "kwip_routines";

function load(): Routine[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(routines: Routine[]): void {
  localStorage.setItem(KEY, JSON.stringify(routines));
}

export function getRoutines(): Routine[] {
  return load();
}

export function getRoutineById(id: string): Routine | undefined {
  return load().find((r) => r.id === id);
}

export function saveRoutine(input: {
  name: string;
  concern: string;
  products: RoutineProduct[];
}): Routine {
  const routines = load();
  const routine: Routine = {
    id: crypto.randomUUID(),
    name: input.name,
    concern: input.concern as Routine["concern"],
    products: input.products,
    createdAt: new Date().toISOString(),
  };
  save([routine, ...routines]);
  return routine;
}

export function deleteRoutine(id: string): void {
  save(load().filter((r) => r.id !== id));
}
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors from this new file.

**Step 3: Commit**

```bash
git add src/lib/localRoutines.ts
git commit -m "feat: add localStorage routine utilities"
```

---

### Task 4: Update AuthButton → RoutineButton

Remove sign-in logic. The icon now always links to `/me` (My Routines).

**Files:**
- Modify: `src/components/shared/AuthButton.tsx`

**Step 1: Rewrite the component**

```tsx
import Link from "next/link";

interface AuthButtonProps {
  locale: string;
}

export default function AuthButton({ locale }: AuthButtonProps) {
  return (
    <Link
      href={`/${locale}/me`}
      className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300 transition-colors"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-neutral-600"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    </Link>
  );
}
```

Note: This is now a Server Component (no `"use client"` directive needed).

**Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 3: Commit**

```bash
git add src/components/shared/AuthButton.tsx
git commit -m "feat: AuthButton no longer requires login — always links to /me"
```

---

### Task 5: Update BuildRoutineButton — remove auth gating

Users go straight to the routine builder without sign-in.

**Files:**
- Modify: `src/components/home/BuildRoutineButton.tsx`

**Step 1: Rewrite the component**

```tsx
"use client";

import { useRouter } from "next/navigation";

interface BuildRoutineButtonProps {
  locale: string;
  concern: string;
  label: string;
}

export default function BuildRoutineButton({
  locale,
  concern,
  label,
}: BuildRoutineButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/${locale}/routine/new?concern=${concern}`)}
      className="w-full mt-4 py-3 px-4 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-700 transition-colors"
    >
      {label}
    </button>
  );
}
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 3: Commit**

```bash
git add src/components/home/BuildRoutineButton.tsx
git commit -m "feat: BuildRoutineButton goes directly to builder — no login required"
```

---

### Task 6: Update /routine/new — remove auth redirect

**Files:**
- Modify: `src/app/[locale]/routine/new/page.tsx`

**Step 1: Rewrite the page**

```tsx
import { redirect } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/i18n";
import products from "@/data/products.json";
import concerns from "@/data/concerns.json";
import type { Product } from "@/lib/types";
import RoutineBuilderClient from "@/components/routine/RoutineBuilderClient";

export default async function RoutineNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ concern?: string }>;
}) {
  const { locale } = await params;
  const { concern } = await searchParams;

  if (!concern) {
    redirect(`/${locale}`);
  }

  const dict = await getDictionary(locale as Locale);
  const allProducts = (products as Product[]).filter((p) => {
    const name = (p.name.en || p.name.vi || "").toLowerCase();
    return (
      !name.includes("[deal]") &&
      !name.includes("bundle") &&
      !name.includes("2-pack") &&
      !name.includes("3-pack") &&
      !name.includes(" kit")
    );
  });

  const concernData = concerns.find((c) => c.id === concern);
  const concernLabel =
    locale === "vi" ? concernData?.label?.vi : concernData?.label?.en;

  return (
    <RoutineBuilderClient
      locale={locale}
      concern={concern}
      concernLabel={concernLabel}
      products={allProducts}
      dict={dict.routine}
    />
  );
}
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 3: Commit**

```bash
git add src/app/[locale]/routine/new/page.tsx
git commit -m "feat: routine builder no longer requires authentication"
```

---

### Task 7: Update RoutineBuilderClient — save to localStorage

**Files:**
- Modify: `src/components/routine/RoutineBuilderClient.tsx`

**Step 1: Update the dict type and handleSave**

The only changes are: import `saveRoutine` from localRoutines, replace the `fetch` call with `saveRoutine`, remove the `saving` error path since localStorage never fails.

Replace the `handleSave` function and imports:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import type { RoutineProduct } from "@/lib/types";
import { saveRoutine } from "@/lib/localRoutines";
import RoutineStepPicker from "./RoutineStepPicker";

// ... ROUTINE_STEPS stays the same ...

interface RoutineBuilderClientProps {
  locale: string;
  concern: string;
  concernLabel: string | undefined;
  products: Product[];
  dict: {
    builderTitle: string;
    selectProducts: string;
    namePlaceholder: string;
    saveButton: string;
    saving: string;
    backToHome: string;
  };
}

export default function RoutineBuilderClient({
  locale,
  concern,
  concernLabel,
  products,
  dict,
}: RoutineBuilderClientProps) {
  const router = useRouter();
  const loc = locale as "vi" | "en";
  const [routineName, setRoutineName] = useState(
    concernLabel ? `Routine ${concernLabel}` : "My Routine"
  );
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<string, string[]>
  >({});
  const [saving, setSaving] = useState(false);

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

    saveRoutine({
      name: routineName.trim(),
      concern,
      products: routineProducts,
    });

    router.push(`/${locale}/me`);
  }

  // ... rest of the JSX stays the same ...
}
```

**Step 2: Full file — write the complete replacement**

Write the complete file (copy the existing JSX, only change imports and `handleSave`):

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import type { RoutineProduct } from "@/lib/types";
import { saveRoutine } from "@/lib/localRoutines";
import RoutineStepPicker from "./RoutineStepPicker";

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

interface RoutineBuilderClientProps {
  locale: string;
  concern: string;
  concernLabel: string | undefined;
  products: Product[];
  dict: {
    builderTitle: string;
    selectProducts: string;
    namePlaceholder: string;
    saveButton: string;
    saving: string;
    backToHome: string;
  };
}

export default function RoutineBuilderClient({
  locale,
  concern,
  concernLabel,
  products,
  dict,
}: RoutineBuilderClientProps) {
  const router = useRouter();
  const loc = locale as "vi" | "en";
  const [routineName, setRoutineName] = useState(
    concernLabel ? `Routine ${concernLabel}` : "My Routine"
  );
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<string, string[]>
  >({});
  const [saving, setSaving] = useState(false);

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

    saveRoutine({
      name: routineName.trim(),
      concern,
      products: routineProducts,
    });

    router.push(`/${locale}/me`);
  }

  const stepsWithProducts = ROUTINE_STEPS.filter((step) =>
    products.some((p) => p.category === step.category)
  );

  void loc;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 block"
        >
          {dict.backToHome}
        </button>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          {dict.builderTitle}
        </h1>
        {concernLabel && (
          <p className="text-sm text-neutral-500 mb-6">{concernLabel}</p>
        )}

        <input
          type="text"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder={dict.namePlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 mb-8"
        />

        <div className="space-y-8">
          {stepsWithProducts.map((step) => (
            <RoutineStepPicker
              key={step.category}
              step={step.step}
              label={step.label[loc] ?? step.label.vi}
              products={products.filter((p) => p.category === step.category)}
              selectedIds={selectedByCategory[step.category] ?? []}
              locale={locale}
              onToggle={(productId) => toggleProduct(step.category, productId)}
            />
          ))}
        </div>

        <div className="sticky bottom-6 mt-8">
          <button
            onClick={handleSave}
            disabled={saving || totalSelected === 0 || !routineName.trim()}
            className="w-full py-4 bg-neutral-900 text-white text-base font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
          >
            {saving ? dict.saving : `${dict.saveButton} (${totalSelected})`}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 4: Commit**

```bash
git add src/components/routine/RoutineBuilderClient.tsx
git commit -m "feat: save routine to localStorage instead of server API"
```

---

### Task 8: Update /me page — read from localStorage

Convert from server-auth + API calls to a client component reading localStorage directly.

**Files:**
- Modify: `src/app/[locale]/me/page.tsx`

**Step 1: Rewrite the page**

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Routine } from "@/lib/types";
import { getRoutines, deleteRoutine } from "@/lib/localRoutines";
import RoutineCard from "@/components/routine/RoutineCard";

export default function MePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRoutines(getRoutines());
    setLoaded(true);
  }, []);

  function handleDelete(id: string) {
    if (!confirm(locale === "vi" ? "Xoá routine này?" : "Delete this routine?"))
      return;
    deleteRoutine(id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-sm text-neutral-400">...</div>
      </div>
    );
  }

  const emptyTitle =
    locale === "vi"
      ? "Routine của bạn sẽ được lưu tại đây."
      : "Your routines will be saved here.";
  const emptyBody =
    locale === "vi"
      ? "Bắt đầu từ trang chủ — chọn vấn đề da của bạn."
      : "Start from home — pick your skin concern.";
  const emptyAction = locale === "vi" ? "← Trang chủ" : "← Home";
  const heading = locale === "vi" ? "Routine của tôi" : "My Routines";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">{heading}</h1>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-900 font-medium mb-2">{emptyTitle}</p>
            <p className="text-neutral-500 text-sm mb-6">{emptyBody}</p>
            <Link
              href={`/${locale}`}
              className="text-sm font-medium text-neutral-900 underline"
            >
              {emptyAction}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                locale={locale}
                onDelete={handleDelete}
                dict={{
                  deleteButton: locale === "vi" ? "Xoá" : "Delete",
                  productsCount: locale === "vi" ? "sản phẩm" : "products",
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href={`/${locale}`}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            {locale === "vi" ? "← Trang chủ" : "← Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 3: Commit**

```bash
git add src/app/[locale]/me/page.tsx
git commit -m "feat: /me page reads routines from localStorage — no auth required"
```

---

### Task 9: Update /routine/[id] page — read from localStorage

This page is now client-side only. It reads the routine from localStorage by ID.

**Files:**
- Modify: `src/app/[locale]/routine/[id]/page.tsx`

**Step 1: Rewrite as client component**

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRoutineById } from "@/lib/localRoutines";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import type { Routine, RoutineProduct } from "@/lib/types";
import ShareButton from "@/components/routine/ShareButton";

export default function RoutineDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(params);
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loaded, setLoaded] = useState(false);
  const loc = locale as "vi" | "en";

  useEffect(() => {
    const found = getRoutineById(id);
    if (!found) {
      router.replace(`/${locale}/me`);
      return;
    }
    setRoutine(found);
    setLoaded(true);
  }, [id, locale, router]);

  if (!loaded || !routine) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-sm text-neutral-400">...</div>
      </div>
    );
  }

  const allProducts = products as Product[];
  const routineProducts = (routine.products as RoutineProduct[])
    .sort((a, b) => a.step - b.step)
    .map((rp) => ({
      ...rp,
      product: allProducts.find((p) => p.id === rp.productId),
    }))
    .filter((rp): rp is typeof rp & { product: Product } => !!rp.product);

  const shareDict =
    loc === "vi"
      ? { shareButton: "Chia sẻ", sharing: "Đang tạo ảnh..." }
      : { shareButton: "Share", sharing: "Generating..." };

  const backLabel =
    loc === "vi" ? "← Routine của tôi" : "← My Routines";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link
          href={`/${locale}/me`}
          className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 block"
        >
          {backLabel}
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          {routine.name}
        </h1>
        <p className="text-sm text-neutral-500 mb-6">{routine.concern}</p>

        <div className="flex gap-2 mb-8">
          <ShareButton
            routine={routine}
            dict={shareDict}
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
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 3: Commit**

```bash
git add src/app/[locale]/routine/[id]/page.tsx
git commit -m "feat: routine detail page reads from localStorage — no Supabase"
```

---

### Task 10: Update share API — accept routine data via query param

Instead of looking up the routine by ID from Supabase, decode routine data from the `data` query param (base64-encoded JSON).

**Files:**
- Modify: `src/app/api/share/routine/[id]/route.tsx` → rename to `src/app/api/share/route.tsx`

Wait — we should keep the same path to avoid breaking anything in progress, but actually the `[id]` no longer makes sense. Create a new clean route instead.

- Create: `src/app/api/share/route.tsx`
- Delete (after confirming): `src/app/api/share/routine/[id]/route.tsx`

**Step 1: Create `src/app/api/share/route.tsx`**

The `data` query param is a base64url-encoded JSON string of `{ name: string; concern: string; products: RoutineProduct[] }`.

```tsx
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import allProducts from "@/data/products.json";
import type { RoutineProduct, Product } from "@/lib/types";

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

const fontRegular = readFileSync(
  join(process.cwd(), "public/fonts/NotoSans-Regular.ttf")
);
const fontBold = readFileSync(
  join(process.cwd(), "public/fonts/NotoSans-Bold.ttf")
);

function resolveImageSrc(imagePath: string): string {
  if (imagePath.startsWith("http")) return imagePath;
  try {
    const buf = readFileSync(join(process.cwd(), "public", imagePath));
    const mime = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("data");
  if (!raw) {
    return new Response("Missing data param", { status: 400 });
  }

  let payload: { name: string; concern: string; products: RoutineProduct[] };
  try {
    payload = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return new Response("Invalid data param", { status: 400 });
  }

  const products = allProducts as Product[];
  const routineProducts = payload.products
    .sort((a, b) => a.step - b.step)
    .map((rp) => ({
      ...rp,
      product: products.find((p) => p.id === rp.productId),
    }))
    .filter(
      (rp): rp is typeof rp & { product: Product } => !!rp.product
    );

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          backgroundColor: "#FAFAFA",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 64px",
          fontFamily: "Noto Sans",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", marginBottom: "52px" }}>
            <span style={{ fontSize: 44, fontWeight: 700, color: "#171717" }}>
              Kwip
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", marginBottom: "40px", gap: 12 }}
          >
            <span
              style={{
                fontSize: 60,
                fontWeight: 700,
                color: "#171717",
                lineHeight: 1.15,
                wordBreak: "break-all",
              }}
            >
              {payload.name}
            </span>
            <span style={{ fontSize: 28, fontWeight: 400, color: "#A3A3A3" }}>
              {"Routine cho da " + (CONCERN_LABELS[payload.concern] ?? payload.concern).toLowerCase()}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRadius: 24,
            }}
          >
            {routineProducts.map((rp, index) => {
              const imgSrc = resolveImageSrc(rp.product.image);
              return (
                <div
                  key={rp.productId}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 28,
                      padding: "28px 36px",
                    }}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        width={88}
                        height={88}
                        style={{
                          borderRadius: 16,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 16,
                          backgroundColor: "#F5F5F5",
                          flexShrink: 0,
                          display: "flex",
                        }}
                      />
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: 24, fontWeight: 400, color: "#A3A3A3" }}>
                        {CATEGORY_NAMES[rp.category] ?? rp.category}
                      </span>
                      <span style={{ fontSize: 30, fontWeight: 700, color: "#171717" }}>
                        {rp.product.name.vi ?? rp.product.name.en}
                      </span>
                      <span style={{ fontSize: 24, fontWeight: 400, color: "#A3A3A3" }}>
                        {rp.product.brand}
                      </span>
                    </div>
                  </div>
                  {index < routineProducts.length - 1 && (
                    <div
                      style={{
                        height: 1,
                        backgroundColor: "#F5F5F5",
                        marginLeft: 36,
                        marginRight: 36,
                        display: "flex",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#171717" }}>
            Kwip
          </span>
          <span style={{ fontSize: 22, fontWeight: 400, color: "#A3A3A3" }}>
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

**Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 3: Commit**

```bash
git add src/app/api/share/route.tsx
git commit -m "feat: share image API accepts routine data via query param — no DB lookup"
```

---

### Task 11: Update ShareButton — pass routine data instead of ID

**Files:**
- Modify: `src/components/routine/ShareButton.tsx`

**Step 1: Rewrite the component**

The button now receives the full `Routine` object, encodes its data as base64url, and calls `/api/share?data=...`.

```tsx
"use client";

import { useState } from "react";
import type { Routine } from "@/lib/types";

interface ShareButtonProps {
  routine: Routine;
  dict: {
    shareButton: string;
    sharing: string;
  };
}

export default function ShareButton({ routine, dict }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const payload = {
        name: routine.name,
        concern: routine.concern,
        products: routine.products,
      };
      const data = btoa(
        unescape(encodeURIComponent(JSON.stringify(payload)))
      ).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

      const response = await fetch(`/api/share?data=${data}`);
      if (!response.ok) throw new Error("Failed to generate share card");
      const blob = await response.blob();
      const file = new File([blob], "routine-kwip.png", { type: "image/png" });

      if (
        typeof navigator.share === "function" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: routine.name });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "routine-kwip.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (err) {
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
      className="flex-1 text-center py-3 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? dict.sharing : dict.shareButton}
    </button>
  );
}
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 3: Commit**

```bash
git add src/components/routine/ShareButton.tsx
git commit -m "feat: ShareButton passes routine data directly to image API — no Supabase"
```

---

### Task 12: Delete dead code

Remove all server auth, database API routes, and Supabase client.

**Files to delete:**
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/routines/route.ts`
- `src/app/api/routines/[id]/route.ts`
- `src/app/api/share/routine/[id]/route.tsx` (replaced by `src/app/api/share/route.tsx`)
- `src/lib/supabase.ts`

**Step 1: Delete the files**

```bash
rm src/app/api/auth/[...nextauth]/route.ts
rm src/app/api/routines/route.ts
rm "src/app/api/routines/[id]/route.ts"
rm "src/app/api/share/routine/[id]/route.tsx"
rmdir src/app/api/share/routine 2>/dev/null || true
rmdir "src/app/api/routines/[id]" 2>/dev/null || true
rmdir src/app/api/routines 2>/dev/null || true
rmdir "src/app/api/auth/[...nextauth]" 2>/dev/null || true
rmdir src/app/api/auth 2>/dev/null || true
rm src/lib/supabase.ts
```

**Step 2: Verify build passes cleanly**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors. If there are import errors, trace them and remove stray imports.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove NextAuth, Supabase, and server routine API routes"
```

---

### Task 13: Final verification

**Step 1: Full production build**

```bash
npm run build
```

Expected: clean build, no errors or warnings about missing modules.

**Step 2: Manual smoke test checklist**

Start dev server and verify:
- [ ] Home page loads, profile icon visible (no Sign In button)
- [ ] Clicking profile icon goes to `/me` with empty state: "Routine của bạn sẽ được lưu tại đây."
- [ ] Clicking "Build My Routine" on any concern goes to `/routine/new` without login popup
- [ ] Build a routine, save → redirected to `/me`, routine appears in list
- [ ] Click routine → detail page shows products
- [ ] Click Share → image downloads or native share sheet opens
- [ ] Delete routine → removed from list
- [ ] Refresh `/me` → routines still there (persisted in localStorage)

**Step 3: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: final cleanup after localStorage migration"
```
