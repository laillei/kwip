import { createClient } from "@supabase/supabase-js";

const UNOFFICIAL_PATTERNS = [
  "oliveyoung.com", "hwahae.co.kr", "amazon.com", "holiholic.com",
  "thankyouskin.com", "masksheets.com", "cloudfront.net",
];

async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from("products").select("slug, brand, image");
  const bad = (data ?? []).filter(p => UNOFFICIAL_PATTERNS.some(pat => (p.image ?? "").includes(pat)));
  console.log(`Unofficial images remaining: ${bad.length}`);
  for (const p of bad) console.log(`  ${p.brand}/${p.slug}\n    ${p.image}`);
}
main();
