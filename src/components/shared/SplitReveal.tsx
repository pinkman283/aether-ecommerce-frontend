"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, animate } from "framer-motion";
import { useAppTheme } from "@/components/providers/ThemeProvider";
import { ThemeSettings } from "@/store/useThemeStore";
import { Sparkles } from "lucide-react";

export function SplitReveal({ initialTheme }: { initialTheme?: ThemeSettings }) {
  const pathname = usePathname();
  const { theme } = useAppTheme();
  const isAdmin = pathname?.startsWith("/admin");

  // Always merge initialTheme with dynamic context theme so client updates instantly reflect
  const activeTheme = { ...(initialTheme || {}), ...theme };

  const splitRevealEnabled = activeTheme.split_reveal_enabled ?? true;

  // Determine initial visibility immediately so it covers the screen before first paint
  const [isVisible, setIsVisible] = useState(() => {
    if (pathname?.startsWith("/admin")) return false;
    if (splitRevealEnabled === false) return false;
    if (typeof window !== "undefined") {
      try {
        const mode = activeTheme.split_reveal_mode;
        if (mode === "once_per_session" && sessionStorage.getItem("aether_split_reveal_seen")) {
          return false;
        }
      } catch (e) {}
    }
    return true;
  });

  const [loaderProgress, setLoaderProgress] = useState(0);
  const [isOpening, setIsOpening] = useState(false);

  // Active image: always use latest active image so newly uploaded images cleanly replace previous ones
  const bgImage = activeTheme.split_reveal_image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2000&q=85";
  const brandTitle = (activeTheme.split_reveal_title && activeTheme.split_reveal_title !== "AETHER")
    ? activeTheme.split_reveal_title
    : (activeTheme.store_brand_name || "AETHER");
  const duration = activeTheme.split_reveal_duration || 2.2;
  const dimOpacity = activeTheme.split_reveal_dim ?? 0.45;
  const logoUrl = activeTheme.split_reveal_logo || activeTheme.store_brand_logo || "";
  const isVertical = ((activeTheme.split_reveal_direction || "vertical") === "vertical");

  // Keep image highly visible and bright, reduce dim overlay drastically
  const effectiveDim = Math.min(dimOpacity * 0.1, 0.04);

  // Increased opening duration for grand, cinematic feel
  const openingDuration = Math.max(Number(duration) || 3.2, 3.0);
  // Ultra-smooth cubic-bezier curve (starts gently, glides smoothly, decelerates with supreme grace)
  const cinematicEase = [0.65, 0, 0.35, 1] as const;

  const startRevealAnimation = useCallback(() => {
    setIsVisible(true);
    setIsOpening(false);
    setLoaderProgress(0);

    let openTimer: NodeJS.Timeout | null = null;
    let finishTimer: NodeJS.Timeout | null = null;

    // Framer Motion precision loader: animates 0% -> 100% over 1.8s
    const controls = animate(0, 100, {
      duration: 1.8,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => {
        setLoaderProgress(Math.round(latest));
      },
      onComplete: () => {
        // Once loader finishes, pause briefly (250ms), then smoothly open the shutters
        openTimer = setTimeout(() => {
          setIsOpening(true);
        }, 250);
      },
    });

    // Total animation runtime before unmounting split screen curtain
    const totalAnimDuration = 1800 + 250 + (openingDuration * 1000) + 400;
    finishTimer = setTimeout(() => {
      setIsVisible(false);
      setIsOpening(false);
    }, totalAnimDuration);

    return () => {
      controls.stop();
      if (openTimer) clearTimeout(openTimer);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [openingDuration]);

  useEffect(() => {
    if (isAdmin) {
      setIsVisible(false);
      return;
    }
    if (splitRevealEnabled === false) {
      setIsVisible(false);
      return;
    }

    // Check session mode
    const mode = initialTheme?.split_reveal_mode || theme.split_reveal_mode;
    if (mode === "once_per_session") {
      const hasSeen = sessionStorage.getItem("aether_split_reveal_seen");
      if (hasSeen) {
        setIsVisible(false);
        return;
      }
      sessionStorage.setItem("aether_split_reveal_seen", "true");
    }

    // Preload logo image immediately for instant frame-1 display on cold reload
    if (logoUrl && typeof window !== "undefined") {
      const img = new Image();
      img.src = logoUrl;
    }

    const cleanup = startRevealAnimation();
    return cleanup;
  }, [isAdmin, splitRevealEnabled, initialTheme?.split_reveal_mode, theme.split_reveal_mode, startRevealAnimation, logoUrl]);

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

  // Unified single-line logo + brand title component (splits cleanly with the shutters)
  const renderBrandLine = () => (
    <div className="flex items-center justify-center gap-3 sm:gap-4 whitespace-nowrap pointer-events-none select-none px-4">
      {logoUrl ? (
        <div 
          className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-2 border-2 sm:border-3 border-cyan-400/50 bg-black/40 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center shrink-0 ring-1 ring-white/20"
          suppressHydrationWarning
        >
          <img
            src={logoUrl}
            alt={brandTitle}
            fetchPriority="high"
            decoding="sync"
            className="w-full h-full object-contain rounded-full filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
            suppressHydrationWarning
          />
        </div>
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 sm:border-3 border-cyan-400/50 backdrop-blur-md p-2 flex items-center justify-center bg-black/70 shadow-2xl relative shrink-0 ring-1 ring-white/20">
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
            style={{
              background: "linear-gradient(135deg, var(--theme-primary, #06b6d4), var(--theme-secondary, #6366f1))",
            }}
          >
            <span className="font-black text-sm sm:text-xl tracking-tighter text-slate-950">
              {brandTitle.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 absolute -top-1 -right-1 animate-spin duration-3000" />
        </div>
      )}

      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-widest text-white uppercase leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
        {brandTitle}
      </h1>
    </div>
  );

  // Clean minimal loader bar (no percentage numbers, no status text)
  const renderLoaderBar = () => (
    <div 
      className="w-48 sm:w-64 h-1 sm:h-1.5 rounded-full bg-white/20 overflow-hidden relative border border-white/30 shadow-lg backdrop-blur-sm pointer-events-none transition-opacity duration-300"
      style={{ opacity: isOpening ? 0 : 1 }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${loaderProgress}%`,
          background: "linear-gradient(90deg, var(--theme-primary, #06b6d4), var(--theme-secondary, #6366f1))",
          boxShadow: "0 0 12px var(--theme-primary, #06b6d4)",
          transitionDuration: "0.05s",
        }}
      />
    </div>
  );

  return (
    <AnimatePresence>
      <div 
        id="split-reveal-curtain"
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
              transition={{ duration: openingDuration, ease: cinematicEase }}
              className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden border-b shadow-2xl"
              style={{
                backgroundColor: "var(--theme-bg, #090a0f)",
                borderBottomColor: "color-mix(in srgb, var(--theme-primary, #06b6d4) 40%, transparent)",
                willChange: "transform",
                transform: "translateZ(0)",
              }}
            >
              {/* Seamless Fullscreen Background (shows top half) */}
              <div
                className="absolute top-0 left-0 w-full h-[100vh] bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url("${bgImage}")` }}
              />

              {/* Ultra-subtle tint so image is vivid and clearly visible */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "var(--theme-bg, #090a0f)", opacity: effectiveDim }}
              />
              {/* Greatly reduced edge vignette (no heavy black blur) */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent" />

              {/* Seam Glow Line at Bottom Edge */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[1px]"
                style={{
                  background: "linear-gradient(90deg, transparent, var(--theme-primary, #06b6d4), transparent)",
                  boxShadow: "0 0 14px var(--theme-primary, #06b6d4)",
                }}
              />

              {/* Top Half of Logo + Brand Name (centered on split seam) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 pointer-events-none">
                {renderBrandLine()}
              </div>
            </motion.div>

            {/* BOTTOM SHUTTER (50vh to 100vh) */}
            <motion.div
              initial={{ y: "0%" }}
              animate={{ y: isOpening ? "100%" : "0%" }}
              transition={{ duration: openingDuration, ease: cinematicEase }}
              className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden border-t shadow-2xl"
              style={{
                backgroundColor: "var(--theme-bg, #090a0f)",
                borderTopColor: "color-mix(in srgb, var(--theme-primary, #06b6d4) 40%, transparent)",
                willChange: "transform",
                transform: "translateZ(0)",
              }}
            >
              {/* Seamless Fullscreen Background offset by 50vh (shows bottom half) */}
              <div
                className="absolute -top-[50vh] left-0 w-full h-[100vh] bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url("${bgImage}")` }}
              />

              {/* Ultra-subtle tint so image is vivid and clearly visible */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "var(--theme-bg, #090a0f)", opacity: effectiveDim }}
              />
              {/* Greatly reduced edge vignette (no heavy black blur) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

              {/* Seam Glow Line at Top Edge */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background: "linear-gradient(90deg, transparent, var(--theme-primary, #06b6d4), transparent)",
                  boxShadow: "0 0 14px var(--theme-primary, #06b6d4)",
                }}
              />

              {/* Bottom Half of Logo + Brand Name (centered on split seam) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                {renderBrandLine()}
              </div>

              {/* Clean Minimal Progress Loader Bar (positioned below the split line) */}
              <div className="absolute top-14 sm:top-18 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
                {renderLoaderBar()}
              </div>
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
              transition={{ duration: openingDuration, ease: cinematicEase }}
              className="absolute top-0 bottom-0 left-0 w-1/2 overflow-hidden border-r shadow-2xl"
              style={{
                backgroundColor: "var(--theme-bg, #090a0f)",
                borderRightColor: "color-mix(in srgb, var(--theme-primary, #06b6d4) 40%, transparent)",
                willChange: "transform",
                transform: "translateZ(0)",
              }}
            >
              <div
                className="absolute top-0 left-0 w-[100vw] h-full bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url("${bgImage}")` }}
              />
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "var(--theme-bg, #090a0f)", opacity: effectiveDim }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" />
              <div
                className="absolute top-0 bottom-0 right-0 w-[1px]"
                style={{
                  background: "linear-gradient(180deg, transparent, var(--theme-primary, #06b6d4), transparent)",
                  boxShadow: "0 0 14px var(--theme-primary, #06b6d4)",
                }}
              />

              {/* Left Half of Logo + Brand Name */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-20 pointer-events-none">
                {renderBrandLine()}
              </div>

              {/* Left Half of Minimal Loader Bar */}
              <div className="absolute bottom-16 right-0 translate-x-1/2 z-20 pointer-events-none">
                {renderLoaderBar()}
              </div>
            </motion.div>

            {/* RIGHT SHUTTER (50vw to 100vw) */}
            <motion.div
              initial={{ x: "0%" }}
              animate={{ x: isOpening ? "100%" : "0%" }}
              transition={{ duration: openingDuration, ease: cinematicEase }}
              className="absolute top-0 bottom-0 right-0 w-1/2 overflow-hidden border-l shadow-2xl"
              style={{
                backgroundColor: "var(--theme-bg, #090a0f)",
                borderLeftColor: "color-mix(in srgb, var(--theme-primary, #06b6d4) 40%, transparent)",
                willChange: "transform",
                transform: "translateZ(0)",
              }}
            >
              <div
                className="absolute top-0 -left-[50vw] w-[100vw] h-full bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url("${bgImage}")` }}
              />
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "var(--theme-bg, #090a0f)", opacity: effectiveDim }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/15 via-transparent to-transparent" />
              <div
                className="absolute top-0 bottom-0 left-0 w-[1px]"
                style={{
                  background: "linear-gradient(180deg, transparent, var(--theme-primary, #06b6d4), transparent)",
                  boxShadow: "0 0 14px var(--theme-primary, #06b6d4)",
                }}
              />

              {/* Right Half of Logo + Brand Name */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none">
                {renderBrandLine()}
              </div>

              {/* Right Half of Minimal Loader Bar */}
              <div className="absolute bottom-16 left-0 -translate-x-1/2 z-20 pointer-events-none">
                {renderLoaderBar()}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </AnimatePresence>
  );
}
