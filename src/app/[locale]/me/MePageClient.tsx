"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Routine, Product } from "@/types";
import { getRoutines, deleteRoutine, renameRoutine } from "@/store/localRoutines";
import { getSavedProducts } from "@/store/localSaved";
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
  pageLabel: string;
  buildRoutine: string;
  noRoutinesTitle: string;
  noRoutinesBody: string;
  tabSaved: string;
  tabRoutines: string;
  rename: string;
  renameCancel: string;
}

interface Props {
  locale: string;
  products: Product[];
  concernLabels: Record<string, string>;
  dict: Dict;
}

export default function MePageClient({ locale, products, concernLabels, dict }: Props) {
  const searchParams = useSearchParams();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"saved" | "routines">("saved");

  useEffect(() => {
    const routineList = getRoutines();
    const saved = getSavedProducts();
    setRoutines(routineList);
    setSavedProductIds(saved);
    setLoaded(true);

    if (searchParams.get("tab") === "routines") {
      setTab("routines");
    } else if (saved.length === 0 && routineList.length > 0) {
      setTab("routines");
    }

    const update = () => setSavedProductIds(getSavedProducts());
    window.addEventListener("kwip_saved_updated", update);
    return () => window.removeEventListener("kwip_saved_updated", update);
  }, [searchParams]);

  function handleDelete(id: string) {
    deleteRoutine(id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }

  function handleRename(id: string, name: string) {
    renameRoutine(id, name);
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
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
  const productMap = new Map(products.map((p) => [p.id, p]));

  function getRoutineProductImages(routine: Routine) {
    return routine.products
      .map((rp) => {
        const p = productMap.get(rp.productId);
        if (!p) return null;
        return { id: p.id, image: p.image, name: p.name[loc] || p.name.vi };
      })
      .filter((x): x is { id: string; image: string; name: string } => x !== null);
  }

  if (routines.length === 0 && savedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 pt-4 pb-8">

        {/* Segmented control */}
        <div className="flex bg-neutral-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("saved")}
            className={`flex-1 rounded-lg text-[15px] font-semibold py-2 transition-all min-h-[44px] ${
              tab === "saved"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            {dict.tabSaved}
            {savedProducts.length > 0 && (
              <span className="ml-1.5 text-[13px] font-normal text-neutral-400">
                {savedProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("routines")}
            className={`flex-1 rounded-lg text-[15px] font-semibold py-2 transition-all min-h-[44px] ${
              tab === "routines"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            {dict.tabRoutines}
            {routines.length > 0 && (
              <span className="ml-1.5 text-[13px] font-normal text-neutral-400">
                {routines.length}
              </span>
            )}
          </button>
        </div>

        {/* Saved tab */}
        {tab === "saved" && (
          <div>
            {savedProducts.length === 0 ? (
              <p className="text-[15px] text-neutral-400 text-center py-8">
                {dict.noSavedProducts}
              </p>
            ) : (
              <>
                <div className="divide-y divide-neutral-100">
                  {savedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.slug}`}
                      className="flex items-center gap-3 py-3 min-h-[44px] active:bg-neutral-50 transition-colors"
                    >
                      <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                        <Image
                          src={product.image}
                          alt={product.name[loc] || product.name.vi}
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-neutral-900 line-clamp-1">
                          {product.name[loc] || product.name.vi}
                        </p>
                        <p className="text-[13px] text-neutral-400 mt-0.5">
                          {getBrandName(product.brand)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/${locale}/routine/new?saved=${savedProductIds.join(",")}`}
                  className="mt-4 flex items-center justify-center w-full h-[52px] rounded-2xl bg-neutral-900 text-white text-[17px] font-semibold"
                >
                  {dict.buildRoutine}
                </Link>
              </>
            )}
          </div>
        )}

        {/* Routines tab */}
        {tab === "routines" && (
          <div>
            {routines.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[15px] text-neutral-500">{dict.noRoutinesTitle}</p>
                <p className="text-[13px] text-neutral-400 mt-1">{dict.noRoutinesBody}</p>
              </div>
            ) : (
              <div>
                {routines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    locale={locale}
                    concernLabel={concernLabels[routine.concern]}
                    productImages={getRoutineProductImages(routine)}
                    onDelete={handleDelete}
                    onRename={handleRename}
                    dict={{
                      viewButton: dict.viewButton,
                      deleteButton: dict.deleteButton,
                      productsCount: dict.productsCount,
                      rename: dict.rename,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
