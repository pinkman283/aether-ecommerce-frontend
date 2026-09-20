"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Flame, 
  Tag, 
  Copy, 
  Check, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  Percent
} from "lucide-react";
import { Banner, Promotion } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface BottomBannerCarouselProps {
  banners?: Banner[];
}

export type DiscountVoucherCarouselProps = BottomBannerCarouselProps;

export function BottomBannerCarousel({ banners = [] }: BottomBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Fetch active voucher promotions if no parent banners provided
  useEffect(() => {
    if (!banners || banners.length === 0) {
      let isMounted = true;
      api.getStorefrontPromotions("voucher_carousel")
        .then((res) => {
          const list = Array.isArray(res) ? res : (res as any)?.data || [];
          if (isMounted && list.length > 0) {
            setPromotions(list);
          }
        })
        .catch((err) => {
          console.warn("Notice: voucher carousel promotions fallback:", err);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [banners]);

  // Map promotions to banner format if available
  const mappedPromotions: Banner[] = promotions.map((p) => ({
    id: p.id,
    title: p.headline || p.name,
    subtitle: p.subheadline || p.description || "",
    eyebrow: p.promotion_type ? p.promotion_type.replace(/_/g, " ") : "Special Offer",
    badge:
      p.formatted_discount ||
      (p.discount_type === "percentage"
        ? `${p.discount_value}% OFF`
        : `৳${Number(p.discount_value).toLocaleString()} OFF`),
    discount_tag: p.primary_code ? `CODE: ${p.primary_code}` : "",
    cta_text: p.cta_text || "Claim Offer",
    cta_link: p.cta_destination || `/promotions/${p.slug}`,
    computed_link: p.cta_destination || `/promotions/${p.slug}`,
    image_url: p.banner_image || "",
    placement: "bottom_banner" as const,
    sort_order: 1,
    promotion: p,
    is_active: p.status === "active",
    is_currently_visible: true,
    clicks_count: 0,
    impressions_count: 0,
  }));

  // Safe fallback slides without hardcoded fake promo codes
  const DEFAULT_SLIDES: Banner[] = [
    {
      id: 9991,
      title: "Complimentary Express Delivery on Studio Orders Above ৳2,000",
      subtitle: "Experience next-day insured delivery across high-fidelity studio headphones, custom mechanical keyboards, and precision desk hardware.",
      eyebrow: "Storewide Logistics Perk",
      badge: "FREE COURIER",
      discount_tag: "৳0 SHIPPING",
      cta_text: "Explore Flagship Gear",
      cta_link: "/products",
      computed_link: "/products",
      destination_type: "custom",
      placement: "bottom_banner",
      image_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
      sort_order: 1,
      is_active: true,
      is_currently_visible: true,
      clicks_count: 0,
      impressions_count: 0,
    },
    {
      id: 9992,
      title: "Discover Official Studio Promotions & Limited Campaigns",
      subtitle: "Unlock exclusive vouchers, tier discounts, and seasonal campaign drops curated for audio professionals and mechanical enthusiasts.",
      eyebrow: "Seasonal Campaigns",
      badge: "ACTIVE OFFERS",
      discount_tag: "VERIFIED SAVINGS",
      cta_text: "Browse All Promotions",
      cta_link: "/promotions",
      computed_link: "/promotions",
      destination_type: "custom",
      placement: "bottom_banner",
      image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
      sort_order: 2,
      is_active: true,
      is_currently_visible: true,
      clicks_count: 0,
      impressions_count: 0,
    },
  ];

  const displayBanners: Banner[] =
    banners && banners.length > 0
      ? banners
      : mappedPromotions.length > 0
      ? mappedPromotions
      : DEFAULT_SLIDES;

  const total = displayBanners.length;
  const currentBanner = displayBanners[currentIndex] || displayBanners[0];

  // Auto-play timer
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 7500);
    return () => clearInterval(timer);
  }, [total, isPaused]);

  // Extract coupon code strictly from real promotion or discount_tag
  const promoCode =
    currentBanner.promotion?.primary_code ||
    currentBanner.promotion?.codes?.[0]?.code ||
    (currentBanner.discount_tag?.includes("CODE:")
      ? currentBanner.discount_tag.split("CODE:")[1].trim()
      : null);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleBannerClick = () => {
    if (currentBanner.id && currentBanner.id < 9000) {
      api.trackBannerClick(currentBanner.id);
    }
  };

  const targetLink = currentBanner.computed_link || currentBanner.cta_link || "/products";

  return (
    <section className="w-full py-4 sm:py-6">
      <div 
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-emerald-900/15 dark:border-white/10 shadow-xl transition-all group bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/30 dark:from-[#09150e] dark:via-[#0c121e] dark:to-[#0a0f1d]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
              {/* Eyebrow & Badge Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#005826]/10 dark:bg-[#005826]/30 text-[#005826] dark:text-emerald-400 border border-[#005826]/20 dark:border-emerald-500/30">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{currentBanner.eyebrow || "Limited Flash Release"}</span>
                </span>

                {currentBanner.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                    {currentBanner.badge}
                  </span>
                )}

                {/* Instant Copyable Code Pill */}
                {promoCode && (
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(e, promoCode)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 border border-amber-400 text-amber-950 dark:text-amber-300 font-mono text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Click to copy coupon code"
                  >
                    <Tag className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                    <span>CODE: {promoCode}</span>
                    {copiedCode === promoCode ? (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                    ) : (
                      <Copy className="w-3 h-3 text-amber-800 dark:text-amber-300 ml-0.5 opacity-75" />
                    )}
                  </button>
                )}
              </div>

              {/* Title / Headline */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug text-slate-900 dark:text-white">
                {currentBanner.title}
              </h2>

              {/* Subtitle */}
              {currentBanner.subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {currentBanner.subtitle}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={targetLink}
                  onClick={handleBannerClick}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005826] hover:bg-[#007a3d] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <span>{currentBanner.cta_text || "Claim Discount"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {promoCode && (
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(e, promoCode)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/15 border border-gray-200 dark:border-white/15 text-slate-800 dark:text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    {copiedCode === promoCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                        <span>Copy Code ({promoCode})</span>
                      </>
                    )}
                  </button>
                )}

                <Link
                  href="/promotions"
                  className="inline-flex items-center gap-1 text-xs font-bold transition-colors pl-1 hover:opacity-80"
                  style={{ color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))" }}
                >
                  <span>View All Offers</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Right Image / Showcase Graphic Column */}
            <div className="lg:col-span-4 relative flex items-center justify-center">
              {currentBanner.image_url ? (
                <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg group-hover:shadow-xl transition-all">
                  <img
                    src={currentBanner.image_url}
                    alt={currentBanner.alt_text || currentBanner.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                    <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified Voucher
                    </span>
                    <span className="font-mono text-amber-300 font-black">
                      {currentBanner.discount_tag || "ACTIVE"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-44 sm:h-56 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/10 border border-emerald-600/20 flex flex-col items-center justify-center p-6 text-center">
                  <Percent className="w-12 h-12 text-[#005826] dark:text-emerald-400 mb-2 animate-bounce" />
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {currentBanner.badge || "EXCLUSIVE DISCOUNT"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Apply code at checkout to save instantly
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous discount offer"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black/90 text-slate-800 dark:text-white border border-gray-200 dark:border-white/20 shadow-md backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next discount offer"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black/90 text-slate-800 dark:text-white border border-gray-200 dark:border-white/20 shadow-md backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Slide Indicator Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 dark:bg-black/50 backdrop-blur-md border border-white/20">
              {displayBanners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to discount slide ${idx + 1}`}
                  className={`rounded-full transition-all cursor-pointer ${
                    currentIndex === idx 
                      ? "w-5 h-1.5 bg-[#005826] dark:bg-emerald-400" 
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export const DiscountVoucherCarousel = BottomBannerCarousel;
