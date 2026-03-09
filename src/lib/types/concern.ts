export type Concern = "acne" | "pores" | "hydration" | "brightening" | "soothing" | "anti-aging" | "sun-protection";

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
