/**
 * Main pipeline orchestrator.
 * Discovers new products → extracts ingredients → classifies → stages for PR.
 */

import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { discoverNewProducts } from "./discover.js";
import { extractIngredients } from "./extract-ingredients.js";
import { detectCategory } from "./detect-category.js";
import { matchIngredients } from "./match-ingredients.js";
import { mapConcerns } from "./map-concerns.js";
import { generateViName, today } from "./utils.js";
import type { Category } from "../../src/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const stagingDir = join(__dirname, "../../src/data/staging");

export type Confidence = "high" | "medium" | "low" | "none";

export interface StagedProduct {
  id: string;
  slug: string;
  name: { ko: string; vi: string; en: string };
  brand: string;
  category: Category;
  image: string;
  concerns: string[];
  ingredients: { ingredientId: string; order: number; isKey: boolean }[];
  popularity: { rank: number; updatedAt: string };
  purchase: { shopee: string; lazada: string; oliveyoung: string };
  tags: string[];
  _meta: {
    confidence: Confidence;
    unmatchedIngredients: string[];
    rawInciCount: number;
    matchedCount: number;
    shopifyHandle: string;
    sourceImageUrl: string | null;
  };
}

function assessConfidence(
  category: Category | null,
  rawInciCount: number,
  matchedCount: number
): Confidence {
  if (!category) return "none";
  if (rawInciCount === 0) return "none";
  const matchRate = matchedCount / rawInciCount;
  if (matchRate >= 0.3 && matchedCount >= 3) return "high";
  if (matchRate >= 0.1 && matchedCount >= 1) return "medium";
  if (matchedCount >= 1) return "low";
  return "none";
}

async function main() {
  console.log("=== K-Beauty Product Discovery Pipeline ===\n");
  console.log(`Date: ${today()}\n`);

  // Step 1: Discover new products
  console.log("--- Step 1: Discover ---");
  const discovered = await discoverNewProducts();

  if (discovered.length === 0) {
    console.log("\nNo new products found. Exiting.");
    process.exit(0);
  }

  // Step 2: Enrich each product
  console.log("\n--- Step 2: Enrich ---");
  const staged: StagedProduct[] = [];

  for (const product of discovered) {
    console.log(`  [ENRICH] ${product.title} (${product.brand.displayName})`);

    // Detect category
    const category = detectCategory(product.title, product.productType);
    if (!category) {
      console.log(`    [SKIP] No category detected`);
      continue;
    }

    // Extract ingredients
    const rawIngredients = await extractIngredients(
      product.brand,
      product.shopifyHandle,
      product.bodyHtml
    );

    const rawInciCount = rawIngredients?.length || 0;
    let matchedIngredients: { ingredientId: string; order: number; isKey: boolean }[] = [];
    let unmatchedIngredients: string[] = [];
    let concerns: string[] = [];

    if (rawIngredients && rawIngredients.length > 0) {
      // Match ingredients
      const matchResult = matchIngredients(rawIngredients);
      matchedIngredients = matchResult.matched;
      unmatchedIngredients = matchResult.unmatched;

      // Map concerns
      const matchedIds = matchResult.matched.map((m) => m.ingredientId);
      concerns = mapConcerns(matchedIds);
    }

    const confidence = assessConfidence(
      category,
      rawInciCount,
      matchedIngredients.length
    );

    // Generate Vietnamese name
    const viName = generateViName(
      product.brand.displayName,
      product.title,
      category
    );

    const stagedProduct: StagedProduct = {
      id: product.slug,
      slug: product.slug,
      name: {
        ko: "", // Left empty for human review
        vi: viName,
        en: product.title,
      },
      brand: product.brand.id,
      category,
      image: product.imageUrl ?? `/images/products/${product.slug}.svg`,
      concerns,
      ingredients: matchedIngredients,
      popularity: { rank: 999, updatedAt: today() },
      purchase: {
        shopee: `https://shopee.vn/search?keyword=${encodeURIComponent(`${product.brand.displayName} ${product.title}`)}`,
        lazada: `https://www.lazada.vn/catalog/?q=${encodeURIComponent(`${product.brand.displayName} ${product.title}`)}`,
        oliveyoung: `https://global.oliveyoung.com/search?query=${encodeURIComponent(product.title)}`,
      },
      tags: [],
      _meta: {
        confidence,
        unmatchedIngredients,
        rawInciCount,
        matchedCount: matchedIngredients.length,
        shopifyHandle: product.shopifyHandle,
        sourceImageUrl: product.imageUrl,
      },
    };

    staged.push(stagedProduct);
    console.log(
      `    category=${category} ingredients=${matchedIngredients.length}/${rawInciCount} confidence=${confidence}`
    );
  }

  // Step 3: Write staging file
  console.log("\n--- Step 3: Stage ---");
  mkdirSync(stagingDir, { recursive: true });
  const stagingFile = join(stagingDir, `discovered-${today()}.json`);
  writeFileSync(stagingFile, JSON.stringify(staged, null, 2));
  console.log(`Staged ${staged.length} products to ${stagingFile}`);

  // Output summary for GitHub Actions
  const brandSummary = [
    ...new Set(staged.map((p) => p.brand)),
  ].join(", ");
  const highConfidence = staged.filter((p) => p._meta.confidence === "high").length;
  const medConfidence = staged.filter((p) => p._meta.confidence === "medium").length;

  console.log(`\n--- Summary ---`);
  console.log(`Total staged: ${staged.length}`);
  console.log(`High confidence: ${highConfidence}`);
  console.log(`Medium confidence: ${medConfidence}`);
  console.log(`Brands: ${brandSummary}`);

  // Set GitHub Actions output variables
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `count=${staged.length}\nbrands=${brandSummary}\nhigh=${highConfidence}\n`
    );
  }
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
