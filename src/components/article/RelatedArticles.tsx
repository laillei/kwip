import Link from "next/link";
import type { Article } from "@/types/article";
import type { Locale } from "@/lib/i18n";

interface RelatedArticlesProps {
  articles: Article[];
  locale: string;
  label: string;
}

export default function RelatedArticles({
  articles,
  locale,
  label,
}: RelatedArticlesProps) {
  const loc = locale as Locale;

  if (articles.length === 0) return null;

  return (
    <section className="bg-surface-lowest">
      <p
        className="text-[11px] font-semibold tracking-widest text-on-surface-variant uppercase px-4 pt-5 pb-3"
        style={{
          fontFamily:
            "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
        }}
      >
        {label}
      </p>
      <div className="px-4 pb-4 flex flex-col gap-4">
        {articles.map((article) => {
          const title = article.title[loc] || article.title.ko;
          return (
            <Link
              key={article.id}
              href={`/${locale}/article/${article.slug}`}
              className="flex gap-3 items-start"
            >
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                {article.coverImage ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${article.coverImage})`,
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <span
                  className="bg-secondary-container text-on-secondary-container rounded-full px-2 py-0.5 text-[10px] inline-block"
                  style={{
                    fontFamily:
                      "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {article.tag}
                </span>
                <p className="text-[13px] font-semibold text-on-surface mt-1 line-clamp-2 leading-snug">
                  {title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
