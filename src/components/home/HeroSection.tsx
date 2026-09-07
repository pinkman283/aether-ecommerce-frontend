"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HomepageBannersResponse } from "@/types";
import { HeroBannerCarousel } from "./HeroBannerCarousel";
import { SecondaryPromoBanner } from "./SecondaryPromoBanner";
import { HeroPromotionStrip } from "./HeroPromotionStrip";

export function HeroSection() {
  const [data, setData] = useState<HomepageBannersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBanners() {
      try {
        const res = await api.getHomepageBanners();
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        console.error("Failed to load storefront homepage banners:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryBanners = data?.primary_banners || [];
  const secondaryBanners = data?.secondary_banners || [];
  const topStrip = data?.top_strip || null;

  const hasPrimary = primaryBanners.length > 0;
  const hasSecondary = secondaryBanners.length > 0;

  return (
    <div className="w-full space-y-3 sm:space-y-4 pt-3 sm:pt-4.5">
      {/* 1. Micro Promotion Strip (e.g. 20% OFF USE CODE: JDD) */}
      {topStrip && <HeroPromotionStrip banner={topStrip} />}

      {/* 2. Main Hero Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
            <div className="lg:col-span-8 h-[220px] sm:h-[250px] lg:h-[280px] rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/10 animate-pulse" />
            <div className="lg:col-span-4 h-[220px] sm:h-[250px] lg:h-[280px] rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/10 animate-pulse" />
          </div>
        ) : hasPrimary || hasSecondary ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
            {/* Left / Center: Primary Hero Carousel */}
            {hasPrimary && (
              <div className={hasSecondary ? "lg:col-span-8 h-full" : "lg:col-span-12 h-full"}>
                <HeroBannerCarousel banners={primaryBanners} />
              </div>
            )}

            {/* Right: Secondary Promotional Card */}
            {hasSecondary && (
              <div className={hasPrimary ? "lg:col-span-4 h-full" : "lg:col-span-12 h-full"}>
                <SecondaryPromoBanner banners={secondaryBanners} />
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
