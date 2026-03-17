"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import type { RoutineProduct } from "@/lib/types";
import { saveRoutine } from "@/lib/localRoutines";
import RoutineStepPicker from "./RoutineStepPicker";

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
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="text-[15px] text-neutral-500 hover:text-neutral-900 mb-6 min-h-[44px] flex items-center"
        >
          {dict.backToHome}
        </button>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          {dict.builderTitle}
        </h1>
        {concernLabel && (
          <p className="text-[15px] text-neutral-500 mb-6">{concernLabel}</p>
        )}

        <input
          type="text"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder={dict.namePlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 mb-8 min-h-[44px]"
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

        <div className="sticky bottom-20 md:bottom-6 mt-8">
          <button
            onClick={handleSave}
            disabled={saving || totalSelected === 0 || !routineName.trim()}
            className="w-full py-4 bg-neutral-900 text-white text-base font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
          >
            {saving ? dict.saving : `${dict.saveButton} (${totalSelected})`}
          </button>
        </div>
      </div>
    </div>
  );
}
