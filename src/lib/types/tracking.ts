import type { Concern } from "./concern";
import type { Category } from "./product";

export type TrackingEvent =
  | { event: "concern_select"; concern: Concern }
  | { event: "product_view"; productId: string; rank: number }
  | { event: "ingredient_expand"; productId: string }
  | { event: "purchase_click"; productId: string; platform: "shopee" | "lazada" | "tiktok" | "hasaki" | "oliveyoung" }
  | { event: "zalo_share"; productId: string }
  | { event: "daily_context_view"; weatherCondition: string }
  | { event: "category_filter"; category: Category };
