// src/components/ui/Divider.tsx
export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`h-px bg-neutral-100 border-0 ${className}`} />;
}
