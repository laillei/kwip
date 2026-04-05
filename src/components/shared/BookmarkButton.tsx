// src/components/shared/BookmarkButton.tsx
"use client";

import { useState, useEffect } from "react";
import { isProductSaved, saveProduct, unsaveProduct } from "@/store/localSaved";

interface BookmarkButtonProps {
  productId: string;
}

export default function BookmarkButton({ productId }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isProductSaved(productId));
  }, [productId]);

  function handleToggle() {
    if (saved) {
      unsaveProduct(productId);
      setSaved(false);
    } else {
      saveProduct(productId);
      setSaved(true);
      window.dispatchEvent(new Event("kwip_product_saved"));
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center justify-center min-w-[44px] min-h-[44px] text-on-surface transition-colors"
      aria-label={saved ? "Bỏ lưu" : "Lưu sản phẩm"}
    >
      <svg
        width="22"
        height="22"
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
  );
}
