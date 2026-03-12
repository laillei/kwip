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
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {concerns.map((c) => {
          const isActive = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onToggle(c.id)}
              className={`shrink-0 snap-start px-4 py-3 rounded-2xl min-h-[56px] flex flex-col justify-center text-left transition-all ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-900"
              }`}
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
