import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// New products to add (compact format)
// [id, ko, vi, en, brand, category, concerns, rank, tags, keyIngredients, otherIngredients]
const newProducts = [
  // === Existing brands: more products ===
  // COSRX +4
  ["cosrx-ac-collection-calming-liquid-mild", "코스알엑스 AC 컬렉션 카밍 리퀴드 마일드", "Serum giảm mụn COSRX AC Collection Calming Liquid Mild", "COSRX AC Collection Calming Liquid Mild", "cosrx", "serum", ["acne"], 33, [], ["propolis-extract","niacinamide","centella-asiatica-extract"], ["butylene-glycol","allantoin","panthenol","phenoxyethanol"]],
  ["cosrx-balancium-comfort-ceramide-cream", "코스알엑스 발란시움 컴포트 세라마이드 크림", "Kem dưỡng ceramide COSRX Balancium Comfort Ceramide Cream", "COSRX Balancium Comfort Ceramide Cream", "cosrx", "cream", ["moisturizing","anti-aging"], 34, ["sensitive-safe"], ["ceramide-np","centella-asiatica-extract","panthenol"], ["glycerin","squalane","allantoin","phenoxyethanol"]],
  ["cosrx-advanced-snail-peptide-eye-cream", "코스알엑스 어드밴스드 스네일 펩타이드 아이 크림", "Kem mắt ốc sên COSRX Advanced Snail Peptide Eye Cream", "COSRX Advanced Snail Peptide Eye Cream", "cosrx", "cream", ["anti-aging"], 35, [], ["snail-secretion-filtrate","niacinamide","adenosine"], ["sodium-hyaluronate","panthenol","squalane","phenoxyethanol"]],
  ["cosrx-oil-free-ultra-moisturizing-lotion", "코스알엑스 오일프리 울트라 모이스처라이징 로션", "Sữa dưỡng ẩm COSRX Oil-Free Ultra-Moisturizing Lotion (Birch Sap)", "COSRX Oil-Free Ultra-Moisturizing Lotion (Birch Sap)", "cosrx", "cream", ["moisturizing"], 36, ["sensitive-safe"], ["birch-sap","sodium-hyaluronate","panthenol"], ["betaine","allantoin","butylene-glycol","phenoxyethanol"]],
  // Anua +3
  ["anua-heartleaf-77-soothing-toner-pad", "아누아 어성초 77 수딩 토너 패드", "Pad dưỡng ẩm Anua Heartleaf 77% Soothing Toner Pad", "Anua Heartleaf 77% Soothing Toner Pad", "anua", "pad", ["acne","moisturizing"], 37, ["sensitive-safe"], ["houttuynia-cordata-extract","panthenol","sodium-hyaluronate"], ["betaine","allantoin","glycerin","phenoxyethanol"]],
  ["anua-birch-70-moisture-boosting-serum", "아누아 자작나무 70 모이스처 부스팅 세럼", "Serum bạch dương Anua Birch 70% Moisture Boosting Serum", "Anua Birch 70% Moisture Boosting Serum", "anua", "serum", ["moisturizing","anti-aging"], 38, [], ["birch-sap","sodium-hyaluronate","panthenol"], ["betaine","glycerin","allantoin","phenoxyethanol"]],
  ["anua-heartleaf-soothing-ampoule", "아누아 어성초 수딩 앰플", "Tinh chất phục hồi Anua Heartleaf Soothing Ampoule", "Anua Heartleaf Soothing Ampoule", "anua", "serum", ["acne","moisturizing"], 39, ["sensitive-safe"], ["houttuynia-cordata-extract","madecassoside","panthenol"], ["glycerin","allantoin","betaine","phenoxyethanol"]],
  // Beauty of Joseon +3
  ["beauty-of-joseon-calming-serum", "조선미녀 카밍 세럼: 그린티 + 판테놀", "Serum dịu da Beauty of Joseon Calming Serum: Green Tea + Panthenol", "Beauty of Joseon Calming Serum: Green Tea + Panthenol", "beauty-of-joseon", "serum", ["acne","moisturizing"], 40, ["sensitive-safe"], ["green-tea-extract","panthenol","niacinamide"], ["sodium-hyaluronate","allantoin","glycerin","phenoxyethanol"]],
  ["beauty-of-joseon-ginseng-eye-cream", "조선미녀 인삼 아이 크림", "Kem mắt nhân sâm Beauty of Joseon Revive Eye Cream: Ginseng + Retinal", "Beauty of Joseon Revive Eye Cream: Ginseng + Retinal", "beauty-of-joseon", "cream", ["anti-aging"], 41, [], ["ginseng-root-extract","retinal","adenosine"], ["ceramide-np","squalane","panthenol","phenoxyethanol"]],
  ["beauty-of-joseon-sun-stick-mung-bean", "조선미녀 선스틱: 녹두 + 카멜리아", "Thỏi chống nắng Beauty of Joseon Sun Stick: Mung Bean + Camelia", "Beauty of Joseon Sun Stick: Mung Bean + Camelia SPF50+ PA++++", "beauty-of-joseon", "sunscreen", ["brightening"], 42, ["best-seller"], ["niacinamide","squalane","adenosine"], ["ethylhexyl-triazone","caprylyl-methicone","panthenol"]],
  // Torriden +3
  ["torriden-cellmazing-firming-cream", "토리든 셀메이징 퍼밍 크림", "Kem dưỡng săn chắc Torriden Cellmazing Firming Cream", "Torriden Cellmazing Firming Cream", "torriden", "cream", ["anti-aging","moisturizing"], 43, [], ["ceramide-np","adenosine","squalane"], ["glycerin","panthenol","allantoin","phenoxyethanol"]],
  ["torriden-balanceful-cica-serum", "토리든 발란스풀 시카 세럼", "Serum rau má Torriden Balanceful Cica Serum", "Torriden Balanceful Cica Serum", "torriden", "serum", ["acne","moisturizing"], 44, ["sensitive-safe"], ["centella-asiatica-extract","madecassoside","panthenol"], ["glycerin","allantoin","betaine","phenoxyethanol"]],
  ["torriden-dive-in-multi-pad", "토리든 다이브인 멀티 패드", "Pad dưỡng ẩm Torriden DIVE-IN Multi Pad", "Torriden DIVE-IN Multi Pad", "torriden", "pad", ["moisturizing"], 45, ["sensitive-safe"], ["hyaluronic-acid","panthenol","sodium-hyaluronate"], ["betaine","allantoin","glycerin","phenoxyethanol"]],
  // Round Lab +3
  ["round-lab-soybean-nourishing-cream", "라운드랩 소이빈 너리싱 크림", "Kem dưỡng đậu nành Round Lab Soybean Nourishing Cream", "Round Lab Soybean Nourishing Cream", "round-lab", "cream", ["anti-aging","moisturizing"], 46, [], ["ceramide-np","adenosine","squalane"], ["glycerin","shea-butter","panthenol","phenoxyethanol"]],
  ["round-lab-pine-calming-cica-ampoule", "라운드랩 파인 카밍 시카 앰플", "Tinh chất thông đỏ Round Lab Pine Calming Cica Ampoule", "Round Lab Pine Calming Cica Ampoule", "round-lab", "serum", ["acne"], 47, ["sensitive-safe"], ["centella-asiatica-extract","madecassoside","panthenol"], ["glycerin","allantoin","betaine","phenoxyethanol"]],
  ["round-lab-1025-dokdo-lotion", "라운드랩 독도 로션", "Sữa dưỡng ẩm Round Lab 1025 Dokdo Lotion", "Round Lab 1025 Dokdo Lotion", "round-lab", "cream", ["moisturizing"], 48, ["sensitive-safe"], ["glycerin","sodium-hyaluronate","panthenol"], ["betaine","allantoin","squalane","phenoxyethanol"]],
  // Skin1004 +4
  ["skin1004-centella-air-fit-suncream", "스킨1004 마다가스카르 센텔라 에어핏 선크림", "Kem chống nắng Skin1004 Madagascar Centella Air-Fit Suncream SPF50+", "Skin1004 Madagascar Centella Air-Fit Suncream SPF50+ PA++++", "skin1004", "sunscreen", ["acne","moisturizing"], 49, ["sensitive-safe"], ["centella-asiatica-extract","niacinamide","madecassoside"], ["ethylhexyl-triazone","panthenol","allantoin","phenoxyethanol"]],
  ["skin1004-centella-probio-cica-eye-cream", "스킨1004 센텔라 프로바이오 시카 아이 크림", "Kem mắt Skin1004 Centella Probio-Cica Eye Cream", "Skin1004 Centella Probio-Cica Eye Cream", "skin1004", "cream", ["anti-aging"], 50, [], ["centella-asiatica-extract","adenosine","ceramide-np"], ["madecassoside","panthenol","squalane","phenoxyethanol"]],
  ["skin1004-poremizing-clear-toner", "스킨1004 포어마이징 클리어 토너", "Nước hoa hồng se lỗ chân lông Skin1004 Poremizing Clear Toner", "Skin1004 Poremizing Clear Toner", "skin1004", "toner", ["acne","brightening"], 51, [], ["salicylic-acid","niacinamide","centella-asiatica-extract"], ["glycerin","allantoin","butylene-glycol","phenoxyethanol"]],
  ["skin1004-centella-tone-brightening-essence", "스킨1004 센텔라 톤 브라이트닝 에센스", "Tinh chất sáng da Skin1004 Centella Tone Brightening Essence", "Skin1004 Madagascar Centella Tone Brightening Essence", "skin1004", "serum", ["brightening"], 52, [], ["centella-asiatica-extract","niacinamide","alpha-arbutin"], ["sodium-hyaluronate","panthenol","adenosine","phenoxyethanol"]],

  // === New brands ===
  // Klairs (8)
  ["klairs-supple-preparation-toner", "클레어스 서플 프레퍼레이션 토너", "Nước hoa hồng Klairs Supple Preparation Facial Toner", "Klairs Supple Preparation Facial Toner", "klairs", "toner", ["moisturizing"], 53, ["best-seller"], ["hyaluronic-acid","panthenol","glycerin"], ["betaine","allantoin","butylene-glycol","phenoxyethanol"]],
  ["klairs-supple-preparation-unscented-toner", "클레어스 서플 프레퍼레이션 무향 토너", "Nước hoa hồng không mùi Klairs Supple Preparation Unscented Toner", "Klairs Supple Preparation Unscented Toner", "klairs", "toner", ["moisturizing","acne"], 54, ["sensitive-safe"], ["hyaluronic-acid","panthenol","centella-asiatica-extract"], ["betaine","glycerin","allantoin","phenoxyethanol"]],
  ["klairs-freshly-juiced-vitamin-drop", "클레어스 프레쉴리 쥬스드 비타민 드롭", "Serum Vitamin C Klairs Freshly Juiced Vitamin Drop", "Klairs Freshly Juiced Vitamin Drop", "klairs", "serum", ["brightening","anti-aging"], 55, ["best-seller"], ["ascorbic-acid","niacinamide","adenosine"], ["sodium-hyaluronate","panthenol","butylene-glycol","phenoxyethanol"]],
  ["klairs-midnight-blue-calming-cream", "클레어스 미드나잇 블루 카밍 크림", "Kem dưỡng dịu da Klairs Midnight Blue Calming Cream", "Klairs Midnight Blue Calming Cream", "klairs", "cream", ["acne"], 56, ["sensitive-safe"], ["centella-asiatica-extract","panthenol","allantoin"], ["glycerin","squalane","ceramide-np","phenoxyethanol"]],
  ["klairs-rich-moist-soothing-serum", "클레어스 리치 모이스트 수딩 세럼", "Serum dưỡng ẩm Klairs Rich Moist Soothing Serum", "Klairs Rich Moist Soothing Serum", "klairs", "serum", ["moisturizing"], 57, ["sensitive-safe"], ["sodium-hyaluronate","panthenol","glycerin"], ["betaine","allantoin","propanediol","phenoxyethanol"]],
  ["klairs-midnight-blue-youth-activating-drop", "클레어스 미드나잇 블루 유스 액티베이팅 드롭", "Serum chống lão hóa Klairs Midnight Blue Youth Activating Drop", "Klairs Midnight Blue Youth Activating Drop", "klairs", "serum", ["anti-aging"], 58, [], ["adenosine","niacinamide","centella-asiatica-extract"], ["panthenol","sodium-hyaluronate","allantoin","phenoxyethanol"]],
  ["klairs-soft-airy-uv-essence", "클레어스 소프트 에어리 UV 에센스", "Kem chống nắng Klairs Soft Airy UV Essence SPF50+ PA++++", "Klairs Soft Airy UV Essence SPF50+ PA++++", "klairs", "sunscreen", ["moisturizing"], 59, ["sensitive-safe"], ["niacinamide","panthenol","hyaluronic-acid"], ["ethylhexyl-triazone","allantoin","caprylyl-methicone","phenoxyethanol"]],
  ["klairs-fundamental-water-gel-cream", "클레어스 펀다멘탈 워터 젤 크림", "Kem dưỡng ẩm Klairs Fundamental Water Gel Cream", "Klairs Fundamental Water Gel Cream", "klairs", "cream", ["moisturizing"], 60, [], ["hyaluronic-acid","glycerin","panthenol"], ["betaine","allantoin","squalane","phenoxyethanol"]],

  // Some By Mi (8)
  ["some-by-mi-aha-bha-pha-miracle-toner", "썸바이미 AHA BHA PHA 30일 미라클 토너", "Nước hoa hồng Some By Mi AHA-BHA-PHA 30 Days Miracle Toner", "Some By Mi AHA-BHA-PHA 30 Days Miracle Toner", "some-by-mi", "toner", ["acne","brightening"], 61, ["best-seller"], ["glycolic-acid","salicylic-acid","niacinamide"], ["tea-tree-oil","allantoin","panthenol","phenoxyethanol"]],
  ["some-by-mi-aha-bha-pha-miracle-serum", "썸바이미 AHA BHA PHA 30일 미라클 세럼", "Serum Some By Mi AHA-BHA-PHA 30 Days Miracle Serum", "Some By Mi AHA-BHA-PHA 30 Days Miracle Serum", "some-by-mi", "serum", ["acne","brightening"], 62, [], ["glycolic-acid","salicylic-acid","niacinamide"], ["tea-tree-oil","centella-asiatica-extract","panthenol","phenoxyethanol"]],
  ["some-by-mi-aha-bha-pha-miracle-cream", "썸바이미 AHA BHA PHA 30일 미라클 크림", "Kem dưỡng Some By Mi AHA-BHA-PHA 30 Days Miracle Cream", "Some By Mi AHA-BHA-PHA 30 Days Miracle Cream", "some-by-mi", "cream", ["acne","moisturizing"], 63, [], ["tea-tree-oil","niacinamide","centella-asiatica-extract"], ["glycerin","allantoin","panthenol","phenoxyethanol"]],
  ["some-by-mi-snail-truecica-miracle-repair-serum", "썸바이미 스네일 트루시카 미라클 리페어 세럼", "Serum ốc sên Some By Mi Snail TrueCICA Miracle Repair Serum", "Some By Mi Snail TrueCICA Miracle Repair Serum", "some-by-mi", "serum", ["anti-aging","moisturizing"], 64, [], ["snail-secretion-filtrate","centella-asiatica-extract","madecassoside"], ["niacinamide","adenosine","panthenol","phenoxyethanol"]],
  ["some-by-mi-galactomyces-vitamin-c-glow-serum", "썸바이미 갈락토미세스 비타민C 글로우 세럼", "Serum sáng da Some By Mi Galactomyces Pure Vitamin C Glow Serum", "Some By Mi Galactomyces Pure Vitamin C Glow Serum", "some-by-mi", "serum", ["brightening","anti-aging"], 65, [], ["galactomyces-ferment-filtrate","ascorbic-acid","niacinamide"], ["sodium-hyaluronate","panthenol","allantoin","phenoxyethanol"]],
  ["some-by-mi-yuja-niacin-brightening-gel-cream", "썸바이미 유자 나이아신 브라이트닝 젤 크림", "Kem dưỡng sáng da Some By Mi Yuja Niacin Brightening Moisture Gel Cream", "Some By Mi Yuja Niacin Brightening Moisture Gel Cream", "some-by-mi", "cream", ["brightening","moisturizing"], 66, [], ["niacinamide","ascorbic-acid","glycerin"], ["sodium-hyaluronate","panthenol","allantoin","phenoxyethanol"]],
  ["some-by-mi-truecica-mineral-suncream", "썸바이미 트루시카 미네랄 선크림", "Kem chống nắng Some By Mi Truecica Mineral 100 Calming Suncream SPF50+", "Some By Mi Truecica Mineral 100 Calming Suncream SPF50+ PA++++", "some-by-mi", "sunscreen", ["acne"], 67, ["sensitive-safe"], ["centella-asiatica-extract","madecassoside","niacinamide"], ["ethylhexyl-triazone","panthenol","allantoin","phenoxyethanol"]],
  ["some-by-mi-real-cica-92-cool-calming-gel", "썸바이미 리얼 시카 92% 쿨 카밍 수딩 젤", "Gel dưỡng rau má Some By Mi Real Cica 92% Cool Calming Soothing Gel", "Some By Mi Real Cica 92% Cool Calming Soothing Gel", "some-by-mi", "cream", ["acne","moisturizing"], 68, ["sensitive-safe"], ["centella-asiatica-extract","madecassoside","panthenol"], ["glycerin","allantoin","aloe-vera-extract","phenoxyethanol"]],

  // Innisfree (8)
  ["innisfree-green-tea-seed-serum", "이니스프리 그린티 씨드 세럼", "Serum trà xanh Innisfree Green Tea Seed Serum", "Innisfree Green Tea Seed Serum", "innisfree", "serum", ["moisturizing"], 69, ["best-seller"], ["green-tea-extract","hyaluronic-acid","panthenol"], ["glycerin","betaine","allantoin","phenoxyethanol"]],
  ["innisfree-green-tea-seed-cream", "이니스프리 그린티 씨드 히알루로닉 크림", "Kem dưỡng trà xanh Innisfree Green Tea Seed Hyaluronic Cream", "Innisfree Green Tea Seed Hyaluronic Cream", "innisfree", "cream", ["moisturizing"], 70, [], ["green-tea-extract","hyaluronic-acid","squalane"], ["glycerin","ceramide-np","panthenol","phenoxyethanol"]],
  ["innisfree-retinol-cica-repair-ampoule", "이니스프리 레티놀 시카 리페어 앰플", "Tinh chất retinol Innisfree Retinol Cica Repair Ampoule", "Innisfree Retinol Cica Repair Ampoule", "innisfree", "serum", ["anti-aging"], 71, [], ["retinal","centella-asiatica-extract","adenosine"], ["niacinamide","panthenol","squalane","phenoxyethanol"]],
  ["innisfree-daily-uv-defense-sunscreen", "이니스프리 데일리 UV 디펜스 선스크린", "Kem chống nắng Innisfree Daily UV Defense Sunscreen SPF36", "Innisfree Daily UV Defense Sunscreen Broad Spectrum SPF36", "innisfree", "sunscreen", ["moisturizing"], 72, [], ["hyaluronic-acid","panthenol","glycerin"], ["ethylhexyl-triazone","allantoin","caprylyl-methicone","phenoxyethanol"]],
  ["innisfree-volcanic-pore-toner", "이니스프리 제주 화산송이 포어 토너", "Nước hoa hồng lỗ chân lông Innisfree Jeju Volcanic Pore Toner", "Innisfree Jeju Volcanic Pore Toner", "innisfree", "toner", ["acne"], 73, [], ["salicylic-acid","niacinamide","glycerin"], ["allantoin","panthenol","butylene-glycol","phenoxyethanol"]],
  ["innisfree-green-tea-seed-toner", "이니스프리 그린티 씨드 히알루로닉 토너", "Nước hoa hồng trà xanh Innisfree Green Tea Seed Hyaluronic Toner", "Innisfree Green Tea Seed Hyaluronic Toner", "innisfree", "toner", ["moisturizing"], 74, [], ["green-tea-extract","hyaluronic-acid","panthenol"], ["glycerin","betaine","butylene-glycol","phenoxyethanol"]],
  ["innisfree-dewy-glow-tone-up-cream", "이니스프리 듀이 글로우 톤업 크림", "Kem nâng tông Innisfree Dewy Glow Tone Up Cream SPF50+ PA++++", "Innisfree Dewy Glow Tone Up Cream SPF50+ PA++++", "innisfree", "sunscreen", ["brightening"], 75, [], ["niacinamide","hyaluronic-acid","glycerin"], ["ethylhexyl-triazone","panthenol","caprylyl-methicone","phenoxyethanol"]],
  ["innisfree-cherry-blossom-tone-up-cream", "이니스프리 제주 벚꽃 톤업 크림", "Kem dưỡng sáng da Innisfree Jeju Cherry Blossom Tone Up Cream", "Innisfree Jeju Cherry Blossom Tone Up Cream", "innisfree", "cream", ["brightening"], 76, [], ["niacinamide","glycerin","panthenol"], ["sodium-hyaluronate","allantoin","squalane","phenoxyethanol"]],

  // Laneige (8)
  ["laneige-water-sleeping-mask", "라네즈 워터 슬리핑 마스크", "Mặt nạ ngủ Laneige Water Sleeping Mask", "Laneige Water Sleeping Mask", "laneige", "cream", ["moisturizing"], 77, ["best-seller"], ["hyaluronic-acid","glycerin","panthenol"], ["betaine","squalane","allantoin","phenoxyethanol"]],
  ["laneige-water-bank-blue-hyaluronic-cream", "라네즈 워터뱅크 블루 히알루로닉 크림", "Kem dưỡng ẩm Laneige Water Bank Blue Hyaluronic Cream", "Laneige Water Bank Blue Hyaluronic Cream", "laneige", "cream", ["moisturizing","anti-aging"], 78, ["best-seller"], ["hyaluronic-acid","ceramide-np","panthenol"], ["glycerin","squalane","adenosine","phenoxyethanol"]],
  ["laneige-cream-skin-toner", "라네즈 크림스킨 토너 앤 모이스처라이저", "Nước hoa hồng Laneige Cream Skin Toner & Moisturizer", "Laneige Cream Skin Toner & Moisturizer", "laneige", "toner", ["moisturizing"], 79, [], ["ceramide-np","glycerin","panthenol"], ["sodium-hyaluronate","betaine","allantoin","phenoxyethanol"]],
  ["laneige-water-bank-blue-hyaluronic-serum", "라네즈 워터뱅크 블루 히알루로닉 세럼", "Serum cấp ẩm Laneige Water Bank Blue Hyaluronic Serum", "Laneige Water Bank Blue Hyaluronic Serum", "laneige", "serum", ["moisturizing","anti-aging"], 80, [], ["hyaluronic-acid","sodium-hyaluronate","panthenol"], ["glycerin","betaine","adenosine","phenoxyethanol"]],
  ["laneige-radian-c-cream", "라네즈 래디언-C 크림", "Kem dưỡng sáng da Laneige Radian-C Cream", "Laneige Radian-C Cream", "laneige", "cream", ["brightening"], 81, [], ["ascorbic-acid","niacinamide","adenosine"], ["glycerin","panthenol","squalane","phenoxyethanol"]],
  ["laneige-water-bank-sun-cream", "라네즈 워터뱅크 블루 히알루로닉 선크림", "Kem chống nắng Laneige Water Bank Blue Hyaluronic Sun Cream SPF50+", "Laneige Water Bank Blue Hyaluronic Sun Cream SPF50+ PA++++", "laneige", "sunscreen", ["moisturizing"], 82, [], ["hyaluronic-acid","niacinamide","panthenol"], ["ethylhexyl-triazone","glycerin","caprylyl-methicone","phenoxyethanol"]],
  ["laneige-perfect-renew-3ex-cream", "라네즈 퍼펙트 리뉴 3EX 크림", "Kem dưỡng chống lão hóa Laneige Perfect Renew 3EX Cream", "Laneige Perfect Renew 3EX Cream", "laneige", "cream", ["anti-aging"], 83, [], ["adenosine","ceramide-np","niacinamide"], ["squalane","panthenol","glycerin","phenoxyethanol"]],
  ["laneige-cream-skin-cerapeptide-refiner", "라네즈 크림스킨 세라펩타이드 리파이너", "Nước hoa hồng Laneige Cream Skin Cerapeptide Refiner", "Laneige Cream Skin Cerapeptide Refiner", "laneige", "toner", ["moisturizing","anti-aging"], 84, [], ["ceramide-np","adenosine","panthenol"], ["glycerin","sodium-hyaluronate","betaine","phenoxyethanol"]],

  // Isntree (8)
  ["isntree-hyaluronic-acid-toner", "이즈앤트리 히알루론산 토너", "Nước hoa hồng Isntree Hyaluronic Acid Toner", "Isntree Hyaluronic Acid Toner", "isntree", "toner", ["moisturizing"], 85, ["best-seller"], ["hyaluronic-acid","sodium-hyaluronate","panthenol"], ["glycerin","betaine","allantoin","phenoxyethanol"]],
  ["isntree-hyaluronic-acid-moist-cream", "이즈앤트리 히알루론산 모이스트 크림", "Kem dưỡng ẩm Isntree Hyaluronic Acid Moist Cream", "Isntree Hyaluronic Acid Moist Cream", "isntree", "cream", ["moisturizing"], 86, [], ["hyaluronic-acid","ceramide-np","squalane"], ["glycerin","panthenol","allantoin","phenoxyethanol"]],
  ["isntree-tw-real-bifida-ampoule", "이즈앤트리 TW-리얼 비피다 앰플", "Tinh chất Isntree TW-REAL Bifida Ampoule", "Isntree TW-REAL Bifida Ampoule", "isntree", "serum", ["anti-aging","moisturizing"], 87, [], ["bifida-ferment-lysate","niacinamide","adenosine"], ["sodium-hyaluronate","panthenol","allantoin","phenoxyethanol"]],
  ["isntree-chestnut-aha-8-clear-essence", "이즈앤트리 체스넛 AHA 8% 클리어 에센스", "Tinh chất AHA Isntree Chestnut AHA 8% Clear Essence", "Isntree Chestnut AHA 8% Clear Essence", "isntree", "serum", ["brightening","acne"], 88, [], ["glycolic-acid","niacinamide","allantoin"], ["panthenol","glycerin","butylene-glycol","phenoxyethanol"]],
  ["isntree-green-tea-fresh-toner", "이즈앤트리 그린티 프레쉬 토너", "Nước hoa hồng trà xanh Isntree Green Tea Fresh Toner", "Isntree Green Tea Fresh Toner", "isntree", "toner", ["acne"], 89, [], ["green-tea-extract","salicylic-acid","niacinamide"], ["glycerin","panthenol","allantoin","phenoxyethanol"]],
  ["isntree-c-niacin-toning-cream", "이즈앤트리 C-나이아신 토닝 크림", "Kem dưỡng sáng da Isntree C-Niacin Toning Cream", "Isntree C-Niacin Toning Cream", "isntree", "cream", ["brightening"], 90, [], ["niacinamide","ascorbic-acid","adenosine"], ["glycerin","panthenol","squalane","phenoxyethanol"]],
  ["isntree-hyaluronic-acid-watery-sun-gel", "이즈앤트리 히알루론산 워터리 선 젤", "Kem chống nắng Isntree Hyaluronic Acid Watery Sun Gel SPF50+ PA++++", "Isntree Hyaluronic Acid Watery Sun Gel SPF50+ PA++++", "isntree", "sunscreen", ["moisturizing"], 91, [], ["hyaluronic-acid","niacinamide","panthenol"], ["ethylhexyl-triazone","allantoin","caprylyl-methicone","phenoxyethanol"]],
  ["isntree-spot-saver-mugwort-ampoule-pad", "이즈앤트리 스팟 세이버 쑥 앰플 패드", "Pad trị thâm Isntree Spot Saver Mugwort Ampoule Pad", "Isntree Spot Saver Mugwort Ampoule Pad", "isntree", "pad", ["acne","brightening"], 92, [], ["niacinamide","centella-asiatica-extract","allantoin"], ["glycerin","panthenol","butylene-glycol","phenoxyethanol"]],

  // Purito (8)
  ["purito-centella-green-level-buffet-serum", "퓨리토 센텔라 그린 레벨 뷔페 세럼", "Serum rau má Purito Centella Green Level Buffet Serum", "Purito Centella Green Level Buffet Serum", "purito", "serum", ["acne","anti-aging"], 93, [], ["centella-asiatica-extract","niacinamide","adenosine"], ["madecassoside","panthenol","sodium-hyaluronate","phenoxyethanol"]],
  ["purito-centella-unscented-serum", "퓨리토 센텔라 무향 세럼", "Serum rau má không mùi Purito Centella Unscented Serum", "Purito Centella Unscented Serum", "purito", "serum", ["acne","moisturizing"], 94, ["sensitive-safe"], ["centella-asiatica-extract","madecassoside","panthenol"], ["glycerin","allantoin","betaine","phenoxyethanol"]],
  ["purito-daily-go-to-sunscreen", "퓨리토 데일리 고투 선스크린", "Kem chống nắng Purito Daily Go-To Sunscreen SPF50+ PA++++", "Purito Daily Go-To Sunscreen SPF50+ PA++++", "purito", "sunscreen", ["moisturizing"], 95, ["best-seller"], ["hyaluronic-acid","niacinamide","panthenol"], ["ethylhexyl-triazone","centella-asiatica-extract","caprylyl-methicone","phenoxyethanol"]],
  ["purito-centella-green-level-recovery-cream", "퓨리토 센텔라 그린 레벨 리커버리 크림", "Kem dưỡng rau má Purito Centella Green Level Recovery Cream", "Purito Centella Green Level Recovery Cream", "purito", "cream", ["acne","moisturizing"], 96, ["sensitive-safe"], ["centella-asiatica-extract","madecassoside","ceramide-np"], ["glycerin","squalane","panthenol","phenoxyethanol"]],
  ["purito-dermide-cica-barrier-sleeping-pack", "퓨리토 더마이드 시카 배리어 슬리핑 팩", "Mặt nạ ngủ Purito Dermide Cica Barrier Sleeping Pack", "Purito Dermide Cica Barrier Sleeping Pack", "purito", "cream", ["moisturizing","anti-aging"], 97, [], ["ceramide-np","centella-asiatica-extract","squalane"], ["glycerin","panthenol","adenosine","phenoxyethanol"]],
  ["purito-galacto-niacin-97-power-essence", "퓨리토 갈락토 나이아신 97 파워 에센스", "Tinh chất sáng da Purito Galacto Niacin 97 Power Essence", "Purito Galacto Niacin 97 Power Essence", "purito", "serum", ["brightening","moisturizing"], 98, [], ["galactomyces-ferment-filtrate","niacinamide","panthenol"], ["sodium-hyaluronate","glycerin","allantoin","phenoxyethanol"]],
  ["purito-centella-green-level-eye-cream", "퓨리토 센텔라 그린 레벨 아이 크림", "Kem mắt rau má Purito Centella Green Level Eye Cream", "Purito Centella Green Level Eye Cream", "purito", "cream", ["anti-aging"], 99, [], ["centella-asiatica-extract","adenosine","niacinamide"], ["madecassoside","ceramide-np","panthenol","phenoxyethanol"]],
  ["purito-oat-in-calming-gel-cream", "퓨리토 오트인 카밍 젤 크림", "Kem dưỡng yến mạch Purito Oat-in Calming Gel Cream", "Purito Oat-in Calming Gel Cream", "purito", "cream", ["acne","moisturizing"], 100, ["sensitive-safe"], ["oat-extract","panthenol","glycerin"], ["centella-asiatica-extract","allantoin","squalane","phenoxyethanol"]],
];

