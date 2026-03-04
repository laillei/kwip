import Link from "next/link";
import concerns from "@/data/concerns.json";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold tracking-tight">{dict.home.heading}</h1>
      <p className="mt-2 text-sm text-neutral-400">
        {dict.site.tagline}
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-sm">
        {concerns.map((concern) => (
          <Link
            key={concern.id}
            href={`/${locale}/products?concern=${concern.id}`}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-6 min-h-[120px] transition-colors hover:bg-neutral-800 active:bg-neutral-700"
          >
            <span className="text-2xl">{concern.icon}</span>
            <span className="text-sm font-medium">{t(concern.label, locale as Locale)}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
