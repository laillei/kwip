import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Ingredient } from "@/types";
import { getProductBySlug, getAllProductSlugs, getAllIngredients } from "@/lib/db";
import { getDictionary, type Locale } from "@/lib/i18n";
import { t } from "@/lib/getLocalizedData";
import { getBrandName } from "@/lib/brands";
import BookmarkButton from "@/components/shared/BookmarkButton";
import MobileShell from "@/components/layout/MobileShell";

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

  const loc = locale as Locale;

  return (
    <MobileShell
      locale={locale}
      headerLeft={
        <Link
          href={`/${locale}/products`}
          className="flex items-center gap-1 text-on-surface -ml-1 px-1 min-h-[44px] min-w-[44px]"
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
      <div className="min-h-screen bg-surface-container">
        <div className="pb-24">

          {/* Product image + info — white block */}
          <div className="bg-surface-lowest">
            {/* Image — 4:3 ratio */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-white border-b border-outline">
              <Image
                src={product.image}
                alt={product.name[loc] || product.name.ko}
                fill
                className="object-contain p-6"
                sizes="100vw"
                priority
              />
            </div>

            {/* Product info */}
            <div className="px-4 pt-4 pb-5">
              <p
                className="text-[11px] text-on-surface-variant uppercase tracking-wide"
                style={{
                  fontFamily:
                    "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
                }}
              >
                {getBrandName(product.brand)}
              </p>
              <h1 className="text-[17px] font-semibold leading-snug mt-1 text-on-surface">
                {product.name[loc] || product.name.ko}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center bg-surface-variant rounded-full px-3 py-1 text-[13px] font-medium text-on-surface-variant">
                  {dict.detail.categories[product.category as keyof typeof dict.detail.categories] || product.category}
                </span>
                {product.tags.includes("best-seller") && (
                  <span className="inline-flex items-center bg-surface-variant rounded-full px-3 py-1 text-[13px] font-medium text-accent">
                    {dict.detail.bestSeller}
                  </span>
                )}
                {product.tags.includes("sensitive-safe") && (
                  <span className="inline-flex items-center bg-surface-variant rounded-full px-3 py-1 text-[13px] font-medium text-accent">
                    {dict.detail.sensitiveSafe}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Gap */}
          <div className="h-4 bg-surface-container" />

          {/* Key ingredients — white block */}
          <section className="bg-surface-lowest">
            <h2 className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase px-4 pt-4 pb-2">
              {dict.detail.keyIngredients}
            </h2>
            <div className="divide-y divide-outline-variant">
              {keyIngredients.map(({ detail }) => (
                <div key={detail.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-semibold text-on-surface">{detail.name.inci}</p>
                    {detail.ewgGrade && (
                      <span className="shrink-0 ml-3 text-[13px] text-on-surface-variant">
                        EWG {detail.ewgGrade}
                      </span>
                    )}
                  </div>
                  {detail.name.ko && (
                    <p className="text-[13px] text-on-surface-variant mt-0.5">{detail.name.ko}</p>
                  )}
                  <p className="text-[15px] text-on-surface-variant mt-2 leading-relaxed">
                    {t(detail.description, loc)}
                  </p>
                  {detail.effects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {detail.effects.map((effect) => (
                        <span
                          key={effect.concern}
                          className={`text-[13px] font-medium ${
                            effect.type === "good" ? "text-primary" : "text-tertiary"
                          }`}
                        >
                          {effect.type === "good" ? "\u2713" : "\u26a0"} {t(effect.reason, loc)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Gap */}
          <div className="h-4 bg-surface-container" />

          {/* Full ingredient list — white block */}
          <section className="bg-surface-lowest">
            <h2 className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase px-4 pt-4 pb-2">
              {dict.detail.allIngredients}
            </h2>
            <div className="divide-y divide-outline-variant">
              {allIngredients.map(({ ingredientId, order, detail }) => (
                <div key={ingredientId} className="flex items-start gap-4 px-4 py-3 min-h-[44px]">
                  <span className="text-[13px] text-on-surface-variant w-5 shrink-0 pt-px text-right tabular-nums">
                    {order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-on-surface">{detail.name.inci}</p>
                      {detail.ewgGrade && (
                        <span className="shrink-0 text-[13px] text-on-surface-variant">
                          EWG {detail.ewgGrade}
                        </span>
                      )}
                    </div>
                    {loc !== "en" && (
                      <p className="text-[13px] text-on-surface-variant mt-0.5">{detail.name.ko}</p>
                    )}
                    {detail.effects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {detail.effects.map((effect) => (
                          <span
                            key={effect.concern}
                            className={`text-[13px] font-medium ${
                              effect.type === "good" ? "text-primary" : "text-tertiary"
                            }`}
                          >
                            {effect.type === "good" ? "\u2713" : "\u26a0"} {t(effect.reason, loc)}
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

    </MobileShell>
  );
}
