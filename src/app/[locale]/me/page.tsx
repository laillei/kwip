import MobileShell from "@/components/shell/MobileShell";
import MePageClient from "./MePageClient";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getAllProducts } from "@/lib/db";

export default async function MePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [dict, products] = await Promise.all([
    getDictionary(locale as Locale),
    getAllProducts(),
  ]);

  return (
    <MobileShell locale={locale}>
      <MePageClient
        locale={locale}
        products={products}
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
        }}
      />
    </MobileShell>
  );
}
