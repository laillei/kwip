# Routine Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let authenticated users build, save, and share personal K-beauty routines from the concern view on home.

**Architecture:** Google OAuth via NextAuth.js v4 for auth, Supabase (PostgreSQL) for routine storage, new pages at `/[locale]/routine/new`, `/[locale]/me`, and `/[locale]/routine/[id]`. The home page gains a "Build My Routine" CTA when a concern is active that passes concern state into the builder via URL param.

**Tech Stack:** NextAuth.js v4, @supabase/supabase-js, existing Next.js 15 App Router + TypeScript + Tailwind CSS

---

## User Flow Recap

```
Home (select concern)
  → "Build My Routine" button
  → [if not logged in] Google Login modal
  → /[locale]/routine/new?concern=acne
  → Pick multiple products per routine step
  → Name + Save
  → /[locale]/me (My Routines)
  → View /[locale]/routine/[id]  (shareable)
  → Share PNG card
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install packages**

```bash
npm install next-auth @supabase/supabase-js
```

**Step 2: Verify install**

```bash
npm run build
```
Expected: Build succeeds (no new code yet, just deps added).

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add next-auth and supabase dependencies"
```

---

## Task 2: Environment Variables

**Files:**
- Create: `.env.local` (gitignored — do NOT commit)

**Step 1: Create `.env.local`**

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Google OAuth
# Get from: https://console.cloud.google.com → APIs → Credentials → Create OAuth 2.0 Client
# Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase
# Get from: https://supabase.com → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

**Step 2: Set up Google OAuth credentials**
- Go to https://console.cloud.google.com
- Create project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
- Application type: Web
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
- Copy Client ID and Client Secret into `.env.local`

**Step 3: Set up Supabase project**
- Go to https://supabase.com → New project
- Copy Project URL and service_role key into `.env.local`

**Step 4: Verify env is gitignored**

```bash
cat .gitignore | grep .env
```
Expected: `.env*.local` is listed. If not, add it.

---

## Task 3: Supabase Database Schema

**Files:**
- Create: `supabase/schema.sql` (for reference — run in Supabase SQL editor)

**Step 1: Create `supabase/schema.sql`**

```sql
-- Routines table
-- user_id matches the sub/email from NextAuth session
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  concern TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS routines_user_id_idx ON routines(user_id);

-- Row Level Security: users can only access their own routines
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used in API routes with service key)
-- No additional policies needed since we use service_role key server-side
```

**Step 2: Run schema in Supabase**
- Go to your Supabase project → SQL Editor
- Paste and run the contents of `supabase/schema.sql`
- Verify: Table Editor shows `routines` table with correct columns

**Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add supabase schema for routines"
```

---

## Task 4: Routine Type Definitions

**Files:**
- Create: `src/lib/types/routine.ts`
- Modify: `src/lib/types/index.ts`

**Step 1: Create `src/lib/types/routine.ts`**

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
  userId: string;
  userEmail: string;
  name: string;
  concern: Concern;
  products: RoutineProduct[];
  createdAt: string;
  updatedAt: string;
}

export type CreateRoutineInput = Omit<Routine, "id" | "createdAt" | "updatedAt">;
```

**Step 2: Export from `src/lib/types/index.ts`**

Add this line to the existing exports:

```typescript
export type { Routine, RoutineProduct, CreateRoutineInput } from "./routine";
```

**Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 4: Commit**

```bash
git add src/lib/types/routine.ts src/lib/types/index.ts
git commit -m "feat: add Routine type definitions"
```

---

## Task 5: Supabase Client Utility

**Files:**
- Create: `src/lib/supabase.ts`

**Step 1: Create `src/lib/supabase.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";

// Server-side only — uses service role key (bypasses RLS)
// Never import this in client components
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(url, key);
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase server client utility"
```

---

## Task 6: NextAuth Configuration

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/components/providers/AuthProvider.tsx`
- Modify: `src/app/[locale]/layout.tsx`

**Step 1: Create `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      // Expose user id (sub) on session for API route use
      if (session.user && token.sub) {
        (session.user as typeof session.user & { id: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: undefined, // use default NextAuth modal, no custom page needed
  },
});

export { handler as GET, handler as POST };
```

**Step 2: Create `src/components/providers/AuthProvider.tsx`**

```typescript
"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**Step 3: Modify `src/app/[locale]/layout.tsx`**

