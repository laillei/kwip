"use client";

import { useState } from "react";
import type { Product, EditorialTag } from "@/types";
import ProductCard from "./ProductCard";
import FilterChips from "@/components/home/FilterChips";

const EDITORIAL_TAGS: EditorialTag[] = [
  "지금 뜨는",
  "숨겨진 명품",
  "성분 주목",
  "편집장 픽",
];

function assignEditorialTag(product: Product, index: number): EditorialTag {
  // Assign based on product tags if available, otherwise round-robin
  if (product.tags.includes("best-seller")) return "지금 뜨는";
  if (product.tags.includes("sensitive-safe")) return "성분 주목";
  return EDITORIAL_TAGS[index % EDITORIAL_TAGS.length];
}

interface ProductsClientProps {
  products: Product[];
  locale: string;
  dictionary: {
    products: {
      filterAll: string;
      emptyState: string;
    };
  };
}

export default function ProductsClient({
  products,
  locale,
  dictionary,
}: ProductsClientProps) {
  const [activeTag, setActiveTag] = useState<string>(
    dictionary.products.filterAll
  );

  // Pre-compute editorial tags for each product
  const productsWithTags = products.map((product, index) => ({
    product,
    editorialTag: assignEditorialTag(product, index),
  }));

  const filterTags = [
    dictionary.products.filterAll,
    ...EDITORIAL_TAGS,
  ];

  const filtered =
    activeTag === dictionary.products.filterAll
      ? productsWithTags
      : productsWithTags.filter((p) => p.editorialTag === activeTag);

  return (
    <>
      <FilterChips
        tags={filterTags}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        locale={locale}
      />
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[15px] text-on-surface-variant">
            {dictionary.products.emptyState}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 px-4 py-8">
          {filtered.map(({ product, editorialTag }) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name[locale as "ko" | "en" | "vi"] || product.name.ko}
              brand={product.brand}
              image={product.image}
              locale={locale}
              editorialTag={editorialTag}
            />
          ))}
        </div>
      )}
    </>
  );
}
