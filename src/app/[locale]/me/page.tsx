import { Suspense } from "react";
import MobileShell from "@/components/layout/MobileShell";
import MePageClient from "./MePageClient";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getAllProducts, getAllConcerns } from "@/lib/db";
import { t } from "@/lib/getLocalizedData";

export default async function MePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const [dict, products, rawConcerns] = await Promise.all([
    getDictionary(loc),
    getAllProducts(),
    getAllConcerns(),
  ]);

  const concernLabels = Object.fromEntries(
    rawConcerns
      .filter((c) => c.id && c.label)
      .map((c) => [c.id, t(c.label as Record<string, string>, loc)])
  ) as Record<string, string>;

  return (
    <MobileShell locale={locale}>
      <Suspense fallback={null}>
        <MePageClient
          locale={locale}
          products={products}
          concernLabels={concernLabels}
          dict={{
            emptyTitle: dict.routine.emptyTitle,
            emptyBody: dict.routine.emptyBody,
            emptyAction: dict.routine.emptyAction,
            viewButton: dict.routine.viewButton,
            deleteButton: dict.routine.deleteButton,
            productsCount: dict.routine.productsCount,
            buildRoutine: dict.me.buildRoutine,
            noRoutinesBody: dict.me.noRoutinesBody,
            rename: dict.me.rename,
            tabProducts: dict.me.tabProducts,
            tabRoutines: dict.me.tabRoutines,
            noSavedProducts: dict.me.noSavedProducts,
            noRoutinesTitle: dict.me.noRoutinesTitle,
          }}
        />
      </Suspense>
    </MobileShell>
  );
}
