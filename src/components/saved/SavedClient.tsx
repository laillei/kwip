"use client";

import { useState, useEffect, useCallback } from "react";
import { getSavedProducts } from "@/store/localSaved";
import type { Product } from "@/types";
import type { Locale } from "@/lib/i18n";
import ProductCard from "@/components/products/ProductCard";

interface SavedClientProps {
  allProducts: Product[];
  locale: string;
  dictionary: {
    saved: {
      emptyTitle: string;
      emptyBody: string;
    };
  };
}

export default function SavedClient({
  allProducts,
  locale,
  dictionary,
}: SavedClientProps) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const refreshSaved = useCallback(() => {
    setSavedIds(getSavedProducts());
  }, []);

  useEffect(() => {
    refreshSaved();
    window.addEventListener("kwip_saved_updated", refreshSaved);
    return () => {
      window.removeEventListener("kwip_saved_updated", refreshSaved);
    };
  }, [refreshSaved]);

  const savedProducts = allProducts.filter((p) => savedIds.includes(p.id));
  const loc = locale as Locale;

  if (savedProducts.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "calc(100dvh - 56px - 49px)" }}
      >
        <div className="flex flex-col items-center gap-3 -mt-16">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-outline-variant"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          <h2
            className="text-[17px] font-semibold text-on-surface"
            style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
          >
            {dictionary.saved.emptyTitle}
          </h2>
          <p
            className="text-[15px] text-on-surface-variant"
            style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
          >
            {dictionary.saved.emptyBody}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-4 py-8">
      {savedProducts.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name[loc] || product.name.ko || product.name.en}
          brand={product.brand}
          image={product.image}
          locale={locale}
        />
      ))}
    </div>
  );
}
