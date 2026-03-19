"use client";

import Link from "next/link";
import type { Routine } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui";

interface RoutineCardProps {
  routine: Routine;
  locale: string;
  concernLabel?: string;
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
  onDelete,
  dict,
}: RoutineCardProps) {
  return (
    <div className="py-4 border-b border-neutral-100 last:border-b-0">
      <h3 className="text-[17px] font-semibold text-neutral-900">
        {routine.name}
      </h3>
      <p className="text-[13px] text-neutral-500 mt-0.5">
        {concernLabel ?? routine.concern} · {routine.products.length} {dict.productsCount}
      </p>
      <div className="flex gap-2 mt-3">
        <Link
          href={`/${locale}/routine/${routine.id}`}
          className={buttonVariants({ variant: "secondary", fullWidth: true })}
        >
          {dict.viewButton}
        </Link>
        <Button
          variant="destructive"
          fullWidth
          onClick={() => onDelete(routine.id)}
        >
          {dict.deleteButton}
        </Button>
      </div>
    </div>
  );
}
