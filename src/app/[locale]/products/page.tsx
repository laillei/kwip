import { getAllProducts, getAllIngredients } from "@/lib/db";
import { getDictionary, type Locale } from "@/lib/i18n";
import MobileShell from "@/components/layout/MobileShell";
import ProductsClient from "@/components/products/ProductsClient";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [products, ingredientsList, dict] = await Promise.all([
    getAllProducts(),
    getAllIngredients(),
    getDictionary(locale as Locale),
  ]);

  // Build ingredient ID → Korean name map
  const ingredientNames: Record<string, string> = {};
  for (const ing of ingredientsList) {
    const ko = ing.name.ko || "";
    if (ko.startsWith("PDRN")) {
      ingredientNames[ing.id] = "PDRN";
    } else {
      ingredientNames[ing.id] = ko || ing.name.inci;
    }
  }

  return (
    <MobileShell locale={locale}>
      <div className="min-h-screen bg-surface">
        <ProductsClient
          products={products}
          locale={locale}
          dictionary={dict}
          ingredientNames={ingredientNames}
        />
      </div>
    </MobileShell>
  );
}
