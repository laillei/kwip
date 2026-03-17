# Supabase Data Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move products, ingredients, and concerns from static JSON files in the repo to Supabase PostgreSQL, so data can be updated without redeploying.

**Architecture:** Three tables in Supabase (products, ingredients, concerns) with JSONB for localized/nested fields. All app queries go through a server-side Supabase client wrapped in Next.js `unstable_cache` for performance. The pipeline's `promote.ts` upserts to Supabase instead of writing `products.json`. JSON files are removed after migration is verified.

**Tech Stack:** Next.js 15 App Router, @supabase/supabase-js v2, PostgreSQL (Supabase), TypeScript

---

## Task 1: Create Supabase Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Write the SQL migration file**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Concerns table
CREATE TABLE IF NOT EXISTS concerns (
  id TEXT PRIMARY KEY,
  label JSONB NOT NULL,
  symptom JSONB NOT NULL,
  icon TEXT,
  key_ingredients TEXT[] NOT NULL DEFAULT '{}',
  weather_trigger JSONB
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name JSONB NOT NULL,
  description JSONB,
  effects JSONB NOT NULL DEFAULT '[]',
  ewg_grade TEXT,
  category TEXT NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  concerns TEXT[] NOT NULL DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]',
  popularity JSONB NOT NULL,
  purchase JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}'
);

-- Index for concern-based filtering (most common query)
CREATE INDEX IF NOT EXISTS products_concerns_idx ON products USING GIN (concerns);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products (brand);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_popularity_rank_idx ON products ((popularity->>'rank')::int);

-- RLS: Enable row level security
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS: Public read access (no auth required for browsing)
CREATE POLICY "Public read concerns" ON concerns FOR SELECT USING (true);
CREATE POLICY "Public read ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
```

**Step 2: Run the SQL in Supabase Dashboard**

1. Open https://supabase.com/dashboard/project/xtykqhhuckfttyxgnsfh
2. Click "SQL Editor" in the left sidebar
3. Paste the entire SQL above
4. Click "Run"
5. Verify: "SQL Editor" → check "Table Editor" — you should see 3 new tables

**Step 3: Commit the migration file**

```bash
git add supabase/migrations/001_initial_schema.sql
git commit -m "feat: add supabase schema for products, ingredients, concerns"
```

---

## Task 2: Create Supabase Server Client

**Files:**
- Create: `src/lib/supabase.ts`

**Step 1: Write the client utility**

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Uses service role key — NEVER import this in client components.
 * Only use in server components, API routes, and scripts.
 */
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
```

**Step 2: Verify build**

```bash
cd /Users/seongyeonhwang/Projects/Kwip && npm run build
```
Expected: clean build.

**Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add server-side supabase client utility"
```

---

## Task 3: Create and Run Seed Script

**Files:**
- Create: `scripts/seed-supabase.ts`

**Step 1: Write the seed script**

```typescript
// scripts/seed-supabase.ts
/**
 * One-time migration: load JSON files → Supabase.
 * Run with: npx tsx scripts/seed-supabase.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../src/data");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function readJson(filename: string) {
  return JSON.parse(readFileSync(join(dataDir, filename), "utf-8"));
}

async function seedTable(
  table: string,
  data: Record<string, unknown>[],
  transform?: (row: Record<string, unknown>) => Record<string, unknown>
) {
  const rows = transform ? data.map(transform) : data;
  console.log(`Seeding ${table}: ${rows.length} rows...`);

  // Upsert in batches of 100
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from(table).upsert(batch);
    if (error) {
      console.error(`Error seeding ${table} batch ${i / 100}:`, error.message);
      process.exit(1);
    }
    console.log(`  ✓ ${Math.min(i + 100, rows.length)}/${rows.length}`);
  }
  console.log(`✓ ${table} seeded`);
}

async function main() {
  console.log("Starting Supabase seed...\n");

  // Seed concerns (7 rows)
  const concerns = readJson("concerns.json");
  await seedTable("concerns", concerns, (c) => ({
    id: c.id,
    label: c.label,
    symptom: c.symptom,
    icon: c.icon,
    key_ingredients: c.keyIngredients,
    weather_trigger: c.weatherTrigger ?? null,
  }));

  // Seed ingredients
  const ingredients = readJson("ingredients.json");
  await seedTable("ingredients", ingredients, (i) => ({
    id: i.id,
    name: i.name,
    description: i.description ?? null,
    effects: i.effects ?? [],
    ewg_grade: i.ewgGrade ?? null,
    category: i.category,
  }));

  // Seed products
  const products = readJson("products.json");
  await seedTable("products", products, (p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    image: p.image ?? null,
    concerns: p.concerns ?? [],
    ingredients: p.ingredients ?? [],
    popularity: p.popularity,
    purchase: p.purchase ?? {},
    tags: p.tags ?? [],
  }));

  console.log("\n✓ Seed complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

**Step 2: Install dotenv for the script**

```bash
npm install --save-dev dotenv
```

**Step 3: Run the seed script**

```bash
cd /Users/seongyeonhwang/Projects/Kwip && npx tsx scripts/seed-supabase.ts
```

Expected output:
```
Starting Supabase seed...
Seeding concerns: 7 rows...
  ✓ 7/7
✓ concerns seeded
Seeding ingredients: ...
✓ ingredients seeded
Seeding products: 309 rows...
  ✓ 100/309
  ✓ 200/309
  ✓ 309/309
✓ products seeded

✓ Seed complete!
```

**Step 4: Verify in Supabase dashboard**

Open https://supabase.com/dashboard/project/xtykqhhuckfttyxgnsfh → Table Editor → products → should show 309 rows.

**Step 5: Commit**

```bash
git add scripts/seed-supabase.ts
git commit -m "feat: add supabase seed script for initial data migration"
```

---

## Task 4: Create Data Fetching Utilities with Caching

**Files:**
- Create: `src/lib/db.ts`

**Step 1: Write the cached data access layer**

```typescript
// src/lib/db.ts
/**
 * Cached Supabase data fetching.
 * Wraps queries in Next.js unstable_cache so Supabase is not
 * hit on every request — behaves like static JSON performance.
 */

import { unstable_cache } from "next/cache";
import { createServerSupabaseClient } from "./supabase";
import type { Product, Ingredient } from "./types";

// Cache tags for revalidation
export const CACHE_TAGS = {
  products: "products",
  ingredients: "ingredients",
  concerns: "concerns",
} as const;

// Revalidate every 5 minutes. Pipeline can also trigger revalidation.
const REVALIDATE = 300;

export const getAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("popularity->rank", { ascending: true });
    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return (data ?? []).map(dbProductToProduct);
  },
  ["all-products"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE }
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) return null;
    return dbProductToProduct(data);
  },
  ["product-by-slug"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE }
);

export const getAllProductSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug");
    if (error) throw new Error(`Failed to fetch slugs: ${error.message}`);
    return (data ?? []).map((r) => r.slug);
  },
  ["all-product-slugs"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE }
);

export const getAllIngredients = unstable_cache(
  async (): Promise<Ingredient[]> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("ingredients")
      .select("*");
    if (error) throw new Error(`Failed to fetch ingredients: ${error.message}`);
    return (data ?? []).map(dbIngredientToIngredient);
  },
  ["all-ingredients"],
  { tags: [CACHE_TAGS.ingredients], revalidate: REVALIDATE }
);

export const getAllConcerns = unstable_cache(
  async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("concerns")
      .select("*");
    if (error) throw new Error(`Failed to fetch concerns: ${error.message}`);
    return data ?? [];
  },
  ["all-concerns"],
  { tags: [CACHE_TAGS.concerns], revalidate: REVALIDATE }
);

export const getConcernById = unstable_cache(
  async (id: string) => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("concerns")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },
  ["concern-by-id"],
  { tags: [CACHE_TAGS.concerns], revalidate: REVALIDATE }
);

