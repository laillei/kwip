// src/components/home/ProductListItem.tsx
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
  category,
  image,
  locale,
  reason,
}: ProductListItemProps) {
  return (
    <Link
      href={`/${locale}/products/${slug}`}
      className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 min-h-[80px] active:scale-[0.99] transition-transform"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div className="shrink-0 w-[72px] h-[72px] rounded-xl bg-neutral-50 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={`${brand} ${name}`}
            width={72}
            height={72}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-50" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 mb-0.5">{brand}</p>
        <p className="text-[15px] font-semibold text-neutral-900 leading-tight line-clamp-2">{name}</p>
        {reason && (
          <p className="text-xs text-emerald-600 mt-1 line-clamp-1">{reason}</p>
        )}
      </div>
      <svg className="shrink-0 text-neutral-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
