// src/components/ui/IconButton.tsx
import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center min-h-[44px] min-w-[44px] transition-[colors,transform] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900",
  {
    variants: {
      variant: {
        default: "text-neutral-900 hover:bg-neutral-100 active:scale-[0.98]",
        subtle:  "text-neutral-500 hover:text-neutral-900 active:scale-[0.98]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

export function IconButton({ className, variant, ...props }: IconButtonProps) {
  return (
    <button
      className={iconButtonVariants({ variant, className })}
      {...props}
    />
  );
}
