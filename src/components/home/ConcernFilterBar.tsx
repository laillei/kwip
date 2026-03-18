"use client";

import type { Concern } from "@/lib/types";

interface ConcernOption {
  id: Concern | "all";
  label: string;
}

interface ConcernFilterBarProps {
  options: ConcernOption[];
  selected: Concern | "all";
  onSelect: (id: Concern | "all") => void;
}

export default function ConcernFilterBar({ options, selected, onSelect }: ConcernFilterBarProps) {
  return (
    <div className="-mx-4 px-4 border-b border-neutral-100">
      <div className="flex gap-0 overflow-x-auto no-scrollbar">
        {options.map((option) => {
          const active = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.id)}
              className={`shrink-0 px-4 py-3 text-[13px] font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
                active
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-400"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
