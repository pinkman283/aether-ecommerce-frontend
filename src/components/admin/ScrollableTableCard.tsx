"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface ScrollableTableCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollableTableCard({ children, className = "" }: ScrollableTableCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid dragging if clicking directly on interactive inputs
    const target = e.target as HTMLElement;
    if (target.closest("button, input, select, textarea, [role='button'], a")) {
      return;
    }

    if (!containerRef.current) return;

    dragInfo.current.isDown = true;
    dragInfo.current.startX = e.pageX - containerRef.current.offsetLeft;
    dragInfo.current.scrollLeft = containerRef.current.scrollLeft;
    dragInfo.current.hasMoved = false;

    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragInfo.current.isDown || !containerRef.current) return;

    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - dragInfo.current.startX) * 1.5; // Drag scroll velocity

    if (Math.abs(walk) > 3) {
      dragInfo.current.hasMoved = true;
    }

    containerRef.current.scrollLeft = dragInfo.current.scrollLeft - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!dragInfo.current.isDown) return;
    dragInfo.current.isDown = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const onMouseUp = () => handleMouseUp();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove, { passive: false });
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={`rounded-2xl bg-[#0e121e] border border-white/10 shadow-2xl overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className={`w-full overflow-x-auto transition-colors select-none ${
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
