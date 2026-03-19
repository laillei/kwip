# Concern Taxonomy Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 7-concern taxonomy with an 8-concern system aligned to Olive Young's proven Korean skincare categorisation — fixing the hydration over-tagging problem and adding missing concerns.

**Architecture:** Three-layer migration: (1) update TypeScript types + dictionaries, (2) run a Node script that updates Supabase in-place (ingredient effects → product concerns recomputed from ingredients → concerns table), (3) fix hardcoded concern strings in application code. Product concerns are fully recomputed from ingredient effects — no manual re-tagging needed.

**Tech Stack:** Next.js 15, TypeScript, Supabase (postgres via JS client), Node.js migration script

---

## Taxonomy Change Summary

| Old ID | New ID | Change |
|---|---|---|
| `acne` | `trouble` | Renamed |
| `hydration` | `hydration` | Tightened — water-based only |
| _(new)_ | `moisture` | New — barrier/occlusive |
| `pores` | `pores` | Unchanged |
| `brightening` | `brightening` | Unchanged |
| `anti-aging` | `anti-aging` | Unchanged |
| `soothing` | `soothing` | Unchanged |
| _(new)_ | `exfoliation` | New — BHA/AHA + pad category |
| `sun-protection` | _(removed)_ | Removed — product type, not concern |

---

## Task 1: Update TypeScript `Concern` type

**Files:**
- Modify: `src/lib/types/concern.ts`

**Step 1: Replace the Concern union type**

```ts
// src/lib/types/concern.ts
export type Concern =
  | "trouble"
  | "hydration"
  | "moisture"
  | "pores"
  | "brightening"
  | "anti-aging"
  | "soothing"
  | "exfoliation";

export interface ConcernMap {
  id: Concern;
  label: {
    vi: string;
    ko: string;
    en: string;
  };
  icon: string;
  keyIngredients: string[];
  weatherTrigger: {
    condition: string;
    message: {
      vi: string;
      en: string;
    };
  };
}
```

**Step 2: Build to surface all type errors**

```bash
npm run build 2>&1 | grep "error TS"
```

Expected: TypeScript errors on any file that hardcodes old concern IDs. These will be fixed in Task 3.

**Step 3: Commit**

```bash
git add src/lib/types/concern.ts
git commit -m "refactor: update Concern type — trouble, moisture, exfoliation; remove sun-protection"
```

---

## Task 2: Write the Supabase migration script

**Files:**
- Create: `scripts/migrate-concern-taxonomy.ts`

This script runs three phases in sequence: ingredient effects → product concerns → concerns table.

**Step 1: Create the script**

```ts
// scripts/migrate-concern-taxonomy.ts
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

    // Sunscreen category: no longer gets sun-protection concern
    // (sun-protection concern is being removed entirely)

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
```

