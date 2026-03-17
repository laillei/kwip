// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900",
  {
    variants: {
      variant: {
        primary:   "bg-neutral-900 text-white hover:bg-neutral-700 active:scale-[0.98]",
        tonal:     "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:scale-[0.98]",
        secondary: "border border-neutral-200 text-neutral-900 hover:bg-neutral-50 active:scale-[0.98]",
        ghost:       "text-neutral-500 hover:text-neutral-900 active:scale-[0.98]",
        destructive: "border border-red-100 text-red-600 hover:bg-red-50 active:scale-[0.98]",
      },
      size: {
        md: "min-h-[44px] min-w-[44px] px-4 text-[15px] rounded-xl",
        lg: "min-h-[50px] min-w-[44px] px-6 text-[15px] rounded-2xl",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, fullWidth, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}

export { buttonVariants };
