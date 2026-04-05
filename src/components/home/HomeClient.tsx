"use client";

import { useState } from "react";
import type { Article } from "@/types/article";
import type { Product } from "@/types";
import FilterChips from "./FilterChips";
import ArticleCard from "./ArticleCard";
import FeaturedProducts from "./FeaturedProducts";

interface HomeClientProps {
  articles: Article[];
  products: Product[];
  locale: string;
  dictionary: {
    filterAll: string;
    curation: string;
    seeAll: string;
  };
}

const EDITORIAL_TAGS = ["전체", "지금 뜨는", "숨겨진 명품", "성분 주목", "편집장 픽"];

export default function HomeClient({
  articles,
  products,
  locale,
  dictionary,
}: HomeClientProps) {
  const [activeTag, setActiveTag] = useState("전체");

  const filteredArticles =
    activeTag === "전체"
      ? articles
      : articles.filter((a) => a.tag === activeTag);

  return (
    <>
      {/* Filter chips */}
      <FilterChips
        tags={EDITORIAL_TAGS}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        locale={locale}
      />

      {/* Articles feed */}
      <div className="flex flex-col">
        {filteredArticles.map((article) => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>

      {/* Surface gap */}
      <div className="h-4 bg-surface-container" />

      {/* Featured products */}
      <FeaturedProducts
        products={products}
        locale={locale}
        dictionary={{
          curation: dictionary.curation,
          seeAll: dictionary.seeAll,
        }}
      />
    </>
  );
}
