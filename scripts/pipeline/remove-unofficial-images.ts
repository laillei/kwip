/**
 * Remove products that still have unofficial images and can't be fixed.
 * These are either discontinued from official global catalogs or geo-blocked.
 */
import { createClient } from "@supabase/supabase-js";

const UNOFFICIAL_PATTERNS = [
  "oliveyoung.com", "hwahae.co.kr", "amazon.com", "holiholic.com",
  "thankyouskin.com", "masksheets.com", "cloudfront.net",
];

async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from("products").select("id, slug, brand, image");
  const bad = (data ?? []).filter(p => UNOFFICIAL_PATTERNS.some(pat => (p.image ?? "").includes(pat)));

  console.log(`Removing ${bad.length} products with unofficial images:\n`);
  for (const p of bad) console.log(`  ${p.slug}`);

  const ids = bad.map(p => p.id);
  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) {
    console.error("Delete failed:", error.message);
    process.exit(1);
  }
  console.log(`\nDeleted ${bad.length} products`);
}
main();
