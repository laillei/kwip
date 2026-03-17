# Mobile-First HIG Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign Kwip's layout and components to be mobile-first, following Apple HIG as the primary standard and Material Design 3 as fallback.

**Architecture:** Build a new `MobileShell` layout component (bottom tab bar + compact fixed header) that wraps all pages. Then update each page's content components pass-by-pass. Desktop (768px+) restores current nav behavior via responsive classes.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, Noto Sans

---

## Task 1: MobileShell Component (Layout Shell)

**Files:**
- Create: `src/components/shell/MobileShell.tsx`
- Create: `src/components/shell/BottomTabBar.tsx`

**Step 1: Create `BottomTabBar.tsx`**

This is a fixed bottom nav bar with 3 tabs. It hides at `md` breakpoint.

```tsx
// src/components/shell/BottomTabBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  locale: string;
}

export default function BottomTabBar({ locale }: Props) {
  const pathname = usePathname();

  const tabs = [
    {
      href: `/${locale}`,
      label: "Explore",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      href: `/${locale}/routine/new`,
      label: "Routine",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      ),
    },
    {
      href: `/${locale}/me`,
      label: "Me",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  // Determine active tab by prefix match
  function isActive(href: string) {
    if (href === `/${locale}`) return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname.startsWith(href);
  }

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
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
                active ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Step 2: Create `MobileShell.tsx`**

Compact fixed header (44px) + safe area handling + bottom padding for tab bar.

```tsx
// src/components/shell/MobileShell.tsx
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
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: no TypeScript errors, build succeeds.

**Step 4: Commit**

```bash
git add src/components/shell/MobileShell.tsx src/components/shell/BottomTabBar.tsx
git commit -m "feat: add MobileShell with bottom tab bar and compact header"
```

---

## Task 2: Wire MobileShell into Home Page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Replace current page layout**

Replace the entire `return` block in `src/app/[locale]/page.tsx`:

```tsx
// Add import at top
import MobileShell from "@/components/shell/MobileShell";
import SearchButton from "@/components/shared/SearchButton";

// Replace return block:
return (
  <div className="min-h-screen bg-neutral-50">
    {/* Mobile shell handles header + tab bar on mobile */}
    <MobileShell
      locale={locale}
      headerRight={
        <div className="flex items-center gap-2">
          <SearchButton locale={locale} />
          <Suspense>
            <LanguageSwitcher />
          </Suspense>
          <AuthButton locale={locale} />
        </div>
      }
    >
      {/* Desktop header (md+) — unchanged from current */}
      <div className="hidden md:block max-w-6xl mx-auto">
        <header className="flex items-center justify-between px-8 pt-6 pb-4">
          <div>
            <span className="text-2xl font-bold tracking-tight">Kwip</span>
            <p className="text-sm text-neutral-600 mt-0.5">{dict.site.tagline}</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchButton locale={locale} />
            <Suspense>
              <LanguageSwitcher />
            </Suspense>
            <AuthButton locale={locale} />
          </div>
        </header>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-2">
        <ConcernHub
          concerns={concernData}
          products={allProducts}
          ingredients={ingredients as Ingredient[]}
          locale={locale}
          dict={{
            emptyState: dict.products.emptyState,
            helpfulIngredients: dict.home.helpfulIngredients,
            concernPrompt: dict.home.concernPrompt,
            buildCta: dict.routine.buildCta,
          }}
        />
      </div>
    </MobileShell>
  </div>
);
```

Note: remove the old `SearchButton` import only if it's no longer used outside this block — keep it since it's still used.

**Step 2: Verify build**

```bash
npm run build
```
Expected: clean build.

**Step 3: Visual check**

```bash
npm run dev
```
Open `http://localhost:3000/vi` on a 375px viewport (Chrome DevTools mobile emulator). Verify:
- Bottom tab bar visible with 3 tabs
- Compact "Kwip" header fixed at top
- Content scrolls under header, above tab bar
- On desktop (1024px+): bottom tab bar hidden, original desktop header visible

**Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: wire MobileShell into home page"
```

---

## Task 3: Wire MobileShell into Product Detail Page

**Files:**
- Modify: `src/app/[locale]/products/[slug]/page.tsx`

**Step 1: Update product detail page**

Add `MobileShell` import and wrap the return. The detail page needs a back-button header left slot and no default auth buttons.

```tsx
// Add import
import MobileShell from "@/components/shell/MobileShell";

