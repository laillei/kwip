import Link from "next/link";
import { Suspense } from "react";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import ProductCard from "@/components/products/ProductCard";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ concern?: string }>;
}) {
  const { locale } = await params;
  const { concern: concernParam } = await searchParams;
  const dict = await getDictionary(locale as Locale);
  const activeConcern = concernParam || "acne";

  const filtered = products
    .filter((p) => p.concerns.includes(activeConcern as never))
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href={`/${locale}`} className="text-xl font-bold tracking-tight">
          Kwip
        </Link>
        <Suspense>
          <LanguageSwitcher />
        </Suspense>
      </header>

      {/* Concern filter tabs */}
      <nav className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-sm py-3">
        <div className="flex gap-2 px-5 overflow-x-auto">
          {concerns.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/products?concern=${c.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
                c.id === activeConcern
                  ? "bg-neutral-900 text-white font-medium"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {c.icon} {t(c.label, locale as Locale)}
            </Link>
          ))}
        </div>
      </nav>

      {/* Product grid */}
      <main className="px-5 pt-5 pb-10">
        {filtered.length === 0 ? (
          <p className="text-center text-neutral-400 py-12">
            {dict.products.emptyState}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name[locale as Locale] || product.name.vi}
                category={product.category}
                image={product.image}
                locale={locale}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
