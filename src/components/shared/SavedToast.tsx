"use client";

import { useEffect, useState } from "react";

interface Props {
  message: string;
}

export default function SavedToast({ message }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function handleSaved() {
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 2500);
    }

    window.addEventListener("kwip_product_saved", handleSaved);
    return () => {
      window.removeEventListener("kwip_product_saved", handleSaved);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed left-4 right-4 z-50 flex items-center justify-center h-[52px] bg-neutral-900 text-white text-[15px] font-semibold rounded-2xl pointer-events-none"
      style={{ bottom: "calc(49px + env(safe-area-inset-bottom) + 8px)" }}
    >
      {message}
    </div>
  );
}
