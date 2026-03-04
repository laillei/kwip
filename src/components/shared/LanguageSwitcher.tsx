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
      className="text-sm transition-colors"
    >
      <span className={currentLocale === "en" ? "text-neutral-900 font-medium" : "text-neutral-400"}>EN</span>
      <span className="text-neutral-300 mx-1">|</span>
      <span className={currentLocale === "vi" ? "text-neutral-900 font-medium" : "text-neutral-400"}>VI</span>
    </Link>
  );
}
