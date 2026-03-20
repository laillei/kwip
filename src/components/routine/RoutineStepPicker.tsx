"use client";

import Image from "next/image";
import type { Product } from "@/types";
import { getBrandName } from "@/lib/brands";

interface RoutineStepPickerProps {
  step: number;
  label: string;
  products: Product[];
  selectedIds: string[];
  locale: string;
  selectedCountLabel: string;
  onToggle: (productId: string) => void;
}

export default function RoutineStepPicker({
  step,
  label,
  products,
  selectedIds,
  locale,
  selectedCountLabel,
  onToggle,
}: RoutineStepPickerProps) {
  const loc = locale as "vi" | "en";

  return (
    <div>
      {/* Step header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider w-4">
          {step}
        </span>
        <h3 className="text-[13px] font-semibold text-neutral-900 uppercase tracking-wide">{label}</h3>
        {selectedIds.length > 0 && (
          <span className="ml-auto text-xs text-emerald-600 font-medium">
            {selectedIds.length} {selectedCountLabel}
          </span>
        )}
      </div>

      {/* Product rows */}
      <div className="divide-y divide-neutral-100">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onToggle(product.id)}
              className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left transition-colors active:bg-neutral-50"
            >
              <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                <Image
                  src={product.image}
                  alt={product.name[loc] || product.name.vi}
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-neutral-900 line-clamp-2 leading-snug">
                  {product.name[loc] || product.name.vi}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {getBrandName(product.brand)}
                </p>
              </div>
              {/* Checkmark */}
              <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? "border-neutral-900 bg-neutral-900"
                  : "border-neutral-200"
              }`}>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
