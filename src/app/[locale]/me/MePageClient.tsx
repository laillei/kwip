"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Routine, Product } from "@/lib/types";
import { getRoutines, deleteRoutine } from "@/lib/localRoutines";
import { getSavedProducts } from "@/lib/localSaved";
import Image from "next/image";
import RoutineCard from "@/components/routine/RoutineCard";
import { EmptyState } from "@/components/ui";
import { getBrandName } from "@/lib/brands";

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
      <div className="min-h-screen bg-white flex items-center justify-center">
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
        <div className="divide-y divide-neutral-100">
          {savedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/${locale}/products/${product.slug}`}
              className="flex items-center gap-3 py-3 min-h-[44px] active:bg-neutral-50 transition-colors"
            >
              <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-white">
                <Image
                  src={product.image}
                  alt={product.name[loc] || product.name.vi}
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-neutral-900 line-clamp-2 leading-snug">
                  {product.name[loc] || product.name.vi}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {getBrandName(product.brand)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {routines.length === 0 && savedProducts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: "calc(100dvh - 56px - 49px)" }}>
          <div className="-mt-16">
            <EmptyState
              icon="🌿"
              title={dict.emptyTitle}
              body={dict.emptyBody}
              actionLabel={dict.emptyAction}
              actionHref={`/${locale}`}
            />
          </div>
        </div>
      ) : routines.length === 0 ? (
        <div className="max-w-2xl mx-auto w-full px-4 pt-4 pb-8">
          {savedSection}
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
