"use client";

import { useState } from "react";
import type { Product, Concern, Ingredient, Category } from "@/lib/types";
import ConcernSelector from "./ConcernSelector";
import IngredientHighlight from "./IngredientHighlight";
import ProductCard from "@/components/products/ProductCard";

const categories: { id: Category | "all"; label: Record<string, string> }[] = [
  { id: "all", label: { en: "All", vi: "Tất cả" } },
  { id: "serum", label: { en: "Serum", vi: "Serum" } },
  { id: "cream", label: { en: "Cream", vi: "Kem" } },
  { id: "toner", label: { en: "Toner", vi: "Toner" } },
  { id: "sunscreen", label: { en: "Sunscreen", vi: "Chống nắng" } },
  { id: "cleanser", label: { en: "Cleanser", vi: "Sữa rửa mặt" } },
  { id: "mask", label: { en: "Mask", vi: "Mặt nạ" } },
  { id: "pad", label: { en: "Pad", vi: "Pad" } },
  { id: "ampoule", label: { en: "Ampoule", vi: "Ampoule" } },
  { id: "essence", label: { en: "Essence", vi: "Tinh chất" } },
];

interface ConcernData {
  id: Concern;
  label: string;
  icon: string;
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
  };
}

export default function ConcernHub({
  concerns,
  products,
  ingredients,
  locale,
  dict,
}: ConcernHubProps) {
  const [selected, setSelected] = useState<Concern[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const loc = locale as "vi" | "en";

  function handleToggle(id: Concern) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const hasSelection = selected.length > 0;

  // Filter products matching ANY selected concern, sorted by relevance
  const filteredProducts = products
    .filter((p) => !hasSelection || selected.some((c) => p.concerns.includes(c)))
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .sort((a, b) => {
      if (hasSelection) {
        const aCount = selected.filter((c) => a.concerns.includes(c)).length;
        const bCount = selected.filter((c) => b.concerns.includes(c)).length;
        if (bCount !== aCount) return bCount - aCount;
      }
      return a.popularity.rank - b.popularity.rank;
    });

  // Get key ingredients for selected concerns
  const keyIngredientIds = hasSelection
    ? [
        ...new Set(
          concerns
            .filter((c) => selected.includes(c.id))
            .flatMap((c) => c.keyIngredientIds)
        ),
      ]
    : [];

  const keyIngredients = keyIngredientIds
    .map((id) => ingredients.find((i) => i.id === id))
    .filter((i): i is Ingredient => i !== undefined);

  return (
    <div className="space-y-5">
      <ConcernSelector
        concerns={concerns}
        selected={selected}
        onToggle={handleToggle}
      />

      {hasSelection && keyIngredients.length > 0 && (
        <IngredientHighlight
          ingredients={keyIngredients}
          concerns={selected}
          locale={locale}
          heading={dict.helpfulIngredients}
        />
      )}

      {/* Category tabs */}
      <div className="flex overflow-x-auto -mx-6 px-6 border-b border-neutral-200 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 flex items-center justify-center h-11 px-4 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
              cat.id === activeCategory
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {cat.label[loc] || cat.label.vi}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {filteredProducts.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-neutral-300 text-4xl mb-3">🔍</p>
          <p className="text-sm text-neutral-400">{dict.emptyState}</p>
        </div>
      )}
    </div>
  );
}
