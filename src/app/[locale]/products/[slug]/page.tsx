import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Ingredient } from "@/lib/types";
import { getProductBySlug, getAllProductSlugs, getAllIngredients } from "@/lib/db";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import { getBrandName } from "@/lib/brands";
import BookmarkButton from "@/components/shared/BookmarkButton";
import MobileShell from "@/components/shell/MobileShell";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale as Locale);

  const [product, ingredientsList] = await Promise.all([
    getProductBySlug(slug),
    getAllIngredients(),
  ]);
  if (!product) notFound();

  const ingredientMap = new Map(
    ingredientsList.map((i) => [i.id, i as Ingredient])
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
    <MobileShell
      locale={locale}
      headerLeft={
        <Link
          href={`/${locale}`}
          className="flex items-center gap-1 text-neutral-900 -ml-1 px-1 min-h-[44px] min-w-[44px]"
          aria-label={dict.detail.back}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-[15px] font-medium">{dict.detail.back}</span>
        </Link>
      }
      headerRight={<BookmarkButton productId={product.id} />}
    >
      {/* Desktop header — visible md+ only */}
      <div className="hidden md:block max-w-3xl mx-auto">
        <header className="flex items-center justify-between px-8 py-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-1.5 text-[15px] text-neutral-500 hover:text-neutral-900 transition-colors -ml-1 px-1 min-h-[44px]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {dict.detail.back}
          </Link>
        </header>
      </div>

      <div className="min-h-screen bg-neutral-100">
        <div className="max-w-3xl mx-auto pb-24 md:pb-28">

          {/* Product image + info — white block */}
          <div className="bg-white">
            {/* Image — 4:3 ratio */}
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <Image
                src={product.image}
                alt={product.name[loc] || product.name.vi}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>

            {/* Product info */}
            <div className="px-4 md:px-8 pt-4 pb-5">
              <p className="text-[13px] text-neutral-400 uppercase tracking-wide">
                {getBrandName(product.brand)}
              </p>
              <h1 className="text-[17px] font-semibold leading-snug mt-1 text-neutral-900">
                {product.name[loc] || product.name.vi}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[13px] font-medium text-neutral-500">
                  {dict.detail.categories[product.category as keyof typeof dict.detail.categories] || product.category}
                </span>
                {product.tags.includes("best-seller") && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[13px] font-medium text-amber-600">
                    {dict.detail.bestSeller}
                  </span>
                )}
                {product.tags.includes("sensitive-safe") && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-medium text-emerald-600">
                    {dict.detail.sensitiveSafe}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Gap */}
          <div className="h-4" />

          {/* Key ingredients — white block */}
          <section className="bg-white">
            <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase px-4 md:px-8 pt-4 pb-2">
              {dict.detail.keyIngredients}
            </h2>
            <div className="divide-y divide-neutral-100">
              {keyIngredients.map(({ detail }) => (
                <div key={detail.id} className="px-4 md:px-8 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-semibold text-neutral-900">{detail.name.inci}</p>
                    {detail.ewgGrade && (
                      <span className="shrink-0 ml-3 text-[13px] text-neutral-400">
                        EWG {detail.ewgGrade}
                      </span>
                    )}
                  </div>
                  {loc !== "en" && (
                    <p className="text-[13px] text-neutral-400 mt-0.5">{detail.name.vi}</p>
                  )}
                  <p className="text-[15px] text-neutral-600 mt-2 leading-relaxed">
                    {t(detail.description, loc)}
                  </p>
                  {detail.effects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {detail.effects.map((effect) => (
                        <span
                          key={effect.concern}
                          className={`text-[13px] font-medium ${
                            effect.type === "good" ? "text-emerald-600" : "text-amber-600"
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

          {/* Gap */}
          <div className="h-4" />

          {/* Full ingredient list — white block */}
          <section className="bg-white">
            <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase px-4 md:px-8 pt-4 pb-2">
              {dict.detail.allIngredients}
            </h2>
            <div className="divide-y divide-neutral-100">
              {allIngredients.map(({ ingredientId, order, detail }) => (
                <div key={ingredientId} className="flex items-start gap-4 px-4 md:px-8 py-3 min-h-[44px]">
                  <span className="text-[13px] text-neutral-400 w-5 shrink-0 pt-px text-right tabular-nums">
                    {order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-neutral-900">{detail.name.inci}</p>
                      {detail.ewgGrade && (
                        <span className="shrink-0 text-[13px] text-neutral-400">
                          EWG {detail.ewgGrade}
                        </span>
                      )}
                    </div>
                    {loc !== "en" && (
                      <p className="text-[13px] text-neutral-400 mt-0.5">{detail.name.vi}</p>
                    )}
                    {detail.effects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {detail.effects.map((effect) => (
                          <span
                            key={effect.concern}
                            className={`text-[13px] font-medium ${
                              effect.type === "good" ? "text-emerald-600" : "text-amber-600"
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
      </div>

      {/* Sticky purchase bar — elevated above tab bar on mobile */}
      {purchaseLinks.length > 0 && (
        <div
          className="fixed left-0 right-0 z-20 md:bottom-0"
          style={{ bottom: "calc(49px + env(safe-area-inset-bottom))" }}
        >
          <div className="bg-white border-t border-neutral-100 px-4 md:px-8 py-4">
            <div className="flex gap-3 max-w-3xl mx-auto">
              {purchaseLinks.map(({ platform, url }) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-neutral-900 text-white text-center text-[15px] font-semibold py-3.5 active:opacity-70 transition-opacity"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
