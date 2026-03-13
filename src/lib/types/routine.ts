import type { Category } from "./product";
import type { Concern } from "./concern";

export interface RoutineProduct {
  productId: string;
  category: Category;
  step: number;
}

export interface Routine {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  concern: Concern;
  products: RoutineProduct[];
  createdAt: string;
  updatedAt: string;
}

export type CreateRoutineInput = Omit<Routine, "id" | "createdAt" | "updatedAt">;
