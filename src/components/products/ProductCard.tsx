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
  rank: number;
}

export default function ProductCard({
  slug,
  name,
  brand,
  image,
  locale,
  rank,
}: ProductCardProps) {
  return (
    <Link
      href={`/${locale}/products/${slug}`}
      className="group block rounded-2xl bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:shadow-sm"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        {/* Large watermark rank number */}
        <span className="absolute inset-0 flex items-center justify-center text-[80px] font-black text-neutral-200/40 select-none pointer-events-none leading-none">
          {rank}
        </span>
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-5 relative z-[1] transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="px-3.5 pt-3 pb-3.5">
        <p className="text-[11px] font-medium tracking-wide text-neutral-400 uppercase">
          {getBrandName(brand)}
        </p>
        <p className="text-[13px] font-medium text-neutral-900 leading-snug mt-1 line-clamp-2">
          {name}
        </p>
      </div>
    </Link>
  );
}
