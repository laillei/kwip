"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Routine, Product } from "@/lib/types";
import { getRoutines, deleteRoutine } from "@/lib/localRoutines";
import { getSavedProducts } from "@/lib/localSaved";
import RoutineCard from "@/components/routine/RoutineCard";
import { EmptyState } from "@/components/ui";
import ProductListItem from "@/components/home/ProductListItem";

interface Dict {
  myRoutines: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  viewButton: string;
  deleteButton: string;
  productsCount: string;
  backToHome: string;
  savedProducts: string;
  createRoutineFromSaved: string;
  noSavedProducts: string;
}

interface Props {
  locale: string;
  products: Product[];
  dict: Dict;
}

export default function MePageClient({ locale, products, dict }: Props) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRoutines(getRoutines());
    setSavedProductIds(getSavedProducts());
    setLoaded(true);

    const update = () => setSavedProductIds(getSavedProducts());
    window.addEventListener("kwip_saved_updated", update);
    return () => window.removeEventListener("kwip_saved_updated", update);
  }, []);

  function handleDelete(id: string) {
    if (!confirm(dict.deleteButton + "?")) return;
    deleteRoutine(id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-[17px] text-neutral-400">...</div>
      </div>
    );
  }

  const loc = locale as "vi" | "en";
  const savedProducts = products.filter((p) => savedProductIds.includes(p.id));

  const savedSection =
    savedProducts.length > 0 ? (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-semibold text-neutral-900">
            {dict.savedProducts} ({savedProducts.length})
          </h2>
          <Link
            href={`/${locale}/routine/new`}
            className="text-[13px] font-medium text-neutral-500"
          >
            {dict.createRoutineFromSaved}
          </Link>
        </div>
        <div className="space-y-3">
          {savedProducts.map((product) => (
            <ProductListItem
              key={product.id}
              slug={product.slug}
              name={product.name[loc] || product.name.vi}
              brand={product.brand}
              category={product.category}
              image={product.image}
              locale={locale}
            />
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {routines.length === 0 ? (
        <div className="max-w-2xl mx-auto w-full px-4 pt-4 pb-8 flex flex-col flex-1">
          {savedSection}
          {savedProducts.length === 0 && (
            <div className="flex-1 flex items-center justify-center pb-0 pt-16">
              <EmptyState
                icon="🌿"
                title={dict.emptyTitle}
                body={dict.emptyBody}
                actionLabel={dict.emptyAction}
                actionHref={`/${locale}`}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto w-full px-4 pt-4 pb-8">
          <h1 className="text-[22px] font-bold text-neutral-900 mb-6">{dict.myRoutines}</h1>
          {savedSection}
          <div className="space-y-4">
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                locale={locale}
                onDelete={handleDelete}
                dict={{
                  viewButton: dict.viewButton,
                  deleteButton: dict.deleteButton,
                  productsCount: dict.productsCount,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
