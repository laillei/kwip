"use client";

import type { Concern } from "@/lib/types";

interface ConcernSelectorProps {
  concerns: {
    id: Concern;
    label: string;
    icon: string;
    symptom: string;
  }[];
  selected: Concern | null;
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
        const isActive = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              isActive
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100"
            }`}
            style={
              !isActive
                ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }
                : undefined
            }
          >
            {isActive && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <span className="text-base leading-none">{c.icon}</span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
