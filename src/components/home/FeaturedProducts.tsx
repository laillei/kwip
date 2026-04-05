import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import type { Locale } from "@/lib/i18n";
import { getBrandName } from "@/lib/brands";
import SectionHeader from "./SectionHeader";

interface FeaturedProductsProps {
  products: Product[];
  locale: string;
  dictionary: {
    curation: string;
    seeAll: string;
  };
}

const BADGE_LABELS = ["BEST", "NEW", "EDITOR'S PICK", "SALE"] as const;

export default function FeaturedProducts({
  products,
  locale,
  dictionary,
}: FeaturedProductsProps) {
  const loc = locale as Locale;
  const featured = products.slice(0, 4);

  return (
    <section>
      <SectionHeader
        overline="CURATION"
        title={dictionary.curation}
        actionLabel={dictionary.seeAll}
        actionHref={`/${locale}/products`}
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-4 pb-24 pt-8">
        {featured.map((product, index) => {
          const name =
            product.name[loc] || product.name.ko || product.name.en;
          const badgeLabel =
            product.tags?.[0]?.toUpperCase() ||
            BADGE_LABELS[index % BADGE_LABELS.length];

          return (
            <Link
              key={product.id}
              href={`/${locale}/products/${product.slug}`}
              className="flex flex-col gap-2"
            >
              {/* Product image */}
              <div className="aspect-square bg-surface-high overflow-hidden relative">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary" />
                )}
              </div>

              {/* Brand */}
              <span
                className="text-[11px] text-on-surface-variant uppercase"
                style={{
                  fontFamily:
                    "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
                }}
              >
                {getBrandName(product.brand)}
              </span>

              {/* Product name */}
              <span
                className="text-[13px] font-semibold text-on-surface line-clamp-2"
                style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
              >
                {name}
              </span>

              {/* Badge */}
              <span
                className="bg-surface-variant text-accent px-2 py-0.5 text-[11px] font-bold w-fit"
                style={{
                  fontFamily:
                    "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
                }}
              >
                {badgeLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
