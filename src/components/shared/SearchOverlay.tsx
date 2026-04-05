"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { getBrandName } from "@/lib/brands";

interface SearchOverlayProps {
  locale: string;
  onClose: () => void;
  products: Product[];
}

const POPULAR_KEYWORDS_VI = [
  "COSRX", "Anua", "Torriden", "Serum", "Nước hoa hồng", "Kem chống nắng",
  "Pad", "Mặt nạ", "Sữa rửa mặt", "Niacinamide",
];
const POPULAR_KEYWORDS_EN = [
  "COSRX", "Anua", "Torriden", "Serum", "Toner", "Sunscreen",
  "Pad", "Mask", "Cleanser", "Niacinamide",
];

export default function SearchOverlay({ locale, onClose, products }: SearchOverlayProps) {
  const allProducts = [...products].sort(
    (a, b) => a.popularity.rank - b.popularity.rank
  );
  const trendingProducts = allProducts.slice(0, 6);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const loc = locale as "vi" | "en";

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("kwip_search_open"));
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("kwip_search_close"));
    };
  }, []);

  const isSearching = query.length >= 2;

  const results = isSearching
    ? products.filter((p) => {
        const q = query.toLowerCase();
        const name = (p.name[loc] || p.name.vi).toLowerCase();
        const brand = getBrandName(p.brand).toLowerCase();
        return name.includes(q) || brand.includes(q);
      })
    : [];

  const popularKeywords = loc === "vi" ? POPULAR_KEYWORDS_VI : POPULAR_KEYWORDS_EN;

  return (
    /* z-[60] covers header (z-50) and bottom tab bar (z-50) */
    <div className="fixed inset-0 z-[60] bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-4">
        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                loc === "vi"
                  ? "Tìm sản phẩm hoặc thương hiệu..."
                  : "Search products or brands..."
              }
              className="w-full rounded-none bg-neutral-100 pl-11 pr-4 py-3 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-900/10 transition-colors"
            />
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-[15px] font-medium text-neutral-500 hover:text-neutral-900 min-h-[44px] px-2 flex items-center"
          >
            {loc === "vi" ? "Đóng" : "Close"}
          </button>
        </div>

        <div className="mt-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Default state: popular keywords + trending */}
          {!isSearching && (
            <>
              {/* Popular search chips */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">
                  {loc === "vi" ? "Tìm kiếm phổ biến" : "Popular Searches"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularKeywords.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setQuery(keyword)}
                      className="px-3.5 py-2 rounded-full bg-neutral-100 text-[13px] font-medium text-neutral-600 hover:bg-neutral-200 active:bg-neutral-200 transition-colors"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </section>

              {/* Trending products — flat list rows */}
              <section className="mt-8">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                  {loc === "vi" ? "Xu hướng" : "Trending"}
                </h3>
                <div className="divide-y divide-neutral-100">
                  {trendingProducts.map((product, i) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 py-3 min-h-[44px] active:bg-neutral-50 transition-colors"
                    >
                      <span className="text-[13px] font-semibold text-neutral-300 w-4 text-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="relative w-12 h-12 shrink-0 rounded-none overflow-hidden bg-neutral-100">
                        <Image
                          src={product.image}
                          alt={product.name[loc] || product.name.vi}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-neutral-400 uppercase tracking-wide">
                          {getBrandName(product.brand)}
                        </p>
                        <p className="text-[13px] font-semibold text-neutral-900 line-clamp-2 leading-snug mt-0.5">
                          {product.name[loc] || product.name.vi}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Search results */}
          {isSearching && results.length === 0 && (
            <p className="text-[15px] text-neutral-400 text-center py-10">
              {loc === "vi"
                ? "Không tìm thấy sản phẩm"
                : "No products found"}
            </p>
          )}
          {isSearching && results.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/${locale}/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 py-3 min-h-[44px] active:bg-neutral-50 transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-none bg-neutral-100 shrink-0 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name[loc] || product.name.vi}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-400 uppercase tracking-wide">
                      {getBrandName(product.brand)}
                    </p>
                    <p className="text-[13px] font-semibold text-neutral-900 line-clamp-2 leading-snug mt-0.5">
                      {product.name[loc] || product.name.vi}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
