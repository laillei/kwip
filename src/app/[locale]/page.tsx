import Link from "next/link";
import { Suspense } from "react";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import type { Product, Concern } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import ProductCard from "@/components/products/ProductCard";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

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

  const sections = concerns
    .map((concern) => {
      const matched = allProducts
        .filter((p) => p.concerns.includes(concern.id as Concern))
        .slice(0, 4);
      return { concern, products: matched };
    })
    .filter((s) => s.products.length > 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4">
          <div>
            <span className="text-2xl font-bold tracking-tight">Kwip</span>
            <p className="text-[13px] text-neutral-400 mt-0.5">{dict.site.tagline}</p>
          </div>
          <Suspense>
            <LanguageSwitcher />
          </Suspense>
        </header>

        {/* Concern sections */}
        <main className="px-6 md:px-8 pt-2 pb-20">
          {sections.map(({ concern, products: sectionProducts }, index) => (
            <section
              key={concern.id}
              className={index > 0 ? "mt-10" : ""}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  {t(concern.label, loc)}
                </h2>
                <Link
                  href={`/${locale}/products?concern=${concern.id}`}
                  className="flex items-center gap-0.5 text-sm text-neutral-500 hover:text-neutral-700 active:text-neutral-900 transition-colors min-h-[44px] min-w-[44px] justify-end pl-4"
                >
                  {dict.home.viewMore}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </div>
              {concern.weatherTrigger?.message && (
                <p className="text-[13px] text-neutral-500 bg-neutral-100 rounded-xl px-3.5 py-2.5 mb-4">
                  {t(concern.weatherTrigger.message, loc)}
                </p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {sectionProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    slug={product.slug}
                    name={product.name[loc] || product.name.vi}
                    brand={product.brand}
                    category={product.category}
                    image={product.image}
                    locale={locale}
                    rank={product.popularity.rank}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
