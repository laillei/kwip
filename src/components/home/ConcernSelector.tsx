"use client";

import type { Concern } from "@/lib/types";

interface ConcernSelectorProps {
  concerns: {
    id: Concern;
    label: string;
    icon: string;
  }[];
  selected: Concern[];
  onToggle: (id: Concern) => void;
}

export default function ConcernSelector({
  concerns,
  selected,
  onToggle,
}: ConcernSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {concerns.map((c) => {
        const isActive = selected.includes(c.id);
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              isActive
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-white text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200"
            }`}
            style={
              !isActive
                ? {
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                  }
                : undefined
            }
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
