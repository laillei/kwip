"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getSavedCount } from "@/lib/localSaved";

interface NavLabels {
  explore: string;
  routine: string;
}

interface Props {
  locale: string;
  navLabels: NavLabels;
}

export default function BottomTabBar({ locale, navLabels }: Props) {
  const pathname = usePathname();

  const [savedCount, setSavedCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const update = () => setSavedCount(getSavedCount());
    const onSearchOpen = () => setSearchOpen(true);
    const onSearchClose = () => setSearchOpen(false);
    update();
    window.addEventListener("kwip_saved_updated", update);
    window.addEventListener("storage", update);
    window.addEventListener("kwip_search_open", onSearchOpen);
    window.addEventListener("kwip_search_close", onSearchClose);
    return () => {
      window.removeEventListener("kwip_saved_updated", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("kwip_search_open", onSearchOpen);
      window.removeEventListener("kwip_search_close", onSearchClose);
    };
  }, []);

  const tabs = [
    {
      href: `/${locale}`,
      label: navLabels.explore,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      href: `/${locale}/me`,
      label: navLabels.routine,
      icon: (
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
              {savedCount > 9 ? "9+" : savedCount}
            </span>
          )}
        </div>
      ),
    },
  ];

  // Determine active tab by prefix match
  function isActive(href: string) {
    if (href === `/${locale}`) return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname.startsWith(href);
  }

  if (searchOpen) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-[49px]">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
                active ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {tab.icon}
              <span className="text-xs font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
