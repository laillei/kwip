// src/components/home/IngredientChips.tsx
import type { Ingredient, Concern } from "@/lib/types";

interface IngredientChipsProps {
  ingredients: Ingredient[];
  concern: Concern;
  locale: string;
}

export default function IngredientChips({ ingredients, concern, locale }: IngredientChipsProps) {
  const loc = locale as "vi" | "en";

  return (
    <div className="-mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ingredients.map((ing) => {
          const effect = ing.effects.find((e) => e.concern === concern && e.type === "good");
          const name = loc === "vi" ? ing.name.vi : ing.name.inci;
          return (
            <div
              key={ing.id}
              className="shrink-0 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 h-8"
            >
              <span className="text-xs font-semibold text-emerald-600">{name}</span>
              {effect && (
                <span className="text-xs text-emerald-600">
                  — {effect.reason[loc] || effect.reason.vi}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
