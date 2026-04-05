"use client";

import { useState } from "react";
import type { Article } from "@/types/article";
import type { Product } from "@/types";
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

const HOME_TABS = ["전체", "최근"];

export default function HomeClient({
  articles,
  products,
  locale,
  dictionary,
}: HomeClientProps) {
  const [activeTab, setActiveTab] = useState("전체");

  return (
    <>
      {/* Primary tabs */}
      <div className="flex border-b border-outline bg-white sticky top-14 z-40">
        {HOME_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`h-11 px-4 flex items-center whitespace-nowrap text-[13px] border-b-2 transition-colors ${
              activeTab === tab
                ? "font-semibold text-black border-black"
                : "font-medium text-[#A3A3A3] border-transparent"
            }`}
            style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Articles feed */}
      <div className="flex flex-col">
        {articles.map((article) => (
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
