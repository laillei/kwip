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
    <div className="-mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {options.map((option) => {
          const active = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.id)}
              className={`shrink-0 px-4 h-9 rounded-full text-[13px] font-medium transition-all ${
                active
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-600 border border-neutral-200"
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
