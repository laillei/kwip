/**
 * Match raw INCI ingredient names against ingredients.json.
 * Builds a case-insensitive lookup from INCI name → ingredient ID.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../src/data");

export interface MatchedIngredient {
  ingredientId: string;
  order: number;
  isKey: boolean;
}

export interface MatchResult {
  matched: MatchedIngredient[];
  unmatched: string[];
}

/**
 * Build a case-insensitive lookup map from INCI names to ingredient IDs.
 */
function buildInciLookup(): Map<string, string> {
  const ingredients = JSON.parse(
    readFileSync(join(dataDir, "ingredients.json"), "utf-8")
  );
  const lookup = new Map<string, string>();

  for (const ing of ingredients) {
    // Primary: INCI name
    lookup.set(ing.name.inci.toLowerCase(), ing.id);
    // Also index by ID (kebab-case → words match)
    lookup.set(ing.id.replace(/-/g, " "), ing.id);
  }

  return lookup;
}

/**
 * Match raw INCI names to known ingredients.
 * First 3 matched ingredients are marked as isKey.
 */
export function matchIngredients(rawNames: string[]): MatchResult {
  const lookup = buildInciLookup();
  const matched: MatchedIngredient[] = [];
  const unmatched: string[] = [];
  let keyCount = 0;

  for (let i = 0; i < rawNames.length; i++) {
    const raw = rawNames[i].trim();
    if (!raw) continue;

    const normalized = raw.toLowerCase();
    const id = lookup.get(normalized);

    if (id) {
      keyCount++;
      matched.push({
        ingredientId: id,
        order: i + 1,
        isKey: keyCount <= 3,
      });
    } else {
      unmatched.push(raw);
    }
  }

  return { matched, unmatched };
}
