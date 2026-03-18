/**
 * Discover new products from brand stores.
 * Supports two discovery sources:
 *   - Shopify: /products.json API
 *   - Listing: Scrape product listing pages (WordPress/WooCommerce)
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import { type BrandConfig, BRANDS } from "./brands.config.js";
import { generateSlug, normalizeTitle, sleep } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../src/data");

/** Shopify product from /products.json API. */
export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string | null;
  product_type: string;
  images: { src: string }[];
  variants: { price: string }[];
}

/** A discovered product candidate before enrichment. */
export interface DiscoveredProduct {
  brand: BrandConfig;
  shopifyHandle: string;
  title: string;
  bodyHtml: string | null;
  productType: string;
  imageUrl: string | null;
  slug: string;
}

const FETCH_HEADERS = {
  "User-Agent": "Kwip-Pipeline/1.0 (product-discovery)",
};

// ─── Shopify Discovery ───────────────────────────────────────────────

export async function fetchShopifyProducts(
  domain: string
): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];
  let page = 1;

  while (true) {
    const url = `https://${domain}/products.json?limit=250&page=${page}`;
    const res = await fetch(url, {
      headers: { ...FETCH_HEADERS, Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(`  [WARN] ${domain} returned ${res.status} on page ${page}`);
      break;
    }

    const data = await res.json();
    const products: ShopifyProduct[] = data.products || [];

    if (products.length === 0) break;
    all.push(...products);

    if (products.length < 250) break;
    page++;
    await sleep(500);
  }

  return all;
}

function discoverFromShopify(
  brand: BrandConfig,
  shopifyProducts: ShopifyProduct[],
  existingSlugs: Set<string>,
  existingTitles: Set<string>
): DiscoveredProduct[] {
  const discovered: DiscoveredProduct[] = [];

  for (const sp of shopifyProducts) {
    if (shouldExclude(sp.handle, brand.excludeHandlePatterns)) continue;

    const slug = generateSlug(brand.id, sp.title);
    const normTitle = normalizeTitle(sp.title);

    if (existingSlugs.has(slug) || existingTitles.has(normTitle)) continue;

    discovered.push({
      brand,
      shopifyHandle: sp.handle,
      title: sp.title,
      bodyHtml: sp.body_html,
      productType: sp.product_type,
      imageUrl: sp.images?.[0]?.src || null,
      slug,
    });
  }

  return discovered;
}

// ─── Listing Page Discovery ─────────────────────────────────────────

/**
 * Scrape product listing pages to find individual product URLs.
 * Handles pagination (e.g. /product/page/2/, /product/page/3/).
 */
async function fetchProductUrlsFromListing(
  brand: BrandConfig
): Promise<string[]> {
  const urls = new Set<string>();
  const basePath = brand.listingPath || "/";
  let page = 1;
  const maxPages = 10;

  while (page <= maxPages) {
    const pagePath = page === 1 ? basePath : `${basePath}page/${page}/`;
    const listingUrl = `https://${brand.shopifyDomain}${pagePath}`;

    const res = await fetch(listingUrl, {
      headers: { ...FETCH_HEADERS, Accept: "text/html" },
    });

    if (!res.ok) {
      if (page === 1) {
        console.warn(`  [WARN] Listing page returned ${res.status}: ${listingUrl}`);
      }
      break; // No more pages
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const selector = brand.listingLinkSelector || "a[href]";
    let foundOnPage = 0;

    $(selector).each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      let fullUrl = href.startsWith("http")
        ? href
        : `https://${brand.shopifyDomain}${href}`;

      if (brand.productUrlPattern && !brand.productUrlPattern.test(fullUrl)) return;

      // Skip pagination URLs and the listing page itself
      if (/\/page\/\d+\/?$/.test(fullUrl)) return;

      // Strip query params and normalize for deduplication
      try { fullUrl = new URL(fullUrl).origin + new URL(fullUrl).pathname; } catch { /* keep as-is */ }
      // Ensure trailing slash consistency
      if (!fullUrl.endsWith("/")) fullUrl += "/";

      if (!urls.has(fullUrl)) {
        urls.add(fullUrl);
        foundOnPage++;
      }
    });

    if (foundOnPage === 0) break; // No new products → end of pagination
    page++;
    await sleep(500);
  }

  return [...urls];
}