Add the import at the top:
```typescript
import AuthProvider from "@/components/providers/AuthProvider";
```

Wrap `{children}` with `<AuthProvider>`:
```typescript
<body className={`...`}>
  <AuthProvider>
    {children}
  </AuthProvider>
</body>
```

**Step 4: Verify dev server starts**

```bash
npm run dev
```
Expected: No errors. Visit http://localhost:3000/vi — page loads normally.

**Step 5: Verify auth endpoint**

Visit http://localhost:3000/api/auth/providers
Expected: JSON response listing "google" provider.

**Step 6: Commit**

```bash
git add src/app/api/auth src/components/providers/AuthProvider.tsx src/app/[locale]/layout.tsx
git commit -m "feat: add NextAuth with Google OAuth"
```

---

## Task 7: Routine API Routes

**Files:**
- Create: `src/app/api/routines/route.ts`
- Create: `src/app/api/routines/[id]/route.ts`

**Step 1: Create `src/app/api/routines/route.ts`**

```typescript
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { CreateRoutineInput } from "@/lib/types";

// GET /api/routines — list current user's routines
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/routines — create a new routine
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: Pick<CreateRoutineInput, "name" | "concern" | "products"> =
    await request.json();

  if (!body.name || !body.concern || !Array.isArray(body.products)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .insert({
      user_id: (session.user as typeof session.user & { id?: string }).id ?? session.user.email,
      user_email: session.user.email,
      name: body.name,
      concern: body.concern,
      products: body.products,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

**Step 2: Create `src/app/api/routines/[id]/route.ts`**

```typescript
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// GET /api/routines/[id] — get single routine (public for sharing)
export async function GET(
  _request: Request,
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// DELETE /api/routines/[id] — delete a routine (owner only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", id)
    .eq("user_email", session.user.email); // ensure ownership

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 4: Commit**

```bash
git add src/app/api/routines
git commit -m "feat: add routine CRUD API routes"
```

---

## Task 8: Dictionary Strings

**Files:**
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Add to `src/dictionaries/vi.json`**

Add after the `"home"` block:

```json
"routine": {
  "buildCta": "Xây dựng routine của bạn",
  "builderTitle": "Xây dựng Routine",
  "selectProducts": "Chọn sản phẩm cho mỗi bước",
  "namePlaceholder": "Đặt tên cho routine của bạn...",
  "saveButton": "Lưu Routine",
  "saving": "Đang lưu...",
  "loginRequired": "Đăng nhập để lưu routine",
  "loginWithGoogle": "Đăng nhập với Google",
  "myRoutines": "Routine của tôi",
  "noRoutines": "Bạn chưa có routine nào. Hãy bắt đầu từ trang chủ!",
  "shareButton": "Chia sẻ",
  "deleteButton": "Xoá",
  "backToHome": "← Trang chủ",
  "createdAt": "Đã tạo",
  "productsCount": "sản phẩm",
  "shareCardTagline": "Routine của tôi — được xây dựng dựa trên thành phần, không phải quảng cáo."
}
```

**Step 2: Add to `src/dictionaries/en.json`**

Add after the `"home"` block:

```json
"routine": {
  "buildCta": "Build My Routine",
  "builderTitle": "Build Your Routine",
  "selectProducts": "Select products for each step",
  "namePlaceholder": "Name your routine...",
  "saveButton": "Save Routine",
  "saving": "Saving...",
  "loginRequired": "Sign in to save your routine",
  "loginWithGoogle": "Sign in with Google",
  "myRoutines": "My Routines",
  "noRoutines": "You don't have any routines yet. Start from the home page!",
  "shareButton": "Share",
  "deleteButton": "Delete",
  "backToHome": "← Home",
  "createdAt": "Created",
  "productsCount": "products",
  "shareCardTagline": "My routine — built on ingredient science, not ads."
}
```

**Step 3: Update `src/lib/i18n.ts` if needed**

Open `src/lib/i18n.ts` and check how dictionaries are typed/loaded. If it uses `typeof` inference, no change needed. If it has a manual type, add the `routine` key.

**Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add src/dictionaries/
git commit -m "feat: add routine builder dictionary strings (vi + en)"
```

---

## Task 9: Auth Button Component + Header Update

**Files:**
- Create: `src/components/shared/AuthButton.tsx`
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Create `src/components/shared/AuthButton.tsx`**

```typescript
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface AuthButtonProps {
  locale: string;
}

export default function AuthButton({ locale }: AuthButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />;
  }

  if (session?.user) {
    return (
      <Link href={`/${locale}/me`} className="flex items-center gap-2">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "Profile"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-600">
            {session.user.name?.[0] ?? "U"}
          </div>
        )}
      </Link>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
    >
      Sign in
    </button>
  );
}
```

**Step 2: Add AuthButton to header in `src/app/[locale]/page.tsx`**

Add import at top:
```typescript
import AuthButton from "@/components/shared/AuthButton";
```

Add `<AuthButton locale={locale} />` inside the header's flex div, next to SearchButton:
```tsx
<div className="flex items-center gap-2">
  <SearchButton locale={locale} />
  <AuthButton locale={locale} />
  <Suspense>
    <LanguageSwitcher />
  </Suspense>
