"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";

interface RoutineStepPickerProps {
  step: number;
  label: string;
  products: Product[];
  selectedIds: string[];
  locale: string;
  onToggle: (productId: string) => void;
}

export default function RoutineStepPicker({
  step,
  label,
  products,
  selectedIds,
  locale,
  onToggle,
}: RoutineStepPickerProps) {
  const loc = locale as "vi" | "en";

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          {step}
        </span>
        <h3 className="text-[17px] font-semibold text-neutral-900">{label}</h3>
        {selectedIds.length > 0 && (
          <span className="text-xs text-emerald-600 font-medium">
            {selectedIds.length} {locale === "vi" ? "đã chọn" : "selected"}
          </span>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          return (
            <button
              key={product.id}
              onClick={() => onToggle(product.id)}
              className={`flex-shrink-0 w-24 rounded-xl border-2 p-2 text-left transition-all min-h-[44px] ${
                isSelected
                  ? "border-neutral-900 bg-neutral-900"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <Image
                src={product.image}
                alt={product.name[loc] || product.name.vi}
                width={80}
                height={80}
                className="rounded-lg object-cover w-full aspect-square"
              />
              <p
                className={`text-[13px] mt-1 line-clamp-2 ${
                  isSelected ? "text-white" : "text-neutral-700"
                }`}
              >
                {product.name[loc] || product.name.vi}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
