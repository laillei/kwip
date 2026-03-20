import Link from "next/link";
import MobileShell from "@/components/layout/MobileShell";
import RoutineDetailClient from "./RoutineDetailClient";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getAllProducts, getAllConcerns } from "@/lib/db";
import { t } from "@/lib/getLocalizedData";
import type { Product } from "@/types";

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [dict, products, rawConcerns] = await Promise.all([
    getDictionary(locale as Locale),
    getAllProducts(),
    getAllConcerns(),
  ]);

  const concernLabels = Object.fromEntries(
    rawConcerns
      .filter((c) => c.id && c.label)
      .map((c) => [c.id, t(c.label as Record<string, string>, locale as Locale)])
  ) as Record<string, string>;

  return (
    <MobileShell
      locale={locale}
      headerLeft={
        <Link
          href={`/${locale}/me`}
          className="flex items-center gap-1 text-neutral-900 -ml-1 px-1 min-h-[44px] min-w-[44px]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-[15px] font-medium">
            {dict.routine.backToRoutines}
          </span>
        </Link>
      }
    >
      <RoutineDetailClient
        locale={locale}
        id={id}
        dict={{
          shareButton: dict.routine.shareButton,
          sharing: dict.routine.sharing,
          categories: dict.detail.categories,
          rename: dict.me.rename,
        }}
        products={products as Product[]}
        concernLabels={concernLabels}
      />
    </MobileShell>
  );
}
