"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Store, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Loader2,
  Check
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { useThemeStore, DEFAULT_THEME_SETTINGS } from "@/store/useThemeStore";
import { SettingsNavTabs } from "@/components/admin/settings/SettingsNavTabs";
import { toast } from "sonner";

export default function AdminBrandingPage() {
  const { setTheme: updateClientTheme } = useThemeStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [brandName, setBrandName] = useState(DEFAULT_THEME_SETTINGS.store_brand_name);
  const [brandTagline, setBrandTagline] = useState(DEFAULT_THEME_SETTINGS.store_brand_tagline);
  const [brandLogo, setBrandLogo] = useState(DEFAULT_THEME_SETTINGS.store_brand_logo || "");
  const [logoInputUrl, setLogoInputUrl] = useState("");

  // Theme Colors for fallback badge preview
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_THEME_SETTINGS.theme_primary_color);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_THEME_SETTINGS.theme_secondary_color);

  const [initialSettings, setInitialSettings] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadBrandingSettings() {
      try {
        const res = await adminApi.getThemeSettings();
        const s = res.settings;
        setInitialSettings(s);

        if (s.store_brand_name) setBrandName(s.store_brand_name);
        if (s.store_brand_tagline) setBrandTagline(s.store_brand_tagline);
        if (s.store_brand_logo) {
          setBrandLogo(s.store_brand_logo);
          setLogoInputUrl(s.store_brand_logo);
        }
        if (s.theme_primary_color) setPrimaryColor(s.theme_primary_color);
        if (s.theme_secondary_color) setSecondaryColor(s.theme_secondary_color);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBrandingSettings();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBrandLogo(dataUrl);
      setLogoInputUrl(dataUrl);
      toast.success("Logo uploaded! Click 'Save Branding' to publish.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBrandLogo("");
    setLogoInputUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Logo removed. Storefront will use default typography monogram.");
  };

  const isDirty = useMemo(() => {
    if (!initialSettings) return false;
    const norm = (v: any) => (v === undefined || v === null ? "" : String(v).trim());
    return (
      norm(brandName) !== norm(initialSettings.store_brand_name || DEFAULT_THEME_SETTINGS.store_brand_name) ||
      norm(brandTagline) !== norm(initialSettings.store_brand_tagline || DEFAULT_THEME_SETTINGS.store_brand_tagline) ||
      norm(brandLogo) !== norm(initialSettings.store_brand_logo || "")
    );
  }, [initialSettings, brandName, brandTagline, brandLogo]);

  const handleReset = () => {
    if (!initialSettings) return;
    setBrandName(initialSettings.store_brand_name || DEFAULT_THEME_SETTINGS.store_brand_name);
    setBrandTagline(initialSettings.store_brand_tagline || DEFAULT_THEME_SETTINGS.store_brand_tagline);
    setBrandLogo(initialSettings.store_brand_logo || "");
    setLogoInputUrl(initialSettings.store_brand_logo || "");
    toast.info("Branding settings reverted.");
  };

  const handleSaveBranding = async () => {
    if (!isDirty) {
      toast.info("No changes to publish.");
      return;
    }
    setSaving(true);
    const payload = {
      ...initialSettings,
      store_brand_name: brandName,
      store_brand_tagline: brandTagline,
      store_brand_logo: brandLogo,
    };

    try {
      const res = await adminApi.updateThemeSettings(payload);
      setInitialSettings(res.settings);
      updateClientTheme(payload);
      toast.success("Store branding settings updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update branding.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading Brand Settings...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      
      {/* Settings Navigation Tabs */}
      <SettingsNavTabs />

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Branding & Logo</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage official store name, brand taglines, logo upload and monograms</p>
        </div>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveBranding}
            disabled={saving || !isDirty}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ${
              isDirty && !saving
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20 ring-1 ring-amber-400/50"
                : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed opacity-40"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Branding"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (100% Full Width) */}
      <div className="space-y-6 w-full">
        
        {/* 1. Brand Identity Details */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
            <Store className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Store Name & Tagline</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Brand Title</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Brand Subtitle / Tagline</label>
              <input
                type="text"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* 2. Official Logo & Monogram Manager */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Storefront Logo & Monogram</h3>
          </div>

          <div className="space-y-4">
            {/* Logo Preview & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              
              {/* Active Logo Visual Box */}
              <div className="w-24 h-16 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {brandLogo ? (
                  <img src={brandLogo} alt={brandName} className="max-h-12 w-auto object-contain" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    {brandName?.charAt(0) || "Æ"}
                  </div>
                )}
              </div>

              <div className="space-y-1 flex-1">
                <span className="font-bold text-xs text-white block">
                  {brandLogo ? "Custom Store Logo Active" : "Default Typography Monogram Active"}
                </span>
                <p className="text-[11px] text-slate-400">
                  Recommended dimensions: 240×60px. Supports transparent PNG, SVG, WEBP, and JPG.
                </p>
              </div>

              {brandLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Logo</span>
                </button>
              )}
            </div>

            {/* Upload or URL input */}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo File</span>
                </button>

                <span className="text-[11px] text-slate-500 font-bold shrink-0">or paste URL:</span>

                <input
                  type="text"
                  value={logoInputUrl}
                  onChange={(e) => {
                    setLogoInputUrl(e.target.value);
                    setBrandLogo(e.target.value);
                  }}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
