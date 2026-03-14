"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { Routine } from "@/lib/types";
import { getRoutines, deleteRoutine } from "@/lib/localRoutines";
import RoutineCard from "@/components/routine/RoutineCard";

export default function MePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRoutines(getRoutines());
    setLoaded(true);
  }, []);

  function handleDelete(id: string) {
    if (!confirm(locale === "vi" ? "Xoá routine này?" : "Delete this routine?"))
      return;
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

  const emptyTitle =
    locale === "vi"
      ? "Routine của bạn sẽ được lưu tại đây."
      : "Your routines will be saved here.";
  const emptyBody =
    locale === "vi"
      ? "Bắt đầu từ trang chủ — chọn vấn đề da của bạn."
      : "Start from home — pick your skin concern.";
  const emptyAction = locale === "vi" ? "← Trang chủ" : "← Home";
  const heading = locale === "vi" ? "Routine của tôi" : "My Routines";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">{heading}</h1>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-900 font-medium mb-2">{emptyTitle}</p>
            <p className="text-neutral-500 text-sm mb-6">{emptyBody}</p>
            <Link
              href={`/${locale}`}
              className="text-sm font-medium text-neutral-900 underline"
            >
              {emptyAction}
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
                  deleteButton: locale === "vi" ? "Xoá" : "Delete",
                  productsCount: locale === "vi" ? "sản phẩm" : "products",
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href={`/${locale}`}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            {locale === "vi" ? "← Trang chủ" : "← Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
