/**
 * Extract INCI ingredient lists from Shopify product HTML.
 * Strategy A: Parse body_html from /products.json
 * Strategy B: Fetch full product page and parse with cheerio
 */

import * as cheerio from "cheerio";
import type { BrandConfig } from "./brands.config.js";
import { parseInciList, sleep } from "./utils.js";

/**
 * Extract ingredients from Shopify body_html field.
 * Looks for "Ingredients" header followed by text content.
 */
function extractFromBodyHtml(bodyHtml: string): string[] | null {
  const $ = cheerio.load(bodyHtml);

  // Strategy 1: Find heading containing "Ingredients" and get next sibling text
  const headings = $("h1, h2, h3, h4, h5, h6, strong, b, p").filter(
    (_, el) => {
      const text = $(el).text().trim().toLowerCase();
      return text === "ingredients" || text === "full ingredients" || text === "ingredient list";
    }
  );

  if (headings.length > 0) {
    // Get all text after the heading until the next heading or end
    const heading = headings.first();
    let text = "";

    let next = heading.parent().is("p, div") ? heading.parent().next() : heading.next();
    while (next.length > 0) {
      const tagName = next.prop("tagName")?.toLowerCase();
      if (tagName && /^h[1-6]$/.test(tagName)) break;

      const nodeText = next.text().trim();
      if (nodeText) {
        text += (text ? " " : "") + nodeText;
      }

      // If we found a comma-separated list, we probably have enough
      if (text.includes(",") && text.length > 50) break;

      next = next.next();
    }

    if (text && text.includes(",")) {
      return parseInciList(text);
    }
  }

  // Strategy 2: Regex fallback — find text starting with Water/Aqua
  const fullText = $.text();
  const waterMatch = fullText.match(
    /(?:Water|Aqua)\s*(?:\/\s*(?:Water|Eau))?\s*,\s*[A-Za-z][\s\S]{30,2000}?(?:\.\s|\n\n)/i
  );
  if (waterMatch) {
    return parseInciList(waterMatch[0]);
  }

  return null;
}

/**
 * Extract ingredients by fetching the full product page.
 * Uses brand-specific CSS selectors.
 */
async function extractFromProductPage(
  domain: string,
  handle: string,
  selector: string
): Promise<string[] | null> {
  const url = `https://${domain}/products/${handle}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Kwip-Pipeline/1.0 (product-discovery)",
        Accept: "text/html",
      },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Try brand-specific selector first
    if (selector) {
      const selectors = selector.split(",").map((s) => s.trim());
      for (const sel of selectors) {
        const el = $(sel);
        if (el.length > 0) {
          const text = el.text().trim();
          if (text.includes(",") && text.length > 30) {
            return parseInciList(text);
          }
        }
      }
    }

    // Fallback: search for any element with class/id containing "ingredient"
    const candidates = $('[class*="ingredient"], [id*="ingredient"]');
    for (let i = 0; i < candidates.length; i++) {
      const text = $(candidates[i]).text().trim();
      if (text.includes(",") && text.length > 30) {
        return parseInciList(text);
      }
    }

    // Final fallback: regex on full page text
    const fullText = $.text();
    const waterMatch = fullText.match(
      /(?:Water|Aqua)\s*(?:\/\s*(?:Water|Eau))?\s*,\s*[A-Za-z][\s\S]{30,2000}?(?:\.\s|\n\n)/i
    );
    if (waterMatch) {
      return parseInciList(waterMatch[0]);
    }
  } catch (err) {
    console.warn(
      `  [WARN] Failed to fetch ${url}: ${err instanceof Error ? err.message : err}`
    );
  }

  return null;
}

/**
 * Extract ingredients for a product using the appropriate strategy.
 */
export async function extractIngredients(
  brand: BrandConfig,
  handle: string,
  bodyHtml: string | null
): Promise<string[] | null> {
  // Try body_html first if available
  if (bodyHtml && brand.ingredientSource === "body_html") {
    const result = extractFromBodyHtml(bodyHtml);
    if (result && result.length >= 3) return result;
  }

  // Fall back to page scraping
  if (brand.ingredientSelector || brand.ingredientSource === "page") {
    await sleep(500); // rate limit
    return extractFromProductPage(
      brand.shopifyDomain,
      handle,
      brand.ingredientSelector
    );
  }

  return null;
}
