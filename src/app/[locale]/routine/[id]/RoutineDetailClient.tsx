"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRoutineById } from "@/lib/localRoutines";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import type { Routine, RoutineProduct } from "@/lib/types";
import ShareButton from "@/components/routine/ShareButton";

interface Dict {
  shareButton: string;
  sharing: string;
  shareCardTagline: string;
}

interface Props {
  locale: string;
  id: string;
  dict: Dict;
}

export default function RoutineDetailClient({ locale, id, dict }: Props) {
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-sm text-neutral-400">...</div>
      </div>
    );
  }

  const allProducts = products as Product[];
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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          {routine.name}
        </h1>
        <p className="text-[15px] text-neutral-500 mb-6">{routine.concern}</p>

        <div className="flex gap-2 mb-8">
          <ShareButton routine={routine} dict={shareDict} />
        </div>

        <div className="space-y-6">
          {routineProducts.map((rp) => (
            <div key={rp.productId} className="flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-400 w-5 text-center">
                {rp.step}
              </span>
              <Image
                src={rp.product.image}
                alt={rp.product.name[loc] ?? rp.product.name.vi}
                width={56}
                height={56}
                className="rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-neutral-900 truncate">
                  {rp.product.name[loc] ?? rp.product.name.vi}
                </p>
                <p className="text-[13px] text-neutral-500">{rp.product.brand}</p>
              </div>
              <Link
                href={`/${locale}/products/${rp.product.slug}`}
                className="text-[13px] text-neutral-400 hover:text-neutral-900 flex-shrink-0 min-h-[44px] w-[44px] flex items-center justify-center"
              >
                →
              </Link>
            </div>
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
