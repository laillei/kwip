// src/app/[locale]/design-system/page.tsx
// Developer-only reference page — not linked from the app UI

import {
  Button,
  IconButton,
  Card,
  Badge,
  Input,
  EmptyState,
  SectionHeader,
  Divider,
} from "@/components/ui";

export default function DesignSystemPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <SectionHeader as="h1" className="mb-10 text-sm">
        Design System
      </SectionHeader>

      {/* ── Typography ─────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader as="h2" className="mb-6">
          Typography
        </SectionHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Title — 22px / font-bold</p>
            <p className="text-[22px] font-bold text-neutral-900">The skin problem solver</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Headline — 17px / font-semibold</p>
            <p className="text-[17px] font-semibold text-neutral-900">BHA · Salicylic Acid</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Body — 17px / font-normal</p>
            <p className="text-[17px] text-neutral-600">
              Exfoliates inside pores to reduce blackheads and prevent breakouts.
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Subhead — 15px / font-normal</p>
            <p className="text-[15px] text-neutral-500">
              Best used in the evening routine after cleansing.
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Caption — 13px / font-normal</p>
            <p className="text-[13px] text-neutral-500">309 products · 7 concerns covered</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Overline — 12px / uppercase / tracking-wide</p>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400">
              Routine Step
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Label — 12px / font-medium</p>
            <p className="text-[12px] font-medium text-neutral-500">4.8 · 2.3k reviews</p>
          </div>
        </div>
      </section>

      <Divider className="my-8" />

      {/* ── Colors ─────────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader as="h2" className="mb-6">
          Colors
        </SectionHeader>
        <div className="flex flex-wrap gap-4">
          {[
            { name: "neutral-900", bg: "bg-neutral-900" },
            { name: "neutral-600", bg: "bg-neutral-600" },
            { name: "neutral-500", bg: "bg-neutral-500" },
            { name: "neutral-400", bg: "bg-neutral-400" },
            { name: "emerald-600", bg: "bg-emerald-600" },
            { name: "amber-600",   bg: "bg-amber-600"   },
          ].map(({ name, bg }) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <div className={`w-14 h-14 rounded-xl ${bg}`} />
              <p className={`text-[11px] font-medium text-neutral-500`}>{name}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider className="my-8" />

      {/* ── Button ─────────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader as="h2" className="mb-6">
          Button
        </SectionHeader>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="tonal">Tonal</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="primary" size="lg">Primary lg</Button>
          <Button variant="tonal" size="lg">Tonal lg</Button>
        </div>
      </section>

      <Divider className="my-8" />

      {/* ── IconButton ─────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader as="h2" className="mb-6">
          IconButton
        </SectionHeader>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <IconButton variant="default" aria-label="Default icon button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </IconButton>
            <p className="text-[11px] text-neutral-400">default</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <IconButton variant="subtle" aria-label="Subtle icon button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
            <p className="text-[11px] text-neutral-400">subtle</p>
          </div>
        </div>
      </section>

      <Divider className="my-8" />

      {/* ── Card ───────────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader as="h2" className="mb-6">
          Card
        </SectionHeader>
        <div className="space-y-4">
          {(["sm", "md", "none"] as const).map((padding) => (
            <div key={padding}>
              <p className="text-xs text-neutral-400 mb-2">padding={padding}</p>
              <Card padding={padding}>
                <p className="text-[15px] text-neutral-900">
                  Card with <code className="text-[13px] bg-neutral-100 px-1 rounded">padding=&quot;{padding}&quot;</code>
                </p>
                {padding === "none" && (
                  <div className="p-4">
                    <p className="text-[13px] text-neutral-500">
                      Use inner wrapper for padding=none cards.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </section>

      <Divider className="my-8" />

      {/* ── Badge ──────────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader as="h2" className="mb-6">
          Badge
        </SectionHeader>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <Badge variant="default" shape="pill">Default pill</Badge>
            <p className="text-[11px] text-neutral-400">default/pill</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Badge variant="success" shape="pill">Success pill</Badge>
            <p className="text-[11px] text-neutral-400">success/pill</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Badge variant="warning" shape="pill">Warning pill</Badge>
            <p className="text-[11px] text-neutral-400">warning/pill</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Badge variant="default" shape="tag">Default tag</Badge>
            <p className="text-[11px] text-neutral-400">default/tag</p>
          </div>
        </div>
      </section>

      <Divider className="my-8" />

      {/* ── Input ──────────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader as="h2" className="mb-6">
          Input
        </SectionHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-neutral-400 mb-2">Default</p>
            <Input placeholder="Search products or ingredients…" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-2">Disabled</p>
            <Input placeholder="Unavailable field" disabled />
          </div>
        </div>
      </section>

      <Divider className="my-8" />

      {/* ── EmptyState ─────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader as="h2" className="mb-6">
          EmptyState
        </SectionHeader>
        <div className="space-y-6">
          <div>
            <p className="text-xs text-neutral-400 mb-2">With action</p>
            <Card padding="md">
              <EmptyState
                icon="✨"
                title="No routines yet"
                body="Build your first routine and share it with friends."
                actionLabel="Build a routine"
                actionHref="#"
              />
            </Card>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-2">Without action</p>
            <Card padding="md">
              <EmptyState
                icon="🔍"
                title="No results found"
                body="Try adjusting your filters or search term."
              />
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