// DB row → app type converters
// Supabase stores snake_case; our types use camelCase

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbProductToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    image: row.image ?? "",
    concerns: row.concerns ?? [],
    ingredients: row.ingredients ?? [],
    popularity: row.popularity,
    purchase: row.purchase ?? {},
    tags: row.tags ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbIngredientToIngredient(row: any): Ingredient {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? { vi: "", en: "" },
    effects: row.effects ?? [],
    ewgGrade: row.ewg_grade ?? undefined,
    category: row.category,
  };
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat: add cached supabase data access layer"
```

---

## Task 5: Replace JSON Imports in Home Page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Read the file**

Read: `src/app/[locale]/page.tsx`

**Step 2: Replace imports and data fetching**

Remove:
```typescript
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import ingredients from "@/data/ingredients.json";
import type { Product, Ingredient } from "@/lib/types";
```

Add:
```typescript
import { getAllProducts, getAllIngredients, getAllConcerns } from "@/lib/db";
import type { Ingredient } from "@/lib/types";
```

Replace the data loading block (currently filters products and maps concerns) with:
```typescript
const [rawProducts, rawIngredients, rawConcerns] = await Promise.all([
  getAllProducts(),
  getAllIngredients(),
  getAllConcerns(),
]);

const allProducts = rawProducts.filter((p) => {
  const name = (p.name.en || p.name.vi || "").toLowerCase();
  return (
    !name.includes("[deal]") &&
    !name.includes("bundle") &&
    !name.includes("2-pack") &&
    !name.includes("3-pack") &&
    !name.includes(" kit")
  );
});

const concernData = rawConcerns.map((c) => ({
  id: c.id as import("@/lib/types").Concern,
  label: t(c.label, loc),
  icon: c.icon,
  symptom: t(c.symptom, loc),
  keyIngredientIds: c.key_ingredients,  // note: snake_case from DB
}));
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: replace JSON imports with supabase queries in home page"
```

---

## Task 6: Replace JSON Imports in Product Detail Page

**Files:**
- Modify: `src/app/[locale]/products/[slug]/page.tsx`

**Step 1: Read the file**

Read: `src/app/[locale]/products/[slug]/page.tsx`

**Step 2: Replace imports**

Remove:
```typescript
import products from "@/data/products.json";
import ingredientsData from "@/data/ingredients.json";
import type { Product, Ingredient } from "@/lib/types";
```

Add:
```typescript
import { getProductBySlug, getAllProductSlugs, getAllIngredients } from "@/lib/db";
import type { Ingredient } from "@/lib/types";
```

Replace `generateStaticParams`:
```typescript
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}
```

Replace data loading in the page function:
```typescript
const [product, allIngredients] = await Promise.all([
  getProductBySlug(slug),
  getAllIngredients(),
]);
if (!product) notFound();
```

Replace `ingredientMap` creation:
```typescript
const ingredientMap = new Map(
  allIngredients.map((i) => [i.id, i as Ingredient])
);
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/[locale]/products/[slug]/page.tsx
git commit -m "feat: replace JSON imports with supabase queries in product detail page"
```

---

## Task 7: Replace JSON Imports in Share APIs

**Files:**
- Modify: `src/app/api/share/route.tsx`
- Modify: `src/app/api/share-concern/route.tsx`

**Step 1: Read both files**

Read both files to understand current import patterns.

**Step 2: Update `share/route.tsx`**

Remove: `import allProducts from "@/data/products.json";`

These are API routes (Node.js runtime), so they can use async functions. Wrap the GET handler to fetch products:

```typescript
import { createServerSupabaseClient } from "@/lib/supabase";

// In GET handler, replace the static import with:
const supabase = createServerSupabaseClient();
const { data: productsData } = await supabase.from("products").select("*");
const products = (productsData ?? []) as Product[];
```

Note: don't use `unstable_cache` in API routes — the route itself is dynamic. Direct Supabase query is fine here since share cards are generated infrequently.

**Step 3: Update `share-concern/route.tsx`**

Same pattern — replace imports with direct Supabase queries for `allProducts`, `allIngredients`, `allConcerns`.

```typescript
import { createServerSupabaseClient } from "@/lib/supabase";

// In GET handler:
const supabase = createServerSupabaseClient();
const [productsRes, ingredientsRes, concernRes] = await Promise.all([
  supabase.from("products").select("*"),
  supabase.from("ingredients").select("*"),
  supabase.from("concerns").select("*").eq("id", concernId).single(),
]);

