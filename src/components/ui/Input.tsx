// src/components/ui/Input.tsx
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full min-h-[44px] px-4 py-3 rounded-xl border border-neutral-200 bg-white text-[17px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-shadow ${className}`}
      {...props}
    />
  );
}
