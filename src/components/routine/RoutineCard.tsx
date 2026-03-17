"use client";

import Link from "next/link";
import type { Routine } from "@/lib/types";
import { Card, buttonVariants } from "@/components/ui";

interface RoutineCardProps {
  routine: Routine;
  locale: string;
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
  onDelete,
  dict,
}: RoutineCardProps) {
  return (
    <Card padding="md" className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-neutral-900">
          {routine.name}
        </h3>
        <p className="text-[15px] text-neutral-500 mt-0.5">
          {routine.concern} · {routine.products.length} {dict.productsCount}
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/${locale}/routine/${routine.id}`}
          className={buttonVariants({ variant: "secondary", fullWidth: true })}
        >
          {dict.viewButton}
        </Link>
        <button
          onClick={() => onDelete(routine.id)}
          className="px-4 py-2 text-[15px] font-medium text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-colors min-h-[44px] flex items-center justify-center"
        >
          {dict.deleteButton}
        </button>
      </div>
    </Card>
  );
}
