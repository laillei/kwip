// scripts/db/migrate-concern-taxonomy.ts
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── PHASE 1: Ingredient effect rewrites ───────────────────────────────────

// Ingredients where hydration/good → moisture/good (barrier/occlusive ingredients)
const HYDRATION_TO_MOISTURE = new Set([
  "ceramide-np",
  "squalane",
  "shea-butter",
  "jojoba-oil",
  "coco-caprylate-caprate",
  "collagen",
  "bifida-ferment-lysate",
  "snail-secretion-filtrate",
  "panthenol",
]);

// Ingredients where hydration/good is removed entirely (solvents/base agents)
const REMOVE_HYDRATION = new Set(["butylene-glycol", "propanediol"]);

// Ingredients that get exfoliation/good added
const ADD_EXFOLIATION = new Set(["salicylic-acid", "glycolic-acid"]);

// Reasons for new moisture effects
const MOISTURE_REASONS: Record<string, { vi: string; en: string }> = {
  "ceramide-np": {
    vi: "Phục hồi hàng rào bảo vệ da, giữ ẩm sâu",
    en: "Restores skin barrier and locks in moisture",
  },
  squalane: {
    vi: "Dưỡng ẩm nhẹ nhàng, không gây bít lỗ chân lông",
    en: "Lightweight moisturizer that won't clog pores",
  },
  "shea-butter": {
    vi: "Làm mềm và cấp ẩm sâu cho da khô",
    en: "Deeply moisturizes and softens dry skin",
  },
  "jojoba-oil": {
    vi: "Dưỡng ẩm cân bằng, phù hợp mọi loại da",
    en: "Balancing moisturizer suitable for all skin types",
  },
  "coco-caprylate-caprate": {
    vi: "Dưỡng ẩm nhẹ, cải thiện kết cấu da",
    en: "Lightweight emollient that improves skin texture",
  },
  collagen: {
    vi: "Bổ sung ẩm và cải thiện đàn hồi da",
    en: "Boosts moisture and improves skin elasticity",
  },
  "bifida-ferment-lysate": {
    vi: "Tăng cường hàng rào bảo vệ da, dưỡng ẩm sâu",
    en: "Strengthens skin barrier and provides deep moisture",
  },
  "snail-secretion-filtrate": {
    vi: "Dưỡng ẩm sâu, phục hồi da hư tổn",
    en: "Deeply moisturizes and repairs damaged skin",
  },
  panthenol: {
    vi: "Phục hồi hàng rào ẩm, làm dịu và dưỡng ẩm da",
    en: "Repairs moisture barrier, soothes and hydrates skin",
  },
};

const EXFOLIATION_REASONS: Record<string, { vi: string; en: string }> = {
  "salicylic-acid": {
    vi: "Tẩy tế bào chết sâu bên trong lỗ chân lông",
    en: "Exfoliates dead cells inside the pore to clear buildup",
  },
  "glycolic-acid": {
    vi: "Tẩy tế bào chết, làm mịn và sáng da",
    en: "Removes dead cells to smooth and brighten skin texture",
  },
};

function rewriteEffects(
  effects: Array<{ concern: string; type: string; reason: { vi: string; en: string } }>,
  ingredientId: string
): Array<{ concern: string; type: string; reason: { vi: string; en: string } }> {
  const updated: typeof effects = [];

  for (const effect of effects) {
    // Remove sun-protection entirely
    if (effect.concern === "sun-protection") continue;

    // Rename acne → trouble
    if (effect.concern === "acne") {
      updated.push({ ...effect, concern: "trouble" });
      continue;
    }

    // Handle hydration effects
    if (effect.concern === "hydration" && effect.type === "good") {
      if (REMOVE_HYDRATION.has(ingredientId)) continue; // drop entirely
      if (HYDRATION_TO_MOISTURE.has(ingredientId)) {
        // Replace with moisture/good
        updated.push({
          concern: "moisture",
          type: "good",
          reason: MOISTURE_REASONS[ingredientId] ?? effect.reason,
        });
        continue;
      }
    }

    updated.push(effect);
  }

  // Add exfoliation/good if applicable
  if (ADD_EXFOLIATION.has(ingredientId)) {
    updated.push({
      concern: "exfoliation",
      type: "good",
      reason: EXFOLIATION_REASONS[ingredientId],
    });
  }

  return updated;
}

async function phase1UpdateIngredientEffects() {
  console.log("Phase 1: Updating ingredient effects...");
  const { data: ingredients, error } = await supabase
    .from("ingredients")
    .select("id, effects");
  if (error) throw error;

  let updated = 0;
  for (const ing of ingredients) {
    const newEffects = rewriteEffects(ing.effects, ing.id);
    const changed = JSON.stringify(newEffects) !== JSON.stringify(ing.effects);
    if (!changed) continue;

    const { error: updateError } = await supabase
      .from("ingredients")
      .update({ effects: newEffects })
      .eq("id", ing.id);
    if (updateError) throw updateError;
    console.log(`  ✓ ${ing.id}`);
    updated++;
  }
  console.log(`Phase 1 done: ${updated} ingredients updated.\n`);
}

