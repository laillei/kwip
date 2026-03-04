import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  slug: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  locale: string;
}

export default function ProductCard({
  slug,
  name,
  brand,
  category,
  image,
  locale,
}: ProductCardProps) {
  return (
    <Link
      href={`/${locale}/products/${slug}`}
      className="block rounded-2xl border border-neutral-200 bg-white overflow-hidden transition-shadow hover:shadow-md active:shadow-sm"
    >
      <div className="relative aspect-square bg-neutral-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      <div className="px-3.5 py-3">
        <p className="text-xs text-neutral-400 capitalize">{brand}</p>
        <p className="text-sm font-medium text-neutral-900 leading-snug mt-0.5 line-clamp-2">
          {name}
        </p>
      </div>
    </Link>
  );
}
