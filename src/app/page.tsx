"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  Flame, 
  Layers, 
  Cpu, 
  Zap 
} from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustRibbon } from "@/components/home/TrustRibbon";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { CategoryBento } from "@/components/home/CategoryBento";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { api } from "@/lib/api";
import { Category, Product } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoreData() {
      try {
        const data = await api.getFeatured();
        setFeaturedProducts(data.featured_products || []);
        setNewArrivals(data.new_arrivals || []);
        setBestSellers(data.best_sellers || []);
        setCategories(data.featured_categories || []);
      } catch (err) {
        console.error("Failed to load storefront data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStoreData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero Section */}
      <HeroSection />

      {/* Value & Reassurance Trust Ribbon */}
      <TrustRibbon />

      {/* High-Conversion Flash Deals Countdown Section */}
      {featuredProducts.length > 0 && (
        <FlashSaleSection products={featuredProducts} />
      )}

      {/* Category Bento Grid */}
      <CategoryBento categories={categories} />

      {/* Featured / New / Best Sellers Grid */}
      <FeaturedGrid
        featuredProducts={featuredProducts}
        newArrivals={newArrivals}
        bestSellers={bestSellers}
      />

      {/* Category-Wise Showcase Section */}
      <CategoryShowcase categories={categories} />

      {/* Flash Drop Interactive Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative rounded-2xl overflow-hidden theme-promo-banner border p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div
                className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md border text-xs font-bold"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--theme-primary, #06b6d4) 15%, transparent)",
                  borderColor: "color-mix(in srgb, var(--theme-primary, #06b6d4) 30%, transparent)",
                  color: "var(--theme-primary, #06b6d4)",
                }}
              >
                <Flame className="w-3.5 h-3.5 fill-current" /> Limited Studio Flash Release
              </div>

              <h2
                className="text-xl sm:text-3xl font-black tracking-tight leading-tight"
                style={{ color: "var(--theme-text-heading, #0f172a)" }}
              >
                Get 20% Off Your First Flagship Order With Code{" "}
                <span style={{ color: "var(--theme-primary, #06b6d4)" }}>WELCOME20</span>
              </h2>

              <p
                className="text-xs max-w-xl leading-relaxed"
                style={{ color: "var(--theme-text-body, #64748b)" }}
              >
                Unlock instant discounts across studio headphones, custom mechanical keyboards, and modular daily carry gear. Applicable on all new customer checkouts.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-center">
              <Link
                href="/products"
                className="px-6 py-3 rounded-xl theme-btn-primary font-black text-xs uppercase tracking-wider text-center transition-all shadow-lg hover:scale-[1.02]"
              >
                Claim 20% Discount
              </Link>
              <Link
                href="/products?category=audio-acoustics"
                className="px-5 py-2.5 rounded-xl theme-btn-secondary font-bold text-xs text-center transition-all hover:scale-[1.02]"
              >
                View Audio Gear
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

