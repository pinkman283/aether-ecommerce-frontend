"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Sparkles, Trophy } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

interface FeaturedGridProps {
  featuredProducts: Product[];
  newArrivals: Product[];
  bestSellers: Product[];
}

export function FeaturedGrid({ featuredProducts, newArrivals, bestSellers }: FeaturedGridProps) {
  const [activeTab, setActiveTab] = useState<"featured" | "new" | "bestsellers">("featured");

  const displayList =
    activeTab === "featured"
      ? featuredProducts
      : activeTab === "new"
      ? newArrivals
      : bestSellers;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400 block mb-1">
            Studio Selection
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Flagship Hardware Showcase
          </h2>
        </div>

        {/* Tab Pills */}
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("featured")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "featured"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Featured
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "new"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> New Arrivals
          </button>

          <button
            onClick={() => setActiveTab("bestsellers")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "bestsellers"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Best Sellers
          </button>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All CTA */}
      <div className="text-center mt-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-lg hover:scale-105"
        >
          Explore All {displayList.length > 0 ? "Hardware" : "Products"} <ArrowRight className="w-4 h-4 text-cyan-400" />
        </Link>
      </div>
    </section>
  );
}
