"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Search,
  Eye,
  Loader2,
  Headphones,
  Keyboard,
  Briefcase,
  Watch,
  Flame,
  Trophy,
  Zap,
  Boxes,
  Package,
  ShieldCheck,
  Tag,
  Star,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import {
  HomepageSection,
  HomepageSectionTab,
  HomepageSectionSourceType,
  HomepageSectionSortBy,
  Category,
  Brand,
  Product,
} from "@/types";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface HomepageSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  section: HomepageSection | null;
}

const AVAILABLE_ICONS = [
  { id: "Sparkles", label: "Sparkles", Icon: Sparkles },
  { id: "Headphones", label: "Audio / Headphones", Icon: Headphones },
  { id: "Keyboard", label: "Keyboard", Icon: Keyboard },
  { id: "Briefcase", label: "Carry / Bag", Icon: Briefcase },
  { id: "Watch", label: "Wearable / Watch", Icon: Watch },
  { id: "Layers", label: "Layers / Tech", Icon: Layers },
  { id: "Flame", label: "Flame / Hot", Icon: Flame },
  { id: "Trophy", label: "Trophy / Best", Icon: Trophy },
  { id: "Zap", label: "Zap / Lightning", Icon: Zap },
  { id: "Boxes", label: "Boxes / Category", Icon: Boxes },
  { id: "Package", label: "Package", Icon: Package },
  { id: "ShieldCheck", label: "Shield / Security", Icon: ShieldCheck },
  { id: "Tag", label: "Tag / Promo", Icon: Tag },
  { id: "Star", label: "Star / Rating", Icon: Star },
];

