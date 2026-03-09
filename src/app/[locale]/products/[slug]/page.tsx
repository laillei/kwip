import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import products from "@/data/products.json";
import ingredientsData from "@/data/ingredients.json";
import type { Product, Ingredient } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import { getBrandName } from "@/lib/brands";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale as Locale);
  const product = products.find((p) => p.slug === slug) as Product | undefined;
  if (!product) notFound();

  const ingredientMap = new Map(
    ingredientsData.map((i) => [i.id, i as Ingredient])
  );

  const keyIngredients = product.ingredients
    .filter((pi) => pi.isKey)
    .map((pi) => ({ ...pi, detail: ingredientMap.get(pi.ingredientId)! }));

  const allIngredients = [...product.ingredients]
    .sort((a, b) => a.order - b.order)
    .map((pi) => ({ ...pi, detail: ingredientMap.get(pi.ingredientId)! }));

  const purchaseLinks = [
    { platform: "Shopee", url: product.purchase.shopee },
    { platform: "Lazada", url: product.purchase.lazada },
    { platform: "Oliveyoung", url: product.purchase.oliveyoung },
    { platform: "TikTok Shop", url: product.purchase.tiktokShop },
    { platform: "Hasaki", url: product.purchase.hasaki },
  ].filter((l): l is { platform: string; url: string } => Boolean(l.url));

  const loc = locale as Locale;

  return (
    <div className="min-h-screen bg-neutral-50 pb-28">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-8 py-4">
          <Link
            href={`/${locale}/products?concern=${product.concerns[0]}`}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors -ml-1 px-1 py-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {dict.detail.back}
          </Link>
          <Suspense>
            <LanguageSwitcher />
          </Suspense>
        </header>

        {/* Product hero */}
        <div className="px-6 md:px-8">
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
            <div className="relative aspect-[4/3] bg-white overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center text-[120px] font-bold text-neutral-100/50 select-none pointer-events-none leading-none">
                {product.popularity.rank}
              </span>
              <Image
                src={product.image}
                alt={product.name[loc] || product.name.vi}
                fill
                className="object-contain p-6 relative z-[1]"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>
            <div className="px-6 pt-5 pb-6">
              <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
                {getBrandName(product.brand)}
              </p>
              <h1 className="text-lg font-semibold leading-tight mt-1.5 text-neutral-900">
                {product.name[loc] || product.name.vi}
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500 capitalize">
                  {product.category}
                </span>
                {product.tags.includes("best-seller") && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                    Best Seller
                  </span>
                )}
                {product.tags.includes("sensitive-safe") && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    Sensitive Safe
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key ingredients */}
        <section className="px-6 md:px-8 mt-8">
          <h2 className="text-xs font-semibold tracking-wide text-neutral-400 uppercase mb-3">
            {dict.detail.keyIngredients}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyIngredients.map(({ detail }) => (
              <div
                key={detail.id}
                className="rounded-2xl bg-white p-5"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">{detail.name.inci}</p>
                  {detail.ewgGrade && (
                    <span className="shrink-0 ml-3 text-xs font-medium text-neutral-500 bg-neutral-100 rounded-full px-2.5 py-0.5">
                      EWG {detail.ewgGrade}
                    </span>
                  )}
                </div>
                {loc !== "en" && (
                  <p className="text-xs font-medium text-neutral-500 mt-0.5">{detail.name.vi}</p>
                )}
                <p className="text-sm text-neutral-600 mt-2.5 leading-relaxed">
                  {t(detail.description, loc)}
                </p>
                {detail.effects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {detail.effects.map((effect) => (
                      <span
                        key={effect.concern}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          effect.type === "good"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {effect.type === "good" ? "✓" : "⚠"} {t(effect.reason, loc)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Full ingredient list */}
        <section className="px-6 md:px-8 mt-8">
          <h2 className="text-xs font-semibold tracking-wide text-neutral-400 uppercase mb-3">
            {dict.detail.allIngredients}
          </h2>
          <div className="rounded-2xl bg-white overflow-hidden divide-y divide-neutral-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
            {allIngredients.map(({ ingredientId, order, detail }) => (
              <div key={ingredientId} className="flex items-start gap-3.5 px-5 py-3.5">
                <span className="text-xs font-medium text-neutral-400 w-5 shrink-0 pt-px text-right tabular-nums">
                  {order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{detail.name.inci}</p>
                    {detail.ewgGrade && (
                      <span className="shrink-0 text-xs font-medium text-neutral-500">
                        EWG {detail.ewgGrade}
                      </span>
                    )}
                  </div>
                  {loc !== "en" && (
                    <p className="text-xs font-medium text-neutral-500 mt-0.5">{detail.name.vi}</p>
                  )}
                  {detail.effects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {detail.effects.map((effect) => (
                        <span
                          key={effect.concern}
                          className={`text-xs font-medium ${
                            effect.type === "good"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {effect.type === "good" ? "✓" : "⚠"} {t(effect.reason, loc)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky purchase bar */}
      {purchaseLinks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="bg-white/80 backdrop-blur-xl border-t border-neutral-200/60 px-6 md:px-8 py-4">
            <div className="flex gap-3 max-w-3xl mx-auto">
              {purchaseLinks.map(({ platform, url }) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-2xl bg-neutral-900 text-white text-center text-sm font-medium py-3.5 transition-all duration-200 hover:bg-neutral-800 active:scale-[0.98]"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
