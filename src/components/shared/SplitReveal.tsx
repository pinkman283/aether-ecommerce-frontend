"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/store/useThemeStore";
import { Sparkles } from "lucide-react";

export function SplitReveal() {
  const pathname = usePathname();
  const { theme, isLoaded } = useThemeStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Avoid running inside admin dashboard
  const isAdmin = pathname?.startsWith("/admin");

  const startRevealAnimation = useCallback(() => {
    setIsVisible(true);
    setIsOpening(false);

    // Initial hold time (1100ms) before splitting so the user can clearly see the image and brand identity
    const holdTimer = setTimeout(() => {
      setIsOpening(true);
    }, 1100);

    // Duration of shutter motion
    const animDuration = (theme.split_reveal_duration || 2.2) * 1000;
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      setIsOpening(false);
    }, 1100 + animDuration + 300);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(finishTimer);
    };
  }, [theme.split_reveal_duration]);

  useEffect(() => {
    if (isAdmin) return;
    if (!isLoaded) return;
    if (theme.split_reveal_enabled === false) return;

    // Check session mode
    if (theme.split_reveal_mode === "once_per_session") {
      const hasSeen = sessionStorage.getItem("aether_split_reveal_seen");
      if (hasSeen) return;
      sessionStorage.setItem("aether_split_reveal_seen", "true");
    }

    const cleanup = startRevealAnimation();
    return cleanup;
  }, [isAdmin, isLoaded, theme.split_reveal_enabled, theme.split_reveal_mode, startRevealAnimation]);

  // Global event listener for admin live preview testing
  useEffect(() => {
    const handlePreviewEvent = () => {
      startRevealAnimation();
    };

    window.addEventListener("preview-split-reveal", handlePreviewEvent);
    return () => window.removeEventListener("preview-split-reveal", handlePreviewEvent);
  }, [startRevealAnimation]);

  if (isAdmin || !isVisible) {
    return null;
  }

  const duration = theme.split_reveal_duration || 2.2;
  const bgImage = theme.split_reveal_image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2000&q=85";
  const brandTitle = theme.split_reveal_title || theme.store_brand_name || "AETHER";
  const brandSubtitle = theme.split_reveal_subtitle || theme.store_brand_tagline || "PRECISION ACOUSTICS & HARDWARE";
  const dimOpacity = theme.split_reveal_dim ?? 0.45;
  const logoUrl = theme.split_reveal_logo;
  const isVertical = (theme.split_reveal_direction || "vertical") === "vertical";

  // Cinematic expo easing
  const easing = [0.83, 0, 0.17, 1] as const;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* ========================================================================= */}
        {/* VERTICAL SPLIT: TOP & BOTTOM SHUTTERS */}
        {/* ========================================================================= */}
        {isVertical ? (
          <>
            {/* TOP SHUTTER (0% to 50vh) */}
            <motion.div
              initial={{ y: "0%" }}
              animate={{ y: isOpening ? "-100%" : "0%" }}
              transition={{ duration, ease: easing }}
              className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden bg-[#090a0f] border-b border-cyan-500/40 shadow-2xl"
              style={{ willChange: "transform" }}
            >
              {/* Seamless Fullscreen Background (shows top half) */}
              <div
                className="absolute top-0 left-0 w-full h-[100vh] bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url("${bgImage}")` }}
              />

              {/* Darkening & Color Tint Overlay */}
              <div
                className="absolute inset-0 bg-[#090a0f]"
                style={{ opacity: dimOpacity }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-cyan-950/30" />

              {/* Seam Glow Line at Bottom Edge */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_#06b6d4]" />
            </motion.div>

            {/* BOTTOM SHUTTER (50vh to 100vh) */}
            <motion.div
              initial={{ y: "0%" }}
              animate={{ y: isOpening ? "100%" : "0%" }}
              transition={{ duration, ease: easing }}
              className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden bg-[#090a0f] border-t border-cyan-500/40 shadow-2xl"
              style={{ willChange: "transform" }}
            >
              {/* Seamless Fullscreen Background offset by 50vh (shows bottom half) */}
              <div
                className="absolute -top-[50vh] left-0 w-full h-[100vh] bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url("${bgImage}")` }}
              />

              {/* Darkening & Color Tint Overlay */}
              <div
                className="absolute inset-0 bg-[#090a0f]"
                style={{ opacity: dimOpacity }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-indigo-950/30" />

              {/* Seam Glow Line at Top Edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_#06b6d4]" />
            </motion.div>
          </>
        ) : (
          /* ========================================================================= */
          /* HORIZONTAL SPLIT: LEFT & RIGHT SHUTTERS */
          /* ========================================================================= */
          <>
            {/* LEFT SHUTTER (0% to 50vw) */}
            <motion.div
              initial={{ x: "0%" }}
              animate={{ x: isOpening ? "-100%" : "0%" }}
              transition={{ duration, ease: easing }}
              className="absolute top-0 bottom-0 left-0 w-1/2 overflow-hidden bg-[#090a0f] border-r border-cyan-500/40 shadow-2xl"
              style={{ willChange: "transform" }}
            >
              <div
                className="absolute top-0 left-0 w-[100vw] h-full bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url("${bgImage}")` }}
              />
              <div
                className="absolute inset-0 bg-[#090a0f]"
                style={{ opacity: dimOpacity }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-cyan-950/30" />
              <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_#06b6d4]" />
            </motion.div>

            {/* RIGHT SHUTTER (50vw to 100vw) */}
            <motion.div
              initial={{ x: "0%" }}
              animate={{ x: isOpening ? "100%" : "0%" }}
              transition={{ duration, ease: easing }}
              className="absolute top-0 bottom-0 right-0 w-1/2 overflow-hidden bg-[#090a0f] border-l border-cyan-500/40 shadow-2xl"
              style={{ willChange: "transform" }}
            >
              <div
                className="absolute top-0 -left-[50vw] w-[100vw] h-full bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url("${bgImage}")` }}
              />
              <div
                className="absolute inset-0 bg-[#090a0f]"
                style={{ opacity: dimOpacity }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-indigo-950/30" />
              <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_#06b6d4]" />
            </motion.div>
          </>
        )}

        {/* ========================================================================= */}
        {/* CENTER EMBLEM & BRAND IDENTITY (Sits directly in the center seam) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          animate={{
            opacity: isOpening ? 0 : 1,
            scale: isOpening ? 1.25 : 1,
            filter: isOpening ? "blur(12px)" : "blur(0px)",
          }}
          transition={{
            duration: isOpening ? duration * 0.55 : 0.3,
            ease: "easeOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        >
          {/* Glowing Aura Ring */}
          <div className="relative mb-4">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 rounded-full blur-xl animate-pulse" />
            
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/85 border border-white/20 backdrop-blur-md p-4 flex items-center justify-center shadow-2xl shadow-cyan-500/25">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandTitle}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                />
              ) : (
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 shadow-inner">
                    <span className="font-black text-xl tracking-tighter text-slate-950">
                      {brandTitle.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-cyan-300 absolute -top-1.5 -right-1.5 animate-spin duration-3000" />
                </div>
              )}
            </div>
          </div>

          {/* Brand Typography */}
          <div className="space-y-1.5 max-w-md">
            <h1 className="text-2xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-indigo-200 uppercase drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
              {brandTitle}
            </h1>
            <p className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              {brandSubtitle}
            </p>
          </div>

          {/* High-Tech Pulse Loading Bar */}
          <div className="mt-5 w-44 sm:w-56 h-1 rounded-full bg-white/10 overflow-hidden relative border border-white/10">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: "easeInOut",
              }}
              className="w-1/2 h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full shadow-[0_0_8px_#06b6d4]"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
