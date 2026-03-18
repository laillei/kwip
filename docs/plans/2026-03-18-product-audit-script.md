# Product Audit Script Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single `audit-products.ts` script that checks all active products for image quality, ingredient freshness, and Shopee direct links — auto-fixing what it can, flagging the rest, and notifying at session start.

**Architecture:** One script with 4 sequential checks per product. Checks 1+2 use `UNOFFICIAL_IMAGE_PATTERNS` and the Claude API (haiku model) respectively to validate images. Check 3 re-fetches Shopify products by brand and diffs ingredient lists by normalized title match. Check 4 uses `scrapeShopeeStore()` from `discover-vn.ts` to find direct Shopee product URLs. Results are written to `src/data/audit-log.json` and surfaced via the existing session notification hook.

**Tech Stack:** TypeScript, `@anthropic-ai/sdk` (new), Playwright (existing via discover-vn.ts), Supabase, existing pipeline utilities (`extractIngredients`, `matchIngredients`, `normalizeTitle`, `sleep`)

**Prerequisite:** The `feature/vn-discovery-pipeline` branch must be merged before implementing this — the audit script imports `scrapeShopeeStore` from `discover-vn.ts`.

---

### Task 1: Install Anthropic SDK + create audit log skeleton

**Files:**
- Modify: `package.json`
- Create: `src/data/audit-log.json`

**Step 1: Install the Anthropic SDK**

```bash
cd /Users/seongyeonhwang/Projects/Kwip && npm install @anthropic-ai/sdk
```

**Step 2: Create the initial empty audit log**

Create `src/data/audit-log.json`:
```json
{
  "lastRunAt": "",
  "lastNotifiedAt": "",
  "results": []
}
```

**Step 3: Verify TypeScript can import the SDK**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: no errors.

**Step 4: Commit**

```bash
git add package.json package-lock.json src/data/audit-log.json
git commit -m "feat: install @anthropic-ai/sdk, add audit log skeleton"
```

---

### Task 2: Create audit-products.ts

**Files:**
- Create: `scripts/pipeline/audit-products.ts`
- Modify: `package.json` (add script)

**Step 1: Read these files before writing** (for import paths and reusable logic)

- `scripts/pipeline/promote.ts` — for `UNOFFICIAL_IMAGE_PATTERNS`
- `scripts/pipeline/discover-vn.ts` — for `scrapeShopeeStore` signature
- `scripts/pipeline/extract-ingredients.ts` — for `extractIngredients`
- `scripts/pipeline/match-ingredients.ts` — for `matchIngredients`
- `scripts/pipeline/utils.ts` — for `normalizeTitle`, `sleep`, `today`
- `scripts/pipeline/brands.config.ts` — for `BRANDS`, `getBrand`
- `scripts/pipeline/discover.ts` — for `fetchShopifyProducts` (needed for ingredient freshness)

**Step 2: Create `scripts/pipeline/audit-products.ts`**

