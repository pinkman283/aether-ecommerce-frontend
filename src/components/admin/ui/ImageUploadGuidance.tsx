"use client";

import React, { useState, useEffect } from "react";
import { Info, AlertCircle, Smartphone, Monitor } from "lucide-react";
import { getImageSlot, ImageSlotConfig } from "@/config/imageSlots";

interface ImageUploadGuidanceProps {
  slotKey?: string;
  customSlot?: Partial<ImageSlotConfig>;
  currentImageUrl?: string | null;
  imageUrl?: string | null;
  className?: string;
  variant?: "inline" | "block" | "badge" | "row";
  layout?: "inline" | "block" | "badge" | "row";
  showMobileDual?: boolean;
}

export function ImageUploadGuidance({
  slotKey,
  customSlot,
  currentImageUrl,
  imageUrl,
  className = "",
  variant = "inline",
  layout,
  showMobileDual = false,
}: ImageUploadGuidanceProps) {
  const effectiveImageUrl = imageUrl !== undefined ? imageUrl : currentImageUrl;
  const config = slotKey ? getImageSlot(slotKey) : null;
  const slot: Partial<ImageSlotConfig> = { ...config, ...customSlot };

  const [ratioWarning, setRatioWarning] = useState<string | null>(null);

  // Non-blocking aspect ratio advisory check
  useEffect(() => {
    if (!effectiveImageUrl || !slot.ratioValue || typeof window === "undefined") {
      setRatioWarning(null);
      return;
    }

    // Skip data URLs if they are SVGs
    if (effectiveImageUrl.startsWith("data:image/svg+xml") || effectiveImageUrl.endsWith(".svg")) {
      setRatioWarning(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const actualRatio = img.naturalWidth / img.naturalHeight;
        const targetRatio = slot.ratioValue!;
        const differencePercent = Math.abs(actualRatio - targetRatio) / targetRatio;

        // If ratio deviates by more than 28%, show non-blocking advisory
        if (differencePercent > 0.28) {
          const simplifiedActual =
            actualRatio > 2.2
              ? "ultrawide"
              : actualRatio > 1.4
              ? "landscape"
              : actualRatio > 1.15
              ? "horizontal"
              : actualRatio > 0.85
              ? "square (1:1)"
              : "portrait";
          setRatioWarning(
            `Uploaded image is ${simplifiedActual} (${img.naturalWidth}×${img.naturalHeight}px). Target is ${slot.aspectRatio}. It will be center-cropped on the storefront.`
          );
        } else {
          setRatioWarning(null);
        }
      }
    };
    img.onerror = () => {
      setRatioWarning(null);
    };
    img.src = effectiveImageUrl;
  }, [effectiveImageUrl, slot.ratioValue, slot.aspectRatio]);

  const primaryLabel = slot.desktopRecommended || `Recommended: ${slot.width} × ${slot.height} px · ${slot.aspectRatio}`;

  if (variant === "badge") {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10.5px] font-mono text-slate-400 select-none ${className}`}>
        <span className="text-cyan-400 font-semibold">{primaryLabel}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-1 select-none ${className}`}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-400">
        <span className="font-mono text-slate-300 font-medium inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 inline-block" />
          {primaryLabel}
        </span>

        {showMobileDual && slot.mobileRecommended && (
          <span className="font-mono text-purple-300 font-medium inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400/80 inline-block" />
            {slot.mobileRecommended}
          </span>
        )}

        <span className="text-[10px] text-slate-500 hidden sm:inline">
          (Aspect ratio is key to prevent cropping)
        </span>
      </div>

      {/* Subtle non-blocking advisory note if image deviates significantly */}
      {ratioWarning && (
        <div className="flex items-start gap-1.5 text-[10.5px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>{ratioWarning}</span>
        </div>
      )}
    </div>
  );
}
