"use client";

import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

interface ProductListItemProps {
  slug: string;
  name: string;
  brand: string;
  category: Category;
  image: string | null;
  locale: string;
  reason?: string;
  saved?: boolean;
  onBookmark?: (e: React.MouseEvent) => void;
}

export default function ProductListItem({
  slug,
  name,
  brand,
  category,
  image,
  locale,
  reason,
  saved,
  onBookmark,
}: ProductListItemProps) {
  return (
    <Link
      href={`/${locale}/products/${slug}`}
      className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 min-h-[80px] active:scale-[0.99] transition-transform"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div className="shrink-0 w-[72px] h-[72px] rounded-xl bg-neutral-50 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={`${brand} ${name}`}
            width={72}
            height={72}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-50" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 mb-0.5">{brand}</p>
        <p className="text-[15px] font-semibold text-neutral-900 leading-tight line-clamp-2">{name}</p>
        {reason && (
          <p className="text-xs text-emerald-600 mt-1 line-clamp-1">{reason}</p>
        )}
      </div>
      {onBookmark && (
        <button
          type="button"
          onClick={onBookmark}
          className="shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] text-neutral-400 hover:text-neutral-900 transition-colors"
          aria-label={saved ? "Remove bookmark" : "Save product"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
      )}
      <svg
        className="shrink-0 text-neutral-400"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
