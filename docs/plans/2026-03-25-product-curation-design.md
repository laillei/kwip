# Product Curation Update — Design
**Date:** 2026-03-25
**Status:** Approved

---

## Decision

Reduce the active product catalog from 309 → 22 products for launch.

**Why:** A curated, high-signal list of proven bestsellers builds more trust than a large unfiltered catalog. Olive Young's Annual Awards are based on 180M+ real purchase records — this is the strongest editorial signal available.

**Implementation:** Set `is_active = false` on all current 309 products. Activate (or seed) the 22 curated products below. No data is deleted — the full catalog can be re-activated later.

---

## Sources

| Source | Basis | Products |
|---|---|---|
| Olive Young KR Annual Awards 2025 | 180M+ real purchase records, July 2024–June 2025 | 13 |
| Daiso KR community-verified best sellers | Cross-referenced across 5+ independent sources | 9 |

---

## Product List (22 products)

### Olive Young KR Annual Awards 2025

| # | Brand | Product | Step | Concerns |
|---|---|---|---|---|
| 1 | Ma:nyo | Pure Cleansing Oil | cleanser | soothing, hydration |
| 2 | COSRX | Low pH Good Morning Gel Cleanser | cleanser | acne, pores |
| 3 | Beauty of Joseon | Radiance Cleansing Balm | cleanser | brightening, hydration |
| 4 | Round Lab | 1025 Dokdo Cleanser | cleanser | hydration, soothing |
| 5 | Mediheal | Madecassoside Blemish Pad | pad | acne, pores, soothing |
| 6 | Round Lab | 1025 Dokdo Toner | toner | hydration, soothing |
| 7 | Anua | Heartleaf 77% Soothing Toner | toner | soothing, acne |
| 8 | numbuzin | No.3 Super Glowing Essence Toner | toner | brightening, hydration |
| 9 | COSRX | Advanced Snail 96 Mucin Power Essence | essence | hydration, soothing, acne |
| 10 | Torriden | Dive-In Low Molecular Hyaluronic Acid Serum | serum | hydration |
| 11 | Beauty of Joseon | Glow Serum: Propolis + Niacinamide | serum | brightening, acne, pores |
| 12 | AESTURA | ATOBARRIER 365 Cream | cream | hydration, soothing |
| 13 | Torriden | Dive-In Hyaluronic Acid Mask | mask | hydration |

### Daiso KR Best Sellers

| # | Brand | Product | Step | Concerns |
|---|---|---|---|---|
| 14 | SENKA | Perfect Whip Cleanser | cleanser | hydration, pores |
| 15 | MADECA21 | Centella Asiatica Pads | pad | soothing, acne |
| 16 | A'PIEU | Tea Tree Spot Serum | serum | acne, pores |
| 17 | SUNGBOON EDITOR | Green Tomato Pore Lifting Serum | serum | pores, brightening |
| 18 | VT | Reedle Shot 100 Facial Boosting First Ampoule | ampoule | hydration, anti-aging |
| 19 | MADECA21 | TECA Solution Soothing Cream | cream | soothing, acne |
| 20 | BONCEPT (TONYMOLY) | Retinol 2500 IU Wrinkle Shot Perfector | cream | anti-aging |
| 21 | VT | Cica Sleeping Mask | mask | soothing, hydration |
| 22 | MEDIPEEL | Extra Super9 Plus Glow Lifting Wrapping Mask | mask | brightening, anti-aging |

---

## Concern Coverage (6 concerns)

`sun-protection` concern removed — no sunscreen products in scope.

| Concern | Count |
|---|---|
| hydration | 12 |
| soothing | 10 |
| acne | 8 |
| pores | 6 |
| brightening | 5 |
| anti-aging | 3 |

Anti-aging is intentionally thin at launch (3 products). All are real, ranked products — no empty state.

---

## Out of Scope

- Sunscreen products (separate product category at Olive Young/Daiso — not skincare)
- `sun-protection` concern (no products to show → removed from concern list)
- Existing 309 products (deactivated via `is_active = false`, not deleted)
