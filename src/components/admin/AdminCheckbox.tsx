"use client";

import React from "react";
import { Check, Minus } from "lucide-react";

interface AdminCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  title?: string;
  ariaLabel?: string;
  className?: string;
}

export function AdminCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  id,
  name,
  title,
  ariaLabel,
  className = "",
}: AdminCheckboxProps) {
  return (
    <label
      className={`relative inline-flex items-center justify-center select-none group ${
        disabled ? "opacity-35 cursor-not-allowed pointer-events-none" : "cursor-pointer"
      } ${className}`}
      title={title}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        e.stopPropagation();
      }}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only peer"
        aria-label={ariaLabel || title}
      />
      <div
        className={`w-4 h-4 rounded-[5px] flex items-center justify-center transition-all duration-150 border ${
          checked || indeterminate
            ? "bg-amber-500 border-amber-400 text-slate-950 shadow-sm shadow-amber-500/20"
            : "bg-white/[0.04] border-white/20 hover:border-amber-400/50 hover:bg-white/[0.07] peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500/40"
        }`}
      >
        {checked && !indeterminate && (
          <Check className="w-3 h-3 stroke-[3] text-slate-950" />
        )}
        {indeterminate && (
          <Minus className="w-3 h-3 stroke-[3] text-slate-950" />
        )}
      </div>
    </label>
  );
}

