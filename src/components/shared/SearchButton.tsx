"use client";

import { useState } from "react";
import SearchOverlay from "./SearchOverlay";
import type { Product } from "@/lib/types";

export default function SearchButton({ locale, products }: { locale: string; products: Product[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] text-neutral-500 transition-colors"
        aria-label="Search"
      >
        <svg
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
      </button>
      {open && <SearchOverlay locale={locale} onClose={() => setOpen(false)} products={products} />}
    </>
  );
}
