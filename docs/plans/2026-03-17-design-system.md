# Kwip Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build 8 shared UI primitive components using CVA, migrate key existing components to use them, and create a `/design-system` showcase page viewable on any device.

**Architecture:** `src/components/ui/` holds all primitives defined with `class-variance-authority`. Existing components import from `@/components/ui/` instead of repeating Tailwind classes. A showcase page at `/[locale]/design-system` renders every component with all variants.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, class-variance-authority

---

## Task 1: Install CVA

**Files:**
- Modify: `package.json`

**Step 1: Install class-variance-authority**

```bash
npm install class-variance-authority
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: clean build, no errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install class-variance-authority for design system"
```

---

## Task 2: Button primitive

**Files:**
- Create: `src/components/ui/Button.tsx`

**Step 1: Create the file**

```tsx
// src/components/ui/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:   "bg-neutral-900 text-white hover:bg-neutral-700 active:scale-[0.98]",
        tonal:     "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:scale-[0.98]",
        secondary: "border border-neutral-200 text-neutral-900 hover:bg-neutral-50 active:scale-[0.98]",
        ghost:     "text-neutral-500 hover:text-neutral-900",
      },
      size: {
        md: "min-h-[44px] px-4 text-[15px] rounded-xl",
        lg: "min-h-[50px] px-6 text-[15px] rounded-2xl",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, fullWidth, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: clean build.

**Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat: add Button primitive with CVA variants"
```

---

## Task 3: IconButton primitive

**Files:**
- Create: `src/components/ui/IconButton.tsx`

**Step 1: Create the file**

```tsx
// src/components/ui/IconButton.tsx
import { cva, type VariantProps } from "class-variance-authority";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center min-h-[44px] min-w-[44px] transition-colors rounded-xl",
  {
    variants: {
      variant: {
        default: "text-neutral-900 hover:bg-neutral-100",
        subtle:  "text-neutral-500 hover:text-neutral-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

export function IconButton({ className, variant, ...props }: IconButtonProps) {
  return (
    <button
      className={iconButtonVariants({ variant, className })}
      {...props}
    />
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/ui/IconButton.tsx
git commit -m "feat: add IconButton primitive"
```

---

## Task 4: Card, Badge, SectionHeader, Divider primitives

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/SectionHeader.tsx`
- Create: `src/components/ui/Divider.tsx`

**Step 1: Create Card.tsx**

```tsx
// src/components/ui/Card.tsx
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("bg-white rounded-2xl", {
  variants: {
    padding: {
      sm:   "p-3.5",
      md:   "p-5",
      none: "",
    },
  },
  defaultVariants: { padding: "md" },
});

const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, padding, style, ...props }: CardProps) {
  return (
    <div
      className={cardVariants({ padding, className })}
      style={{ boxShadow: CARD_SHADOW, ...style }}
      {...props}
    />
  );
}
```

**Step 2: Create Badge.tsx**

```tsx
// src/components/ui/Badge.tsx
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva("inline-flex items-center font-medium text-xs", {
  variants: {
    variant: {
      default: "bg-neutral-100 text-neutral-500",
      success: "bg-emerald-50 text-emerald-600",
      warning: "bg-amber-50 text-amber-600",
    },
    shape: {
      pill: "rounded-full px-3 py-1",
      tag:  "rounded-md px-2.5 py-0.5",
    },
  },
  defaultVariants: { variant: "default", shape: "pill" },
});

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, shape, ...props }: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, shape, className })} {...props} />
  );
}
```

**Step 3: Create SectionHeader.tsx**

```tsx
// src/components/ui/SectionHeader.tsx
interface SectionHeaderProps extends React.HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4";
}

export function SectionHeader({ as: Tag = "h2", className = "", ...props }: SectionHeaderProps) {
  return (
    <Tag
      className={`text-xs font-semibold uppercase tracking-wide text-neutral-400 ${className}`}
      {...props}
    />
  );
}
```

**Step 4: Create Divider.tsx**

```tsx
// src/components/ui/Divider.tsx
export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`h-px bg-neutral-100 border-0 ${className}`} />;
}
```

**Step 5: Verify build**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add src/components/ui/Card.tsx src/components/ui/Badge.tsx src/components/ui/SectionHeader.tsx src/components/ui/Divider.tsx
git commit -m "feat: add Card, Badge, SectionHeader, Divider primitives"
```

