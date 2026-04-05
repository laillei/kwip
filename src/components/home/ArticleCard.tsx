import Link from "next/link";
import type { Article } from "@/types/article";
import type { Locale } from "@/lib/i18n";

interface ArticleCardProps {
  article: Article;
  locale: string;
}

export default function ArticleCard({ article, locale }: ArticleCardProps) {
  const loc = locale as Locale;
  const title = article.title[loc] || article.title.ko;
  const description = article.description[loc] || article.description.ko;
  const date = article.publishedAt.replace(/-/g, ".");

  return (
    <Link
      href={`/${locale}/article/${article.slug}`}
      className="bg-surface-lowest p-4 flex flex-col gap-3 block"
    >
      {/* Cover image */}
      <div className="aspect-video w-full overflow-hidden bg-surface-high">
        {article.coverImage ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${article.coverImage})` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary" />
        )}
      </div>

      {/* Tag badge */}
      <span
        className="bg-surface-variant text-accent px-2 py-0.5 text-[11px] w-fit"
        style={{
          fontFamily:
            "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
        }}
      >
        {article.tag}
      </span>

      {/* Headline */}
      <h2
        className="text-[17px] font-semibold text-on-surface"
        style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
      >
        {title}
      </h2>

      {/* Subtitle */}
      <p
        className="text-[15px] text-on-surface-variant"
        style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
      >
        {description}
      </p>

      {/* Date */}
      <time
        className="text-[11px] text-on-surface-variant"
        dateTime={article.publishedAt}
        style={{
          fontFamily:
            "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
        }}
      >
        {date}
      </time>
    </Link>
  );
}
