import type { Concern } from "./concern";

export type IngredientCategory =
  | "active"
  | "moisturizer"
  | "emollient"
  | "surfactant"
  | "preservative"
  | "fragrance"
  | "other";

export interface Ingredient {
  id: string;
  name: {
    inci: string;
    vi: string;
    ko: string;
  };
  description: {
    vi: string;
  };
  effects: {
    concern: Concern;
    type: "good" | "caution";
    reason: {
      vi: string;
    };
  }[];
  ewgGrade?: string;
  category: IngredientCategory;
}
