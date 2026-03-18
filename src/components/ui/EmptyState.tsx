// src/components/ui/EmptyState.tsx
import Link from "next/link";
import { buttonVariants } from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon, title, body, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <p className="text-[34px] mb-4">{icon}</p>}
      <p className="text-[17px] font-semibold text-neutral-900 mb-2">{title}</p>
      {body && (
        <p className="text-[15px] text-neutral-500 mb-6 max-w-xs">{body}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
