"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRoutineById, renameRoutine } from "@/store/localRoutines";
import type { Product } from "@/types";
import type { Routine, RoutineProduct } from "@/types";
import ShareButton from "@/components/routine/ShareButton";
import { getBrandName } from "@/lib/brands";
import type { Brand } from "@/types";

interface Dict {
  shareButton: string;
  sharing: string;
  categories: Record<string, string>;
  rename: string;
}

interface Props {
  locale: string;
  id: string;
  dict: Dict;
  products: Product[];
  concernLabels: Record<string, string>;
}

export default function RoutineDetailClient({ locale, id, dict, products, concernLabels }: Props) {
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const loc = locale as "vi" | "en";

  useEffect(() => {
    const found = getRoutineById(id);
    if (!found) {
      router.replace(`/${locale}/me`);
      return;
    }
    setRoutine(found);
    setDraftName(found.name);
    setLoaded(true);
  }, [id, locale, router]);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  function commitRename() {
    if (!routine) return;
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== routine.name) {
      renameRoutine(routine.id, trimmed);
      setRoutine((prev) => prev ? { ...prev, name: trimmed } : prev);
    } else {
      setDraftName(routine.name);
    }
    setRenaming(false);
  }

  if (!loaded || !routine) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[13px] text-neutral-400">...</div>
      </div>
    );
  }

  const routineProducts = (routine.products as RoutineProduct[])
    .sort((a, b) => a.step - b.step)
    .map((rp) => ({
      ...rp,
      product: products.find((p) => p.id === rp.productId),
    }))
    .filter((rp): rp is typeof rp & { product: Product } => !!rp.product);

  const shareDict = {
    shareButton: dict.shareButton,
    sharing: dict.sharing,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-6">

        {/* Routine name — tappable to rename */}
        <div className="mb-1">
          {renaming ? (
            <input
              ref={inputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  if (routine) setDraftName(routine.name);
                  setRenaming(false);
                }
              }}
              className="w-full text-[22px] font-bold text-neutral-900 bg-transparent border-b-2 border-neutral-900 outline-none pb-0.5"
              maxLength={60}
            />
          ) : (
            <button
              onClick={() => { setDraftName(routine.name); setRenaming(true); }}
              className="text-[22px] font-bold text-neutral-900 text-left w-full"
            >
              {routine.name}
            </button>
          )}
        </div>
        <p className="text-[15px] text-neutral-500 mb-5">
          {concernLabels[routine.concern] ?? routine.concern}
        </p>

        <div className="mb-6">
          <ShareButton routine={routine} dict={shareDict} />
        </div>

        {/* Product list with category overlines */}
        <div>
          {routineProducts.map((rp, i) => {
            const showCategory = i === 0 || routineProducts[i - 1].category !== rp.category;
            return (
            <div key={rp.productId}>
              {showCategory && (
                <p className={`text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1 ${i === 0 ? "" : "mt-4"}`}>
                  {dict.categories[rp.category] ?? rp.category}
                </p>
              )}
              <Link
                href={`/${locale}/products/${rp.product.slug}`}
                className="flex items-center gap-3 py-2 min-h-[44px] active:bg-neutral-50 transition-colors rounded-lg"
              >
                <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                  <Image
                    src={rp.product.image}
                    alt={rp.product.name[loc] ?? rp.product.name.vi}
                    fill
                    className="object-contain p-1"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-neutral-900 line-clamp-2 leading-snug">
                    {rp.product.name[loc] ?? rp.product.name.vi}
                  </p>
                  <p className="text-[13px] text-neutral-400 mt-0.5">
                    {getBrandName(rp.product.brand as Brand)}
                  </p>
                </div>
              </Link>
            </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
