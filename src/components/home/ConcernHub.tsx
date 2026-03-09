"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product, Concern, Ingredient } from "@/lib/types";
import ConcernSelector from "./ConcernSelector";
import IngredientHighlight from "./IngredientHighlight";
import ProductCard from "@/components/products/ProductCard";

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
    viewMore: string;
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
  const loc = locale as "vi" | "en";

  function handleToggle(id: Concern) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const hasSelection = selected.length > 0;

  // Filter products matching ANY selected concern, sorted by relevance (match count)
  const filteredProducts = hasSelection
    ? products
        .filter((p) => selected.some((c) => p.concerns.includes(c)))
        .sort((a, b) => {
          const aCount = selected.filter((c) => a.concerns.includes(c)).length;
          const bCount = selected.filter((c) => b.concerns.includes(c)).length;
          if (bCount !== aCount) return bCount - aCount;
          return a.popularity.rank - b.popularity.rank;
        })
    : products;

  const displayProducts = filteredProducts.slice(0, 12);

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

  const concernParam = hasSelection ? selected.join(",") : "all";

  return (
    <div className="space-y-6">
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

      {displayProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {displayProducts.map((product) => (
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

          {filteredProducts.length > 12 && (
            <div className="flex justify-center">
              <Link
                href={`/${locale}/products?concern=${concernParam}`}
                className="text-sm text-neutral-500 hover:text-neutral-700 active:text-neutral-900 transition-colors min-h-[44px] flex items-center gap-0.5"
              >
                {dict.viewMore}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-neutral-400 text-center py-8">
          {dict.emptyState}
        </p>
      )}
    </div>
  );
}
