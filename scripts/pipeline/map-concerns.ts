/**
 * Map matched ingredients to skin concerns.
 * Only "good" effects count toward concern assignment.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { Concern } from "../../src/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../src/data");

interface IngredientEffect {
  concern: Concern;
  type: "good" | "caution";
}

interface IngredientData {
  id: string;
  effects: IngredientEffect[];
}

/** Canonical concern order for consistent output. */
const CONCERN_ORDER: Concern[] = [
  "trouble",
  "pores",
  "hydration",
  "moisture",
  "brightening",
  "soothing",
  "anti-aging",
  "exfoliation",
];

/**
 * Given a list of matched ingredient IDs, determine which concerns this product addresses.
 * Only ingredients with "good" effects contribute to concern assignment.
 * A concern needs at least 2 supporting ingredients to be assigned.
 */
export function mapConcerns(
  ingredientIds: string[],
  category?: string
): Concern[] {
  const ingredients: IngredientData[] = JSON.parse(
    readFileSync(join(dataDir, "ingredients.json"), "utf-8")
  );

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  // Count good effects per concern
  const concernCounts = new Map<Concern, number>();
  for (const id of ingredientIds) {
    const ingredient = ingredientMap.get(id);
    if (!ingredient) continue;

    for (const effect of ingredient.effects) {
      if (effect.type === "good") {
        concernCounts.set(
          effect.concern,
          (concernCounts.get(effect.concern) || 0) + 1
        );
      }
    }
  }

  // All concerns: threshold of 2 supporting key ingredients
  const concerns = CONCERN_ORDER.filter((c) => {
    const count = concernCounts.get(c) || 0;
    return count >= 2;
  });

  // Category override: pad products always include exfoliation
  if (category === "pad" && !concerns.includes("exfoliation")) {
    concerns.push("exfoliation");
    concerns.sort((a, b) => CONCERN_ORDER.indexOf(a) - CONCERN_ORDER.indexOf(b));
  }

  return concerns;
}
