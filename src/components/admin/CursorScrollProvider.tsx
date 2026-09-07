"use client";

import { useEffect } from "react";

/**
 * CursorScrollProvider delivers buttery-smooth cursor drag-scrolling and
 * momentum-driven inertia scrolling across all scrollable cards and tables.
 */
export function CursorScrollProvider() {
  useEffect(() => {
    let activeElement: HTMLElement | null = null;
    let isDown = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentScrollLeft = 0;
    let targetScrollLeft = 0;
    let velocityX = 0;
    let lastMouseX = 0;
    let lastTime = 0;
    let rafId: number | null = null;

    // Helper: find nearest scrollable ancestor container
    const findScrollable = (target: HTMLElement | null): HTMLElement | null => {
      let el = target;
      while (el && el !== document.body && el !== document.documentElement) {
        const canScrollX = el.scrollWidth > el.clientWidth + 2;
        const canScrollY = el.scrollHeight > el.clientHeight + 2;

        if (canScrollX || canScrollY) {
          const style = window.getComputedStyle(el);
          const isScrollableX =
            (style.overflowX === "auto" || style.overflowX === "scroll") && canScrollX;
          const isScrollableY =
            (style.overflowY === "auto" || style.overflowY === "scroll") && canScrollY;

          if (isScrollableX || isScrollableY) {
            return el;
          }
        }
        el = el.parentElement;
      }
      return null;
    };

    const isInteractive = (target: HTMLElement | null): boolean => {
      if (!target) return false;
      return !!target.closest(
        "button, input, select, textarea, a, [role='button'], [data-no-drag], label"
      );
    };

    // Physics animation loop using requestAnimationFrame
    const updatePhysics = () => {
      if (!activeElement) {
        rafId = null;
        return;
      }

      if (isDragging) {
        // Smooth lerp towards target scroll position while dragging
        const diff = targetScrollLeft - currentScrollLeft;
        if (Math.abs(diff) > 0.5) {
          currentScrollLeft += diff * 0.45;
          activeElement.scrollLeft = Math.round(currentScrollLeft);
        } else {
          currentScrollLeft = targetScrollLeft;
          activeElement.scrollLeft = Math.round(currentScrollLeft);
        }
        rafId = requestAnimationFrame(updatePhysics);
      } else if (Math.abs(velocityX) > 0.3) {
        // Inertia glide with friction
        currentScrollLeft -= velocityX;
        velocityX *= 0.91; // Smooth friction decay

        // Boundary clamp
        const maxScroll = activeElement.scrollWidth - activeElement.clientWidth;
        if (currentScrollLeft <= 0) {
          currentScrollLeft = 0;
          velocityX = 0;
        } else if (currentScrollLeft >= maxScroll) {
          currentScrollLeft = maxScroll;
          velocityX = 0;
        }

        activeElement.scrollLeft = Math.round(currentScrollLeft);
        rafId = requestAnimationFrame(updatePhysics);
      } else {
        velocityX = 0;
        rafId = null;
      }
    };

    const startPhysicsLoop = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updatePhysics);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Left mouse click only
      const target = e.target as HTMLElement;
      if (isInteractive(target)) return;

      const scrollable = findScrollable(target);
      if (!scrollable) return;

      // Stop any existing momentum
      velocityX = 0;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      activeElement = scrollable;
      isDown = true;
      isDragging = false;
      startX = e.pageX;
      startY = e.pageY;
      lastMouseX = e.pageX;
      lastTime = performance.now();
      currentScrollLeft = scrollable.scrollLeft;
      targetScrollLeft = scrollable.scrollLeft;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown || !activeElement) return;

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const deltaX = e.pageX - startX;
      const stepX = e.pageX - lastMouseX;

      // Track instantaneous velocity for inertia
      velocityX = (stepX / dt) * 14;
      lastMouseX = e.pageX;
      lastTime = now;

      if (!isDragging && (Math.abs(deltaX) > 4 || Math.abs(e.pageY - startY) > 4)) {
        isDragging = true;
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
        activeElement.style.cursor = "grabbing";
        activeElement.style.userSelect = "none";
      }

      if (isDragging) {
        e.preventDefault();
        targetScrollLeft -= stepX * 1.15;
        startPhysicsLoop();
      }
    };

    const handleMouseUp = () => {
      if (!isDown) return;
      isDown = false;

      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      if (activeElement) {
        activeElement.style.cursor = "";
        activeElement.style.userSelect = "";
      }

      if (isDragging) {
        isDragging = false;
        // Launch momentum glide if velocity exists
        if (Math.abs(velocityX) > 0.5) {
          startPhysicsLoop();
        }

        // Suppress accidental click on release
        const captureClick = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
          window.removeEventListener("click", captureClick, true);
        };
        window.addEventListener("click", captureClick, true);
        setTimeout(() => {
          window.removeEventListener("click", captureClick, true);
        }, 60);
      }
    };

    // Horizontal mouse wheel: only intercept when user holds Shift or uses trackpad horizontal delta
    // Never hijack normal vertical mouse scrolling so the page scrolls down smoothly!
    const handleWheel = (e: WheelEvent) => {
      const isHorizontalIntent = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!isHorizontalIntent) {
        // Normal vertical wheel: let the page scroll down naturally!
        return;
      }

      const target = e.target as HTMLElement;
      let el: HTMLElement | null = target;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.scrollWidth > el.clientWidth + 2) {
          const style = window.getComputedStyle(el);
          if (style.overflowX === "auto" || style.overflowX === "scroll") {
            const delta = e.shiftKey ? e.deltaY : e.deltaX;
            if (Math.abs(delta) > 0) {
              e.preventDefault();
              activeElement = el;
              currentScrollLeft = el.scrollLeft;
              targetScrollLeft = Math.max(
                0,
                Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + delta * 0.8)
              );
              isDragging = true;
              startPhysicsLoop();
              setTimeout(() => {
                isDragging = false;
              }, 50);
              return;
            }
          }
        }
        el = el.parentElement;
      }
    };

    // Show grab cursor on hover for scrollable areas
    const handleMouseOver = (e: MouseEvent) => {
      if (isDown) return;
      const target = e.target as HTMLElement;
      if (isInteractive(target)) return;

      const scrollable = findScrollable(target);
      if (scrollable && scrollable.scrollWidth > scrollable.clientWidth + 2) {
        if (!scrollable.style.cursor) {
          scrollable.style.cursor = "grab";
        }
      }
    };

    window.addEventListener("mousedown", handleMouseDown, { passive: false });
    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleMouseUp, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return null;
}
