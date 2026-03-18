"use client";

import { useEffect, useState } from "react";
import type { Routine } from "@/lib/types";
import { getRoutines, deleteRoutine } from "@/lib/localRoutines";
import RoutineCard from "@/components/routine/RoutineCard";
import { EmptyState } from "@/components/ui";

interface Dict {
  myRoutines: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  viewButton: string;
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
        <div className="text-[17px] text-neutral-400">...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
        <h1 className="text-[22px] font-bold text-neutral-900 mb-6">{dict.myRoutines}</h1>

        {routines.length === 0 ? (
          <EmptyState
            icon="🌿"
            title={dict.emptyTitle}
            body={dict.emptyBody}
            actionLabel={dict.emptyAction}
            actionHref={`/${locale}`}
          />
        ) : (
          <div className="space-y-4">
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                locale={locale}
                onDelete={handleDelete}
                dict={{
                  viewButton: dict.viewButton,
                  deleteButton: dict.deleteButton,
                  productsCount: dict.productsCount,
                }}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
