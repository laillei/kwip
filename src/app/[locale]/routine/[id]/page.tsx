import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import type { Routine, RoutineProduct } from "@/lib/types";

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const routine = data as unknown as Routine;
  const loc = locale as "vi" | "en";
  const allProducts = products as Product[];

  const routineProducts = (routine.products as RoutineProduct[])
    .sort((a, b) => a.step - b.step)
    .map((rp) => ({
      ...rp,
      product: allProducts.find((p) => p.id === rp.productId),
    }))
    .filter((rp): rp is typeof rp & { product: Product } => !!rp.product);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link
          href={`/${locale}/me`}
          className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 block"
        >
          {loc === "vi" ? "← Routine của tôi" : "← My Routines"}
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          {routine.name}
        </h1>
        <p className="text-sm text-neutral-500 mb-8">{routine.concern}</p>

        <div className="space-y-6">
          {routineProducts.map((rp) => (
            <div key={rp.productId} className="flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-400 w-5 text-center">
                {rp.step}
              </span>
              <Image
                src={rp.product.image}
                alt={rp.product.name[loc] ?? rp.product.name.vi}
                width={56}
                height={56}
                className="rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {rp.product.name[loc] ?? rp.product.name.vi}
                </p>
                <p className="text-xs text-neutral-500">{rp.product.brand}</p>
              </div>
              <Link
                href={`/${locale}/products/${rp.product.slug}`}
                className="text-xs text-neutral-400 hover:text-neutral-900 flex-shrink-0"
              >
                →
              </Link>
            </div>
          ))}
        </div>

        <p className="text-xs text-neutral-400 text-center mt-12">
          {loc === "vi"
            ? "Routine của tôi — được xây dựng dựa trên thành phần, không phải quảng cáo."
            : "My routine — built on ingredient science, not ads."}
        </p>
        <p className="text-xs text-neutral-400 text-center mt-1 font-medium">
          kwip.app
        </p>
      </div>
    </div>
  );
}