**Step 2: Commit the script (don't run yet)**

```bash
git add scripts/migrate-concern-taxonomy.ts
git commit -m "chore: add concern taxonomy migration script"
```

---

## Task 3: Fix hardcoded concern references in application code

**Files:**
- Modify: `src/app/api/share/route.tsx` (line 29: `"sun-protection": "Chống nắng"`)
- Modify: `src/app/api/share-concern/route.tsx` (any hardcoded concern IDs)
- Modify: `src/components/home/DiscoveryHub.tsx` (comment referencing sun-protection)

**Step 1: Fix share/route.tsx**

Find the `CONCERN_NAMES` or similar map and update it:

```tsx
// Replace the old concern label map with:
const CONCERN_LABELS: Record<string, string> = {
  trouble: "Mụn",
  hydration: "Cấp ẩm",
  moisture: "Dưỡng ẩm",
  pores: "Lỗ chân lông",
  brightening: "Sáng da",
  "anti-aging": "Chống lão hóa",
  soothing: "Dịu da",
  exfoliation: "Tẩy da chết",
};
```

**Step 2: Fix DiscoveryHub.tsx comment**

```tsx
// Remove reference to "sun-protection concern" in comment
// Change: "// Sunscreen removed from step filter — discoverable via sun-protection concern."
// To:     "// Sunscreen removed from step filter — not a skin concern, it's a product category."
```

**Step 3: Build to verify no TS errors**

```bash
npm run build 2>&1 | grep "error TS"
```

Expected: no TypeScript errors.

**Step 4: Commit**

```bash
git add src/app/api/share/route.tsx src/app/api/share-concern/route.tsx src/components/home/DiscoveryHub.tsx
git commit -m "fix: update hardcoded concern IDs for new taxonomy"
```

---

## Task 4: Run the migration

**Step 1: Dry-run check — verify ingredient count before**

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data } = await s.from('ingredients').select('id, effects');
  const sunCount = data.filter(i => i.effects.some(e => e.concern === 'sun-protection')).length;
  const acneCount = data.filter(i => i.effects.some(e => e.concern === 'acne')).length;
  console.log('sun-protection ingredients:', sunCount, '(should become 0)');
  console.log('acne ingredients:', acneCount, '(should become 0 after rename to trouble)');
})();
" 2>/dev/null | grep -v dotenv
```

Expected output:
```
sun-protection ingredients: 3
acne ingredients: 15
```

**Step 2: Run the migration**

```bash
npx ts-node --project tsconfig.json -e "$(cat scripts/migrate-concern-taxonomy.ts)" 2>/dev/null
```

Or if ts-node isn't available:

```bash
node --loader ts-node/esm scripts/migrate-concern-taxonomy.ts
```

Or compile first:

```bash
npx tsc scripts/migrate-concern-taxonomy.ts --outDir /tmp --esModuleInterop true --module commonjs --resolveJsonModule true && node /tmp/migrate-concern-taxonomy.js
```

Expected output:
```
Phase 1: Updating ingredient effects...
  ✓ butylene-glycol
  ✓ ceramide-np
  ✓ [... more ingredients ...]
Phase 1 done: N ingredients updated.

Phase 2: Recomputing product concerns...
Phase 2 done: 295 products recomputed.

Phase 3: Updating concerns table...
  ✓ deleted sun-protection
  ✓ acne → trouble
  ✓ hydration updated
  ✓ moisture inserted
  ✓ exfoliation inserted
Phase 3 done.

✅ Migration complete.
```

**Step 3: Verify results**

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data: prods } = await s.from('products').select('concerns').eq('is_active', true);
  const counts = {};
  prods.forEach(p => p.concerns.forEach(c => { counts[c] = (counts[c]||0)+1; }));
  console.log('Product counts by concern:');
  Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([c,n]) => console.log('  ' + c + ':', n));

  const { data: concerns } = await s.from('concerns').select('id').order('id');
  console.log('\nConcerns table:', concerns.map(c=>c.id).join(', '));
})();
" 2>/dev/null | grep -v dotenv
```

Expected: `acne` and `sun-protection` are gone. `trouble`, `moisture`, `exfoliation` appear. `hydration` count is significantly lower than 268.

**Step 4: Commit**

```bash
git add scripts/migrate-concern-taxonomy.ts
git commit -m "feat: run concern taxonomy migration — trouble/moisture/exfoliation, remove sun-protection"
```

---

## Task 5: Final build + verify

**Step 1: Full production build**

```bash
npm run build
```

Expected: Build succeeds, no TypeScript errors, no missing concern references.

**Step 2: Smoke test at localhost**

Start dev server:
```bash
npm run dev
```

Check:
- Home page loads at `http://localhost:3000/vi`
- Concern filter tabs show: All, Mụn (trouble), Cấp ẩm (hydration), Dưỡng ẩm (moisture), Lỗ chân lông (pores), Sáng da (brightening), Chống lão hóa (anti-aging), Dịu da (soothing), Tẩy da chết (exfoliation)
- "Mụn" concern filters to a reasonable number of products (not 208)
- "Cấp ẩm" concern shows water-hydration products (HA serums, hydrating toners)
- "Dưỡng ẩm" concern shows barrier products (ceramide creams, rich moisturizers)
- "Tẩy da chết" concern shows pad products + BHA/AHA serums
- No "Chống nắng" concern tab visible

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: concern taxonomy migration complete — 8 concerns aligned to Olive Young standard"
```
