import type { Concern } from "@/types";

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
                  : "bg-white text-neutral-900"
              }`}
              style={!isActive ? { boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)" } : undefined}
            >
              <p className={`text-[15px] font-semibold leading-tight whitespace-nowrap ${isActive ? "text-white" : "text-neutral-900"}`}>
                {c.label}
              </p>
              <p className={`text-[13px] mt-0.5 leading-tight whitespace-nowrap ${isActive ? "text-white/60" : "text-neutral-400"}`}>
                {c.symptom}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
