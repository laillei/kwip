import { Suspense } from "react";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import ingredients from "@/data/ingredients.json";
import type { Product, Ingredient } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import SearchButton from "@/components/shared/SearchButton";
import ConcernHub from "@/components/home/ConcernHub";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const loc = locale as Locale;

  const allProducts = (products as Product[]).sort(
    (a, b) => a.popularity.rank - b.popularity.rank
  );

  const concernData = concerns.map((c) => ({
    id: c.id as import("@/lib/types").Concern,
    label: t(c.label, loc),
    icon: c.icon,
    keyIngredientIds: c.keyIngredients,
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between px-6 md:px-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4">
          <div>
            <span className="text-2xl font-bold tracking-tight">Kwip</span>
            <p className="text-sm text-neutral-600 mt-0.5">
              {dict.site.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SearchButton locale={locale} />
            <Suspense>
              <LanguageSwitcher />
            </Suspense>
          </div>
        </header>

        <main className="px-6 md:px-8 pt-2 pb-20">
          <p className="text-sm text-neutral-500 mb-4">
            {dict.home.selectConcern}
          </p>
          <ConcernHub
            concerns={concernData}
            products={allProducts}
            ingredients={ingredients as Ingredient[]}
            locale={locale}
            dict={{
              emptyState: dict.products.emptyState,
              helpfulIngredients: dict.home.helpfulIngredients,
            }}
          />
        </main>
      </div>
    </div>
  );
}
