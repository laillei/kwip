import type { Ingredient, Concern } from "@/lib/types";

interface IngredientHighlightProps {
  ingredients: Ingredient[];
  concerns: Concern[];
  locale: string;
}

export default function IngredientHighlight({
  ingredients,
  concerns,
  locale,
}: IngredientHighlightProps) {
  if (ingredients.length === 0) return null;

  const loc = locale as "vi" | "en";

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
        {loc === "vi" ? "Thanh phan huu ich" : "Helpful Ingredients"}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {ingredients.map((ing) => {
          const relevantEffects = ing.effects.filter(
            (e) => concerns.includes(e.concern) && e.type === "good"
          );
          return (
            <div
              key={ing.id}
              className="flex-shrink-0 w-[200px] bg-white rounded-xl p-3.5"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <p className="text-sm font-semibold text-neutral-900">
                {ing.name.vi}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {ing.name.inci}
              </p>
              {relevantEffects.length > 0 && (
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed line-clamp-2">
                  {relevantEffects[0].reason[loc] || relevantEffects[0].reason.vi}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
