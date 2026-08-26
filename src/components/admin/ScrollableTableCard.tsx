"use client";

import { useRef, useState } from "react";

interface ScrollableTableCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollableTableCard({ children, className = "" }: ScrollableTableCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Avoid triggering drag if clicking on interactive elements (buttons, inputs, links)
    const target = e.target as HTMLElement;
    if (target.closest("button, input, select, a, textarea, [role='button']")) {
      return;
    }

    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={`rounded-2xl bg-[#0e121e] border border-white/10 shadow-2xl overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`overflow-x-auto select-none transition-all scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-white/5 hover:scrollbar-thumb-amber-500/60 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(245, 158, 11, 0.4) rgba(255, 255, 255, 0.05)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
