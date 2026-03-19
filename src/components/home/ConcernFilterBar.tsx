"use client";

import { useState } from "react";
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

  function handleSelect(id: Concern | "all") {
    onSelect(id);
    setOpen(false);
  }

  return (
    <>
      {/* Tab row + inline grid — lives inside the sticky container, no fixed overlay */}
      <div className="-mx-4 px-4 border-b border-neutral-100 bg-white">
        {/* Scrollable tab row */}
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

          {/* Chevron — rotates when open */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Show all concerns"
            aria-expanded={open}
            className="shrink-0 flex items-center justify-center w-11 h-11 border-b-2 border-transparent -mb-px"
          >
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
          </button>
        </div>

        {/* Inline 2-column grid — expands below the tab row, no gap, no fixed positioning */}
        {open && (
          <div className="grid grid-cols-2 border-t border-neutral-100">
            {options.map((option) => {
              const active = selected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(option.id)}
                  className={`text-left px-4 py-3 text-[15px] border-b border-neutral-100 transition-colors ${
                    active
                      ? "font-semibold text-neutral-900"
                      : "font-normal text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Scrim — fixed, z below the sticky bar (z-48), closes on tap */}
      {open && (
        <div
          className="fixed inset-0 z-[46] bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
