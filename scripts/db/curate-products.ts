// scripts/db/curate-products.ts
/**
 * Product catalog curation migration.
 * Run with: npx tsx scripts/db/curate-products.ts
 *
 * Steps:
 *   1. Deactivate all legacy products (set is_active = false)
 *   2. Remove sun-protection concern (non-fatal if missing)
 *   3. Upsert 15 new key ingredients
 *   4. Upsert 22 curated products as is_active: true
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
    id: "green-tomato-extract",
    name: { inci: "Lycopersicon Esculentum (Tomato) Fruit Extract", vi: "Chiết xuất cà chua xanh", ko: "그린토마토 추출물" },
    description: { vi: "Thu nhỏ lỗ chân lông, làm sáng da và cấp ẩm", en: "Minimizes pores, brightens skin and provides hydration" },
    effects: [
      { concern: "pores", grade: "good", reason: { vi: "Thu nhỏ lỗ chân lông hiệu quả", en: "Effectively minimizes pore appearance" } },
      { concern: "brightening", grade: "good", reason: { vi: "Cải thiện tông màu da", en: "Improves skin tone" } },
    ],
    ewg_grade: 1,
    category: "botanical",
  },
  {
    id: "reedle-shot-complex",
    name: { inci: "Acetyl Hexapeptide-8", vi: "Peptide vi kim", ko: "리들샷 복합체" },
    description: { vi: "Tăng khả năng thẩm thấu của các hoạt chất, cải thiện độ đàn hồi", en: "Enhances absorption of active ingredients, improves elasticity" },
    effects: [
      { concern: "anti-aging", grade: "good", reason: { vi: "Kích thích collagen, cải thiện đàn hồi", en: "Stimulates collagen, improves elasticity" } },
      { concern: "hydration", grade: "good", reason: { vi: "Tăng cường hấp thu dưỡng chất", en: "Enhances nutrient absorption" } },
    ],
    ewg_grade: 1,
    category: "peptide",
  },
  {
    id: "silk-extract",
    name: { inci: "Hydrolyzed Silk", vi: "Chiết xuất tơ tằm", ko: "실크 추출물" },
    description: { vi: "Cấp ẩm, làm mềm và tạo lớp màng bảo vệ da", en: "Hydrates, softens and forms a protective film on skin" },
    effects: [
      { concern: "hydration", grade: "good", reason: { vi: "Cấp ẩm và làm mềm da", en: "Hydrates and softens skin" } },
      { concern: "pores", grade: "good", reason: { vi: "Làm mịn bề mặt da", en: "Smooths skin surface" } },
    ],
    ewg_grade: 1,
    category: "protein",
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
  {
    id: "tea-tree",
    name: { inci: "Melaleuca Alternifolia (Tea Tree) Leaf Oil", vi: "Tinh dầu tràm trà", ko: "티트리" },
    description: { vi: "Kháng khuẩn mạnh, kiểm soát mụn và làm dịu vùng da viêm", en: "Strong antibacterial, controls acne and soothes inflamed skin" },
    effects: [
      { concern: "trouble", grade: "good", reason: { vi: "Kháng khuẩn, ngăn ngừa và điều trị mụn", en: "Antibacterial, prevents and treats acne" } },
      { concern: "pores", grade: "good", reason: { vi: "Làm sạch lỗ chân lông và kiểm soát dầu", en: "Cleanses pores and controls oil production" } },
    ],
    ewg_grade: 2,
    category: "botanical",
  },
];

// ---------------------------------------------------------------------------
// Curated products to upsert
// ---------------------------------------------------------------------------

const CURATED_PRODUCTS = [
  // Olive Young KR Annual Awards 2025 (ranks 1–13)
  {
    id: "manyo-pure-cleansing-oil",
    slug: "manyo-pure-cleansing-oil",
    name: { ko: "마녀공장 퓨어 클렌징 오일", vi: "Dầu tẩy trang Ma:nyo Pure Cleansing Oil", en: "Ma:nyo Pure Cleansing Oil" },
    brand: "ma-nyo",
    category: "cleanser",
    image: "",
    concerns: ["soothing", "hydration"],
    ingredients: [{ ingredientId: "madecassoside", order: 1, isKey: true }],
    popularity: { rank: 1, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "cleanser", "bestseller"],
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
    ingredients: [{ ingredientId: "hyaluronic-acid", order: 1, isKey: true }],
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
    ingredients: [{ ingredientId: "hyaluronic-acid", order: 1, isKey: true }],
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
    ingredients: [{ ingredientId: "hyaluronic-acid", order: 1, isKey: true }],
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
    ingredients: [{ ingredientId: "heartleaf-extract", order: 1, isKey: true }],
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
    ingredients: [{ ingredientId: "snail-secretion-filtrate", order: 1, isKey: true }],
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
    ingredients: [{ ingredientId: "niacinamide", order: 1, isKey: true }],
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
    ingredients: [{ ingredientId: "hyaluronic-acid", order: 1, isKey: true }],
    popularity: { rank: 13, updatedAt: "2026-03-25" },
    purchase: {},
    tags: ["oliveyoung-award-2025", "cleanser", "bestseller"],
    is_active: true,
  },
  // Daiso KR Best Sellers (ranks 14–22)
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
    ingredients: [{ ingredientId: "retinol", order: 1, isKey: true }],
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
    ingredients: [{ ingredientId: "niacinamide", order: 1, isKey: true }],
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
