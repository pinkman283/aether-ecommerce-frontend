"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  ArrowLeft,
  Save,
  Tag,
  Gift,
  Zap,
  Calendar,
  Layers,
  Users,
  Shield,
  Percent,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Wand2,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Promotion, Category, Brand, Product, User } from "@/types";
import { AdminPageHeader } from "@/components/admin/ui";
import { PromotionPreview } from "./PromotionPreview";
import { toast } from "sonner";

interface PromotionFormProps {
  initialData?: Promotion;
  isEdit?: boolean;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
  initialData,
  isEdit = false,
}) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "mechanics" | "schedule" | "limits" | "scoping" | "codes" | "claim"
  >("general");

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(
    Boolean(initialData?.slug && isEdit)
  );
  const [activeClaimDeadlinePreset, setActiveClaimDeadlinePreset] = useState<string | null>(null);
  const [activeExpiresAtPreset, setActiveExpiresAtPreset] = useState<string | null>(null);

  // Lookup data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);

  // Form State
  const [formData, setFormData] = useState<Omit<Partial<Promotion>, "codes"> & {
    target_product_ids?: number[];
    target_category_ids?: number[];
    target_brand_ids?: number[];
    excluded_product_ids?: number[];
    customer_ids?: number[];
    codes?: Array<{ code: string; usage_limit?: number | null }>;
  }>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    promotion_type: initialData?.promotion_type || "discount_code",
    discount_type: initialData?.discount_type || "percentage",
    discount_value: initialData?.discount_value ?? 10,
    max_discount_amount: initialData?.max_discount_amount || null,
    bxgy_buy_quantity: initialData?.bxgy_buy_quantity || 1,
    bxgy_get_quantity: initialData?.bxgy_get_quantity || 1,
    bxgy_reward_discount_percent: initialData?.bxgy_reward_discount_percent ?? 100,
    bxgy_max_applications: initialData?.bxgy_max_applications || null,
    applies_to: initialData?.applies_to || "entire_order",
    status: initialData?.status || "active",
    min_order_amount: initialData?.min_order_amount ?? 0,
    max_order_amount: initialData?.max_order_amount || null,
    min_quantity: initialData?.min_quantity || null,
    max_quantity: initialData?.max_quantity || null,
    customer_eligibility: initialData?.customer_eligibility || "all",
    starts_at: initialData?.starts_at ? initialData.starts_at.slice(0, 16) : "",
    expires_at: initialData?.expires_at ? initialData.expires_at.slice(0, 16) : "",
    claim_deadline: initialData?.claim_deadline ? initialData.claim_deadline.slice(0, 16) : "",
    claim_validity_days: initialData?.claim_validity_days ?? null,
    total_usage_limit: initialData?.total_usage_limit || null,
    per_customer_usage_limit: initialData?.per_customer_usage_limit ?? 1,
    total_claim_limit: initialData?.total_claim_limit || null,
    is_stackable: initialData?.is_stackable ?? false,
    can_combine_with_free_shipping: initialData?.can_combine_with_free_shipping ?? true,
    can_combine_with_order_discounts: initialData?.can_combine_with_order_discounts ?? false,
    can_combine_with_product_discounts: initialData?.can_combine_with_product_discounts ?? false,
    priority: initialData?.priority ?? 10,
    badge_text: initialData?.badge_text || "",
    cta_text: initialData?.cta_text || "Shop Deals",
    cta_destination: initialData?.cta_destination || "/products",
    is_featured: initialData?.is_featured ?? false,
    target_product_ids: initialData?.product_targets?.filter((t) => t.target_type === "product" && !t.is_exclusion).map((t) => t.target_id) || [],
    target_category_ids: initialData?.product_targets?.filter((t) => t.target_type === "category" && !t.is_exclusion).map((t) => t.target_id) || [],
    target_brand_ids: initialData?.product_targets?.filter((t) => t.target_type === "brand" && !t.is_exclusion).map((t) => t.target_id) || [],
    excluded_product_ids: initialData?.product_targets?.filter((t) => t.is_exclusion).map((t) => t.target_id) || [],
    customer_ids: initialData?.customer_restrictions?.map((c) => c.user_id) || [],
    codes: initialData?.codes?.map((c) => ({ code: c.code, usage_limit: c.usage_limit })) || [
      { code: "", usage_limit: null },
    ],
  });

  // Batch code generator state
  const [batchCount, setBatchCount] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState("PROMO-");
  const [batchUsageLimit, setBatchUsageLimit] = useState<number | null>(1);

  // Load ancillary lists
  useEffect(() => {
    async function loadLookups() {
      try {
        const [catRes, brandRes, prodRes] = await Promise.all([
          adminApi.getCategories().catch(() => []),
          adminApi.getBrands().catch(() => []),
          adminApi.getProducts({ per_page: 100 }).catch(() => ({ data: [] })),
        ]);
        setCategories(catRes || []);
        setBrands(brandRes || []);
        setProducts(prodRes?.data || []);
      } catch (err) {
        console.error("Error loading lookups:", err);
      }
    }
    loadLookups();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper to handle numeric inputs cleanly: removes leading zeroes (e.g. 020 -> 20) and selects on focus
  const handleNumericFieldChange = (
    field: string,
    rawVal: string,
    options?: { isFloat?: boolean; defaultNull?: boolean }
  ) => {
    if (rawVal === "" || rawVal === undefined) {
      handleChange(field, options?.defaultNull ? null : null);
      return;
    }
    // Strip leading zeroes followed by another digit, e.g. "020" -> "20"
    const cleaned = rawVal.replace(/^0+(?=\d)/, "");
    const num = options?.isFloat ? parseFloat(cleaned) : parseInt(cleaned, 10);
    handleChange(field, isNaN(num) ? null : num);
  };

  // Auto-generate slug as user types promotion title
  const handleNameChange = (name: string) => {
    setFormData((prev) => {
      const updates: any = { ...prev, name };
      if (!isSlugManuallyEdited) {
        updates.slug = slugify(name);
      }
      return updates;
    });
  };

  const handleSlugChange = (slug: string) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
    }));
  };

  const handleRegenerateSlug = () => {
    const freshSlug = slugify(formData.name || "");
    setIsSlugManuallyEdited(false);
    setFormData((prev) => ({
      ...prev,
      slug: freshSlug,
    }));
    toast.success(`Generated slug: ${freshSlug}`);
  };

  // Shortcut helpers for date settings with toggle / unselect behavior
  const applyClaimDeadlineOffset = (offsetHours: number | null, presetKey?: string) => {
    if (offsetHours === null || (presetKey && activeClaimDeadlinePreset === presetKey)) {
      handleChange("claim_deadline", "");
      setActiveClaimDeadlinePreset(null);
      return;
    }
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    handleChange("claim_deadline", d.toISOString().slice(0, 16));
    setActiveClaimDeadlinePreset(presetKey || null);
  };

  const applyExpiresAtOffset = (offsetDays: number | null, presetKey?: string) => {
    if (offsetDays === null || (presetKey && activeExpiresAtPreset === presetKey)) {
      handleChange("expires_at", "");
      setActiveExpiresAtPreset(null);
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    handleChange("expires_at", d.toISOString().slice(0, 16));
    setActiveExpiresAtPreset(presetKey || null);
  };

  const handleToggleClaimValidityDays = (days: number) => {
    if (formData.claim_validity_days === days) {
      handleChange("claim_validity_days", null);
    } else {
      handleChange("claim_validity_days", days);
    }
  };

  const handleAddCode = () => {
    setFormData((prev) => ({
      ...prev,
      codes: [...(prev.codes || []), { code: "", usage_limit: null }],
    }));
  };

  const handleRemoveCode = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      codes: (prev.codes || []).filter((_, i) => i !== index),
    }));
  };

  const handleCodeChange = (index: number, field: "code" | "usage_limit", val: any) => {
    setFormData((prev) => {
      const nextCodes = [...(prev.codes || [])];
      nextCodes[index] = { ...nextCodes[index], [field]: val };
      return { ...prev, codes: nextCodes };
    });
  };

  const handleGenerateBatchCodes = () => {
    const generated: Array<{ code: string; usage_limit: number | null }> = [];
    for (let i = 0; i < batchCount; i++) {
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      generated.push({
        code: `${batchPrefix}${randomStr}`,
        usage_limit: batchUsageLimit,
      });
    }
    setFormData((prev) => ({
      ...prev,
      codes: [...(prev.codes || []).filter((c) => c.code.trim() !== ""), ...generated],
    }));
    toast.success(`Generated ${batchCount} unique promotion codes`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Promotion name is required");
      setActiveTab("general");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        ...formData,
        min_order_amount: Number(formData.min_order_amount) || 0,
        discount_value: Number(formData.discount_value) || 0,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        per_customer_usage_limit: Number(formData.per_customer_usage_limit) || 1,
        total_usage_limit: formData.total_usage_limit ? Number(formData.total_usage_limit) : null,
        total_claim_limit: formData.total_claim_limit ? Number(formData.total_claim_limit) : null,
        claim_validity_days: formData.claim_validity_days ? Number(formData.claim_validity_days) : null,
        bxgy_buy_quantity: formData.bxgy_buy_quantity ? Number(formData.bxgy_buy_quantity) : null,
        bxgy_get_quantity: formData.bxgy_get_quantity ? Number(formData.bxgy_get_quantity) : null,
        bxgy_reward_discount_percent: formData.bxgy_reward_discount_percent ? Number(formData.bxgy_reward_discount_percent) : null,
        bxgy_max_applications: formData.bxgy_max_applications ? Number(formData.bxgy_max_applications) : null,
        codes: (formData.codes || [])
          .filter((c) => c.code && c.code.trim() !== "")
          .map((c) => ({
            code: c.code.trim().toUpperCase(),
            usage_limit: c.usage_limit ? Number(c.usage_limit) : null,
          })),
      };

      if (isEdit && initialData) {
        await adminApi.updatePromotion(initialData.id, payload);
        toast.success("Promotion updated successfully");
      } else {
        await adminApi.createPromotion(payload);
        toast.success("Promotion created successfully");
      }
      router.push("/admin/promotions");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <AdminPageHeader
        title={isEdit ? `Edit: ${initialData?.name}` : "Create New Promotion"}
        description="Configure discount rules, product scoping, customer eligibility, claim validity, and automated triggers."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Promotions & Discounts", href: "/admin/promotions" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : isEdit ? "Update Promotion" : "Publish Promotion"}
            </button>
          </div>
        }
      />

      {/* Main Grid: Form Left, Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Container (Col 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto no-scrollbar pb-1 text-xs">
            {[
              { key: "general", label: "General & Branding", icon: Sparkles },
              { key: "mechanics", label: "Discount Mechanics", icon: Percent },
              { key: "schedule", label: "Time Limits & Schedule", icon: Clock },
              { key: "limits", label: "Rules & Safeguards", icon: Shield },
              { key: "scoping", label: "Target Scoping", icon: Layers },
              { key: "codes", label: "Promo Codes", icon: Tag },
              { key: "claim", label: "Audience & VIP", icon: Users },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === t.key
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TAB 1: General & Branding */}
            {activeTab === "general" && (
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e14] space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Basic Promotion Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Promotion Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eid Mega Sale, Cyber Monday 20% OFF"
                      value={formData.name || ""}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* Auto-Generated Slug with Manual Override & Sync Button */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">
                        URL Slug / Key
                      </label>
                      <button
                        type="button"
                        onClick={handleRegenerateSlug}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
                        title="Re-generate slug from title"
                      >
                        <Wand2 className="w-3 h-3" />
                        Auto-generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. eid-mega-sale"
                        value={formData.slug || ""}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Auto-generated from title. URL safe identifier.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Promotion Status</label>
                    <select
                      value={formData.status || "active"}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                    >
                      <option value="active">Active (Live)</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="paused">Paused</option>
                      <option value="draft">Draft</option>
                      <option value="expired">Expired</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Immediate Time Limits Quick Preview Card */}
                  <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Promotion Time Limits & Validity</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("schedule")}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Advanced Schedule Tab <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Time Limit to Claim */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                            Claim Deadline (Cutoff)
                          </label>
                          {formData.claim_deadline && (
                            <button
                              type="button"
                              onClick={() => applyClaimDeadlineOffset(null)}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="datetime-local"
                          value={formData.claim_deadline || ""}
                          onChange={(e) => {
                            handleChange("claim_deadline", e.target.value);
                            setActiveClaimDeadlinePreset(null);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {[
                            { label: "+24h", hours: 24 },
                            { label: "+3d", hours: 72 },
                            { label: "+7d", hours: 168 },
                            { label: "+14d", hours: 336 },
                          ].map((p) => {
                            const isSelected = activeClaimDeadlinePreset === p.label;
                            return (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => applyClaimDeadlineOffset(p.hours, p.label)}
                                className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-amber-500/25 text-amber-300 border-amber-400/50 font-bold ring-1 ring-amber-400/30"
                                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                                }`}
                                title={isSelected ? "Click to unselect and clear" : `Set ${p.label}`}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Validation Time After Claim */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                            Valid After Claim (Days)
                          </label>
                          {formData.claim_validity_days != null && (
                            <button
                              type="button"
                              onClick={() => handleChange("claim_validity_days", null)}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          min={1}
                          placeholder="e.g. 7"
                          value={formData.claim_validity_days || ""}
                          onChange={(e) =>
                            handleChange(
                              "claim_validity_days",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {[3, 7, 14, 30].map((days) => {
                            const isSelected = formData.claim_validity_days === days;
                            return (
                              <button
                                key={days}
                                type="button"
                                onClick={() => handleToggleClaimValidityDays(days)}
                                className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-purple-500/30 text-purple-200 border-purple-400/60 font-bold ring-1 ring-purple-400/40"
                                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                                }`}
                                title={isSelected ? "Click to unselect and clear" : `Set ${days} days`}
                              >
                                {days}d
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Expiration Date */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                            Campaign Expiry
                          </label>
                          {formData.expires_at && (
                            <button
                              type="button"
                              onClick={() => applyExpiresAtOffset(null)}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="datetime-local"
                          value={formData.expires_at || ""}
                          onChange={(e) => {
                            handleChange("expires_at", e.target.value);
                            setActiveExpiresAtPreset(null);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {[
                            { label: "+7d", days: 7 },
                            { label: "+14d", days: 14 },
                            { label: "+30d", days: 30 },
                          ].map((p) => {
                            const isSelected = activeExpiresAtPreset === p.label;
                            return (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => applyExpiresAtOffset(p.days, p.label)}
                                className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-emerald-500/25 text-emerald-300 border-emerald-400/50 font-bold ring-1 ring-emerald-400/30"
                                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                                }`}
                                title={isSelected ? "Click to unselect and clear" : `Set ${p.label}`}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-300/80 font-mono">
                      ⚡ Automatically deactivates and hides from customer storefront when the claim deadline or expiration date passes.
                    </p>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Customer Description</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Get 20% discount on all mechanical keyboards on orders above ৳1,500."
                      value={formData.description || ""}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Badge Text (Callout Tag)</label>
                    <input
                      type="text"
                      placeholder="e.g. HOT DEAL, 20% OFF, LIMITED"
                      value={formData.badge_text || ""}
                      onChange={(e) => handleChange("badge_text", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Evaluation Priority</label>
                    <input
                      type="number"
                      placeholder="Higher = evaluated earlier (e.g. 10)"
                      value={formData.priority ?? ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericFieldChange("priority", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">CTA Button Text</label>
                    <input
                      type="text"
                      placeholder="Shop Deals"
                      value={formData.cta_text || ""}
                      onChange={(e) => handleChange("cta_text", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">CTA Target URL</label>
                    <input
                      type="text"
                      placeholder="/products"
                      value={formData.cta_destination || ""}
                      onChange={(e) => handleChange("cta_destination", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.is_featured)}
                        onChange={(e) => handleChange("is_featured", e.target.checked)}
                        className="rounded border-white/20 bg-black/40 text-amber-500 focus:ring-0"
                      />
                      Feature this promotion prominently on storefront banner and deals page
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Discount Mechanics */}
            {activeTab === "mechanics" && (
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e14] space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  Type & Calculation Mechanics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Promotion Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Promotion Type</label>
                    <select
                      value={formData.promotion_type || "discount_code"}
                      onChange={(e) => handleChange("promotion_type", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-semibold"
                    >
                      <option value="discount_code">Discount Code (Customer enters coupon code)</option>
                      <option value="claimable_coupon">Claimable Coupon (Customer claims voucher to wallet)</option>
                      <option value="automatic_discount">Automatic Discount (Applies automatically in cart)</option>
                      <option value="customer_reward">Customer Reward (Direct customer privilege)</option>
                      <option value="next_order_discount">Next Order Discount (Granted upon order completion)</option>
                    </select>
                  </div>

                  {/* Discount Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Discount Formula</label>
                    <select
                      value={formData.discount_type || "percentage"}
                      onChange={(e) => handleChange("discount_type", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-semibold"
                    >
                      <option value="percentage">Percentage Discount (% OFF)</option>
                      <option value="fixed_amount">Fixed Amount Discount (৳ OFF Order)</option>
                      <option value="free_shipping">Free Shipping</option>
                      <option value="buy_x_get_y">Buy X Get Y (BXGY)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  {formData.discount_type !== "free_shipping" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        {formData.discount_type === "percentage" ? "Discount Percentage (%)" : "Fixed Discount Amount (৳)"}
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        placeholder="0"
                        value={formData.discount_value ?? ""}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleNumericFieldChange("discount_value", e.target.value, { isFloat: true })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono font-bold"
                      />
                    </div>
                  )}

                  {/* Max Discount Cap (for percentage) */}
                  {formData.discount_type === "percentage" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">
                          Maximum Discount Cap (৳) <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        {formData.max_discount_amount != null && (
                          <button
                            type="button"
                            onClick={() => handleChange("max_discount_amount", null)}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Leave blank for uncapped"
                        value={formData.max_discount_amount ?? ""}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleNumericFieldChange("max_discount_amount", e.target.value, { isFloat: true, defaultNull: true })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                      />
                    </div>
                  )}

                  {/* BXGY Specific Options */}
                  {formData.discount_type === "buy_x_get_y" && (
                    <div className="md:col-span-2 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                      <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        Buy X Get Y (BXGY) Parameters
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">Buy Quantity (X)</label>
                          <input
                            type="number"
                            min={1}
                            placeholder="1"
                            value={formData.bxgy_buy_quantity ?? ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleNumericFieldChange("bxgy_buy_quantity", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">Get Quantity (Y)</label>
                          <input
                            type="number"
                            min={1}
                            placeholder="1"
                            value={formData.bxgy_get_quantity ?? ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleNumericFieldChange("bxgy_get_quantity", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">Reward Discount %</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            placeholder="100 for 100% Free"
                            value={formData.bxgy_reward_discount_percent ?? ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleNumericFieldChange("bxgy_reward_discount_percent", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DEDICATED TIME LIMITS & SCHEDULING (FIRST CLASS) */}
            {activeTab === "schedule" && (
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e14] space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      Time Limits, Claim Window & Automatic Deactivation
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure claim cutoffs, validation duration post-claim, and campaign expiration. Expired promotions automatically disappear from the customer storefront and deactivate in the database.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                    Authoritative Timer
                  </span>
                </div>

                {/* Card 1: Time Limit to Claim (Claim Window Deadline) */}
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      1. Time Limit to Claim (Claim Window Deadline)
                    </label>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Storefront Cutoff
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Specifies the deadline until which customers are allowed to claim this voucher into their wallet. After this date & time passes, the promotion is <strong className="text-white">hidden from storefront showcases</strong> and <strong className="text-white">automatically deactivated</strong>.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <input
                      type="datetime-local"
                      value={formData.claim_deadline || ""}
                      onChange={(e) => {
                        handleChange("claim_deadline", e.target.value);
                        setActiveClaimDeadlinePreset(null);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Quick Presets:</span>
                      {[
                        { label: "+24 Hours", hours: 24 },
                        { label: "+3 Days", hours: 72 },
                        { label: "+7 Days", hours: 168 },
                        { label: "+14 Days", hours: 336 },
                        { label: "+30 Days", hours: 720 },
                      ].map((preset) => {
                        const isSelected = activeClaimDeadlinePreset === preset.label;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => applyClaimDeadlineOffset(preset.hours, preset.label)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                              isSelected
                                ? "bg-amber-500/25 text-amber-300 border-amber-400/50 font-bold ring-1 ring-amber-400/30"
                                : "bg-[#12151f] hover:bg-white/10 text-slate-300 border-white/10"
                            }`}
                            title={isSelected ? "Click to unselect and clear" : `Set ${preset.label}`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                      {formData.claim_deadline && (
                        <button
                          type="button"
                          onClick={() => applyClaimDeadlineOffset(null)}
                          className="px-2 py-1 rounded-lg text-[11px] text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 2: Validation Time After Claim (Post-Claim Validity Window) */}
                <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      2. Validation Time After Claim (Customer Wallet Validity)
                    </label>
                    <div className="flex items-center gap-2">
                      {formData.claim_validity_days != null && (
                        <button
                          type="button"
                          onClick={() => handleChange("claim_validity_days", null)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        Post-Claim Duration
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Once a customer claims the voucher into their wallet, how many days does it remain valid before expiring? (e.g. valid for 7 days from the moment of claim).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        placeholder="e.g. 7"
                        value={formData.claim_validity_days ?? ""}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleNumericFieldChange("claim_validity_days", e.target.value, { defaultNull: true })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono font-bold pr-16"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                        Days
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Quick Presets:</span>
                      {[3, 7, 14, 30, 60].map((days) => {
                        const isSelected = formData.claim_validity_days === days;
                        return (
                          <button
                            key={days}
                            type="button"
                            onClick={() => handleToggleClaimValidityDays(days)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                              isSelected
                                ? "bg-purple-500/30 text-purple-200 border-purple-400/60 font-bold ring-1 ring-purple-400/40"
                                : "bg-[#12151f] hover:bg-white/10 text-slate-300 border-white/10"
                            }`}
                            title={isSelected ? "Click to unselect and clear" : `Set ${days} days`}
                          >
                            {days} Days
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card 3: Overall Campaign Dates & Auto-Deactivation Expiry */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      3. Overall Campaign Dates & Auto-Deactivation Cutoff
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Hard Expiry
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The overall lifecycle of this promotional campaign. Once <code className="text-amber-300">expires_at</code> passes, the entire promotion is automatically set to <code className="text-rose-400">expired</code> status in the database and blocked from all checkout calculations.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">Campaign Starts At</label>
                        {formData.starts_at && (
                          <button
                            type="button"
                            onClick={() => handleChange("starts_at", "")}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <input
                        type="datetime-local"
                        value={formData.starts_at || ""}
                        onChange={(e) => handleChange("starts_at", e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-500">Leave blank to activate immediately upon publish</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">Campaign Expires At (Hard Cutoff)</label>
                        {formData.expires_at && (
                          <button
                            type="button"
                            onClick={() => applyExpiresAtOffset(null)}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <input
                        type="datetime-local"
                        value={formData.expires_at || ""}
                        onChange={(e) => {
                          handleChange("expires_at", e.target.value);
                          setActiveExpiresAtPreset(null);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {[
                          { label: "+7 Days", days: 7 },
                          { label: "+14 Days", days: 14 },
                          { label: "+30 Days", days: 30 },
                          { label: "+90 Days", days: 90 },
                        ].map((p) => {
                          const isSelected = activeExpiresAtPreset === p.label;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => applyExpiresAtOffset(p.days, p.label)}
                              className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-500/25 text-emerald-300 border-emerald-400/50 font-bold ring-1 ring-emerald-400/30"
                                  : "bg-[#12151f] hover:bg-white/10 text-slate-300 border-white/10"
                              }`}
                              title={isSelected ? "Click to unselect and clear" : `Set ${p.label}`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Schedule Summary Banner */}
                <div className="p-3.5 rounded-xl bg-[#12151f] border border-white/10 space-y-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    Audited Timing Behavior Summary:
                  </span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside font-mono">
                    <li>
                      <strong>Start Date:</strong>{" "}
                      {formData.starts_at ? new Date(formData.starts_at).toLocaleString() : "Immediately active upon publishing"}
                    </li>
                    <li>
                      <strong>Claim Window:</strong>{" "}
                      {formData.claim_deadline ? (
                        <span className="text-amber-300">
                          Customers can claim until {new Date(formData.claim_deadline).toLocaleString()}. Disappears after deadline.
                        </span>
                      ) : (
                        <span className="text-slate-400">Open until overall campaign expiration</span>
                      )}
                    </li>
                    <li>
                      <strong>Validation After Claim:</strong>{" "}
                      <span className="text-purple-300">
                        {formData.claim_validity_days
                          ? `Customer voucher remains valid for ${formData.claim_validity_days} days post-claim in their wallet.`
                          : "Customer voucher remains valid until the campaign expires."}
                      </span>
                    </li>
                    <li>
                      <strong>Campaign Auto-Deactivation:</strong>{" "}
                      {formData.expires_at ? (
                        <span className="text-emerald-300">
                          Automatically marks status as &apos;expired&apos; on {new Date(formData.expires_at).toLocaleString()}.
                        </span>
                      ) : (
                        <span className="text-slate-400">Manual deactivation (No hard expiration date)</span>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: Rules & Limits */}
            {activeTab === "limits" && (
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e14] space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Order Minimums & Usage Safeguards
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Minimum Order Subtotal (৳)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={formData.min_order_amount ?? ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericFieldChange("min_order_amount", e.target.value, { isFloat: true })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Max Order Subtotal Limit (৳)</label>
                      {formData.max_order_amount != null && (
                        <button
                          type="button"
                          onClick={() => handleChange("max_order_amount", null)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      placeholder="Unlimited"
                      value={formData.max_order_amount ?? ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericFieldChange("max_order_amount", e.target.value, { isFloat: true, defaultNull: true })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Total Campaign Usage Limit</label>
                      {formData.total_usage_limit != null && (
                        <button
                          type="button"
                          onClick={() => handleChange("total_usage_limit", null)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      min={1}
                      placeholder="Unlimited"
                      value={formData.total_usage_limit ?? ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericFieldChange("total_usage_limit", e.target.value, { defaultNull: true })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Per-Customer Usage Limit</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="1"
                      value={formData.per_customer_usage_limit ?? ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericFieldChange("per_customer_usage_limit", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                  </div>

                  {/* Stacking Rules */}
                  <div className="md:col-span-2 pt-3 border-t border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Combination & Stacking Rules
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.is_stackable)}
                          onChange={(e) => handleChange("is_stackable", e.target.checked)}
                          className="rounded border-white/20 bg-black/40 text-amber-500 focus:ring-0"
                        />
                        Allow this promotion to be stacked with other eligible discounts
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.can_combine_with_free_shipping)}
                          onChange={(e) => handleChange("can_combine_with_free_shipping", e.target.checked)}
                          className="rounded border-white/20 bg-black/40 text-amber-500 focus:ring-0"
                        />
                        Can combine with Free Shipping promotions
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Scoping */}
            {activeTab === "scoping" && (
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e14] space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Product Scoping & Exclusions
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Applies To Scope</label>
                    <select
                      value={formData.applies_to || "entire_order"}
                      onChange={(e) => handleChange("applies_to", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                    >
                      <option value="entire_order">Entire Order (All eligible catalog)</option>
                      <option value="specific_categories">Specific Categories</option>
                      <option value="specific_products">Specific Products</option>
                      <option value="specific_brands">Specific Brands</option>
                    </select>
                  </div>

                  {formData.applies_to === "specific_categories" && (
                    <div className="p-4 rounded-xl bg-[#12151f] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-amber-400">
                          Target Categories ({formData.target_category_ids?.length || 0} selected)
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleChange("target_category_ids", categories.map((c) => c.id))}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                          >
                            Select All
                          </button>
                          {(formData.target_category_ids?.length || 0) > 0 && (
                            <button
                              type="button"
                              onClick={() => handleChange("target_category_ids", [])}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                        {categories.map((cat) => {
                          const isSelected = formData.target_category_ids?.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                const current = formData.target_category_ids || [];
                                handleChange(
                                  "target_category_ids",
                                  isSelected ? current.filter((id) => id !== cat.id) : [...current, cat.id]
                                );
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left ${
                                isSelected
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                                  : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                              }`}
                            >
                              <span className="truncate">{cat.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formData.applies_to === "specific_products" && (
                    <div className="p-4 rounded-xl bg-[#12151f] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-amber-400">
                          Target Products ({formData.target_product_ids?.length || 0} selected)
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleChange("target_product_ids", products.map((p) => p.id))}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                          >
                            Select All
                          </button>
                          {(formData.target_product_ids?.length || 0) > 0 && (
                            <button
                              type="button"
                              onClick={() => handleChange("target_product_ids", [])}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar">
                        {products.map((prod) => {
                          const isSelected = formData.target_product_ids?.includes(prod.id);
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => {
                                const current = formData.target_product_ids || [];
                                handleChange(
                                  "target_product_ids",
                                  isSelected ? current.filter((id) => id !== prod.id) : [...current, prod.id]
                                );
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left ${
                                isSelected
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                                  : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                              }`}
                            >
                              <span className="truncate">{prod.name} (৳{prod.price})</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formData.applies_to === "specific_brands" && (
                    <div className="p-4 rounded-xl bg-[#12151f] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-amber-400">
                          Target Brands ({formData.target_brand_ids?.length || 0} selected)
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleChange("target_brand_ids", brands.map((b) => b.id))}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                          >
                            Select All
                          </button>
                          {(formData.target_brand_ids?.length || 0) > 0 && (
                            <button
                              type="button"
                              onClick={() => handleChange("target_brand_ids", [])}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                        {brands.map((brand) => {
                          const isSelected = formData.target_brand_ids?.includes(brand.id);
                          return (
                            <button
                              key={brand.id}
                              type="button"
                              onClick={() => {
                                const current = formData.target_brand_ids || [];
                                handleChange(
                                  "target_brand_ids",
                                  isSelected ? current.filter((id) => id !== brand.id) : [...current, brand.id]
                                );
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left ${
                                isSelected
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                                  : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                              }`}
                            >
                              <span className="truncate">{brand.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: Codes */}
            {activeTab === "codes" && (
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e14] space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    Promotion Discount Codes
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Code
                  </button>
                </div>

                {/* Codes List */}
                <div className="space-y-3">
                  {(formData.codes || []).map((codeItem, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="e.g. SUMMER20"
                        value={codeItem.code}
                        onChange={(e) => handleCodeChange(index, "code", e.target.value.toUpperCase())}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white font-mono uppercase font-bold focus:border-amber-400 outline-none"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="Limit (Optional)"
                        value={codeItem.usage_limit || ""}
                        onChange={(e) => handleCodeChange(index, "usage_limit", e.target.value ? Number(e.target.value) : null)}
                        className="w-32 px-3 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white font-mono focus:border-amber-400 outline-none"
                      />
                      {(formData.codes || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCode(index)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Batch Code Generator Box */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Batch Code Generator
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Prefix</label>
                      <input
                        type="text"
                        value={batchPrefix}
                        onChange={(e) => setBatchPrefix(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={batchCount}
                        onChange={(e) => setBatchCount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Usage Limit</label>
                      <input
                        type="number"
                        min={1}
                        value={batchUsageLimit ?? 1}
                        onChange={(e) => setBatchUsageLimit(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#12151f] border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateBatchCodes}
                      className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-colors cursor-pointer"
                    >
                      Generate Codes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: Customer Audience & VIP */}
            {activeTab === "claim" && (
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e14] space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Audience Eligibility & VIP Customer Targeting
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Customer Audience Eligibility</label>
                    <select
                      value={formData.customer_eligibility || "all"}
                      onChange={(e) => handleChange("customer_eligibility", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                    >
                      <option value="all">All Registered Customers & Guests</option>
                      <option value="first_order_only">First Order / New Customers Only</option>
                      <option value="specific_customers">Specific Target Customers</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">
                        Total Campaign Claim Limit
                      </label>
                      {formData.total_claim_limit != null && (
                        <button
                          type="button"
                          onClick={() => handleChange("total_claim_limit", null)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      min={1}
                      placeholder="Unlimited"
                      value={formData.total_claim_limit ?? ""}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericFieldChange("total_claim_limit", e.target.value, { defaultNull: true })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12151f] border border-white/10 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      Maximum total times this voucher can be claimed across all customers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Live Preview Sidebar (Col 1) */}
        <div className="lg:col-span-1">
          <PromotionPreview form={formData} />
        </div>
      </div>
    </div>
  );
};
