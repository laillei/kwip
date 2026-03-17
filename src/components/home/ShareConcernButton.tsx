"use client";

import { useState } from "react";

interface Props {
  concern: string;
  locale: string;
  label: string; // from dict.home.shareConcern
}

export default function ShareConcernButton({ concern, locale, label }: Props) {
  const [loading, setLoading] = useState(false);
  const sharingLabel = loading ? "..." : label;

  const handleShare = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/share-concern?concern=${encodeURIComponent(concern)}&locale=${encodeURIComponent(locale)}`
      );
      if (!response.ok) throw new Error("Failed to generate share card");
      const blob = await response.blob();
      const file = new File([blob], `kwip-${concern}.png`, {
        type: "image/png",
      });

      if (
        typeof navigator.share === "function" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: `Kwip Routine` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kwip-${concern}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="w-full py-3 text-[15px] font-medium text-neutral-500 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-2"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
      </svg>
      {sharingLabel}
    </button>
  );
}
