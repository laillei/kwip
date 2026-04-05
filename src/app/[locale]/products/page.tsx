import { getAllProducts } from "@/lib/db";
import { getDictionary, type Locale } from "@/lib/i18n";
import MobileShell from "@/components/layout/MobileShell";
import ProductsClient from "@/components/products/ProductsClient";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [products, dict] = await Promise.all([
    getAllProducts(),
    getDictionary(locale as Locale),
  ]);

  return (
    <MobileShell locale={locale}>
      <div className="min-h-screen bg-surface">
        <div className="max-w-3xl mx-auto">
          <ProductsClient
            products={products}
            locale={locale}
            dictionary={dict}
          />
        </div>
      </div>
    </MobileShell>
  );
}
