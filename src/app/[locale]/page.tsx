import type { Product } from "@/types";
import { getAllProducts } from "@/lib/db";
import { getDictionary, type Locale } from "@/lib/i18n";
import { mockArticles } from "@/data/articles";
import MobileShell from "@/components/layout/MobileShell";
import HomeClient from "@/components/home/HomeClient";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  const rawProducts = await getAllProducts();

  const allProducts = (rawProducts as Product[])
    .filter((p) => {
      const name = (p.name.en || p.name.ko || "").toLowerCase();
      return (
        !name.includes("[deal]") &&
        !name.includes("bundle") &&
        !name.includes("2-pack") &&
        !name.includes("3-pack") &&
        !name.includes(" kit")
      );
    })
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  return (
    <div className="min-h-screen bg-surface">
      <MobileShell locale={locale}>
        <HomeClient
          articles={mockArticles}
          products={allProducts}
          locale={locale}
          dictionary={{
            filterAll: dict.home.filterAll,
            curation: dict.home.curation,
            seeAll: dict.home.seeAll,
          }}
        />
      </MobileShell>
    </div>
  );
}
