import Link from "next/link";
import { headers } from "next/headers";

export default async function NotFound() {
  // Try to detect locale from the request URL
  const headersList = await headers();
  const url = headersList.get("x-url") || headersList.get("referer") || "";
  const locale = url.includes("/en/") || url.endsWith("/en") ? "en" : "vi";

  const isEn = locale === "en";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-sm text-neutral-400">
        {isEn ? "Page not found" : "Trang không tồn tại"}
      </p>
      <Link
        href={`/${locale}`}
        className="mt-6 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        {isEn ? "← Back to home" : "← Về trang chủ"}
      </Link>
    </main>
  );
}
