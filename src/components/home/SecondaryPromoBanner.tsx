"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Tag, Flame, ChevronRight, ChevronLeft } from "lucide-react";
import { Banner } from "@/types";
import { api } from "@/lib/api";

interface SecondaryPromoBannerProps {
  banners: Banner[];
}

export function SecondaryPromoBanner({ banners }: SecondaryPromoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If multiple secondary banners exist, gently rotate every 7s
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const banner = banners[currentIndex] || banners[0];
  const targetUrl = banner.computed_link || banner.cta_link || "/products";

  const handleBannerClick = (b: Banner) => {
    if (b.id) {
      api.trackBannerClick(b.id);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative h-[220px] sm:h-[250px] lg:h-[280px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-xl group bg-[#0c0f18]">
      <Link
        href={targetUrl}
        onClick={() => handleBannerClick(banner)}
        className="relative block w-full h-full cursor-pointer group/card"
      >
        {/* Background Showcase Image */}
        <picture className="absolute inset-0 w-full h-full">
          {banner.mobile_image_url && (
            <source media="(max-width: 640px)" srcSet={banner.mobile_image_url} />
          )}
          <img
            src={banner.image_url}
            alt={banner.alt_text || banner.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-105"
          />
        </picture>

        {/* Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 z-10" />

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-5">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2">
            {banner.eyebrow ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/15 text-white border border-white/20 backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                {banner.eyebrow}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                <Flame className="w-2.5 h-2.5 text-amber-400" />
                PROMO
              </span>
            )}

            {banner.badge && (
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                {banner.badge}
              </span>
            )}
          </div>

          {/* Bottom Copy & CTA */}
          <div className="space-y-1.5 dark-banner-content">
            {banner.discount_tag && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 border border-amber-400/50 text-amber-300 font-mono text-[9px] sm:text-[10px] font-black backdrop-blur-md shadow-sm">
                <Tag className="w-2.5 h-2.5 text-amber-400" />
                <span>{banner.discount_tag}</span>
              </div>
            )}

            <h3
              style={{ color: "#ffffff" }}
              className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md"
            >
              {banner.title}
            </h3>

            {banner.subtitle && (
              <p
                style={{ color: "rgba(226, 232, 240, 0.95)" }}
                className="text-[10px] sm:text-[11px] text-slate-200 leading-relaxed line-clamp-1 drop-shadow"
              >
                {banner.subtitle}
              </p>
            )}

            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 group-hover/card:bg-white text-white group-hover/card:text-slate-950 font-black text-[9px] sm:text-[10px] uppercase tracking-wider border border-white/20 transition-all duration-300 shadow">
                <span>{banner.cta_text || "Explore Deal"}</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover/card:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Navigation Arrows (Prev / Next on Desktop Hover) */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous promo banner"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/85 text-white/80 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next promo banner"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/85 text-white/80 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </>
      )}

      {/* Multiple Banner Indicator Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2.5 right-4 z-30 flex items-center gap-1">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all cursor-pointer ${
                currentIndex === i ? "w-4 h-1 bg-amber-400" : "w-1 h-1 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
