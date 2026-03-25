# Product Catalog Curation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 309-product catalog with 22 curated products sourced from Olive Young KR Awards 2025 and Daiso KR best sellers, across 6 concerns (sun-protection removed).

**Architecture:** Single migration script deactivates all 309 legacy products via `is_active = false`, upserts required ingredients, then upserts the 22 new product records. Concerns are data-driven from Supabase — removing `sun-protection` is a DB delete, no UI changes needed. Brand type in TypeScript needs 8 new entries.

**Tech Stack:** TypeScript, `@supabase/supabase-js`, `tsx`, `.env.local` for credentials

---

## Context

- Products live in Supabase `products` table. `getAllProducts()` filters `is_active = true`
- Concerns live in Supabase `concerns` table — fetched dynamically, nothing hardcoded in UI
- Run scripts with: `npx tsx scripts/db/<script>.ts` from project root
- Credentials from `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Current `Concern` type IDs: `trouble` (= acne), `hydration`, `moisture`, `pores`, `brightening`, `anti-aging`, `soothing`, `exfoliation`
- Design doc: `docs/plans/2026-03-25-product-curation-design.md`

---

## Task 1: Add missing brands to Brand type

**Files:**
- Modify: `src/types/product.ts`

**Step 1: Open the file and locate the `Brand` type**

Current brands end at `"vt-cosmetics"`. Add the 8 missing brands.

**Step 2: Edit the Brand type**

```typescript
export type Brand =
  | "cosrx"
  | "anua"
  | "torriden"
  | "beauty-of-joseon"
  | "round-lab"
  | "skin1004"
  | "klairs"
  | "some-by-mi"
  | "innisfree"
  | "laneige"
  | "isntree"
  | "purito"
  | "mixsoon"
  | "medicube"
  | "tirtir"
  | "numbuzin"
  | "biodance"
  | "illiyoon"
  | "dr-g"
  | "benton"
  | "heimish"
  | "tocobo"
  | "haruharu"
  | "goodal"
  | "dr-jart"
  | "sulwhasoo"
  | "mediheal"
  | "etude"
  | "nature-republic"
  | "missha"
  | "the-face-shop"
  | "banila-co"
  | "ahc"
  | "vt-cosmetics"
  // New brands added for curated catalog
  | "ma-nyo"
  | "aestura"
  | "senka"
  | "madeca21"
  | "boncept"
  | "a-pieu"
  | "sungboon-editor"
  | "medipeel";
