import Link from "next/link";
import { headers } from "next/headers";

export default async function NotFound() {
  const headersList = await headers();
  const url = headersList.get("x-url") || headersList.get("referer") || "";
  const locale = url.includes("/en/") || url.endsWith("/en") ? "en" : "vi";
  const isEn = locale === "en";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <p className="text-6xl font-bold text-neutral-200">404</p>
      <p className="mt-3 text-sm text-neutral-400">
        {isEn ? "Page not found" : "Trang không tồn tại"}
      </p>
      <Link
        href={`/${locale}`}
        className="mt-6 rounded-full bg-neutral-900 text-white text-sm font-medium px-6 py-2.5 transition-all duration-200 hover:bg-neutral-800 active:scale-[0.98]"
      >
        {isEn ? "Back to home" : "Về trang chủ"}
      </Link>
    </main>
  );
}
