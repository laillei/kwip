"use client";

import { useState, useRef, useCallback } from "react";
import type { Product, Category } from "@/types";
import ProductCard from "./ProductCard";

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = scrollLeft.current - (x - startX.current);
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (ref.current) ref.current.style.cursor = "grab";
  }, []);

  return { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp };
}

const CATEGORY_TABS = [
  { id: "all", label: "전체" },
  { id: "cleanser", label: "클렌저" },
  { id: "toner", label: "토너" },
  { id: "essence", label: "에센스" },
  { id: "serum", label: "세럼" },
  { id: "cream", label: "크림" },
  { id: "sunscreen", label: "선크림" },
  { id: "mask", label: "마스크" },
  { id: "pad", label: "패드" },
  { id: "ampoule", label: "앰플" },
];

const SERUM_GROUP = new Set<Category>(["serum", "essence", "ampoule"]);

interface ProductsClientProps {
  products: Product[];
  locale: string;
  dictionary: {
    products: {
      filterAll: string;
      emptyState: string;
    };
  };
  ingredientNames?: Record<string, string>;
}

export default function ProductsClient({
  products,
  locale,
  dictionary,
  ingredientNames = {},
}: ProductsClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [open, setOpen] = useState(false);
  const dragScroll = useDragScroll();

  function handleCategorySelect(id: string) {
    setActiveCategory(id);
    setOpen(false);
  }

  const filtered =
    activeCategory === "all"
      ? products
      : activeCategory === "serum"
        ? products.filter((p) => SERUM_GROUP.has(p.category))
        : products.filter((p) => p.category === activeCategory);

  const chevronIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-[#A3A3A3] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  return (
    <>
      {/* Product category tabs with chevron */}
      <div className="relative border-b border-outline bg-white sticky top-14 z-40">
        <div
          ref={dragScroll.ref}
          onMouseDown={dragScroll.onMouseDown}
          onMouseMove={dragScroll.onMouseMove}
          onMouseUp={dragScroll.onMouseUp}
          onMouseLeave={dragScroll.onMouseLeave}
          className="flex overflow-x-scroll no-scrollbar pr-11 cursor-grab select-none"
        >
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`shrink-0 px-4 h-11 text-[13px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  active
                    ? "font-semibold text-black border-black"
                    : "font-normal text-[#A3A3A3] border-transparent"
                }`}
                style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {/* Chevron overlay */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="모든 카테고리 보기"
          className="absolute right-0 top-0 flex items-center justify-center w-11 h-11 bg-white border-b-2 border-transparent z-10"
        >
          {chevronIcon}
        </button>

        {/* Grid overlay */}
        {open && (
          <div className="absolute top-0 left-0 right-0 z-[48] bg-white border-b border-outline px-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="닫기"
              className="absolute top-0 right-0 flex items-center justify-center w-11 h-11"
            >
              {chevronIcon}
            </button>
            <div className="grid grid-cols-2 py-2">
              {CATEGORY_TABS.map((tab, i) => {
                const active = activeCategory === tab.id;
                const isLastOdd = i === CATEGORY_TABS.length - 1 && CATEGORY_TABS.length % 2 !== 0;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleCategorySelect(tab.id)}
                    className={`text-left py-3 text-[13px] transition-colors min-h-[44px] flex items-center ${
                      isLastOdd ? "col-span-2" : ""
                    } ${
                      active
                        ? "font-semibold text-black"
                        : "font-normal text-[#777]"
                    }`}
                    style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Scrim */}
      {open && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[375px] z-[37] bg-black/40"
          style={{ top: "calc(56px + 44px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[15px] text-on-surface-variant">
            {dictionary.products.emptyState}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-4 py-8">
          {filtered.map((product) => {
            const keyIngredientNames = product.ingredients
              .filter((i) => i.isKey)
              .slice(0, 3)
              .map((i) => i.ingredientId);

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name[locale as "ko" | "en" | "vi"] || product.name.ko}
                brand={product.brand}
                image={product.image}
                locale={locale}
                ingredientChips={keyIngredientNames.map((id) => ingredientNames[id] || id)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