</div>
```

**Step 3: Verify dev server**

```bash
npm run dev
```
Expected: Profile icon (or "Sign in" link) appears in the header. Clicking "Sign in" triggers Google OAuth flow.

**Step 4: Commit**

```bash
git add src/components/shared/AuthButton.tsx src/app/[locale]/page.tsx
git commit -m "feat: add auth button to header"
```

---

## Task 10: "Build My Routine" CTA on Home

**Files:**
- Create: `src/components/home/BuildRoutineButton.tsx`
- Modify: `src/components/home/ConcernHub.tsx`

**Step 1: Create `src/components/home/BuildRoutineButton.tsx`**

```typescript
"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BuildRoutineButtonProps {
  locale: string;
  concern: string;
  label: string; // from dict.routine.buildCta
}

export default function BuildRoutineButton({
  locale,
  concern,
  label,
}: BuildRoutineButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  function handleClick() {
    if (!session) {
      // Sign in, then redirect to routine builder after auth
      signIn("google", {
        callbackUrl: `/${locale}/routine/new?concern=${concern}`,
      });
      return;
    }
    router.push(`/${locale}/routine/new?concern=${concern}`);
  }

  return (
    <button
      onClick={handleClick}
      className="w-full mt-4 py-3 px-4 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-700 transition-colors"
    >
      {label}
    </button>
  );
}
```

**Step 2: Modify `src/components/home/ConcernHub.tsx`**

Add import at top:
```typescript
import BuildRoutineButton from "./BuildRoutineButton";
```

Add `locale` prop usage and pass `dict.routine.buildCta` — update the `ConcernHubProps` dict type:
```typescript
dict: {
  emptyState: string;
  helpfulIngredients: string;
  concernPrompt: string;
  buildCta: string; // add this
};
```

Add `<BuildRoutineButton>` after `<IngredientHighlight>`, inside the `{hasSelection && ...}` block:
```tsx
{hasSelection && keyIngredients.length > 0 && (
  <>
    <IngredientHighlight ... />
    <BuildRoutineButton
      locale={locale}
      concern={selected!}
      label={dict.buildCta}
    />
  </>
)}
```

**Step 3: Update `src/app/[locale]/page.tsx`** to pass `buildCta` to ConcernHub dict:

```tsx
dict={{
  emptyState: dict.products.emptyState,
  helpfulIngredients: dict.home.helpfulIngredients,
  concernPrompt: dict.home.concernPrompt,
  buildCta: dict.routine.buildCta,
}}
```

**Step 4: Verify dev server**

```bash
npm run dev
```
Expected: "Xây dựng routine của bạn" button appears on home when a concern is selected. Clicking when logged out triggers Google sign-in. Clicking when logged in navigates to `/vi/routine/new?concern=acne`.

**Step 5: Commit**

```bash
git add src/components/home/BuildRoutineButton.tsx src/components/home/ConcernHub.tsx src/app/[locale]/page.tsx
git commit -m "feat: add Build My Routine CTA to concern view"
```

---

## Task 11: Routine Builder Page

**Files:**
- Create: `src/app/[locale]/routine/new/page.tsx`
- Create: `src/components/routine/RoutineBuilderClient.tsx`
- Create: `src/components/routine/RoutineStepPicker.tsx`

**Step 1: Create `src/app/[locale]/routine/new/page.tsx`**

```typescript
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
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
  const session = await getServerSession();

  // Server-side auth guard — redirect to home if not logged in
  if (!session?.user) {
    redirect(`/${locale}`);
  }

  if (!concern) {
    redirect(`/${locale}`);
  }

  const dict = await getDictionary(locale as Locale);
  const allProducts = products as Product[];

  // Products filtered to this concern
  const concernProducts = allProducts.filter((p) =>
    p.concerns.includes(concern as import("@/lib/types").Concern)
  );

  const concernData = concerns.find((c) => c.id === concern);

  return (
    <RoutineBuilderClient
      locale={locale}
      concern={concern}
      concernLabel={
        locale === "vi"
          ? (concernData?.label as { vi: string })?.vi
          : (concernData?.label as { en: string })?.en
      }
      products={concernProducts}
      dict={dict.routine}
    />
  );
}
```

**Step 2: Create `src/components/routine/RoutineStepPicker.tsx`**

```typescript
"use client";

