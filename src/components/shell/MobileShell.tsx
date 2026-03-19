import { Suspense } from "react";
import BottomTabBar from "./BottomTabBar";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
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
    explore: dict.nav.explore,
    routine: dict.nav.routine,
  };

  return (
    <>
      {/* Compact fixed header — mobile */}
      {!hideHeader && (
        <header
          className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md md:hidden"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center">
              {headerLeft ?? (
                <span className="text-base font-semibold tracking-tight text-neutral-900">
                  Kwip
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {headerRight ?? (
                <Suspense>
                  <LanguageSwitcher />
                </Suspense>
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

      <BottomTabBar locale={locale} navLabels={navLabels} />
    </>
  );
}