---

## Task 5: Input and EmptyState primitives

**Files:**
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/EmptyState.tsx`

**Step 1: Create Input.tsx**

```tsx
// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full min-h-[44px] px-4 py-3 rounded-xl border border-neutral-200 bg-white text-[17px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-shadow ${className}`}
      {...props}
    />
  );
}
```

**Step 2: Create EmptyState.tsx**

```tsx
// src/components/ui/EmptyState.tsx
import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon, title, body, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <p className="text-4xl mb-4">{icon}</p>}
      <p className="text-[17px] font-semibold text-neutral-900 mb-2">{title}</p>
      {body && (
        <p className="text-[15px] text-neutral-500 mb-6 max-w-xs">{body}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-[15px] font-medium text-neutral-900 underline min-h-[44px] inline-flex items-center"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/ui/Input.tsx src/components/ui/EmptyState.tsx
git commit -m "feat: add Input and EmptyState primitives"
```

---

## Task 6: Create index.ts barrel export

**Files:**
- Create: `src/components/ui/index.ts`

**Step 1: Create index.ts**

```ts
// src/components/ui/index.ts
export { Button } from "./Button";
export { IconButton } from "./IconButton";
export { Card } from "./Card";
export { Badge } from "./Badge";
export { Input } from "./Input";
export { EmptyState } from "./EmptyState";
export { SectionHeader } from "./SectionHeader";
export { Divider } from "./Divider";
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/ui/index.ts
git commit -m "feat: add ui component barrel export"
```

---

## Task 7: Migrate existing components to use primitives

Migrate the highest-impact components. Read each file before editing.

**Files:**
- Modify: `src/components/home/BuildRoutineButton.tsx`
- Modify: `src/components/home/ShareConcernButton.tsx`
- Modify: `src/components/routine/ShareButton.tsx`
- Modify: `src/components/routine/RoutineCard.tsx`
- Modify: `src/app/[locale]/me/MePageClient.tsx`
- Modify: `src/components/home/ConcernHub.tsx`
- Modify: `src/components/routine/RoutineBuilderClient.tsx`

**Step 1: Migrate BuildRoutineButton.tsx**

Replace the inline `<button>` with `<Button>` from ui:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface BuildRoutineButtonProps {
  locale: string;
  concern: string;
  label: string;
}

export default function BuildRoutineButton({ locale, concern, label }: BuildRoutineButtonProps) {
  const router = useRouter();
  return (
    <Button
      fullWidth
      className="mt-4"
      onClick={() => router.push(`/${locale}/routine/new?concern=${concern}`)}
    >
      {label}
    </Button>
  );
}
```

**Step 2: Migrate ShareButton.tsx**

Read `src/components/routine/ShareButton.tsx` first, then replace the inline `<button>` with `<Button variant="secondary" fullWidth>`.

**Step 3: Migrate ShareConcernButton.tsx**

Read `src/components/home/ShareConcernButton.tsx` first, then replace the inline `<button>` with `<Button variant="secondary" fullWidth>`.

**Step 4: Migrate RoutineCard.tsx**

Replace:
- The outer `<div className="bg-white rounded-2xl border border-neutral-100 p-5 ...">` → `<Card padding="md">`
- The View `<Link>` → keep as Link but apply `buttonVariants` from `@/components/ui/Button` (since it's an anchor, not a button — import the variant function directly)
- The Delete `<button>` → keep inline (it has a custom red color outside the design system — acceptable for a destructive action)

Note: for the View link, import `buttonVariants` directly:
```tsx
import { buttonVariants } from "@/components/ui/Button"; // need to export this
```

Update `Button.tsx` to also export `buttonVariants`:
```tsx
export { buttonVariants }; // add this line at the bottom of Button.tsx
```

Then in RoutineCard:
```tsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui";

// View link:
<Link
  href={`/${locale}/routine/${routine.id}`}
  className={buttonVariants({ variant: "secondary", fullWidth: true })}
>
  {dict.viewButton}
</Link>
```

**Step 5: Migrate MePageClient.tsx**

Replace the loading state and empty state inline patterns:
- Import `EmptyState` from `@/components/ui`
- Replace the empty state `<div className="text-center py-20">` block with `<EmptyState>`
- Keep the existing dict props to populate icon/title/body/actionLabel/actionHref

```tsx
import { EmptyState } from "@/components/ui";

// Replace empty state block with:
<EmptyState
  icon="🌿"
  title={dict.emptyTitle}
  body={dict.emptyBody}
  actionLabel={dict.emptyAction}
  actionHref={`/${locale}`}
/>
```

**Step 6: Migrate ConcernHub.tsx**

Replace the no-results empty state:
```tsx
import { EmptyState } from "@/components/ui";

// Replace the inline empty state with:
<EmptyState
  icon="🔍"
  title={dict.emptyState}
/>
```

**Step 7: Migrate RoutineBuilderClient.tsx**

Replace the `<input>` with `<Input>` from ui:
```tsx
import { Button, Input } from "@/components/ui";

// Replace input:
<Input
  value={routineName}
  onChange={(e) => setRoutineName(e.target.value)}
  placeholder={dict.namePlaceholder}
  className="mb-8"
/>

// Replace save button:
<Button
  fullWidth
  size="lg"
  onClick={handleSave}
  disabled={saving || totalSelected === 0 || !routineName.trim()}
  className="sticky bottom-20 md:bottom-6 mt-8"
>
  {saving ? dict.saving : `${dict.saveButton} (${totalSelected})`}
</Button>
```

**Step 8: Verify build**

```bash
npm run build
```
Fix any TypeScript errors before proceeding.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: migrate existing components to use ui primitives"
```

---

## Task 8: Create /design-system showcase page

**Files:**
- Create: `src/app/[locale]/design-system/page.tsx`

**Step 1: Create the showcase page**

```tsx
// src/app/[locale]/design-system/page.tsx
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Divider } from "@/components/ui/Divider";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[22px] font-bold text-neutral-900 border-b border-neutral-100 pb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] text-neutral-400 font-medium uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-[34px] font-bold text-neutral-900">Kwip Design System</h1>
          <p className="text-[15px] text-neutral-400 mt-1">Component library · Apple HIG · Noto Sans</p>
        </div>

        {/* Colors */}
        <Section title="Colors">
          <Row label="Neutrals">
            {[["50","bg-neutral-50"],["100","bg-neutral-100"],["400","bg-neutral-400"],["500","bg-neutral-500"],["600","bg-neutral-600"],["900","bg-neutral-900"]].map(([label, cls]) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-xl border border-neutral-100 ${cls}`} />
                <span className="text-[11px] text-neutral-500">{label}</span>
              </div>
            ))}
          </Row>
          <Row label="Semantic">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-600" />
              <span className="text-[11px] text-neutral-500">emerald-600</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-xl bg-amber-600" />
              <span className="text-[11px] text-neutral-500">amber-600</span>
            </div>
          </Row>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          {[
            { label: "Large Title · 34px Bold",   cls: "text-[34px] font-bold text-neutral-900" },
            { label: "Title 2 · 22px Bold",        cls: "text-[22px] font-bold text-neutral-900" },
            { label: "Title 3 · 20px Semibold",    cls: "text-xl font-semibold text-neutral-900" },
            { label: "Headline · 17px Semibold",   cls: "text-[17px] font-semibold text-neutral-900" },
            { label: "Body · 17px Regular",        cls: "text-[17px] text-neutral-900" },
            { label: "Callout · 16px Regular",     cls: "text-base text-neutral-900" },
            { label: "Subhead · 15px Regular",     cls: "text-[15px] text-neutral-900" },
            { label: "Footnote · 13px Regular",    cls: "text-[13px] text-neutral-500" },
            { label: "Caption · 12px Regular",     cls: "text-xs text-neutral-400" },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <p className={cls}>Noto Sans</p>
              <span className="text-[11px] text-neutral-400 shrink-0">{label}</span>
            </div>
          ))}
        </Section>

        {/* Button */}
        <Section title="Button">
          <Row label="Variants · md">
            <Button variant="primary">Primary</Button>
            <Button variant="tonal">Tonal</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </Row>
          <Row label="Variants · lg">
            <Button variant="primary" size="lg">Primary</Button>
            <Button variant="tonal" size="lg">Tonal</Button>
            <Button variant="secondary" size="lg">Secondary</Button>
          </Row>
          <Row label="Full Width">
            <Button fullWidth>Full Width Primary</Button>
          </Row>
          <Row label="Disabled">
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </Row>
        </Section>

        {/* IconButton */}
        <Section title="IconButton">
          <Row label="Variants">
            <IconButton variant="default" aria-label="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </IconButton>
            <IconButton variant="subtle" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </IconButton>
          </Row>
        </Section>

        {/* Card */}
        <Section title="Card">
          <Row label="Padding variants">
            <Card padding="sm" className="w-36 text-center">
              <p className="text-[13px] text-neutral-500">sm · p-3.5</p>
            </Card>
            <Card padding="md" className="w-36 text-center">
              <p className="text-[13px] text-neutral-500">md · p-5</p>
            </Card>
            <Card padding="none" className="w-36 text-center p-4">
              <p className="text-[13px] text-neutral-500">none</p>
            </Card>
          </Row>
        </Section>

        {/* Badge */}
        <Section title="Badge">
          <Row label="Pill shape">
            <Badge variant="default" shape="pill">Category</Badge>
            <Badge variant="success" shape="pill">✓ Sensitive Safe</Badge>
            <Badge variant="warning" shape="pill">Best Seller</Badge>
          </Row>
          <Row label="Tag shape">
            <Badge variant="default" shape="tag">Category</Badge>
            <Badge variant="success" shape="tag">EWG A</Badge>
            <Badge variant="warning" shape="tag">⚠ Note</Badge>
          </Row>
        </Section>

        {/* Input */}
        <Section title="Input">
          <Row label="States">
            <div className="w-full space-y-3">
              <Input placeholder="Default state" />
              <Input defaultValue="Filled state" />
              <Input placeholder="Disabled" disabled />
            </div>
          </Row>
        </Section>

        {/* EmptyState */}
        <Section title="EmptyState">
          <Card padding="none">
            <EmptyState
              icon="🌿"
              title="No routines yet"
              body="Select a skin concern to build your first routine."
              actionLabel="Explore now"
              actionHref="#"
            />
          </Card>
        </Section>

        {/* SectionHeader + Divider */}
        <Section title="SectionHeader + Divider">
          <Card padding="none">
            <div className="px-5 pt-5 pb-2">
              <SectionHeader>Key Ingredients</SectionHeader>
            </div>
            <Divider />
            <div className="px-5 py-3">
              <p className="text-[15px] text-neutral-900">Niacinamide</p>
              <p className="text-[13px] text-neutral-500">Brightening · EWG A</p>
            </div>
            <Divider />
            <div className="px-5 py-3">
              <p className="text-[15px] text-neutral-900">BHA (Salicylic Acid)</p>
              <p className="text-[13px] text-neutral-500">Acne · EWG B</p>
            </div>
            <Divider />
            <div className="px-5 pt-3 pb-5">
              <p className="text-[15px] text-neutral-900">Centella Asiatica</p>
              <p className="text-[13px] text-neutral-500">Soothing · EWG A</p>
            </div>
          </Card>
        </Section>

      </div>
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: clean build. The page will appear as a static route at `/vi/design-system` and `/en/design-system`.

**Step 3: Open in browser and verify on mobile**

```bash
open http://localhost:3000/vi/design-system
```

Then open DevTools → device toggle → iPhone 14 Pro to verify mobile layout.

**Step 4: Commit**

```bash
git add "src/app/[locale]/design-system/page.tsx"
git commit -m "feat: add /design-system showcase page"
```

---

## Task 9: Push

```bash
git push
```

Then open on your actual phone: `http://localhost:3000/vi/design-system` (or the deployed Vercel URL if already deployed).
