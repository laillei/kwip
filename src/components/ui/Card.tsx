// src/components/ui/Card.tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const cardVariants = cva("bg-white rounded-2xl", {
  variants: {
    padding: {
      sm:   "p-3.5",
      md:   "p-5",
      none: "",
    },
  },
  defaultVariants: { padding: "md" },
});

const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, padding, style, ...props }: CardProps) {
  return (
    <div
      className={cardVariants({ padding, className })}
      style={{ boxShadow: CARD_SHADOW, ...style }}
      {...props}
    />
  );
}
