import Image from "next/image";
import Link from "next/link";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";

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
      <header className="px-4 pt-4 pb-2">
        <Link href={`/${locale}`} className="text-lg font-bold tracking-tight">
          Kwip
        </Link>
      </header>

      {/* Concern tabs */}
      <nav className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex gap-1 px-4 overflow-x-auto">
          {concerns.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/products?concern=${c.id}`}
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

      {/* Product list */}
      <main className="px-4 py-4">
        <p className="text-xs text-neutral-500 mb-4">
          {dict.products.popularLabel}
        </p>

        {filtered.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">
            {dict.products.emptyState}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/${locale}/products/${product.slug}`}
                className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 transition-colors hover:bg-neutral-800 active:bg-neutral-700"
              >
                <span className="text-lg font-bold text-neutral-600 w-6 shrink-0 text-right">
                  {product.popularity.rank}
                </span>
                <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-neutral-800">
                  <Image
                    src={product.image}
                    alt={product.name[locale as Locale] || product.name.vi}
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm leading-tight truncate">
                    {product.name[locale as Locale] || product.name.vi}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {product.brand} · {product.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
