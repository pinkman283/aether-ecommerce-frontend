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
  Trash2,
  ShieldCheck,
  Flame,
  Tag,
  CheckCircle2
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

  // Navbar Category Micro Promo Badge State
  const [navbarPromoEnabled, setNavbarPromoEnabled] = useState(DEFAULT_THEME_SETTINGS.navbar_promo_enabled ?? true);
  const [navbarPromoDiscountText, setNavbarPromoDiscountText] = useState(DEFAULT_THEME_SETTINGS.navbar_promo_discount_text || "20% OFF");
  const [navbarPromoCode, setNavbarPromoCode] = useState(DEFAULT_THEME_SETTINGS.navbar_promo_code || "AETHER10");
  const [navbarPromoLink, setNavbarPromoLink] = useState(DEFAULT_THEME_SETTINGS.navbar_promo_link || "/promotions");

  // Deals & Promotional Quick Navigation State
  const [navDealsEnabled, setNavDealsEnabled] = useState(DEFAULT_THEME_SETTINGS.nav_deals_enabled ?? true);
  const [navDealsText, setNavDealsText] = useState(DEFAULT_THEME_SETTINGS.nav_deals_text || "Deals");
  const [navDealsLink, setNavDealsLink] = useState(DEFAULT_THEME_SETTINGS.nav_deals_link || "/products?discounted=true");
  const [categoryDealsCardEnabled, setCategoryDealsCardEnabled] = useState(DEFAULT_THEME_SETTINGS.category_deals_card_enabled ?? true);
  const [categoryDealsCardTitle, setCategoryDealsCardTitle] = useState(DEFAULT_THEME_SETTINGS.category_deals_card_title || "Top Deals");
  const [categoryDealsCardSubtitle, setCategoryDealsCardSubtitle] = useState(DEFAULT_THEME_SETTINGS.category_deals_card_subtitle || "Up to 20% Off");
  const [categoryDealsCardLink, setCategoryDealsCardLink] = useState(DEFAULT_THEME_SETTINGS.category_deals_card_link || "/products?discounted=true");

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

  // Flash Deals State
  const [flashDealsEnabled, setFlashDealsEnabled] = useState(DEFAULT_THEME_SETTINGS.flash_deals_enabled ?? true);
  const [flashDealsTitle, setFlashDealsTitle] = useState(DEFAULT_THEME_SETTINGS.flash_deals_title || "Limited Time Deals");
  const [flashDealsBadge, setFlashDealsBadge] = useState(DEFAULT_THEME_SETTINGS.flash_deals_badge || "Flash Deal Drop");

  // Trust Ribbon State
  const [trustRibbonEnabled, setTrustRibbonEnabled] = useState(DEFAULT_THEME_SETTINGS.trust_ribbon_enabled ?? true);
  const [trustRibbonTitle1, setTrustRibbonTitle1] = useState(DEFAULT_THEME_SETTINGS.trust_ribbon_title_1 || "Fast Express Delivery");
  const [trustRibbonDesc1, setTrustRibbonDesc1] = useState(DEFAULT_THEME_SETTINGS.trust_ribbon_desc_1 || "Dispatched within 24-48 hours");
  const [trustRibbonTitle2, setTrustRibbonTitle2] = useState(DEFAULT_THEME_SETTINGS.trust_ribbon_title_2 || "Cash on Delivery (COD)");
  const [trustRibbonDesc2, setTrustRibbonDesc2] = useState(DEFAULT_THEME_SETTINGS.trust_ribbon_desc_2 || "Pay safely upon product arrival");
  const [trustRibbonTitle3, setTrustRibbonTitle3] = useState(DEFAULT_THEME_SETTINGS.trust_ribbon_title_3 || "100% Genuine & Authentic");
  const [trustRibbonDesc3, setTrustRibbonDesc3] = useState(DEFAULT_THEME_SETTINGS.trust_ribbon_desc_3 || "Official manufacturer warranty coverage");
  const [trustRibbonTitle4, setTrustRibbonTitle4] = useState(DEFAULT_THEME_SETTINGS.trust_ribbon_title_4 || "7-Day Easy Replacement");
  const [trustRibbonDesc4, setTrustRibbonDesc4] = useState(DEFAULT_THEME_SETTINGS.trust_ribbon_desc_4 || "Hassle-free returns & replacement policy");

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

        if (s.navbar_promo_enabled !== undefined) setNavbarPromoEnabled(Boolean(s.navbar_promo_enabled));
        if (s.navbar_promo_discount_text !== undefined) setNavbarPromoDiscountText(s.navbar_promo_discount_text);
        if (s.navbar_promo_code !== undefined) setNavbarPromoCode(s.navbar_promo_code);
        if (s.navbar_promo_link !== undefined) setNavbarPromoLink(s.navbar_promo_link);

        if (s.nav_deals_enabled !== undefined) setNavDealsEnabled(Boolean(s.nav_deals_enabled));
        if (s.nav_deals_text !== undefined) setNavDealsText(s.nav_deals_text);
        if (s.nav_deals_link !== undefined) setNavDealsLink(s.nav_deals_link);
        if (s.category_deals_card_enabled !== undefined) setCategoryDealsCardEnabled(Boolean(s.category_deals_card_enabled));
        if (s.category_deals_card_title !== undefined) setCategoryDealsCardTitle(s.category_deals_card_title);
        if (s.category_deals_card_subtitle !== undefined) setCategoryDealsCardSubtitle(s.category_deals_card_subtitle);
        if (s.category_deals_card_link !== undefined) setCategoryDealsCardLink(s.category_deals_card_link);

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

        // Flash Deals
        if (s.flash_deals_enabled !== undefined) setFlashDealsEnabled(Boolean(s.flash_deals_enabled));
        if (s.flash_deals_title) setFlashDealsTitle(s.flash_deals_title);
        if (s.flash_deals_badge) setFlashDealsBadge(s.flash_deals_badge);

        // Trust Ribbon
        if (s.trust_ribbon_enabled !== undefined) setTrustRibbonEnabled(Boolean(s.trust_ribbon_enabled));
        if (s.trust_ribbon_title_1) setTrustRibbonTitle1(s.trust_ribbon_title_1);
        if (s.trust_ribbon_desc_1) setTrustRibbonDesc1(s.trust_ribbon_desc_1);
        if (s.trust_ribbon_title_2) setTrustRibbonTitle2(s.trust_ribbon_title_2);
        if (s.trust_ribbon_desc_2) setTrustRibbonDesc2(s.trust_ribbon_desc_2);
        if (s.trust_ribbon_title_3) setTrustRibbonTitle3(s.trust_ribbon_title_3);
        if (s.trust_ribbon_desc_3) setTrustRibbonDesc3(s.trust_ribbon_desc_3);
        if (s.trust_ribbon_title_4) setTrustRibbonTitle4(s.trust_ribbon_title_4);
        if (s.trust_ribbon_desc_4) setTrustRibbonDesc4(s.trust_ribbon_desc_4);
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
      toast.success("New split reveal logo uploaded!");
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
      Boolean(navbarPromoEnabled) !== Boolean(initialSettings.navbar_promo_enabled ?? true) ||
      norm(navbarPromoDiscountText) !== norm(initialSettings.navbar_promo_discount_text || DEFAULT_THEME_SETTINGS.navbar_promo_discount_text) ||
      norm(navbarPromoCode) !== norm(initialSettings.navbar_promo_code || DEFAULT_THEME_SETTINGS.navbar_promo_code) ||
      norm(navbarPromoLink) !== norm(initialSettings.navbar_promo_link || DEFAULT_THEME_SETTINGS.navbar_promo_link) ||
      Boolean(navDealsEnabled) !== Boolean(initialSettings.nav_deals_enabled ?? true) ||
      norm(navDealsText) !== norm(initialSettings.nav_deals_text || DEFAULT_THEME_SETTINGS.nav_deals_text) ||
      norm(navDealsLink) !== norm(initialSettings.nav_deals_link || DEFAULT_THEME_SETTINGS.nav_deals_link) ||
      Boolean(categoryDealsCardEnabled) !== Boolean(initialSettings.category_deals_card_enabled ?? true) ||
      norm(categoryDealsCardTitle) !== norm(initialSettings.category_deals_card_title || DEFAULT_THEME_SETTINGS.category_deals_card_title) ||
      norm(categoryDealsCardSubtitle) !== norm(initialSettings.category_deals_card_subtitle || DEFAULT_THEME_SETTINGS.category_deals_card_subtitle) ||
      norm(categoryDealsCardLink) !== norm(initialSettings.category_deals_card_link || DEFAULT_THEME_SETTINGS.category_deals_card_link) ||
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
      norm(splitRevealDirection) !== norm(initialSettings.split_reveal_direction || DEFAULT_THEME_SETTINGS.split_reveal_direction) ||
      Boolean(flashDealsEnabled) !== Boolean(initialSettings.flash_deals_enabled ?? true) ||
      norm(flashDealsTitle) !== norm(initialSettings.flash_deals_title || DEFAULT_THEME_SETTINGS.flash_deals_title) ||
      norm(flashDealsBadge) !== norm(initialSettings.flash_deals_badge || DEFAULT_THEME_SETTINGS.flash_deals_badge) ||
      Boolean(trustRibbonEnabled) !== Boolean(initialSettings.trust_ribbon_enabled ?? true) ||
      norm(trustRibbonTitle1) !== norm(initialSettings.trust_ribbon_title_1 || DEFAULT_THEME_SETTINGS.trust_ribbon_title_1) ||
      norm(trustRibbonDesc1) !== norm(initialSettings.trust_ribbon_desc_1 || DEFAULT_THEME_SETTINGS.trust_ribbon_desc_1) ||
      norm(trustRibbonTitle2) !== norm(initialSettings.trust_ribbon_title_2 || DEFAULT_THEME_SETTINGS.trust_ribbon_title_2) ||
      norm(trustRibbonDesc2) !== norm(initialSettings.trust_ribbon_desc_2 || DEFAULT_THEME_SETTINGS.trust_ribbon_desc_2) ||
      norm(trustRibbonTitle3) !== norm(initialSettings.trust_ribbon_title_3 || DEFAULT_THEME_SETTINGS.trust_ribbon_title_3) ||
      norm(trustRibbonDesc3) !== norm(initialSettings.trust_ribbon_desc_3 || DEFAULT_THEME_SETTINGS.trust_ribbon_desc_3) ||
      norm(trustRibbonTitle4) !== norm(initialSettings.trust_ribbon_title_4 || DEFAULT_THEME_SETTINGS.trust_ribbon_title_4) ||
      norm(trustRibbonDesc4) !== norm(initialSettings.trust_ribbon_desc_4 || DEFAULT_THEME_SETTINGS.trust_ribbon_desc_4)
    );
  }, [
    initialSettings,
    announcementEnabled,
    announcementText,
    announcementBadge,
    navbarPromoEnabled,
    navbarPromoDiscountText,
    navbarPromoCode,
    navbarPromoLink,
    navDealsEnabled,
    navDealsText,
    navDealsLink,
    categoryDealsCardEnabled,
    categoryDealsCardTitle,
    categoryDealsCardSubtitle,
    categoryDealsCardLink,
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
    flashDealsEnabled,
    flashDealsTitle,
    flashDealsBadge,
    trustRibbonEnabled,
    trustRibbonTitle1,
    trustRibbonDesc1,
    trustRibbonTitle2,
    trustRibbonDesc2,
    trustRibbonTitle3,
    trustRibbonDesc3,
    trustRibbonTitle4,
    trustRibbonDesc4,
  ]);

  const handleReset = () => {
    if (!initialSettings) return;
    setAnnouncementEnabled(initialSettings.announcement_enabled ?? DEFAULT_THEME_SETTINGS.announcement_enabled);
    setAnnouncementText(initialSettings.announcement_text || DEFAULT_THEME_SETTINGS.announcement_text);
    setAnnouncementBadge(initialSettings.announcement_badge || DEFAULT_THEME_SETTINGS.announcement_badge);
    setNavbarPromoEnabled(initialSettings.navbar_promo_enabled ?? DEFAULT_THEME_SETTINGS.navbar_promo_enabled ?? true);
    setNavbarPromoDiscountText(initialSettings.navbar_promo_discount_text || DEFAULT_THEME_SETTINGS.navbar_promo_discount_text || "20% OFF");
    setNavbarPromoCode(initialSettings.navbar_promo_code || DEFAULT_THEME_SETTINGS.navbar_promo_code || "AETHER10");
    setNavbarPromoLink(initialSettings.navbar_promo_link || DEFAULT_THEME_SETTINGS.navbar_promo_link || "/promotions");
    setNavDealsEnabled(initialSettings.nav_deals_enabled ?? DEFAULT_THEME_SETTINGS.nav_deals_enabled ?? true);
    setNavDealsText(initialSettings.nav_deals_text || DEFAULT_THEME_SETTINGS.nav_deals_text || "Deals");
    setNavDealsLink(initialSettings.nav_deals_link || DEFAULT_THEME_SETTINGS.nav_deals_link || "/products?discounted=true");
    setCategoryDealsCardEnabled(initialSettings.category_deals_card_enabled ?? DEFAULT_THEME_SETTINGS.category_deals_card_enabled ?? true);
    setCategoryDealsCardTitle(initialSettings.category_deals_card_title || DEFAULT_THEME_SETTINGS.category_deals_card_title || "Top Deals");
    setCategoryDealsCardSubtitle(initialSettings.category_deals_card_subtitle || DEFAULT_THEME_SETTINGS.category_deals_card_subtitle || "Up to 20% Off");
    setCategoryDealsCardLink(initialSettings.category_deals_card_link || DEFAULT_THEME_SETTINGS.category_deals_card_link || "/products?discounted=true");
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
    setFlashDealsEnabled(initialSettings.flash_deals_enabled ?? DEFAULT_THEME_SETTINGS.flash_deals_enabled ?? true);
    setFlashDealsTitle(initialSettings.flash_deals_title || DEFAULT_THEME_SETTINGS.flash_deals_title || "Limited Time Deals");
    setFlashDealsBadge(initialSettings.flash_deals_badge || DEFAULT_THEME_SETTINGS.flash_deals_badge || "Flash Deal Drop");
    setTrustRibbonEnabled(initialSettings.trust_ribbon_enabled ?? DEFAULT_THEME_SETTINGS.trust_ribbon_enabled ?? true);
    setTrustRibbonTitle1(initialSettings.trust_ribbon_title_1 || DEFAULT_THEME_SETTINGS.trust_ribbon_title_1 || "Fast Express Delivery");
    setTrustRibbonDesc1(initialSettings.trust_ribbon_desc_1 || DEFAULT_THEME_SETTINGS.trust_ribbon_desc_1 || "Dispatched within 24-48 hours");
    setTrustRibbonTitle2(initialSettings.trust_ribbon_title_2 || DEFAULT_THEME_SETTINGS.trust_ribbon_title_2 || "Cash on Delivery (COD)");
    setTrustRibbonDesc2(initialSettings.trust_ribbon_desc_2 || DEFAULT_THEME_SETTINGS.trust_ribbon_desc_2 || "Pay safely upon product arrival");
    setTrustRibbonTitle3(initialSettings.trust_ribbon_title_3 || DEFAULT_THEME_SETTINGS.trust_ribbon_title_3 || "100% Genuine & Authentic");
    setTrustRibbonDesc3(initialSettings.trust_ribbon_desc_3 || DEFAULT_THEME_SETTINGS.trust_ribbon_desc_3 || "Official manufacturer warranty coverage");
    setTrustRibbonTitle4(initialSettings.trust_ribbon_title_4 || DEFAULT_THEME_SETTINGS.trust_ribbon_title_4 || "7-Day Easy Replacement");
    setTrustRibbonDesc4(initialSettings.trust_ribbon_desc_4 || DEFAULT_THEME_SETTINGS.trust_ribbon_desc_4 || "Hassle-free returns & replacement policy");
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
      navbar_promo_enabled: navbarPromoEnabled,
      navbar_promo_discount_text: navbarPromoDiscountText,
      navbar_promo_code: navbarPromoCode,
      navbar_promo_link: navbarPromoLink,
      nav_deals_enabled: navDealsEnabled,
      nav_deals_text: navDealsText,
      nav_deals_link: navDealsLink,
      category_deals_card_enabled: categoryDealsCardEnabled,
      category_deals_card_title: categoryDealsCardTitle,
      category_deals_card_subtitle: categoryDealsCardSubtitle,
      category_deals_card_link: categoryDealsCardLink,
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
      flash_deals_enabled: flashDealsEnabled,
      flash_deals_title: flashDealsTitle,
      flash_deals_badge: flashDealsBadge,
      trust_ribbon_enabled: trustRibbonEnabled,
      trust_ribbon_title_1: trustRibbonTitle1,
      trust_ribbon_desc_1: trustRibbonDesc1,
      trust_ribbon_title_2: trustRibbonTitle2,
      trust_ribbon_desc_2: trustRibbonDesc2,
      trust_ribbon_title_3: trustRibbonTitle3,
      trust_ribbon_desc_3: trustRibbonDesc3,
      trust_ribbon_title_4: trustRibbonTitle4,
      trust_ribbon_desc_4: trustRibbonDesc4,
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

        {/* 2. Deals & Promotional Quick Navigation */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Deals & Promotional Quick Navigation</h3>
                <p className="text-[11px] text-slate-400">Configure or toggle the navbar Deals button and the Explore Categories Top Deals tile</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
            {/* Option 1: Navbar Deals Pill */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <span className="text-xs font-bold text-white block">Navbar "Deals" Button</span>
                  <span className="text-[10px] text-slate-400">Header category bar quick link button</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={navDealsEnabled}
                    onChange={(e) => setNavDealsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {navDealsEnabled ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">Button Label</label>
                      <input
                        type="text"
                        value={navDealsText}
                        onChange={(e) => setNavDealsText(e.target.value)}
                        placeholder="e.g. Deals"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">Target Link / Route</label>
                      <input
                        type="text"
                        value={navDealsLink}
                        onChange={(e) => setNavDealsLink(e.target.value)}
                        placeholder="/products?discounted=true"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Live Preview:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20">
                      <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      {navDealsText || "Deals"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">Button is currently disabled and hidden from the navbar.</p>
              )}
            </div>

            {/* Option 2: Explore Categories "Top Deals" Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <span className="text-xs font-bold text-white block">Category Carousel "Top Deals" Tile</span>
                  <span className="text-[10px] text-slate-400">First featured card in Explore Categories</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryDealsCardEnabled}
                    onChange={(e) => setCategoryDealsCardEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {categoryDealsCardEnabled ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">Tile Title</label>
                      <input
                        type="text"
                        value={categoryDealsCardTitle}
                        onChange={(e) => setCategoryDealsCardTitle(e.target.value)}
                        placeholder="e.g. Top Deals"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">Tile Subtitle / Discount</label>
                      <input
                        type="text"
                        value={categoryDealsCardSubtitle}
                        onChange={(e) => setCategoryDealsCardSubtitle(e.target.value)}
                        placeholder="e.g. Up to 20% Off"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Target Link / Route</label>
                    <input
                      type="text"
                      value={categoryDealsCardLink}
                      onChange={(e) => setCategoryDealsCardLink(e.target.value)}
                      placeholder="/products?discounted=true"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Live Preview:</span>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <div className="w-6 h-6 rounded-md bg-rose-500/20 flex items-center justify-center text-rose-500">
                        <Flame className="w-3.5 h-3.5 fill-rose-500" />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-rose-500 leading-none">{categoryDealsCardTitle || "Top Deals"}</span>
                        <span className="text-[9px] text-rose-400/80">{categoryDealsCardSubtitle || "Up to 20% Off"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">Tile is currently disabled and hidden from Explore Categories.</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Navbar Category Micro Promo Badge */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Navbar Category Micro Promo Badge</h3>
                <p className="text-[11px] text-slate-400">Coupon callout and discount badge on the sticky category navigation bar</p>
              </div>
            </div>

            {/* Enable Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={navbarPromoEnabled}
                onChange={(e) => setNavbarPromoEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {navbarPromoEnabled && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Discount Callout Text</label>
                  <input
                    type="text"
                    value={navbarPromoDiscountText}
                    onChange={(e) => setNavbarPromoDiscountText(e.target.value)}
                    placeholder="e.g. 20% OFF or LIMITED DEAL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Coupon Code</label>
                  <input
                    type="text"
                    value={navbarPromoCode}
                    onChange={(e) => setNavbarPromoCode(e.target.value)}
                    placeholder="e.g. AETHER10"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Target Route / Link</label>
                  <input
                    type="text"
                    value={navbarPromoLink}
                    onChange={(e) => setNavbarPromoLink(e.target.value)}
                    placeholder="e.g. /promotions"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Live Navbar Appearance:</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10">
                  {navbarPromoDiscountText && (
                    <span className="font-black text-white text-[11px]">{navbarPromoDiscountText}</span>
                  )}
                  {navbarPromoCode && (
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px] font-bold shadow-xs">
                      CODE: {navbarPromoCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Hero Section Typography & Copy */}
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

        {/* ========================================================================= */}
        {/* SECTION 3: VALUE & REASSURANCE TRUST RIBBON */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-[#0f121b] border border-white/[0.08] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Trust & Reassurance Ribbon</h3>
                <p className="text-xs text-slate-400">4 customer value cards displayed below category explore carousel</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={trustRibbonEnabled}
                onChange={(e) => setTrustRibbonEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {trustRibbonEnabled && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item 1 */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Card 1: Delivery / Courier</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Title</label>
                    <input
                      type="text"
                      value={trustRibbonTitle1}
                      onChange={(e) => setTrustRibbonTitle1(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Subtitle</label>
                    <input
                      type="text"
                      value={trustRibbonDesc1}
                      onChange={(e) => setTrustRibbonDesc1(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Card 2: Payment Security / COD</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Title</label>
                    <input
                      type="text"
                      value={trustRibbonTitle2}
                      onChange={(e) => setTrustRibbonTitle2(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Subtitle</label>
                    <input
                      type="text"
                      value={trustRibbonDesc2}
                      onChange={(e) => setTrustRibbonDesc2(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Card 3: Authenticity & Warranty</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Title</label>
                    <input
                      type="text"
                      value={trustRibbonTitle3}
                      onChange={(e) => setTrustRibbonTitle3(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Subtitle</label>
                    <input
                      type="text"
                      value={trustRibbonDesc3}
                      onChange={(e) => setTrustRibbonDesc3(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Item 4 */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Card 4: Replacement Policy</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Title</label>
                    <input
                      type="text"
                      value={trustRibbonTitle4}
                      onChange={(e) => setTrustRibbonTitle4(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Subtitle</label>
                    <input
                      type="text"
                      value={trustRibbonDesc4}
                      onChange={(e) => setTrustRibbonDesc4(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: FLASH DEALS SECTION */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-[#0f121b] border border-white/[0.08] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Flash Deals Drop Section</h3>
                <p className="text-xs text-slate-400">Homepage promotional countdown showcase section</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={flashDealsEnabled}
                onChange={(e) => setFlashDealsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500" />
            </label>
          </div>

          {flashDealsEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Section Heading</label>
                <input
                  type="text"
                  value={flashDealsTitle}
                  onChange={(e) => setFlashDealsTitle(e.target.value)}
                  placeholder="e.g. Limited Time Deals"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Badge Tagline</label>
                <input
                  type="text"
                  value={flashDealsBadge}
                  onChange={(e) => setFlashDealsBadge(e.target.value)}
                  placeholder="e.g. Flash Deal Drop"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
