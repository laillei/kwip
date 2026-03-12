# Concern Selector iOS Tab Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 2-column concern card grid with a compact horizontal scroll tab row showing label + symptom text per tab.

**Architecture:** Only `ConcernSelector.tsx` changes. The outer container becomes a horizontal flex scroll row. Each button becomes a narrow tab pill with two lines of text. No data changes, no dictionary changes, no parent component changes.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS. Verify with `npm run build`.

---

## Task 1: Rewrite ConcernSelector to horizontal tab row

**Files:**
- Modify: `src/components/home/ConcernSelector.tsx`

**Step 1: Read the current file**

Read `src/components/home/ConcernSelector.tsx` to see the current implementation.

**Step 2: Replace the entire component with this**

```tsx
import type { Concern } from "@/lib/types";

interface ConcernData {
  id: Concern;
  label: string;
  icon: string;
  symptom: string;
}

interface ConcernSelectorProps {
  concerns: ConcernData[];
  selected: Concern | null;
  onToggle: (id: Concern) => void;
}

export default function ConcernSelector({
  concerns,
  selected,
  onToggle,
}: ConcernSelectorProps) {
  return (
    <div className="-mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1">
        {concerns.map((c) => {
          const isActive = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onToggle(c.id)}
              className={`shrink-0 snap-start px-4 py-3 rounded-2xl min-h-[56px] flex flex-col justify-center text-left transition-all ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-900"
              }`}
              style={
                !isActive
                  ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }
                  : undefined
              }
            >
              <p className={`text-sm font-semibold leading-tight whitespace-nowrap ${isActive ? "text-white" : "text-neutral-900"}`}>
                {c.label}
              </p>
              <p className={`text-xs mt-0.5 leading-tight whitespace-nowrap ${isActive ? "text-neutral-300" : "text-neutral-400"}`}>
                {c.symptom}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Run build**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

**Step 4: Commit**

```bash
git add src/components/home/ConcernSelector.tsx
git commit -m "feat: redesign concern selector as horizontal scroll tab row"
```

---

## Task 2: Verify and push

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Visual check**

Open `http://localhost:3000/vi` (or whatever port). Verify:
- Concern selector is a single compact horizontal row (~56px tall)
- Tabs scroll horizontally — all 7 concerns reachable by swiping
- Each tab shows label (bold) + symptom text (smaller, secondary)
- Selecting a tab: dark background, white text on both lines
- Deselecting: returns to white pill
- Below the selector: ingredient highlights + routine steps appear as before

**Step 3: Push**

```bash
git push
```
