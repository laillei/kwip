export type Concern =
  | "trouble"
  | "hydration"
  | "moisture"
  | "pores"
  | "brightening"
  | "anti-aging"
  | "soothing"
  | "exfoliation";

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
