"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract current locale from pathname (first segment)
  const segments = pathname.split("/");
  const currentLocale = segments[1]; // "vi" or "en"
  const targetLocale = currentLocale === "vi" ? "en" : "vi";

  // Replace locale segment in path
  segments[1] = targetLocale;
  const targetPath = segments.join("/");

  // Preserve query parameters
  const queryString = searchParams.toString();
  const targetHref = queryString ? `${targetPath}?${queryString}` : targetPath;

  return (
    <Link
      href={targetHref}
      className="fixed top-4 right-4 z-50 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
    >
      {targetLocale === "en" ? "EN" : "VI"}
    </Link>
  );
}
