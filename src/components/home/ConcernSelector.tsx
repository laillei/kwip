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
    <div className="grid grid-cols-2 gap-3">
      {concerns.map((c) => {
        const isActive = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all min-h-[56px] ${
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
            <span className="text-xl shrink-0">{c.icon}</span>
            <div className="min-w-0">
              <p className={`text-sm font-semibold leading-tight ${isActive ? "text-white" : "text-neutral-900"}`}>
                {c.label}
              </p>
              <p className={`text-xs mt-0.5 leading-tight truncate ${isActive ? "text-neutral-300" : "text-neutral-400"}`}>
                {c.symptom}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
