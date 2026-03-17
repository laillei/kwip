// src/components/ui/Badge.tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const badgeVariants = cva("inline-flex items-center font-medium text-xs", {
  variants: {
    variant: {
      default: "bg-neutral-100 text-neutral-500",
      success: "bg-emerald-50 text-emerald-600",
      warning: "bg-amber-50 text-amber-600",
    },
    shape: {
      pill: "rounded-full px-3 py-1",
      tag:  "rounded-md px-2.5 py-0.5",
    },
  },
  defaultVariants: { variant: "default", shape: "pill" },
});

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, shape, ...props }: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, shape, className })} {...props} />
  );
}
