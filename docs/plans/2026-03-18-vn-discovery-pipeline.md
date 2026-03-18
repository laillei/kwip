# VN Discovery Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add nightly Shopee VN + Lazada VN official brand store discovery, DB rot prevention via `isActive` flag, and Claude session notifications for newly discovered products.

**Architecture:** Extend `brands.config.ts` with VN store slugs → new `discover-vn.ts` scrapes official brand stores using Playwright (Shopee/Lazada are JS-rendered SPAs) → new `verify-products.ts` pings purchase URLs nightly and auto-archives dead products → DB migration adds `isActive` filtering to all app queries → GitHub Actions changes from weekly to nightly and adds two new jobs → Claude `UserPromptSubmit` hook surfaces new discoveries at session start.

**Tech Stack:** TypeScript, Supabase, Playwright (new dependency for JS-rendered scraping), GitHub Actions, existing cheerio/fetch pipeline

---

### Task 1: DB Migration — add isActive + availability fields

**Files:**
- Create: `supabase/migrations/002_product_availability.sql`
- Modify: `src/lib/db.ts`

**Step 1: Write the migration SQL**

Create `supabase/migrations/002_product_availability.sql`:

```sql
-- supabase/migrations/002_product_availability.sql

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_verified_at DATE,
  ADD COLUMN IF NOT EXISTS unavailable_since DATE;

-- Index for active product filtering (most queries will use this)
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products (is_active);
```

**Step 2: Apply migration to Supabase**

Go to Supabase dashboard → SQL Editor → paste and run the migration SQL.

Verify in Table Editor that `products` now has 3 new columns: `is_active`, `last_verified_at`, `unavailable_since`.

**Step 3: Update db.ts to filter isActive = true**

In `src/lib/db.ts`, add `.eq("is_active", true)` to two queries:

`getAllProducts` (line 22 area):
```typescript
const { data, error } = await supabase
  .from("products")
  .select("*")
  .eq("is_active", true)
  .order("popularity->rank", { ascending: true });
```

`getAllProductSlugs` (line 50 area):
```typescript
const { data, error } = await supabase
  .from("products")
  .select("slug")
  .eq("is_active", true);
```

Note: `getProductBySlug` intentionally does NOT get this filter — archived products remain viewable by direct URL.

**Step 4: Verify build**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

**Step 5: Commit**

```bash
git add supabase/migrations/002_product_availability.sql src/lib/db.ts
git commit -m "feat: add isActive + availability fields, filter inactive products from app"
```

---

### Task 2: brands.config.ts — add VN store fields

**Files:**
- Modify: `scripts/pipeline/brands.config.ts`

**Step 1: Add fields to BrandConfig interface**

In `scripts/pipeline/brands.config.ts`, add two optional fields to `BrandConfig` (after the existing fields, before the closing `}`):

```typescript
/** Shopee VN official store URL slug (e.g. "torriden_official" from shopee.vn/torriden_official) */
shopeeStoreSlug?: string;
/** Lazada VN LazMall store URL slug (e.g. "torriden-vn" from lazada.vn/shop/torriden-vn/) */
lazadaStoreSlug?: string;
```

**Step 2: Manually research and populate store slugs**

For each brand, visit shopee.vn and lazada.vn manually:
- Shopee: search brand name → open "Gian hàng chính hãng" (Official Store) → copy the URL slug after `shopee.vn/`
- Lazada: search brand name → open LazMall store → copy the slug after `lazada.vn/shop/`

Only add fields you've confirmed with your own eyes. Leave undefined if no official store found.

Example for Torriden (fill in actual slugs after researching):
```typescript
{
  id: "torriden",
  displayName: "Torriden",
  shopifyDomain: "torriden.us",
  discoverySource: "shopify",
  productsJsonAvailable: true,
  ingredientSource: "body_html",
  ingredientSelector: "",
  excludeHandlePatterns: [/bundle/, /set$/, /gift/, /kit$/],
  shopeeStoreSlug: "torriden_official",  // replace with actual slug
  lazadaStoreSlug: "torriden-vn",        // replace with actual slug
},
```

Priority brands to research (highest VN traction): COSRX, Anua, Beauty of Joseon, Torriden, Round Lab, SKIN1004, Some By Mi, Innisfree, Laneige.

**Step 3: Commit**

```bash
git add scripts/pipeline/brands.config.ts
git commit -m "feat: add shopeeStoreSlug + lazadaStoreSlug to brands config"
```

---

### Task 3: Install Playwright and create discover-vn.ts

