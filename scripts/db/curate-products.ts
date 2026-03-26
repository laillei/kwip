// scripts/db/curate-products.ts
/**
 * Product catalog curation migration.
 * Run with: npx tsx scripts/db/curate-products.ts
 *
 * Steps:
 *   1. Deactivate all legacy products (set is_active = false)
 *   2. Remove sun-protection concern (non-fatal if missing)
 *   3. Upsert key ingredients
 *   4. Upsert 19 curated products from Olive Young top ranking (as is_active: true)
 *
 * Source: Olive Young KR skincare sales ranking (2026-03-26)
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load .env.local (Next.js convention)
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------------------------------------------------------------------------
// Key ingredients to upsert
// ---------------------------------------------------------------------------

const KEY_INGREDIENTS = [
  {
    id: "heartleaf-extract",
    name: { inci: "Houttuynia Cordata Extract", vi: "Chiết xuất lá tâm", ko: "어성초 추출물" },
    description: { vi: "Kháng khuẩn, giảm viêm, làm dịu da kích ứng", en: "Antibacterial, anti-inflammatory, soothes irritated skin" },
    effects: [
      { concern: "soothing", grade: "good", reason: { vi: "Làm dịu và kháng khuẩn hiệu quả", en: "Effective soothing and antibacterial" } },
      { concern: "trouble", grade: "good", reason: { vi: "Kiểm soát mụn và vi khuẩn", en: "Controls acne-causing bacteria" } },
    ],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "madecassoside",
    name: { inci: "Madecassoside", vi: "Madecassoside", ko: "마데카소사이드" },
    description: { vi: "Phục hồi da tổn thương, giảm viêm, tái tạo collagen", en: "Repairs damaged skin, reduces inflammation, stimulates collagen" },
    effects: [
      { concern: "soothing", grade: "good", reason: { vi: "Phục hồi và làm dịu da", en: "Repairs and soothes skin" } },
      { concern: "trouble", grade: "good", reason: { vi: "Giảm viêm mụn", en: "Reduces acne inflammation" } },
    ],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "propolis-extract",
    name: { inci: "Propolis Extract", vi: "Chiết xuất keo ong", ko: "프로폴리스 추출물" },
    description: { vi: "Kháng khuẩn, làm dịu, tăng cường độ ẩm và sức sống cho da", en: "Antibacterial, soothing, boosts moisture and radiance" },
    effects: [
      { concern: "brightening", grade: "good", reason: { vi: "Làm sáng và đồng đều màu da", en: "Brightens and evens skin tone" } },
      { concern: "trouble", grade: "good", reason: { vi: "Kháng khuẩn giảm mụn", en: "Antibacterial to reduce acne" } },
    ],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "retinol",
    name: { inci: "Retinol", vi: "Retinol", ko: "레티놀" },
    description: { vi: "Kích thích tái tạo tế bào, giảm nếp nhăn và cải thiện kết cấu da", en: "Stimulates cell turnover, reduces wrinkles, improves skin texture" },
    effects: [
      { concern: "anti-aging", grade: "good", reason: { vi: "Giảm nếp nhăn và tái tạo da", en: "Reduces wrinkles and renews skin" } },
    ],
    ewg_grade: 3,
    category: "vitamin",
  },
  {
    id: "niacinamide",
    name: { inci: "Niacinamide", vi: "Niacinamide", ko: "나이아신아마이드" },
    description: { vi: "Giảm thâm nám, thu nhỏ lỗ chân lông, điều tiết bã nhờn", en: "Fades dark spots, minimizes pores, regulates sebum" },
    effects: [
      { concern: "brightening", grade: "good", reason: { vi: "Giảm thâm nám và đồng đều màu da", en: "Fades hyperpigmentation and evens skin tone" } },
      { concern: "pores", grade: "good", reason: { vi: "Thu nhỏ lỗ chân lông và kiểm soát dầu", en: "Minimizes pores and controls oil" } },
      { concern: "trouble", grade: "good", reason: { vi: "Kháng khuẩn và giảm viêm mụn", en: "Antibacterial and reduces acne inflammation" } },
    ],
    ewg_grade: 1,
    category: "vitamin",
  },
  {
    id: "hyaluronic-acid",
    name: { inci: "Sodium Hyaluronate", vi: "Axit hyaluronic", ko: "히알루론산" },
    description: { vi: "Cấp ẩm sâu, giữ nước và làm đầy da", en: "Deep hydration, water retention, plumps skin" },
    effects: [
      { concern: "hydration", grade: "good", reason: { vi: "Giữ nước, cấp ẩm sâu cho da", en: "Retains water and deeply hydrates skin" } },
    ],
    ewg_grade: 1,
    category: "humectant",
  },
  {
    id: "snail-secretion-filtrate",
    name: { inci: "Snail Secretion Filtrate", vi: "Dịch nhớt ốc sên", ko: "달팽이 분비물 여과물" },
    description: { vi: "Phục hồi da, làm dịu, tái tạo và cấp ẩm chuyên sâu", en: "Repairs skin, soothes, regenerates and deeply moisturizes" },
    effects: [
      { concern: "hydration", grade: "good", reason: { vi: "Cấp ẩm sâu và phục hồi da", en: "Deep hydration and skin repair" } },
      { concern: "soothing", grade: "good", reason: { vi: "Làm dịu và phục hồi vùng da kích ứng", en: "Soothes and heals irritated skin" } },
      { concern: "trouble", grade: "good", reason: { vi: "Hỗ trợ làm lành mụn và giảm sẹo", en: "Aids acne healing and reduces scarring" } },
    ],
    ewg_grade: 1,
    category: "biological",
  },
  {
    id: "centella-asiatica",
    name: { inci: "Centella Asiatica Extract", vi: "Rau má", ko: "센텔라 아시아티카" },
    description: { vi: "Làm dịu, phục hồi và chống viêm cho da nhạy cảm", en: "Soothes, repairs and reduces inflammation for sensitive skin" },
    effects: [
      { concern: "soothing", grade: "good", reason: { vi: "Làm dịu và phục hồi da kích ứng", en: "Soothes and repairs irritated skin" } },
      { concern: "trouble", grade: "good", reason: { vi: "Kháng viêm, hỗ trợ làm lành mụn", en: "Anti-inflammatory, helps heal acne" } },
    ],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "ceramide-np",
    name: { inci: "Ceramide NP", vi: "Ceramide", ko: "세라마이드 NP" },
    description: { vi: "Phục hồi hàng rào bảo vệ da, ngăn mất nước qua da", en: "Restores skin barrier, prevents transepidermal water loss" },
    effects: [
      { concern: "hydration", grade: "good", reason: { vi: "Khóa ẩm và phục hồi hàng rào bảo vệ da", en: "Locks in moisture and restores barrier" } },
      { concern: "soothing", grade: "good", reason: { vi: "Tăng cường hàng rào bảo vệ, giảm nhạy cảm", en: "Strengthens barrier and reduces sensitivity" } },
    ],
    ewg_grade: 1,
    category: "lipid",
  },
  {
    id: "panthenol",
    name: { inci: "Panthenol", vi: "Panthenol (Pro-Vitamin B5)", ko: "판테놀" },
    description: { vi: "Dưỡng ẩm, làm dịu và phục hồi da bị tổn thương", en: "Moisturizes, soothes and repairs damaged skin" },
    effects: [
      { concern: "hydration", grade: "good", reason: { vi: "Hút và giữ ẩm hiệu quả", en: "Effectively attracts and retains moisture" } },
      { concern: "soothing", grade: "good", reason: { vi: "Làm dịu và hỗ trợ phục hồi da", en: "Soothes and aids skin recovery" } },
    ],
    ewg_grade: 1,
    category: "vitamin",
  },
  {
    id: "salicylic-acid",
    name: { inci: "Salicylic Acid", vi: "Axit salicylic (BHA)", ko: "살리실산" },
    description: { vi: "Tẩy tế bào chết sâu trong lỗ chân lông, kiểm soát mụn và se khít lỗ chân lông", en: "Deep exfoliates inside pores, controls acne and tightens pores" },
    effects: [
      { concern: "trouble", grade: "good", reason: { vi: "Thâm nhập vào lỗ chân lông, loại bỏ bã nhờn và vi khuẩn gây mụn", en: "Penetrates pores to remove sebum and acne-causing bacteria" } },
      { concern: "pores", grade: "good", reason: { vi: "Tẩy sạch bên trong lỗ chân lông, giúp se khít", en: "Cleans inside pores to minimize their appearance" } },
    ],
    ewg_grade: 3,
    category: "acid",
  },
  // New ingredients for Olive Young top ranking products
  {
    id: "pdrn",
    name: { inci: "Sodium DNA", vi: "PDRN (Polydeoxyribonucleotide)", ko: "PDRN (폴리데옥시리보뉴클레오타이드)" },
    description: { vi: "Tái tạo tế bào da, tăng cường collagen và elastin, phục hồi da hư tổn", en: "Regenerates skin cells, boosts collagen and elastin, repairs damaged skin" },
    effects: [
      { concern: "anti-aging", grade: "good", reason: { vi: "Kích thích tái tạo collagen và tế bào", en: "Stimulates collagen regeneration and cell renewal" } },
      { concern: "hydration", grade: "good", reason: { vi: "Tăng cường giữ ẩm và cấp nước cho da", en: "Enhances moisture retention and skin hydration" } },
      { concern: "soothing", grade: "good", reason: { vi: "Phục hồi và làm dịu da hư tổn", en: "Repairs and soothes damaged skin" } },
    ],
    ewg_grade: 1,
    category: "biological",
  },
  {
    id: "hydroquinone",
    name: { inci: "Hydroquinone", vi: "Hydroquinone", ko: "히드로퀴논" },
    description: { vi: "Ức chế sản xuất melanin, làm mờ đốm nâu và vết thâm hiệu quả", en: "Inhibits melanin production, fades dark spots and hyperpigmentation" },
    effects: [
      { concern: "brightening", grade: "good", reason: { vi: "Làm mờ nám, tàn nhang và đốm nâu", en: "Fades melasma, freckles, and dark spots" } },
    ],
    ewg_grade: 4,
    category: "depigmenting",
  },
  {
    id: "squalane",
    name: { inci: "Squalane", vi: "Squalane", ko: "스쿠알란" },
    description: { vi: "Dưỡng ẩm nhẹ không gây bít lỗ chân lông, phục hồi độ mềm mại cho da", en: "Lightweight non-comedogenic moisturizer, restores skin softness and suppleness" },
    effects: [
      { concern: "hydration", grade: "good", reason: { vi: "Khóa ẩm, làm mềm da mà không gây bít lỗ chân lông", en: "Locks in moisture and softens skin without clogging pores" } },
      { concern: "soothing", grade: "good", reason: { vi: "Cân bằng da, giảm kích ứng", en: "Balances skin and reduces irritation" } },
    ],
    ewg_grade: 1,
    category: "emollient",
  },
  {
    id: "white-truffle-extract",
    name: { inci: "Tuber Magnatum Extract", vi: "Chiết xuất nấm truffle trắng", ko: "화이트 트러플 추출물" },
    description: { vi: "Chống oxy hóa mạnh, dưỡng ẩm và cải thiện độ đàn hồi cho da", en: "Powerful antioxidant, hydrates and improves skin elasticity" },
    effects: [
      { concern: "anti-aging", grade: "good", reason: { vi: "Chống oxy hóa, ngăn ngừa lão hóa da", en: "Antioxidant protection against skin aging" } },
      { concern: "hydration", grade: "good", reason: { vi: "Cấp ẩm và phục hồi độ đàn hồi", en: "Hydrates and restores elasticity" } },
    ],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "collagen",
    name: { inci: "Hydrolyzed Collagen", vi: "Collagen thủy phân", ko: "가수분해 콜라겐" },
    description: { vi: "Cấp ẩm, làm đầy và tăng cường độ đàn hồi cho da", en: "Hydrates, plumps and improves skin firmness and elasticity" },
    effects: [
      { concern: "anti-aging", grade: "good", reason: { vi: "Tăng độ đàn hồi và làm đầy da", en: "Improves elasticity and plumps skin" } },
      { concern: "hydration", grade: "good", reason: { vi: "Cấp ẩm sâu và giữ nước trong da", en: "Deep hydration and water retention" } },
    ],
    ewg_grade: 1,
    category: "protein",
  },
  {
    id: "green-tangerine-extract",
    name: { inci: "Citrus Tangerina Fruit Extract", vi: "Chiết xuất quýt xanh (Vitamin C tự nhiên)", ko: "청귤 추출물" },
    description: { vi: "Nguồn Vitamin C tự nhiên, làm sáng da, mờ thâm nám và chống oxy hóa", en: "Natural Vitamin C source, brightens skin, fades dark spots and protects against oxidation" },
    effects: [
      { concern: "brightening", grade: "good", reason: { vi: "Làm sáng da và mờ vết thâm hiệu quả", en: "Brightens skin and effectively fades dark spots" } },
      { concern: "anti-aging", grade: "good", reason: { vi: "Chống oxy hóa, ngăn ngừa lão hóa sớm", en: "Antioxidant protection against premature aging" } },
    ],
    ewg_grade: 1,
    category: "botanical",
  },
];

// ---------------------------------------------------------------------------
// Curated products — Olive Young KR skincare sales ranking (2026-03-26)
// ---------------------------------------------------------------------------

const CURATED_PRODUCTS = [
  // Rank 1
  {
    id: "dong-a-pigmentation-pro-cream",
    slug: "dong-a-pigmentation-pro-cream",
    name: { ko: "동아제약 색소침착 프로 크림제 40ml", vi: "Kem trị thâm nám Dong-A Pigmentation Pro Cream 40ml", en: "Dong-A Pharmaceutical Pigmentation Pro Cream 40ml" },
    brand: "dong-a",
    category: "cream",
    image: "",
    concerns: ["brightening"],
    ingredients: [{ ingredientId: "hydroquinone", order: 1, isKey: true }],
    popularity: { rank: 1, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "cream", "bestseller", "brightening"],
    is_active: true,
  },
  // Rank 2
  {
    id: "anua-pdrn-hyaluronic-serum",
    slug: "anua-pdrn-hyaluronic-serum",
    name: { ko: "아누아 PDRN 히알루론산 캡슐 100 세럼 30ml", vi: "Serum Anua PDRN Hyaluronic Acid Capsule 100 30ml", en: "Anua PDRN Hyaluronic Acid Capsule 100 Serum 30ml" },
    brand: "anua",
    category: "serum",
    image: "https://cafe24img.poxo.com/anuaskincare/web/product/big/202412/fdeb936c45e5f4fce59b45fb4ef3aab7.png",
    concerns: ["hydration", "anti-aging", "soothing"],
    ingredients: [
      { ingredientId: "pdrn", order: 1, isKey: true },
      { ingredientId: "hyaluronic-acid", order: 2, isKey: true },
    ],
    popularity: { rank: 2, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "serum", "bestseller"],
    is_active: true,
  },
  // Rank 3
  {
    id: "dong-a-pigmentation-pro-solution",
    slug: "dong-a-pigmentation-pro-solution",
    name: { ko: "동아제약 색소침착 프로 액제 30ml", vi: "Dung dịch trị thâm nám Dong-A Pigmentation Pro Solution 30ml", en: "Dong-A Pharmaceutical Pigmentation Pro Solution 30ml" },
    brand: "dong-a",
    category: "serum",
    image: "",
    concerns: ["brightening"],
    ingredients: [{ ingredientId: "hydroquinone", order: 1, isKey: true }],
    popularity: { rank: 3, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "serum", "bestseller", "brightening"],
    is_active: true,
  },
  // Rank 4
  {
    id: "medicube-pdrn-pink-mist-serum",
    slug: "medicube-pdrn-pink-mist-serum",
    name: { ko: "메디큐브 PDRN 핑크 콜라겐 젤리 미스트세럼 100ml", vi: "Xịt dưỡng Medicube PDRN Pink Collagen Jelly Mist Serum 100ml", en: "Medicube PDRN Pink Collagen Jelly Mist Serum 100ml" },
    brand: "medicube",
    category: "mist",
    image: "https://cafe24img.poxo.com/medicube0/web/product/big/202602/127a7dbf4cf9359ea71681da46d09f0d.png",
    concerns: ["hydration", "brightening", "anti-aging"],
    ingredients: [
      { ingredientId: "pdrn", order: 1, isKey: true },
      { ingredientId: "collagen", order: 2, isKey: true },
    ],
    popularity: { rank: 4, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "mist", "bestseller"],
    is_active: true,
  },
  // Rank 6 (rank 5 was a set — skipped; rank 6 is single product)
  {
    id: "torriden-dive-in-serum",
    slug: "torriden-dive-in-serum",
    name: { ko: "토리든 다이브인 세럼", vi: "Serum Torriden Dive-In Low Molecular HA", en: "Torriden DIVE-IN Low Molecular Hyaluronic Acid Serum" },
    brand: "torriden",
    category: "serum",
    image: "",
    concerns: ["hydration"],
    ingredients: [{ ingredientId: "hyaluronic-acid", order: 1, isKey: true }],
    popularity: { rank: 6, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "serum", "bestseller", "no1-serum"],
    is_active: true,
  },
  // Rank 7
  {
    id: "wellage-real-hyaluronic-ampoule",
    slug: "wellage-real-hyaluronic-ampoule",
    name: { ko: "웰라쥬 리얼 히알루로닉 블루 100 앰플 100ml", vi: "Ampoule Wellage Real Hyaluronic Blue 100 100ml", en: "Wellage Real Hyaluronic Blue 100 Ampoule 100ml" },
    brand: "wellage",
    category: "ampoule",
    image: "https://cafe24img.poxo.com/hugelpharma/web/product/big/202603/222398542243469e4bae4e2f4b0dd302.jpg",
    concerns: ["hydration", "anti-aging"],
    ingredients: [{ ingredientId: "hyaluronic-acid", order: 1, isKey: true }],
    popularity: { rank: 7, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "ampoule", "bestseller"],
    is_active: true,
  },
  // Rank 8 (rank 5 was a bundle of the same product — using rank 8 as canonical single)
  {
    id: "la-roche-posay-cicaplast-baume-b5",
    slug: "la-roche-posay-cicaplast-baume-b5",
    name: { ko: "라로슈포제 시카플라스트 밤 B5+ 100ml", vi: "Kem dưỡng La Roche-Posay Cicaplast Baume B5+ 100ml", en: "La Roche-Posay Cicaplast Baume B5+ 100ml" },
    brand: "la-roche-posay",
    category: "cream",
    image: "https://www.larocheposay.co.kr/upload/product/main/2025/12/20251219_1519016_847.png",
    concerns: ["soothing", "hydration"],
    ingredients: [
      { ingredientId: "panthenol", order: 1, isKey: true },
      { ingredientId: "madecassoside", order: 2, isKey: true },
    ],
    popularity: { rank: 8, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "cream", "bestseller"],
    is_active: true,
  },
  // Rank 9
  {
    id: "dalba-white-truffle-spray-serum",
    slug: "dalba-white-truffle-spray-serum",
    name: { ko: "달바 화이트 트러플 퍼스트 스프레이 세럼 100ml", vi: "Xịt dưỡng d'Alba White Truffle First Spray Serum 100ml", en: "d'Alba White Truffle First Spray Serum 100ml" },
    brand: "dalba",
    category: "serum",
    image: "https://godomall.speedycdn.net/95803ed2b538f43d548bda9185c01365/goods/1000000043/image/main/1000000043_main_040.png",
    concerns: ["hydration", "brightening", "anti-aging"],
    ingredients: [
      { ingredientId: "white-truffle-extract", order: 1, isKey: true },
      { ingredientId: "niacinamide", order: 2, isKey: true },
    ],
    popularity: { rank: 9, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "serum", "bestseller"],
    is_active: true,
  },
  // Rank 10
  {
    id: "s-nature-aqua-squalane-cream",
    slug: "s-nature-aqua-squalane-cream",
    name: { ko: "에스네이처 아쿠아 스쿠알란 수분크림 60ml", vi: "Kem dưỡng ẩm S.NATURE Aqua Squalane 60ml", en: "S.NATURE Aqua Squalane Moisturizing Cream 60ml" },
    brand: "s-nature",
    category: "cream",
    image: "https://snature.kr/web/product/big/202601/2b8809cec46e7e82125c8391ebd024ab.jpg",
    concerns: ["hydration", "pores", "soothing"],
    ingredients: [{ ingredientId: "squalane", order: 1, isKey: true }],
    popularity: { rank: 10, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "cream", "bestseller"],
    is_active: true,
  },
  // Rank 11
  {
    id: "biodance-collagen-peptide-serum",
    slug: "biodance-collagen-peptide-serum",
    name: { ko: "바이오던스 포어 퍼펙팅 콜라겐 펩타이드 세럼 30ml", vi: "Serum BioDance Pore Perfecting Collagen Peptide 30ml", en: "BioDance Pore Perfecting Collagen Peptide Serum 30ml" },
    brand: "biodance",
    category: "serum",
    image: "https://biodance.co.kr/web/product/big/202508/37ef08ff3d64d68d2d7e3129334dc2ff.jpg",
    concerns: ["pores", "anti-aging"],
    ingredients: [{ ingredientId: "collagen", order: 1, isKey: true }],
    popularity: { rank: 11, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "serum", "bestseller"],
    is_active: true,
  },
  // Rank 12
  {
    id: "mediheal-madecassoside-repair-serum",
    slug: "mediheal-madecassoside-repair-serum",
    name: { ko: "메디힐 마데카소사이드 흔적 리페어 세럼 40ml", vi: "Serum Mediheal Madecassoside Blemish Repair 40ml", en: "Mediheal Madecassoside Blemish Repair Serum 40ml" },
    brand: "mediheal",
    category: "serum",
    image: "https://medihealshop.com/web/product/big/202405/5bf5e768d64635587caa0b57f55ce142.jpg",
    concerns: ["soothing", "trouble", "brightening"],
    ingredients: [{ ingredientId: "madecassoside", order: 1, isKey: true }],
    popularity: { rank: 12, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "serum", "bestseller"],
    is_active: true,
  },
  // Rank 13
  {
    id: "medicube-pdrn-pink-ampoule",
    slug: "medicube-pdrn-pink-ampoule",
    name: { ko: "메디큐브 PDRN 핑크 펩타이드 앰플 30ml", vi: "Ampoule Medicube PDRN Pink Peptide 30ml", en: "Medicube PDRN Pink Peptide Ampoule 30ml" },
    brand: "medicube",
    category: "ampoule",
    image: "https://cafe24img.poxo.com/medicube0/web/product/big/202502/f37eb9aa32f9e4764e06b078a8570688.png",
    concerns: ["brightening", "anti-aging", "hydration"],
    ingredients: [{ ingredientId: "pdrn", order: 1, isKey: true }],
    popularity: { rank: 13, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "ampoule", "bestseller"],
    is_active: true,
  },
  // Rank 14
  {
    id: "la-roche-posay-cicaplast-multi-repair-cream",
    slug: "la-roche-posay-cicaplast-multi-repair-cream",
    name: { ko: "라로슈포제 시카플라스트 멀티 리페어 크림 B5 100ml", vi: "Kem dưỡng La Roche-Posay Cicaplast Multi Repair Cream B5 100ml", en: "La Roche-Posay Cicaplast Multi Repair Cream B5 100ml" },
    brand: "la-roche-posay",
    category: "cream",
    image: "https://www.larocheposay.co.kr/upload/product/main/2023/01/20240718_0844035_020.png",
    concerns: ["soothing", "hydration", "anti-aging"],
    ingredients: [
      { ingredientId: "panthenol", order: 1, isKey: true },
      { ingredientId: "madecassoside", order: 2, isKey: true },
    ],
    popularity: { rank: 14, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "cream", "bestseller"],
    is_active: true,
  },
  // Rank 15
  {
    id: "torriden-dive-in-soothing-cream",
    slug: "torriden-dive-in-soothing-cream",
    name: { ko: "토리든 다이브인 히알루론산 수딩 크림 100ml", vi: "Kem Torriden Dive-In Low Molecular Hyaluronic Acid Soothing Cream 100ml", en: "Torriden DIVE-IN Low Molecular Hyaluronic Acid Soothing Cream 100ml" },
    brand: "torriden",
    category: "cream",
    image: "https://torridtr9977.cdn-nhncommerce.com/data/goods/21/08/31/132/132_magnify_021.jpg",
    concerns: ["hydration", "soothing"],
    ingredients: [{ ingredientId: "hyaluronic-acid", order: 1, isKey: true }],
    popularity: { rank: 15, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "cream", "bestseller"],
    is_active: true,
  },
  // Rank 16
  {
    id: "anua-pdrn-hyaluronic-mist",
    slug: "anua-pdrn-hyaluronic-mist",
    name: { ko: "아누아 PDRN 히알루론산 수분 캡슐 미스트 100ml", vi: "Xịt dưỡng Anua PDRN Hyaluronic Acid Hydrating Capsule Mist 100ml", en: "Anua PDRN Hyaluronic Acid Hydrating Capsule Mist 100ml" },
    brand: "anua",
    category: "mist",
    image: "https://cafe24img.poxo.com/anuaskincare/web/product/big/202510/abbceefbce03a97873cd466d41f262b1.png",
    concerns: ["hydration", "soothing", "anti-aging"],
    ingredients: [
      { ingredientId: "pdrn", order: 1, isKey: true },
      { ingredientId: "hyaluronic-acid", order: 2, isKey: true },
    ],
    popularity: { rank: 16, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "mist", "bestseller"],
    is_active: true,
  },
  // Rank 17
  {
    id: "innisfree-retinol-cica-ampoule",
    slug: "innisfree-retinol-cica-ampoule",
    name: { ko: "이니스프리 레티놀 시카 리페어 앰플 30ml", vi: "Ampoule Innisfree Retinol Cica Repair 30ml", en: "Innisfree Retinol Cica Repair Ampoule 30ml" },
    brand: "innisfree",
    category: "ampoule",
    image: "https://global.amoremall.com/cdn/shop/files/RCAThumbnail2.jpg?v=1763534152",
    concerns: ["anti-aging", "soothing", "pores"],
    ingredients: [
      { ingredientId: "retinol", order: 1, isKey: true },
      { ingredientId: "centella-asiatica", order: 2, isKey: true },
    ],
    popularity: { rank: 17, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "ampoule", "bestseller"],
    is_active: true,
  },
  // Rank 18
  {
    id: "goodal-green-tangerine-vita-c-serum",
    slug: "goodal-green-tangerine-vita-c-serum",
    name: { ko: "구달 청귤 비타C 잡티케어 세럼 알파", vi: "Serum Goodal Green Tangerine Vita-C Dark Spot Care Alpha", en: "Goodal Green Tangerine Vita-C Dark Spot Care Serum Alpha" },
    brand: "goodal",
    category: "serum",
    image: "https://clubclio.shop/cdn/shop/products/serum_76bf3cef-fa33-4cde-a416-c3b08388adcd.jpg?v=1665468522",
    concerns: ["brightening", "soothing", "hydration"],
    ingredients: [{ ingredientId: "green-tangerine-extract", order: 1, isKey: true }],
    popularity: { rank: 18, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "serum", "bestseller", "oliveyoung-award-2025"],
    is_active: true,
  },
  // Rank 19
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
    popularity: { rank: 19, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "cream", "bestseller", "oliveyoung-award-2025", "no1-cream"],
    is_active: true,
  },
  // Rank 20
  {
    id: "fation-noscana9-trouble-serum",
    slug: "fation-noscana9-trouble-serum",
    name: { ko: "파티온 노스카나인 트러블 세럼 50ml", vi: "Serum Fation Noscana9 Trouble 50ml", en: "Fation Noscana9 Trouble Serum 50ml" },
    brand: "fation",
    category: "serum",
    image: "https://fation.co.kr/web/product/big/202312/5d5a3f81a96ab9ad2488cb2a8ecf07f3.png",
    concerns: ["trouble", "soothing"],
    ingredients: [{ ingredientId: "centella-asiatica", order: 1, isKey: true }],
    popularity: { rank: 20, updatedAt: "2026-03-26" },
    purchase: {},
    tags: ["oliveyoung-ranking", "serum", "bestseller"],
    is_active: true,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Starting product catalog curation migration...\n");

  // Step 1: Deactivate all legacy products
  console.log("Step 1: Deactivating all legacy products...");
  const { error: deactivateError } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("is_active", true);
  if (deactivateError) {
    console.error("Fatal: failed to deactivate legacy products:", deactivateError.message);
    process.exit(1);
  }
  console.log("  ✓ All legacy products deactivated\n");

  // Step 2: Remove sun-protection concern (non-fatal if missing)
  console.log("Step 2: Removing sun-protection concern...");
  const { error: deleteError } = await supabase
    .from("concerns")
    .delete()
    .eq("id", "sun-protection");
  if (deleteError) {
    console.warn("  ⚠ Could not delete sun-protection concern (may not exist):", deleteError.message);
  } else {
    console.log("  ✓ sun-protection concern removed (or was not present)\n");
  }

  // Step 3: Upsert key ingredients
  console.log(`Step 3: Upserting ${KEY_INGREDIENTS.length} key ingredients...`);
  for (let i = 0; i < KEY_INGREDIENTS.length; i += 100) {
    const batch = KEY_INGREDIENTS.slice(i, i + 100);
    const { error } = await supabase.from("ingredients").upsert(batch);
    if (error) {
      console.error("Fatal: failed to upsert ingredients:", error.message);
      process.exit(1);
    }
    console.log(`  ✓ ${Math.min(i + 100, KEY_INGREDIENTS.length)}/${KEY_INGREDIENTS.length} ingredients upserted`);
  }
  console.log("  ✓ All key ingredients upserted\n");

  // Step 4: Upsert curated products
  console.log(`Step 4: Upserting ${CURATED_PRODUCTS.length} curated products...`);
  for (let i = 0; i < CURATED_PRODUCTS.length; i += 100) {
    const batch = CURATED_PRODUCTS.slice(i, i + 100);
    const { error } = await supabase.from("products").upsert(batch);
    if (error) {
      console.error("Fatal: failed to upsert products:", error.message);
      process.exit(1);
    }
    console.log(`  ✓ ${Math.min(i + 100, CURATED_PRODUCTS.length)}/${CURATED_PRODUCTS.length} products upserted`);
  }
  console.log("  ✓ All curated products upserted\n");

  console.log("✓ Curation migration complete!");
  console.log(`  - Legacy products deactivated`);
  console.log(`  - sun-protection concern removed`);
  console.log(`  - ${KEY_INGREDIENTS.length} key ingredients upserted`);
  console.log(`  - ${CURATED_PRODUCTS.length} curated products activated`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