// ─── PHASE 2: Recompute product concerns from key ingredients ──────────────

async function phase2RecomputeProductConcerns() {
  console.log("Phase 2: Recomputing product concerns...");
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, category, ingredients")
    .eq("is_active", true);
  if (pErr) throw pErr;

  const { data: ingredients, error: iErr } = await supabase
    .from("ingredients")
    .select("id, effects");
  if (iErr) throw iErr;

  const ingEffects: Record<string, string[]> = {};
  for (const ing of ingredients) {
    ingEffects[ing.id] = ing.effects
      .filter((e: { type: string }) => e.type === "good")
      .map((e: { concern: string }) => e.concern);
  }

  let updated = 0;
  for (const product of products) {
    const concerns = new Set<string>();

    // Derive from key ingredients
    for (const pi of product.ingredients) {
      if (!pi.isKey) continue;
      for (const concern of ingEffects[pi.ingredientId] ?? []) {
        concerns.add(concern);
      }
    }

    // Pad category always gets exfoliation
    if (product.category === "pad") concerns.add("exfoliation");

    const newConcerns = [...concerns].sort();
    const { error: updateError } = await supabase
      .from("products")
      .update({ concerns: newConcerns })
      .eq("id", product.id);
    if (updateError) throw updateError;
    updated++;
  }
  console.log(`Phase 2 done: ${updated} products recomputed.\n`);
}

// ─── PHASE 3: Update concerns table ───────────────────────────────────────

async function phase3UpdateConcernsTable() {
  console.log("Phase 3: Updating concerns table...");

  // Delete removed concerns
  await supabase.from("concerns").delete().eq("id", "sun-protection");
  console.log("  ✓ deleted sun-protection");

  // Rename acne → trouble (insert new row, delete old)
  const { data: acne } = await supabase
    .from("concerns")
    .select("*")
    .eq("id", "acne")
    .single();
  if (acne) {
    await supabase.from("concerns").insert({
      ...acne,
      id: "trouble",
      label: { en: "Acne & Breakouts", ko: "트러블", vi: "Mụn" },
      symptom: {
        en: "Breakouts, blemishes & inflamed skin",
        vi: "Mụn, viêm đỏ, bít lỗ chân lông",
      },
      key_ingredients: ["salicylic-acid", "tea-tree-oil", "niacinamide", "centella-asiatica-extract"],
    });
    await supabase.from("concerns").delete().eq("id", "acne");
    console.log("  ✓ acne → trouble");
  }

  // Update hydration label/symptom/key_ingredients
  await supabase.from("concerns").update({
    label: { en: "Hydration", ko: "수분", vi: "Cấp ẩm" },
    symptom: {
      en: "Dehydrated, tight or dull skin",
      vi: "Da thiếu nước, căng, thiếu độ tươi",
    },
    key_ingredients: ["hyaluronic-acid", "sodium-hyaluronate", "betaine"],
  }).eq("id", "hydration");
  console.log("  ✓ hydration updated");

  // Insert moisture
  await supabase.from("concerns").upsert({
    id: "moisture",
    label: { en: "Moisture", ko: "보습", vi: "Dưỡng ẩm" },
    symptom: {
      en: "Dry, rough or flaky skin",
      vi: "Da khô, thô ráp, bong tróc",
    },
    icon: "🧴",
    key_ingredients: ["ceramide-np", "squalane", "shea-butter", "panthenol"],
    weather_trigger: {
      condition: "low_humidity",
      message: {
        en: "Low humidity today — your skin barrier needs extra support",
        vi: "Độ ẩm thấp hôm nay — hàng rào bảo vệ da cần được tăng cường",
      },
    },
  });
  console.log("  ✓ moisture inserted");

  // Insert exfoliation
  await supabase.from("concerns").upsert({
    id: "exfoliation",
    label: { en: "Exfoliation", ko: "각질", vi: "Tẩy da chết" },
    symptom: {
      en: "Dull skin, rough texture, clogged pores",
      vi: "Da xỉn màu, thô ráp, lỗ chân lông bít tắc",
    },
    icon: "✨",
    key_ingredients: ["salicylic-acid", "glycolic-acid"],
    weather_trigger: {
      condition: "none",
      message: { en: "", vi: "" },
    },
  });
  console.log("  ✓ exfoliation inserted");

  console.log("Phase 3 done.\n");
}

// ─── RUN ──────────────────────────────────────────────────────────────────

(async () => {
  try {
    await phase1UpdateIngredientEffects();
    await phase2RecomputeProductConcerns();
    await phase3UpdateConcernsTable();
    console.log("✅ Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