**Files:**
- Create: `scripts/pipeline/discover-vn.ts`
- Create: `src/data/vn-additions-log.json` (initial empty log)
- Modify: `package.json`

Shopee VN and Lazada VN are JS-rendered SPAs — `fetch()` + Cheerio returns empty shells. Playwright (headless Chromium) is required to fully render the pages.

**Step 1: Install Playwright**

```bash
npm install --save-dev playwright
npx playwright install chromium
```

**Step 2: Create the initial empty log file**

Create `src/data/vn-additions-log.json`:
```json
{
  "lastRunAt": "",
  "lastNotifiedAt": "",
  "additions": []
}
```

**Step 3: Create discover-vn.ts**

Create `scripts/pipeline/discover-vn.ts`:

```typescript
/**
 * VN Discovery Pipeline — Shopee VN + Lazada VN official brand stores.
 *
 * Shopee and Lazada are JS-rendered SPAs — uses Playwright (headless Chromium).
 * WARNING: DOM selectors are fragile; if scraping breaks, update selectors by
 * inspecting the live page in Chrome DevTools.
 *
 * Output: appends new discoveries to src/data/vn-additions-log.json
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { chromium, type Browser } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { BRANDS } from "./brands.config.js";
import { normalizeTitle, today, sleep } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../src/data");
const logFile = join(dataDir, "vn-additions-log.json");

interface VnDiscovery {
  name: string;
  brand: string;
  shopeeUrl: string | null;
  lazadaUrl: string | null;
  discoveredAt: string;
}

interface VnAdditionsLog {
  lastRunAt: string;
  lastNotifiedAt: string;
  additions: VnDiscovery[];
}

function readLog(): VnAdditionsLog {
  if (!existsSync(logFile)) {
    return { lastRunAt: "", lastNotifiedAt: "", additions: [] };
  }
  return JSON.parse(readFileSync(logFile, "utf-8"));
}

/**
 * Scrape official brand store page on Shopee VN.
 * Selector: '[data-sqe="item"]' — as of 2026-03, update if Shopee changes their DOM.
 */
async function scrapeShopeeStore(
  browser: Browser,
  storeSlug: string
): Promise<{ name: string; url: string }[]> {
  const page = await browser.newPage();
  try {
    await page.goto(`https://shopee.vn/${storeSlug}`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Scroll to trigger lazy-load
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(2000);

    await page
      .waitForSelector('[data-sqe="item"]', { timeout: 15000 })
      .catch(() => {});

    return await page.evaluate(() => {
      const items = document.querySelectorAll('[data-sqe="item"]');
      return Array.from(items)
        .map((el) => {
          const link = el.querySelector("a");
          const nameEl =
            el.querySelector('[data-sqe="name"]') ||
            el.querySelector("div[class*=name]");
          return {
            name: nameEl?.textContent?.trim() ?? "",
            url: link
              ? `https://shopee.vn${link.getAttribute("href") ?? ""}`
              : "",
          };
        })
        .filter((p) => p.name.length > 0 && p.url.length > 0);
    });
  } catch (err) {
    console.warn(`  [WARN] Shopee scrape failed for ${storeSlug}: ${err}`);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Scrape LazMall official brand store page on Lazada VN.
 * Selector: '[data-qa-locator="product-item"]' — update if Lazada changes their DOM.
 */
async function scrapeLazadaStore(
  browser: Browser,
  storeSlug: string
): Promise<{ name: string; url: string }[]> {
  const page = await browser.newPage();
  try {
    await page.goto(`https://www.lazada.vn/shop/${storeSlug}/`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(2000);

    await page
      .waitForSelector('[data-qa-locator="product-item"]', { timeout: 15000 })
      .catch(() => {});

    return await page.evaluate(() => {
      const items = document.querySelectorAll(
        '[data-qa-locator="product-item"]'
      );
      return Array.from(items)
        .map((el) => {
          const link = el.querySelector("a");
          const nameEl = el.querySelector('[class*="title"]');
          return {
            name: nameEl?.textContent?.trim() ?? "",
            url: link?.href ?? "",
          };
        })
        .filter((p) => p.name.length > 0 && p.url.length > 0);
    });
  } catch (err) {
    console.warn(`  [WARN] Lazada scrape failed for ${storeSlug}: ${err}`);
    return [];
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("=== VN Discovery Pipeline ===\n");
  console.log(`Date: ${today()}\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  // Load existing product names from DB for dedup
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: existingRows } = await supabase
    .from("products")
    .select("name");
  const existingNormTitles = new Set(
    (existingRows ?? []).map((r: { name: { en: string } }) =>
      normalizeTitle(r.name.en)
    )
  );
  console.log(`Loaded ${existingNormTitles.size} existing product titles for dedup\n`);

  const browser = await chromium.launch({ headless: true });
  const newDiscoveries: VnDiscovery[] = [];

  for (const brand of BRANDS) {
    if (!brand.shopeeStoreSlug && !brand.lazadaStoreSlug) continue;

    console.log(`  [VN] ${brand.displayName}`);

    if (brand.shopeeStoreSlug) {
      const products = await scrapeShopeeStore(browser, brand.shopeeStoreSlug);
      console.log(`    Shopee: ${products.length} products on store page`);

      let newCount = 0;
      for (const p of products) {
        const norm = normalizeTitle(p.name);
        if (!existingNormTitles.has(norm)) {
          newDiscoveries.push({
            name: p.name,
            brand: brand.id,
            shopeeUrl: p.url,
            lazadaUrl: null,
            discoveredAt: today(),
          });
          existingNormTitles.add(norm); // prevent cross-platform dupes
          newCount++;
        }
      }
      console.log(`    ${newCount} new products not yet in Kwip`);
    }

    if (brand.lazadaStoreSlug) {
      const products = await scrapeLazadaStore(browser, brand.lazadaStoreSlug);
      console.log(`    Lazada: ${products.length} products on store page`);

      let newCount = 0;
      for (const p of products) {
        const norm = normalizeTitle(p.name);
        if (!existingNormTitles.has(norm)) {
          newDiscoveries.push({
            name: p.name,
            brand: brand.id,
            shopeeUrl: null,
            lazadaUrl: p.url,
            discoveredAt: today(),
          });
          existingNormTitles.add(norm);
          newCount++;
        }
      }
      console.log(`    ${newCount} new products not yet in Kwip`);
    }

    await sleep(2000); // rate limit between brands
  }

  await browser.close();

  // Append to log
  const log = readLog();
  log.lastRunAt = today();
  log.additions = [...log.additions, ...newDiscoveries];
  writeFileSync(logFile, JSON.stringify(log, null, 2));

  console.log(`\nVN discovery complete: ${newDiscoveries.length} new products found`);
  console.log(`Total log entries: ${log.additions.length}`);

  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `vn_new=${newDiscoveries.length}\n`
    );
  }
}

main().catch((err) => {
  console.error("VN discovery failed:", err);
  process.exit(1);
});
```

**Step 4: Add npm script to package.json**

In `package.json`, inside the `"scripts"` block, add:
```json
"pipeline:discover-vn": "npx tsx scripts/pipeline/discover-vn.ts"
```

**Step 5: Test locally**

```bash
source .env.local && npm run pipeline:discover-vn
```

Expected: script runs, outputs per-brand counts, writes/updates `src/data/vn-additions-log.json`.

If selectors return 0 products for a brand you know has an official store, open that store in Chrome DevTools → Inspector → identify the correct selector → update in the script.

**Step 6: Commit**

```bash
git add scripts/pipeline/discover-vn.ts src/data/vn-additions-log.json package.json
git commit -m "feat: add VN discovery script — Playwright scraping for Shopee/Lazada brand stores"
```

---

### Task 4: verify-products.ts — nightly availability check

**Files:**
- Create: `scripts/pipeline/verify-products.ts`
- Modify: `package.json`

Pings each active product's purchase URLs and auto-archives products unavailable for >14 days. Only checks direct product URLs, not search fallback URLs (search URLs always return 200 and would give false positives).

**Step 1: Create verify-products.ts**

Create `scripts/pipeline/verify-products.ts`:

```typescript
/**
 * Nightly product availability verification.
 *
 * Checks each active product's direct purchase URLs (Shopee + Lazada).
 * Skips search/catalog fallback URLs — they always return 200.
 * Products unavailable for > 14 days are auto-archived (is_active = false).
 */

import { createClient } from "@supabase/supabase-js";
import { sleep, today } from "./utils.js";

const ARCHIVE_AFTER_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const FETCH_HEADERS = {
  "User-Agent": "Kwip-Pipeline/1.0 (availability-check)",
};

/** Returns false for search/catalog URLs that always return 200. */
function isDirectProductUrl(url: string): boolean {
  if (!url) return false;
  return (
    !url.includes("search?") &&
    !url.includes("catalog/?") &&
    !url.includes("/search/") &&
    !url.includes("keyword=") &&
    !url.includes("query=")
  );
}

async function isUrlAvailable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
    // 405 = HEAD not allowed but resource exists; 200-399 = available
    return res.ok || res.status === 405;
  } catch {
    return false;
  }
}

async function main() {
  console.log("=== Product Availability Verification ===\n");
  console.log(`Date: ${today()}\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, purchase, unavailable_since")
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch products:", error.message);
    process.exit(1);
  }

  console.log(`Verifying ${products?.length ?? 0} active products...\n`);

  let archived = 0;
  let flagged = 0;
  let cleared = 0;
  let skipped = 0;

  for (const product of products ?? []) {
    const purchase = product.purchase ?? {};
    const directUrls = [purchase.shopee, purchase.lazada].filter(
      isDirectProductUrl
    );

    if (directUrls.length === 0) {
      skipped++;
      continue; // only search URLs — can't verify
    }

    const availability = await Promise.all(directUrls.map(isUrlAvailable));
    const anyAvailable = availability.some(Boolean);

    if (!anyAvailable) {
      const unavailableSince = product.unavailable_since
        ? new Date(product.unavailable_since)
        : null;

      if (!unavailableSince) {
        // First time unavailable — mark start date
        await supabase
          .from("products")
          .update({ unavailable_since: today() })
          .eq("id", product.id);
        console.log(`  [FLAGGED] ${product.slug} — first unavailable today`);
        flagged++;
      } else {
        const daysUnavailable = Math.floor(
          (Date.now() - unavailableSince.getTime()) / DAY_MS
        );

        if (daysUnavailable >= ARCHIVE_AFTER_DAYS) {
          await supabase
            .from("products")
            .update({ is_active: false })
            .eq("id", product.id);
          console.log(
            `  [ARCHIVED] ${product.slug} (unavailable ${daysUnavailable}d)`
          );
          archived++;
        } else {
          console.log(
            `  [PENDING] ${product.slug} (unavailable ${daysUnavailable}d, archives at ${ARCHIVE_AFTER_DAYS}d)`
          );
        }
      }
    } else if (product.unavailable_since) {
      // Back online — clear flag
      await supabase
        .from("products")
        .update({ unavailable_since: null, last_verified_at: today() })
        .eq("id", product.id);
      console.log(`  [RESTORED] ${product.slug} — back online`);
      cleared++;
    } else {
      // Normal — just update last verified
      await supabase
        .from("products")
        .update({ last_verified_at: today() })
        .eq("id", product.id);
    }

    await sleep(300); // rate limit — don't hammer Shopee/Lazada
  }

  console.log(`\n--- Verification Summary ---`);
  console.log(`Archived:  ${archived}`);
  console.log(`Flagged:   ${flagged}`);
  console.log(`Restored:  ${cleared}`);
  console.log(`Skipped (no direct URLs): ${skipped}`);

  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `archived=${archived}\nflagged=${flagged}\n`
    );
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
```

**Step 2: Add npm script**

In `package.json`, add:
```json
"pipeline:verify": "npx tsx scripts/pipeline/verify-products.ts"
```

**Step 3: Test locally**

```bash
source .env.local && npm run pipeline:verify
```

Expected: outputs per-product verification results. First run will show all products as "verified" with updated `last_verified_at`. No archiving yet (products haven't been unavailable long enough).

**Step 4: Commit**

```bash
git add scripts/pipeline/verify-products.ts package.json
git commit -m "feat: add nightly availability verification — auto-archive products unavailable 14+ days"
```

---

### Task 5: GitHub Actions — nightly schedule + new jobs

**Files:**
- Modify: `.github/workflows/product-discovery.yml`

**Step 1: Replace workflow with nightly + 3 jobs**

Replace the entire contents of `.github/workflows/product-discovery.yml`:

```yaml
name: Product Discovery

on:
  schedule:
    # Run nightly at 15:00 UTC (22:00 Vietnam time / ICT)
    - cron: "0 15 * * *"
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  # ── Job 1: Shopify brand store discovery (existing pipeline) ──────────
  discover-shopify:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Run Shopify discovery pipeline
        id: pipeline
        run: npx tsx scripts/pipeline/run.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Check for new products
        id: check
        run: |
          if [ -d "src/data/staging" ] && ls src/data/staging/discovered-*.json 1>/dev/null 2>&1; then
            echo "has_products=true" >> $GITHUB_OUTPUT
          else
            echo "has_products=false" >> $GITHUB_OUTPUT
          fi

      - name: Promote staged products
        if: steps.check.outputs.has_products == 'true'
        run: npx tsx scripts/pipeline/promote.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Validate data
        if: steps.check.outputs.has_products == 'true'
        run: npm run validate-data

      - name: Read PR body
        if: steps.check.outputs.has_products == 'true'
        id: pr_body
        run: |
          if [ -f "src/data/staging/pr-body.md" ]; then
            echo "body_file=src/data/staging/pr-body.md" >> $GITHUB_OUTPUT
          fi

      - name: Clean staging files
        if: steps.check.outputs.has_products == 'true'
        run: rm -rf src/data/staging

      - name: Create Pull Request
        if: steps.check.outputs.has_products == 'true'
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: "feat: auto-discover new K-beauty products"
          title: "feat: auto-discovered K-beauty products"
          body-path: ${{ steps.pr_body.outputs.body_file }}
          branch: auto/product-discovery
          delete-branch: true
          labels: auto-discovery

  # ── Job 2: VN marketplace discovery (Shopee + Lazada) ────────────────
  discover-vn:
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

      - name: Run VN discovery
        run: npx tsx scripts/pipeline/discover-vn.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Commit updated VN additions log
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update VN additions log [skip ci]"
          file_pattern: src/data/vn-additions-log.json

  # ── Job 3: Nightly availability verification ──────────────────────────
  verify-availability:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: discover-shopify

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Run availability verification
        run: npx tsx scripts/pipeline/verify-products.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

Note: `stefanzweifel/git-auto-commit-action@v5` needs to be added — it's a well-known action for committing file changes from within a workflow.

**Step 2: Commit**

```bash
git add .github/workflows/product-discovery.yml
git commit -m "feat: change pipeline to nightly + add VN discovery + verification jobs"
```

---

### Task 6: Claude session hook — VN additions notification

**Files:**
- Create: `scripts/notify-vn-additions.sh`
- Modify: `.claude/settings.local.json`

This hook runs at the start of every Claude Code session. If `vn-additions-log.json` has new entries since the last session, it prints them. Then it updates `lastNotifiedAt` so it doesn't repeat.

**Step 1: Create the notification script**

Create `scripts/notify-vn-additions.sh`:

```bash
#!/bin/bash
# Show VN product discoveries since last Claude session.
# Called by UserPromptSubmit hook — must be fast and silent on no news.

LOG_FILE="src/data/vn-additions-log.json"
if [ ! -f "$LOG_FILE" ]; then
  exit 0
fi

node --input-type=module << 'EOF'
import { readFileSync, writeFileSync } from "fs";

const logFile = "src/data/vn-additions-log.json";
const log = JSON.parse(readFileSync(logFile, "utf-8"));

const last = log.lastNotifiedAt || "";
const newOnes = log.additions.filter((a) => a.discoveredAt > last);

if (newOnes.length === 0) process.exit(0);

console.log(`\n--- VN Discovery: ${newOnes.length} new products since last session ---`);
for (const p of newOnes) {
  const platform = p.shopeeUrl ? "Shopee" : "Lazada";
  console.log(`  + [${p.brand}] ${p.name} (${platform})`);
}
console.log("---\n");

// Mark as notified
log.lastNotifiedAt = new Date().toISOString().slice(0, 10);
writeFileSync(logFile, JSON.stringify(log, null, 2));
EOF
```

Make it executable:
```bash
chmod +x scripts/notify-vn-additions.sh
```

**Step 2: Add UserPromptSubmit hook to settings.local.json**

The existing `.claude/settings.local.json` has only a `"permissions"` key. Add a `"hooks"` key alongside it:

```json
{
  "permissions": {
    "allow": [ ... existing allow list ... ]
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/notify-vn-additions.sh"
          }
        ]
      }
    ]
  }
}
```

**Step 3: Test the hook**

```bash
bash scripts/notify-vn-additions.sh
```

Expected: silent if log is empty or all entries already notified. Prints a summary if there are new entries.

**Step 4: Commit**

```bash
git add scripts/notify-vn-additions.sh .claude/settings.local.json
git commit -m "feat: add Claude session hook for VN additions notification"
```

---

## Execution Order

Tasks 1, 2, and 6 can proceed in any order. Tasks 3 and 4 depend on Task 2 (brands config fields). Task 5 depends on Tasks 3 and 4 (scripts must exist before workflow calls them).

Recommended order: 1 → 2 → 3 → 4 → 5 → 6
