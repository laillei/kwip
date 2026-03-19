"use client";

import { useState } from "react";
import type { Product, Concern, Ingredient, Category } from "@/lib/types";
import ConcernFilterBar from "./ConcernFilterBar";
import StepFilterBar from "./StepFilterBar";
import ProductListItem from "./ProductListItem";

// Serum tab covers essence + ampoule + serum (all thin on their own).
// Sunscreen removed from step filter — not a skin concern, it's a product category.
const CATEGORIES: { category: Category; label: Record<string, string> }[] = [
  { category: "cleanser", label: { vi: "Sữa rửa mặt", en: "Cleanser" } },
  { category: "pad", label: { vi: "Tẩy da chết", en: "Exfoliator" } },
  { category: "toner", label: { vi: "Toner", en: "Toner" } },
  { category: "serum", label: { vi: "Serum", en: "Serum" } },
  { category: "mask", label: { vi: "Mặt nạ", en: "Mask" } },
  { category: "cream", label: { vi: "Kem dưỡng", en: "Moisturizer" } },
];

// "Serum" step tab matches all three concentrated-treatment categories
const SERUM_GROUP = new Set<Category>(["serum", "essence", "ampoule"]);

interface ConcernData {
  id: Concern;
  label: string;
}

interface DiscoveryHubProps {
  concerns: ConcernData[];
  products: Product[];
  ingredients: Ingredient[];
  locale: string;
  dict: {
    allItems: string;
    emptyState: string;
    productsCount: string;
  };
}

export default function DiscoveryHub({
  concerns,
  products,
  ingredients,
  locale,
  dict,
}: DiscoveryHubProps) {
  const [selectedConcern, setSelectedConcern] = useState<Concern | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const loc = locale as "vi" | "en";

  function handleConcernSelect(id: Concern | "all") {
    setSelectedConcern(id);
    setSelectedCategory("all");
  }

  function getProductReason(product: Product): string | undefined {
    if (selectedConcern === "all") {
      const firstKey = product.ingredients.find((pi) => pi.isKey);
      if (!firstKey) return undefined;
      const ing = ingredients.find((i) => i.id === firstKey.ingredientId);
      if (!ing) return undefined;
      return loc === "vi" ? ing.name.vi : ing.name.inci;
    }
    for (const pi of product.ingredients) {
      if (!pi.isKey) continue;
      const ing = ingredients.find((i) => i.id === pi.ingredientId);
      if (!ing) continue;
      const effect = ing.effects.find(
        (e) => e.concern === selectedConcern && e.type === "good"
      );
      if (effect) {
        return loc === "vi" ? ing.name.vi : ing.name.inci;
      }
    }
    return undefined;
  }

  const concernFiltered = products.filter(
    (p) => selectedConcern === "all" || p.concerns.includes(selectedConcern)
  );
  const filtered = concernFiltered.filter((p) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "serum") return SERUM_GROUP.has(p.category);
    return p.category === selectedCategory;
  });

  const concernOptions = [
    { id: "all" as const, label: dict.allItems },
    ...concerns
      .filter((c) => products.some((p) => p.concerns.includes(c.id)))
      .map((c) => ({ id: c.id, label: c.label })),
  ];

  const availableCategories = CATEGORIES.filter((cat) =>
    cat.category === "serum"
      ? concernFiltered.some((p) => SERUM_GROUP.has(p.category))
      : concernFiltered.some((p) => p.category === cat.category)
  );
  const categoryOptions = [
    { category: "all" as const, label: dict.allItems },
    ...availableCategories.map((cat) => ({
      category: cat.category,
      label: cat.label[loc] || cat.label.vi,
    })),
  ];

  const countLabel = dict.productsCount.replace("{{count}}", String(filtered.length));

  return (
    <div>
      {/* Concern bar — high z so it floats above dropdown overlay */}
      <div className="sticky top-[56px] z-[48] bg-white md:top-0 -mx-4 px-4">
        <ConcernFilterBar
          options={concernOptions}
          selected={selectedConcern}
          onSelect={handleConcernSelect}
        />
      </div>

      {/* Step bar — lower z, sits behind dropdown overlay when open */}
      <div className="sticky top-[100px] z-[30] bg-white md:top-0 -mx-4 px-4">
        <StepFilterBar
          steps={categoryOptions}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>
      <p className="text-[13px] text-neutral-500 px-1 pt-4 pb-2">{countLabel}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-6">
        {filtered.length === 0 ? (
          <p className="text-[15px] text-neutral-400 text-center py-12 col-span-2 md:col-span-4">{dict.emptyState}</p>
        ) : (
          filtered.map((product) => (
            <ProductListItem
              key={product.id}
              slug={product.slug}
              name={product.name[loc] || product.name.vi}
              brand={product.brand}
              category={product.category}
              image={product.image}
              locale={locale}
              reason={getProductReason(product)}
            />
          ))
        )}
      </div>
    </div>
  );
}
