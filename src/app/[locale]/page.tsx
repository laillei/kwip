import Link from "next/link";
import products from "@/data/products.json";
import { getDictionary, type Locale } from "@/lib/i18n";
import ProductCard from "@/components/products/ProductCard";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const shuffledProducts = shuffle(products);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-4">
        <span className="text-lg font-bold tracking-tight">Kwip</span>
        <Link
          href={`/${locale}/products`}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          {dict.home.viewMore} →
        </Link>
      </header>

      {/* Product grid */}
      <main className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {shuffledProducts.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name[locale as Locale] || product.name.vi}
              category={product.category}
              image={product.image}
              locale={locale}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
