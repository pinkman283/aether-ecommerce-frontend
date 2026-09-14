"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Upload, 
  Sparkles, 
  Tag, 
  Layers, 
  Calendar, 
  Link2, 
  Smartphone, 
  Monitor, 
  Loader2, 
  Check, 
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Plus
} from "lucide-react";
import { Banner, BannerDestinationType, Category, Brand, Product, Promotion } from "@/types";
import { adminApi } from "@/lib/adminApi";
import { ImageUploadGuidance } from "@/components/admin/ui/ImageUploadGuidance";
import { toast } from "sonner";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  banner: Banner | null;
}

const PLACEMENTS = [
  { id: "primary_hero", label: "Primary Hero Banner / Carousel", desc: "Main prominent slider on homepage (~65% width)" },
  { id: "secondary_hero", label: "Secondary Promotional Card", desc: "Featured side card beside primary hero (e.g. Free Delivery)" },
  { id: "top_strip", label: "Top Micro Promotion Strip", desc: "High-contrast announcement bar above hero with coupon code" },
  { id: "bottom_banner", label: "Bottom Banner", desc: "Bottom promotional banner carousel above smart living showcase" },
];

const DESTINATION_TYPES: { id: BannerDestinationType; label: string; desc: string }[] = [
  { id: "product", label: "Single Product", desc: "Direct product detail page" },
  { id: "category", label: "Category", desc: "Filtered catalog for category" },
  { id: "brand", label: "Brand", desc: "Filtered catalog for brand" },
  { id: "promotion", label: "Promotion / Voucher", desc: "Active campaign or coupon discount" },
  { id: "page", label: "Internal Page", desc: "Shop, Deals, About, Contact, etc." },
  { id: "custom", label: "Custom URL", desc: "Any custom relative or external URL" },
];

