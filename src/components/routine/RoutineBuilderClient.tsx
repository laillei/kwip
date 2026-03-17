"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import type { RoutineProduct } from "@/lib/types";
import { saveRoutine } from "@/lib/localRoutines";
import RoutineStepPicker from "./RoutineStepPicker";
import { Button, Input } from "@/components/ui";

const ROUTINE_STEPS: { category: Category; step: number; label: Record<string, string> }[] = [
  { category: "cleanser", step: 1, label: { en: "Cleanse", vi: "Làm sạch" } },
  { category: "pad", step: 2, label: { en: "Exfoliate", vi: "Tẩy tế bào chết" } },
  { category: "toner", step: 3, label: { en: "Toner", vi: "Nước hoa hồng" } },
  { category: "essence", step: 4, label: { en: "Essence", vi: "Tinh chất" } },
  { category: "serum", step: 5, label: { en: "Serum", vi: "Serum" } },
  { category: "ampoule", step: 6, label: { en: "Ampoule", vi: "Tinh chất cô đặc" } },
  { category: "mask", step: 7, label: { en: "Mask", vi: "Mặt nạ" } },
  { category: "cream", step: 8, label: { en: "Moisturize", vi: "Dưỡng ẩm" } },
  { category: "sunscreen", step: 9, label: { en: "Sun Protection", vi: "Chống nắng" } },
];

interface RoutineBuilderClientProps {
  locale: string;
  concern: string;
  concernLabel: string | undefined;
  products: Product[];
  dict: {
    builderTitle: string;
    selectProducts: string;
    namePlaceholder: string;
    saveButton: string;
    saving: string;
    backToHome: string;
  };
}

export default function RoutineBuilderClient({
  locale,
  concern,
  concernLabel,
  products,
  dict,
}: RoutineBuilderClientProps) {
  const router = useRouter();
  const loc = locale as "vi" | "en";
  const [routineName, setRoutineName] = useState(
    concernLabel ? `Routine ${concernLabel}` : "My Routine"
  );
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<string, string[]>
  >({});
  const [saving, setSaving] = useState(false);

  function toggleProduct(category: Category, productId: string) {
    setSelectedByCategory((prev) => {
      const current = prev[category] ?? [];
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      return { ...prev, [category]: next };
    });
  }

  const totalSelected = Object.values(selectedByCategory).flat().length;

  function handleSave() {
    if (!routineName.trim() || totalSelected === 0) return;
    setSaving(true);

    const routineProducts: RoutineProduct[] = ROUTINE_STEPS.flatMap((step) =>
      (selectedByCategory[step.category] ?? []).map((productId) => ({
        productId,
        category: step.category,
        step: step.step,
      }))
    );

    saveRoutine({
      name: routineName.trim(),
      concern,
      products: routineProducts,
    });

    router.push(`/${locale}/me`);
  }

  const stepsWithProducts = ROUTINE_STEPS.filter((step) =>
    products.some((p) => p.category === step.category)
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}`)}
          className="mb-6 -ml-1 px-1 gap-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {dict.backToHome}
        </Button>

        <h1 className="text-[22px] font-bold text-neutral-900 mb-1">
          {dict.builderTitle}
        </h1>
        {concernLabel && (
          <p className="text-[15px] text-neutral-500 mb-6">{concernLabel}</p>
        )}

        <Input
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder={dict.namePlaceholder}
          className="mb-8"
        />

        <div className="space-y-8">
          {stepsWithProducts.map((step) => (
            <RoutineStepPicker
              key={step.category}
              step={step.step}
              label={step.label[loc] ?? step.label.vi}
              products={products.filter((p) => p.category === step.category)}
              selectedIds={selectedByCategory[step.category] ?? []}
              locale={locale}
              onToggle={(productId) => toggleProduct(step.category, productId)}
            />
          ))}
        </div>

        <div className="sticky mt-8" style={{ bottom: "calc(49px + env(safe-area-inset-bottom) + 16px)" }}>
          <Button
            fullWidth
            size="lg"
            onClick={handleSave}
            disabled={saving || totalSelected === 0 || !routineName.trim()}
          >
            {saving ? dict.saving : `${dict.saveButton} (${totalSelected})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
