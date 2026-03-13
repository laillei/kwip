import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getDictionary, type Locale } from "@/lib/i18n";
import products from "@/data/products.json";
import concerns from "@/data/concerns.json";
import type { Product } from "@/lib/types";
import RoutineBuilderClient from "@/components/routine/RoutineBuilderClient";

export default async function RoutineNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ concern?: string }>;
}) {
  const { locale } = await params;
  const { concern } = await searchParams;
  const session = await getServerSession();

  if (!session?.user) {
    redirect(`/${locale}`);
  }

  if (!concern) {
    redirect(`/${locale}`);
  }

  const dict = await getDictionary(locale as Locale);
  const allProducts = (products as Product[]).filter((p) => {
    const name = (p.name.en || p.name.vi || "").toLowerCase();
    return (
      !name.includes("[deal]") &&
      !name.includes("bundle") &&
      !name.includes("2-pack") &&
      !name.includes("3-pack") &&
      !name.includes(" kit")
    );
  });

  const concernData = concerns.find((c) => c.id === concern);
  const concernLabel =
    locale === "vi"
      ? concernData?.label?.vi
      : concernData?.label?.en;

  return (
    <RoutineBuilderClient
      locale={locale}
      concern={concern}
      concernLabel={concernLabel}
      products={allProducts}
      dict={dict.routine}
    />
  );
}
