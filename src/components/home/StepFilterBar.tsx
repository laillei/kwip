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
    <div className="-mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {steps.map((step) => {
          const active = selected === step.category;
          return (
            <button
              key={step.category}
              onClick={() => onSelect(step.category)}
              className={`shrink-0 px-4 h-9 rounded-full text-[13px] font-medium transition-all ${
                active
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-600 border border-neutral-200"
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
