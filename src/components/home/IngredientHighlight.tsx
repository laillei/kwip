import type { Ingredient, Concern } from "@/types";

interface IngredientHighlightProps {
  ingredients: Ingredient[];
  concerns: Concern[];
  locale: string;
  heading?: string;
}

export default function IngredientHighlight({
  ingredients,
  concerns,
  locale,
  heading,
}: IngredientHighlightProps) {
  if (ingredients.length === 0) return null;

  const loc = locale as "vi" | "en";

  return (
    <div className="space-y-2">
      {heading && (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {heading}
        </h3>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {ingredients.map((ing) => {
          const relevantEffects = ing.effects.filter(
            (e) => concerns.includes(e.concern) && e.type === "good"
          );
          const displayName = loc === "vi" ? ing.name.vi : ing.name.inci;
          return (
            <div
              key={ing.id}
              className="flex-shrink-0 w-44 bg-neutral-100 rounded-xl p-3.5"
            >
              <p className="text-[15px] font-semibold text-neutral-900">
                {displayName}
              </p>
              {loc === "vi" && (
                <p className="text-[13px] font-medium text-neutral-500 mt-0.5">
                  {ing.name.inci}
                </p>
              )}
              {relevantEffects.length > 0 && (
                <p className="text-[13px] text-neutral-600 mt-2 leading-relaxed line-clamp-2">
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
