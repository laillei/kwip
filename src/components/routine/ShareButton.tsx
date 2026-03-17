"use client";

import { useState } from "react";
import type { Routine } from "@/lib/types";
import { Button } from "@/components/ui";

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
    <Button
      variant="secondary"
      fullWidth
      onClick={handleShare}
      disabled={loading}
    >
      {loading ? dict.sharing : dict.shareButton}
    </Button>
  );
}
