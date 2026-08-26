"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  Sparkles, 
  Star, 
  ArrowUpDown,
  Grid,
  List,
  RotateCcw
} from "lucide-react";
import { api } from "@/lib/api";
import { Category, Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/utils";

function ProductCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "popular";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(currentSearch);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [sort, setSort] = useState(currentSort);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number | "">("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const catData = await api.getCategories();
        setCategories(catData || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    async function fetchCatalog() {
      setLoading(true);
      try {
        const params: any = {
          sort,
          per_page: 24,
        };
        if (selectedCategory) params.category = selectedCategory;
        if (search.trim()) params.search = search;
        if (minPrice !== "") params.min_price = Number(minPrice);
        if (maxPrice !== "") params.max_price = Number(maxPrice);
        if (minRating !== "") params.min_rating = Number(minRating);
        if (inStockOnly) params.in_stock = true;

        const res = await api.getProducts(params);
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, [selectedCategory, search, sort, minPrice, maxPrice, minRating, inStockOnly]);

  const handleCategoryClick = (slug: string) => {
    const nextSlug = selectedCategory === slug ? "" : slug;
    setSelectedCategory(nextSlug);
    if (nextSlug) {
      router.push(`/products?category=${nextSlug}`);
    } else {
      router.push("/products");
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setInStockOnly(false);
    router.push("/products");
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(search) ||
    minPrice !== "" ||
    maxPrice !== "" ||
    minRating !== "" ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
          AETHER Hardware Archive
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || "Catalog"
            : "Complete Hardware Lineup"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Audiophile acoustic planar headphones, CNC anodized aluminum keyboards, weatherproof modular bags, and smart workstation accessories.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e121e] border border-white/10 mb-8">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords or specs..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right controls: Sort + Mobile Filter Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            Filters {hasActiveFilters && "•"}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="popular" className="bg-[#0e121e]">Most Popular</option>
              <option value="newest" className="bg-[#0e121e]">Newest Releases</option>
              <option value="rating" className="bg-[#0e121e]">Top Rated</option>
              <option value="price_asc" className="bg-[#0e121e]">Price: Low to High</option>
              <option value="price_desc" className="bg-[#0e121e]">Price: High to Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden md:block space-y-6">
          <div className="p-5 rounded-3xl bg-[#0e121e] border border-white/10 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter Gear
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Category
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryClick("")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedCategory === ""
                      ? "bg-indigo-600/20 text-cyan-300 border border-cyan-400/30"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span>All Hardware</span>
                  {selectedCategory === "" && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-600/20 text-cyan-300 border border-cyan-400/30"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {cat.products_count ?? ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Price Range ($)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Minimum Rating
              </span>
              <div className="space-y-1">
                {[
                  { label: "All Ratings", val: "" },
                  { label: "4.5★ & Above", val: 4.5 },
                  { label: "4.0★ & Above", val: 4.0 },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setMinRating(r.val as any)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      minRating === r.val
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span>{r.label}</span>
                    {minRating === r.val && <Check className="w-3 h-3 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Only Toggle */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">In Stock Only</span>
              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  inStockOnly ? "bg-cyan-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    inStockOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="md:col-span-3">
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-[11px] font-bold text-slate-400">Active Filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 text-xs font-semibold">
                  Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => handleCategoryClick("")}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 text-xs font-semibold">
                  Search: "{search}"
                  <button onClick={() => setSearch("")}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}
              {minPrice !== "" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 text-xs font-semibold">
                  Min: ${minPrice}
                  <button onClick={() => setMinPrice("")}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}
              {maxPrice !== "" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 text-xs font-semibold">
                  Max: ${maxPrice}
                  <button onClick={() => setMaxPrice("")}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}
            </div>
          )}

          {/* Catalog Grid */}
          {loading ? (
            <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Loading Studio Catalog...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0e121e] border border-white/10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-white">No products match your filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your price range or clearing keyword queries to see all available hardware.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-sm">Loading Catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
