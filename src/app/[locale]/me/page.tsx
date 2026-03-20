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
      <MePageClient
        locale={locale}
        products={products}
        concernLabels={concernLabels}
        dict={{
          myRoutines: dict.routine.myRoutines,
          emptyTitle: dict.routine.emptyTitle,
          emptyBody: dict.routine.emptyBody,
          emptyAction: dict.routine.emptyAction,
          viewButton: dict.routine.viewButton,
          deleteButton: dict.routine.deleteButton,
          productsCount: dict.routine.productsCount,
          backToHome: dict.routine.backToHome,
          savedProducts: dict.me.savedProducts,
          createRoutineFromSaved: dict.me.createRoutineFromSaved,
          noSavedProducts: dict.me.noSavedProducts,
          pageLabel: dict.me.pageLabel,
          buildRoutine: dict.me.buildRoutine,
          noRoutinesTitle: dict.me.noRoutinesTitle,
          noRoutinesBody: dict.me.noRoutinesBody,
        }}
      />
    </MobileShell>
  );
}