// Replace the outermost <div className="min-h-screen bg-neutral-50 pb-28"> wrapper:
return (
  <div className="min-h-screen bg-neutral-50">
    <MobileShell
      locale={locale}
      headerLeft={
        <Link
          href={`/${locale}`}
          className="flex items-center gap-1 text-neutral-900 -ml-1 px-1 min-h-[44px] min-w-[44px]"
          aria-label={dict.detail.back}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm font-medium">{dict.detail.back}</span>
        </Link>
      }
      headerRight={
        <Suspense>
          <LanguageSwitcher />
        </Suspense>
      }
    >
      {/* Desktop header */}
      <div className="hidden md:block max-w-3xl mx-auto">
        <header className="flex items-center justify-between px-8 py-4">
          <Link href={`/${locale}`} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors -ml-1 px-1 py-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {dict.detail.back}
          </Link>
          <Suspense>
            <LanguageSwitcher />
          </Suspense>
        </header>
      </div>

      {/* All existing content sections — unchanged */}
      <div className="max-w-3xl mx-auto pb-28">
        {/* ... all existing content ... */}
      </div>

      {/* Sticky purchase bar — keep as-is */}
    </MobileShell>
  </div>
);
```

**Important:** The existing sticky purchase bar at the bottom uses `fixed bottom-0`. On mobile, it will overlap with the tab bar. Fix by adding tab bar height offset:

Find the sticky purchase bar div and update:
```tsx
// Before:
<div className="fixed bottom-0 left-0 right-0 z-20">
// After:
<div className="fixed left-0 right-0 z-20 md:bottom-0" style={{ bottom: "calc(49px + env(safe-area-inset-bottom))" }}>
```

**Step 2: Verify build + visual check**

```bash
npm run build
npm run dev
```

Open a product detail page on mobile viewport. Verify:
- HIG back button (chevron + label) in compact header
- Purchase bar sits above tab bar (not overlapping)
- LanguageSwitcher in header right

**Step 3: Commit**

```bash
git add src/app/[locale]/products/[slug]/page.tsx
git commit -m "feat: wire MobileShell into product detail page"
```

---

## Task 4: Wire MobileShell into Routine & Me Pages

**Files:**
- Modify: `src/app/[locale]/routine/new/page.tsx`
- Modify: `src/app/[locale]/routine/[id]/page.tsx`
- Modify: `src/app/[locale]/me/page.tsx`

**Step 1: Read each page first**

```bash
# Read all three pages to understand their current structure
```

Read: `src/app/[locale]/routine/new/page.tsx`
Read: `src/app/[locale]/routine/[id]/page.tsx`
Read: `src/app/[locale]/me/page.tsx`

**Step 2: Wrap each page with MobileShell**

For each page, apply the same pattern as Task 2:
- Import `MobileShell`
- Wrap content in `<MobileShell locale={locale}>`
- Move any existing per-page header into `headerLeft`/`headerRight` props for mobile
- Keep a `hidden md:block` desktop header inside the shell

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/[locale]/routine/new/page.tsx src/app/[locale]/routine/[id]/page.tsx src/app/[locale]/me/page.tsx
git commit -m "feat: wire MobileShell into routine and me pages"
```

---

## Task 5: HIG Typography & Spacing — ConcernSelector

**Files:**
- Modify: `src/components/home/ConcernSelector.tsx`

**Step 1: Update concern chip sizing**

Current chips use `px-4 py-3 min-h-[56px] text-sm`. Update to HIG standards:
- Keep `min-h-[56px]` (already exceeds 44pt minimum — good)
- Label: `text-sm font-semibold` → `text-[15px] font-semibold` (HIG Subhead)
- Symptom text: `text-xs` → `text-[13px]` (HIG Footnote)
- Horizontal padding: `px-4` → `px-4` (keep — already 16px, on 8pt grid)

```tsx
// In ConcernSelector.tsx, update button content:
<button
  key={c.id}
  onClick={() => onToggle(c.id)}
  className={`shrink-0 snap-start px-4 rounded-2xl min-h-[56px] flex flex-col justify-center text-left transition-all ${
    isActive
      ? "bg-neutral-900 text-white"
      : "bg-white text-neutral-900"
  }`}
  style={!isActive ? { boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)" } : undefined}
>
  <p className={`text-[15px] font-semibold leading-tight whitespace-nowrap ${isActive ? "text-white" : "text-neutral-900"}`}>
    {c.label}
  </p>
  <p className={`text-[13px] mt-0.5 leading-tight whitespace-nowrap ${isActive ? "text-neutral-300" : "text-neutral-400"}`}>
    {c.symptom}
  </p>
</button>
```

Also update the concern prompt in `ConcernHub.tsx`:
```tsx
// Before:
<p className="text-base font-medium text-neutral-900">
// After:
<p className="text-[17px] font-medium text-neutral-900">
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/home/ConcernSelector.tsx src/components/home/ConcernHub.tsx
git commit -m "feat: update ConcernSelector to HIG typography scale"
```

---

## Task 6: HIG Typography — RoutineStepRow & ProductCard