// New ingredients needed
const newIngredients = [
  ["green-tea-extract", "Camellia Sinensis Leaf Extract", "Chiết xuất trà xanh", "녹차 추출물", "Chống oxy hóa mạnh, kiểm soát dầu thừa và làm dịu da", "Powerful antioxidant, controls oil and soothes skin", [["acne","good","Kiểm soát dầu thừa, kháng khuẩn nhẹ","Controls excess oil, mild antibacterial"],["anti-aging","good","Giàu polyphenol chống oxy hóa","Rich in antioxidant polyphenols"]], "1", "active"],
  ["galactomyces-ferment-filtrate", "Galactomyces Ferment Filtrate", "Dịch lên men Galactomyces", "갈락토미세스 발효 여과물", "Dịch lên men nấm men giúp sáng da, se khít lỗ chân lông", "Yeast ferment filtrate that brightens and tightens pores", [["brightening","good","Sáng da đều màu nhờ lên men tự nhiên","Evens skin tone through natural fermentation"],["moisturizing","good","Cung cấp độ ẩm sâu, tăng cường hàng rào da","Provides deep moisture, strengthens barrier"]], "1", "active"],
  ["bifida-ferment-lysate", "Bifida Ferment Lysate", "Dịch lên men Bifida", "비피다 발효 용해물", "Probiotic lên men giúp phục hồi hàng rào da, chống lão hóa", "Fermented probiotic that restores skin barrier, anti-aging", [["anti-aging","good","Tăng tái tạo tế bào, giảm nếp nhăn","Boosts cell regeneration, reduces wrinkles"],["moisturizing","good","Phục hồi hàng rào da, giữ ẩm lâu dài","Restores skin barrier, long-lasting moisture"]], "1", "active"],
  ["oat-extract", "Avena Sativa (Oat) Kernel Extract", "Chiết xuất yến mạch", "귀리 추출물", "Làm dịu da nhạy cảm, giảm kích ứng nhẹ nhàng", "Soothes sensitive skin, gently reduces irritation", [["acne","good","Làm dịu da kích ứng do mụn, giảm viêm","Soothes acne-irritated skin, reduces inflammation"],["moisturizing","good","Cấp ẩm nhẹ nhàng, phù hợp da nhạy cảm","Gentle moisture, suitable for sensitive skin"]], "1", "active"],
];

