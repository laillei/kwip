import { Suspense } from "react";
import type { Product, Ingredient } from "@/lib/types";
import { getAllProducts, getAllIngredients, getAllConcerns } from "@/lib/db";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import SearchButton from "@/components/shared/SearchButton";
import AuthButton from "@/components/shared/AuthButton";
import ConcernHub from "@/components/home/ConcernHub";
import MobileShell from "@/components/shell/MobileShell";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const loc = locale as Locale;

  const [rawProducts, rawIngredients, rawConcerns] = await Promise.all([
    getAllProducts(),
    getAllIngredients(),
    getAllConcerns(),
  ]);

  const allProducts = (rawProducts as Product[])
    .filter((p) => {
      const name = (p.name.en || p.name.vi || "").toLowerCase();
      return (
        !name.includes("[deal]") &&
        !name.includes("bundle") &&
        !name.includes("2-pack") &&
        !name.includes("3-pack") &&
        !name.includes(" kit")
      );
    })
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  const concernData = rawConcerns.map((c) => ({
    id: c.id as import("@/lib/types").Concern,
    label: t(c.label, loc),
    icon: c.icon,
    symptom: t(c.symptom, loc),
    keyIngredientIds: c.key_ingredients,
  }));

  return (
    <div className="min-h-screen bg-neutral-100">
      <MobileShell
        locale={locale}
        headerRight={
          <div className="flex items-center gap-2">
            <SearchButton locale={locale} products={allProducts} />
            <Suspense>
              <LanguageSwitcher />
            </Suspense>
          </div>
        }
      >
        {/* Desktop header — only visible at md+ */}
        <div className="hidden md:block max-w-6xl mx-auto">
          <header className="flex items-center justify-between px-8 pt-6 pb-4">
            <div>
              <span className="text-2xl font-bold tracking-tight">Kwip</span>
              <p className="text-sm text-neutral-600 mt-0.5">
                {dict.site.tagline}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SearchButton locale={locale} products={allProducts} />
              <Suspense>
                <LanguageSwitcher />
              </Suspense>
              <AuthButton locale={locale} />
            </div>
          </header>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-2">
          <ConcernHub
            concerns={concernData}
            products={allProducts}
            ingredients={rawIngredients as Ingredient[]}
            locale={locale}
            dict={{
              emptyState: dict.products.emptyState,
              helpfulIngredients: dict.home.helpfulIngredients,
              concernPrompt: dict.home.concernPrompt,
              buildCta: dict.routine.buildCta,
            }}
          />
        </div>
      </MobileShell>
    </div>
  );
}
