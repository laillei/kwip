// scripts/seed-supabase.ts
/**
 * One-time migration: load JSON files → Supabase.
 * Run with: npx tsx scripts/seed-supabase.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../src/data");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function readJson(filename: string) {
  return JSON.parse(readFileSync(join(dataDir, filename), "utf-8"));
}

async function seedTable(
  table: string,
  data: Record<string, unknown>[],
  transform?: (row: Record<string, unknown>) => Record<string, unknown>
) {
  const rows = transform ? data.map(transform) : data;
  console.log(`Seeding ${table}: ${rows.length} rows...`);

  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from(table).upsert(batch);
    if (error) {
      console.error(`Error seeding ${table} batch ${i / 100}:`, error.message);
      process.exit(1);
    }
    console.log(`  ✓ ${Math.min(i + 100, rows.length)}/${rows.length}`);
  }
  console.log(`✓ ${table} seeded`);
}

async function main() {
  console.log("Starting Supabase seed...\n");

  const concerns = readJson("concerns.json");
  await seedTable("concerns", concerns, (c) => ({
    id: c.id,
    label: c.label,
    symptom: c.symptom,
    icon: c.icon,
    key_ingredients: c.keyIngredients,
    weather_trigger: c.weatherTrigger ?? null,
  }));

  const ingredients = readJson("ingredients.json");
  await seedTable("ingredients", ingredients, (i) => ({
    id: i.id,
    name: i.name,
    description: i.description ?? null,
    effects: i.effects ?? [],
    ewg_grade: i.ewgGrade ?? null,
    category: i.category,
  }));

  const products = readJson("products.json");
  await seedTable("products", products, (p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    image: p.image ?? null,
    concerns: p.concerns ?? [],
    ingredients: p.ingredients ?? [],
    popularity: p.popularity ?? {},
    purchase: p.purchase ?? {},
    tags: p.tags ?? [],
  }));

  console.log("\n✓ Seed complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
