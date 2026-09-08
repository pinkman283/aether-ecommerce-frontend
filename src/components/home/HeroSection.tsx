"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Banner, HomepageBannersResponse } from "@/types";
import { HeroBannerCarousel } from "./HeroBannerCarousel";
import { SecondaryPromoBanner } from "./SecondaryPromoBanner";
import { HeroPromotionStrip } from "./HeroPromotionStrip";

const DEFAULT_PRIMARY_BANNERS: Banner[] = [
  {
    id: 991,
    title: "Aether Pulse ANC Wireless Studio",
    subtitle: "Next-Gen 50mm Beryllium Transducers. Pure Lossless Soundscapes.",
    eyebrow: "EXCLUSIVE STUDIO RELEASE",
    badge: "NEW ARRIVAL",
    discount_tag: "20% OFF PRE-ORDER",
    cta_text: "EXPLORE FLAGSHIP",
    cta_link: "/products",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=85",
    placement: "primary_hero",
    sort_order: 1,
    clicks_count: 0,
    impressions_count: 0,
    is_active: true,
  },
  {
    id: 992,
    title: "Vortex 75 CNC Gasket Mechanical",
    subtitle: "Aerospace Anodized Chassis with Hot-Swappable Tactile Switches.",
    eyebrow: "PRO HARDWARE",
    badge: "BEST SELLER",
    discount_tag: "LIMITED EDITION",
    cta_text: "CUSTOMIZE SETUP",
    cta_link: "/products",
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=85",
    placement: "primary_hero",
    sort_order: 2,
    clicks_count: 0,
    impressions_count: 0,
    is_active: true,
  },
];

const DEFAULT_SECONDARY_BANNERS: Banner[] = [
  {
    id: 993,
    title: "FREE DELIVERY ON ALL ORDERS ABOVE ৳2,000",
    subtitle: "Same-day courier dispatch across all studio hardware.",
    eyebrow: "LOGISTICS PERK",
    badge: "FREE COURIER",
    discount_tag: "৳0 SHIPPING",
    cta_text: "CLAIM FREE SHIPPING",
    cta_link: "/products",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",
    placement: "secondary_hero",
    sort_order: 1,
    clicks_count: 0,
    impressions_count: 0,
    is_active: true,
  },
  {
    id: 994,
    title: "Special 20% Privilege Reward On Next Order",
    subtitle: "Unlock direct discount with our VIP studio customer reward program.",
    eyebrow: "CUSTOMER REWARD",
    badge: "20% OFF",
    discount_tag: "USE CODE: TANVIR20",
    cta_text: "REDEEM VOUCHER",
    cta_link: "/promotions",
    image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=85",
    placement: "secondary_hero",
    sort_order: 2,
    clicks_count: 0,
    impressions_count: 0,
    is_active: true,
  },
];

export function HeroSection() {
  const [data, setData] = useState<HomepageBannersResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBanners() {
      try {
        const res = await api.getHomepageBanners();
        if (isMounted && res) {
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

  const primaryBanners = (data?.primary_banners && data.primary_banners.length > 0)
    ? data.primary_banners
    : DEFAULT_PRIMARY_BANNERS;

  const secondaryBanners = (data?.secondary_banners && data.secondary_banners.length > 0)
    ? data.secondary_banners
    : DEFAULT_SECONDARY_BANNERS;

  const topStrip = data?.top_strip || null;

  return (
    <div className="w-full space-y-3 sm:space-y-4 pt-3 sm:pt-4.5">
      {/* 1. Micro Promotion Strip (e.g. 20% OFF USE CODE: JDD) */}
      {topStrip && <HeroPromotionStrip banner={topStrip} />}

      {/* 2. Main Hero Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          {/* Left / Center: Primary Hero Carousel */}
          <div className="lg:col-span-8 h-full">
            <HeroBannerCarousel banners={primaryBanners} />
          </div>

          {/* Right: Secondary Promotional Card */}
          <div className="lg:col-span-4 h-full">
            <SecondaryPromoBanner banners={secondaryBanners} />
          </div>
        </div>
      </section>
    </div>
  );
}
