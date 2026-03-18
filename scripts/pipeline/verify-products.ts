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
