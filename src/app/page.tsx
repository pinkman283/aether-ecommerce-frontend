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
import { CategoryBento } from "@/components/home/CategoryBento";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
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
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection />

      {/* Value Badges Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Beryllium Drivers</h4>
              <p className="text-[10px] text-slate-400">Zero harmonic distortion</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Layers className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">6063 Aluminum CNC</h4>
              <p className="text-[10px] text-slate-400">Acoustic gasket dampening</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">2-Year Studio Warranty</h4>
              <p className="text-[10px] text-slate-400">Zero-cost hardware coverage</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Truck className="w-5 h-5 text-pink-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Express Delivery</h4>
              <p className="text-[10px] text-slate-400">Free on orders over $100</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Bento Grid */}
      <CategoryBento categories={categories} />

      {/* Featured / New / Best Sellers Grid */}
      <FeaturedGrid
        featuredProducts={featuredProducts}
        newArrivals={newArrivals}
        bestSellers={bestSellers}
      />

      {/* Flash Drop Interactive Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-indigo-500/30 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> Limited Studio Flash Release
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Get 20% Off Your First Flagship Order With Code <span className="text-cyan-400">WELCOME20</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Unlock instant discounts across studio headphones, custom mechanical keyboards, and modular daily carry gear. Applicable on all new customer checkouts.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/products"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider text-center transition-all shadow-xl shadow-cyan-500/20 hover:scale-105"
              >
                Claim 20% Discount
              </Link>
              <Link
                href="/products?category=audio-acoustics"
                className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs text-center transition-all"
              >
                Explore Audiophile Lineup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
