"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Routine } from "@/lib/types";
import RoutineCard from "@/components/routine/RoutineCard";

export default function MePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}`);
      return;
    }
    if (status === "authenticated") {
      fetch("/api/routines")
        .then((r) => r.json())
        .then((data) => {
          setRoutines(data);
          setLoading(false);
        });
    }
  }, [status, locale, router]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this routine?")) return;
    await fetch(`/api/routines/${id}`, { method: "DELETE" });
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-sm text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {locale === "vi" ? "Routine của tôi" : "My Routines"}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {session?.user?.name}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="text-sm text-neutral-400 hover:text-neutral-600"
          >
            Sign out
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-400 mb-4">
              {locale === "vi"
                ? "Bạn chưa có routine nào."
                : "No routines yet."}
            </p>
            <Link
              href={`/${locale}`}
              className="text-sm font-medium text-neutral-900 underline"
            >
              {locale === "vi" ? "← Trang chủ" : "← Home"}
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
