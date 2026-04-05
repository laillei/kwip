import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { mockArticles } from "@/data/articles";
import { locales, getDictionary, type Locale } from "@/lib/i18n";
import { getProductBySlug } from "@/lib/db";
import type { Product } from "@/types";
import MobileShell from "@/components/layout/MobileShell";
import BackButton from "@/components/article/BackButton";
import ShareButton from "@/components/article/ShareButton";
import ArticleBody from "@/components/article/ArticleBody";
import InlineProductCard from "@/components/article/InlineProductCard";
import RelatedArticles from "@/components/article/RelatedArticles";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    mockArticles.map((article) => ({
      locale,
      slug: article.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = mockArticles.find((a) => a.slug === slug);
  if (!article) return {};
  const loc = locale as Locale;
  return {
    title: article.title[loc] || article.title.ko,
    description: article.description[loc] || article.description.ko,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const dict = await getDictionary(loc);

  const article = mockArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  // Fetch linked products
  const products: Product[] = [];
  for (const productSlug of article.productSlugs) {
    const product = await getProductBySlug(productSlug);
    if (product) products.push(product);
  }

  // Resolve related articles
  const relatedArticles = article.relatedArticleSlugs
    .map((s) => mockArticles.find((a) => a.slug === s))
    .filter((a): a is NonNullable<typeof a> => a != null);

  const title = article.title[loc] || article.title.ko;
  const body = article.body[loc] || article.body.ko;
  const date = article.publishedAt.replace(/-/g, ".");
  const readTime =
    loc === "ko"
      ? `${article.readTimeMinutes}분 읽기`
      : `${article.readTimeMinutes} min read`;

  return (
    <div className="min-h-screen bg-surface">
      <MobileShell
        locale={locale}
        headerLeft={<BackButton />}
        headerRight={<ShareButton />}
      >
        {/* Cover image — edge-to-edge */}
        <div className="aspect-video w-full overflow-hidden bg-surface-container">
          {article.coverImage ? (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${article.coverImage})` }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary-container" />
          )}
        </div>

        {/* Article meta section */}
        <div className="bg-surface-lowest p-4">
          <span
            className="bg-secondary-container text-on-secondary-container rounded-full px-2.5 py-0.5 text-[11px] inline-block font-medium"
            style={{
              fontFamily:
                "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
            }}
          >
            {article.tag}
          </span>

          <h1 className="text-[22px] font-bold text-on-surface mt-3 leading-snug">
            {title}
          </h1>

          <p
            className="text-[11px] text-on-surface-variant mt-2"
            style={{
              fontFamily:
                "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
            }}
          >
            {date} &middot; {readTime}
          </p>
        </div>

        {/* Surface gap */}
        <div className="h-4 bg-surface-container" />

        {/* Article body */}
        <div className="bg-surface-lowest px-4 py-6">
          <ArticleBody body={body} />
        </div>

        {/* Inline product cards */}
        {products.length > 0 && (
          <>
            <div className="h-4 bg-surface-container" />
            <section className="bg-surface-lowest">
              <p
                className="text-[11px] font-semibold tracking-widest text-on-surface-variant uppercase px-4 pt-5 pb-1"
                style={{
                  fontFamily:
                    "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
                }}
              >
                {dict.article.featuredProducts}
              </p>
              {products.map((product) => (
                <InlineProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                />
              ))}
            </section>
          </>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <>
            <div className="h-4 bg-surface-container" />
            <RelatedArticles
              articles={relatedArticles}
              locale={locale}
              label={dict.article.relatedArticles}
            />
          </>
        )}

        {/* Bottom spacing */}
        <div className="h-4 bg-surface-container" />
      </MobileShell>
    </div>
  );
}
