"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Concern } from "@/types";

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
      {/*
        Outer div is always 44px — holds the scrollable tabs underneath.
        When open, the absolute grid covers this bar AND extends below it,
        visually replacing the tabs without shifting any content.
      */}
      {/* Mobile: white bg + border. Desktop: transparent, no border */}
      <div className="relative -mx-4 px-4 border-b border-neutral-100 bg-white md:bg-transparent md:border-b-0">
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
                  className={`shrink-0 px-4 h-11 text-[13px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
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
          {/* Chevron: mobile only */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Show all concerns"
            className="md:hidden shrink-0 flex items-center justify-center w-11 h-11 border-b-2 border-transparent -mb-px"
          >
            {chevronIcon}
          </button>
        </div>

        {/* Grid overlay: mobile only */}
        {open && (
          <div className="md:hidden absolute top-0 left-0 right-0 z-[48] bg-white border-b border-neutral-100 px-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close concerns"
              className="absolute top-0 right-0 flex items-center justify-center w-11 h-11"
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
                    className={`text-left py-3 text-[13px] transition-colors min-h-[44px] flex items-center ${
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
      </div>

      {/* Scrim: mobile only */}
      {open && mounted && createPortal(
        <div
          className="md:hidden fixed inset-x-0 bottom-0 top-14 z-[47] bg-black/40"
          onClick={() => setOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
