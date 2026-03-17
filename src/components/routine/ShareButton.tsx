"use client";

import { useState } from "react";
import type { Routine } from "@/lib/types";

interface ShareButtonProps {
  routine: Routine;
  dict: {
    shareButton: string;
    sharing: string;
  };
}

export default function ShareButton({ routine, dict }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const payload = {
        name: routine.name,
        concern: routine.concern,
        products: routine.products,
      };
      const data = btoa(
        unescape(encodeURIComponent(JSON.stringify(payload)))
      ).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

      const response = await fetch(`/api/share?data=${data}`);
      if (!response.ok) throw new Error("Failed to generate share card");
      const blob = await response.blob();
      const file = new File([blob], "routine-kwip.png", { type: "image/png" });

      if (
        typeof navigator.share === "function" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: routine.name });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "routine-kwip.png";
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
      className="flex-1 text-center py-3 text-[15px] font-medium text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
    >
      {loading ? dict.sharing : dict.shareButton}
    </button>
  );
}
