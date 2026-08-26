"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface AdminDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  align?: "left" | "right";
}

export function AdminDropdown({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  size = "md",
  disabled = false,
  align = "left",
}: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = Math.min(options.length * 36 + 16, 260);
    const placeAbove = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    const minWidth = Math.max(rect.width, 160);
    let leftPos = align === "right" ? rect.right - minWidth : rect.left;

    // Viewport bounds protection
    if (leftPos + minWidth > window.innerWidth - 12) {
      leftPos = window.innerWidth - minWidth - 12;
    }
    if (leftPos < 12) {
      leftPos = 12;
    }

    const style: React.CSSProperties = {
      position: "fixed",
      left: `${leftPos}px`,
      minWidth: `${minWidth}px`,
      maxWidth: "320px",
      maxHeight: "260px",
      zIndex: 99999,
    };

    if (placeAbove) {
      style.bottom = `${window.innerHeight - rect.top + 6}px`;
    } else {
      style.top = `${rect.bottom + 6}px`;
    }

    setMenuStyle(style);
  }, [options.length, align]);

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      const handleScrollOrResize = () => {
        calculatePosition();
      };

      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);

      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [isOpen, calculatePosition]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-[11px] rounded-xl",
    md: "px-3.5 py-2 text-xs rounded-xl",
    lg: "px-4 py-2.5 text-xs rounded-2xl",
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!isOpen) {
            calculatePosition();
          }
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between gap-2.5 font-bold transition-all focus:outline-none cursor-pointer select-none ${
          sizeClasses[size]
        } ${
          isOpen
            ? "bg-[#141824] border-amber-400 text-white shadow-lg shadow-amber-500/10"
            : "bg-[#0e121e] hover:bg-[#141824] border-white/10 hover:border-white/20 text-slate-200 hover:text-white"
        } border ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Floating Popover rendered in Portal so it floats above all table/card overflow containers */}
      {isOpen && mounted && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className={`rounded-2xl bg-[#0c0e15]/95 backdrop-blur-2xl border border-amber-500/30 shadow-2xl p-1.5 space-y-0.5 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  {opt.icon}
                  {opt.label}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
