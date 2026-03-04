import Link from "next/link";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import ProductCard from "@/components/products/ProductCard";

export default async function Home({
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
      {/* Top bar */}
      <header className="px-4 py-4">
        <span className="text-lg font-bold tracking-tight">Kwip</span>
      </header>

      {/* Concern filter tabs */}
      <nav className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex gap-1 px-4 overflow-x-auto">
          {concerns.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}?concern=${c.id}`}
              className={`shrink-0 px-4 py-3 text-sm transition-colors ${
                c.id === activeConcern
                  ? "text-white border-b-2 border-white font-medium"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {c.icon} {t(c.label, locale as Locale)}
            </Link>
          ))}
        </div>
      </nav>

      {/* Product grid */}
      <main className="px-4 py-4 pb-8">
        {filtered.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">
            {dict.products.emptyState}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
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
