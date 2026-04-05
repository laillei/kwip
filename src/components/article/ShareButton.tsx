"use client";

import { useCallback } from "react";

export default function ShareButton() {
  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = document.title;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard not available
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center justify-center min-w-[44px] min-h-[44px] text-on-surface"
      aria-label="Share"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </button>
  );
}