**Files:**
- Modify: `src/components/home/RoutineStepRow.tsx`
- Modify: `src/components/products/ProductCard.tsx`

**Step 1: Read both files first**

Read: `src/components/home/RoutineStepRow.tsx`
Read: `src/components/products/ProductCard.tsx`

**Step 2: Update RoutineStepRow section header**

Find the step header element (currently uses `text-xs` or similar overline style). Update to HIG Title 3:
- Step number badge: keep `text-xs`
- Step label: `text-[17px] font-semibold` (HIG Headline)

**Step 3: Update ProductCard**

- Product name: update to `text-[15px] font-semibold` (HIG Subhead)
- Brand name: `text-[13px]` (HIG Footnote)
- Ingredient reason text: `text-[13px]` (HIG Footnote)
- Ensure card tap target covers full card area (verify `<Link>` wraps entire card)

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/components/home/RoutineStepRow.tsx src/components/products/ProductCard.tsx
git commit -m "feat: update RoutineStepRow and ProductCard to HIG typography"
```

---

## Task 7: HIG Typography — Product Detail Page

**Files:**
- Modify: `src/app/[locale]/products/[slug]/page.tsx`

**Step 1: Update ingredient list rows**

Each ingredient row in the full ingredient list should meet HIG list row height (44px min):
```tsx
// Find the ingredient row div:
<div key={ingredientId} className="flex items-start gap-3.5 px-5 py-3.5">
// Update to:
<div key={ingredientId} className="flex items-start gap-3.5 px-5 py-3 min-h-[44px]">
```

**Step 2: Update typography in detail page**

- Product name `h1`: `text-lg font-semibold` → `text-[22px] font-bold` (HIG Title 2)
- Brand name: `text-xs` → `text-[13px]` (HIG Footnote)
- Key ingredient name: `text-sm font-semibold` → `text-[15px] font-semibold` (HIG Subhead)
- Key ingredient description: `text-sm` → `text-[15px]` (HIG Subhead)
- Section headers (overline): keep `text-xs uppercase tracking-wide` — this is intentional design, not body text

**Step 3: Update purchase buttons**

Current: `py-3.5` (≈14px padding each side → ~52px total height — already good)
Update text size: `text-sm` → `text-[15px] font-semibold`

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/app/[locale]/products/[slug]/page.tsx
git commit -m "feat: update product detail page to HIG typography and touch targets"
```

---

## Task 8: HIG Typography — IngredientHighlight Cards

**Files:**
- Modify: `src/components/home/IngredientHighlight.tsx`

**Step 1: Read the file**

Read: `src/components/home/IngredientHighlight.tsx`

**Step 2: Update card sizing and typography**

- Card width: update to `w-[180px]`
- Ingredient name: update to `text-[15px] font-semibold` (HIG Subhead)
- Description text: update to `text-[13px]` (HIG Footnote)
- Icon: verify minimum 24px size

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/home/IngredientHighlight.tsx
git commit -m "feat: update IngredientHighlight to HIG typography"
```

---

## Task 9: Routine & Me Pages — 8pt Grid & Touch Targets

**Goal:** Ensure forms, buttons, and inputs on `/routine/new` and `/me` meet HIG standards.

**Files:**
- Modify: `src/app/[locale]/routine/new/page.tsx` (and any child components)
- Modify: `src/app/[locale]/me/page.tsx` (and any child components)

**Step 1: Read and audit**

Read all routine/me page files. For each interactive element check:
- Touch target ≥ 44px height/width
- Input fields: `min-h-[44px]`
- Buttons: `min-h-[44px]`
- Body text: `text-[15px]` or `text-[17px]`

**Step 2: Apply fixes**

Update any element that doesn't meet HIG standards. Use `min-h-[44px]` class for interactive elements.

**Step 3: Verify build + visual check**

```bash
npm run build
npm run dev
```

Test on 375px mobile viewport.

**Step 4: Commit**

```bash
git add src/app/[locale]/routine/ src/app/[locale]/me/
git commit -m "feat: apply HIG touch targets and typography to routine and me pages"
```

---

## Task 10: F4 — Share Routine Image Card

> Build this after Tasks 1–9 are complete.

**Files:**
- Create: `src/app/api/share-image/route.tsx` (or extend existing)
- Modify: `src/components/home/ConcernHub.tsx` (add share button)

**Step 1: Read the PRD for F4 spec**

Read: `docs/prd.md` section F4.

**Step 2: Check existing share API**

```bash
# Check if a share API already exists
```
Read: any existing files under `src/app/api/`

**Step 3: Implement per F4 spec**

Per PRD F4:
- Button appears only when concern is active
- Card: concern label + 2–3 key ingredients + reasons + routine steps + Kwip URL
- 9:16 ratio PNG, downloadable
- Mobile primary

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git commit -m "feat: F4 share routine image card"
```
