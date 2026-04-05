import BottomTabBar from "./BottomTabBar";
import SavedToast from "@/components/shared/SavedToast";
import { getDictionary } from "@/lib/i18n";
import { type Locale } from "@/lib/i18n";

interface Props {
  children: React.ReactNode;
  locale: string;
  headerRight?: React.ReactNode;
  headerLeft?: React.ReactNode;
  hideHeader?: boolean;
}

export default async function MobileShell({
  children,
  locale,
  headerRight,
  headerLeft,
  hideHeader = false,
}: Props) {
  const dict = await getDictionary(locale as Locale);
  const navLabels = {
    home: dict.nav.home,
    products: dict.nav.products,
    saved: dict.nav.saved,
  };

  return (
    <>
      {/* Compact fixed header — mobile */}
      {!hideHeader && (
        <header
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[375px] z-50 bg-white border-b border-outline"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center">
              {headerLeft ?? (
                <span
                  className="font-black uppercase text-on-surface"
                  style={{
                    fontFamily: "'Noto Serif', serif",
                    fontSize: "20px",
                    letterSpacing: "-1px",
                  }}
                >
                  Kwip
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {headerRight ?? (
                <button
                  type="button"
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] text-on-surface"
                  aria-label="Search"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Content area — padded for header + tab bar on mobile */}
      <div
        role="main"
        className="mobile-shell-main"
        style={{
          paddingTop: hideHeader
            ? "env(safe-area-inset-top)"
            : "calc(56px + env(safe-area-inset-top))",
          paddingBottom: "calc(49px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </div>

      <SavedToast message={dict.home.savedToast} />
      <BottomTabBar locale={locale} navLabels={navLabels} />
    </>
  );
}
