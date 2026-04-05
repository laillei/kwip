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
    <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
      {tags.map((tag) => {
        const isActive = tag === activeTag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onTagChange(tag)}
            className="min-h-[48px] flex items-center"
          >
            <span
              className={`h-8 px-4 rounded-full flex items-center whitespace-nowrap text-xs transition-colors ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "bg-surface-highest text-on-surface-variant"
              }`}
              style={{
                fontFamily:
                  "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
              }}
            >
              {tag}
            </span>
          </button>
        );
      })}
    </div>
  );
}
