"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onSearchOpen = () => setSearchOpen(true);
    const onSearchClose = () => setSearchOpen(false);
    window.addEventListener("kwip_search_open", onSearchOpen);
    window.addEventListener("kwip_search_close", onSearchClose);
    return () => {
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8V21H3V8" />
          <rect x="1" y="3" width="22" height="5" rx="1" />
          <path d="M10 12h4" />
        </svg>
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
              <span className={`text-xs leading-none ${active ? "font-semibold" : "font-normal"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