```typescript
/**
 * Product audit script — 4 checks per active product:
 *   1. Image URL source (unofficial domain → replace from Shopify)
 *   2. Image vision check via Claude API (mismatch → replace from Shopify)
 *   3. Ingredient freshness (>20% drift from Shopify → flag)
 *   4. Shopee direct link (search URL → replace with direct link from official store)
 *
 * Run manually: npm run pipeline:audit
 * Run in CI: nightly GitHub Actions after discover-shopify
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import { BRANDS, getBrand } from "./brands.config.js";
import { extractIngredients } from "./extract-ingredients.js";
import { matchIngredients } from "./match-ingredients.js";
import { normalizeTitle, sleep, today } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../src/data");
const logFile = join(dataDir, "audit-log.json");

// ── Types ─────────────────────────────────────────────────────────────

type CheckStatus = "ok" | "fixed" | "flagged" | "skipped";

interface AuditResult {
  slug: string;
  brand: string;
  checks: {
    imageSource: CheckStatus;
    imageVision: CheckStatus;
    ingredientFreshness: CheckStatus;
    shopeeLink: CheckStatus;
  };
  fixes: string[];
  flags: string[];
  auditedAt: string;
}

interface AuditLog {
  lastRunAt: string;
  lastNotifiedAt: string;
  results: AuditResult[];
}

// ── Unofficial image patterns (mirrors promote.ts) ────────────────────

const UNOFFICIAL_IMAGE_PATTERNS = [
  "oliveyoung.com",
  "hwahae.co.kr",
  "amazon.com",
  "holiholic.com",
  "thankyouskin.com",
  "masksheets.com",
  "cloudfront.net",
  "shopee",
  "lazada",
];

function isOfficialImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return !UNOFFICIAL_IMAGE_PATTERNS.some((p) => url.includes(p));
}

// ── Helpers ────────────────────────────────────────────────────────────

function readLog(): AuditLog {
  if (!existsSync(logFile)) {
    return { lastRunAt: "", lastNotifiedAt: "", results: [] };
  }
  return JSON.parse(readFileSync(logFile, "utf-8"));
}

function isDirectShopeeUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes("shopee.vn") &&
    !url.includes("search?") &&
    !url.includes("keyword=")
  );
}

// ── Check 1: Image URL source ─────────────────────────────────────────

async function checkImageSource(
  product: { slug: string; brand: string; image: string | null },
  supabase: ReturnType<typeof createClient>,
  brandShopifyImages: Map<string, string>
): Promise<{ status: CheckStatus; fix?: string }> {
  if (isOfficialImage(product.image)) return { status: "ok" };

  // Try to replace from Shopify brand image cache
  const replacement = brandShopifyImages.get(product.slug);
  if (replacement) {
    await supabase
      .from("products")
      .update({ image: replacement })
      .eq("slug", product.slug);
    return { status: "fixed", fix: `Image replaced: ${replacement}` };
  }

  return { status: "flagged" };
}

// ── Check 2: Image vision via Claude API ──────────────────────────────

async function checkImageVision(
  product: { slug: string; name: { en: string }; image: string | null; brand: string },
  anthropic: Anthropic,
  supabase: ReturnType<typeof createClient>,
  brandShopifyImages: Map<string, string>
): Promise<{ status: CheckStatus; description?: string; fix?: string }> {
  if (!product.image) return { status: "skipped" };

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: product.image },
            },
            {
              type: "text",
              text: `Does this image show the skincare product "${product.name.en}"? Answer YES or NO, then describe what you see in one sentence.`,
            },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";
    const matches = text.toUpperCase().startsWith("YES");

    if (matches) return { status: "ok", description: text };

    // Mismatch — try to replace from Shopify
    const replacement = brandShopifyImages.get(product.slug);
    if (replacement && replacement !== product.image) {
      await supabase
        .from("products")
        .update({ image: replacement })
        .eq("slug", product.slug);
      return {
        status: "fixed",
        description: text,
        fix: `Vision mismatch fixed: replaced with ${replacement}`,
      };
    }

    return { status: "flagged", description: text };
  } catch (err) {
    console.warn(`  [WARN] Vision check failed for ${product.slug}: ${err}`);
    return { status: "skipped" };
  }
}

// ── Check 3: Ingredient freshness ─────────────────────────────────────

async function checkIngredientFreshness(
  product: {
    slug: string;
    brand: string;
    ingredients: { ingredientId: string }[];
    name: { en: string };
  },
  shopifyProductsByBrand: Map<string, Array<{ title: string; handle: string; body_html: string | null }>>
): Promise<{ status: CheckStatus; details?: string }> {
  const brand = getBrand(product.brand);
  if (!brand) return { status: "skipped" };

  const shopifyProducts = shopifyProductsByBrand.get(brand.id) ?? [];
  const normName = normalizeTitle(product.name.en);

  // Find matching Shopify product by normalized title
  const match = shopifyProducts.find(
    (sp) => normalizeTitle(sp.title) === normName
  );
  if (!match) return { status: "skipped" };

  // Extract fresh ingredients from Shopify
  const freshRaw = await extractIngredients(brand, match.handle, match.body_html);
  if (!freshRaw || freshRaw.length === 0) return { status: "skipped" };

  // Match fresh ingredients
  const { matched: freshMatched } = matchIngredients(freshRaw);
  const currentIds = new Set(product.ingredients.map((i) => i.ingredientId));
  const freshIds = new Set(freshMatched.map((m) => m.ingredientId));

  const added = [...freshIds].filter((id) => !currentIds.has(id)).length;
  const removed = [...currentIds].filter((id) => !freshIds.has(id)).length;
  const totalChanges = added + removed;
  const maxSize = Math.max(currentIds.size, freshIds.size);
  const driftPct = maxSize > 0 ? totalChanges / maxSize : 0;

  if (driftPct > 0.2) {
    return {
      status: "flagged",
      details: `${Math.round(driftPct * 100)}% drift (${added} added, ${removed} removed)`,
    };
  }

  return { status: "ok" };
}

// ── Check 4: Shopee direct link ───────────────────────────────────────

async function checkShopeeLink(
  product: {
    slug: string;
    brand: string;
    name: { en: string };
    purchase: { shopee?: string };
  },
  shopeeProductsByBrand: Map<string, Array<{ name: string; url: string }>>,
  supabase: ReturnType<typeof createClient>
): Promise<{ status: CheckStatus; fix?: string }> {
  const shopeeUrl = product.purchase?.shopee ?? "";

  if (isDirectShopeeUrl(shopeeUrl)) return { status: "ok" };

  // Try to find direct URL from official store scrape
  const storeProducts = shopeeProductsByBrand.get(product.brand) ?? [];
  const normName = normalizeTitle(product.name.en);

  const match = storeProducts.find(
    (sp) => normalizeTitle(sp.name) === normName
  );

  if (match?.url) {
    await supabase
      .from("products")
      .update({ purchase: { ...product.purchase, shopee: match.url } })
      .eq("slug", product.slug);
    return { status: "fixed", fix: `Shopee link updated: ${match.url}` };
  }

  return { status: "flagged" };
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Product Audit ===\n");
  console.log(`Date: ${today()}\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

  if (!anthropic) {
    console.warn("[WARN] ANTHROPIC_API_KEY not set — skipping vision checks");
  }

  // Fetch all active products
  const { data: products, error } = await supabase
    .from("products")
    .select("slug, brand, name, image, ingredients, purchase")
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch products:", error.message);
    process.exit(1);
  }

  console.log(`Auditing ${products?.length ?? 0} active products\n`);

  // ── Pre-fetch: Shopify products per brand (for checks 2+3) ───────────
  console.log("Pre-fetching Shopify product data...");
  const shopifyProductsByBrand = new Map<
    string,
    Array<{ title: string; handle: string; body_html: string | null }>
  >();

  // Import here to avoid circular deps at module level
  const { discoverNewProducts } = await import("./discover.js");
  // We only need Shopify data for brands that have products in our DB
  const brandsInDb = new Set((products ?? []).map((p) => p.brand));

  for (const brand of BRANDS) {
    if (!brandsInDb.has(brand.id)) continue;
    if (!brand.productsJsonAvailable) continue;
    try {
      const { fetchShopifyProducts } = await import("./discover.js" as never) as {
        fetchShopifyProducts?: (domain: string) => Promise<Array<{ title: string; handle: string; body_html: string | null; images: { src: string }[] }>>;
      };
      // fetchShopifyProducts is not exported from discover.ts — use alternative approach below
    } catch { /* skip */ }
    await sleep(500);
  }

  // NOTE: fetchShopifyProducts is internal to discover.ts. We fetch via /products.json directly.
  for (const brand of BRANDS) {
    if (!brandsInDb.has(brand.id)) continue;
    if (!brand.productsJsonAvailable) continue;

    try {
      const res = await fetch(
        `https://${brand.shopifyDomain}/products.json?limit=250`,
        { headers: { "User-Agent": "Kwip-Pipeline/1.0 (audit)" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      shopifyProductsByBrand.set(brand.id, data.products ?? []);
      console.log(`  ${brand.displayName}: ${data.products?.length ?? 0} products`);
    } catch {
      console.warn(`  [WARN] Could not fetch Shopify data for ${brand.displayName}`);
    }
    await sleep(500);
  }

  // Build image lookup: slug → Shopify image URL
  const brandShopifyImages = new Map<string, string>();
  for (const [brandId, shopifyProducts] of shopifyProductsByBrand) {
    for (const sp of shopifyProducts) {
      const slug = `${brandId}-${sp.handle}`.replace(/[^a-z0-9-]/g, "-");
      const imgUrl = (sp as { images?: { src: string }[] }).images?.[0]?.src ?? null;
      if (imgUrl) brandShopifyImages.set(slug, imgUrl);
    }
  }

  // ── Pre-fetch: Shopee official store products (for check 4) ──────────
  console.log("\nPre-fetching Shopee store data...");
  const shopeeProductsByBrand = new Map<
    string,
    Array<{ name: string; url: string }>
  >();

  // Only scrape brands that have products with search URLs
  const brandsNeedingShopeeCheck = new Set(
    (products ?? [])
      .filter((p) => {
        const url = p.purchase?.shopee ?? "";
        return url && !isDirectShopeeUrl(url);
      })
      .map((p) => p.brand)
  );

  if (brandsNeedingShopeeCheck.size > 0) {
    const browser = await chromium.launch({ headless: true });

    for (const brand of BRANDS) {
      if (!brandsNeedingShopeeCheck.has(brand.id)) continue;
      if (!brand.shopeeStoreSlug) continue;

      try {
        // Re-use scraping logic inline (mirrors discover-vn.ts scrapeShopeeStore)
        const page = await browser.newPage();
        await page.goto(`https://shopee.vn/${brand.shopeeStoreSlug}`, {
          waitUntil: "networkidle",
          timeout: 30000,
        });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(2000);
        await page.waitForSelector('[data-sqe="item"]', { timeout: 15000 }).catch(() => {});

        const items = await page.evaluate(() => {
          const els = document.querySelectorAll('[data-sqe="item"]');
          return Array.from(els).map((el) => {
            const link = el.querySelector("a");
            const nameEl = el.querySelector('[data-sqe="name"]') || el.querySelector("div[class*=name]");
            return {
              name: nameEl?.textContent?.trim() ?? "",
              url: link ? `https://shopee.vn${link.getAttribute("href") ?? ""}` : "",
            };
          }).filter((p) => p.name && p.url);
        });

        shopeeProductsByBrand.set(brand.id, items);
        console.log(`  ${brand.displayName}: ${items.length} Shopee products`);
        await page.close();
      } catch (err) {
        console.warn(`  [WARN] Shopee scrape failed for ${brand.displayName}: ${err}`);
      }
      await sleep(2000);
    }

    await browser.close();
  }

  // ── Run checks per product ────────────────────────────────────────────
  console.log("\nRunning checks...\n");

  const results: AuditResult[] = [];
  let fixedCount = 0;
  let flaggedCount = 0;

  for (const product of products ?? []) {
    const result: AuditResult = {
      slug: product.slug,
      brand: product.brand,
      checks: {
        imageSource: "ok",
        imageVision: "ok",
        ingredientFreshness: "ok",
        shopeeLink: "ok",
      },
      fixes: [],
      flags: [],
      auditedAt: today(),
    };

    // Check 1: Image source
    const imgSourceResult = await checkImageSource(product, supabase, brandShopifyImages);
    result.checks.imageSource = imgSourceResult.status;
    if (imgSourceResult.fix) result.fixes.push(imgSourceResult.fix);
    if (imgSourceResult.status === "flagged") result.flags.push("Unofficial image URL");

    // Check 2: Image vision (only if source check passed)
    if (anthropic && product.image && result.checks.imageSource !== "flagged") {
      const visionResult = await checkImageVision(product, anthropic, supabase, brandShopifyImages);
      result.checks.imageVision = visionResult.status;
      if (visionResult.fix) result.fixes.push(visionResult.fix);
      if (visionResult.status === "flagged") {
        result.flags.push(`Vision mismatch: ${visionResult.description ?? ""}`);
      }
      await sleep(500); // Claude API rate limit
    } else {
      result.checks.imageVision = "skipped";
    }

    // Check 3: Ingredient freshness
    const freshResult = await checkIngredientFreshness(product, shopifyProductsByBrand);
    result.checks.ingredientFreshness = freshResult.status;
    if (freshResult.status === "flagged") {
      result.flags.push(`Ingredient drift: ${freshResult.details ?? ""}`);
    }

    // Check 4: Shopee direct link
    const shopeeResult = await checkShopeeLink(product, shopeeProductsByBrand, supabase);
    result.checks.shopeeLink = shopeeResult.status;
    if (shopeeResult.fix) result.fixes.push(shopeeResult.fix);
    if (shopeeResult.status === "flagged") result.flags.push("No direct Shopee link found");

    // Log result
    const hasIssues = result.fixes.length > 0 || result.flags.length > 0;
    if (hasIssues) {
      console.log(`  ${product.slug}`);
      result.fixes.forEach((f) => console.log(`    [FIXED] ${f}`));
      result.flags.forEach((f) => console.log(`    [FLAG] ${f}`));
      fixedCount += result.fixes.length;
      flaggedCount += result.flags.length;
    }

    if (hasIssues) results.push(result);
    await sleep(100);
  }

  // Write audit log
  const log = readLog();
  log.lastRunAt = today();
  // Keep only results from last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  log.results = [
    ...log.results.filter((r) => r.auditedAt >= cutoffStr),
    ...results,
  ];
  writeFileSync(logFile, JSON.stringify(log, null, 2));

  console.log(`\n--- Audit Summary ---`);
  console.log(`Products audited: ${products?.length ?? 0}`);
  console.log(`Auto-fixed:       ${fixedCount}`);
  console.log(`Flagged:          ${flaggedCount}`);

  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `audit_fixed=${fixedCount}\naudit_flagged=${flaggedCount}\n`
    );
  }
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
```

**Important note about `fetchShopifyProducts`:** The function is currently private in `discover.ts`. Before writing `audit-products.ts`, check if it needs to be exported. If so, add `export` to its declaration in `discover.ts`.

**Step 3: Export `fetchShopifyProducts` from discover.ts**

Read `scripts/pipeline/discover.ts`. Change:
```typescript
async function fetchShopifyProducts(
```
to:
```typescript
export async function fetchShopifyProducts(
```

Then simplify the Shopify pre-fetch section in `audit-products.ts` to use the import directly instead of the inline fetch. Replace the inline `/products.json` fetch loop with:

```typescript
import { fetchShopifyProducts } from "./discover.js";
// ...
const shopifyRaw = await fetchShopifyProducts(brand.shopifyDomain);
shopifyProductsByBrand.set(brand.id, shopifyRaw);
```

**Step 4: Add npm script to package.json**

```json
"pipeline:audit": "npx tsx scripts/pipeline/audit-products.ts"
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Fix any type errors before committing. Common ones: `product.purchase` type may need casting, `product.name` type is `{en: string, vi: string, ko: string}`.

**Step 6: Commit**

```bash
git add scripts/pipeline/audit-products.ts scripts/pipeline/discover.ts package.json
git commit -m "feat: add product audit script — image, ingredient freshness, Shopee link checks"
```

---

### Task 3: Add audit-products job to GitHub Actions

**Files:**
- Modify: `.github/workflows/product-discovery.yml`

**Step 1: Read the current workflow**

Read `.github/workflows/product-discovery.yml`.

**Step 2: Add `audit-products` job**

Add this new job after the existing three jobs. It runs in parallel with `discover-vn` and `verify-availability`:

```yaml
  # ── Job 4: Product quality audit ─────────────────────────────────────
  audit-products:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    needs: discover-shopify

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Install Playwright Chromium
        run: npx playwright install chromium --with-deps

      - name: Run product audit
        run: npx tsx scripts/pipeline/audit-products.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Commit updated audit log
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update product audit log [skip ci]"
          file_pattern: src/data/audit-log.json
```

**Step 3: Commit**

```bash
git add .github/workflows/product-discovery.yml
git commit -m "feat: add nightly product audit job to GitHub Actions"
```

**Note:** Add `ANTHROPIC_API_KEY` to your GitHub repository secrets (Settings → Secrets → Actions). Get the key from console.anthropic.com.

---

### Task 4: Extend session notification hook to surface audit flags

**Files:**
- Modify: `scripts/notify-vn-additions.sh`

**Step 1: Read the current script**

Read `scripts/notify-vn-additions.sh`.

**Step 2: Extend to also read audit-log.json**

Append this block to the end of `scripts/notify-vn-additions.sh` (after the existing `EOF` block):

```bash
# Also surface unfixed audit flags
AUDIT_LOG="src/data/audit-log.json"
if [ -f "$AUDIT_LOG" ]; then
node --input-type=module << 'AUDITEOF'
import { readFileSync, writeFileSync } from "fs";

const logFile = "src/data/audit-log.json";
const log = JSON.parse(readFileSync(logFile, "utf-8"));

const last = log.lastNotifiedAt || "";
const newFlags = log.results.filter(
  (r) => r.auditedAt > last && r.flags.length > 0
);

if (newFlags.length === 0) process.exit(0);

console.log(`\n--- Audit Flags: ${newFlags.length} products need review ---`);
for (const r of newFlags) {
  console.log(`  [${r.brand}] ${r.slug}`);
  r.flags.forEach((f) => console.log(`    ! ${f}`));
}
console.log("---\n");

log.lastNotifiedAt = new Date().toISOString().slice(0, 10);
writeFileSync(logFile, JSON.stringify(log, null, 2));
AUDITEOF
fi
```

**Step 3: Test the script**

```bash
bash scripts/notify-vn-additions.sh
```

Expected: silent (audit log empty or no new flags).

**Step 4: Commit**

```bash
git add scripts/notify-vn-additions.sh
git commit -m "feat: extend session hook to surface product audit flags"
```

---

## Execution Order

Tasks 1 → 2 → 3 → 4 (sequential — each depends on the previous).

## Post-Implementation

1. Add `ANTHROPIC_API_KEY` to GitHub repository secrets
2. Run manually to verify: `source .env.local && npm run pipeline:audit`
3. Expected first run: most products show `[ok]` for image source (already cleaned), many flagged for search Shopee URLs
