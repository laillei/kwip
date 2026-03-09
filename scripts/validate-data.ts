import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { Brand, Category, Concern, IngredientCategory } from "../src/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../src/data");

const concerns = JSON.parse(readFileSync(join(dataDir, "concerns.json"), "utf-8"));
const ingredients = JSON.parse(readFileSync(join(dataDir, "ingredients.json"), "utf-8"));
const products = JSON.parse(readFileSync(join(dataDir, "products.json"), "utf-8"));

const errors: string[] = [];

// --- Valid values (derived from types to stay in sync) ---
const validConcerns: Concern[] = ["acne", "pores", "hydration", "brightening", "soothing", "anti-aging", "sun-protection"];
const validBrands: Brand[] = [
  "cosrx", "anua", "torriden", "beauty-of-joseon", "round-lab", "skin1004",
  "klairs", "some-by-mi", "innisfree", "laneige", "isntree", "purito",
  "mixsoon", "medicube", "tirtir", "numbuzin", "biodance", "illiyoon",
  "dr-g", "benton", "heimish", "tocobo", "haruharu", "goodal",
  "dr-jart", "sulwhasoo", "mediheal", "etude", "nature-republic", "missha",
  "the-face-shop", "banila-co", "ahc", "vt-cosmetics",
];
const validCategories: Category[] = ["toner", "serum", "sunscreen", "cream", "pad", "cleanser", "mask", "ampoule", "essence"];
const validIngredientCategories: IngredientCategory[] = ["active", "moisturizer", "emollient", "surfactant", "preservative", "fragrance", "other"];

// --- Validate concerns ---
const concernIds = new Set<string>();
for (const c of concerns) {
  if (!c.id || !validConcerns.includes(c.id)) errors.push(`Invalid concern id: ${c.id}`);
  if (concernIds.has(c.id)) errors.push(`Duplicate concern id: ${c.id}`);
  concernIds.add(c.id);
  if (!c.label?.vi) errors.push(`Concern ${c.id}: missing vi label`);
  if (!c.label?.ko) errors.push(`Concern ${c.id}: missing ko label`);
  if (!c.label?.en) errors.push(`Concern ${c.id}: missing en label`);
  if (!c.icon) errors.push(`Concern ${c.id}: missing icon`);
  if (!Array.isArray(c.keyIngredients)) errors.push(`Concern ${c.id}: keyIngredients must be array`);
  if (!c.weatherTrigger?.condition) errors.push(`Concern ${c.id}: missing weatherTrigger.condition`);
  if (!c.weatherTrigger?.message?.vi) errors.push(`Concern ${c.id}: missing weatherTrigger.message.vi`);
  if (!c.weatherTrigger?.message?.en) errors.push(`Concern ${c.id}: missing weatherTrigger.message.en`);
}

// --- Validate ingredients ---
const ingredientIds = new Set<string>();
for (const ing of ingredients) {
  if (!ing.id) { errors.push("Ingredient missing id"); continue; }
  if (ingredientIds.has(ing.id)) errors.push(`Duplicate ingredient id: ${ing.id}`);
  ingredientIds.add(ing.id);
  if (!ing.name?.inci) errors.push(`Ingredient ${ing.id}: missing inci name`);
  if (!ing.name?.vi) errors.push(`Ingredient ${ing.id}: missing vi name`);
  if (!ing.name?.ko) errors.push(`Ingredient ${ing.id}: missing ko name`);
  if (!ing.description?.vi) errors.push(`Ingredient ${ing.id}: missing vi description`);
  if (!ing.description?.en) errors.push(`Ingredient ${ing.id}: missing en description`);
  if (!validIngredientCategories.includes(ing.category)) {
    errors.push(`Ingredient ${ing.id}: invalid category "${ing.category}"`);
  }
  for (const effect of ing.effects || []) {
    if (!validConcerns.includes(effect.concern)) {
      errors.push(`Ingredient ${ing.id}: invalid effect concern "${effect.concern}"`);
    }
    if (!["good", "caution"].includes(effect.type)) {
      errors.push(`Ingredient ${ing.id}: invalid effect type "${effect.type}"`);
    }
    if (!effect.reason?.vi) {
      errors.push(`Ingredient ${ing.id}: missing effect reason.vi for ${effect.concern}`);
    }
    if (!effect.reason?.en) {
      errors.push(`Ingredient ${ing.id}: missing effect reason.en for ${effect.concern}`);
    }
  }
}

// --- Check concern keyIngredients reference valid ingredients ---
for (const c of concerns) {
  for (const keyIng of c.keyIngredients || []) {
    if (!ingredientIds.has(keyIng)) {
      errors.push(`Concern ${c.id}: keyIngredient "${keyIng}" not in ingredients.json`);
    }
  }
}

// --- Validate products ---
const productIds = new Set<string>();
for (const p of products) {
  if (!p.id) { errors.push("Product missing id"); continue; }
  if (productIds.has(p.id)) errors.push(`Duplicate product id: ${p.id}`);
  productIds.add(p.id);
  if (!p.slug) errors.push(`Product ${p.id}: missing slug`);
  if (!p.name?.vi) errors.push(`Product ${p.id}: missing vi name`);
  if (!p.name?.ko) errors.push(`Product ${p.id}: missing ko name`);
  if (!p.name?.en) errors.push(`Product ${p.id}: missing en name`);
  if (!validBrands.includes(p.brand)) errors.push(`Product ${p.id}: invalid brand "${p.brand}"`);
  if (!validCategories.includes(p.category)) errors.push(`Product ${p.id}: invalid category "${p.category}"`);

  for (const concern of p.concerns || []) {
    if (!concernIds.has(concern)) {
      errors.push(`Product ${p.id}: concern "${concern}" not in concerns.json`);
    }
  }

  for (const pi of p.ingredients || []) {
    if (!ingredientIds.has(pi.ingredientId)) {
      errors.push(`Product ${p.id}: ingredient "${pi.ingredientId}" not in ingredients.json`);
    }
    if (typeof pi.order !== "number") errors.push(`Product ${p.id}: ingredient "${pi.ingredientId}" missing order`);
    if (typeof pi.isKey !== "boolean") errors.push(`Product ${p.id}: ingredient "${pi.ingredientId}" missing isKey`);
  }

  if (typeof p.popularity?.rank !== "number") errors.push(`Product ${p.id}: missing popularity.rank`);
  if (!p.popularity?.updatedAt) errors.push(`Product ${p.id}: missing popularity.updatedAt`);
}

// --- Report ---
if (errors.length > 0) {
  console.error(`\n❌ Validation failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log(`\n✅ All data valid!`);
  console.log(`   ${concerns.length} concerns`);
  console.log(`   ${ingredients.length} ingredients`);
  console.log(`   ${products.length} products`);
  process.exit(0);
}
