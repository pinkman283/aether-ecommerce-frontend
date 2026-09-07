"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  LayoutTemplate, 
  Save, 
  Sparkles, 
  Radio, 
  Split, 
  Upload, 
  Loader2,
  Trash2
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { useThemeStore, DEFAULT_THEME_SETTINGS } from "@/store/useThemeStore";
import { SettingsNavTabs } from "@/components/admin/settings/SettingsNavTabs";
import { toast } from "sonner";

export default function AdminStorefrontPage() {
  const { setTheme: updateClientTheme } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Announcement Bar State
  const [announcementEnabled, setAnnouncementEnabled] = useState(DEFAULT_THEME_SETTINGS.announcement_enabled);
  const [announcementText, setAnnouncementText] = useState(DEFAULT_THEME_SETTINGS.announcement_text);
  const [announcementBadge, setAnnouncementBadge] = useState(DEFAULT_THEME_SETTINGS.announcement_badge);

  // Hero Section State
  const [heroHeadline1, setHeroHeadline1] = useState(DEFAULT_THEME_SETTINGS.hero_headline_line1);
  const [heroHeadline2Gradient, setHeroHeadline2Gradient] = useState(DEFAULT_THEME_SETTINGS.hero_headline_line2_gradient);
  const [heroHeadline3, setHeroHeadline3] = useState(DEFAULT_THEME_SETTINGS.hero_headline_line3);
  const [heroSubheading, setHeroSubheading] = useState(DEFAULT_THEME_SETTINGS.hero_subheading);
  const [heroBadgeText, setHeroBadgeText] = useState(DEFAULT_THEME_SETTINGS.hero_badge_text);

  // Split-Reveal Splash Intro Animation State
  const [splitRevealEnabled, setSplitRevealEnabled] = useState(DEFAULT_THEME_SETTINGS.split_reveal_enabled);
  const [splitRevealImage, setSplitRevealImage] = useState(DEFAULT_THEME_SETTINGS.split_reveal_image);
  const [splitRevealLogo, setSplitRevealLogo] = useState("");
  const [splitRevealTitle, setSplitRevealTitle] = useState(DEFAULT_THEME_SETTINGS.split_reveal_title);
  const [splitRevealSubtitle, setSplitRevealSubtitle] = useState(DEFAULT_THEME_SETTINGS.split_reveal_subtitle);
  const [splitRevealDuration, setSplitRevealDuration] = useState(DEFAULT_THEME_SETTINGS.split_reveal_duration);
  const [splitRevealMode, setSplitRevealMode] = useState(DEFAULT_THEME_SETTINGS.split_reveal_mode);
  const [splitRevealDim, setSplitRevealDim] = useState(DEFAULT_THEME_SETTINGS.split_reveal_dim);
  const [splitRevealDirection, setSplitRevealDirection] = useState(DEFAULT_THEME_SETTINGS.split_reveal_direction);

  const [initialSettings, setInitialSettings] = useState<any>(null);
  const splitFileInputRef = useRef<HTMLInputElement>(null);
  const splitLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadStorefrontSettings() {
      try {
        const res = await adminApi.getThemeSettings();
        const s = res.settings;
        setInitialSettings(s);

        if (s.announcement_enabled !== undefined) setAnnouncementEnabled(Boolean(s.announcement_enabled));
        if (s.announcement_text) setAnnouncementText(s.announcement_text);
        if (s.announcement_badge) setAnnouncementBadge(s.announcement_badge);

        if (s.hero_headline_line1) setHeroHeadline1(s.hero_headline_line1);
        if (s.hero_headline_line2_gradient) setHeroHeadline2Gradient(s.hero_headline_line2_gradient);
        if (s.hero_headline_line3) setHeroHeadline3(s.hero_headline_line3);
        if (s.hero_subheading) setHeroSubheading(s.hero_subheading);
        if (s.hero_badge_text) setHeroBadgeText(s.hero_badge_text);

        if (s.split_reveal_enabled !== undefined) setSplitRevealEnabled(Boolean(s.split_reveal_enabled));
        if (s.split_reveal_image) setSplitRevealImage(s.split_reveal_image);
        if (s.split_reveal_logo) setSplitRevealLogo(s.split_reveal_logo);
        if (s.split_reveal_title !== undefined) {
          const resolvedTitle = (s.split_reveal_title && s.split_reveal_title !== "AETHER")
            ? s.split_reveal_title
            : (s.store_brand_name || s.split_reveal_title || DEFAULT_THEME_SETTINGS.split_reveal_title);
          setSplitRevealTitle(resolvedTitle);
        }
        if (s.split_reveal_subtitle) setSplitRevealSubtitle(s.split_reveal_subtitle);
        if (s.split_reveal_duration) setSplitRevealDuration(Number(s.split_reveal_duration));
        if (s.split_reveal_mode) setSplitRevealMode(s.split_reveal_mode);
        if (s.split_reveal_dim) setSplitRevealDim(Number(s.split_reveal_dim));
        if (s.split_reveal_direction) setSplitRevealDirection(s.split_reveal_direction);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStorefrontSettings();
  }, []);

  const handleSplitFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Wallpaper image file must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSplitRevealImage(dataUrl);
      if (splitFileInputRef.current) splitFileInputRef.current.value = "";
      toast.success("New split reveal wallpaper uploaded! Previous image replaced.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSplitImage = () => {
    setSplitRevealImage("");
    if (splitFileInputRef.current) splitFileInputRef.current.value = "";
    toast.info("Split reveal wallpaper removed.");
  };

  const handleSplitLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSplitRevealLogo(dataUrl);
      if (splitLogoInputRef.current) splitLogoInputRef.current.value = "";
      toast.success("New split reveal logo uploaded! Previous logo replaced.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSplitLogo = () => {
    setSplitRevealLogo("");
    if (splitLogoInputRef.current) splitLogoInputRef.current.value = "";
    toast.info("Split reveal logo removed.");
  };

  const isDirty = useMemo(() => {
    if (!initialSettings) return false;
    const norm = (v: any) => (v === undefined || v === null ? "" : String(v).trim());
    return (
      Boolean(announcementEnabled) !== Boolean(initialSettings.announcement_enabled) ||
      norm(announcementText) !== norm(initialSettings.announcement_text || DEFAULT_THEME_SETTINGS.announcement_text) ||
      norm(announcementBadge) !== norm(initialSettings.announcement_badge || DEFAULT_THEME_SETTINGS.announcement_badge) ||
      norm(heroHeadline1) !== norm(initialSettings.hero_headline_line1 || DEFAULT_THEME_SETTINGS.hero_headline_line1) ||
      norm(heroHeadline2Gradient) !== norm(initialSettings.hero_headline_line2_gradient || DEFAULT_THEME_SETTINGS.hero_headline_line2_gradient) ||
      norm(heroHeadline3) !== norm(initialSettings.hero_headline_line3 || DEFAULT_THEME_SETTINGS.hero_headline_line3) ||
      norm(heroSubheading) !== norm(initialSettings.hero_subheading || DEFAULT_THEME_SETTINGS.hero_subheading) ||
      norm(heroBadgeText) !== norm(initialSettings.hero_badge_text || DEFAULT_THEME_SETTINGS.hero_badge_text) ||
      Boolean(splitRevealEnabled) !== Boolean(initialSettings.split_reveal_enabled) ||
      norm(splitRevealImage) !== norm(initialSettings.split_reveal_image || DEFAULT_THEME_SETTINGS.split_reveal_image) ||
      norm(splitRevealLogo) !== norm(initialSettings.split_reveal_logo || "") ||
      norm(splitRevealTitle) !== norm(initialSettings.split_reveal_title || DEFAULT_THEME_SETTINGS.split_reveal_title) ||
      norm(splitRevealSubtitle) !== norm(initialSettings.split_reveal_subtitle || DEFAULT_THEME_SETTINGS.split_reveal_subtitle) ||
      Number(splitRevealDuration) !== Number(initialSettings.split_reveal_duration || DEFAULT_THEME_SETTINGS.split_reveal_duration) ||
      norm(splitRevealMode) !== norm(initialSettings.split_reveal_mode || DEFAULT_THEME_SETTINGS.split_reveal_mode) ||
      Number(splitRevealDim) !== Number(initialSettings.split_reveal_dim || DEFAULT_THEME_SETTINGS.split_reveal_dim) ||
      norm(splitRevealDirection) !== norm(initialSettings.split_reveal_direction || DEFAULT_THEME_SETTINGS.split_reveal_direction)
    );
  }, [
    initialSettings,
    announcementEnabled,
    announcementText,
    announcementBadge,
    heroHeadline1,
    heroHeadline2Gradient,
    heroHeadline3,
    heroSubheading,
    heroBadgeText,
    splitRevealEnabled,
    splitRevealImage,
    splitRevealLogo,
    splitRevealTitle,
    splitRevealSubtitle,
    splitRevealDuration,
    splitRevealMode,
    splitRevealDim,
    splitRevealDirection,
  ]);

  const handleReset = () => {
    if (!initialSettings) return;
    setAnnouncementEnabled(initialSettings.announcement_enabled ?? DEFAULT_THEME_SETTINGS.announcement_enabled);
    setAnnouncementText(initialSettings.announcement_text || DEFAULT_THEME_SETTINGS.announcement_text);
    setAnnouncementBadge(initialSettings.announcement_badge || DEFAULT_THEME_SETTINGS.announcement_badge);
    setHeroHeadline1(initialSettings.hero_headline_line1 || DEFAULT_THEME_SETTINGS.hero_headline_line1);
    setHeroHeadline2Gradient(initialSettings.hero_headline_line2_gradient || DEFAULT_THEME_SETTINGS.hero_headline_line2_gradient);
    setHeroHeadline3(initialSettings.hero_headline_line3 || DEFAULT_THEME_SETTINGS.hero_headline_line3);
    setHeroSubheading(initialSettings.hero_subheading || DEFAULT_THEME_SETTINGS.hero_subheading);
    setHeroBadgeText(initialSettings.hero_badge_text || DEFAULT_THEME_SETTINGS.hero_badge_text);
    setSplitRevealEnabled(initialSettings.split_reveal_enabled ?? DEFAULT_THEME_SETTINGS.split_reveal_enabled);
    setSplitRevealImage(initialSettings.split_reveal_image || DEFAULT_THEME_SETTINGS.split_reveal_image);
    setSplitRevealLogo(initialSettings.split_reveal_logo || "");
    setSplitRevealTitle(initialSettings.split_reveal_title || DEFAULT_THEME_SETTINGS.split_reveal_title);
    setSplitRevealSubtitle(initialSettings.split_reveal_subtitle || DEFAULT_THEME_SETTINGS.split_reveal_subtitle);
    setSplitRevealDuration(initialSettings.split_reveal_duration || DEFAULT_THEME_SETTINGS.split_reveal_duration);
    setSplitRevealMode(initialSettings.split_reveal_mode || DEFAULT_THEME_SETTINGS.split_reveal_mode);
    setSplitRevealDim(initialSettings.split_reveal_dim || DEFAULT_THEME_SETTINGS.split_reveal_dim);
    setSplitRevealDirection(initialSettings.split_reveal_direction || DEFAULT_THEME_SETTINGS.split_reveal_direction);
    toast.info("Storefront settings reverted.");
  };

  const handleSaveStorefront = async () => {
    if (!isDirty) {
      toast.info("No changes to publish.");
      return;
    }
    setSaving(true);
    const payload = {
      ...initialSettings,
      announcement_enabled: announcementEnabled,
      announcement_text: announcementText,
      announcement_badge: announcementBadge,
      hero_headline_line1: heroHeadline1,
      hero_headline_line2_gradient: heroHeadline2Gradient,
      hero_headline_line3: heroHeadline3,
      hero_subheading: heroSubheading,
      hero_badge_text: heroBadgeText,
      split_reveal_enabled: splitRevealEnabled,
      split_reveal_image: splitRevealImage,
      split_reveal_logo: splitRevealLogo,
      split_reveal_title: splitRevealTitle,
      split_reveal_subtitle: splitRevealSubtitle,
      split_reveal_duration: splitRevealDuration,
      split_reveal_mode: splitRevealMode,
      split_reveal_dim: splitRevealDim,
      split_reveal_direction: splitRevealDirection,
    };

    try {
      const res = await adminApi.updateThemeSettings(payload);
      setInitialSettings(res.settings);
      updateClientTheme(payload);
      toast.success("Storefront & homepage content saved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update storefront settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading Storefront Settings...
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
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Storefront & Homepage Content</h1>
          <p className="text-xs text-slate-400 mt-0.5">Customize top announcement banner, hero section copy, and split-reveal intro</p>
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
            onClick={handleSaveStorefront}
            disabled={saving || !isDirty}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ${
              isDirty && !saving
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20 ring-1 ring-amber-400/50"
                : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed opacity-40"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Storefront"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (100% Full Width) */}
      <div className="space-y-6 w-full">
        
        {/* 1. Top Announcement Bar */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Top Announcement Bar</h3>
            </div>

            {/* Enable Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {announcementEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Badge Tag</label>
                <input
                  type="text"
                  value={announcementBadge}
                  onChange={(e) => setAnnouncementBadge(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Announcement Content</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Hero Section Typography & Copy */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Hero Section Headline & Copy</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Line 1 (Lead)</label>
                <input
                  type="text"
                  value={heroHeadline1}
                  onChange={(e) => setHeroHeadline1(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-cyan-300 block">Line 2 (Gradient Highlight)</label>
                <input
                  type="text"
                  value={heroHeadline2Gradient}
                  onChange={(e) => setHeroHeadline2Gradient(e.target.value)}
                  className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Line 3 (Closing)</label>
                <input
                  type="text"
                  value={heroHeadline3}
                  onChange={(e) => setHeroHeadline3(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Hero Badge Pill</label>
              <input
                type="text"
                value={heroBadgeText}
                onChange={(e) => setHeroBadgeText(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Hero Subheading Description</label>
              <textarea
                rows={2}
                value={heroSubheading}
                onChange={(e) => setHeroSubheading(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* 3. Split-Reveal Splash Intro Animation */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Split className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Split-Reveal Splash Intro Animation</h3>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={splitRevealEnabled}
                onChange={(e) => setSplitRevealEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {splitRevealEnabled && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Intro Title</label>
                  <input
                    type="text"
                    value={splitRevealTitle}
                    onChange={(e) => setSplitRevealTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Intro Subtitle</label>
                  <input
                    type="text"
                    value={splitRevealSubtitle}
                    onChange={(e) => setSplitRevealSubtitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Wallpaper Upload & Manager */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 block">Splash Wallpaper Image</label>
                <input
                  type="file"
                  ref={splitFileInputRef}
                  onChange={handleSplitFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {splitRevealImage && (
                    <div className="w-20 h-12 rounded-lg border border-white/15 overflow-hidden bg-black/50 shrink-0 relative group">
                      <img
                        src={splitRevealImage}
                        alt="Split Reveal Wallpaper Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => splitFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                    {splitRevealImage && (
                      <button
                        type="button"
                        onClick={handleRemoveSplitImage}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="Delete current wallpaper image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                    <input
                      type="text"
                      value={splitRevealImage}
                      onChange={(e) => setSplitRevealImage(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Split Screen Brand Logo Manager */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 block">Split-Reveal Custom Logo (Optional)</label>
                <input
                  type="file"
                  ref={splitLogoInputRef}
                  onChange={handleSplitLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {splitRevealLogo && (
                    <div className="w-12 h-12 rounded-lg border border-white/15 overflow-hidden bg-black/50 shrink-0 p-1 flex items-center justify-center">
                      <img
                        src={splitRevealLogo}
                        alt="Split Reveal Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => splitLogoInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                    </button>
                    {splitRevealLogo && (
                      <button
                        type="button"
                        onClick={handleRemoveSplitLogo}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="Delete current split screen logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Logo</span>
                      </button>
                    )}
                    <input
                      type="text"
                      value={splitRevealLogo}
                      onChange={(e) => setSplitRevealLogo(e.target.value)}
                      placeholder="Leave empty to use main store brand logo or monogram"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Animation Config: Duration, Mode, Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Opening Duration ({splitRevealDuration}s)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={splitRevealDuration}
                    onChange={(e) => setSplitRevealDuration(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Trigger Frequency</label>
                  <select
                    value={splitRevealMode}
                    onChange={(e) => setSplitRevealMode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="every_time" className="bg-[#0e121e]">Every Page Visit</option>
                    <option value="once_per_session" className="bg-[#0e121e]">Once Per Session</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Split Direction</label>
                  <select
                    value={splitRevealDirection}
                    onChange={(e) => setSplitRevealDirection(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="vertical" className="bg-[#0e121e]">Vertical Split (Top/Bottom)</option>
                    <option value="horizontal" className="bg-[#0e121e]">Horizontal Split (Left/Right)</option>
                  </select>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
