// src/components/ui/SectionHeader.tsx
import type { HTMLAttributes } from "react";

interface SectionHeaderProps extends HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4";
}

export function SectionHeader({ as: Tag = "h2", className = "", ...props }: SectionHeaderProps) {
  return (
    <Tag
      className={`text-xs font-semibold uppercase tracking-wide text-neutral-500 ${className}`}
      {...props}
    />
  );
}
