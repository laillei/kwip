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
  const selectedLabel = options.find((o) => o.id === selected)?.label ?? options[0]?.label;

  function handleSelect(id: Concern | "all") {
    onSelect(id);
    setOpen(false);
  }

  const chevron = (
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
        Outer div is `relative` so the absolute grid anchors to its bottom edge.
        -mx-4 makes it span full screen width; px-4 restores content padding.
        Height is always 44px (h-11) — no layout shift when grid opens.
      */}
      <div className="relative -mx-4 px-4 border-b border-neutral-100 bg-white">
        <div className="flex items-center h-11">
          {!open ? (
            /* Collapsed — scrollable tabs + chevron */
            <>
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
                className="shrink-0 flex items-center justify-center w-11 h-11"
              >
                {chevron}
              </button>
            </>
          ) : (
            /* Expanded — active label replaces tabs, chevron rotated */
            <>
              <span className="flex-1 text-[15px] font-semibold text-neutral-900">
                {selectedLabel}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close concerns"
                className="shrink-0 flex items-center justify-center w-11 h-11"
              >
                {chevron}
              </button>
            </>
          )}
        </div>

        {/*
          Absolute grid — anchors to bottom of the bar via top-full.
          left-0 right-0 span full width of the -mx-4 parent (= full screen).
          Floats over content, no layout push.
          Inherits z-[48] stacking context from sticky container in DiscoveryHub.
        */}
        {open && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-100">
            <div className="grid grid-cols-2">
              {options.map((option) => {
                const active = selected === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
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
          </div>
        )}
      </div>

      {/*
        Scrim at z-[47]:
        - Below sticky concern bar (z-[48]) → grid stays visible
        - Below header and bottom tab bar (z-50) → nav stays usable
        - Above step filter bar (z-[30]) and content → properly dims everything else
      */}
      {open && (
        <div
          className="fixed inset-0 z-[47] bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
