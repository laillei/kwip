"use client";

import { useRouter } from "next/navigation";

interface BuildRoutineButtonProps {
  locale: string;
  concern: string;
  label: string;
}

export default function BuildRoutineButton({
  locale,
  concern,
  label,
}: BuildRoutineButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/${locale}/routine/new?concern=${concern}`)}
      className="w-full mt-4 py-3 px-4 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-700 transition-colors"
    >
      {label}
    </button>
  );
}