export function BannerFormModal({ isOpen, onClose, onSuccess, banner }: BannerFormModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "media" | "content" | "destination" | "schedule">("basic");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  // Lookups
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [ctaText, setCtaText] = useState("Explore Flagship");
  const [ctaLink, setCtaLink] = useState("/products");
  const [destinationType, setDestinationType] = useState<BannerDestinationType>("custom");
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [promotionId, setPromotionId] = useState<number | null>(null);
  const [placement, setPlacement] = useState("primary_hero");
  const [badge, setBadge] = useState("");
  const [discountTag, setDiscountTag] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Load lookup data on mount
  useEffect(() => {
    async function loadLookups() {
      try {
        const [prodRes, catRes, brandRes, promoRes] = await Promise.all([
          adminApi.getProducts({ per_page: 100 }).catch(() => ({ data: [] })),
          adminApi.getCategories().catch(() => []),
          adminApi.getBrands().catch(() => []),
          adminApi.getPromotions({ per_page: 100 }).catch(() => ({ data: [] })),
        ]);
        setProducts(prodRes?.data || []);
        setCategories(catRes || []);
        setBrands(brandRes || []);
        setPromotions(promoRes?.data || []);
      } catch (err) {
        console.error("Error loading lookups:", err);
      }
    }
    if (isOpen) {
      loadLookups();
    }
  }, [isOpen]);

  // Sync state when banner prop changes
  useEffect(() => {
    if (banner) {
      setTitle(banner.title || "");
      setSubtitle(banner.subtitle || "");
      setEyebrow(banner.eyebrow || "");
      setImageUrl(banner.image_url || "");
      setMobileImageUrl(banner.mobile_image_url || "");
      setAltText(banner.alt_text || "");
      setCtaText(banner.cta_text || "Explore Flagship");
      setCtaLink(banner.cta_link || "/products");
      setDestinationType(banner.destination_type || "custom");
      setDestinationId(banner.destination_id || null);
      setPromotionId(banner.promotion_id || null);
      setPlacement(
        banner.placement === "middle_promo" ? "bottom_banner" : (banner.placement || "primary_hero")
      );
      setBadge(banner.badge || "");
      setDiscountTag(banner.discount_tag || "");
      setSortOrder(String(banner.sort_order ?? 0));
      setIsActive(banner.is_active ?? true);
      setStartsAt(banner.starts_at ? banner.starts_at.slice(0, 16) : "");
      setExpiresAt(banner.expires_at ? banner.expires_at.slice(0, 16) : "");
    } else {
      setTitle("");
      setSubtitle("");
      setEyebrow("EXCLUSIVE RELEASE");
      setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=85");
      setMobileImageUrl("");
      setAltText("");
      setCtaText("Shop Now");
      setCtaLink("/products");
      setDestinationType("custom");
      setDestinationId(null);
      setPromotionId(null);
      setPlacement("primary_hero");
      setBadge("NEW ARRIVAL");
      setDiscountTag("20% OFF");
      setSortOrder("0");
      setIsActive(true);
      setStartsAt("");
      setExpiresAt("");
    }
    setActiveTab("basic");
  }, [banner, isOpen]);

  if (!isOpen) return null;

  // Handle Desktop Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    if (isMobile) setUploadingMobile(true);
    else setUploadingDesktop(true);

    try {
      const res = await adminApi.uploadBannerImage(file);
      if (isMobile) {
        setMobileImageUrl(res.image_url);
        toast.success("Mobile banner image uploaded!");
      } else {
        setImageUrl(res.image_url);
        toast.success("Desktop banner image uploaded!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload image.");
    } finally {
      if (isMobile) setUploadingMobile(false);
      else setUploadingDesktop(false);
    }
  };

  // Sync Promotion details into CTA & discount tag
  const handleSelectPromotion = (id: number) => {
    setPromotionId(id);
    const promo = promotions.find((p) => p.id === id);
    if (promo) {
      const promoCode = promo.codes?.[0]?.code;
      if (promoCode) {
        setDiscountTag(`USE CODE: ${promoCode}`);
      } else if (promo.discount_type === "percentage") {
        setDiscountTag(`${promo.discount_value}% OFF`);
      } else if (promo.discount_type === "free_shipping") {
        setDiscountTag("FREE SHIPPING");
      }
      if (promo.badge_text) {
        setBadge(promo.badge_text);
      }
      setCtaLink(`/promotions/${promo.slug}`);
    }
  };

  const handleSelectProduct = (id: number) => {
    setDestinationId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setCtaLink(`/products/${prod.slug}`);
    }
  };

  const handleSelectCategory = (id: number) => {
    setDestinationId(id);
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      setCtaLink(`/products?category=${cat.slug}`);
    }
  };

  const handleSelectBrand = (id: number) => {
    setDestinationId(id);
    const brand = brands.find((b) => b.id === id);
    if (brand) {
      setCtaLink(`/products?brand=${brand.slug}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (placement !== "top_strip" && !imageUrl.trim())) {
      toast.error(placement === "top_strip" ? "Banner title is required." : "Banner title and desktop image are required.");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Banner> = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        eyebrow: eyebrow.trim() || null,
        image_url: imageUrl.trim() || (placement === "top_strip" ? "no-image-strip" : ""),
        mobile_image_url: mobileImageUrl.trim() || null,
        alt_text: altText.trim() || null,
        cta_text: ctaText.trim() || "Shop Now",
        cta_link: ctaLink.trim() || "/products",
        destination_type: destinationType,
        destination_id: destinationId,
        promotion_id: destinationType === "promotion" ? promotionId : null,
        placement,
        badge: badge.trim() || null,
        discount_tag: discountTag.trim() || null,
        sort_order: parseInt(sortOrder, 10) || 0,
        is_active: isActive,
        starts_at: startsAt ? startsAt : null,
        expires_at: expiresAt ? expiresAt : null,
      };

      if (banner) {
        await adminApi.updateBanner(banner.id, payload);
        toast.success(`Banner "${title}" updated successfully.`);
      } else {
        await adminApi.createBanner(payload);
        toast.success(`Banner "${title}" created successfully.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save banner.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered products for dropdown search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-3xl bg-[#0d1017] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090b11]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {banner ? "Edit Promotional Banner" : "Create New Storefront Banner"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure homepage hero sliders, secondary promotional cards, and dynamic destinations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Grid (Left: Tabbed Form, Right: Live Storefront Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* Left Column: Form Builder (7 cols) */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-white/10 space-y-5 overflow-y-auto">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold overflow-x-auto no-scrollbar">
              {[
                { id: "basic", label: "Basic Info" },
                ...(placement === "top_strip" ? [] : [{ id: "media", label: "Media Assets" }]),
                { id: "content", label: "Marketing Copy" },
                { id: "destination", label: "Destination Link" },
                { id: "schedule", label: "Schedule & Order" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: BASIC INFO */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Banner Title / Headline <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aether Pulse ANC Wireless Studio"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Subtitle / Marketing Statement
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Next-Gen 50mm Beryllium Transducers. Pure Lossless Soundscapes."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Display Placement</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PLACEMENTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlacement(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          placement === p.id
                            ? "bg-cyan-500/15 border-cyan-400/50 text-white ring-1 ring-cyan-400/30 shadow-sm"
                            : "bg-[#12151f] border-white/10 text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="block text-xs font-bold text-white">{p.label}</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0"
                    />
                    Enable this banner immediately for storefront display
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: MEDIA ASSETS */}
            {activeTab === "media" && (
              <div className="space-y-4">
                {/* Desktop Image */}
                <div className="p-4 rounded-xl bg-[#12151f] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      Desktop Banner Asset <span className="text-rose-400">*</span>
                    </label>
                    <ImageUploadGuidance
                      slotKey={
                        placement === "middle_promo"
                          ? "admin_banner_middle"
                          : placement === "category_spotlight"
                          ? "admin_banner_category"
                          : placement === "bottom_banner"
                          ? "admin_banner_bottom"
                          : "admin_banner_hero_desktop"
                      }
                      imageUrl={imageUrl}
                      layout="inline"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Image URL or upload below"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                    />
                    <label className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors">
                      {uploadingDesktop ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Mobile Image */}
                <div className="p-4 rounded-xl bg-[#12151f] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      Mobile Banner Asset <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <ImageUploadGuidance
                      slotKey="admin_banner_hero_mobile"
                      imageUrl={mobileImageUrl}
                      layout="inline"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    If provided, will display on small screens (&lt;640px) to prevent aggressive cropping.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Mobile Image URL or upload"
                      value={mobileImageUrl}
                      onChange={(e) => setMobileImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                    />
                    <label className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors">
                      {uploadingMobile ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Alt text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Accessibility Alt Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Aether Pulse ANC studio headphones resting on aluminum stand"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: MARKETING CONTENT */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Eyebrow (Top Pill Tag)</label>
                    <input
                      type="text"
                      placeholder="e.g. EXCLUSIVE PRICES or LIMITED DROP"
                      value={eyebrow}
                      onChange={(e) => setEyebrow(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Highlight Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. NEW ARRIVAL, TITANIUM"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Discount Tag / Callout</label>
                    <input
                      type="text"
                      placeholder="e.g. 20% OFF or USE CODE: SAVE20"
                      value={discountTag}
                      onChange={(e) => setDiscountTag(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">CTA Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Explore Flagship, Shop Now"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DESTINATION LINKAGE */}
            {activeTab === "destination" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Destination Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DESTINATION_TYPES.map((dt) => (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => {
                          setDestinationType(dt.id);
                          setDestinationId(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          destinationType === dt.id
                            ? "bg-cyan-500/15 border-cyan-400/50 text-white ring-1 ring-cyan-400/30"
                            : "bg-[#12151f] border-white/10 text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="block text-xs font-bold text-white">{dt.label}</span>
                        <span className="block text-[10px] text-slate-400">{dt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Selector based on Destination Type */}
                {destinationType === "product" && (
                  <div className="space-y-2 p-4 rounded-xl bg-[#12151f] border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-cyan-300">Select Target Product</label>
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-xs text-white outline-none"
                      />
                    </div>
                    <select
                      value={destinationId || ""}
                      onChange={(e) => handleSelectProduct(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                    >
                      <option value="">Select a product...</option>
                      {filteredProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (৳{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {destinationType === "category" && (
                  <div className="space-y-2 p-4 rounded-xl bg-[#12151f] border border-white/10">
                    <label className="text-xs font-bold text-cyan-300">Select Target Category</label>
                    <select
                      value={destinationId || ""}
                      onChange={(e) => handleSelectCategory(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                    >
                      <option value="">Select a category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {destinationType === "brand" && (
                  <div className="space-y-2 p-4 rounded-xl bg-[#12151f] border border-white/10">
                    <label className="text-xs font-bold text-cyan-300">Select Target Brand</label>
                    <select
                      value={destinationId || ""}
                      onChange={(e) => handleSelectBrand(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                    >
                      <option value="">Select a brand...</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {destinationType === "promotion" && (
                  <div className="space-y-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-purple-300 flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Link to Active Promotion
                      </label>
                      <span className="text-[10px] text-purple-300/80 font-mono">
                        Authoritative Source of Truth
                      </span>
                    </div>
                    <select
                      value={promotionId || ""}
                      onChange={(e) => handleSelectPromotion(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-purple-400 outline-none font-semibold"
                    >
                      <option value="">Choose an active promotion...</option>
                      {promotions.map((p) => {
                        const code = p.codes?.[0]?.code;
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} {code ? `[CODE: ${code}]` : `(${p.discount_value}% OFF)`}
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[11px] text-purple-300/70">
                      Linking automatically updates coupon discount tags and points customer clicks to the promotion landing page.
                    </p>
                  </div>
                )}

                {/* Resolved URL Display */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-300">Final Resolved URL</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/products"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: SCHEDULING & ORDER */}
            {activeTab === "schedule" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#12151f] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    Automated Campaign Schedule
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Banners will automatically appear when the start date arrives and disappear once expired.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Starts At</label>
                      <input
                        type="datetime-local"
                        value={startsAt}
                        onChange={(e) => setStartsAt(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Expires At</label>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Display Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={sortOrder}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/^0+(?=\d)/, "");
                      setSortOrder(clean);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-500">Lower numbers display first.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Storefront Preview (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-[#080a0f] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  Live Storefront Preview
                </span>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                      previewDevice === "desktop" ? "bg-white/15 text-cyan-300" : "text-slate-400 hover:text-white"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                      previewDevice === "mobile" ? "bg-white/15 text-purple-300" : "text-slate-400 hover:text-white"
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Preview Container */}
              {placement === "top_strip" ? (
                <div className="w-full rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 backdrop-blur-md space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="text-amber-400 font-bold uppercase">⚡ Micro Announcement Strip Preview</span>
                    <span>No image required</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs pt-1">
                    <div className="flex items-center gap-2">
                      {badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                          {badge}
                        </span>
                      )}
                      <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{title || "Top Promotion Announcement Title"}</span>
                      </span>
                      {subtitle && (
                        <span className="hidden sm:inline text-slate-300 text-[11px]">
                          — {subtitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {discountTag && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-400 text-amber-950 font-mono text-[10px] font-black shadow-xs">
                          <Tag className="w-3 h-3 text-amber-700" />
                          <span>{discountTag}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300">
                        <span>{ctaText || "Claim Discount"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`mx-auto transition-all duration-300 rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative bg-[#0c0f18] ${
                    previewDevice === "mobile"
                      ? "w-[280px] aspect-[9/16] p-4 flex flex-col justify-end"
                      : "w-full aspect-[16/9] p-6 flex flex-col justify-end"
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={previewDevice === "mobile" && mobileImageUrl ? mobileImageUrl : imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85"}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />

                  {/* Content Overlay */}
                  <div className="relative z-20 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {eyebrow && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                          {eyebrow}
                        </span>
                      )}
                      {badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                          {badge}
                        </span>
                      )}
                      {discountTag && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40">
                          {discountTag}
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow">
                      {title || "Your Banner Headline"}
                    </h4>

                    {subtitle && (
                      <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed drop-shadow">
                        {subtitle}
                      </p>
                    )}

                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-slate-950 font-black text-[10px] uppercase tracking-wider shadow">
                        <span>{ctaText || "Shop Now"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Destination Metadata Preview */}
              <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 text-xs font-mono">
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Destination:</span>
                  <span className="text-cyan-300 font-bold uppercase">{destinationType}</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between truncate">
                  <span>Target Link:</span>
                  <span className="text-white truncate max-w-[200px]">{ctaLink}</span>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{banner ? "Update Banner" : "Publish Banner"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
