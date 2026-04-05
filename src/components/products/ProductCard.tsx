import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/types";
import { getBrandName } from "@/lib/brands";
import BookmarkButton from "@/components/shared/BookmarkButton";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  image: string;
  locale: string;
  ingredientChips?: string[];
}

export default function ProductCard({
  id,
  slug,
  name,
  brand,
  image,
  locale,
  ingredientChips,
}: ProductCardProps) {
  return (
    <div className="relative">
      <Link
        href={`/${locale}/products/${slug}`}
        className="group block"
      >
        <div className="relative aspect-square bg-surface-variant border border-outline overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-5 relative z-[1] transition-transform duration-300 group-hover:scale-105"
            sizes="50vw"
          />
        </div>
        <div className="pt-3">
          <p
            className="text-[11px] text-on-surface-variant uppercase tracking-wide"
            style={{
              fontFamily:
                "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
            }}
          >
            {getBrandName(brand)}
          </p>
          <p className="text-[13px] font-semibold text-on-surface leading-snug mt-1 line-clamp-2">
            {name}
          </p>
          {ingredientChips && ingredientChips.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {ingredientChips.map((label) => (
                <span
                  key={label}
                  className="bg-surface-variant text-on-surface-variant rounded-full px-2 py-0.5 text-[10px]"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <div className="absolute top-0 right-0 z-10">
        <BookmarkButton productId={id} />
      </div>
    </div>
  );
}
