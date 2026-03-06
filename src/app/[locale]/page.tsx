import Link from "next/link";
import { Suspense } from "react";
import concerns from "@/data/concerns.json";
import products from "@/data/products.json";
import type { Product, Concern, Category } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import ProductCard from "@/components/products/ProductCard";
import RankingList from "@/components/products/RankingList";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ViewToggle from "@/components/shared/ViewToggle";

const categories: { id: Category | "all"; label: Record<string, string> }[] = [
  { id: "all", label: { en: "All", vi: "Tất cả" } },
  { id: "serum", label: { en: "Serum", vi: "Serum" } },
  { id: "cream", label: { en: "Cream", vi: "Kem" } },
  { id: "toner", label: { en: "Toner", vi: "Toner" } },
  { id: "sunscreen", label: { en: "Sunscreen", vi: "Chống nắng" } },
  { id: "pad", label: { en: "Pad", vi: "Pad" } },
];

const allConcerns = [
  { id: "all", label: { en: "All", vi: "Tất cả" } },
  ...concerns.map((c) => ({ id: c.id, label: c.label })),
];

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ concern?: string; category?: string; view?: string }>;
}) {
  const { locale } = await params;
  const { concern: concernParam, category: categoryParam, view } = await searchParams;
  const dict = await getDictionary(locale as Locale);
  const loc = locale as Locale;
  const activeConcern = concernParam || "all";
  const activeCategory = categoryParam || "all";
  const isRankingView = view === "ranking";

  function buildUrl(overrides: { concern?: string; category?: string; view?: string } = {}) {
    const p = new URLSearchParams();
    const c = overrides.concern ?? activeConcern;
    const cat = overrides.category ?? activeCategory;
    const v = overrides.view ?? (isRankingView ? "ranking" : undefined);
    if (c !== "all") p.set("concern", c);
    if (cat !== "all") p.set("category", cat);
    if (v) p.set("view", v);
    const qs = p.toString();
    return `/${locale}${qs ? `?${qs}` : ""}`;
  }

  const filtered = (products as Product[])
    .filter((p) => activeConcern === "all" || p.concerns.includes(activeConcern as Concern))
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-8 pt-6 pb-4">
          <div>
            <span className="text-2xl font-bold tracking-tight">Kwip</span>
            <p className="text-[13px] text-neutral-400 mt-0.5">{dict.site.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <Suspense>
              <ViewToggle />
              <LanguageSwitcher />
            </Suspense>
          </div>
        </header>

        {/* Navigation */}
        <nav className="sticky top-0 z-10 bg-neutral-50/80 backdrop-blur-xl pt-3 space-y-1">
          {/* Primary: Concern pills */}
          <div className="flex gap-2 px-6 md:px-8 overflow-x-auto no-scrollbar">
            {allConcerns.map((c) => (
              <Link
                key={c.id}
                href={buildUrl({ concern: c.id })}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  c.id === activeConcern
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-200/70 text-neutral-600 active:bg-neutral-300"
                }`}
              >
                {t(c.label, loc)}
              </Link>
            ))}
          </div>

          {/* Secondary: MD3-style category tabs */}
          <div className="flex px-6 md:px-8 overflow-x-auto no-scrollbar border-b border-neutral-200">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={buildUrl({ category: cat.id })}
                className={`shrink-0 flex items-center justify-center h-12 px-4 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
                  cat.id === activeCategory
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {t(cat.label, loc)}
              </Link>
            ))}
          </div>
        </nav>

        {/* Product grid */}
        <main className="px-6 md:px-8 pt-6 pb-20">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-neutral-300 text-4xl mb-3">🔍</p>
              <p className="text-sm text-neutral-400">{dict.products.emptyState}</p>
            </div>
          ) : isRankingView ? (
            <RankingList products={filtered} locale={loc} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {filtered.map((product) => (
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
          )}
        </main>
      </div>
    </div>
  );
}
