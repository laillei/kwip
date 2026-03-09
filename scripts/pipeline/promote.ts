/**
 * Promote staged products into products.json.
 * Reads the latest staging file, filters by confidence, and merges.
 */

import { readFileSync, readdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { StagedProduct } from "./run.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../src/data");
const stagingDir = join(dataDir, "staging");

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

  // Filter: only promote products with confidence > "none"
  const promoted = staged.filter((p) => p._meta.confidence !== "none");
  console.log(
    `Promoting ${promoted.length} of ${staged.length} products (filtered out ${staged.length - promoted.length} with no confidence)`
  );

  if (promoted.length === 0) {
    console.log("Nothing to promote.");
    process.exit(0);
  }

  // Load existing products
  const productsPath = join(dataDir, "products.json");
  const existing = JSON.parse(readFileSync(productsPath, "utf-8"));

  // Strip _meta before merging into products.json
  const cleanProducts = promoted.map(({ _meta, ...product }) => product);

  // Merge
  const merged = [...existing, ...cleanProducts];
  writeFileSync(productsPath, JSON.stringify(merged, null, 2));
  console.log(
    `products.json updated: ${existing.length} → ${merged.length} products`
  );

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
