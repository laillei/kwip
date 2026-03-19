import Link from "next/link";
import MobileShell from "@/components/shell/MobileShell";
import RoutineDetailClient from "./RoutineDetailClient";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getAllProducts } from "@/lib/db";
import type { Product } from "@/lib/types";

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [dict, products] = await Promise.all([
    getDictionary(locale as Locale),
    getAllProducts(),
  ]);

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
          shareCardTagline: dict.routine.shareCardTagline,
        }}
        products={products as Product[]}
      />
    </MobileShell>
  );
}
