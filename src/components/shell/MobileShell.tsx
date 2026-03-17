import { Suspense } from "react";
import BottomTabBar from "./BottomTabBar";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import AuthButton from "@/components/shared/AuthButton";

interface Props {
  children: React.ReactNode;
  locale: string;
  headerRight?: React.ReactNode;
  headerLeft?: React.ReactNode;
  hideHeader?: boolean;
}

export default function MobileShell({
  children,
  locale,
  headerRight,
  headerLeft,
  hideHeader = false,
}: Props) {
  return (
    <>
      {/* Compact fixed header — mobile */}
      {!hideHeader && (
        <header
          className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100/80 md:hidden"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center justify-between px-4 h-11">
            <div className="flex items-center">
              {headerLeft ?? (
                <span className="text-base font-semibold tracking-tight text-neutral-900">
                  Kwip
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {headerRight ?? (
                <>
                  <Suspense>
                    <LanguageSwitcher />
                  </Suspense>
                  <AuthButton locale={locale} />
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Content area — padded for header + tab bar on mobile */}
      <main
        className="md:pt-0"
        style={{
          paddingTop: hideHeader
            ? "env(safe-area-inset-top)"
            : "calc(44px + env(safe-area-inset-top))",
          paddingBottom: "calc(49px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      <BottomTabBar locale={locale} />
    </>
  );
}
