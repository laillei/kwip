import Link from "next/link";
import { notFound } from "next/navigation";
import products from "@/data/products.json";
import ingredientsData from "@/data/ingredients.json";
import type { Product, Ingredient } from "@/lib/types";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  return (
    <div className="min-h-screen pb-24">
      {/* Back button */}
      <header className="px-4 py-4">
        <Link
          href={`/products?concern=${product.concerns[0]}`}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          ← Quay lại
        </Link>
      </header>

      <main className="px-4">
        {/* Product info */}
        <h1 className="text-xl font-bold leading-tight">
          {product.name.vi}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {product.brand} · {product.category}
        </p>

        {/* Key ingredients */}
        <section className="mt-8">
          <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Thành phần chính
          </h2>
          <div className="flex flex-col gap-2">
            {keyIngredients.map(({ detail }) => (
              <div
                key={detail.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
              >
                <p className="text-sm font-medium">{detail.name.inci}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {detail.name.vi}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  {detail.description.vi}
                </p>
                {detail.effects.length > 0 && (
                  <div className="flex flex-col gap-1 mt-2">
                    {detail.effects.map((effect) => (
                      <span
                        key={effect.concern}
                        className={`text-xs ${
                          effect.type === "good"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {effect.type === "good" ? "✓" : "⚠"} {effect.reason.vi}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Full ingredient list */}
        <section className="mt-8">
          <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Tất cả thành phần
          </h2>
          <div className="flex flex-col divide-y divide-neutral-800">
            {allIngredients.map(({ ingredientId, order, detail }) => (
              <div key={ingredientId} className="flex items-start gap-3 py-3">
                <span className="text-xs text-neutral-600 w-5 shrink-0 pt-0.5 text-right">
                  {order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{detail.name.inci}</p>
                  <p className="text-xs text-neutral-500">{detail.name.vi}</p>
                  {detail.effects.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {detail.effects.map((effect) => (
                        <span
                          key={effect.concern}
                          className={`text-xs ${
                            effect.type === "good"
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {effect.type === "good" ? "✓" : "⚠"}{" "}
                          {effect.reason.vi}
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
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-neutral-800 p-4">
          <div className="flex gap-2 max-w-lg mx-auto">
            {purchaseLinks.map(({ platform, url }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-white text-black text-center text-sm font-medium py-3 transition-opacity hover:opacity-90 active:opacity-80"
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