import Image from "next/image";
import type { Product, Category } from "@/lib/types";

interface RoutineStepPickerProps {
  step: number;
  label: string;
  category: Category;
  products: Product[];
  selectedIds: string[];
  locale: string;
  onToggle: (productId: string) => void;
}

export default function RoutineStepPicker({
  step,
  label,
  category,
  products,
  selectedIds,
  locale,
  onToggle,
}: RoutineStepPickerProps) {
  const loc = locale as "vi" | "en";

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          {step}
        </span>
        <h3 className="text-sm font-semibold text-neutral-900">{label}</h3>
        {selectedIds.length > 0 && (
          <span className="text-xs text-emerald-600 font-medium">
            {selectedIds.length} selected
          </span>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          return (
            <button
              key={product.id}
              onClick={() => onToggle(product.id)}
              className={`flex-shrink-0 w-24 rounded-xl border-2 p-2 text-left transition-all ${
                isSelected
                  ? "border-neutral-900 bg-neutral-900"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <Image
                src={product.image}
                alt={product.name[loc] || product.name.vi}
                width={80}
                height={80}
                className="rounded-lg object-cover w-full aspect-square"
              />
              <p
                className={`text-xs mt-1 line-clamp-2 ${
                  isSelected ? "text-white" : "text-neutral-700"
                }`}
              >
                {product.name[loc] || product.name.vi}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Create `src/components/routine/RoutineBuilderClient.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import type { RoutineProduct } from "@/lib/types";
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
    Record<Category, string[]>
  >({} as Record<Category, string[]>);
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

  async function handleSave() {
    if (!routineName.trim() || totalSelected === 0) return;
    setSaving(true);

    const routineProducts: RoutineProduct[] = ROUTINE_STEPS.flatMap((step) =>
      (selectedByCategory[step.category] ?? []).map((productId) => ({
        productId,
        category: step.category,
        step: step.step,
      }))
    );

    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: routineName.trim(),
          concern,
          products: routineProducts,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      router.push(`/${locale}/me`);
    } catch {
      setSaving(false);
      alert("Failed to save routine. Please try again.");
    }
  }

  // Only show steps that have products for this concern
  const stepsWithProducts = ROUTINE_STEPS.filter((step) =>
    products.some((p) => p.category === step.category)
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
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
          <p className="text-sm text-neutral-500 mb-6">
            {concernLabel}
          </p>
        )}

        {/* Routine Name Input */}
        <input
          type="text"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder={dict.namePlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 mb-8"
        />

        {/* Step Pickers */}
        <div className="space-y-8">
          {stepsWithProducts.map((step) => (
            <RoutineStepPicker
              key={step.category}
              step={step.step}
              label={step.label[loc] ?? step.label.vi}
              category={step.category}
              products={products.filter((p) => p.category === step.category)}
              selectedIds={selectedByCategory[step.category] ?? []}
              locale={locale}
              onToggle={(productId) => toggleProduct(step.category, productId)}
            />
          ))}
        </div>

        {/* Save Button */}
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

**Step 4: Verify dev server**

```bash
npm run dev
```
Expected: Navigate to http://localhost:3000/vi/routine/new?concern=acne (while logged in) — builder page loads with product pickers per step.

**Step 5: Commit**

```bash
git add src/app/[locale]/routine src/components/routine
git commit -m "feat: add routine builder page with step pickers"
```

---

## Task 12: Personal Page (/me)

**Files:**
- Create: `src/app/[locale]/me/page.tsx`
- Create: `src/components/routine/RoutineCard.tsx`

**Step 1: Create `src/components/routine/RoutineCard.tsx`**

```typescript
"use client";

import Link from "next/link";
import type { Routine } from "@/lib/types";

interface RoutineCardProps {
  routine: Routine;
  locale: string;
  onDelete: (id: string) => void;
  dict: {
    shareButton: string;
    deleteButton: string;
    productsCount: string;
  };
}

export default function RoutineCard({
  routine,
  locale,
  onDelete,
  dict,
}: RoutineCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">
            {routine.name}
          </h3>
          <p className="text-sm text-neutral-500 mt-0.5">
            {routine.concern} · {routine.products.length} {dict.productsCount}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/${locale}/routine/${routine.id}`}
          className="flex-1 text-center py-2 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(routine.id)}
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
        >
          {dict.deleteButton}
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Create `src/app/[locale]/me/page.tsx`**

```typescript
"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Routine } from "@/lib/types";
import RoutineCard from "@/components/routine/RoutineCard";

export default function MePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}`);
      return;
    }
    if (status === "authenticated") {
      fetch("/api/routines")
        .then((r) => r.json())
        .then((data) => {
          setRoutines(data);
          setLoading(false);
        });
    }
  }, [status, locale, router]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this routine?")) return;
    await fetch(`/api/routines/${id}`, { method: "DELETE" });
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-sm text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {locale === "vi" ? "Routine của tôi" : "My Routines"}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {session?.user?.name}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="text-sm text-neutral-400 hover:text-neutral-600"
          >
            Sign out
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-400 mb-4">
              {locale === "vi"
                ? "Bạn chưa có routine nào."
                : "No routines yet."}
            </p>
            <Link
              href={`/${locale}`}
              className="text-sm font-medium text-neutral-900 underline"
            >
              {locale === "vi" ? "← Trang chủ" : "← Home"}
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
                  shareButton: "Share",
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

