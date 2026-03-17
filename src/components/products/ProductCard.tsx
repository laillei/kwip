import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/types";
import { getBrandName } from "@/lib/brands";

interface ProductCardProps {
  slug: string;
  name: string;
  brand: Brand;
  category: string;
  image: string;
  locale: string;
  reason?: string;
}

export default function ProductCard({
  slug,
  name,
  brand,
  image,
  locale,
  reason,
}: ProductCardProps) {
  return (
    <Link
      href={`/${locale}/products/${slug}`}
      className="group block rounded-2xl bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:shadow-sm"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-5 relative z-[1] transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="px-3.5 pt-3 pb-3.5">
        <p className="text-[13px] font-medium text-neutral-500 tracking-wide uppercase">
          {getBrandName(brand)}
        </p>
        <p className="text-[15px] font-semibold text-neutral-900 leading-snug mt-1 line-clamp-2">
          {name}
        </p>
        {reason && (
          <p className="text-[13px] text-neutral-500 mt-1.5 line-clamp-1">
            {reason}
          </p>
        )}
      </div>
    </Link>
  );
}
