// --- Shared union types ---

export type Brand =
  | "cosrx"
  | "anua"
  | "torriden"
  | "beauty-of-joseon"
  | "round-lab"
  | "skin1004";

export type Category = "toner" | "serum" | "sunscreen" | "cream" | "pad";

export type Concern = "acne" | "moisturizing" | "brightening" | "anti-aging";

export type IngredientCategory =
  | "active"
  | "moisturizer"
  | "emollient"
  | "surfactant"
  | "preservative"
  | "fragrance"
  | "other";

// --- Product ---

export interface ProductIngredient {
  ingredientId: string;
  order: number;
  isKey: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: {
    ko: string;
    vi: string;
    en: string;
  };
  brand: Brand;
  category: Category;
  image: string;
  concerns: Concern[];
  ingredients: ProductIngredient[];
  popularity: {
    rank: number;
    updatedAt: string;
  };
  purchase: {
    shopee?: string;
    tiktokShop?: string;
    hasaki?: string;
  };
  tags: string[];
}

// --- Ingredient ---

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

// --- Concern Map ---

export interface ConcernMap {
  id: Concern;
  label: {
    vi: string;
    ko: string;
  };
  icon: string;
  keyIngredients: string[];
  weatherTrigger: {
    condition: string;
    message: {
      vi: string;
    };
  };
}

// --- localStorage ---

export interface KwipStorage {
  selectedConcern: Concern | null;
  recentProducts: string[];
  lastVisit: string;
}

export const STORAGE_KEY = "kwip_v1";

// --- Event tracking ---

export type TrackingEvent =
  | { event: "concern_select"; concern: Concern }
  | { event: "product_view"; productId: string; rank: number }
  | { event: "ingredient_expand"; productId: string }
  | { event: "purchase_click"; productId: string; platform: "shopee" | "tiktok" | "hasaki" }
  | { event: "zalo_share"; productId: string }
  | { event: "daily_context_view"; weatherCondition: string }
  | { event: "category_filter"; category: Category };
