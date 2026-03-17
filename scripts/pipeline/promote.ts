/**
 * Promote staged products to Supabase.
 * Reads the latest staging file, filters by confidence, deduplicates, and upserts.
 */

import { readFileSync, readdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import type { StagedProduct } from "./run.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../src/data");
const stagingDir = join(dataDir, "staging");

/** Image sources that are NOT official brand websites. */
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

function hasOfficialImage(image: string | null | undefined): boolean {
  if (!image) return false;
  return !UNOFFICIAL_IMAGE_PATTERNS.some((p) => image.includes(p));
}

function findLatestStagingFile(): string | null {
  try {
    const files = readdirSync(stagingDir)
      .filter((f) => f.startsWith("discovered-") && f.endsWith(".json"))
      .sort()
      .reverse();
    return files[0] ? join(stagingDir, files[0]) : null;
  } catch {
    return null;
  }
}

function generatePrBody(promoted: StagedProduct[]): string {
  const byBrand = new Map<string, StagedProduct[]>();
  for (const p of promoted) {
    const list = byBrand.get(p.brand) || [];
    list.push(p);
    byBrand.set(p.brand, list);
  }

  let body = `## Auto-discovered Products\n\n`;
  body += `**${promoted.length}** new products discovered and promoted.\n\n`;

  for (const [brand, products] of byBrand) {
    body += `### ${brand}\n`;
    for (const p of products) {
      const conf = p._meta.confidence;
      const badge =
        conf === "high" ? "🟢" : conf === "medium" ? "🟡" : "🟠";
      body += `- ${badge} **${p.name.en}** (${p.category}) — ${p._meta.matchedCount}/${p._meta.rawInciCount} ingredients matched\n`;
      if (p._meta.unmatchedIngredients.length > 0) {
        body += `  - Unmatched: ${p._meta.unmatchedIngredients.slice(0, 5).join(", ")}${p._meta.unmatchedIngredients.length > 5 ? "..." : ""}\n`;
      }
    }
    body += "\n";
  }

  body += `## Review Checklist\n\n`;
  body += `- [ ] Product names (vi, ko) are correct\n`;
  body += `- [ ] Categories are correct\n`;
  body += `- [ ] Key ingredients are correctly identified\n`;
  body += `- [ ] Concern mappings make sense\n`;
  body += `- [ ] No duplicate products\n`;
  body += `- [ ] Product exists on Shopee VN (check shopee.vn before approving)\n`;
  body += `- [ ] Images are from official brand website (no Shopee/OliveYoung/Amazon)\n`;
  body += `- [ ] Single product only (no bundles/sets/multi-product shots)\n`;

  return body;
}

async function main() {
  const stagingFile = findLatestStagingFile();
  if (!stagingFile) {
    console.log("No staging file found. Run the pipeline first.");
    process.exit(0);
  }

  console.log(`Reading staging file: ${stagingFile}`);
  const staged: StagedProduct[] = JSON.parse(
    readFileSync(stagingFile, "utf-8")
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Dedup: load existing slugs from Supabase
  const existingSlugs = new Set<string>();
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: existingRows } = await supabase.from("products").select("slug");
    for (const row of existingRows ?? []) existingSlugs.add(row.slug);
    console.log(`Loaded ${existingSlugs.size} existing slugs for dedup check`);
  }

  // Filter: only promote products that pass all checks
  const promoted = staged.filter((p) => {
    if (p._meta.confidence === "none") return false;
    if (existingSlugs.has(p.slug)) {
      console.log(`  [SKIP] Duplicate: ${p.slug}`);
      return false;
    }
    if (!hasOfficialImage(p.image)) {
      console.log(`  [SKIP] Unofficial image: ${p.slug} (${p.image})`);
      return false;
    }
    return true;
  });
  console.log(
    `Promoting ${promoted.length} of ${staged.length} products (filtered out ${staged.length - promoted.length})`
  );

  if (promoted.length === 0) {
    console.log("Nothing to promote.");
    process.exit(0);
  }

  // Strip _meta before upserting
  const cleanProducts = promoted.map(({ _meta, ...product }) => product);

  // Upsert to Supabase
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
      process.exit(1);
    } else {
      console.log(`Supabase updated: ${rows.length} products upserted`);
    }
  } else {
    console.log("Supabase env vars not set — skipping DB upsert");
  }

  // Write PR body to file for GitHub Actions
  const prBody = generatePrBody(promoted);
  const prBodyPath = join(stagingDir, "pr-body.md");
  writeFileSync(prBodyPath, prBody);
  console.log(`PR body written to ${prBodyPath}`);

  // Set GitHub Actions output
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `promoted=${promoted.length}\n`
    );
  }
}

main().catch((err) => {
  console.error("Promotion failed:", err);
  process.exit(1);
});
