"use client";

import { useState } from "react";
import type { Product, Concern, Ingredient, Category } from "@/lib/types";
import ConcernSelector from "./ConcernSelector";
import IngredientHighlight from "./IngredientHighlight";
import BuildRoutineButton from "./BuildRoutineButton";
import ProductCard from "@/components/products/ProductCard";
import RoutineStepRow from "./RoutineStepRow";

// Routine steps in correct Korean skincare order
const routineSteps: { category: Category; label: Record<string, string>; step: number }[] = [
  { category: "cleanser", step: 1, label: { en: "Cleanse", vi: "Làm sạch" } },
  { category: "pad", step: 2, label: { en: "Exfoliate", vi: "Tẩy tế bào chết" } },
  { category: "toner", step: 3, label: { en: "Toner", vi: "Nước hoa hồng" } },
  { category: "essence", step: 4, label: { en: "Essence", vi: "Tinh chất" } },
  { category: "serum", step: 5, label: { en: "Serum", vi: "Serum" } },
  { category: "ampoule", step: 6, label: { en: "Ampoule", vi: "Tinh chất cô đặc" } },
  { category: "mask", step: 7, label: { en: "Mask", vi: "Mặt nạ" } },
  { category: "cream", step: 8, label: { en: "Moisturize", vi: "Dưỡng ẩm" } },
  { category: "sunscreen", step: 9, label: { en: "Sun Protection", vi: "Chống nắng" } },
];

interface ConcernData {
  id: Concern;
  label: string;
  icon: string;
  symptom: string;
  keyIngredientIds: string[];
}

interface ConcernHubProps {
  concerns: ConcernData[];
  products: Product[];
  ingredients: Ingredient[];
  locale: string;
  dict: {
    emptyState: string;
    helpfulIngredients: string;
    concernPrompt: string;
    buildCta: string;
  };
}

export default function ConcernHub({
  concerns,
  products,
  ingredients,
  locale,
  dict,
}: ConcernHubProps) {
  const [selected, setSelected] = useState<Concern | null>(null);
  const loc = locale as "vi" | "en";

  function handleToggle(id: Concern) {
    setSelected((prev) => (prev === id ? null : id));
  }

  const hasSelection = selected !== null;

  // Filter products matching selected concern, sorted by popularity rank
  const filteredProducts = products
    .filter((p) => !hasSelection || p.concerns.includes(selected!))
    .sort((a, b) => {
      return a.popularity.rank - b.popularity.rank;
    });

  // Get key ingredients for selected concern
  const keyIngredientIds = hasSelection
    ? concerns.find((c) => c.id === selected)?.keyIngredientIds ?? []
    : [];

  const keyIngredients = keyIngredientIds
    .map((id) => ingredients.find((i) => i.id === id))
    .filter((i): i is Ingredient => i !== undefined);

  // Find the "why" reason for a product — the key ingredient that matches selected concerns
  function getProductReason(product: Product): string | undefined {
    if (!hasSelection) return undefined;
    for (const pi of product.ingredients) {
      if (!pi.isKey) continue;
      const ing = ingredients.find((i) => i.id === pi.ingredientId);
      if (!ing) continue;
      const matchingEffect = ing.effects.find(
        (e) => e.concern === selected && e.type === "good"
      );
      if (matchingEffect) {
        const name = loc === "vi" ? ing.name.vi : ing.name.inci;
        return `${name} — ${matchingEffect.reason[loc] || matchingEffect.reason.vi}`;
      }
    }
    return undefined;
  }

  // Only show concerns that have at least one matching product
  const activeConcerns = concerns.filter((c) =>
    products.some((p) => p.concerns.includes(c.id))
  );

  // Group products by routine step when concern is selected
  const seenIds = new Set<string>();
  const routineGroups = hasSelection
    ? routineSteps
        .map((step) => ({
          ...step,
          products: filteredProducts
            .filter((p) => p.category === step.category && !seenIds.has(p.id))
            .map((p) => { seenIds.add(p.id); return p; }),
        }))
        .filter((group) => group.products.length > 0)
    : [];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-base font-medium text-neutral-900">
          {dict.concernPrompt}
        </p>
        <ConcernSelector
          concerns={activeConcerns}
          selected={selected}
          onToggle={handleToggle}
        />
        {hasSelection && keyIngredients.length > 0 && (
          <>
            <IngredientHighlight
              ingredients={keyIngredients}
              concerns={selected ? [selected] : []}
              locale={locale}
            />
            <BuildRoutineButton
              locale={locale}
              concern={selected!}
              label={dict.buildCta}
            />
          </>
        )}
      </div>

      {/* Routine-grouped view when concerns selected, flat grid when not */}
      {hasSelection ? (
        routineGroups.length > 0 ? (
          <div className="space-y-8">
            {routineGroups.map((group) => (
              <RoutineStepRow
                key={group.category}
                step={group.step}
                label={group.label[loc] || group.label.vi}
                category={group.category}
                products={group.products}
                locale={locale}
                getProductReason={getProductReason}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-neutral-400 text-2xl mb-3">🔍</p>
            <p className="text-sm text-neutral-600">{dict.emptyState}</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name[loc] || product.name.vi}
              brand={product.brand}
              category={product.category}
              image={product.image}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
