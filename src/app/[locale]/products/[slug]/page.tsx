import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import products from "@/data/products.json";
import ingredientsData from "@/data/ingredients.json";
import type { Product, Ingredient } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
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
    { platform: "TikTok Shop", url: product.purchase.tiktokShop },
    { platform: "Hasaki", url: product.purchase.hasaki },
  ].filter((l): l is { platform: string; url: string } => Boolean(l.url));

  const loc = locale as Locale;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href={`/${locale}`} className="text-xl font-bold tracking-tight">
          Kwip
        </Link>
        <Suspense>
          <LanguageSwitcher />
        </Suspense>
      </header>

      <main className="px-5">
        {/* Back link */}
        <Link
          href={`/${locale}?concern=${product.concerns[0]}`}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          {dict.detail.back}
        </Link>

        {/* Product info */}
        <h1 className="text-2xl font-bold leading-tight mt-6">
          {product.name[loc] || product.name.vi}
        </h1>
        <p className="text-sm text-neutral-400 mt-1 capitalize">
          {product.brand} · {product.category}
        </p>

        {/* Key ingredients */}
        <section className="mt-10">
          <h2 className="text-sm font-medium text-neutral-400 mb-4">
            {dict.detail.keyIngredients}
          </h2>
          <div className="flex flex-col gap-3">
            {keyIngredients.map(({ detail }) => (
              <div
                key={detail.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium">{detail.name.inci}</p>
                  {detail.ewgGrade && (
                    <span className="shrink-0 ml-3 text-xs font-medium text-neutral-400 border border-neutral-700 rounded-full px-2.5 py-0.5">
                      EWG {detail.ewgGrade}
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-400 mt-1">
                  {detail.name.vi}
                </p>
                <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                  {t(detail.description, loc)}
                </p>
                {detail.effects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {detail.effects.map((effect) => (
                      <span
                        key={effect.concern}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          effect.type === "good"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-amber-400/10 text-amber-400"
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
        <section className="mt-10">
          <h2 className="text-sm font-medium text-neutral-400 mb-4">
            {dict.detail.allIngredients}
          </h2>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 divide-y divide-neutral-800">
            {allIngredients.map(({ ingredientId, order, detail }) => (
              <div key={ingredientId} className="flex items-start gap-4 px-5 py-4">
                <span className="text-sm text-neutral-600 w-5 shrink-0 pt-0.5 text-right tabular-nums">
                  {order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{detail.name.inci}</p>
                    {detail.ewgGrade && (
                      <span className="shrink-0 text-xs text-neutral-500">
                        EWG {detail.ewgGrade}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {detail.name.vi}
                  </p>
                  {detail.effects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {detail.effects.map((effect) => (
                        <span
                          key={effect.concern}
                          className={`text-sm ${
                            effect.type === "good"
                              ? "text-emerald-400"
                              : "text-amber-400"
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
      </main>

      {/* Sticky purchase buttons */}
      {purchaseLinks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-neutral-800 px-5 py-4">
          <div className="flex gap-2 max-w-lg mx-auto">
            {purchaseLinks.map(({ platform, url }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full bg-white text-black text-center text-sm font-medium py-3.5 transition-opacity hover:opacity-90 active:opacity-80"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
