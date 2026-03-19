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

// Header (56px) + selector row (44px) = dropdown starts at 100px from viewport top
const DROPDOWN_TOP = 100;

export default function ConcernFilterBar({ options, selected, onSelect }: ConcernFilterBarProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.id === selected)?.label ?? options[0]?.label;

  function handleSelect(id: Concern | "all") {
    onSelect(id);
    setOpen(false);
  }

  return (
    <>
      {/* Selector row — shows current selection, tapping opens dropdown */}
      <div className="-mx-4 px-4 border-b border-neutral-100">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center justify-between w-full h-11 text-left"
        >
          <span className="text-[15px] font-semibold text-neutral-900">
            {selectedLabel}
          </span>
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

      {/* Dropdown overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[44] flex flex-col"
          style={{ top: `${DROPDOWN_TOP}px` }}
        >
          {/* Options grid */}
          <div className="bg-white border-b border-neutral-100" role="listbox">
            <div className="grid grid-cols-2">
              {options.map((option) => {
                const active = selected === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSelect(option.id)}
                    className={`text-left px-6 py-4 text-[17px] border-b border-neutral-100 transition-colors ${
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
          </div>

          {/* Scrim — fills remaining height, closes on tap */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
