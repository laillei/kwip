"use client";

import { useState } from "react";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";

interface RoutineStepRowProps {
  step: number;
  label: string;
  category: Category;
  products: Product[];
  locale: string;
  getProductReason: (product: Product) => string | undefined;
}

const DESKTOP_INITIAL = 4;

export default function RoutineStepRow({
  step,
  label,
  products,
  locale,
  getProductReason,
}: RoutineStepRowProps) {
  const [expanded, setExpanded] = useState(false);
  const loc = locale as "vi" | "en";
  const hasMore = products.length > DESKTOP_INITIAL;
  const desktopProducts = expanded ? products : products.slice(0, DESKTOP_INITIAL);

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{step}</span>
        <span className="text-[17px] font-semibold text-neutral-900">{label}</span>
      </h3>

      {/* Mobile: horizontal scroll row */}
      <div className="md:hidden -mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
          {products.map((product) => (
            <div key={product.id} className="shrink-0 w-40 snap-start">
              <ProductCard
                slug={product.slug}
                name={product.name[loc] || product.name.vi}
                brand={product.brand}
                category={product.category}
                image={product.image}
                locale={locale}
                reason={getProductReason(product)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: collapsed grid with expand */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-5">
          {desktopProducts.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name[loc] || product.name.vi}
              brand={product.brand}
              category={product.category}
              image={product.image}
              locale={locale}
              reason={getProductReason(product)}
            />
          ))}
        </div>
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            + {products.length - DESKTOP_INITIAL} more
          </button>
        )}
      </div>
    </section>
  );
}
