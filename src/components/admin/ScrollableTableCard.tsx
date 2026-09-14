"use client";

import React from "react";

interface ScrollableTableCardProps {
  children: React.ReactNode;
  className?: string;
  scrollClassName?: string;
  maxHeight?: string;
}

export function ScrollableTableCard({
  children,
  className = "",
  scrollClassName = "",
  maxHeight,
}: ScrollableTableCardProps) {
  return (
    <div
      className={`rounded-xl bg-[#0f121b] border border-white/[0.08] shadow-xs overflow-hidden ${className}`}
    >
      <div
        className={`w-full overflow-auto custom-scrollbar relative ${scrollClassName}`}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
