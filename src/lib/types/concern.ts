export type Concern = "acne" | "moisturizing" | "brightening" | "anti-aging";

export interface ConcernMap {
  id: Concern;
  label: {
    vi: string;
    ko: string;
    en: string;
  };
  icon: string;
  keyIngredients: string[];
  weatherTrigger: {
    condition: string;
    message: {
      vi: string;
      en: string;
    };
  };
}
