import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import type { Locale } from "@/lib/i18n";
import { getBrandName } from "@/lib/brands";

interface InlineProductCardProps {
  product: Product;
  locale: string;
}

export default function InlineProductCard({
  product,
  locale,
}: InlineProductCardProps) {
  const loc = locale as Locale;
  const name = product.name[loc] || product.name.ko;

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="flex gap-3 p-4 border-b border-outline-variant items-center"
    >
      <div className="w-16 h-16 bg-surface-container flex-shrink-0 overflow-hidden relative">
        {product.image ? (
          <Image
            src={product.image}
            alt={name}
            fill
            className="object-contain p-1"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[11px] text-on-surface-variant uppercase tracking-wide"
          style={{
            fontFamily:
              "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
          }}
        >
          {getBrandName(product.brand)}
        </p>
        <p className="text-[13px] font-semibold text-on-surface mt-0.5 line-clamp-2">
          {name}
        </p>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-on-surface-variant flex-shrink-0"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
