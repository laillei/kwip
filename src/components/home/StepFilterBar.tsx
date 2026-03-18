"use client";

import type { Category } from "@/lib/types";

interface StepOption {
  category: Category | "all";
  label: string;
}

interface StepFilterBarProps {
  steps: StepOption[];
  selected: Category | "all";
  onSelect: (step: Category | "all") => void;
}

export default function StepFilterBar({ steps, selected, onSelect }: StepFilterBarProps) {
  return (
    <div className="-mx-4 px-3 py-2 border-b border-neutral-100">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {steps.map((step) => {
          const active = selected === step.category;
          return (
            <button
              key={step.category}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(step.category)}
              className={`shrink-0 px-3 h-8 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                active
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
