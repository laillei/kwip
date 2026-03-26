/**
 * Product audit script — 4 checks per active product:
 *   1. Image URL source (unofficial domain → replace from Shopify)
 *   2. Image vision check via Claude API (mismatch → replace from Shopify)
 *   3. Ingredient freshness (>20% drift from Shopify → flag for review)
 *   4. Shopee direct link (search URL → replace with direct link from official store)
 *
 * Run manually:  npm run pipeline:audit
 * Run in CI:     nightly GitHub Actions (audit-products job)
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import { BRANDS, getBrand } from "./brands.config.js";
import { fetchShopifyProducts } from "./discover.js";
import { extractIngredients } from "./extract-ingredients.js";
import { matchIngredients } from "./match-ingredients.js";
import { normalizeTitle, sleep, today } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../logs");
const logFile = join(dataDir, "audit-log.json");

// ── Types ──────────────────────────────────────────────────────────────

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB rows have no static shape
type DbProduct = Record<string, any>;

// ── Constants ──────────────────────────────────────────────────────────

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

function isDirectShopeeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("shopee.vn") &&
    !url.includes("search?") &&
    !url.includes("keyword=")
  );
}

function readLog(): AuditLog {
  if (!existsSync(logFile)) {
    return { lastRunAt: "", lastNotifiedAt: "", results: [] };
  }
  return JSON.parse(readFileSync(logFile, "utf-8"));
}

// ── Check 1: Image URL source ──────────────────────────────────────────

async function checkImageSource(
  product: DbProduct,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pipeline script; no Supabase DB schema defined
  supabase: SupabaseClient<any, any, any>,
  shopifyImageBySlug: Map<string, string>
): Promise<{ status: CheckStatus; fix?: string }> {
  if (isOfficialImage(product.image)) return { status: "ok" };

  const replacement = shopifyImageBySlug.get(product.slug);
  if (replacement) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pipeline script; Supabase schema not typed
    await (supabase.from("products") as any).update({ image: replacement }).eq("slug", product.slug);
    return { status: "fixed", fix: `Image replaced with official: ${replacement}` };
  }

  return { status: "flagged" };
}

// ── Check 2: Image vision via Claude API ───────────────────────────────

async function checkImageVision(
  product: DbProduct,
  anthropic: Anthropic,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pipeline script; no Supabase DB schema defined
  supabase: SupabaseClient<any, any, any>,
  shopifyImageBySlug: Map<string, string>
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
            { type: "image", source: { type: "url", url: product.image } },
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
    const replacement = shopifyImageBySlug.get(product.slug);
    if (replacement && replacement !== product.image) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pipeline script; Supabase schema not typed
      await (supabase.from("products") as any).update({ image: replacement }).eq("slug", product.slug);
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

// ── Check 3: Ingredient freshness ──────────────────────────────────────

async function checkIngredientFreshness(
  product: DbProduct,
  shopifyProductsByBrand: Map<
    string,
    Array<{ title: string; handle: string; body_html: string | null }>
  >
): Promise<{ status: CheckStatus; details?: string }> {
  const brand = getBrand(product.brand);
  if (!brand) return { status: "skipped" };

  const shopifyProducts = shopifyProductsByBrand.get(brand.id) ?? [];
  const normName = normalizeTitle(product.name.en);
  const match = shopifyProducts.find((sp) => normalizeTitle(sp.title) === normName);
  if (!match) return { status: "skipped" };

  const freshRaw = await extractIngredients(brand, match.handle, match.body_html);
  if (!freshRaw || freshRaw.length === 0) return { status: "skipped" };

  const { matched: freshMatched } = matchIngredients(freshRaw);
  const currentIds = new Set<string>(
    (product.ingredients ?? []).map((i: { ingredientId: string }) => i.ingredientId)
  );
  const freshIds = new Set(freshMatched.map((m) => m.ingredientId));

  const added = [...freshIds].filter((id) => !currentIds.has(id)).length;
  const removed = [...currentIds].filter((id) => !freshIds.has(id)).length;
  const maxSize = Math.max(currentIds.size, freshIds.size);
  const driftPct = maxSize > 0 ? (added + removed) / maxSize : 0;

  if (driftPct > 0.2) {
    return {
      status: "flagged",
      details: `${Math.round(driftPct * 100)}% drift (${added} added, ${removed} removed)`,
    };
  }

  return { status: "ok" };
}

// ── Check 4: Shopee direct link ────────────────────────────────────────

async function checkShopeeLink(
  product: DbProduct,
  shopeeProductsByBrand: Map<string, Array<{ name: string; url: string }>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pipeline script; no Supabase DB schema defined
  supabase: SupabaseClient<any, any, any>
): Promise<{ status: CheckStatus; fix?: string }> {
  const shopeeUrl = product.purchase?.shopee ?? "";
  if (isDirectShopeeUrl(shopeeUrl)) return { status: "ok" };

  const storeProducts = shopeeProductsByBrand.get(product.brand) ?? [];
  const normName = normalizeTitle(product.name.en);
  const match = storeProducts.find((sp) => normalizeTitle(sp.name) === normName);

  if (match?.url) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pipeline script; Supabase schema not typed
    await (supabase.from("products") as any).update({ purchase: { ...product.purchase, shopee: match.url } }).eq("slug", product.slug);
    return { status: "fixed", fix: `Shopee link updated: ${match.url}` };
  }

  return { status: "flagged" };
}

// ── Main ───────────────────────────────────────────────────────────────

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
  if (!anthropic) console.warn("[WARN] ANTHROPIC_API_KEY not set — skipping vision checks\n");

  // Fetch all active products
  const { data: products, error } = await supabase
    .from("products")
    .select("slug, brand, name, image, ingredients, purchase")
    .eq("is_active", true);

  if (error) { console.error("Failed to fetch products:", error.message); process.exit(1); }
  console.log(`Auditing ${products?.length ?? 0} active products\n`);

  // ── Pre-fetch: Shopify products per brand ────────────────────────────
  console.log("Pre-fetching Shopify data...");
  const shopifyProductsByBrand = new Map<
    string,
    Array<{ title: string; handle: string; body_html: string | null; images?: { src: string }[] }>
  >();
  const brandsInDb = new Set((products ?? []).map((p) => p.brand));

  for (const brand of BRANDS) {
    if (!brandsInDb.has(brand.id) || !brand.productsJsonAvailable) continue;
    try {
      const shopifyProducts = await fetchShopifyProducts(brand.shopifyDomain);
      shopifyProductsByBrand.set(brand.id, shopifyProducts);
      console.log(`  ${brand.displayName}: ${shopifyProducts.length} products`);
    } catch {
      console.warn(`  [WARN] Could not fetch Shopify data for ${brand.displayName}`);
    }
    await sleep(500);
  }

  // Build image lookup: product slug → Shopify image URL
  const shopifyImageBySlug = new Map<string, string>();
  for (const [brandId, shopifyProducts] of shopifyProductsByBrand) {
    for (const sp of shopifyProducts) {
      const slug = `${brandId}-${sp.handle}`;
      const imgUrl = sp.images?.[0]?.src ?? null;
      if (imgUrl) shopifyImageBySlug.set(slug, imgUrl);
    }
  }

  // ── Pre-fetch: Shopee official store products ────────────────────────
  console.log("\nPre-fetching Shopee store data...");
  const shopeeProductsByBrand = new Map<string, Array<{ name: string; url: string }>>();
  const brandsNeedingShopee = new Set(
    (products ?? [])
      .filter((p) => !isDirectShopeeUrl(p.purchase?.shopee))
      .map((p) => p.brand)
  );

  if (brandsNeedingShopee.size > 0) {
    const browser = await chromium.launch({ headless: true });

    for (const brand of BRANDS) {
      if (!brandsNeedingShopee.has(brand.id) || !brand.shopeeStoreSlug) continue;
      try {
        const page = await browser.newPage();
        await page.goto(`https://shopee.vn/${brand.shopeeStoreSlug}`, {
          waitUntil: "networkidle",
          timeout: 30000,
        });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(2000);
        await page.waitForSelector('[data-sqe="item"]', { timeout: 15000 }).catch(() => {});

        const items = await page.evaluate(() =>
          Array.from(document.querySelectorAll('[data-sqe="item"]')).map((el) => ({
            name: (el.querySelector('[data-sqe="name"]') || el.querySelector("div[class*=name]"))?.textContent?.trim() ?? "",
            url: el.querySelector("a") ? `https://shopee.vn${el.querySelector("a")!.getAttribute("href") ?? ""}` : "",
          })).filter((p) => p.name && p.url)
        );

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

  // ── Run checks per product ───────────────────────────────────────────
  console.log("\nRunning checks...\n");
  const results: AuditResult[] = [];
  let fixedCount = 0;
  let flaggedCount = 0;

  for (const product of products ?? []) {
    const result: AuditResult = {
      slug: product.slug,
      brand: product.brand,
      checks: { imageSource: "ok", imageVision: "ok", ingredientFreshness: "ok", shopeeLink: "ok" },
      fixes: [],
      flags: [],
      auditedAt: today(),
    };

    // Check 1: Image source
    const c1 = await checkImageSource(product, supabase, shopifyImageBySlug);
    result.checks.imageSource = c1.status;
    if (c1.fix) result.fixes.push(c1.fix);
    if (c1.status === "flagged") result.flags.push("Unofficial image URL — no Shopify replacement found");

    // Check 2: Image vision (skip if source already flagged)
    if (anthropic && product.image && c1.status !== "flagged") {
      const c2 = await checkImageVision(product, anthropic, supabase, shopifyImageBySlug);
      result.checks.imageVision = c2.status;
      if (c2.fix) result.fixes.push(c2.fix);
      if (c2.status === "flagged") result.flags.push(`Vision mismatch: ${c2.description ?? ""}`);
      await sleep(300);
    } else {
      result.checks.imageVision = "skipped";
    }

    // Check 3: Ingredient freshness
    const c3 = await checkIngredientFreshness(product, shopifyProductsByBrand);
    result.checks.ingredientFreshness = c3.status;
    if (c3.status === "flagged") result.flags.push(`Ingredient drift: ${c3.details ?? ""}`);

    // Check 4: Shopee direct link
    const c4 = await checkShopeeLink(product, shopeeProductsByBrand, supabase);
    result.checks.shopeeLink = c4.status;
    if (c4.fix) result.fixes.push(c4.fix);
    if (c4.status === "flagged") result.flags.push("No direct Shopee link found on official store");

    const hasIssues = result.fixes.length > 0 || result.flags.length > 0;
    if (hasIssues) {
      console.log(`  ${product.slug}`);
      result.fixes.forEach((f) => console.log(`    [FIXED] ${f}`));
      result.flags.forEach((f) => console.log(`    [FLAG]  ${f}`));
      fixedCount += result.fixes.length;
      flaggedCount += result.flags.length;
      results.push(result);
    }

    await sleep(100);
  }

  // Write audit log (keep last 30 days)
  const log = readLog();
  log.lastRunAt = today();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  log.results = [...log.results.filter((r) => r.auditedAt >= cutoffStr), ...results];
  writeFileSync(logFile, JSON.stringify(log, null, 2));

  console.log(`\n--- Audit Summary ---`);
  console.log(`Products audited: ${products?.length ?? 0}`);
  console.log(`Auto-fixed:       ${fixedCount}`);
  console.log(`Flagged:          ${flaggedCount}`);

  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    appendFileSync(process.env.GITHUB_OUTPUT, `audit_fixed=${fixedCount}\naudit_flagged=${flaggedCount}\n`);
  }
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
