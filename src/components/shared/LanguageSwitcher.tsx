"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const segments = pathname.split("/");
  const currentLocale = segments[1];
  const targetLocale = currentLocale === "vi" ? "en" : "vi";

  segments[1] = targetLocale;
  const targetPath = segments.join("/");
  const queryString = searchParams.toString();
  const targetHref = queryString ? `${targetPath}?${queryString}` : targetPath;

  return (
    <Link
      href={targetHref}
      className="inline-flex items-center rounded-full bg-neutral-100 p-0.5 text-xs font-medium transition-colors"
    >
      <span className={`rounded-full px-2.5 py-1.5 transition-all duration-200 ${
        currentLocale === "en" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400"
      }`}>
        EN
      </span>
      <span className={`rounded-full px-2.5 py-1.5 transition-all duration-200 ${
        currentLocale === "vi" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400"
      }`}>
        VI
      </span>
    </Link>
  );
}
