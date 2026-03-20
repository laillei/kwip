import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import type { Product, Ingredient } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";

// Routine steps in application order
const ROUTINE_STEPS = [
  { category: "cleanser", label: "Làm sạch" },
  { category: "pad", label: "Tẩy tế bào chết" },
  { category: "toner", label: "Nước hoa hồng" },
  { category: "essence", label: "Tinh chất" },
  { category: "serum", label: "Serum" },
  { category: "ampoule", label: "Tinh chất cô đặc" },
  { category: "mask", label: "Mặt nạ" },
  { category: "cream", label: "Dưỡng ẩm" },
  { category: "sunscreen", label: "Chống nắng" },
];

const fontRegular = readFileSync(
  join(process.cwd(), "public/fonts/NotoSans-Regular.ttf")
);
const fontBold = readFileSync(
  join(process.cwd(), "public/fonts/NotoSans-Bold.ttf")
);

export async function GET(req: NextRequest) {
  const concernId = req.nextUrl.searchParams.get("concern");
  if (!concernId) return new Response("Missing concern param", { status: 400 });

  const locale = req.nextUrl.searchParams.get("locale") ?? "vi";

  const supabase = createServerSupabaseClient();
  const [productsRes, ingredientsRes, concernRes] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("ingredients").select("*"),
    supabase.from("concerns").select("*").eq("id", concernId).single(),
  ]);

  if (!concernRes.data) return new Response("Concern not found", { status: 404 });

  const allProducts = (productsRes.data ?? []) as Product[];
  const allIngredients = (ingredientsRes.data ?? []) as Ingredient[];
  const concern = concernRes.data;

  const ingredients = allIngredients;
  const products = allProducts
    .filter((p) => {
      const name = (p.name.en || p.name.vi || "").toLowerCase();
      return (
        (p.concerns as string[]).includes(concernId) &&
        !name.includes("[deal]") &&
        !name.includes("bundle") &&
        !name.includes("2-pack") &&
        !name.includes("3-pack") &&
        !name.includes(" kit")
      );
    })
    .sort((a, b) => a.popularity.rank - b.popularity.rank);

  // Get up to 3 key ingredients with their reason for this concern
  const keyIngredients: { name: string; reason: string }[] = concern.key_ingredients
    .slice(0, 3)
    .map((id: string) => {
      const ing = ingredients.find((i) => i.id === id);
      if (!ing) return null;
      const effect = ing.effects.find(
        (e) => e.concern === concernId && e.type === "good"
      );
      if (!effect) return null;
      return {
        name: locale === "vi" ? ing.name.vi : ing.name.inci,
        reason: effect.reason[locale as "vi" | "en"] ?? effect.reason.vi,
      };
    })
    .filter((i: { name: string; reason: string } | null): i is { name: string; reason: string } => i !== null)
    .slice(0, 3);

  // Get top 2 products per routine step
  const routineGroups = ROUTINE_STEPS.map((step) => ({
    label: step.label,
    products: products
      .filter((p) => p.category === step.category)
      .slice(0, 2)
      .map((p) => locale === "en" ? (p.name.en || p.name.vi || "") : (p.name.vi || p.name.en || "")),
  })).filter((g) => g.products.length > 0);

  const concernLabel = concern.label[locale as "vi" | "en"] ?? concern.label.vi;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          backgroundColor: "#FAFAFA",
          display: "flex",
          flexDirection: "column",
          padding: "72px 64px",
          fontFamily: "Noto Sans",
          gap: 0,
        }}
      >
        {/* Header: Kwip logo */}
        <div style={{ display: "flex", marginBottom: "48px" }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: "#171717" }}>
            Kwip
          </span>
        </div>

        {/* Concern label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "48px",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "#A3A3A3",
              marginBottom: "12px",
            }}
          >
            {locale === "vi" ? "Routine cho da" : "Routine for"}
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#171717",
              lineHeight: 1.1,
            }}
          >
            {concernLabel}
          </span>
        </div>

        {/* Key ingredients section */}
        {keyIngredients.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#171717",
              borderRadius: 24,
              padding: "36px 40px",
              marginBottom: "32px",
              gap: 24,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#A3A3A3",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {locale === "vi" ? "Thành phần chính" : "Key Ingredients"}
            </span>
            {keyIngredients.map((ing, i) => (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <span style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF" }}>
                  {ing.name}
                </span>
                <span style={{ fontSize: 24, fontWeight: 400, color: "#A3A3A3" }}>
                  {ing.reason}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Routine steps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            flex: 1,
            overflow: "hidden",
          }}
        >
          {routineGroups.slice(0, 6).map((group, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "24px 36px",
                borderBottom:
                  i < Math.min(routineGroups.length, 6) - 1
                    ? "1px solid #F5F5F5"
                    : "none",
                gap: 24,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  color: "#A3A3A3",
                  width: "200px",
                  flexShrink: 0,
                  paddingTop: "4px",
                }}
              >
                {group.label}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  flex: 1,
                }}
              >
                {group.products.map((name, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: 24,
                      fontWeight: j === 0 ? 700 : 400,
                      color: j === 0 ? "#171717" : "#737373",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Watermark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginTop: "32px",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: "#171717" }}>
            kwip.app
          </span>
          <span style={{ fontSize: 18, fontWeight: 400, color: "#A3A3A3" }}>
            {locale === "vi" ? "Được xây dựng dựa trên thành phần, không phải quảng cáo." : "Built on ingredient science, not ads."}
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