**Step 3: Verify**

```bash
npm run dev
```
Expected: Navigate to http://localhost:3000/vi/me — shows saved routines after login.

**Step 4: Commit**

```bash
git add src/app/[locale]/me src/components/routine/RoutineCard.tsx
git commit -m "feat: add personal page with saved routines"
```

---

## Task 13: Routine Detail Page (Shareable)

**Files:**
- Create: `src/app/[locale]/routine/[id]/page.tsx`

**Step 1: Create `src/app/[locale]/routine/[id]/page.tsx`**

```typescript
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import type { Routine } from "@/lib/types";

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
  const allProducts = products as Product[];

  // Resolve product objects from IDs, in routine step order
  const routineProducts = routine.products
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
        <p className="text-sm text-neutral-500 mb-8">{routine.concern}</p>

        {/* Product list by step */}
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

        {/* Share tagline */}
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

**Step 2: Verify**

```bash
npm run dev
```
Expected: Navigate to `/vi/routine/[some-id]` — shows the routine's products in step order. Works without login (public).

**Step 3: Commit**

```bash
git add src/app/[locale]/routine/[id]
git commit -m "feat: add shareable routine detail page"
```

---

## Task 14: Production Build Verification

**Step 1: Run full build**

```bash
npm run build
```
Expected: Build completes with no TypeScript errors and no Next.js warnings about missing env vars (note: env vars may warn in build but should not error).

**Step 2: Check all routes are generated**

Build output should show:
- `○ /[locale]/routine/new`
- `○ /[locale]/me`
- `○ /[locale]/routine/[id]`

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: routine builder + accounts complete — all pages building"
```

---

## Environment Checklist (Production)

When deploying to Vercel, add these to Vercel Environment Variables:

```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<same value as local>
GOOGLE_CLIENT_ID=<from Google Console>
GOOGLE_CLIENT_SECRET=<from Google Console>
NEXT_PUBLIC_SUPABASE_URL=<from Supabase>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase>
```

Also update Google OAuth authorized redirect URIs to include:
`https://your-domain.com/api/auth/callback/google`

---

## What This Delivers

| Feature | Route | Status |
|---|---|---|
| Google login | via NextAuth | Task 6 |
| Build My Routine CTA | Home (concern active) | Task 10 |
| Routine Builder | `/[locale]/routine/new` | Task 11 |
| My Routines | `/[locale]/me` | Task 12 |
| Shareable Routine | `/[locale]/routine/[id]` | Task 13 |
| Routine CRUD API | `/api/routines` | Task 7 |
