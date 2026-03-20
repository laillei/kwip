"use client";

import type { Category } from "@/types";

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
    <div className="-mx-4 px-4 py-1 border-b border-neutral-100 bg-white">
      <div className="flex gap-0 overflow-x-auto no-scrollbar">
        {steps.map((step) => {
          const active = selected === step.category;
          return (
            <button
              key={step.category}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(step.category)}
              className={`shrink-0 px-3 h-7 text-xs transition-all whitespace-nowrap ${
                active
                  ? "font-semibold text-neutral-900"
                  : "font-normal text-neutral-400"
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
