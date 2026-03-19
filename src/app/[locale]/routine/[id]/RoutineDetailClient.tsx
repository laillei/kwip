"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRoutineById } from "@/lib/localRoutines";
import type { Product } from "@/lib/types";
import type { Routine, RoutineProduct } from "@/lib/types";
import ShareButton from "@/components/routine/ShareButton";
import { getBrandName } from "@/lib/brands";
import type { Brand } from "@/lib/types";

interface Dict {
  shareButton: string;
  sharing: string;
  shareCardTagline: string;
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
  const loc = locale as "vi" | "en";

  useEffect(() => {
    const found = getRoutineById(id);
    if (!found) {
      router.replace(`/${locale}/me`);
      return;
    }
    setRoutine(found);
    setLoaded(true);
  }, [id, locale, router]);

  if (!loaded || !routine) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[13px] text-neutral-400">...</div>
      </div>
    );
  }

  const allProducts = products;
  const routineProducts = (routine.products as RoutineProduct[])
    .sort((a, b) => a.step - b.step)
    .map((rp) => ({
      ...rp,
      product: allProducts.find((p) => p.id === rp.productId),
    }))
    .filter((rp): rp is typeof rp & { product: Product } => !!rp.product);

  const shareDict = {
    shareButton: dict.shareButton,
    sharing: dict.sharing,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-[22px] font-bold text-neutral-900 mb-1">
          {routine.name}
        </h1>
        <p className="text-[15px] text-neutral-500 mb-6">{concernLabels[routine.concern] ?? routine.concern}</p>

        <div className="flex gap-2 mb-8">
          <ShareButton routine={routine} dict={shareDict} />
        </div>

        <div className="divide-y divide-neutral-100">
          {routineProducts.map((rp) => (
            <Link
              key={rp.productId}
              href={`/${locale}/products/${rp.product.slug}`}
              className="flex items-center gap-3 py-3 min-h-[44px] active:bg-neutral-50 transition-colors"
            >
              <span className="text-[13px] font-semibold text-neutral-400 w-5 text-center shrink-0">
                {rp.step}
              </span>
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
                <p className="text-[13px] font-semibold text-neutral-900 line-clamp-2 leading-snug">
                  {rp.product.name[loc] ?? rp.product.name.vi}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {getBrandName(rp.product.brand as Brand)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-neutral-400 text-center mt-12">
          {dict.shareCardTagline}
        </p>
        <p className="text-xs text-neutral-400 text-center mt-1 font-medium">
          kwip.app
        </p>
      </div>
    </div>
  );
}
