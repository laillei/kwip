import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Product, Concern } from "@/lib/types";
import { getAllProducts, getAllConcerns } from "@/lib/db";
import { t } from "@/lib/getLocalizedData";
import RoutineBuilderClient from "@/components/routine/RoutineBuilderClient";
import MobileShell from "@/components/shell/MobileShell";

export default async function RoutineNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ concern?: string; saved?: string }>;
}) {
  const { locale } = await params;
  const { concern, saved } = await searchParams;
  const loc = locale as Locale;

  const dict = await getDictionary(loc);

  const [allProductsRaw, allConcernsRaw] = await Promise.all([
    getAllProducts(),
    getAllConcerns(),
  ]);

  const allProducts = (allProductsRaw as Product[]).filter((p) => {
    const name = (p.name.en || p.name.vi || "").toLowerCase();
    return (
      !name.includes("[deal]") &&
      !name.includes("bundle") &&
      !name.includes("2-pack") &&
      !name.includes("3-pack") &&
      !name.includes(" kit")
    );
  });

  const concerns = allConcernsRaw
    .filter((c) => c.id && c.label)
    .map((c) => ({
      id: c.id as Concern,
      label: t(c.label as Record<string, string>, loc),
    }));

  const initialSelectedIds = saved ? saved.split(",").filter(Boolean) : undefined;

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
          <span className="text-[15px] font-medium">{dict.routine.backToMe}</span>
        </Link>
      }
      headerRight={<></>}
    >
      <RoutineBuilderClient
        locale={locale}
        concern={concern ?? ""}
        concerns={concerns}
        products={allProducts}
        initialSelectedIds={initialSelectedIds}
        dict={{
          namePlaceholder: dict.routine.namePlaceholder,
          saveButton: dict.routine.saveButton,
          saving: dict.routine.saving,
          allItems: dict.home.allItems,
          emptyState: dict.products.emptyState,
          addMoreProducts: dict.routine.addMoreProducts,
        }}
      />
    </MobileShell>
  );
}
