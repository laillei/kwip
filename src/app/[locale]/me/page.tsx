import MobileShell from "@/components/shell/MobileShell";
import MePageClient from "./MePageClient";
import { getDictionary, type Locale } from "@/lib/i18n";

export default async function MePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <MobileShell
      locale={locale}
      headerLeft={
        <span className="text-base font-semibold tracking-tight text-neutral-900">
          {dict.routine.myRoutines}
        </span>
      }
    >
      <MePageClient
        locale={locale}
        dict={{
          myRoutines: dict.routine.myRoutines,
          emptyTitle: dict.routine.emptyTitle,
          emptyBody: dict.routine.emptyBody,
          emptyAction: dict.routine.emptyAction,
          viewButton: dict.routine.viewButton,
          deleteButton: dict.routine.deleteButton,
          productsCount: dict.routine.productsCount,
          backToHome: dict.routine.backToHome,
        }}
      />
    </MobileShell>
  );
}
