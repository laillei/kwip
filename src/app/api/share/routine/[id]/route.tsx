import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import allProducts from "@/data/products.json";
import type { Routine, RoutineProduct, Product } from "@/lib/types";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return new Response("Routine not found", { status: 404 });
  }

  const routine = data as unknown as Routine;
  const products = allProducts as Product[];

  const routineProducts = (routine.products as RoutineProduct[])
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
          backgroundColor: "#171717",
          display: "flex",
          flexDirection: "column",
          padding: "80px 72px",
          fontFamily: "Noto Sans",
        }}
      >
        {/* Header: kwip wordmark + concern badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "60px",
          }}
        >
          <span
            style={{ fontSize: 48, fontWeight: 700, color: "white" }}
          >
            kwip
          </span>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 12,
              padding: "8px 20px",
              display: "flex",
            }}
          >
            <span
              style={{ fontSize: 28, fontWeight: 400, color: "white" }}
            >
              {CONCERN_LABELS[routine.concern] ?? routine.concern}
            </span>
          </div>
        </div>

        {/* Routine name */}
        <div style={{ display: "flex", marginBottom: "60px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
            }}
          >
            {routine.name}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.1)",
            marginBottom: "40px",
            display: "flex",
          }}
        />

        {/* Routine steps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {routineProducts.map((rp, index) => (
            <div
              key={rp.productId}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 32,
                  paddingTop: 24,
                  paddingBottom: 24,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 400,
                    color: "#737373",
                    width: 40,
                    flexShrink: 0,
                    paddingTop: 4,
                    display: "flex",
                  }}
                >
                  {rp.step}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 400,
                      color: "#737373",
                    }}
                  >
                    {CATEGORY_NAMES[rp.category] ?? rp.category}
                  </span>
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {rp.product.name.vi ?? rp.product.name.en}
                  </span>
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 400,
                      color: "#737373",
                    }}
                  >
                    {rp.product.brand}
                  </span>
                </div>
              </div>
              {index < routineProducts.length - 1 && (
                <div
                  style={{
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    display: "flex",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
            kwip.app
          </span>
          <span style={{ fontSize: 22, fontWeight: 400, color: "#737373" }}>
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
