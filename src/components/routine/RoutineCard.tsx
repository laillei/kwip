"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Routine } from "@/types";
import { buttonVariants } from "@/components/ui";

interface ProductPreview {
  id: string;
  image: string;
  name: string;
}

interface RoutineCardProps {
  routine: Routine;
  locale: string;
  concernLabel?: string;
  productImages: ProductPreview[];
  onDelete: (id: string) => void;
  dict: {
    deleteButton: string;
    productsCount: string;
    viewButton: string;
  };
}

export default function RoutineCard({
  routine,
  locale,
  concernLabel,
  productImages,
  onDelete,
  dict,
}: RoutineCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="py-4 border-b border-neutral-100 last:border-b-0">
      {/* Header row: name + overflow menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-semibold text-neutral-900 truncate">
            {routine.name}
          </h3>
          <p className="text-[13px] text-neutral-500 mt-0.5">
            {concernLabel ?? routine.concern} · {routine.products.length} {dict.productsCount}
          </p>
        </div>

        {/* Overflow menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-[44px] h-[44px] flex items-center justify-center text-neutral-400 -mr-2 -mt-1"
            aria-label="More options"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              {/* Scrim to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-10 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(routine.id);
                  }}
                  className="w-full text-left px-4 py-3 text-[15px] text-red-500 min-h-[44px] flex items-center"
                >
                  {dict.deleteButton}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product image strip */}
      {productImages.length > 0 && (
        <div className="flex gap-2 mt-3">
          {productImages.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0"
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="object-contain p-0.5"
                sizes="40px"
              />
            </div>
          ))}
        </div>
      )}

      {/* View button */}
      <Link
        href={`/${locale}/routine/${routine.id}`}
        className={buttonVariants({ variant: "secondary", fullWidth: true }) + " mt-3"}
      >
        {dict.viewButton}
      </Link>
    </div>
  );
}
