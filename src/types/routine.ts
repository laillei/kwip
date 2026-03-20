import type { Category } from "./product";
import type { Concern } from "./concern";

export interface RoutineProduct {
  productId: string;
  category: Category;
  step: number;
}

export interface Routine {
  id: string;
  name: string;
  concern: Concern;
  products: RoutineProduct[];
  createdAt: string;
}
