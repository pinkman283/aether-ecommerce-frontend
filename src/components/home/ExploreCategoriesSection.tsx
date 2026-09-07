"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Headphones, 
  Keyboard, 
  Briefcase, 
  Sparkles, 
  Watch, 
  Flame, 
  Layers 
} from "lucide-react";
import { Category } from "@/types";

interface ExploreCategoriesSectionProps {
  categories: Category[];
}

// LuLu inspired soft pastel background tints for category tiles
const PASTEL_TINTS = [
  "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/40",
  "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800/40",
  "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border-sky-100 dark:border-sky-800/40",
  "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800/40",
  "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800/40",
  "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/40",
];

const ICON_MAP: Record<string, any> = {
  Headphones: Headphones,
  Keyboard: Keyboard,
  Briefcase: Briefcase,
  Sparkles: Sparkles,
  Watch: Watch,
  Layers: Layers,
};

export function ExploreCategoriesSection({ categories }: ExploreCategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Section Header: LuLu Style Clean Hierarchy */}
      <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Explore Categories
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Curated collections for your daily hardware & workspace needs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="theme-view-all-btn text-xs font-black uppercase tracking-wider hover:underline flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                canScrollLeft
                  ? "border-gray-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                  : "border-gray-200 dark:border-white/5 text-slate-300 dark:text-slate-600 opacity-40 cursor-not-allowed"
              }`}
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                canScrollRight
                  ? "border-gray-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                  : "border-gray-200 dark:border-white/5 text-slate-300 dark:text-slate-600 opacity-40 cursor-not-allowed"
              }`}
              aria-label="Next categories"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth"
      >
        {/* Featured "Top Deals" Tile (LuLu Red Flame Special) */}
        <Link
          href="/promotions"
          className="shrink-0 w-[110px] sm:w-[124px] flex flex-col items-center text-center group cursor-pointer"
        >
          <div className="w-[84px] h-[84px] sm:w-[94px] sm:h-[94px] rounded-full sm:rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 p-3 flex flex-col items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:border-rose-400">
            <Flame className="w-8 h-8 sm:w-9 sm:h-9 text-rose-600 fill-rose-600 animate-pulse" />
          </div>
          <span className="mt-2.5 text-xs font-black text-rose-600 group-hover:underline line-clamp-1">
            Top Deals
          </span>
          <span className="text-[10px] font-bold text-rose-500">
            Up to 20% Off
          </span>
        </Link>

        {/* Categories List */}
        {categories.map((cat, idx) => {
          const Icon = ICON_MAP[cat.icon || "Sparkles"] || Sparkles;
          const tint = PASTEL_TINTS[idx % PASTEL_TINTS.length];

          return (
            <Link
              key={cat.id || idx}
              href={`/products?category=${cat.slug}`}
              className="shrink-0 w-[110px] sm:w-[124px] flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Avatar Container: Circular / Rounded Square on Soft Tint */}
              <div
                className={`w-[84px] h-[84px] sm:w-[94px] sm:h-[94px] rounded-full sm:rounded-2xl border p-2 sm:p-2.5 flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${tint}`}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain rounded-full sm:rounded-xl transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <Icon className="w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-300 group-hover:scale-110" />
                )}
              </div>

              {/* Category Title */}
              <span className="mt-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#005826] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                {cat.name}
              </span>

              {/* Product Count or Tag */}
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {cat.products_count !== undefined ? `${cat.products_count} items` : "Explore"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
