"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  Sparkles, 
  Star, 
  ArrowUpDown,
  RotateCcw
} from "lucide-react";
import { api } from "@/lib/api";
import { Category, Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/utils";
import { useAppTheme } from "@/components/providers/ThemeProvider";

function ProductCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useAppTheme();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "popular";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(12);

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

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, search, sort, minPrice, maxPrice, minRating, inStockOnly]);

  useEffect(() => {
    async function fetchCatalog() {
      setLoading(true);
      try {
        const params: any = {
          sort,
          per_page: perPage,
          page: currentPage,
        };
        if (selectedCategory) params.category = selectedCategory;
        if (search.trim()) params.search = search;
        if (minPrice !== "") params.min_price = Number(minPrice);
        if (maxPrice !== "") params.max_price = Number(maxPrice);
        if (minRating !== "" && theme.reviews_enabled !== false) params.min_rating = Number(minRating);
        if (inStockOnly) params.in_stock = true;

        const res = await api.getProducts(params);
        setProducts(res.data || []);
        if (res.current_page) setCurrentPage(res.current_page);
        if (res.last_page) setLastPage(res.last_page);
        if (res.total !== undefined) setTotalCount(res.total);
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, [selectedCategory, search, sort, minPrice, maxPrice, minRating, inStockOnly, currentPage, perPage, theme.reviews_enabled]);

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
    (minRating !== "" && theme.reviews_enabled !== false) ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <span 
          className="text-xs font-black uppercase tracking-widest block"
          style={{ color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))" }}
        >
          {theme.store_brand_name || "INHALIQ"} Hardware Archive
        </span>
        <h1 
          className="text-3xl sm:text-4xl font-black tracking-tight"
          style={{ color: "var(--theme-text-heading, #0f172a)" }}
        >
          {selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || "Catalog"
            : "Complete Hardware Lineup"}
        </h1>
        <p 
          className="text-xs sm:text-sm max-w-2xl leading-relaxed"
          style={{ color: "var(--theme-text-body, #64748b)" }}
        >
          Audiophile acoustic planar headphones, CNC anodized aluminum keyboards, weatherproof modular bags, and smart workstation accessories.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div 
        className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border mb-8 shadow-2xs"
        style={{
          backgroundColor: "var(--theme-card-bg, #ffffff)",
          borderColor: "var(--theme-card-border, #e5e7eb)"
        }}
      >
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search 
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" 
            style={{ color: "var(--theme-text-body, #94a3b8)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords or specs..."
            className="w-full rounded-xl pl-9.5 pr-8 py-2 text-xs border transition-colors focus:outline-none"
            style={{
              backgroundColor: "var(--theme-card-bg, #ffffff)",
              borderColor: "var(--theme-card-border, #e5e7eb)",
              color: "var(--theme-text-heading, #0f172a)"
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right controls: Sort + Mobile Filter Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--theme-card-bg, #ffffff)",
              borderColor: "var(--theme-card-border, #e5e7eb)",
              color: "var(--theme-text-heading, #0f172a)"
            }}
          >
            <SlidersHorizontal 
              className="w-4 h-4" 
              style={{ color: "var(--theme-primary, #005826)" }}
            />
            Filters {hasActiveFilters && "•"}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown 
              className="w-3.5 h-3.5 hidden sm:inline" 
              style={{ color: "var(--theme-text-body, #94a3b8)" }}
            />
            <span 
              className="text-xs hidden sm:inline"
              style={{ color: "var(--theme-text-body, #64748b)" }}
            >
              Sort:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--theme-card-bg, #ffffff)",
                borderColor: "var(--theme-card-border, #e5e7eb)",
                color: "var(--theme-text-heading, #0f172a)"
              }}
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Releases</option>
              {theme.reviews_enabled !== false && <option value="rating">Top Rated</option>}
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 border-rose-200 dark:border-rose-900/30"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden md:block space-y-6">
          <div 
            className="p-5 rounded-3xl border space-y-6 sticky top-24 shadow-2xs"
            style={{
              backgroundColor: "var(--theme-card-bg, #ffffff)",
              borderColor: "var(--theme-card-border, #e5e7eb)"
            }}
          >
            <div className="flex items-center justify-between">
              <h3 
                className="text-xs font-black uppercase tracking-wider flex items-center gap-2"
                style={{ color: "var(--theme-text-heading, #0f172a)" }}
              >
                <Filter 
                  className="w-3.5 h-3.5" 
                  style={{ color: "var(--theme-primary, #005826)" }}
                /> 
                CATEGORY
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryClick("")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  selectedCategory === ""
                    ? "border shadow-2xs font-bold"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
                style={selectedCategory === "" ? {
                  backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                  color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                  borderColor: "var(--theme-card-border, #e5e7eb)"
                } : {
                  color: "var(--theme-text-heading, #0f172a)"
                }}
              >
                <span>All Hardware</span>
                {selectedCategory === "" && (
                  <Check 
                    className="w-3.5 h-3.5" 
                    style={{ color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))" }}
                  />
                )}
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border shadow-2xs font-bold"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                    style={isSelected ? {
                      backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                      color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                      borderColor: "var(--theme-card-border, #e5e7eb)"
                    } : {
                      color: "var(--theme-text-heading, #0f172a)"
                    }}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span 
                      className="text-[10px] font-normal"
                      style={{ color: "var(--theme-text-body, #94a3b8)" }}
                    >
                      {cat.products_count ?? ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Price Range */}
            <div 
              className="space-y-2 pt-4 border-t"
              style={{ borderColor: "var(--theme-card-border, #e5e7eb)" }}
            >
              <span 
                className="text-[11px] font-bold uppercase tracking-wider block"
                style={{ color: "var(--theme-text-body, #64748b)" }}
              >
                Price Range ($)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-1.5 text-xs border transition-colors focus:outline-none"
                  style={{
                    backgroundColor: "var(--theme-card-bg, #ffffff)",
                    borderColor: "var(--theme-card-border, #e5e7eb)",
                    color: "var(--theme-text-heading, #0f172a)"
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-1.5 text-xs border transition-colors focus:outline-none"
                  style={{
                    backgroundColor: "var(--theme-card-bg, #ffffff)",
                    borderColor: "var(--theme-card-border, #e5e7eb)",
                    color: "var(--theme-text-heading, #0f172a)"
                  }}
                />
              </div>
            </div>

            {/* Minimum Rating (Shown only when reviews/ratings are enabled) */}
            {theme.reviews_enabled !== false && (
              <div 
                className="space-y-2 pt-4 border-t"
                style={{ borderColor: "var(--theme-card-border, #e5e7eb)" }}
              >
                <span 
                  className="text-[11px] font-bold uppercase tracking-wider block"
                  style={{ color: "var(--theme-text-body, #64748b)" }}
                >
                  Minimum Rating
                </span>
                <div className="space-y-1">
                  {[
                    { label: "All Ratings", val: "" },
                    { label: "4.5★ & Above", val: 4.5 },
                    { label: "4.0★ & Above", val: 4.0 },
                  ].map((r) => {
                    const isRatingSelected = minRating === r.val;
                    return (
                      <button
                        key={r.label}
                        onClick={() => setMinRating(minRating === r.val ? "" : (r.val as any))}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isRatingSelected
                            ? "border shadow-2xs font-bold"
                            : "hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                        style={isRatingSelected ? {
                          backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                          color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                          borderColor: "var(--theme-card-border, #e5e7eb)"
                        } : {
                          color: "var(--theme-text-heading, #0f172a)"
                        }}
                      >
                        <span>{r.label}</span>
                        {isRatingSelected && (
                          <Check 
                            className="w-3.5 h-3.5" 
                            style={{ color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In Stock Only Toggle (Theme Synced Switch) */}
            <div 
              className="pt-4 border-t flex items-center justify-between"
              style={{ borderColor: "var(--theme-card-border, #e5e7eb)" }}
            >
              <span 
                className="text-xs font-semibold"
                style={{ color: "var(--theme-text-heading, #0f172a)" }}
              >
                In Stock Only
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={inStockOnly}
                onClick={() => setInStockOnly(!inStockOnly)}
                className="w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: inStockOnly
                    ? "var(--theme-primary, #005826)"
                    : "var(--theme-card-border, #cbd5e1)"
                }}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
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
              <span 
                className="text-[11px] font-bold"
                style={{ color: "var(--theme-text-body, #64748b)" }}
              >
                Active Filters:
              </span>
              {selectedCategory && (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs"
                  style={{
                    backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                    color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                    borderColor: "var(--theme-card-border, #e5e7eb)"
                  }}
                >
                  Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => handleCategoryClick("")} className="cursor-pointer hover:opacity-75"><X className="w-3 h-3 ml-0.5" /></button>
                </span>
              )}
              {search && (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs"
                  style={{
                    backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                    color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                    borderColor: "var(--theme-card-border, #e5e7eb)"
                  }}
                >
                  Search: "{search}"
                  <button onClick={() => setSearch("")} className="cursor-pointer hover:opacity-75"><X className="w-3 h-3 ml-0.5" /></button>
                </span>
              )}
              {minPrice !== "" && (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs"
                  style={{
                    backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                    color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                    borderColor: "var(--theme-card-border, #e5e7eb)"
                  }}
                >
                  Min: ${minPrice}
                  <button onClick={() => setMinPrice("")} className="cursor-pointer hover:opacity-75"><X className="w-3 h-3 ml-0.5" /></button>
                </span>
              )}
              {maxPrice !== "" && (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs"
                  style={{
                    backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                    color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                    borderColor: "var(--theme-card-border, #e5e7eb)"
                  }}
                >
                  Max: ${maxPrice}
                  <button onClick={() => setMaxPrice("")} className="cursor-pointer hover:opacity-75"><X className="w-3 h-3 ml-0.5" /></button>
                </span>
              )}
              {inStockOnly && (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs"
                  style={{
                    backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                    color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                    borderColor: "var(--theme-card-border, #e5e7eb)"
                  }}
                >
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)} className="cursor-pointer hover:opacity-75"><X className="w-3 h-3 ml-0.5" /></button>
                </span>
              )}
            </div>
          )}

          {/* Results Summary Bar */}
          {!loading && products.length > 0 && (
            <div 
              className="flex items-center justify-between pb-4 mb-2 text-xs"
              style={{ color: "var(--theme-text-body, #64748b)" }}
            >
              <span>
                Showing <strong style={{ color: "var(--theme-text-heading, #0f172a)" }}>{products.length}</strong> of <strong style={{ color: "var(--theme-text-heading, #0f172a)" }}>{totalCount || products.length}</strong> hardware models
              </span>
              {lastPage > 1 && (
                <span className="text-[11px] font-mono">
                  Page {currentPage} of {lastPage}
                </span>
              )}
            </div>
          )}

          {/* Catalog Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="rounded-3xl border p-4 space-y-4 animate-pulse shadow-2xs"
                  style={{
                    backgroundColor: "var(--theme-card-bg, #ffffff)",
                    borderColor: "var(--theme-card-border, #e5e7eb)"
                  }}
                >
                  <div className="w-full aspect-square rounded-2xl bg-gray-100 dark:bg-white/5" />
                  <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2" />
                  <div className="h-9 bg-gray-100 dark:bg-white/5 rounded-2xl mt-4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div 
              className="p-12 rounded-3xl border text-center space-y-4 shadow-2xs"
              style={{
                backgroundColor: "var(--theme-card-bg, #ffffff)",
                borderColor: "var(--theme-card-border, #e5e7eb)"
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto"
                style={{
                  backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                  borderColor: "var(--theme-card-border, #e5e7eb)"
                }}
              >
                <Search 
                  className="w-8 h-8" 
                  style={{ color: "var(--theme-primary, #005826)" }}
                />
              </div>
              <h3 
                className="text-lg font-bold"
                style={{ color: "var(--theme-text-heading, #0f172a)" }}
              >
                No products match your filters
              </h3>
              <p 
                className="text-xs max-w-sm mx-auto leading-relaxed"
                style={{ color: "var(--theme-text-body, #64748b)" }}
              >
                Try widening your price range or clearing keyword queries to see all available hardware.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs theme-btn-primary hover:opacity-90"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {lastPage > 1 && (
                <div 
                  className="flex items-center justify-center gap-2 pt-6 border-t"
                  style={{ borderColor: "var(--theme-card-border, #e5e7eb)" }}
                >
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 py-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--theme-card-bg, #ffffff)",
                      borderColor: "var(--theme-card-border, #e5e7eb)",
                      color: "var(--theme-text-heading, #0f172a)"
                    }}
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isActive ? "shadow-sm scale-105" : "hover:opacity-80"
                          }`}
                          style={isActive ? {
                            backgroundColor: "var(--theme-tab-active-bg, var(--theme-primary, #005826))",
                            color: "var(--theme-tab-active-text, #ffffff)",
                            borderColor: "var(--theme-tab-active-bg, var(--theme-primary, #005826))"
                          } : {
                            backgroundColor: "var(--theme-card-bg, #ffffff)",
                            borderColor: "var(--theme-card-border, #e5e7eb)",
                            color: "var(--theme-text-heading, #0f172a)"
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={currentPage >= lastPage}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(lastPage, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 py-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--theme-card-bg, #ffffff)",
                      borderColor: "var(--theme-card-border, #e5e7eb)",
                      color: "var(--theme-text-heading, #0f172a)"
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xs h-full p-6 border-l overflow-y-auto space-y-6 z-10 shadow-2xl"
              style={{
                backgroundColor: "var(--theme-card-bg, #ffffff)",
                borderColor: "var(--theme-card-border, #e5e7eb)"
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--theme-card-border, #e5e7eb)" }}>
                <h3 
                  className="text-sm font-black uppercase tracking-wider flex items-center gap-2"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  <Filter className="w-4 h-4" style={{ color: "var(--theme-primary, #005826)" }} /> Filters
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-slate-600 cursor-pointer"
                  style={{ borderColor: "var(--theme-card-border, #e5e7eb)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Categories */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: "var(--theme-text-body, #64748b)" }}>
                  Category
                </span>
                <button
                  onClick={() => { handleCategoryClick(""); setMobileFilterOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between"
                  style={selectedCategory === "" ? {
                    backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                    color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                  } : { color: "var(--theme-text-heading, #0f172a)" }}
                >
                  <span>All Hardware</span>
                  {selectedCategory === "" && <Check className="w-3.5 h-3.5" />}
                </button>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { handleCategoryClick(cat.slug); setMobileFilterOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between"
                      style={isSelected ? {
                        backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                        color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))",
                      } : { color: "var(--theme-text-heading, #0f172a)" }}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] font-normal" style={{ color: "var(--theme-text-body, #94a3b8)" }}>
                        {cat.products_count ?? ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Price */}
              <div className="space-y-2 pt-4 border-t" style={{ borderColor: "var(--theme-card-border, #e5e7eb)" }}>
                <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--theme-text-body, #64748b)" }}>
                  Price Range ($)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded-xl px-3 py-1.5 text-xs border"
                    style={{
                      backgroundColor: "var(--theme-card-bg, #ffffff)",
                      borderColor: "var(--theme-card-border, #e5e7eb)",
                      color: "var(--theme-text-heading, #0f172a)"
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded-xl px-3 py-1.5 text-xs border"
                    style={{
                      backgroundColor: "var(--theme-card-bg, #ffffff)",
                      borderColor: "var(--theme-card-border, #e5e7eb)",
                      color: "var(--theme-text-heading, #0f172a)"
                    }}
                  />
                </div>
              </div>

              {/* Mobile In Stock Only */}
              <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--theme-card-border, #e5e7eb)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--theme-text-heading, #0f172a)" }}>
                  In Stock Only
                </span>
                <button
                  type="button"
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className="w-11 h-6 rounded-full transition-colors relative p-0.5"
                  style={{
                    backgroundColor: inStockOnly ? "var(--theme-primary, #005826)" : "var(--theme-card-border, #cbd5e1)"
                  }}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${inStockOnly ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold theme-btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