```

**Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

**Step 4: Commit**

```bash
git add src/types/product.ts
git commit -m "feat: add 8 new brand IDs for curated catalog"
```

---

## Task 2: Write the migration script

**Files:**
- Create: `scripts/db/curate-products.ts`

**Step 1: Create the file**

```typescript
// scripts/db/curate-products.ts
/**
 * Product catalog curation migration.
 *
 * 1. Deactivates all 309 legacy products (is_active = false)
 * 2. Deletes the sun-protection concern row
 * 3. Upserts required key ingredients (creates if missing)
 * 4. Upserts the 22 curated products as active
 *
 * Run: npx tsx scripts/db/curate-products.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── STEP 1: Key ingredients needed by the 22 products ──────────────────────
// Only defines ingredients that may not already exist in the DB.
// Uses upsert so safe to run multiple times.

const KEY_INGREDIENTS = [
  {
    id: "heartleaf-extract",
    name: { inci: "Houttuynia Cordata Extract", vi: "Chiết xuất lá tâm", ko: "어성초 추출물" },
    description: { vi: "Kháng khuẩn, giảm viêm, làm dịu da kích ứng", en: "Antibacterial, anti-inflammatory, soothes irritated skin" },
    effects: [{ concern: "soothing", grade: "good", reason: { vi: "Làm dịu và kháng khuẩn hiệu quả", en: "Effective soothing and antibacterial" } }, { concern: "trouble", grade: "good", reason: { vi: "Kiểm soát mụn và vi khuẩn", en: "Controls acne-causing bacteria" } }],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "madecassoside",
    name: { inci: "Madecassoside", vi: "Madecassoside", ko: "마데카소사이드" },
    description: { vi: "Phục hồi da tổn thương, giảm viêm, tái tạo collagen", en: "Repairs damaged skin, reduces inflammation, stimulates collagen" },
    effects: [{ concern: "soothing", grade: "good", reason: { vi: "Phục hồi và làm dịu da", en: "Repairs and soothes skin" } }, { concern: "trouble", grade: "good", reason: { vi: "Giảm viêm mụn", en: "Reduces acne inflammation" } }],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "propolis-extract",
    name: { inci: "Propolis Extract", vi: "Chiết xuất keo ong", ko: "프로폴리스 추출물" },
    description: { vi: "Kháng khuẩn, làm dịu, tăng cường độ ẩm và sức sống cho da", en: "Antibacterial, soothing, boosts moisture and radiance" },
    effects: [{ concern: "brightening", grade: "good", reason: { vi: "Làm sáng và đồng đều màu da", en: "Brightens and evens skin tone" } }, { concern: "trouble", grade: "good", reason: { vi: "Kháng khuẩn giảm mụn", en: "Antibacterial to reduce acne" } }],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "retinol",
    name: { inci: "Retinol", vi: "Retinol", ko: "레티놀" },
    description: { vi: "Kích thích tái tạo tế bào, giảm nếp nhăn và cải thiện kết cấu da", en: "Stimulates cell turnover, reduces wrinkles, improves skin texture" },
    effects: [{ concern: "anti-aging", grade: "good", reason: { vi: "Giảm nếp nhăn và tái tạo da", en: "Reduces wrinkles and renews skin" } }],
    ewg_grade: 3,
    category: "vitamin",
  },
  {
    id: "green-tomato-extract",
    name: { inci: "Lycopersicon Esculentum (Tomato) Fruit Extract", vi: "Chiết xuất cà chua xanh", ko: "그린토마토 추출물" },
    description: { vi: "Thu nhỏ lỗ chân lông, làm sáng da và cấp ẩm", en: "Minimizes pores, brightens skin and provides hydration" },
    effects: [{ concern: "pores", grade: "good", reason: { vi: "Thu nhỏ lỗ chân lông hiệu quả", en: "Effectively minimizes pore appearance" } }, { concern: "brightening", grade: "good", reason: { vi: "Cải thiện tông màu da", en: "Improves skin tone" } }],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "reedle-shot-complex",
    name: { inci: "Acetyl Hexapeptide-8", vi: "Peptide vi kim", ko: "리들샷 복합체" },
    description: { vi: "Tăng khả năng thẩm thấu của các hoạt chất, cải thiện độ đàn hồi", en: "Enhances absorption of active ingredients, improves elasticity" },
    effects: [{ concern: "anti-aging", grade: "good", reason: { vi: "Kích thích collagen, cải thiện đàn hồi", en: "Stimulates collagen, improves elasticity" } }, { concern: "hydration", grade: "good", reason: { vi: "Tăng cường hấp thu dưỡng chất", en: "Enhances nutrient absorption" } }],
    ewg_grade: 1,
    category: "peptide",
  },
  {
    id: "silk-extract",
    name: { inci: "Hydrolyzed Silk", vi: "Chiết xuất tơ tằm", ko: "실크 추출물" },
    description: { vi: "Cấp ẩm, làm mềm và tạo lớp màng bảo vệ da", en: "Hydrates, softens and forms a protective film on skin" },
    effects: [{ concern: "hydration", grade: "good", reason: { vi: "Cấp ẩm và làm mềm da", en: "Hydrates and softens skin" } }, { concern: "pores", grade: "good", reason: { vi: "Làm mịn bề mặt da", en: "Smooths skin surface" } }],
    ewg_grade: 1,
    category: "protein",
  },
];

// ─── STEP 2: The 22 curated products ─────────────────────────────────────────
// concern IDs match Supabase concerns table: trouble, hydration, moisture,
// pores, brightening, anti-aging, soothing, exfoliation

const CURATED_PRODUCTS = [
  // ── Olive Young KR Annual Awards 2025 ────────────────────────────────────
  {
    id: "manyo-pure-cleansing-oil",
    slug: "manyo-pure-cleansing-oil",
    name: { ko: "마녀공장 퓨어 클렌징 오일", vi: "Dầu tẩy trang Ma:nyo Pure Cleansing Oil", en: "Ma:nyo Pure Cleansing Oil" },
    brand: "ma-nyo",
    category: "cleanser",
    image: "",
    concerns: ["soothing", "hydration"],
    ingredients: [
      { ingredientId: "mineral-oil", order: 1, isKey: false },
      { ingredientId: "madecassoside", order: 2, isKey: true },
    ],
    popularity: { rank: 1, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "cleansing-oil", "bestseller"],
    is_active: true,
  },
  {
    id: "mediheal-madecassoside-blemish-pad",
    slug: "mediheal-madecassoside-blemish-pad",
    name: { ko: "메디힐 마데카소사이드 블레미쉬 패드", vi: "Pad Mediheal Madecassoside Blemish", en: "Mediheal Madecassoside Blemish Pad" },
    brand: "mediheal",
    category: "pad",
    image: "",
    concerns: ["trouble", "pores", "soothing"],
    ingredients: [
      { ingredientId: "madecassoside", order: 1, isKey: true },
      { ingredientId: "niacinamide", order: 2, isKey: true },
    ],
    popularity: { rank: 2, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "pad", "bestseller", "no1-pad"],
    is_active: true,
  },
  {
    id: "round-lab-1025-dokdo-toner",
    slug: "round-lab-1025-dokdo-toner",
    name: { ko: "라운드랩 1025 독도 토너", vi: "Toner Round Lab 1025 Dokdo", en: "Round Lab 1025 Dokdo Toner" },
    brand: "round-lab",
    category: "toner",
    image: "",
    concerns: ["hydration", "soothing"],
    ingredients: [
      { ingredientId: "hyaluronic-acid", order: 1, isKey: true },
      { ingredientId: "sea-water", order: 2, isKey: false },
    ],
    popularity: { rank: 3, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "toner", "bestseller", "no1-toner"],
    is_active: true,
  },
  {
    id: "torriden-dive-in-serum",
    slug: "torriden-dive-in-serum",
    name: { ko: "토리든 다이브인 세럼", vi: "Serum Torriden Dive-In Low Molecular HA", en: "Torriden DIVE-IN Low Molecular Hyaluronic Acid Serum" },
    brand: "torriden",
    category: "serum",
    image: "",
    concerns: ["hydration"],
    ingredients: [
      { ingredientId: "hyaluronic-acid", order: 1, isKey: true },
    ],
    popularity: { rank: 4, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "serum", "bestseller", "no1-serum"],
    is_active: true,
  },
  {
    id: "aestura-atobarrier-365-cream",
    slug: "aestura-atobarrier-365-cream",
    name: { ko: "에스트라 아토베리어 365 크림", vi: "Kem Aestura ATOBARRIER 365", en: "AESTURA ATOBARRIER 365 Cream" },
    brand: "aestura",
    category: "cream",
    image: "",
    concerns: ["hydration", "soothing"],
    ingredients: [
      { ingredientId: "ceramide-np", order: 1, isKey: true },
      { ingredientId: "panthenol", order: 2, isKey: true },
    ],
    popularity: { rank: 5, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "cream", "bestseller", "no1-cream"],
    is_active: true,
  },
  {
    id: "torriden-dive-in-mask",
    slug: "torriden-dive-in-mask",
    name: { ko: "토리든 다이브인 마스크", vi: "Mặt nạ Torriden Dive-In Hyaluronic Acid", en: "Torriden DIVE-IN Hyaluronic Acid Mask" },
    brand: "torriden",
    category: "mask",
    image: "",
    concerns: ["hydration"],
    ingredients: [
      { ingredientId: "hyaluronic-acid", order: 1, isKey: true },
    ],
    popularity: { rank: 6, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "mask", "bestseller", "no1-mask"],
    is_active: true,
  },
  {
    id: "anua-heartleaf-77-toner",
    slug: "anua-heartleaf-77-toner",
    name: { ko: "아누아 어성초 77% 진정 토너", vi: "Toner Anua Heartleaf 77% Soothing", en: "Anua Heartleaf 77% Soothing Toner" },
    brand: "anua",
    category: "toner",
    image: "",
    concerns: ["soothing", "trouble"],
    ingredients: [
      { ingredientId: "heartleaf-extract", order: 1, isKey: true },
    ],
    popularity: { rank: 7, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "toner", "bestseller"],
    is_active: true,
  },
  {
    id: "cosrx-advanced-snail-96-essence",
    slug: "cosrx-advanced-snail-96-essence",
    name: { ko: "COSRX 어드밴스드 스네일 96 뮤신 에센스", vi: "Essence COSRX Advanced Snail 96 Mucin", en: "COSRX Advanced Snail 96 Mucin Power Essence" },
    brand: "cosrx",
    category: "essence",
    image: "",
    concerns: ["hydration", "soothing", "trouble"],
    ingredients: [
      { ingredientId: "snail-secretion-filtrate", order: 1, isKey: true },
    ],
    popularity: { rank: 8, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "essence", "bestseller"],
    is_active: true,
  },
  {
    id: "beauty-of-joseon-glow-serum",
    slug: "beauty-of-joseon-glow-serum",
    name: { ko: "조선미녀 글로우 세럼 프로폴리스 나이아신아마이드", vi: "Serum Beauty of Joseon Glow Propolis + Niacinamide", en: "Beauty of Joseon Glow Serum: Propolis + Niacinamide" },
    brand: "beauty-of-joseon",
    category: "serum",
    image: "",
    concerns: ["brightening", "trouble", "pores"],
    ingredients: [
      { ingredientId: "niacinamide", order: 1, isKey: true },
      { ingredientId: "propolis-extract", order: 2, isKey: true },
    ],
    popularity: { rank: 9, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "serum", "bestseller"],
    is_active: true,
  },
  {
    id: "numbuzin-no3-essence-toner",
    slug: "numbuzin-no3-essence-toner",
    name: { ko: "넘버즈인 3번 수퍼 글로잉 에센스 토너", vi: "Toner Numbuzin No.3 Super Glowing Essence", en: "numbuzin No.3 Super Glowing Essence Toner" },
    brand: "numbuzin",
    category: "toner",
    image: "",
    concerns: ["brightening", "hydration"],
    ingredients: [
      { ingredientId: "niacinamide", order: 1, isKey: true },
      { ingredientId: "hyaluronic-acid", order: 2, isKey: true },
    ],
    popularity: { rank: 10, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "toner", "bestseller"],
    is_active: true,
  },
  {
    id: "cosrx-low-ph-gel-cleanser",
    slug: "cosrx-low-ph-gel-cleanser",
    name: { ko: "COSRX 로우 pH 굿모닝 젤 클렌저", vi: "Sữa rửa mặt COSRX Low pH Good Morning Gel", en: "COSRX Low pH Good Morning Gel Cleanser" },
    brand: "cosrx",
    category: "cleanser",
    image: "",
    concerns: ["trouble", "pores"],
    ingredients: [
      { ingredientId: "salicylic-acid", order: 1, isKey: true },
      { ingredientId: "tea-tree", order: 2, isKey: true },
    ],
    popularity: { rank: 11, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "cleanser", "bestseller"],
    is_active: true,
  },
  {
    id: "beauty-of-joseon-radiance-cleansing-balm",
    slug: "beauty-of-joseon-radiance-cleansing-balm",
    name: { ko: "조선미녀 라디언스 클렌징 밤", vi: "Dầu tẩy trang Beauty of Joseon Radiance Cleansing Balm", en: "Beauty of Joseon Radiance Cleansing Balm" },
    brand: "beauty-of-joseon",
    category: "cleanser",
    image: "",
    concerns: ["brightening", "hydration"],
    ingredients: [
      { ingredientId: "niacinamide", order: 1, isKey: true },
      { ingredientId: "rice-extract", order: 2, isKey: false },
    ],
    popularity: { rank: 12, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "cleanser", "bestseller"],
    is_active: true,
  },
  {
    id: "round-lab-1025-dokdo-cleanser",
    slug: "round-lab-1025-dokdo-cleanser",
    name: { ko: "라운드랩 1025 독도 클렌저", vi: "Sữa rửa mặt Round Lab 1025 Dokdo", en: "Round Lab 1025 Dokdo Cleanser" },
    brand: "round-lab",
    category: "cleanser",
    image: "",
    concerns: ["hydration", "soothing"],
    ingredients: [
      { ingredientId: "hyaluronic-acid", order: 1, isKey: true },
    ],
    popularity: { rank: 13, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "cleanser", "bestseller"],
    is_active: true,
  },

  // ── Daiso KR Best Sellers ────────────────────────────────────────────────
  {
    id: "vt-reedle-shot-100-ampoule",
    slug: "vt-reedle-shot-100-ampoule",
    name: { ko: "VT 리들샷 100 페이셜 부스팅 퍼스트 앰플", vi: "Ampoule VT Reedle Shot 100 Facial Boosting First", en: "VT Reedle Shot 100 Facial Boosting First Ampoule" },
    brand: "vt-cosmetics",
    category: "ampoule",
    image: "",
    concerns: ["hydration", "anti-aging"],
    ingredients: [
      { ingredientId: "reedle-shot-complex", order: 1, isKey: true },
      { ingredientId: "hyaluronic-acid", order: 2, isKey: true },
    ],
    popularity: { rank: 14, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["daiso-kr", "ampoule", "bestseller"],
    is_active: true,
  },
  {
    id: "sungboon-editor-green-tomato-serum",
    slug: "sungboon-editor-green-tomato-serum",
    name: { ko: "성분편집자 그린토마토 모공 리프팅 세럼", vi: "Serum SUNGBOON EDITOR Green Tomato Pore Lifting", en: "SUNGBOON EDITOR Green Tomato Pore Lifting Serum Plain" },
    brand: "sungboon-editor",
    category: "serum",
    image: "",
    concerns: ["pores", "brightening"],
    ingredients: [
      { ingredientId: "green-tomato-extract", order: 1, isKey: true },
      { ingredientId: "niacinamide", order: 2, isKey: true },
    ],
    popularity: { rank: 15, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["daiso-kr", "serum", "bestseller"],
    is_active: true,
  },
  {
    id: "apieu-tea-tree-spot-serum",
    slug: "apieu-tea-tree-spot-serum",
    name: { ko: "아피우 더 퓨어 티트리 스팟 세럼", vi: "Serum A'PIEU Tea Tree Spot", en: "A'PIEU The Pure Tea Tree Spot Serum" },
    brand: "a-pieu",
    category: "serum",
    image: "",
    concerns: ["trouble", "pores"],
    ingredients: [
      { ingredientId: "tea-tree", order: 1, isKey: true },
      { ingredientId: "salicylic-acid", order: 2, isKey: true },
    ],
    popularity: { rank: 16, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["daiso-kr", "serum", "bestseller"],
    is_active: true,
  },
  {
    id: "madeca21-teca-soothing-cream",
    slug: "madeca21-teca-soothing-cream",
    name: { ko: "마데카21 테카 솔루션 수딩 크림", vi: "Kem MADECA21 TECA Solution Soothing", en: "MADECA21 TECA Solution Soothing Cream" },
    brand: "madeca21",
    category: "cream",
    image: "",
    concerns: ["soothing", "trouble"],
    ingredients: [
      { ingredientId: "madecassoside", order: 1, isKey: true },
      { ingredientId: "centella-asiatica", order: 2, isKey: true },
    ],
    popularity: { rank: 17, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["daiso-kr", "cream", "bestseller"],
    is_active: true,
  },
  {
    id: "madeca21-centella-pads",
    slug: "madeca21-centella-pads",
    name: { ko: "마데카21 센텔라 아시아티카 패드", vi: "Pad MADECA21 Centella Asiatica", en: "MADECA21 Centella Asiatica Pads" },
    brand: "madeca21",
    category: "pad",
    image: "",
    concerns: ["soothing", "trouble"],
    ingredients: [
      { ingredientId: "centella-asiatica", order: 1, isKey: true },
      { ingredientId: "madecassoside", order: 2, isKey: true },
    ],
    popularity: { rank: 18, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["daiso-kr", "pad", "bestseller"],
    is_active: true,
  },
  {
    id: "boncept-retinol-2500-cream",
    slug: "boncept-retinol-2500-cream",
    name: { ko: "본셉트 레티놀 2500 IU 링클 샷 퍼펙터", vi: "Kem BONCEPT Retinol 2500 IU Wrinkle Shot Perfector", en: "BONCEPT Retinol 2500 IU Wrinkle Shot Perfector" },
    brand: "boncept",
    category: "cream",
    image: "",
    concerns: ["anti-aging"],
    ingredients: [
      { ingredientId: "retinol", order: 1, isKey: true },
    ],
    popularity: { rank: 19, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["daiso-kr", "cream", "bestseller", "retinol"],
    is_active: true,
  },
  {
    id: "vt-cica-sleeping-mask",
    slug: "vt-cica-sleeping-mask",
    name: { ko: "VT 시카 슬리핑 마스크", vi: "Mặt nạ ngủ VT Cica Sleeping Mask", en: "VT Cica Sleeping Mask" },
    brand: "vt-cosmetics",
    category: "mask",
    image: "",
    concerns: ["soothing", "hydration"],
    ingredients: [
      { ingredientId: "centella-asiatica", order: 1, isKey: true },
      { ingredientId: "hyaluronic-acid", order: 2, isKey: true },
    ],
    popularity: { rank: 20, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["daiso-kr", "mask", "bestseller"],
    is_active: true,
  },
  {
    id: "medipeel-extra-super9-glow-mask",
    slug: "medipeel-extra-super9-glow-mask",
    name: { ko: "메디필 엑스트라 슈퍼9 플러스 글로우 리프팅 마스크", vi: "Mặt nạ MEDIPEEL Extra Super9 Plus Glow Lifting Wrapping", en: "MEDIPEEL Extra Super9 Plus Glow Lifting Wrapping Mask" },
    brand: "medipeel",
    category: "mask",
    image: "",
    concerns: ["brightening", "anti-aging"],
    ingredients: [
      { ingredientId: "niacinamide", order: 1, isKey: true },
      { ingredientId: "peptide", order: 2, isKey: true },
    ],
    popularity: { rank: 21, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["daiso-kr", "mask", "bestseller"],
    is_active: true,
  },
  {
    id: "senka-perfect-whip-cleanser",
    slug: "senka-perfect-whip-cleanser",
    name: { ko: "센카 퍼펙트 휩 클렌저", vi: "Sữa rửa mặt SENKA Perfect Whip", en: "SENKA Perfect Whip Cleanser" },
    brand: "senka",
    category: "cleanser",
    image: "",
    concerns: ["hydration", "pores"],
    ingredients: [
      { ingredientId: "silk-extract", order: 1, isKey: true },
      { ingredientId: "hyaluronic-acid", order: 2, isKey: true },
    ],
    popularity: { rank: 22, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["daiso-kr", "cleanser", "bestseller"],
    is_active: true,
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Starting product catalog curation...\n");

  // 1. Deactivate all current products
  console.log("Step 1: Deactivating all legacy products...");
  const { error: deactivateError, count } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("is_active", true)
    .select("id", { count: "exact", head: true });

  if (deactivateError) {
    console.error("Failed to deactivate products:", deactivateError.message);
    process.exit(1);
  }
  console.log(`  ✓ Deactivated ${count ?? "all"} legacy products\n`);

  // 2. Remove sun-protection concern (if it exists)
  console.log("Step 2: Removing sun-protection concern...");
  const { error: concernError } = await supabase
    .from("concerns")
    .delete()
    .eq("id", "sun-protection");

  if (concernError) {
    // Not a fatal error — may not exist
    console.log("  ℹ sun-protection concern not found or already removed\n");
  } else {
    console.log("  ✓ sun-protection concern removed\n");
  }

  // 3. Upsert key ingredients
  console.log("Step 3: Upserting key ingredients...");
  const { error: ingError } = await supabase
    .from("ingredients")
    .upsert(KEY_INGREDIENTS, { onConflict: "id" });

  if (ingError) {
    console.error("Failed to upsert ingredients:", ingError.message);
    process.exit(1);
  }
  console.log(`  ✓ ${KEY_INGREDIENTS.length} ingredients upserted\n`);

  // 4. Upsert the 22 curated products
  console.log("Step 4: Upserting 22 curated products...");
  const { error: productError } = await supabase
    .from("products")
    .upsert(CURATED_PRODUCTS, { onConflict: "id" });

  if (productError) {
    console.error("Failed to upsert products:", productError.message);
    process.exit(1);
  }
  console.log(`  ✓ ${CURATED_PRODUCTS.length} products upserted\n`);

  console.log("✓ Catalog curation complete!");
  console.log("  → Legacy products: is_active = false");
  console.log("  → sun-protection concern: removed");
  console.log("  → Active products: 22 (Olive Young Awards 2025 + Daiso KR)");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
```

**Step 2: Commit the script before running it (safety checkpoint)**

```bash
git add scripts/db/curate-products.ts
git commit -m "feat: add product curation migration script"
```

---

## Task 3: Run the migration

**Step 1: Verify you have credentials**

```bash
grep SUPABASE .env.local
```

Expected: both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present

**Step 2: Dry-run check — confirm current product count**

```bash
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const { count } = await sb.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true);
console.log('Active products before migration:', count);
"
```

Expected: ~309

**Step 3: Run the migration**

```bash
npx tsx scripts/db/curate-products.ts
```

Expected output:
```
Starting product catalog curation...

Step 1: Deactivating all legacy products...
  ✓ Deactivated 309 legacy products

Step 2: Removing sun-protection concern...
  ✓ sun-protection concern removed (or not found)

Step 3: Upserting key ingredients...
  ✓ 7 ingredients upserted

Step 4: Upserting 22 curated products...
  ✓ 22 products upserted

✓ Catalog curation complete!
```

**Step 4: Verify active product count**

```bash
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const { count } = await sb.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true);
console.log('Active products after migration:', count);
"
```

Expected: 22

**Step 5: Commit**

```bash
git add scripts/db/curate-products.ts
git commit -m "feat: curate catalog to 22 products (Olive Young Awards 2025 + Daiso KR)"
```

---

## Task 4: Verify build

**Step 1: Run production build**

```bash
npm run build
```

Expected: no TypeScript errors, no build errors. If you see errors about brand types, check `src/types/product.ts` was saved correctly from Task 1.

**Step 2: Spot-check the home page locally**

```bash
npm run dev
```

Open `http://localhost:3001/vi/` and verify:
- Concern filter bar shows 6 concerns (no sun-protection)
- Product grid loads and shows products
- Each product card shows an ingredient signal

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: verify build after catalog curation"
```

---

## Rollback (if needed)

To restore all 309 legacy products:

```bash
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const { error } = await sb.from('products').update({ is_active: true }).neq('id', 'placeholder');
if (error) console.error(error);
else console.log('All products reactivated');
"
```

---

## Notes

- **Images are empty** (`image: ""`). Product images need to be sourced and uploaded separately — do not block launch on this. The product card renders without an image (shows grey placeholder).
- **Ingredient IDs** like `hyaluronic-acid`, `niacinamide`, `ceramide-np`, `salicylic-acid`, `tea-tree`, `centella-asiatica`, `snail-secretion-filtrate`, `rice-extract`, `peptide` are assumed to exist in the DB from the original seed. If a product upsert fails with a foreign key error, check which ingredient IDs are missing and add them to `KEY_INGREDIENTS`.
- **Purchase links** are empty — add Shopee/Hasaki links in a follow-up task.
