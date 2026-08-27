"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Play, Star, Headphones } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

export function HeroSection() {
  const { addItem } = useCartStore();

  const heroFeaturedProduct = {
    id: 1,
    name: "Aether Pulse ANC Wireless Studio Headphones",
    slug: "aether-pulse-anc-wireless-headphones",
    price: 349.00,
    compare_at_price: 429.00,
    rating_average: 4.92,
    review_count: 128,
    stock_quantity: 42,
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: true,
    is_active: true,
    description: "Custom 50mm Beryllium drivers, 45dB hybrid active noise cancellation, and 60-hour lossless battery life.",
    primary_image: {
      id: 1,
      product_id: 1,
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
      is_primary: true,
      display_order: 0,
    },
    created_at: new Date().toISOString(),
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-32 bg-spotlight-hero">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-indigo-500/30 backdrop-blur-md shadow-lg shadow-indigo-500/10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-cyan-300">
                2026 Studio Flagship Release
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Uncompromising <br className="hidden sm:inline" />
              <span className="gradient-text-accent">Industrial Audio</span> & Tech Ecosystem.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Engineered with aerospace-grade titanium, custom beryllium drivers, and tactile mechanical acoustics for creators who refuse mediocrity.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/products"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white text-sm font-extrabold tracking-wide uppercase flex items-center justify-center gap-2.5 transition-all shadow-2xl shadow-indigo-500/30 hover:scale-[1.02]"
              >
                Explore Catalog <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/products/aether-pulse-anc-wireless-headphones"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:border-indigo-400/40"
              >
                <Headphones className="w-4 h-4 text-cyan-400" /> View Pulse ANC
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div>
                <span className="text-2xl font-black text-white">45dB</span>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Hybrid ANC Depth</p>
              </div>
              <div>
                <span className="text-2xl font-black text-cyan-400">60 Hrs</span>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Lossless Playtime</p>
              </div>
              <div>
                <span className="text-2xl font-black text-purple-400">24-Bit</span>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Studio Resolution</p>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Interactive 3D Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-indigo-500/40 via-purple-500/20 to-transparent shadow-2xl shadow-indigo-500/20">
              <div className="relative rounded-2xl bg-[#0c0f18]/90 backdrop-blur-xl border border-white/10 overflow-hidden p-6">
                
                {/* Floating Pill Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Product of the Year
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.9 / 5.0</span>
                  </div>
                </div>

                {/* Hero Showcase Image with Glow */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 mb-5 border border-white/10 group">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85"
                    alt="Aether Pulse ANC"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="text-white font-extrabold">Aether Audio Laboratory</span>
                    <span className="text-cyan-400 font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-cyan-400/30">
                      Beryllium 50mm
                    </span>
                  </div>
                </div>

                {/* Card Info & Quick Action */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-white leading-snug">
                      Aether Pulse ANC Wireless Studio
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      Aircraft-grade aluminum chassis with memory foam lambskin earcups and ultra-low latency wireless dongle.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <span className="text-xs text-slate-400 block">Launch Special</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-cyan-400">{formatPrice(349)}</span>
                        <span className="text-xs text-slate-500 line-through">{formatPrice(429)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => addItem(heroFeaturedProduct as any, null, 1)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Add to Cart
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
