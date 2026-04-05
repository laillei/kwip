import Link from "next/link";

interface SectionHeaderProps {
  overline: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function SectionHeader({
  overline,
  title,
  actionLabel,
  actionHref,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between px-4 pt-12">
      <div className="flex flex-col gap-1">
        <span
          className="text-[11px] font-bold uppercase tracking-[2px] text-on-surface-variant"
          style={{
            fontFamily:
              "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
          }}
        >
          {overline}
        </span>
        <h2
          className="text-[22px] font-bold text-on-surface"
          style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
        >
          {title}
        </h2>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-[13px] font-semibold text-tertiary"
          style={{
            fontFamily:
              "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
          }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
