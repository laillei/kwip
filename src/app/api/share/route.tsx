import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import type { RoutineProduct, Product } from "@/lib/types";
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
  acne: "Mụn",
  pores: "Lỗ chân lông",
  hydration: "Cấp ẩm",
  brightening: "Sáng da",
  soothing: "Dịu da",
  "anti-aging": "Chống lão hóa",
  "sun-protection": "Chống nắng",
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

  let payload: { name: string; concern: string; products: RoutineProduct[] };
  try {
    payload = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return new Response("Invalid data param", { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data: productsData } = await supabase.from("products").select("*");
  const products = (productsData ?? []) as Product[];

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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", marginBottom: "52px" }}>
            <span style={{ fontSize: 44, fontWeight: 700, color: "#171717" }}>
              Kwip
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", marginBottom: "40px", gap: 12 }}
          >
            <span
              style={{
                fontSize: 60,
                fontWeight: 700,
                color: "#171717",
                lineHeight: 1.15,
                wordBreak: "break-all",
              }}
            >
              {payload.name}
            </span>
            <span style={{ fontSize: 28, fontWeight: 400, color: "#A3A3A3" }}>
              {"Routine cho da " + (CONCERN_LABELS[payload.concern] ?? payload.concern).toLowerCase()}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRadius: 24,
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
                      gap: 28,
                      padding: "28px 36px",
                    }}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        width={88}
                        height={88}
                        style={{
                          borderRadius: 16,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 16,
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
                        gap: 4,
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: 24, fontWeight: 400, color: "#A3A3A3" }}>
                        {CATEGORY_NAMES[rp.category] ?? rp.category}
                      </span>
                      <span style={{ fontSize: 30, fontWeight: 700, color: "#171717" }}>
                        {rp.product.name.vi ?? rp.product.name.en}
                      </span>
                      <span style={{ fontSize: 24, fontWeight: 400, color: "#A3A3A3" }}>
                        {rp.product.brand}
                      </span>
                    </div>
                  </div>
                  {index < routineProducts.length - 1 && (
                    <div
                      style={{
                        height: 1,
                        backgroundColor: "#F5F5F5",
                        marginLeft: 36,
                        marginRight: 36,
                        display: "flex",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#171717" }}>
            Kwip
          </span>
          <span style={{ fontSize: 22, fontWeight: 400, color: "#A3A3A3" }}>
            Được xây dựng dựa trên thành phần, không phải quảng cáo.
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
