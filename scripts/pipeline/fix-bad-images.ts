/**
 * One-time script to fix products with non-official image URLs.
 * Fetches official images from brand Shopify stores and updates Supabase.
 *
 * Usage: npx tsx scripts/pipeline/fix-bad-images.ts
 */

import { createClient } from "@supabase/supabase-js";
import { BRANDS } from "./brands.config.js";

const UNOFFICIAL_PATTERNS = [
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

/** For multi-brand stores, map brand ID to vendor name on the store */
const BRAND_VENDOR_MAP: Record<string, string> = {
  illiyoon: "ILLIYOON",
  etude: "ETUDE",
  aestura: "AESTURA",
  laneige: "LANEIGE",
  innisfree: "innisfree",
};

/** For brands not in brands.config.ts, specify their domain directly */
const EXTRA_DOMAINS: Record<string, string> = {
  "dr-jart": "www.drjart.com",
  heimish: "www.heimish.com",
};

function isUnofficialImage(url: string): boolean {
  if (!url) return false;
  return UNOFFICIAL_PATTERNS.some((p) => url.includes(p));
}

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

/**
 * Fetch all products from a Shopify store, optionally filtering by vendor.
 * Returns a map of handle → first image URL.
 */
async function fetchShopifyImageMap(
  domain: string,
  vendorFilter?: string
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;

  while (true) {
    const url = `https://${domain}/products.json?limit=250&page=${page}`;
    try {
      const res = await fetch(url, { headers: BROWSER_HEADERS });
      if (!res.ok) {
        console.log(`  [WARN] ${domain} returned ${res.status}`);
        break;
      }
      const data = await res.json();
      const products = data.products ?? [];
      if (products.length === 0) break;

      for (const p of products) {
        if (vendorFilter && p.vendor !== vendorFilter) continue;
        const imgSrc = p.images?.[0]?.src;
        if (p.handle && imgSrc) map.set(p.handle, imgSrc);
      }

      if (products.length < 250) break;
      page++;
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.log(`  [WARN] Failed to fetch ${domain}: ${err}`);
      break;
    }
  }

  return map;
}

/**
 * Try to match a product slug to a handle in the Shopify store.
 */
function findBestHandle(
  slug: string,
  brandId: string,
  shopifyHandles: Set<string>
): string | null {
  const withoutBrand = slug.startsWith(brandId + "-")
    ? slug.slice(brandId.length + 1)
    : slug;

  // Exact match
  if (shopifyHandles.has(withoutBrand)) return withoutBrand;
  if (shopifyHandles.has(slug)) return slug;

  // Fuzzy: match handles containing all significant words
  const words = withoutBrand.split("-").filter((w) => w.length > 2);
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const handle of shopifyHandles) {
    const matchCount = words.filter((w) => handle.includes(w)).length;
    const score = matchCount / words.length;
    if (score > bestScore && score >= 0.55) {
      bestScore = score;
      bestMatch = handle;
    }
  }

  return bestMatch;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Fetching all products from Supabase...");
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, brand, image, name");

  if (error) {
    console.error("Failed to fetch products:", error.message);
    process.exit(1);
  }

  const badProducts = (products ?? []).filter((p) => isUnofficialImage(p.image ?? ""));
  console.log(`Found ${badProducts.length} products with unofficial images\n`);

  if (badProducts.length === 0) {
    console.log("No bad images found. All good!");
    process.exit(0);
  }

  // Group by brand
  const byBrand = new Map<string, typeof badProducts>();
  for (const p of badProducts) {
    const list = byBrand.get(p.brand) ?? [];
    list.push(p);
    byBrand.set(p.brand, list);
  }

  // Cache fetched image maps per domain to avoid redundant fetches
  const domainCache = new Map<string, Map<string, string>>();

  const updates: { id: string; image: string; slug: string }[] = [];
  const stillFailed: { slug: string; brand: string; currentImage: string }[] = [];

  for (const [brandId, brandProducts] of byBrand) {
    const brandConfig = BRANDS.find((b) => b.id === brandId);
    const extraDomain = EXTRA_DOMAINS[brandId];
    const domain = brandConfig?.shopifyDomain ?? extraDomain;

    if (!domain) {
      console.log(`[SKIP] ${brandId} — no domain config`);
      for (const p of brandProducts) {
        stillFailed.push({ slug: p.slug, brand: brandId, currentImage: p.image ?? "" });
      }
      continue;
    }

    const vendorFilter = BRAND_VENDOR_MAP[brandId];
    const cacheKey = `${domain}:${vendorFilter ?? "*"}`;

    console.log(`[FETCH] ${brandId} (${domain}${vendorFilter ? ` vendor=${vendorFilter}` : ""})...`);

    if (!domainCache.has(cacheKey)) {
      const imageMap = await fetchShopifyImageMap(domain, vendorFilter);
      domainCache.set(cacheKey, imageMap);
      console.log(`  Loaded ${imageMap.size} products`);
    }

    const imageMap = domainCache.get(cacheKey)!;
    const handles = new Set(imageMap.keys());

    for (const product of brandProducts) {
      const handle = findBestHandle(product.slug, brandId, handles);
      if (handle && imageMap.has(handle)) {
        console.log(`  ✓ ${product.slug} → ${handle}`);
        updates.push({ id: product.id, image: imageMap.get(handle)!, slug: product.slug });
      } else {
        console.log(`  ✗ ${product.slug} — no match`);
        stillFailed.push({ slug: product.slug, brand: brandId, currentImage: product.image ?? "" });
      }
    }
  }

  // Apply updates to Supabase
  console.log(`\nUpdating ${updates.length} products in Supabase...`);
  let successCount = 0;

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from("products")
      .update({ image: update.image })
      .eq("id", update.id);

    if (updateError) {
      console.error(`  ✗ Failed to update ${update.slug}: ${updateError.message}`);
    } else {
      successCount++;
      console.log(`  ✓ Updated ${update.slug}`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${successCount}/${updates.length}`);
  console.log(`Still needs fix: ${stillFailed.length}`);

  if (stillFailed.length > 0) {
    console.log(`\nProducts still needing manual fix:`);
    for (const f of stillFailed) {
      console.log(`  ${f.brand}/${f.slug}`);
      console.log(`    Current: ${f.currentImage}`);
    }
  }
}

main().catch((err) => {
  console.error("fix-bad-images failed:", err);
  process.exit(1);
});