const SORT_OPTIONS: { id: HomepageSectionSortBy; label: string }[] = [
  { id: "featured", label: "Featured First" },
  { id: "new_arrivals", label: "New Arrivals (Latest)" },
  { id: "best_sellers", label: "Best Sellers" },
  { id: "price_low_high", label: "Price: Low to High" },
  { id: "price_high_low", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

export function HomepageSectionModal({
  isOpen,
  onClose,
  onSuccess,
  section,
}: HomepageSectionModalProps) {
  const [activeNavTab, setActiveNavTab] = useState<"basic" | "source" | "preview">("basic");
  const [saving, setSaving] = useState(false);

  // Lookups
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Basic Info Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [badgeIcon, setBadgeIcon] = useState("Sparkles");
  const [viewAllLabel, setViewAllLabel] = useState("View All");
  const [viewAllType, setViewAllType] = useState<"category" | "brand" | "all_products" | "custom">("category");
  const [viewAllCategoryId, setViewAllCategoryId] = useState<number | undefined>(undefined);
  const [viewAllBrandId, setViewAllBrandId] = useState<number | undefined>(undefined);
  const [viewAllCustomUrl, setViewAllCustomUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayStyle, setDisplayStyle] = useState<"carousel" | "grid">("carousel");

  // Single Source vs Multi-Tabs
  const [hasTabs, setHasTabs] = useState(true);
  const [sourceType, setSourceType] = useState<HomepageSectionSourceType>("category");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [brandId, setBrandId] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<HomepageSectionSortBy>("featured");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productLimit, setProductLimit] = useState(14);

  // Tabs List State
  const [tabs, setTabs] = useState<HomepageSectionTab[]>([
    {
      id: "tab-featured",
      name: "Featured",
      source_type: "dynamic",
      sort_by: "featured",
      limit: 14,
    },
    {
      id: "tab-new",
      name: "New Arrivals",
      source_type: "dynamic",
      sort_by: "new_arrivals",
      limit: 14,
    },
    {
      id: "tab-bestsellers",
      name: "Best Sellers",
      source_type: "dynamic",
      sort_by: "best_sellers",
      limit: 14,
    },
  ]);

  // Product Picker state
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [pickerTargetTabId, setPickerTargetTabId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState("");

  // Load Categories, Brands & Products for lookups
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadData() {
      setLoadingLookups(true);
      try {
        const [catsRes, brandsRes, prodsRes] = await Promise.all([
          adminApi.getCategories(),
          adminApi.getBrands(),
          adminApi.getProducts({ per_page: 150 }),
        ]);

        if (isMounted) {
          setCategories(Array.isArray(catsRes) ? catsRes : ((catsRes as any)?.data || []));
          setBrands(Array.isArray(brandsRes) ? brandsRes : ((brandsRes as any)?.data || []));
          setAllProducts(
            Array.isArray((prodsRes as any)?.data)
              ? (prodsRes as any).data
              : Array.isArray(prodsRes)
              ? prodsRes
              : []
          );
        }
      } catch (err) {
        console.error("Failed to load lookups for HomepageSectionModal:", err);
      } finally {
        if (isMounted) setLoadingLookups(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Initialize or reset form state when section changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (section) {
      setTitle(section.title || "");
      setSubtitle(section.subtitle || "");
      setBadgeText(section.badge_text || "");
      setBadgeIcon(section.badge_icon || "Sparkles");
      setViewAllLabel(section.view_all_label || "View All");
      setViewAllType(section.view_all_type || "category");
      setViewAllCategoryId(section.view_all_category_id || section.category_id || undefined);
      setViewAllBrandId(section.view_all_brand_id || section.brand_id || undefined);
      setViewAllCustomUrl(section.view_all_url || "");
      setIsActive(section.is_active ?? true);
      setDisplayStyle(section.display_style || "carousel");

      setHasTabs(section.has_tabs ?? true);
      setSourceType(section.source_type || "category");
      setCategoryId(section.category_id || undefined);
      setBrandId(section.brand_id || undefined);
      setSortBy(section.sort_by || "featured");
      setSelectedProductIds(section.product_ids || []);
      setProductLimit(section.product_limit || 14);

      if (section.tabs && Array.isArray(section.tabs) && section.tabs.length > 0) {
        setTabs(
          section.tabs.map((t, idx) => ({
            id: t.id || `tab-${idx}-${Date.now()}`,
            name: t.name,
            source_type: t.source_type || "dynamic",
            category_id: t.category_id,
            brand_id: t.brand_id,
            sort_by: t.sort_by || "featured",
            product_ids: t.product_ids || [],
            limit: t.limit || 14,
          }))
        );
      } else {
        setTabs([
          {
            id: "tab-featured",
            name: "Featured",
            source_type: "dynamic",
            sort_by: "featured",
            limit: 14,
          },
          {
            id: "tab-new",
            name: "New Arrivals",
            source_type: "dynamic",
            sort_by: "new_arrivals",
            limit: 14,
          },
          {
            id: "tab-bestsellers",
            name: "Best Sellers",
            source_type: "dynamic",
            sort_by: "best_sellers",
            limit: 14,
          },
        ]);
      }
    } else {
      // New section defaults
      setTitle("");
      setSubtitle("");
      setBadgeText("");
      setBadgeIcon("Sparkles");
      setViewAllLabel("View All");
      setViewAllType("category");
      setViewAllCategoryId(undefined);
      setViewAllBrandId(undefined);
      setViewAllCustomUrl("");
      setIsActive(true);
      setDisplayStyle("carousel");

      setHasTabs(true);
      setSourceType("category");
      setCategoryId(undefined);
      setBrandId(undefined);
      setSortBy("featured");
      setSelectedProductIds([]);
      setProductLimit(14);
      setTabs([
        {
          id: "tab-featured",
          name: "Featured",
          source_type: "dynamic",
          sort_by: "featured",
          limit: 14,
        },
        {
          id: "tab-new",
          name: "New Arrivals",
          source_type: "dynamic",
          sort_by: "new_arrivals",
          limit: 14,
        },
        {
          id: "tab-bestsellers",
          name: "Best Sellers",
          source_type: "dynamic",
          sort_by: "best_sellers",
          limit: 14,
        },
      ]);
    }
    setActiveNavTab("basic");
  }, [isOpen, section]);

  if (!isOpen) return null;

  // Multi-Tabs actions
  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    setTabs((prev) => [
      ...prev,
      {
        id: newId,
        name: `Tab ${prev.length + 1}`,
        source_type: "dynamic",
        sort_by: "featured",
        limit: 14,
      },
    ]);
  };

  const handleRemoveTab = (index: number) => {
    if (tabs.length <= 1) {
      toast.error("A section with multi-tabs must have at least one tab.");
      return;
    }
    setTabs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTab = (index: number, updates: Partial<HomepageSectionTab>) => {
    setTabs((prev) =>
      prev.map((tab, i) => (i === index ? { ...tab, ...updates } : tab))
    );
  };

  // Product Picker Helpers
  const openProductPicker = (tabId: string | null) => {
    setPickerTargetTabId(tabId);
    setPickerSearch("");
    setPickerCategoryFilter("");
    setIsProductPickerOpen(true);
  };

  const isProductSelectedInPicker = (productId: number) => {
    if (pickerTargetTabId) {
      const tab = tabs.find((t) => t.id === pickerTargetTabId);
      return tab?.product_ids?.includes(productId) || false;
    }
    return selectedProductIds.includes(productId);
  };

  const toggleProductInPicker = (productId: number) => {
    if (pickerTargetTabId) {
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === pickerTargetTabId) {
            const current = t.product_ids || [];
            const exists = current.includes(productId);
            const updated = exists
              ? current.filter((id) => id !== productId)
              : [...current, productId];
            return { ...t, product_ids: updated };
          }
          return t;
        })
      );
    } else {
      setSelectedProductIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
    }
  };

  const filteredPickerProducts = allProducts.filter((p) => {
    const matchesSearch =
      !pickerSearch ||
      p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchesCategory =
      !pickerCategoryFilter ||
      p.category_id?.toString() === pickerCategoryFilter ||
      p.category?.slug === pickerCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Compute View All Destination URL
  const computeViewAllUrl = () => {
    if (viewAllType === "category") {
      const targetCatId = viewAllCategoryId || categoryId;
      const cat = categories.find((c) => c.id === targetCatId);
      return cat ? `/products?category=${cat.slug}` : "/products";
    }
    if (viewAllType === "brand") {
      const targetBId = viewAllBrandId || brandId;
      const b = brands.find((brand) => brand.id === targetBId);
      return b ? `/products?brand=${b.slug}` : "/products";
    }
    if (viewAllType === "all_products") {
      return "/products";
    }
    return viewAllCustomUrl.trim() || "/products";
  };

  // Save section handler
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a section title.");
      setActiveNavTab("basic");
      return;
    }

    setSaving(true);
    try {
      const resolvedUrl = computeViewAllUrl();
      const payload: Partial<HomepageSection> = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        badge_text: badgeText.trim() || undefined,
        badge_icon: badgeIcon || undefined,
        view_all_label: viewAllLabel.trim() || "View All",
        view_all_type: viewAllType,
        view_all_category_id: viewAllType === "category" ? (viewAllCategoryId || categoryId || undefined) : undefined,
        view_all_brand_id: viewAllType === "brand" ? (viewAllBrandId || brandId || undefined) : undefined,
        view_all_url: resolvedUrl,
        is_active: isActive,
        display_style: displayStyle,
        has_tabs: hasTabs,
        source_type: sourceType,
        category_id: categoryId || undefined,
        brand_id: brandId || undefined,
        sort_by: sortBy,
        product_ids: selectedProductIds,
        product_limit: productLimit,
        tabs: hasTabs ? tabs : [],
      };

      if (section?.id) {
        await adminApi.updateHomepageSection(section.id, payload);
        toast.success("Homepage section updated successfully!");
      } else {
        await adminApi.createHomepageSection(payload);
        toast.success("New homepage section created successfully!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save section error:", err);
      toast.error(err?.response?.data?.message || "Failed to save homepage section.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity cursor-pointer"
      />

      {/* Right Drawer Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-screen max-w-[660px] pointer-events-auto bg-[#0b0f17] border-l border-white/[0.08] shadow-2xl flex flex-col h-full overflow-hidden text-slate-100"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-7 py-4 border-b border-white/[0.06] bg-[#0b0f17] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">
                  {section ? "Edit Homepage Section" : "New Homepage Section"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure storefront products, tabs, and layout
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-1.5 px-7 py-2 border-b border-white/[0.06] bg-[#0e131d]/60 shrink-0">
            {[
              { id: "basic" as const, label: "Basic Information", step: 1 },
              { id: "source" as const, label: "Products & Tabs", step: 2 },
              { id: "preview" as const, label: "Realtime Preview", step: 3 },
            ].map((s, idx) => {
              const isActive = activeNavTab === s.id;
              return (
                <React.Fragment key={s.id}>
                  {idx > 0 && (
                    <span className="text-slate-600 text-xs px-1 select-none">/</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveNavTab(s.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-white/[0.06] text-slate-400"
                      }`}
                    >
                      {s.step}
                    </span>
                    <span>{s.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Drawer Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
            {/* TAB 1: BASIC INFO */}
            {activeNavTab === "basic" && (
              <div className="space-y-4">
                {/* Section Title */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <span>Section Title</span>
                    <span className="text-cyan-400 text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Flagship Audio & Acoustics"
                    className="h-10 w-full px-3.5 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                  />
                  <p className="text-[11px] text-slate-500">
                    The primary heading displayed on the storefront section
                  </p>
                </div>

                {/* Subtitle / Description */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Subtitle / Description
                  </label>
                  <textarea
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    rows={2}
                    placeholder="e.g. Audiophile-grade studio monitors, active noise-cancelling headphones, and wireless planar earbuds."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Badge Row (2 Columns, Exact Equal Height) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Badge Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="e.g. HI-RES LOSSLESS"
                      className="h-10 w-full px-3.5 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Badge Icon
                    </label>
                    <div className="relative">
                      <select
                        value={badgeIcon}
                        onChange={(e) => setBadgeIcon(e.target.value)}
                        className="h-10 w-full px-3.5 pr-10 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
                      >
                        {AVAILABLE_ICONS.map((icon) => (
                          <option key={icon.id} value={icon.id}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* View All Button & Destination (Redesigned Minimal Unboxed Section) */}
                <div className="space-y-2.5 pt-1">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      View All Button
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure storefront destination link for this section&apos;s CTA button
                    </p>
                  </div>

                  {/* Destination Segmented Control */}
                  <div className="grid grid-cols-4 p-1 rounded-lg bg-[#111622] border border-white/[0.08] gap-1">
                    <button
                      type="button"
                      onClick={() => setViewAllType("category")}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all text-center cursor-pointer ${
                        viewAllType === "category"
                          ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewAllType("brand")}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all text-center cursor-pointer ${
                        viewAllType === "brand"
                          ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Brand
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewAllType("all_products")}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all text-center cursor-pointer ${
                        viewAllType === "all_products"
                          ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      All Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewAllType("custom")}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all text-center cursor-pointer ${
                        viewAllType === "custom"
                          ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Custom URL
                    </button>
                  </div>

                  {/* Destination Dependent Fields in 2 Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={viewAllLabel}
                        onChange={(e) => setViewAllLabel(e.target.value)}
                        placeholder="View All"
                        className="h-10 w-full px-3.5 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      {viewAllType === "category" && (
                        <>
                          <label className="text-xs font-medium text-slate-400">
                            Target Category
                          </label>
                          <div className="relative">
                            <select
                              value={viewAllCategoryId || categoryId || ""}
                              onChange={(e) =>
                                setViewAllCategoryId(e.target.value ? Number(e.target.value) : undefined)
                              }
                              className="h-10 w-full px-3.5 pr-10 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select Category...</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </>
                      )}

                      {viewAllType === "brand" && (
                        <>
                          <label className="text-xs font-medium text-slate-400">
                            Target Brand
                          </label>
                          <div className="relative">
                            <select
                              value={viewAllBrandId || brandId || ""}
                              onChange={(e) =>
                                setViewAllBrandId(e.target.value ? Number(e.target.value) : undefined)
                              }
                              className="h-10 w-full px-3.5 pr-10 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select Brand...</option>
                              {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </>
                      )}

                      {viewAllType === "all_products" && (
                        <>
                          <label className="text-xs font-medium text-slate-400">
                            Catalog Destination
                          </label>
                          <div className="h-10 px-3.5 rounded-lg bg-[#111622] border border-white/[0.08] flex items-center text-xs text-slate-300">
                            <span>Routes to:</span>
                            <span className="font-mono text-cyan-400 font-semibold ml-2">/products</span>
                          </div>
                        </>
                      )}

                      {viewAllType === "custom" && (
                        <>
                          <label className="text-xs font-medium text-slate-400">
                            Custom Path or URL
                          </label>
                          <input
                            type="text"
                            value={viewAllCustomUrl}
                            onChange={(e) => setViewAllCustomUrl(e.target.value)}
                            placeholder="e.g. /promotions/summer-deals"
                            className="h-10 w-full px-3.5 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Display Layout (Clean Unboxed Row) */}
                <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? "bg-cyan-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div>
                      <span className="text-xs font-medium text-slate-200 block">
                        {isActive ? "Visible on Storefront" : "Hidden (Draft)"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {isActive
                          ? "Section is live and visible to customers"
                          : "Draft state, hidden from customer storefront"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">Layout:</span>
                    <div className="p-0.5 rounded-lg bg-[#111622] border border-white/[0.08] flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => setDisplayStyle("carousel")}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          displayStyle === "carousel"
                            ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Carousel
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisplayStyle("grid")}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          displayStyle === "grid"
                            ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Grid
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS & TABS CONFIGURATION */}
            {activeNavTab === "source" && (
              <div className="space-y-6">
                {/* Structure Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Tabbed Navigation
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Display multiple tabs or a single product source
                    </p>
                  </div>

                  <div className="p-0.5 rounded-lg bg-[#111622] border border-white/[0.08] flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setHasTabs(false)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        !hasTabs
                          ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Single Source
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasTabs(true)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        hasTabs
                          ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Multi-Tabs (Recommended)
                    </button>
                  </div>
                </div>

                {/* SINGLE SOURCE MODE */}
                {!hasTabs && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">
                          Product Source Type
                        </label>
                        <div className="relative">
                          <select
                            value={sourceType}
                            onChange={(e) =>
                              setSourceType(e.target.value as HomepageSectionSourceType)
                            }
                            className="h-10 w-full px-3.5 pr-10 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
                          >
                            <option value="category">Category</option>
                            <option value="brand">Brand</option>
                            <option value="dynamic">Dynamic Rules (Sort / Filters)</option>
                            <option value="manual">Manual Product Selection</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {sourceType === "category" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-400">
                            Select Category
                          </label>
                          <div className="relative">
                            <select
                              value={categoryId || ""}
                              onChange={(e) =>
                                setCategoryId(e.target.value ? Number(e.target.value) : undefined)
                              }
                              className="h-10 w-full px-3.5 pr-10 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select Category...</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {sourceType === "brand" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-400">
                            Select Brand
                          </label>
                          <div className="relative">
                            <select
                              value={brandId || ""}
                              onChange={(e) =>
                                setBrandId(e.target.value ? Number(e.target.value) : undefined)
                              }
                              className="h-10 w-full px-3.5 pr-10 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select Brand...</option>
                              {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {sourceType === "dynamic" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-400">
                            Sorting Rule
                          </label>
                          <div className="relative">
                            <select
                              value={sortBy}
                              onChange={(e) =>
                                setSortBy(e.target.value as HomepageSectionSortBy)
                              }
                              className="h-10 w-full px-3.5 pr-10 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
                            >
                              {SORT_OPTIONS.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">
                          Maximum Products to Display
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={productLimit}
                          onChange={(e) => setProductLimit(Number(e.target.value))}
                          className="h-10 w-full px-3.5 rounded-lg bg-[#111622] border border-white/[0.08] text-sm text-slate-100 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                        />
                      </div>
                    </div>

                    {sourceType === "manual" && (
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-400">
                            Selected Products ({selectedProductIds.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => openProductPicker(null)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-semibold hover:bg-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Choose Products</span>
                          </button>
                        </div>

                        {selectedProductIds.length === 0 ? (
                          <div className="p-6 text-center rounded-lg border border-dashed border-white/[0.08] text-slate-500 text-xs">
                            No products manually selected yet. Click &quot;Choose Products&quot; to pick products.
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 rounded-lg bg-[#111622] border border-white/[0.08]">
                            {selectedProductIds.map((id) => {
                              const p = allProducts.find((item) => item.id === id);
                              return (
                                <div
                                  key={id}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-slate-200"
                                >
                                  <span>{p?.name || `Product #${id}`}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedProductIds((prev) =>
                                        prev.filter((i) => i !== id)
                                      )
                                    }
                                    className="text-slate-400 hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* MULTI-TABS MODE */}
                {hasTabs && (
                  <div className="space-y-5">
                    {/* Primary Category binding for the whole section */}
                    <div className="space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="text-xs font-medium text-slate-300 block">
                            Section Base Category (Optional)
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Bind all tabs to a base category so dynamic sorts apply within it
                          </p>
                        </div>
                        <div className="relative min-w-[220px]">
                          <select
                            value={categoryId || ""}
                            onChange={(e) => {
                              const val = e.target.value ? Number(e.target.value) : undefined;
                              setCategoryId(val);
                              const matched = categories.find((c) => c.id === val);
                              if (matched && !title) {
                                setTitle(matched.name);
                                setViewAllType("category");
                                setViewAllCategoryId(val);
                              }
                            }}
                            className="h-9 w-full px-3 pr-8 rounded-lg bg-[#111622] border border-white/[0.08] text-xs text-slate-100 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">-- All Categories (No Base) --</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                            Section Tabs ({tabs.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Customers can switch between these tabs on the storefront
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddTab}
                          className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#111622] hover:bg-[#161c2b] text-cyan-400 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Tab</span>
                        </button>
                      </div>

                      {/* Tabs List */}
                      <div className="space-y-2.5">
                        {tabs.map((tab, idx) => (
                          <div
                            key={tab.id}
                            className="p-3.5 rounded-lg border border-white/[0.08] bg-[#111622]/50 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1 max-w-xs">
                                <span className="text-[11px] font-mono font-bold text-cyan-400">
                                  #{idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={tab.name}
                                  onChange={(e) =>
                                    handleUpdateTab(idx, { name: e.target.value })
                                  }
                                  placeholder="Tab Label (e.g. Featured)"
                                  className="h-8 px-2.5 rounded-md bg-[#0b0f17] border border-white/[0.08] text-xs text-white font-medium focus:outline-none focus:border-cyan-400 w-full"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                {tabs.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTab(idx)}
                                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Remove Tab"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Tab Configuration Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.04]">
                              <div>
                                <label className="text-[11px] text-slate-400 block mb-1">
                                  Source Type
                                </label>
                                <div className="relative">
                                  <select
                                    value={tab.source_type || "dynamic"}
                                    onChange={(e) =>
                                      handleUpdateTab(idx, {
                                        source_type: e.target.value as any,
                                      })
                                    }
                                    className="h-8 w-full px-2.5 pr-7 rounded-md bg-[#0b0f17] border border-white/[0.08] text-slate-200 text-xs focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                                  >
                                    <option value="dynamic">Dynamic Rule / Sort</option>
                                    <option value="category">Category</option>
                                    <option value="brand">Brand</option>
                                    <option value="manual">Manual Products</option>
                                  </select>
                                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>

                              {tab.source_type === "category" ? (
                                <div>
                                  <label className="text-[11px] text-slate-400 block mb-1">
                                    Category
                                  </label>
                                  <div className="relative">
                                    <select
                                      value={tab.category_id || ""}
                                      onChange={(e) =>
                                        handleUpdateTab(idx, {
                                          category_id: e.target.value
                                            ? Number(e.target.value)
                                            : undefined,
                                        })
                                      }
                                      className="h-8 w-full px-2.5 pr-7 rounded-md bg-[#0b0f17] border border-white/[0.08] text-slate-200 text-xs focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                                    >
                                      <option value="">Select Category...</option>
                                      {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                          {c.name}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                </div>
                              ) : tab.source_type === "brand" ? (
                                <div>
                                  <label className="text-[11px] text-slate-400 block mb-1">
                                    Brand
                                  </label>
                                  <div className="relative">
                                    <select
                                      value={tab.brand_id || ""}
                                      onChange={(e) =>
                                        handleUpdateTab(idx, {
                                          brand_id: e.target.value
                                            ? Number(e.target.value)
                                            : undefined,
                                        })
                                      }
                                      className="h-8 w-full px-2.5 pr-7 rounded-md bg-[#0b0f17] border border-white/[0.08] text-slate-200 text-xs focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                                    >
                                      <option value="">Select Brand...</option>
                                      {brands.map((b) => (
                                        <option key={b.id} value={b.id}>
                                          {b.name}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                </div>
                              ) : tab.source_type === "manual" ? (
                                <div>
                                  <label className="text-[11px] text-slate-400 block mb-1">
                                    Picked: {tab.product_ids?.length || 0} items
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => openProductPicker(tab.id)}
                                    className="h-8 w-full px-2.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Search className="w-3 h-3" />
                                    <span>Choose ({tab.product_ids?.length || 0})</span>
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <label className="text-[11px] text-slate-400 block mb-1">
                                    Sort Order
                                  </label>
                                  <div className="relative">
                                    <select
                                      value={tab.sort_by || "featured"}
                                      onChange={(e) =>
                                        handleUpdateTab(idx, {
                                          sort_by: e.target.value as any,
                                        })
                                      }
                                      className="h-8 w-full px-2.5 pr-7 rounded-md bg-[#0b0f17] border border-white/[0.08] text-slate-200 text-xs focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                                    >
                                      {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="text-[11px] text-slate-400 block mb-1">
                                  Max Items
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={30}
                                  value={tab.limit || 14}
                                  onChange={(e) =>
                                    handleUpdateTab(idx, {
                                      limit: Number(e.target.value),
                                    })
                                  }
                                  className="h-8 w-full px-2.5 rounded-md bg-[#0b0f17] border border-white/[0.08] text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: REALTIME PREVIEW */}
            {activeNavTab === "preview" && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Storefront Simulation
                  </h3>
                  <p className="text-xs text-slate-400">
                    Simulates how the section header, badge, dynamic tabs, and View All button render on the customer storefront.
                  </p>
                </div>

                {/* Simulation Canvas */}
                <div className="p-5 rounded-xl bg-[#070a0f] border border-white/[0.08] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      {badgeText && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-cyan-500/25 bg-cyan-500/10 text-cyan-400">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>{badgeText}</span>
                        </div>
                      )}
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {title || "Untitled Section"}
                      </h2>
                      {subtitle && (
                        <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">
                          {subtitle}
                        </p>
                      )}
                    </div>

                    {/* Tabs simulation */}
                    {hasTabs && (
                      <div className="flex rounded-md p-1 border border-white/[0.08] bg-[#0b0f17] gap-1 self-start sm:self-auto overflow-x-auto">
                        {tabs.map((tab, idx) => (
                          <div
                            key={tab.id}
                            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
                              idx === 0
                                ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                                : "text-slate-400"
                            }`}
                          >
                            {tab.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sample Product Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(allProducts.length > 0 ? allProducts.slice(0, 4) : [1, 2, 3, 4]).map(
                      (p: any, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-white/[0.06] bg-[#0e131d]/60 p-3 space-y-2"
                        >
                          <div className="w-full h-24 rounded-md bg-white/[0.03] flex items-center justify-center overflow-hidden">
                            {p?.thumbnail ? (
                              <img
                                src={p.thumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-slate-600" />
                            )}
                          </div>
                          <div className="text-xs font-medium text-slate-200 truncate">
                            {p?.name || `Preview Product ${i + 1}`}
                          </div>
                          <div className="text-xs font-mono text-cyan-400 font-semibold">
                            {p?.price ? formatPrice(p.price) : "$199.00"}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* View All CTA */}
                  <div className="text-center pt-1">
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-semibold uppercase tracking-wider text-slate-300">
                      <span>{viewAllLabel || "View All"}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Sticky Footer */}
          <div className="flex items-center justify-between px-7 py-4 border-t border-white/[0.08] bg-[#0b0f17] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{section ? "Update Section" : "Create Section"}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* SEARCHABLE MANUAL PRODUCT PICKER SUB-MODAL */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0b0f17] border border-white/[0.08] rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0e131d]/60">
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Select Products</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter row */}
            <div className="p-4 border-b border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0e131d]/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search by name or SKU..."
                  className="w-full pl-9 pr-3 h-9 rounded-lg bg-[#111622] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="relative">
                <select
                  value={pickerCategoryFilter}
                  onChange={(e) => setPickerCategoryFilter(e.target.value)}
                  className="w-full px-3 pr-8 h-9 rounded-lg bg-[#111622] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-white/[0.04] space-y-1">
              {filteredPickerProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No products matching your search criteria.
                </div>
              ) : (
                filteredPickerProducts.map((prod) => {
                  const selected = isProductSelectedInPicker(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleProductInPicker(prod.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                        selected
                          ? "bg-cyan-500/10 border border-cyan-500/25"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-white/[0.03] overflow-hidden flex items-center justify-center shrink-0">
                          {prod.thumbnail || prod.primary_image?.image_url ? (
                            <img
                              src={prod.thumbnail || prod.primary_image?.image_url || ""}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">
                            {prod.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>SKU: {prod.sku || "N/A"}</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-mono">
                              {formatPrice(prod.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                          selected
                            ? "bg-cyan-500 border-cyan-400 text-slate-950"
                            : "border-white/20 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Submodal footer */}
            <div className="px-6 py-3.5 border-t border-white/[0.06] bg-[#0e131d]/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {pickerTargetTabId
                  ? `${tabs.find((t) => t.id === pickerTargetTabId)?.product_ids?.length || 0} selected for this tab`
                  : `${selectedProductIds.length} selected for this section`}
              </span>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
