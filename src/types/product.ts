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
  | "purito"
  | "mixsoon"
  | "medicube"
  | "tirtir"
  | "numbuzin"
  | "biodance"
  | "illiyoon"
  | "dr-g"
  | "benton"
  | "heimish"
  | "tocobo"
  | "haruharu"
  | "goodal"
  | "dr-jart"
  | "sulwhasoo"
  | "mediheal"
  | "etude"
  | "nature-republic"
  | "missha"
  | "the-face-shop"
  | "banila-co"
  | "ahc"
  | "vt-cosmetics"
  // New brands added for curated catalog
  | "ma-nyo"
  | "aestura"
  | "senka"
  | "madeca21"
  | "boncept"
  | "a-pieu"
  | "sungboon-editor"
  | "medipeel";

export type Category = "toner" | "serum" | "sunscreen" | "cream" | "pad" | "cleanser" | "mask" | "ampoule" | "essence";

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
    lazada?: string;
    tiktokShop?: string;
    hasaki?: string;
    oliveyoung?: string;
  };
  tags: string[];
}
