import { redirect } from "next/navigation";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ concern?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { concern, category } = await searchParams;

  const p = new URLSearchParams();
  if (concern && concern !== "all") p.set("concern", concern);
  if (category && category !== "all") p.set("category", category);
  const qs = p.toString();

  redirect(`/${locale}${qs ? `?${qs}` : ""}`);
}
