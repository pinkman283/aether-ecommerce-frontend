"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Sparkles,
  Tag,
  Calendar,
  Smartphone,
  Monitor,
  Loader2,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Banner, BannerDestinationType, Category, Brand, Product, Promotion } from "@/types";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  banner: Banner | null;
}

const PLACEMENTS = [
  { id: "primary_hero", label: "Primary Hero", desc: "Main slider (~65% width)" },
  { id: "secondary_hero", label: "Side Promo", desc: "Side card beside hero" },
  { id: "top_strip", label: "Top Strip", desc: "Header announcement bar" },
  { id: "bottom_banner", label: "Bottom Banner", desc: "Voucher / bottom carousel" },
];

const DESTINATION_TYPES: { id: BannerDestinationType; label: string }[] = [
  { id: "custom", label: "Custom URL" },
  { id: "product", label: "Product" },
  { id: "category", label: "Category" },
  { id: "brand", label: "Brand" },
  { id: "promotion", label: "Promotion / Voucher" },
  { id: "page", label: "Internal Page" },
];

export function BannerFormModal({ isOpen, onClose, onSuccess, banner }: BannerFormModalProps) {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMobileUploader, setShowMobileUploader] = useState(false);

  // Lookups
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [ctaText, setCtaText] = useState("Shop Now");
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
      setCtaText(banner.cta_text || "Shop Now");
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
      setShowMobileUploader(Boolean(banner.mobile_image_url));
      setShowAdvanced(Boolean(banner.starts_at || banner.expires_at || (banner.sort_order && banner.sort_order > 0)));
    } else {
      setTitle("");
      setSubtitle("");
      setEyebrow("LIMITED DROP");
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
      setShowMobileUploader(false);
      setShowAdvanced(false);
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  // Handle Image Upload
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
        toast.success("Mobile banner uploaded!");
      } else {
        setImageUrl(res.image_url);
        toast.success("Banner image uploaded!");
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
      const promoCode = promo.primary_code || promo.codes?.[0]?.code;
      if (promoCode) {
        setDiscountTag(`USE CODE: ${promoCode}`);
      } else if (promo.formatted_discount) {
        setDiscountTag(promo.formatted_discount);
      } else if (promo.discount_type === "percentage") {
        setDiscountTag(`${promo.discount_value}% OFF`);
      } else if (promo.discount_type === "free_shipping") {
        setDiscountTag("FREE SHIPPING");
      }
      if (promo.badge || promo.badge_text) {
        setBadge(promo.badge || promo.badge_text || "");
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
      toast.error(placement === "top_strip" ? "Banner title is required." : "Banner title and image are required.");
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
        toast.success(`Banner "${title}" updated.`);
      } else {
        await adminApi.createBanner(payload);
        toast.success(`Banner "${title}" created.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save banner.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#0d1017] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#090b11]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {banner ? "Edit Storefront Banner" : "Create Storefront Banner"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure banner image, copy, and destination for your homepage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Clean 2-Column Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* Left Column: Streamlined Form (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-5 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10">
            
            {/* 1. Placement Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Display Placement
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLACEMENTS.map((p) => {
                  const isSelected = placement === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlacement(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-400/60 text-amber-300 ring-1 ring-amber-400/30"
                          : "bg-[#12151f] border-white/10 text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="block text-xs font-bold truncate">{p.label}</span>
                      <span className="block text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Banner Image (Hidden for top_strip) */}
            {placement !== "top_strip" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Banner Image <span className="text-rose-400">*</span>
                  </label>
                  {!showMobileUploader && (
                    <button
                      type="button"
                      onClick={() => setShowMobileUploader(true)}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                    >
                      + Add mobile image
                    </button>
                  )}
                </div>

                {/* Upload or URL Row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Paste image URL or click Upload..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none font-mono"
                    />
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400"
                        title="Clear image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <label className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-sm">
                    {uploadingDesktop ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

                {/* Optional Mobile Image */}
                {showMobileUploader && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-purple-300 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5" /> Mobile Image (Optional)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileImageUrl("");
                          setShowMobileUploader(false);
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Mobile image URL or upload..."
                        value={mobileImageUrl}
                        onChange={(e) => setMobileImageUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-purple-400 outline-none font-mono"
                      />
                      <label className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                        {uploadingMobile ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
                )}
              </div>
            )}

            {/* 3. Banner Copy & Content */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Headline / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vortex 75 CNC Gasket Mechanical Keyboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-bold placeholder-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anodized 6063 Aluminum Chassis with Five-Layer Acoustic Dampening."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none placeholder-slate-500"
                />
              </div>

              {/* Compact 3-Column Badges & Button */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Eyebrow / Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. LIMITED DROP"
                    value={eyebrow}
                    onChange={(e) => setEyebrow(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none uppercase font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Discount Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF"
                    value={discountTag}
                    onChange={(e) => setDiscountTag(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Configure Keeb"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* 4. Unified Destination Link */}
            <div className="space-y-2 p-3.5 rounded-xl bg-[#12151f] border border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Click Destination
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                {/* Type selector */}
                <div className="sm:col-span-5">
                  <select
                    value={destinationType}
                    onChange={(e) => {
                      const dt = e.target.value as BannerDestinationType;
                      setDestinationType(dt);
                      setDestinationId(null);
                      if (dt === "custom" && !ctaLink) setCtaLink("/products");
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 focus:border-amber-400 outline-none font-semibold"
                  >
                    {DESTINATION_TYPES.map((dt) => (
                      <option key={dt.id} value={dt.id}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Target Picker */}
                <div className="sm:col-span-7">
                  {destinationType === "product" && (
                    <select
                      value={destinationId || ""}
                      onChange={(e) => handleSelectProduct(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (৳{p.price})
                        </option>
                      ))}
                    </select>
                  )}

                  {destinationType === "category" && (
                    <select
                      value={destinationId || ""}
                      onChange={(e) => handleSelectCategory(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                    >
                      <option value="">Select category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {destinationType === "brand" && (
                    <select
                      value={destinationId || ""}
                      onChange={(e) => handleSelectBrand(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                    >
                      <option value="">Select brand...</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {destinationType === "promotion" && (
                    <select
                      value={promotionId || ""}
                      onChange={(e) => handleSelectPromotion(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-amber-400/40 text-xs text-amber-300 focus:border-amber-400 outline-none font-semibold"
                    >
                      <option value="">Link to promotion...</option>
                      {promotions.map((p) => {
                        const code = p.primary_code || p.codes?.[0]?.code;
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} {code ? `[${code}]` : ""}
                          </option>
                        );
                      })}
                    </select>
                  )}

                  {(destinationType === "custom" || destinationType === "page") && (
                    <input
                      type="text"
                      placeholder="/products or https://..."
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 5. Collapsible Scheduling & Advanced Settings */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-4 py-2.5 bg-[#12151f] hover:bg-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scheduling & Advanced (Optional)</span>
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showAdvanced && (
                <div className="p-4 bg-black/30 space-y-3 border-t border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Starts At</label>
                      <input
                        type="datetime-local"
                        value={startsAt}
                        onChange={(e) => setStartsAt(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Expires At</label>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Sort Order</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Image Alt Text</label>
                      <input
                        type="text"
                        placeholder="Description for screen readers"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-amber-500 focus:ring-0"
                />
                <span>Enable immediately on storefront</span>
              </label>
            </div>
          </div>

          {/* Right Column: Live Storefront Preview (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-[#080a0f] flex flex-col justify-between space-y-4">
            <div>
              {/* Preview Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span>Live Storefront Preview</span>
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      previewDevice === "desktop" ? "bg-white/15 text-amber-300" : "text-slate-400 hover:text-white"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      previewDevice === "mobile" ? "bg-white/15 text-purple-300" : "text-slate-400 hover:text-white"
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Preview Rendering */}
              {placement === "top_strip" ? (
                <div className="w-full rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 backdrop-blur-md space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      {eyebrow && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-slate-950">
                          {eyebrow}
                        </span>
                      )}
                      <span className="font-bold text-white text-xs truncate">
                        {title || "Top Promotion Announcement Title"}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 shrink-0">
                      <span>{ctaText || "Claim"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className={`mx-auto transition-all duration-300 rounded-2xl overflow-hidden border border-white/15 shadow-xl relative bg-[#0c0f18] ${
                    previewDevice === "mobile"
                      ? "w-[260px] aspect-[9/14] p-4 flex flex-col justify-end"
                      : "w-full aspect-[16/10] p-5 flex flex-col justify-end"
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={
                      previewDevice === "mobile" && mobileImageUrl
                        ? mobileImageUrl
                        : imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85"
                    }
                    alt="Banner Preview"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />

                  {/* Dark Vignette Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                  {/* Content Overlay */}
                  <div className="relative z-20 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {eyebrow && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                          {eyebrow}
                        </span>
                      )}
                      {discountTag && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-black/60 text-amber-300 border border-amber-400/40">
                          {discountTag}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow">
                      {title || "Your Banner Headline"}
                    </h4>

                    {subtitle && (
                      <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed drop-shadow">
                        {subtitle}
                      </p>
                    )}

                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-950 font-black text-[10px] uppercase tracking-wider shadow">
                        <span>{ctaText || "Shop Now"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Destination preview info */}
              <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-between truncate">
                <span className="text-slate-500">Destination:</span>
                <span className="text-amber-300 font-bold truncate max-w-[180px]">{ctaLink}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{banner ? "Update Banner" : "Publish Banner"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
