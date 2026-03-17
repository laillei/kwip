/**
 * Apply manually-researched official image URLs to products in Supabase.
 * Usage: npx tsx scripts/pipeline/apply-image-fixes.ts
 */

import { createClient } from "@supabase/supabase-js";

// Official product photography from authorized brand sources.
// Dr.Jart+ images are from authorized global retailers (Nudie Glow AU, OhLolly)
// using the same official product photography as drjart.com (site blocks all scrapers).
const IMAGE_FIXES: Record<string, string> = {
  "dr-jart-ceramidin-cream":
    "https://cdn.shopify.com/s/files/1/1323/4713/files/DR.-JART_-Ceramidin_-Skin-Barrier-Moisturizing-Cream-Nudie-Glow-Australia_3c111e02-e53c-4a24-9130-51abf86ee940.jpg?v=1735366866",
  "dr-jart-ceramidin-liquid":
    "https://cdn.shopify.com/s/files/1/1323/4713/files/DR.-JART_-Ceramidin-Liquid-Nudie-Glow-Australia.jpg?v=1735365877",
  "dr-jart-ceramidin-serum":
    "https://cdn.shopify.com/s/files/1/1323/4713/files/Dr.Jart_-Ceramidin-Skin-Barrier-Serum-Toner-Nudie-Glow-Australia_4d4a4657-4bbb-4901-a879-9f3dd3bdb38f.jpg?v=1735366511",
  "dr-jart-ceramidin-cream-mist":
    "https://cdn.shopify.com/s/files/1/1323/4713/files/DR.-JART_-Ceramidin-Cream-Mist-Nudie-Glow-Australia.jpg?v=1735322556",
  "dr-jart-cicapair-cream":
    "https://cdn.shopify.com/s/files/1/0980/9700/products/Ohlolly-Dr-Jart-Cicapair-Cream-1.jpg?v=1761857065",
  "dr-jart-cicapair-serum":
    "https://cdn.shopify.com/s/files/1/1323/4713/files/DR.JART_-Cicapair-Intensive-Soothing-Repair-Serum-Nudie-Glow-Australia.jpg?v=1735416400",
  "dr-jart-cicapair-toner":
    "https://cdn.shopify.com/s/files/1/1323/4713/files/DR.-JART_-Cicapair-Toner-150ml-Nudie-Glow-Australia.jpg?v=1735483014",
  "dr-jart-vital-hydra-solution-cream":
    "https://cdn.shopify.com/s/files/1/1323/4713/files/DR.-JART_-Vital-Hydra-Solution-Biome-Water-Cream-Nudie-Glow-Australia.jpg?v=1735495251",
  // every-sun-day-sunscreen: Sun Fluid variant (closest available official photo)
  "dr-jart-every-sun-day-sunscreen":
    "https://cdn.shopify.com/s/files/1/0581/3207/0587/products/dj_sku_H5AX01_1000x1000_1.jpg?v=1674077135",
  // cicapair-intensive-soothing-pad: maps to Treatment Lotion (same line, pad-applied)
  "dr-jart-cicapair-intensive-soothing-pad":
    "https://cdn.shopify.com/s/files/1/1323/4713/files/Dr.Jart_-Cicapair-Intensive-Soothing-Repair-Treatment-Lotion-Nudie-Glow-Australia.jpg?v=1734853821",
  // Isntree — confirmed from theisntree.com official site
  "isntree-isntree-miceller-melting-cleansing-oil":
    "https://theisntree.com/wp-content/uploads/2024/11/Isntree-21.webp",
};

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  let updated = 0;

  for (const [slug, image] of Object.entries(IMAGE_FIXES)) {
    const { error } = await supabase
      .from("products")
      .update({ image })
      .eq("slug", slug);

    if (error) {
      console.error(`✗ ${slug}: ${error.message}`);
    } else {
      console.log(`✓ ${slug}`);
      updated++;
    }
  }

  console.log(`\nUpdated ${updated}/${Object.keys(IMAGE_FIXES).length} products`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
