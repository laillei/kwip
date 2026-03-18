"use client";

import { useState, useEffect } from "react";
import type { Product, Concern, Ingredient, Category } from "@/lib/types";
import ConcernFilterBar from "./ConcernFilterBar";
import StepFilterBar from "./StepFilterBar";
import ProductListItem from "./ProductListItem";
import { getSavedProducts, saveProduct, unsaveProduct } from "@/lib/localSaved";

const CATEGORIES: { category: Category; label: Record<string, string> }[] = [
  { category: "cleanser", label: { vi: "Sữa rửa mặt", en: "Cleanser" } },
  { category: "pad", label: { vi: "Tẩy da chết", en: "Exfoliator" } },
  { category: "toner", label: { vi: "Toner", en: "Toner" } },
  { category: "essence", label: { vi: "Essence", en: "Essence" } },
  { category: "serum", label: { vi: "Serum", en: "Serum" } },
  { category: "ampoule", label: { vi: "Ampoule", en: "Ampoule" } },
  { category: "mask", label: { vi: "Mặt nạ", en: "Mask" } },
  { category: "cream", label: { vi: "Kem dưỡng", en: "Moisturizer" } },
  { category: "sunscreen", label: { vi: "Chống nắng", en: "Sunscreen" } },
];

interface ConcernData {
  id: Concern;
  label: string;
  icon: string;
  symptom: string;
  keyIngredientIds: string[];
}

interface DiscoveryHubProps {
  concerns: ConcernData[];
  products: Product[];
  ingredients: Ingredient[];
  locale: string;
  dict: {
    allItems: string;
    emptyState: string;
    savedToast: string;
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
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const loc = locale as "vi" | "en";

  useEffect(() => {
    setSavedIds(new Set(getSavedProducts()));
  }, []);

  function handleBookmark(productId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        unsaveProduct(productId);
      } else {
        next.add(productId);
        saveProduct(productId);
        if (next.size === 1 && !localStorage.getItem("kwip_toast_shown")) {
          localStorage.setItem("kwip_toast_shown", "1");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500);
        }
      }
      return next;
    });
  }

  function handleConcernSelect(id: Concern | "all") {
    setSelectedConcern(id);
    setSelectedCategory("all");
  }

  function getProductReason(product: Product): string | undefined {
    if (selectedConcern === "all") return undefined;
    for (const pi of product.ingredients) {
      if (!pi.isKey) continue;
      const ing = ingredients.find((i) => i.id === pi.ingredientId);
      if (!ing) continue;
      const effect = ing.effects.find(
        (e) => e.concern === selectedConcern && e.type === "good"
      );
      if (effect) {
        const name = loc === "vi" ? ing.name.vi : ing.name.inci;
        return `${name} — ${effect.reason[loc] || effect.reason.vi}`;
      }
    }
    return undefined;
  }

  const concernFiltered = products.filter(
    (p) => selectedConcern === "all" || p.concerns.includes(selectedConcern)
  );
  const filtered = concernFiltered.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

  const concernOptions = [
    { id: "all" as const, label: dict.allItems },
    ...concerns
      .filter((c) => products.some((p) => p.concerns.includes(c.id)))
      .map((c) => ({ id: c.id, label: c.label })),
  ];

  const availableCategories = CATEGORIES.filter((cat) =>
    concernFiltered.some((p) => p.category === cat.category)
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
    <div className="space-y-3">
      <ConcernFilterBar
        options={concernOptions}
        selected={selectedConcern}
        onSelect={handleConcernSelect}
      />
      <StepFilterBar
        steps={categoryOptions}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <p className="text-xs text-neutral-500 px-1">{countLabel}</p>
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-[15px] text-neutral-400 text-center py-12">{dict.emptyState}</p>
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
              saved={savedIds.has(product.id)}
              onBookmark={(e) => handleBookmark(product.id, e)}
            />
          ))
        )}
      </div>
      {showToast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-neutral-900 text-white text-[14px] font-medium px-4 py-3 rounded-2xl text-center shadow-lg">
          {dict.savedToast}
        </div>
      )}
    </div>
  );
}
