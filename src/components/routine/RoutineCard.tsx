"use client";

import Link from "next/link";
import type { Routine } from "@/lib/types";

interface RoutineCardProps {
  routine: Routine;
  locale: string;
  onDelete: (id: string) => void;
  dict: {
    deleteButton: string;
    productsCount: string;
  };
}

export default function RoutineCard({
  routine,
  locale,
  onDelete,
  dict,
}: RoutineCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-3">
      <div>
        <h3 className="text-base font-semibold text-neutral-900">
          {routine.name}
        </h3>
        <p className="text-sm text-neutral-500 mt-0.5">
          {routine.concern} · {routine.products.length} {dict.productsCount}
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/${locale}/routine/${routine.id}`}
          className="flex-1 text-center py-2 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(routine.id)}
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
        >
          {dict.deleteButton}
        </button>
      </div>
    </div>
  );
}
