import Image from "next/image";
import Link from "next/link";
import concerns from "@/data/concerns.json";
import type { Product, Concern } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { getBrandName } from "@/lib/brands";
import { t } from "@/lib/getLocalizedData";

const concernLabelMap: Partial<Record<Concern, Record<string, string>>> =
  Object.fromEntries(concerns.map((c) => [c.id, c.label]));

const medalColors = [
  "text-amber-500",   // gold
  "text-neutral-400", // silver
  "text-amber-700",   // bronze
];

interface RankingListProps {
  products: Product[];
  locale: Locale;
}

export default function RankingList({ products, locale }: RankingListProps) {
  const top3 = products.slice(0, 3);
  const rest = products.slice(3);

  return (
    <div className="space-y-3">
      {/* Top 3 — individual cards */}
      {top3.map((product, i) => (
        <Link
          key={product.id}
          href={`/${locale}/products/${product.slug}`}
          className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4 transition-all duration-200 hover:shadow-lg active:scale-[0.99]"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <span className={`text-2xl font-bold ${medalColors[i]} shrink-0 w-9 text-center`}>
            {i + 1}
          </span>
          <div className="relative w-16 h-16 shrink-0 rounded-xl bg-neutral-50 overflow-hidden">
            <Image
              src={product.image}
              alt={product.name[locale] || product.name.vi}
              fill
              className="object-contain p-2"
              sizes="64px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-neutral-500 tracking-wide uppercase">
              {getBrandName(product.brand)}
            </p>
            <p className="text-sm font-semibold text-neutral-900 leading-snug mt-0.5 line-clamp-2">
              {product.name[locale] || product.name.vi}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="rounded-full bg-neutral-100 text-neutral-500 px-2 py-0.5 text-xs font-medium">
                {product.category}
              </span>
              {product.concerns.slice(0, 2).map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-0.5 text-xs font-medium"
                >
                  {concernLabelMap[c] ? t(concernLabelMap[c], locale) : c}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}

      {/* Rank 4+ — compact rows in one grouped card */}
      {rest.length > 0 && (
        <div
          className="rounded-2xl bg-white overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
        >
          {rest.map((product, i) => {
            const rank = i + 4;
            const isNew = product.popularity.rank >= 100;
            return (
              <Link
                key={product.id}
                href={`/${locale}/products/${product.slug}`}
                className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 active:bg-neutral-100 ${
                  i < rest.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                <span className="w-8 text-center text-sm font-semibold text-neutral-400 shrink-0">
                  {rank}
                </span>
                <div className="relative w-12 h-12 shrink-0 rounded-lg bg-neutral-50 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name[locale] || product.name.vi}
                    fill
                    className="object-contain p-1.5"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-neutral-500 tracking-wide uppercase">
                    {getBrandName(product.brand)}
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 leading-snug mt-0.5 line-clamp-1">
                    {product.name[locale] || product.name.vi}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.concerns.slice(0, 2).map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-0.5 text-xs font-medium"
                      >
                        {concernLabelMap[c] ? t(concernLabelMap[c], locale) : c}
                      </span>
                    ))}
                  </div>
                </div>
                {isNew && (
                  <span className="shrink-0 rounded-full bg-rose-50 text-rose-600 px-2 py-0.5 text-xs font-medium">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
