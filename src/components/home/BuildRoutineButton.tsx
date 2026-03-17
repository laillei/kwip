"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface BuildRoutineButtonProps {
  locale: string;
  concern: string;
  label: string;
}

export default function BuildRoutineButton({ locale, concern, label }: BuildRoutineButtonProps) {
  const router = useRouter();
  return (
    <Button
      fullWidth
      className="mt-4"
      onClick={() => router.push(`/${locale}/routine/new?concern=${concern}`)}
    >
      {label}
    </Button>
  );
}
