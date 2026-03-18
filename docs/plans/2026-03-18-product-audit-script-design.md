# Product Audit Script — Design

**Date:** 2026-03-18
**Status:** Approved

## Goal

A single `scripts/pipeline/audit-products.ts` that runs 4 quality checks on all active products, auto-fixes what it can, and flags the rest for manual review. Runs nightly in GitHub Actions and on-demand via `npm run pipeline:audit`.

## Checks

### 1. Image URL Source
- Must come from an official brand domain (not Shopee, OliveYoung, Amazon, Lazada, cloudfront, etc.)
- **Auto-fix:** fetch replacement image from brand's Shopify store, update Supabase
- Reuses the existing `UNOFFICIAL_IMAGE_PATTERNS` list from `promote.ts`

### 2. Image Vision Check (Claude API)
- Calls `claude-haiku-4-5-20251001` with the image URL + product name
- Prompt: "Does this image show [product name]? Answer YES or NO, then describe what you see in one sentence."
- **Auto-fix:** if NO → fetch replacement from Shopify, update Supabase
- If no Shopify image found → flag for manual review
- Logs Claude's description in audit log regardless of result

### 3. Ingredient Freshness
- Re-fetches ingredient list from brand's Shopify page using existing `extractIngredients()`
- Compares against current DB ingredients via normalized INCI names
- Flags if >20% of ingredients differ (added or removed)
- **Never auto-fixes** — ingredient changes require human review
- Flags in audit log with diff summary

### 4. Shopee Direct Link
- Detects if `purchase.shopee` is a search URL (contains `search?`, `keyword=`, etc.)
- **Auto-fix:** scrapes brand's official Shopee store (using `shopeeStoreSlug` from `brands.config.ts`) for a product matching by normalized name
- Replaces search URL with direct product URL in Supabase
- If no match found on official store → leaves search URL, flags in log

## Auto-fix vs Flag Summary

| Check | Auto-fix | Flag only |
|---|---|---|
| Unofficial image URL | ✅ replace from Shopify | if Shopify has no image |
| Vision mismatch | ✅ replace from Shopify | if Shopify has no image |
| Ingredient drift >20% | — | ✅ always (human review) |
| Search URL → direct link | ✅ scrape Shopee store | if no store match found |

## Output

- Console log per product with status per check (`[OK]`, `[FIXED]`, `[FLAGGED]`)
- Appends results to `src/data/audit-log.json`
- `UserPromptSubmit` session hook surfaces unresolved flags (same pattern as VN additions log)

## Files

- Create: `scripts/pipeline/audit-products.ts`
- Create: `src/data/audit-log.json` (initial empty log)
- Modify: `.github/workflows/product-discovery.yml` (add `audit-products` job after `discover-shopify`)
- Modify: `package.json` (add `pipeline:audit` script)
- Modify: `scripts/notify-vn-additions.sh` → extend to also surface audit flags, OR create `scripts/notify-audit-flags.sh`

## Dependencies

- Claude API (`@anthropic-ai/sdk`) — already a known dependency pattern in the project
- Playwright (already installed) — for Shopee scraping in check 4
- Existing pipeline utilities: `extractIngredients()`, `UNOFFICIAL_IMAGE_PATTERNS`, `normalizeTitle()`, `sleep()`
- `brands.config.ts` — `shopeeStoreSlug` field (populated in VN pipeline)

## Rate Limiting

- Claude API calls: 1 per product image, ~300 products = ~300 calls. Use haiku for cost.
- Shopee scraping: only for products with search URLs, rate-limited at 2s between requests
- Supabase updates: sequential with 100ms delay

## GitHub Actions

New job `audit-products` runs after `discover-shopify`, in parallel with `discover-vn` and `verify-availability`:

```yaml
audit-products:
  runs-on: ubuntu-latest
  timeout-minutes: 30
  needs: discover-shopify
```
