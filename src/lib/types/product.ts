import type { Concern } from "./concern";

export type Brand =
  | "cosrx"
  | "anua"
  | "torriden"
  | "beauty-of-joseon"
  | "round-lab"
  | "skin1004"
  | "klairs"
  | "some-by-mi"
  | "innisfree"
  | "laneige"
  | "isntree"
  | "purito";

export type Category = "toner" | "serum" | "sunscreen" | "cream" | "pad";

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
