"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Routine } from "@/lib/types";
import { getRoutines, deleteRoutine } from "@/lib/localRoutines";
import RoutineCard from "@/components/routine/RoutineCard";

interface Dict {
  myRoutines: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  deleteButton: string;
  productsCount: string;
  backToHome: string;
}

interface Props {
  locale: string;
  dict: Dict;
}

export default function MePageClient({ locale, dict }: Props) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRoutines(getRoutines());
    setLoaded(true);
  }, []);

  function handleDelete(id: string) {
    if (!confirm(dict.deleteButton + "?")) return;
    deleteRoutine(id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-sm text-neutral-400">...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">{dict.myRoutines}</h1>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-900 font-medium mb-2">{dict.emptyTitle}</p>
            <p className="text-neutral-500 text-sm mb-6">{dict.emptyBody}</p>
            <Link
              href={`/${locale}`}
              className="text-[15px] font-medium text-neutral-900 underline min-h-[44px] inline-flex items-center"
            >
              {dict.emptyAction}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                locale={locale}
                onDelete={handleDelete}
                dict={{
                  deleteButton: dict.deleteButton,
                  productsCount: dict.productsCount,
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href={`/${locale}`}
            className="text-[15px] text-neutral-500 hover:text-neutral-900 min-h-[44px] flex items-center"
          >
            {dict.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
