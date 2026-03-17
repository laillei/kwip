import { redirect } from "next/navigation";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";
import products from "@/data/products.json";
import concerns from "@/data/concerns.json";
import type { Product } from "@/lib/types";
import RoutineBuilderClient from "@/components/routine/RoutineBuilderClient";
import MobileShell from "@/components/shell/MobileShell";

export default async function RoutineNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ concern?: string }>;
}) {
  const { locale } = await params;
  const { concern } = await searchParams;

  if (!concern) {
    redirect(`/${locale}`);
  }

  const dict = await getDictionary(locale as Locale);
  const allProducts = (products as Product[]).filter((p) => {
    const name = (p.name.en || p.name.vi || "").toLowerCase();
    return (
      !name.includes("[deal]") &&
      !name.includes("bundle") &&
      !name.includes("2-pack") &&
      !name.includes("3-pack") &&
      !name.includes(" kit")
    );
  });

  const concernData = concerns.find((c) => c.id === concern);
  const concernLabel =
    locale === "vi" ? concernData?.label?.vi : concernData?.label?.en;

  return (
    <MobileShell
      locale={locale}
      headerLeft={
        <Link
          href={`/${locale}`}
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
          <span className="text-sm font-medium">{dict.routine.backToHome}</span>
        </Link>
      }
    >
      <RoutineBuilderClient
        locale={locale}
        concern={concern}
        concernLabel={concernLabel}
        products={allProducts}
        dict={dict.routine}
      />
    </MobileShell>
  );
}
