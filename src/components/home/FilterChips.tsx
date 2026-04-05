"use client";

interface FilterChipsProps {
  tags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
  locale: string;
}

export default function FilterChips({
  tags,
  activeTag,
  onTagChange,
}: FilterChipsProps) {
  return (
    <div className="flex overflow-x-auto no-scrollbar bg-white border-b border-outline sticky top-14 z-40">
      {tags.map((tag) => {
        const isActive = tag === activeTag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onTagChange(tag)}
            className={`h-11 px-4 flex items-center whitespace-nowrap text-[13px] transition-colors border-b-2 ${
              isActive
                ? "font-semibold text-black border-black"
                : "font-medium text-[#A3A3A3] border-transparent"
            }`}
            style={{
              fontFamily: "'Pretendard', system-ui, sans-serif",
            }}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
