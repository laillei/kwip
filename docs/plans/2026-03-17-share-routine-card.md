# Share Routine Card Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the Share Concern button from the home page and redesign the share routine image card to feel aspirational while staying on-brand.

**Architecture:** Two isolated changes — (1) delete ShareConcernButton from ConcernHub and clean up its dict keys, (2) rewrite the `/api/share` image layout to add a key ingredients line and improve visual polish. No new components, no new routes.

**Tech Stack:** Next.js 15 App Router, TypeScript, `next/og` ImageResponse, Supabase (for concern → ingredient INCI lookup)

---

### Task 1: Remove ShareConcernButton from home page

**Files:**
- Modify: `src/components/home/ConcernHub.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/dictionaries/vi.json`
- Modify: `src/dictionaries/en.json`

**Step 1: Remove from ConcernHub.tsx**

In `src/components/home/ConcernHub.tsx`:

Remove the import:
```diff
- import ShareConcernButton from "./ShareConcernButton";
```

Remove `shareConcern` from the `dict` interface (line 44):
```diff
  dict: {
    emptyState: string;
    helpfulIngredients: string;
    concernPrompt: string;
    buildCta: string;
-   shareConcern: string;
  };
```

Remove the `<ShareConcernButton>` JSX and its wrapping fragment. Current code around lines 138–144:
```diff
- <>
    <IngredientHighlight ... />
    <BuildRoutineButton ... />
-   <ShareConcernButton
-     concern={selected!}
-     locale={locale}
-     label={dict.shareConcern}
-   />
- </>
+ <>
+   <IngredientHighlight ... />
+   <BuildRoutineButton ... />
+ </>
```

(The `<>` fragment can be kept or removed — keep it if IngredientHighlight and BuildRoutineButton are siblings that need it, otherwise simplify.)

**Step 2: Remove from page.tsx**

In `src/app/[locale]/page.tsx` around line 93, remove the `shareConcern` line from the dict passed to `ConcernHub`:
```diff
  dict={{
    emptyState: dict.products.emptyState,
    helpfulIngredients: dict.home.helpfulIngredients,
    concernPrompt: dict.home.concernPrompt,
    buildCta: dict.routine.buildCta,
-   shareConcern: dict.home.shareConcern,
  }}
```

**Step 3: Remove from dictionaries**

In `src/dictionaries/vi.json`, remove:
```diff
- "shareConcern": "Chia sẻ routine của bạn"
```

In `src/dictionaries/en.json`, remove:
```diff
- "shareConcern": "Share your routine"
```

(Be careful with trailing commas — JSON does not allow trailing commas.)

**Step 4: Verify build**

```bash
npm run build
```

Expected: clean build, no TypeScript errors about missing `shareConcern` prop.

**Step 5: Commit**

```bash
git add src/components/home/ConcernHub.tsx "src/app/[locale]/page.tsx" src/dictionaries/vi.json src/dictionaries/en.json
git commit -m "feat: remove Share Concern button from home — routine share is the one moment"
```

---

### Task 2: Redesign share routine image card

**Files:**
- Modify: `src/app/api/share/route.tsx`

**Context:** This route receives a base64url-encoded JSON payload `{ name, concern, products }`. It currently fetches products from Supabase to resolve product details. The redesign adds: (1) fetching the concern's key ingredients from Supabase, (2) a new visual layout.

**Step 1: Add ingredient lookup after the existing products fetch**

Current code fetches products:
```ts
const supabase = createServerSupabaseClient();
const { data: productsData } = await supabase.from("products").select("*");
const products = (productsData ?? []) as Product[];
```

After that block, add:
```ts
// Fetch concern's key ingredient IDs
const { data: concernData } = await supabase
  .from("concerns")
  .select("key_ingredients")
  .eq("id", payload.concern)
  .single();

const keyIngredientIds: string[] = concernData?.key_ingredients ?? [];

// Fetch INCI names for up to 3 key ingredients
let ingredientsLine = "";
if (keyIngredientIds.length > 0) {
  const { data: ingredientData } = await supabase
    .from("ingredients")
    .select("name")
    .in("id", keyIngredientIds.slice(0, 3));
  if (ingredientData && ingredientData.length > 0) {
    ingredientsLine = (ingredientData as { name: { inci: string } }[])
      .map((i) => i.name.inci)
      .join(" · ");
  }
}
```

**Step 2: Replace the ImageResponse JSX entirely**

Replace the entire `return new ImageResponse(...)` call with:

```tsx
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
      {/* Top: header + product list */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Kwip overline */}
        <div style={{ display: "flex", marginBottom: "40px" }}>
          <span style={{ fontSize: 28, fontWeight: 400, color: "#A3A3A3" }}>
            Kwip
          </span>
        </div>

        {/* Hero: routine name + concern + ingredients */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "48px",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#171717",
              lineHeight: 1.1,
              wordBreak: "break-all",
            }}
          >
            {payload.name}
          </span>
          <span style={{ fontSize: 28, fontWeight: 400, color: "#A3A3A3" }}>
            {"Routine cho da " +
              (CONCERN_LABELS[payload.concern] ?? payload.concern).toLowerCase()}
          </span>
          {ingredientsLine ? (
            <span style={{ fontSize: 26, fontWeight: 400, color: "#A3A3A3" }}>
              {ingredientsLine}
            </span>
          ) : null}
        </div>

        {/* Product list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            borderRadius: 28,
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
                    gap: 32,
                    padding: "36px 40px",
                  }}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      width={112}
                      height={112}
                      style={{
                        borderRadius: 20,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 112,
                        height: 112,
                        borderRadius: 20,
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
                      gap: 6,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{ fontSize: 24, fontWeight: 400, color: "#A3A3A3" }}
                    >
                      {CATEGORY_NAMES[rp.category] ?? rp.category}
                    </span>
                    <span
                      style={{ fontSize: 32, fontWeight: 700, color: "#171717" }}
                    >
                      {rp.product.name.vi ?? rp.product.name.en}
                    </span>
                    <span
                      style={{ fontSize: 24, fontWeight: 400, color: "#A3A3A3" }}
                    >
                      {rp.product.brand}
                    </span>
                  </div>
                </div>
                {index < routineProducts.length - 1 ? (
                  <div
                    style={{
                      height: 1,
                      backgroundColor: "#F5F5F5",
                      marginLeft: 40,
                      marginRight: 40,
                      display: "flex",
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: "#171717" }}>
          Kwip
        </span>
        <span style={{ fontSize: 22, fontWeight: 400, color: "#A3A3A3" }}>
          Được xây dựng dựa trên thành phần, không phải quảng cáo.
        </span>
        <span style={{ fontSize: 22, fontWeight: 400, color: "#A3A3A3" }}>
          kwip.app
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
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: clean build. The `/api/share` route is dynamic so it won't prerender — that's correct.

**Step 4: Commit**

```bash
git add src/app/api/share/route.tsx
git commit -m "feat: redesign share routine image card — ingredients line, larger images, polished layout"
```
