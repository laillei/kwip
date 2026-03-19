import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import type { RoutineProduct, Product, Concern } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";

const CATEGORY_NAMES: Record<string, string> = {
  cleanser: "Sữa rửa mặt",
  pad: "Pad",
  toner: "Nước hoa hồng",
  essence: "Tinh chất",
  serum: "Serum",
  ampoule: "Tinh chất cô đặc",
  mask: "Mặt nạ",
  cream: "Kem",
  sunscreen: "Chống nắng",
};

const CONCERN_LABELS: Record<string, string> = {
  trouble: "Mụn",
  hydration: "Cấp ẩm",
  moisture: "Dưỡng ẩm",
  pores: "Lỗ chân lông",
  brightening: "Sáng da",
  "anti-aging": "Chống lão hóa",
  soothing: "Dịu da",
  exfoliation: "Tẩy da chết",
};

const fontRegular = readFileSync(
  join(process.cwd(), "public/fonts/NotoSans-Regular.ttf")
);
const fontBold = readFileSync(
  join(process.cwd(), "public/fonts/NotoSans-Bold.ttf")
);

function resolveImageSrc(imagePath: string): string {
  if (imagePath.startsWith("http")) return imagePath;
  try {
    const buf = readFileSync(join(process.cwd(), "public", imagePath));
    const mime = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("data");
  if (!raw) {
    return new Response("Missing data param", { status: 400 });
  }

  let payload: { name: string; concern: Concern; products: RoutineProduct[] };
  try {
    payload = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return new Response("Invalid data param", { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data: productsData } = await supabase.from("products").select("*");
  const products = (productsData ?? []) as Product[];

  // Fetch concern's key ingredient IDs
  const { data: concernData } = await supabase
    .from("concerns")
    .select("key_ingredients")
    .eq("id", payload.concern)
    .single();

  const keyIngredientIds: string[] = concernData?.key_ingredients ?? [];

  // Fetch INCI names for up to 3 key ingredients
  let ingredientsLine = "";
  if (keyIngredientIds.length > 0) {
    const { data: ingredientData } = await supabase
      .from("ingredients")
      .select("name")
      .in("id", keyIngredientIds.slice(0, 3));
    if (ingredientData && ingredientData.length > 0) {
      ingredientsLine = (ingredientData as { name: { inci: string } }[])
        .map((i) => i.name.inci)
        .join(" · ");
    }
  }

  const routineProducts = payload.products
    .sort((a, b) => a.step - b.step)
    .map((rp) => ({
      ...rp,
      product: products.find((p) => p.id === rp.productId),
    }))
    .filter(
      (rp): rp is typeof rp & { product: Product } => !!rp.product
    );

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          backgroundColor: "#FAFAFA",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 64px",
          fontFamily: "Noto Sans",
        }}
      >
        {/* Top: header + product list */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Kwip overline */}
          <div style={{ display: "flex", marginBottom: "40px" }}>
            <span style={{ fontSize: 28, fontWeight: 400, color: "#A3A3A3" }}>
              Kwip
            </span>
          </div>

          {/* Hero: routine name + concern + ingredients */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "48px",
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "#171717",
                lineHeight: 1.1,
                wordBreak: "break-all",
              }}
            >
              {payload.name}
            </span>
            <span style={{ fontSize: 28, fontWeight: 400, color: "#A3A3A3" }}>
              {"Routine cho da " +
                (CONCERN_LABELS[payload.concern] ?? payload.concern).toLowerCase()}
            </span>
            {ingredientsLine ? (
              <span style={{ fontSize: 26, fontWeight: 400, color: "#A3A3A3" }}>
                {ingredientsLine}
              </span>
            ) : null}
          </div>

          {/* Product list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRadius: 28,
            }}
          >
            {routineProducts.map((rp, index) => {
              const imgSrc = resolveImageSrc(rp.product.image);
              return (
                <div
                  key={rp.productId}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 32,
                      padding: "36px 40px",
                    }}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        width={112}
                        height={112}
                        style={{
                          borderRadius: 20,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 112,
                          height: 112,
                          borderRadius: 20,
                          backgroundColor: "#F5F5F5",
                          flexShrink: 0,
                          display: "flex",
                        }}
                      />
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        flex: 1,
                      }}
                    >
                      <span
                        style={{ fontSize: 24, fontWeight: 400, color: "#A3A3A3" }}
                      >
                        {CATEGORY_NAMES[rp.category] ?? rp.category}
                      </span>
                      <span
                        style={{ fontSize: 32, fontWeight: 700, color: "#171717" }}
                      >
                        {rp.product.name.vi ?? rp.product.name.en}
                      </span>
                      <span
                        style={{ fontSize: 24, fontWeight: 400, color: "#A3A3A3" }}
                      >
                        {rp.product.brand}
                      </span>
                    </div>
                  </div>
                  {index < routineProducts.length - 1 ? (
                    <div
                      style={{
                        height: 1,
                        backgroundColor: "#F5F5F5",
                        marginLeft: 40,
                        marginRight: 40,
                        display: "flex",
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#171717" }}>
            Kwip
          </span>
          <span style={{ fontSize: 22, fontWeight: 400, color: "#A3A3A3" }}>
            Được xây dựng dựa trên thành phần, không phải quảng cáo.
          </span>
          <span style={{ fontSize: 22, fontWeight: 400, color: "#A3A3A3" }}>
            kwip.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: "Noto Sans", data: fontRegular, weight: 400 },
        { name: "Noto Sans", data: fontBold, weight: 700 },
      ],
    }
  );
}
