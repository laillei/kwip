/**
 * Shared utilities for the product discovery pipeline.
 */

import type { Category } from "../../src/types";

/** Generate a URL-safe slug from brand + product title. */
export function generateSlug(brand: string, title: string): string {
  const raw = `${brand} ${title}`;
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Normalize a title for deduplication comparison. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, "") // remove parenthetical info
    .replace(/\s*-\s*\d+\s*ml\b/gi, "") // remove size variants
    .replace(/\s*\d+\s*ml\b/gi, "")
    .replace(/spf\s*\d+\+*/gi, "") // remove SPF
    .replace(/pa\+{1,4}/gi, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse an INCI ingredient list string into individual ingredient names.
 * Handles comma-separated lists, sometimes with periods or semicolons.
 */
export function parseInciList(raw: string): string[] {
  // Normalize separators
  const cleaned = raw
    .replace(/\n/g, " ")
    .replace(/\.\s*$/, "") // trailing period
    .trim();

  // Split by comma (primary INCI separator)
  const parts = cleaned.split(/,\s*/);

  return parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.length < 200); // filter out garbage
}

/** Vietnamese name templates by category. */
const VI_TEMPLATES: Record<Category, string> = {
  toner: "Nước hoa hồng {brand} {name}",
  serum: "Tinh chất {brand} {name}",
  sunscreen: "Kem chống nắng {brand} {name}",
  cream: "Kem dưỡng {brand} {name}",
  pad: "Pad tẩy da chết {brand} {name}",
  cleanser: "Sữa rửa mặt {brand} {name}",
  mask: "Mặt nạ {brand} {name}",
  ampoule: "Tinh chất {brand} {name}",
  essence: "Tinh chất {brand} {name}",
};

/** Generate a Vietnamese product name from brand display name, English title, and category. */
export function generateViName(
  brandDisplay: string,
  enTitle: string,
  category: Category
): string {
  const template = VI_TEMPLATES[category];
  // Use the English title but strip brand name from it to avoid duplication
  const nameWithoutBrand = enTitle
    .replace(new RegExp(brandDisplay, "gi"), "")
    .trim();
  return template
    .replace("{brand}", brandDisplay)
    .replace("{name}", nameWithoutBrand);
}

/** Sleep for ms milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Get today's date as YYYY-MM-DD. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
