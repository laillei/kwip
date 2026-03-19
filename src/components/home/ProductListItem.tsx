"use client";

import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

interface ProductListItemProps {
  slug: string;
  name: string;
  brand: string;
  category: Category;
  image: string | null;
  locale: string;
  reason?: string;
}

export default function ProductListItem({
  slug,
  name,
  brand,
  image,
  locale,
  reason,
}: ProductListItemProps) {
  return (
    <Link href={`/${locale}/products/${slug}`} className="block active:opacity-70 transition-opacity">
      {/* Image */}
      <div className="relative w-full aspect-square rounded-xl bg-neutral-100 overflow-hidden mb-2">
        {image ? (
          <Image
            src={image}
            alt={`${brand} ${name}`}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100" />
        )}
      </div>

      {/* Text */}
      <p className="text-xs text-neutral-400 mb-0.5">{brand}</p>
      <p className="text-[13px] font-semibold text-neutral-900 leading-snug line-clamp-2">{name}</p>
      {reason && (
        <p className="text-xs text-emerald-600 mt-1 line-clamp-1">{reason}</p>
      )}
    </Link>
  );
}
