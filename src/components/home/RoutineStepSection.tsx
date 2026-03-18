// src/components/home/RoutineStepSection.tsx
import type { Product, Category } from "@/lib/types";
import ProductListItem from "./ProductListItem";

interface RoutineStepSectionProps {
  step: number;
  label: string;
  category: Category;
  products: Product[];
  locale: string;
  getProductReason: (product: Product) => string | undefined;
}

export default function RoutineStepSection({
  step,
  label,
  products,
  locale,
  getProductReason,
}: RoutineStepSectionProps) {
  const loc = locale as "vi" | "en";

  return (
    <section aria-label={label}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{step}</span>
        <span className="text-[15px] font-semibold text-neutral-900">{label}</span>
      </div>
      <div className="space-y-2">
        {products.map((product) => (
          <ProductListItem
            key={product.id}
            slug={product.slug}
            name={product.name[loc] || product.name.vi}
            brand={product.brand}
            category={product.category}
            image={product.image}
            locale={locale}
            reason={getProductReason(product)}
          />
        ))}
      </div>
    </section>
  );
}
