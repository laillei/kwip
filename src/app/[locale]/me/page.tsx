import Link from "next/link";
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
          <span className="text-sm font-medium">{dict.routine.myRoutines}</span>
        </Link>
      }
    >
      <MePageClient locale={locale} />
    </MobileShell>
  );
}