// Build full product objects
function buildProduct(p) {
  const [id, ko, vi, en, brand, category, concerns, rank, tags, keyIngredients, otherIngredients] = p;
  const ingredients = [
    ...keyIngredients.map((ing, i) => ({ ingredientId: ing, order: i + 1, isKey: true })),
    ...otherIngredients.map((ing, i) => ({ ingredientId: ing, order: keyIngredients.length + i + 1, isKey: false })),
  ];
  return {
    id, slug: id,
    name: { ko, vi, en },
    brand, category,
    image: `/images/products/${id}.svg`, // placeholder, will be updated after download
    concerns, ingredients,
    popularity: { rank, updatedAt: "2026-03-01" },
    purchase: { shopee: `https://shopee.vn/search?keyword=${encodeURIComponent(en)}` },
    tags
  };
}

function buildIngredient(i) {
  const [id, inci, vi, ko, descVi, descEn, effects, ewg, cat] = i;
  return {
    id,
    name: { inci, vi, ko },
    description: { vi: descVi, en: descEn },
    effects: effects.map(([concern, type, reasonVi, reasonEn]) => ({
      concern, type, reason: { vi: reasonVi, en: reasonEn }
    })),
    ewgGrade: ewg,
    category: cat
  };
}

// Read existing data
const existingProducts = JSON.parse(readFileSync(join(root, 'src/data/products.json'), 'utf8'));
const existingIngredients = JSON.parse(readFileSync(join(root, 'src/data/ingredients.json'), 'utf8'));

// Add new products
const allProducts = [...existingProducts, ...newProducts.map(buildProduct)];

// Add new ingredients (avoid duplicates)
const existingIngIds = new Set(existingIngredients.map(i => i.id));
const newIngs = newIngredients.map(buildIngredient).filter(i => !existingIngIds.has(i.id));
const allIngredients = [...existingIngredients, ...newIngs];

// Write output
writeFileSync(join(root, 'src/data/products.json'), JSON.stringify(allProducts, null, 2) + '\n');
writeFileSync(join(root, 'src/data/ingredients.json'), JSON.stringify(allIngredients, null, 2) + '\n');

console.log(`Products: ${existingProducts.length} -> ${allProducts.length}`);
console.log(`Ingredients: ${existingIngredients.length} -> ${allIngredients.length}`);
console.log('New product slugs for image download:');
newProducts.forEach(p => console.log(`  ${p[0]}`));
