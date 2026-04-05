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
      className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center px-4 h-12 bg-[#171717] text-white text-[13px] font-medium pointer-events-none w-fit"
      style={{ bottom: "calc(49px + env(safe-area-inset-bottom) + 8px)" }}
    >
      {message}
    </div>
  );
}
