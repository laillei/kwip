"use client";

import Link from "next/link";
import type { Routine } from "@/lib/types";
import { Card, Button, buttonVariants } from "@/components/ui";

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
        <Button
          variant="destructive"
          fullWidth
          onClick={() => onDelete(routine.id)}
        >
          {dict.deleteButton}
        </Button>
      </div>
    </Card>
  );
}
