"use client";

import React from "react";

interface ScrollableTableCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollableTableCard({ children, className = "" }: ScrollableTableCardProps) {
  return (
    <div
      className={`rounded-xl bg-[#0f121b] border border-white/[0.08] shadow-xs overflow-hidden ${className}`}
    >
      <div className="w-full overflow-x-auto custom-horizontal-scrollbar">
        {children}
      </div>
    </div>
  );
}
