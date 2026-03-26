/**
 * Detect product category from Shopify product_type and title keywords.
 */

import type { Category } from "../../src/types";

/** Keyword map: category → keywords to match in title (lowercase). */
const KEYWORD_MAP: [Category, string[]][] = [
  ["pad", ["pad", "peeling pad", "toner pad"]],
  ["cleanser", ["cleanser", "cleansing", "foam", "wash", "clean"]],
  ["mask", ["mask", "sheet mask", "sleeping mask"]],
  ["sunscreen", ["sunscreen", "sun cream", "sun block", "spf", "uv"]],
  ["ampoule", ["ampoule", "ampule"]],
  ["essence", ["essence", "first treatment"]],
  ["serum", ["serum"]],
  ["toner", ["toner", "lotion", "tonic", "water", "mist"]],
  ["cream", ["cream", "moisturizer", "moisturiser", "gel", "balm", "emulsion"]],
];

/** Map Shopify product_type values to our categories. */
const PRODUCT_TYPE_MAP: Record<string, Category> = {
  toner: "toner",
  toners: "toner",
  serum: "serum",
  serums: "serum",
  essence: "essence",
  ampoule: "ampoule",
  sunscreen: "sunscreen",
  "sun care": "sunscreen",
  "sun protection": "sunscreen",
  cream: "cream",
  creams: "cream",
  moisturizer: "cream",
  moisturizers: "cream",
  "face cream": "cream",
  pad: "pad",
  pads: "pad",
  "toner pad": "pad",
  mask: "mask",
  "face mask": "mask",
  cleanser: "cleanser",
  cleansers: "cleanser",
  "face wash": "cleanser",
  "cleansing foam": "cleanser",
};

/**
 * Detect category from product info.
 * Priority: Shopify product_type → title keywords (pad > sunscreen > serum > toner > cream).
 * Returns null if no match found.
 */
export function detectCategory(
  title: string,
  shopifyProductType?: string
): Category | null {
  // Try Shopify product_type first
  if (shopifyProductType) {
    const normalized = shopifyProductType.toLowerCase().trim();
    const mapped = PRODUCT_TYPE_MAP[normalized];
    if (mapped) return mapped;
  }

  // Fall back to title keyword matching (ordered by priority)
  const lowerTitle = title.toLowerCase();
  for (const [category, keywords] of KEYWORD_MAP) {
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword)) {
        return category;
      }
    }
  }

  // Default to cream as catch-all
  return null;
}
