"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Concern } from "@/lib/types";

interface ConcernOption {
  id: Concern | "all";
  label: string;
}

interface ConcernFilterBarProps {
  options: ConcernOption[];
  selected: Concern | "all";
  onSelect: (id: Concern | "all") => void;
}

export default function ConcernFilterBar({ options, selected, onSelect }: ConcernFilterBarProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleSelect(id: Concern | "all") {
    onSelect(id);
    setOpen(false);
  }

  const chevronIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  return (
    <>
      {!open ? (
        /* ── Collapsed: scrollable tab row ── */
        <div className="-mx-4 px-4 border-b border-neutral-100 bg-white">
          <div className="flex items-center">
            <div className="flex overflow-x-auto no-scrollbar flex-1">
              {options.map((option) => {
                const active = selected === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelect(option.id)}
                    className={`shrink-0 px-4 h-11 text-[15px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
                      active
                        ? "font-semibold text-neutral-900 border-neutral-900"
                        : "font-normal text-neutral-400 border-transparent"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Show all concerns"
              className="shrink-0 flex items-center justify-center w-11 h-11 border-b-2 border-transparent -mb-px"
            >
              {chevronIcon}
            </button>
          </div>
        </div>
      ) : (
        /* ── Expanded: 2-col grid replaces tab row, grows sticky bar ── */
        <div className="relative -mx-4 px-4 border-b border-neutral-100 bg-white">
          {/* Close chevron — top-right of grid */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close concerns"
            className="absolute top-0 right-4 flex items-center justify-center w-11 h-11 z-10"
          >
            {chevronIcon}
          </button>

          <div className="grid grid-cols-2 py-2">
            {options.map((option, i) => {
              const active = selected === option.id;
              const isLastOdd = i === options.length - 1 && options.length % 2 !== 0;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`text-left py-3 text-[15px] transition-colors ${
                    isLastOdd ? "col-span-2" : ""
                  } ${
                    active
                      ? "font-semibold text-neutral-900"
                      : "font-normal text-neutral-500"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/*
        Scrim via portal — renders at <body>, so z-[47] is in the ROOT stacking context.
        - Below sticky concern bar (z-[48]) → grid stays visible above scrim
        - Below header + bottom nav (z-50) → nav stays usable
        - Above step bar (z-[30]) and product list → dims them correctly
      */}
      {open && mounted && createPortal(
        <div
          className="fixed inset-x-0 bottom-0 top-14 z-[47] bg-black/40"
          onClick={() => setOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
