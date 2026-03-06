"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ViewToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isRanking = searchParams.get("view") === "ranking";

  const params = new URLSearchParams(searchParams.toString());
  if (isRanking) {
    params.delete("view");
  } else {
    params.set("view", "ranking");
  }
  const query = params.toString();
  const href = query ? `${pathname}?${query}` : pathname;

  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 text-neutral-500 transition-colors active:bg-neutral-200"
      aria-label={isRanking ? "Grid view" : "Ranking view"}
    >
      {isRanking ? (
        /* Grid icon */
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
          <rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
          <rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
          <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
        </svg>
      ) : (
        /* List icon */
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="2" width="3" height="3" rx="0.75" fill="currentColor" />
          <rect x="6" y="2.75" width="11" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="1" y="7.5" width="3" height="3" rx="0.75" fill="currentColor" />
          <rect x="6" y="8.25" width="11" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="1" y="13" width="3" height="3" rx="0.75" fill="currentColor" />
          <rect x="6" y="13.75" width="11" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      )}
    </Link>
  );
}
