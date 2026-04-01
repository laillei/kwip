"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Routine, Product } from "@/types";
import { getRoutines, deleteRoutine, renameRoutine } from "@/store/localRoutines";
import { buttonVariants } from "@/components/ui";
import { getSavedProducts, unsaveProduct } from "@/store/localSaved";
import RoutineCard from "@/components/routine/RoutineCard";
import { getBrandName } from "@/lib/brands";

interface Dict {
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  viewButton: string;
  deleteButton: string;
  productsCount: string;
  buildRoutine: string;
  noRoutinesBody: string;
  rename: string;
  tabProducts: string;
  tabRoutines: string;
  noSavedProducts: string;
  noRoutinesTitle: string;
}

interface Props {
  locale: string;
  products: Product[];
  concernLabels: Record<string, string>;
  dict: Dict;
}

type Tab = "products" | "routines";

export default function MePageClient({ locale, products, concernLabels, dict }: Props) {
  const searchParams = useSearchParams();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    const ids = getSavedProducts();
    const routineList = getRoutines();
    setSavedProductIds(ids);
    setRoutines(routineList);

    // Switch to routines tab if ?tab=routines
    const paramTab = searchParams.get("tab");
    if (paramTab === "routines") {
      setTab("routines");
    } else {
      setTab("products");
    }

    setLoaded(true);

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

  function handleUnsave(productId: string) {
    unsaveProduct(productId);
    setSavedProductIds((prev) => prev.filter((id) => id !== productId));
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[17px] text-neutral-400">...</div>
      </div>
    );
  }

  const loc = locale as "vi" | "en";
  const productMap = new Map(products.map((p) => [p.id, p]));
  const savedProducts = savedProductIds
    .map((id) => productMap.get(id))
    .filter((p): p is Product => p !== undefined);

  function getRoutineProductImages(routine: Routine) {
    return routine.products
      .map((rp) => {
        const p = productMap.get(rp.productId);
        if (!p) return null;
        return { id: p.id, image: p.image, name: p.name[loc] || p.name.vi };
      })
      .filter((x): x is { id: string; image: string; name: string } => x !== null);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Underline tab bar */}
      <div className="flex border-b border-neutral-100">
        {(["products", "routines"] as Tab[]).map((t) => {
          const label = t === "products" ? dict.tabProducts : dict.tabRoutines;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 h-11 text-[13px] transition-colors border-b-2 -mb-px flex items-center justify-center ${
                active
                  ? "font-semibold text-neutral-900 border-neutral-900"
                  : "font-normal text-neutral-400 border-transparent"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Products tab */}
      {tab === "products" && (
        <>
          {savedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-8 text-center"
              style={{ minHeight: "calc(100dvh - 56px - 49px - 44px)" }}
            >
              <div className="-mt-16">
                <p className="text-[17px] font-semibold text-neutral-900 mb-1">{dict.noSavedProducts}</p>
                <p className="text-[15px] text-neutral-500 mb-6">{dict.emptyBody}</p>
                <Link
                  href={`/${locale}`}
                  className={buttonVariants({ variant: "primary", size: "lg" })}
                >
                  {dict.emptyAction}
                </Link>
              </div>
            </div>
          ) : (
            <ul>
              {savedProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-3 px-4 py-3 min-h-[64px] border-b border-neutral-100 last:border-b-0"
                >
                  {/* Product image */}
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name[loc] || product.name.vi}
                      fill
                      className="object-contain p-0.5"
                      sizes="40px"
                    />
                  </div>

                  {/* Name + brand */}
                  <Link
                    href={`/${locale}/products/${product.slug}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-[15px] font-semibold text-neutral-900 truncate">
                      {product.name[loc] || product.name.vi}
                    </p>
                    <p className="text-[13px] text-neutral-400">{getBrandName(product.brand)}</p>
                  </Link>

                  {/* Filled bookmark — tap to unsave */}
                  <button
                    onClick={() => handleUnsave(product.id)}
                    className="flex items-center justify-center w-[44px] h-[44px] text-neutral-900 shrink-0"
                    aria-label="Remove from saved"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Routines tab */}
      {tab === "routines" && (
        <>
          {routines.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-8 text-center"
              style={{ minHeight: "calc(100dvh - 56px - 49px - 44px)" }}
            >
              <div className="-mt-16">
                <p className="text-[17px] font-semibold text-neutral-900 mb-1">{dict.noRoutinesTitle}</p>
                <p className="text-[15px] text-neutral-400 mb-6">{dict.noRoutinesBody}</p>
                {savedProducts.length > 0 && (
                  <Link
                    href={`/${locale}/routine/new?saved=${savedProductIds.join(",")}`}
                    className="flex items-center justify-center h-[48px] px-6 rounded-2xl bg-neutral-900 text-white text-[15px] font-semibold"
                  >
                    {dict.buildRoutine}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {routines.map((routine) => (
                <div key={routine.id} className="px-4">
                  <RoutineCard
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
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