if (!concernRes.data) return new Response("Concern not found", { status: 404 });

const products = (productsRes.data ?? []) as Product[];
const ingredients = (ingredientsRes.data ?? []) as Ingredient[];
const concern = concernRes.data;
// Note: concern.key_ingredients (snake_case from DB)
```

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/app/api/share/route.tsx src/app/api/share-concern/route.tsx
git commit -m "feat: replace JSON imports with supabase queries in share APIs"
```

---

## Task 8: Replace JSON Imports in Routine Builder

**Files:**
- Modify: `src/app/[locale]/routine/new/page.tsx`

**Step 1: Read the file**

Read: `src/app/[locale]/routine/new/page.tsx`

**Step 2: Replace imports**

Remove: `import products from "@/data/products.json";`
Remove: `import concerns from "@/data/concerns.json";`

Add:
```typescript
import { getAllProducts, getAllConcerns } from "@/lib/db";
```

Replace data loading:
```typescript
const [allProductsRaw, allConcernsRaw] = await Promise.all([
  getAllProducts(),
  getAllConcerns(),
]);

const allProducts = allProductsRaw.filter((p) => {
  const name = (p.name.en || p.name.vi || "").toLowerCase();
  return (
    !name.includes("[deal]") &&
    !name.includes("bundle") &&
    !name.includes("2-pack") &&
    !name.includes("3-pack") &&
    !name.includes(" kit")
  );
});

const concernData = allConcernsRaw.find((c) => c.id === concern);
const concernLabel =
  locale === "vi" ? concernData?.label?.vi : concernData?.label?.en;
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/[locale]/routine/new/page.tsx
git commit -m "feat: replace JSON imports with supabase queries in routine builder"
```

---

## Task 9: Update Pipeline promote.ts to Write to Supabase

**Files:**
- Modify: `scripts/pipeline/promote.ts`

**Step 1: Read the current promote.ts**

Read: `scripts/pipeline/promote.ts`

**Step 2: Add Supabase upsert after writing products.json**

The pipeline currently:
1. Reads staging file
2. Filters by confidence
3. Merges into products.json
4. Writes products.json

New behavior: keep writing products.json (as backup/fallback), AND upsert to Supabase.

Add at the top of the file:
```typescript
import { createClient } from "@supabase/supabase-js";
```

After `writeFileSync(productsPath, ...)` and before the PR body generation, add:

```typescript
// Upsert to Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const rows = cleanProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    image: p.image ?? null,
    concerns: p.concerns ?? [],
    ingredients: p.ingredients ?? [],
    popularity: p.popularity,
    purchase: p.purchase ?? {},
    tags: p.tags ?? [],
  }));

  const { error } = await supabase.from("products").upsert(rows);
  if (error) {
    console.error("Supabase upsert failed:", error.message);
    // Don't exit — products.json was already written successfully
  } else {
    console.log(`Supabase updated: ${rows.length} products upserted`);
  }
} else {
  console.log("Supabase env vars not set — skipping DB upsert");
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add scripts/pipeline/promote.ts
git commit -m "feat: update pipeline to upsert products to supabase after promote"
```

---

## Task 10: Remove JSON Files and Clean Up

**Files:**
- Delete: `src/data/products.json`
- Delete: `src/data/ingredients.json`
- Delete: `src/data/concerns.json`
- Check: any remaining imports of these files

**Step 1: Search for any remaining imports**

```bash
grep -r "data/products.json\|data/ingredients.json\|data/concerns.json" src/ scripts/ --include="*.ts" --include="*.tsx"
```

Fix any remaining imports found (follow the same pattern as previous tasks).

**Step 2: Verify build passes without JSON files**

```bash
npm run build
```

If build fails, check the error and fix remaining JSON imports.

**Step 3: Delete the JSON files**

```bash
rm src/data/products.json src/data/ingredients.json src/data/concerns.json
```

**Step 4: Run build again to confirm**

```bash
npm run build
```

Expected: clean build with 0 JSON import errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove static JSON data files — data now served from supabase"
```

**Step 6: Push**

```bash
git push
```
