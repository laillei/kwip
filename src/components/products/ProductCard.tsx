import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  slug: string;
  name: string;
  category: string;
  image: string;
  locale: string;
}

export default function ProductCard({
  slug,
  name,
  category,
  image,
  locale,
}: ProductCardProps) {
  return (
    <Link
      href={`/${locale}/products/${slug}`}
      className="relative block aspect-[3/4] rounded-xl overflow-hidden group"
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-sm text-white/80 capitalize">{category}</p>
        <p className="text-base font-semibold text-white leading-tight mt-0.5">
          {name}
        </p>
      </div>
    </Link>
  );
}
