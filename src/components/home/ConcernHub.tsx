"use client";

import { useState } from "react";
import type { Product, Concern, Ingredient, Category } from "@/lib/types";
import ConcernSelector from "./ConcernSelector";
import IngredientChips from "./IngredientChips";
import StepFilterBar from "./StepFilterBar";
import RoutineStepSection from "./RoutineStepSection";
import BuildRoutineButton from "./BuildRoutineButton";
import { EmptyState } from "@/components/ui";

const ROUTINE_STEPS: { category: Category; label: Record<string, string>; step: number }[] = [
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
    concernPrompt: string;
    buildCta: string;
    pickConcernPrompt: string;
    allSteps: string;
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
  const [selectedStep, setSelectedStep] = useState<Category | "all">("all");
  const loc = locale as "vi" | "en";

  function handleToggle(id: Concern) {
    setSelected((prev) => {
      if (prev === id) { setSelectedStep("all"); return null; }
      setSelectedStep("all");
      return id;
    });
  }

  const hasSelection = selected !== null;

  const filteredProducts = products
    .filter((p) => !hasSelection || p.concerns.includes(selected!))
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  const keyIngredientIds = hasSelection
    ? concerns.find((c) => c.id === selected)?.keyIngredientIds ?? []
    : [];

  const keyIngredients = keyIngredientIds
    .map((id) => ingredients.find((i) => i.id === id))
    .filter((i): i is Ingredient => i !== undefined);

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

  const activeConcerns = concerns.filter((c) =>
    products.some((p) => p.concerns.includes(c.id))
  );

  // Build routine groups for steps that have products
  const seenIds = new Set<string>();
  const routineGroups = hasSelection
    ? ROUTINE_STEPS
        .map((step) => ({
          ...step,
          products: filteredProducts
            .filter((p) => p.category === step.category && !seenIds.has(p.id))
            .map((p) => { seenIds.add(p.id); return p; }),
        }))
        .filter((group) => group.products.length > 0)
    : [];

  // Step filter options: All + steps that have products
  const stepOptions = [
    { category: "all" as const, label: dict.allSteps },
    ...routineGroups.map((g) => ({
      category: g.category,
      label: g.label[loc] || g.label.vi,
    })),
  ];

  // Sections to render based on step filter
  const visibleGroups = selectedStep === "all"
    ? routineGroups
    : routineGroups.filter((g) => g.category === selectedStep);

  return (
    <div className="space-y-5">
      {/* Concern selector */}
      <div className="space-y-3">
        <p className="text-[17px] font-medium text-neutral-900">{dict.concernPrompt}</p>
        <ConcernSelector
          concerns={activeConcerns}
          selected={selected}
          onToggle={handleToggle}
        />
      </div>

      {/* No selection state */}
      {!hasSelection && (
        <p className="text-[15px] text-neutral-400 text-center py-12">
          {dict.pickConcernPrompt}
        </p>
      )}

      {/* Selection state */}
      {hasSelection && (
        <div className="space-y-4">
          {/* Compact ingredient chips */}
          {keyIngredients.length > 0 && (
            <IngredientChips
              ingredients={keyIngredients}
              concern={selected!}
              locale={locale}
            />
          )}

          {/* Build Routine CTA */}
          <BuildRoutineButton locale={locale} concern={selected!} label={dict.buildCta} />

          {/* Step filter — only show when more than one step */}
          {routineGroups.length > 1 && (
            <StepFilterBar
              steps={stepOptions}
              selected={selectedStep}
              onSelect={setSelectedStep}
            />
          )}

          {/* Vertical product list */}
          {visibleGroups.length > 0 ? (
            <div className="space-y-6">
              {visibleGroups.map((group) => (
                <RoutineStepSection
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
            <EmptyState icon="🔍" title={dict.emptyState} />
          )}
        </div>
      )}
    </div>
  );
}
