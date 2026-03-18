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
