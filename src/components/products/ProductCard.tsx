import Image from "next/image";
import Link from "next/link";
import type { Brand, EditorialTag } from "@/types";
import { getBrandName } from "@/lib/brands";
import BookmarkButton from "@/components/shared/BookmarkButton";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  image: string;
  locale: string;
  editorialTag?: EditorialTag;
}

export default function ProductCard({
  id,
  slug,
  name,
  brand,
  image,
  locale,
  editorialTag,
}: ProductCardProps) {
  return (
    <div className="relative">
      <Link
        href={`/${locale}/products/${slug}`}
        className="group block"
      >
        <div className="relative aspect-square bg-surface-high rounded-xl overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-5 relative z-[1] transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
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
          {editorialTag && (
            <span className="inline-block mt-2 bg-secondary-container text-on-secondary-container rounded-full px-2 py-0.5 text-[11px] font-bold w-fit">
              {editorialTag}
            </span>
          )}
        </div>
      </Link>
      {/* Bookmark overlay */}
      <div className="absolute top-0 right-0 z-10">
        <BookmarkButton productId={id} />
      </div>
    </div>
  );
}
