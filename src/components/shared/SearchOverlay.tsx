"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import { getBrandName } from "@/lib/brands";

interface SearchOverlayProps {
  locale: string;
  onClose: () => void;
}

const POPULAR_KEYWORDS_VI = [
  "COSRX", "Anua", "Torriden", "Serum", "Nước hoa hồng", "Kem chống nắng",
  "Pad", "Mặt nạ", "Sữa rửa mặt", "Niacinamide",
];
const POPULAR_KEYWORDS_EN = [
  "COSRX", "Anua", "Torriden", "Serum", "Toner", "Sunscreen",
  "Pad", "Mask", "Cleanser", "Niacinamide",
];

const allProducts = (products as Product[]).sort(
  (a, b) => a.popularity.rank - b.popularity.rank
);
const trendingProducts = allProducts.slice(0, 6);

export default function SearchOverlay({ locale, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const loc = locale as "vi" | "en";

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isSearching = query.length >= 2;

  const results = isSearching
    ? (products as Product[]).filter((p) => {
        const q = query.toLowerCase();
        const name = (p.name[loc] || p.name.vi).toLowerCase();
        const brand = getBrandName(p.brand).toLowerCase();
        return name.includes(q) || brand.includes(q);
      })
    : [];

  const popularKeywords = loc === "vi" ? POPULAR_KEYWORDS_VI : POPULAR_KEYWORDS_EN;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-6 md:px-8 pt-4">
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
              className="w-full rounded-xl bg-white border border-neutral-200 pl-11 pr-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-sm font-medium text-neutral-500 hover:text-neutral-900 px-2 py-2"
          >
            {loc === "vi" ? "Đóng" : "Close"}
          </button>
        </div>

        <div className="mt-5 overflow-y-auto max-h-[calc(100vh-100px)]">
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
                      className="px-3.5 py-2 rounded-full bg-white border border-neutral-200 text-sm font-medium text-neutral-500 hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </section>

              {/* Trending products */}
              <section className="mt-8">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">
                  {loc === "vi" ? "Xu hướng" : "Trending"}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {trendingProducts.map((product, i) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.slug}`}
                      onClick={onClose}
                      className="group rounded-2xl bg-white border border-neutral-100 p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="relative aspect-square rounded-xl bg-neutral-50 overflow-hidden mb-2">
                        <span className="absolute top-1.5 left-1.5 z-10 text-xs font-medium text-neutral-500">
                          {i + 1}
                        </span>
                        <Image
                          src={product.image}
                          alt={product.name[loc] || product.name.vi}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 30vw, 200px"
                        />
                      </div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {getBrandName(product.brand)}
                      </p>
                      <p className="text-xs font-medium text-neutral-900 line-clamp-2 leading-snug mt-0.5">
                        {product.name[loc] || product.name.vi}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Search results */}
          {isSearching && results.length === 0 && (
            <p className="text-sm text-neutral-600 text-center py-10">
              {loc === "vi"
                ? "Không tìm thấy sản phẩm"
                : "No products found"}
            </p>
          )}
          {isSearching && (
            <div className="space-y-1">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/${locale}/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-lg bg-white shrink-0 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name[loc] || product.name.vi}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-500 tracking-wide uppercase">
                      {getBrandName(product.brand)}
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 truncate">
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
