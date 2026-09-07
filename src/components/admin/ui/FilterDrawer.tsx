"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";

export interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onApply: () => void;
  onReset?: () => void;
  applyLabel?: string;
  resetLabel?: string;
  isApplying?: boolean;
  accentColor?: "amber" | "cyan" | "emerald";
  children: React.ReactNode;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onOpenChange,
  title = "Filter",
  onApply,
  onReset,
  applyLabel = "Done",
  resetLabel = "Reset",
  isApplying = false,
  accentColor = "amber",
  children,
}) => {
  const getAccentBtnClasses = () => {
    switch (accentColor) {
      case "cyan":
        return "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm";
      case "emerald":
        return "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm";
      case "amber":
      default:
        return "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:w-[380px] sm:!max-w-[380px] max-w-full bg-[#0b0e17] border-l border-white/[0.08] p-0 flex flex-col justify-between shadow-2xl text-slate-100 overflow-hidden"
      >
        {/* Compact Header: h-12 */}
        <div className="h-12 px-5 border-b border-white/[0.06] bg-[#0b0e17] flex items-center justify-between shrink-0">
          <SheetTitle className="text-xs font-semibold text-white tracking-wide">
            {title}
          </SheetTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Clean Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {children}
        </div>

        {/* Compact Footer: h-12 */}
        <div className="h-12 px-5 border-t border-white/[0.06] bg-[#0b0e17] flex items-center justify-between shrink-0">
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer px-1 py-1"
            >
              {resetLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer px-1 py-1"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={onApply}
            disabled={isApplying}
            className={`h-8 px-4 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center ${getAccentBtnClasses()}`}
          >
            {isApplying ? "Applying..." : applyLabel}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
