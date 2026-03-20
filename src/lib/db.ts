// src/lib/db.ts
/**
 * Cached Supabase data fetching.
 */

import { unstable_cache } from "next/cache";
import { createServerSupabaseClient } from "./supabase";
import type { Product, Ingredient } from "@/types";

export const CACHE_TAGS = {
  products: "products",
  ingredients: "ingredients",
  concerns: "concerns",
} as const;

const REVALIDATE = 300;

export const getAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("popularity->rank", { ascending: true });
    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return (data ?? []).map(dbProductToProduct);
  },
  ["all-products"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE }
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) return null;
    return dbProductToProduct(data);
  },
  ["product-by-slug"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE }
);

export const getAllProductSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug")
      .eq("is_active", true);
    if (error) throw new Error(`Failed to fetch slugs: ${error.message}`);
    return (data ?? []).map((r: { slug: string }) => r.slug);
  },
  ["all-product-slugs"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE }
);

export const getAllIngredients = unstable_cache(
  async (): Promise<Ingredient[]> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from("ingredients").select("*");
    if (error) throw new Error(`Failed to fetch ingredients: ${error.message}`);
    return (data ?? []).map(dbIngredientToIngredient);
  },
  ["all-ingredients"],
  { tags: [CACHE_TAGS.ingredients], revalidate: REVALIDATE }
);

export const getAllConcerns = unstable_cache(
  async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from("concerns").select("*");
    if (error) throw new Error(`Failed to fetch concerns: ${error.message}`);
    return data ?? [];
  },
  ["all-concerns"],
  { tags: [CACHE_TAGS.concerns], revalidate: REVALIDATE }
);

export const getConcernById = unstable_cache(
  async (id: string) => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("concerns")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },
  ["concern-by-id"],
  { tags: [CACHE_TAGS.concerns], revalidate: REVALIDATE }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbProductToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    image: row.image ?? "",
    concerns: row.concerns ?? [],
    ingredients: row.ingredients ?? [],
    popularity: row.popularity,
    purchase: row.purchase ?? {},
    tags: row.tags ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbIngredientToIngredient(row: any): Ingredient {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? { vi: "", en: "" },
    effects: row.effects ?? [],
    ewgGrade: row.ewg_grade ?? undefined,
    category: row.category,
  };
}