/**
 * Fetch a product page and extract the title from HTML.
 */
async function fetchPageInfo(
  url: string
): Promise<{ title: string; html: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { ...FETCH_HEADERS, Accept: "text/html" },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Try common product title selectors
    const title =
      $("h1.product_title").text().trim() ||
      $("h1.product-title").text().trim() ||
      $('[class*="product"] h1').text().trim() ||
      $("h1").first().text().trim() ||
      $("title").text().split("|")[0].split("–")[0].trim();

    return { title, html };
  } catch {
    return null;
  }
}

/**
 * Extract a fallback title from a product URL slug.
 * e.g. "/product/wonder-releaf-centella-serum/" → "Wonder Releaf Centella Serum"
 */
function titleFromUrl(url: string): string {
  const path = new URL(url).pathname;
  const slug = path.split("/").filter(Boolean).pop() || "";
  // Strip brand prefix if present (e.g. "isntree-" from Isntree URLs)
  return slug
    .replace(/^isntree-/, "")
    .replace(/-\d+$/, "") // strip trailing numbers like "-2"
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function discoverFromListing(
  brand: BrandConfig,
  existingSlugs: Set<string>,
  existingTitles: Set<string>
): Promise<DiscoveredProduct[]> {
  const productUrls = await fetchProductUrlsFromListing(brand);
  console.log(`    Found ${productUrls.length} product URLs on listing page`);

  const discovered: DiscoveredProduct[] = [];

  for (const url of productUrls) {
    const fallbackTitle = titleFromUrl(url);
    if (shouldExclude(fallbackTitle.toLowerCase(), brand.excludeHandlePatterns)) continue;

    // Fetch actual page for accurate title
    const pageInfo = await fetchPageInfo(url);
    const title = pageInfo?.title || fallbackTitle;

    const slug = generateSlug(brand.id, title);
    const normTitle = normalizeTitle(title);

    // Dedup check
    if (existingSlugs.has(slug) || existingTitles.has(normTitle)) continue;

    const handle = new URL(url).pathname.split("/").filter(Boolean).pop() || "";

    discovered.push({
      brand,
      shopifyHandle: handle,
      title,
      bodyHtml: pageInfo?.html || null,
      productType: "",
      imageUrl: null,
      slug,
    });

    await sleep(500); // rate limit between page fetches
  }

  return discovered;
}

// ─── Shared ─────────────────────────────────────────────────────────

function shouldExclude(handle: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(handle));
}

/**
 * Discover new products across all brands.
 * Returns products not yet in products.json.
 */
export async function discoverNewProducts(): Promise<DiscoveredProduct[]> {
  const existing = JSON.parse(
    readFileSync(join(dataDir, "products.json"), "utf-8")
  );
  const existingSlugs = new Set<string>(existing.map((p: { slug: string }) => p.slug));
  const existingTitles = new Set<string>(
    existing.map((p: { name: { en: string } }) => normalizeTitle(p.name.en))
  );

  const discovered: DiscoveredProduct[] = [];

  for (const brand of BRANDS) {
    console.log(`  [FETCH] ${brand.displayName} (${brand.shopifyDomain})`);

    try {
      if (brand.discoverySource === "shopify") {
        if (!brand.productsJsonAvailable) {
          console.log(`    [SKIP] /products.json not available`);
          continue;
        }

        const shopifyProducts = await fetchShopifyProducts(brand.shopifyDomain);
        console.log(`    Found ${shopifyProducts.length} products on store`);

        const newProducts = discoverFromShopify(
          brand, shopifyProducts, existingSlugs, existingTitles
        );
        discovered.push(...newProducts);
        console.log(`    ${newProducts.length} new products discovered`);

      } else if (brand.discoverySource === "listing") {
        console.log(`    [LISTING] Scraping product listing page...`);

        const newProducts = await discoverFromListing(
          brand, existingSlugs, existingTitles
        );
        discovered.push(...newProducts);
        console.log(`    ${newProducts.length} new products discovered`);
      }
    } catch (err) {
      console.warn(
        `  [ERROR] ${brand.displayName}: ${err instanceof Error ? err.message : err}`
      );
    }

    await sleep(1000);
  }

  console.log(`\nTotal discovered: ${discovered.length} new products`);
  return discovered;
}
