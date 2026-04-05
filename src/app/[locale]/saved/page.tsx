import { getAllProducts } from "@/lib/db";
import { getDictionary, type Locale } from "@/lib/i18n";
import MobileShell from "@/components/layout/MobileShell";
import SavedClient from "@/components/saved/SavedClient";

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [products, dict] = await Promise.all([
    getAllProducts(),
    getDictionary(locale as Locale),
  ]);

  return (
    <MobileShell locale={locale}>
      <div className="min-h-screen bg-surface">
        <div className="max-w-3xl mx-auto">
          <SavedClient
            allProducts={products}
            locale={locale}
            dictionary={dict}
          />
        </div>
      </div>
    </MobileShell>
  );
}
