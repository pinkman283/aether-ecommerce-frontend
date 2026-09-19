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
  Truck,
  CheckCircle2,
  UserCheck,
  RotateCcw,
  Play,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { useThemeStore, DEFAULT_THEME_SETTINGS } from "@/store/useThemeStore";
import { SettingsNavTabs } from "@/components/admin/settings/SettingsNavTabs";
import { ImageUploadGuidance } from "@/components/admin/ui/ImageUploadGuidance";
import { AdminSaveBar } from "@/components/admin/ui";
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

  // Footer Guarantees & Features Strip State
  const [footerFeaturesEnabled, setFooterFeaturesEnabled] = useState(DEFAULT_THEME_SETTINGS.footer_features_enabled ?? true);
  const [footerFeatureTitle1, setFooterFeatureTitle1] = useState(DEFAULT_THEME_SETTINGS.footer_feature_title_1 || "Free Express Shipping");
  const [footerFeatureDesc1, setFooterFeatureDesc1] = useState(DEFAULT_THEME_SETTINGS.footer_feature_desc_1 || "Complimentary delivery inside & outside Dhaka.");
  const [footerFeatureLink1, setFooterFeatureLink1] = useState(DEFAULT_THEME_SETTINGS.footer_feature_link_1 || "/shipping-policy");
  const [footerFeatureTitle2, setFooterFeatureTitle2] = useState(DEFAULT_THEME_SETTINGS.footer_feature_title_2 || "2-Year Studio Warranty");
  const [footerFeatureDesc2, setFooterFeatureDesc2] = useState(DEFAULT_THEME_SETTINGS.footer_feature_desc_2 || "Comprehensive hardware protection & zero-cost repair.");
  const [footerFeatureLink2, setFooterFeatureLink2] = useState(DEFAULT_THEME_SETTINGS.footer_feature_link_2 || "/refund-policy");
  const [footerFeatureTitle3, setFooterFeatureTitle3] = useState(DEFAULT_THEME_SETTINGS.footer_feature_title_3 || "30-Day Risk-Free Trial");
  const [footerFeatureDesc3, setFooterFeatureDesc3] = useState(DEFAULT_THEME_SETTINGS.footer_feature_desc_3 || "Hassle-free evaluation with prepaid RMA labels.");
  const [footerFeatureLink3, setFooterFeatureLink3] = useState(DEFAULT_THEME_SETTINGS.footer_feature_link_3 || "/refund-policy");
  const [footerFeatureTitle4, setFooterFeatureTitle4] = useState(DEFAULT_THEME_SETTINGS.footer_feature_title_4 || "24/7 Audio Support");
  const [footerFeatureDesc4, setFooterFeatureDesc4] = useState(DEFAULT_THEME_SETTINGS.footer_feature_desc_4 || "Direct access to sound engineers & hardware specialists.");
  const [footerFeatureLink4, setFooterFeatureLink4] = useState(DEFAULT_THEME_SETTINGS.footer_feature_link_4 || "/contact");

  // Customer Login & Sign Up Page State
  const [customerAuthBgImage, setCustomerAuthBgImage] = useState(DEFAULT_THEME_SETTINGS.customer_auth_bg_image || "");
  const [customerAuthBgColor, setCustomerAuthBgColor] = useState(DEFAULT_THEME_SETTINGS.customer_auth_bg_color || "#ffffff");
  const [customerAuthCardPosition, setCustomerAuthCardPosition] = useState(DEFAULT_THEME_SETTINGS.customer_auth_card_position || "left");

  const [initialSettings, setInitialSettings] = useState<any>(null);
  const splitFileInputRef = useRef<HTMLInputElement>(null);
  const splitLogoInputRef = useRef<HTMLInputElement>(null);
  const authBgFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadStorefrontSettings() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("aether_admin_token") : null;
        if (!token) return;

        const res = await adminApi.getThemeSettings();
        const s = res.settings || {};

        const resolvedTitle = (s.split_reveal_title && s.split_reveal_title !== "AETHER")
          ? s.split_reveal_title
          : (s.store_brand_name || s.split_reveal_title || DEFAULT_THEME_SETTINGS.split_reveal_title);

        const initialNormalized = {
          ...s,
          announcement_enabled: s.announcement_enabled !== undefined ? Boolean(s.announcement_enabled) : DEFAULT_THEME_SETTINGS.announcement_enabled,
          announcement_text: s.announcement_text || DEFAULT_THEME_SETTINGS.announcement_text,
          announcement_badge: s.announcement_badge || DEFAULT_THEME_SETTINGS.announcement_badge,
          navbar_promo_enabled: s.navbar_promo_enabled !== undefined ? Boolean(s.navbar_promo_enabled) : true,
          navbar_promo_discount_text: s.navbar_promo_discount_text || "20% OFF",
          navbar_promo_code: s.navbar_promo_code || "AETHER10",
          navbar_promo_link: s.navbar_promo_link || "/promotions",
          nav_deals_enabled: s.nav_deals_enabled !== undefined ? Boolean(s.nav_deals_enabled) : true,
          nav_deals_text: s.nav_deals_text || "Deals",
          nav_deals_link: s.nav_deals_link || "/products?discounted=true",
          category_deals_card_enabled: s.category_deals_card_enabled !== undefined ? Boolean(s.category_deals_card_enabled) : true,
          category_deals_card_title: s.category_deals_card_title || "Top Deals",
          category_deals_card_subtitle: s.category_deals_card_subtitle || "Up to 20% Off",
          category_deals_card_link: s.category_deals_card_link || "/products?discounted=true",
          hero_headline_line1: s.hero_headline_line1 || DEFAULT_THEME_SETTINGS.hero_headline_line1,
          hero_headline_line2_gradient: s.hero_headline_line2_gradient || DEFAULT_THEME_SETTINGS.hero_headline_line2_gradient,
          hero_headline_line3: s.hero_headline_line3 || DEFAULT_THEME_SETTINGS.hero_headline_line3,
          hero_subheading: s.hero_subheading || DEFAULT_THEME_SETTINGS.hero_subheading,
          hero_badge_text: s.hero_badge_text || DEFAULT_THEME_SETTINGS.hero_badge_text,
          split_reveal_enabled: s.split_reveal_enabled !== undefined ? Boolean(s.split_reveal_enabled) : DEFAULT_THEME_SETTINGS.split_reveal_enabled,
          split_reveal_image: s.split_reveal_image || DEFAULT_THEME_SETTINGS.split_reveal_image,
          split_reveal_logo: s.split_reveal_logo || "",
          split_reveal_title: resolvedTitle,
          split_reveal_subtitle: s.split_reveal_subtitle || DEFAULT_THEME_SETTINGS.split_reveal_subtitle,
          split_reveal_duration: s.split_reveal_duration !== undefined ? Number(s.split_reveal_duration) : DEFAULT_THEME_SETTINGS.split_reveal_duration,
          split_reveal_mode: s.split_reveal_mode || DEFAULT_THEME_SETTINGS.split_reveal_mode,
          split_reveal_dim: s.split_reveal_dim !== undefined ? Number(s.split_reveal_dim) : DEFAULT_THEME_SETTINGS.split_reveal_dim,
          split_reveal_direction: s.split_reveal_direction || DEFAULT_THEME_SETTINGS.split_reveal_direction,
          flash_deals_enabled: s.flash_deals_enabled !== undefined ? Boolean(s.flash_deals_enabled) : true,
          flash_deals_title: s.flash_deals_title || "Limited Time Deals",
          flash_deals_badge: s.flash_deals_badge || "Flash Deal Drop",
          trust_ribbon_enabled: s.trust_ribbon_enabled !== undefined ? Boolean(s.trust_ribbon_enabled) : true,
          trust_ribbon_title_1: s.trust_ribbon_title_1 || "Fast Express Delivery",
          trust_ribbon_desc_1: s.trust_ribbon_desc_1 || "Dispatched within 24-48 hours",
          trust_ribbon_title_2: s.trust_ribbon_title_2 || "Cash on Delivery (COD)",
          trust_ribbon_desc_2: s.trust_ribbon_desc_2 || "Pay safely upon product arrival",
          trust_ribbon_title_3: s.trust_ribbon_title_3 || "100% Genuine & Authentic",
          trust_ribbon_desc_3: s.trust_ribbon_desc_3 || "Official manufacturer warranty coverage",
          trust_ribbon_title_4: s.trust_ribbon_title_4 || "7-Day Easy Replacement",
          trust_ribbon_desc_4: s.trust_ribbon_desc_4 || "Hassle-free returns & replacement policy",
          footer_features_enabled: s.footer_features_enabled !== undefined ? Boolean(s.footer_features_enabled) : true,
          footer_feature_title_1: s.footer_feature_title_1 || "Free Express Shipping",
          footer_feature_desc_1: s.footer_feature_desc_1 || "Complimentary delivery inside & outside Dhaka.",
          footer_feature_link_1: s.footer_feature_link_1 || "/shipping-policy",
          footer_feature_title_2: s.footer_feature_title_2 || "2-Year Studio Warranty",
          footer_feature_desc_2: s.footer_feature_desc_2 || "Comprehensive hardware protection & zero-cost repair.",
          footer_feature_link_2: s.footer_feature_link_2 || "/refund-policy",
          footer_feature_title_3: s.footer_feature_title_3 || "30-Day Risk-Free Trial",
          footer_feature_desc_3: s.footer_feature_desc_3 || "Hassle-free evaluation with prepaid RMA labels.",
          footer_feature_link_3: s.footer_feature_link_3 || "/refund-policy",
          footer_feature_title_4: s.footer_feature_title_4 || "24/7 Audio Support",
          footer_feature_desc_4: s.footer_feature_desc_4 || "Direct access to sound engineers & hardware specialists.",
          footer_feature_link_4: s.footer_feature_link_4 || "/contact",
          customer_auth_bg_image: s.customer_auth_bg_image || "",
          customer_auth_bg_color: s.customer_auth_bg_color || "#ffffff",
          customer_auth_card_position: s.customer_auth_card_position || "left",
        };

        setAnnouncementEnabled(initialNormalized.announcement_enabled);
        setAnnouncementText(initialNormalized.announcement_text);
        setAnnouncementBadge(initialNormalized.announcement_badge);

        setNavbarPromoEnabled(initialNormalized.navbar_promo_enabled);
        setNavbarPromoDiscountText(initialNormalized.navbar_promo_discount_text);
        setNavbarPromoCode(initialNormalized.navbar_promo_code);
        setNavbarPromoLink(initialNormalized.navbar_promo_link);

        setNavDealsEnabled(initialNormalized.nav_deals_enabled);
        setNavDealsText(initialNormalized.nav_deals_text);
        setNavDealsLink(initialNormalized.nav_deals_link);
        setCategoryDealsCardEnabled(initialNormalized.category_deals_card_enabled);
        setCategoryDealsCardTitle(initialNormalized.category_deals_card_title);
        setCategoryDealsCardSubtitle(initialNormalized.category_deals_card_subtitle);
        setCategoryDealsCardLink(initialNormalized.category_deals_card_link);

        setHeroHeadline1(initialNormalized.hero_headline_line1);
        setHeroHeadline2Gradient(initialNormalized.hero_headline_line2_gradient);
        setHeroHeadline3(initialNormalized.hero_headline_line3);
        setHeroSubheading(initialNormalized.hero_subheading);
        setHeroBadgeText(initialNormalized.hero_badge_text);

        setSplitRevealEnabled(initialNormalized.split_reveal_enabled);
        setSplitRevealImage(initialNormalized.split_reveal_image);
        setSplitRevealLogo(initialNormalized.split_reveal_logo);
        setSplitRevealTitle(initialNormalized.split_reveal_title);
        setSplitRevealSubtitle(initialNormalized.split_reveal_subtitle);
        setSplitRevealDuration(initialNormalized.split_reveal_duration);
        setSplitRevealMode(initialNormalized.split_reveal_mode);
        setSplitRevealDim(initialNormalized.split_reveal_dim);
        setSplitRevealDirection(initialNormalized.split_reveal_direction);

        setFlashDealsEnabled(initialNormalized.flash_deals_enabled);
        setFlashDealsTitle(initialNormalized.flash_deals_title);
        setFlashDealsBadge(initialNormalized.flash_deals_badge);

        setTrustRibbonEnabled(initialNormalized.trust_ribbon_enabled);
        setTrustRibbonTitle1(initialNormalized.trust_ribbon_title_1);
        setTrustRibbonDesc1(initialNormalized.trust_ribbon_desc_1);
        setTrustRibbonTitle2(initialNormalized.trust_ribbon_title_2);
        setTrustRibbonDesc2(initialNormalized.trust_ribbon_desc_2);
        setTrustRibbonTitle3(initialNormalized.trust_ribbon_title_3);
        setTrustRibbonDesc3(initialNormalized.trust_ribbon_desc_3);
        setTrustRibbonTitle4(initialNormalized.trust_ribbon_title_4);
        setTrustRibbonDesc4(initialNormalized.trust_ribbon_desc_4);

        setFooterFeaturesEnabled(initialNormalized.footer_features_enabled);
        setFooterFeatureTitle1(initialNormalized.footer_feature_title_1);
        setFooterFeatureDesc1(initialNormalized.footer_feature_desc_1);
        setFooterFeatureLink1(initialNormalized.footer_feature_link_1);
        setFooterFeatureTitle2(initialNormalized.footer_feature_title_2);
        setFooterFeatureDesc2(initialNormalized.footer_feature_desc_2);
        setFooterFeatureLink2(initialNormalized.footer_feature_link_2);
        setFooterFeatureTitle3(initialNormalized.footer_feature_title_3);
        setFooterFeatureDesc3(initialNormalized.footer_feature_desc_3);
        setFooterFeatureLink3(initialNormalized.footer_feature_link_3);
        setFooterFeatureTitle4(initialNormalized.footer_feature_title_4);
        setFooterFeatureDesc4(initialNormalized.footer_feature_desc_4);
        setFooterFeatureLink4(initialNormalized.footer_feature_link_4);

        setCustomerAuthBgImage(initialNormalized.customer_auth_bg_image);
        setCustomerAuthBgColor(initialNormalized.customer_auth_bg_color);
        setCustomerAuthCardPosition(initialNormalized.customer_auth_card_position);

        setInitialSettings(initialNormalized);
      } catch (err: any) {
        if (err?.response?.status !== 401 && err?.response?.status !== 403) {
          console.error("Failed to load storefront settings:", err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadStorefrontSettings();
  }, []);

  const handleAuthBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Background image file must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomerAuthBgImage(dataUrl);
      if (authBgFileInputRef.current) authBgFileInputRef.current.value = "";
      toast.success("New customer login/signup background uploaded! Click 'Save Storefront' to publish.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAuthBg = () => {
    setCustomerAuthBgImage("");
    if (authBgFileInputRef.current) authBgFileInputRef.current.value = "";
    toast.info("Background image removed. The page will display your default/custom background color.");
  };

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

  const handleLivePreview = () => {
    window.dispatchEvent(
      new CustomEvent("preview-split-reveal", {
        detail: {
          split_reveal_enabled: true,
          split_reveal_image: splitRevealImage,
          split_reveal_logo: splitRevealLogo,
          split_reveal_title: splitRevealTitle,
          split_reveal_subtitle: splitRevealSubtitle,
          split_reveal_duration: splitRevealDuration,
          split_reveal_direction: splitRevealDirection,
          split_reveal_dim: splitRevealDim,
        },
      })
    );
    toast.success("Playing live split-reveal preview...");
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
      Boolean(flashDealsEnabled) !== Boolean(initialSettings.flash_deals_enabled) ||
      norm(flashDealsTitle) !== norm(initialSettings.flash_deals_title) ||
      norm(flashDealsBadge) !== norm(initialSettings.flash_deals_badge) ||
      Boolean(trustRibbonEnabled) !== Boolean(initialSettings.trust_ribbon_enabled) ||
      norm(trustRibbonTitle1) !== norm(initialSettings.trust_ribbon_title_1) ||
      norm(trustRibbonDesc1) !== norm(initialSettings.trust_ribbon_desc_1) ||
      norm(trustRibbonTitle2) !== norm(initialSettings.trust_ribbon_title_2) ||
      norm(trustRibbonDesc2) !== norm(initialSettings.trust_ribbon_desc_2) ||
      norm(trustRibbonTitle3) !== norm(initialSettings.trust_ribbon_title_3) ||
      norm(trustRibbonDesc3) !== norm(initialSettings.trust_ribbon_desc_3) ||
      norm(trustRibbonTitle4) !== norm(initialSettings.trust_ribbon_title_4) ||
      norm(trustRibbonDesc4) !== norm(initialSettings.trust_ribbon_desc_4) ||
      Boolean(footerFeaturesEnabled) !== Boolean(initialSettings.footer_features_enabled ?? true) ||
      norm(footerFeatureTitle1) !== norm(initialSettings.footer_feature_title_1 || DEFAULT_THEME_SETTINGS.footer_feature_title_1) ||
      norm(footerFeatureDesc1) !== norm(initialSettings.footer_feature_desc_1 || DEFAULT_THEME_SETTINGS.footer_feature_desc_1) ||
      norm(footerFeatureLink1) !== norm(initialSettings.footer_feature_link_1 || DEFAULT_THEME_SETTINGS.footer_feature_link_1) ||
      norm(footerFeatureTitle2) !== norm(initialSettings.footer_feature_title_2 || DEFAULT_THEME_SETTINGS.footer_feature_title_2) ||
      norm(footerFeatureDesc2) !== norm(initialSettings.footer_feature_desc_2 || DEFAULT_THEME_SETTINGS.footer_feature_desc_2) ||
      norm(footerFeatureLink2) !== norm(initialSettings.footer_feature_link_2 || DEFAULT_THEME_SETTINGS.footer_feature_link_2) ||
      norm(footerFeatureTitle3) !== norm(initialSettings.footer_feature_title_3 || DEFAULT_THEME_SETTINGS.footer_feature_title_3) ||
      norm(footerFeatureDesc3) !== norm(initialSettings.footer_feature_desc_3 || DEFAULT_THEME_SETTINGS.footer_feature_desc_3) ||
      norm(footerFeatureLink3) !== norm(initialSettings.footer_feature_link_3 || DEFAULT_THEME_SETTINGS.footer_feature_link_3) ||
      norm(footerFeatureTitle4) !== norm(initialSettings.footer_feature_title_4 || DEFAULT_THEME_SETTINGS.footer_feature_title_4) ||
      norm(footerFeatureDesc4) !== norm(initialSettings.footer_feature_desc_4 || DEFAULT_THEME_SETTINGS.footer_feature_desc_4) ||
      norm(footerFeatureLink4) !== norm(initialSettings.footer_feature_link_4 || DEFAULT_THEME_SETTINGS.footer_feature_link_4) ||
      norm(customerAuthBgImage) !== norm(initialSettings.customer_auth_bg_image || "") ||
      norm(customerAuthBgColor) !== norm(initialSettings.customer_auth_bg_color || "#ffffff") ||
      norm(customerAuthCardPosition) !== norm(initialSettings.customer_auth_card_position || "left")
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
    footerFeaturesEnabled,
    footerFeatureTitle1,
    footerFeatureDesc1,
    footerFeatureLink1,
    footerFeatureTitle2,
    footerFeatureDesc2,
    footerFeatureLink2,
    footerFeatureTitle3,
    footerFeatureDesc3,
    footerFeatureLink3,
    footerFeatureTitle4,
    footerFeatureDesc4,
    footerFeatureLink4,
    customerAuthBgImage,
    customerAuthBgColor,
    customerAuthCardPosition,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleReset = () => {
    if (!isDirty || !initialSettings) return;
    setAnnouncementEnabled(initialSettings.announcement_enabled ?? DEFAULT_THEME_SETTINGS.announcement_enabled);
    setAnnouncementText(initialSettings.announcement_text || DEFAULT_THEME_SETTINGS.announcement_text);
    setAnnouncementBadge(initialSettings.announcement_badge || DEFAULT_THEME_SETTINGS.announcement_badge);
    setNavbarPromoEnabled(initialSettings.navbar_promo_enabled ?? true);
    setNavbarPromoDiscountText(initialSettings.navbar_promo_discount_text || "20% OFF");
    setNavbarPromoCode(initialSettings.navbar_promo_code || "AETHER10");
    setNavbarPromoLink(initialSettings.navbar_promo_link || "/promotions");
    setNavDealsEnabled(initialSettings.nav_deals_enabled ?? true);
    setNavDealsText(initialSettings.nav_deals_text || "Deals");
    setNavDealsLink(initialSettings.nav_deals_link || "/products?discounted=true");
    setCategoryDealsCardEnabled(initialSettings.category_deals_card_enabled ?? true);
    setCategoryDealsCardTitle(initialSettings.category_deals_card_title || "Top Deals");
    setCategoryDealsCardSubtitle(initialSettings.category_deals_card_subtitle || "Up to 20% Off");
    setCategoryDealsCardLink(initialSettings.category_deals_card_link || "/products?discounted=true");
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
    setFlashDealsEnabled(initialSettings.flash_deals_enabled ?? true);
    setFlashDealsTitle(initialSettings.flash_deals_title || "Limited Time Deals");
    setFlashDealsBadge(initialSettings.flash_deals_badge || "Flash Deal Drop");
    setTrustRibbonEnabled(initialSettings.trust_ribbon_enabled ?? true);
    setTrustRibbonTitle1(initialSettings.trust_ribbon_title_1 || "Fast Express Delivery");
    setTrustRibbonDesc1(initialSettings.trust_ribbon_desc_1 || "Dispatched within 24-48 hours");
    setTrustRibbonTitle2(initialSettings.trust_ribbon_title_2 || "Cash on Delivery (COD)");
    setTrustRibbonDesc2(initialSettings.trust_ribbon_desc_2 || "Pay safely upon product arrival");
    setTrustRibbonTitle3(initialSettings.trust_ribbon_title_3 || "100% Genuine & Authentic");
    setTrustRibbonDesc3(initialSettings.trust_ribbon_desc_3 || "Official manufacturer warranty coverage");
    setTrustRibbonTitle4(initialSettings.trust_ribbon_title_4 || "7-Day Easy Replacement");
    setTrustRibbonDesc4(initialSettings.trust_ribbon_desc_4 || "Hassle-free returns & replacement policy");
    setFooterFeaturesEnabled(initialSettings.footer_features_enabled ?? true);
    setFooterFeatureTitle1(initialSettings.footer_feature_title_1 || DEFAULT_THEME_SETTINGS.footer_feature_title_1);
    setFooterFeatureDesc1(initialSettings.footer_feature_desc_1 || DEFAULT_THEME_SETTINGS.footer_feature_desc_1);
    setFooterFeatureLink1(initialSettings.footer_feature_link_1 || DEFAULT_THEME_SETTINGS.footer_feature_link_1);
    setFooterFeatureTitle2(initialSettings.footer_feature_title_2 || DEFAULT_THEME_SETTINGS.footer_feature_title_2);
    setFooterFeatureDesc2(initialSettings.footer_feature_desc_2 || DEFAULT_THEME_SETTINGS.footer_feature_desc_2);
    setFooterFeatureLink2(initialSettings.footer_feature_link_2 || DEFAULT_THEME_SETTINGS.footer_feature_link_2);
    setFooterFeatureTitle3(initialSettings.footer_feature_title_3 || DEFAULT_THEME_SETTINGS.footer_feature_title_3);
    setFooterFeatureDesc3(initialSettings.footer_feature_desc_3 || DEFAULT_THEME_SETTINGS.footer_feature_desc_3);
    setFooterFeatureLink3(initialSettings.footer_feature_link_3 || DEFAULT_THEME_SETTINGS.footer_feature_link_3);
    setFooterFeatureTitle4(initialSettings.footer_feature_title_4 || DEFAULT_THEME_SETTINGS.footer_feature_title_4);
    setFooterFeatureDesc4(initialSettings.footer_feature_desc_4 || DEFAULT_THEME_SETTINGS.footer_feature_desc_4);
    setFooterFeatureLink4(initialSettings.footer_feature_link_4 || DEFAULT_THEME_SETTINGS.footer_feature_link_4);
    setCustomerAuthBgImage(initialSettings.customer_auth_bg_image || "");
    setCustomerAuthBgColor(initialSettings.customer_auth_bg_color || "#ffffff");
    setCustomerAuthCardPosition(initialSettings.customer_auth_card_position || "left");
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
      footer_features_enabled: footerFeaturesEnabled,
      footer_feature_title_1: footerFeatureTitle1,
      footer_feature_desc_1: footerFeatureDesc1,
      footer_feature_link_1: footerFeatureLink1,
      footer_feature_title_2: footerFeatureTitle2,
      footer_feature_desc_2: footerFeatureDesc2,
      footer_feature_link_2: footerFeatureLink2,
      footer_feature_title_3: footerFeatureTitle3,
      footer_feature_desc_3: footerFeatureDesc3,
      footer_feature_link_3: footerFeatureLink3,
      footer_feature_title_4: footerFeatureTitle4,
      footer_feature_desc_4: footerFeatureDesc4,
      footer_feature_link_4: footerFeatureLink4,
      customer_auth_bg_image: customerAuthBgImage,
      customer_auth_bg_color: customerAuthBgColor,
      customer_auth_card_position: customerAuthCardPosition,
    };

    try {
      const res = await adminApi.updateThemeSettings(payload);
      const serverSettings = res?.settings || {};

      // If server converted an uploaded base64 data URL to a persistent disk URL, update state
      const savedSplitImage = serverSettings.split_reveal_image || splitRevealImage;
      const savedSplitLogo = serverSettings.split_reveal_logo !== undefined ? serverSettings.split_reveal_logo : splitRevealLogo;
      const savedAuthBg = serverSettings.customer_auth_bg_image || customerAuthBgImage;
      const savedTitle = serverSettings.split_reveal_title || splitRevealTitle;

      if (serverSettings.split_reveal_image && serverSettings.split_reveal_image !== splitRevealImage) {
        setSplitRevealImage(serverSettings.split_reveal_image);
      }
      if (serverSettings.split_reveal_logo !== undefined && serverSettings.split_reveal_logo !== splitRevealLogo) {
        setSplitRevealLogo(serverSettings.split_reveal_logo);
      }
      if (serverSettings.customer_auth_bg_image && serverSettings.customer_auth_bg_image !== customerAuthBgImage) {
        setCustomerAuthBgImage(serverSettings.customer_auth_bg_image);
      }
      if (serverSettings.split_reveal_title && serverSettings.split_reveal_title !== splitRevealTitle) {
        setSplitRevealTitle(serverSettings.split_reveal_title);
      }

      const updatedBaseline = {
        ...initialSettings,
        announcement_enabled: Boolean(announcementEnabled),
        announcement_text: announcementText,
        announcement_badge: announcementBadge,
        navbar_promo_enabled: Boolean(navbarPromoEnabled),
        navbar_promo_discount_text: navbarPromoDiscountText,
        navbar_promo_code: navbarPromoCode,
        navbar_promo_link: navbarPromoLink,
        nav_deals_enabled: Boolean(navDealsEnabled),
        nav_deals_text: navDealsText,
        nav_deals_link: navDealsLink,
        category_deals_card_enabled: Boolean(categoryDealsCardEnabled),
        category_deals_card_title: categoryDealsCardTitle,
        category_deals_card_subtitle: categoryDealsCardSubtitle,
        category_deals_card_link: categoryDealsCardLink,
        hero_headline_line1: heroHeadline1,
        hero_headline_line2_gradient: heroHeadline2Gradient,
        hero_headline_line3: heroHeadline3,
        hero_subheading: heroSubheading,
        hero_badge_text: heroBadgeText,
        split_reveal_enabled: Boolean(splitRevealEnabled),
        split_reveal_image: savedSplitImage,
        split_reveal_logo: savedSplitLogo,
        split_reveal_title: savedTitle,
        split_reveal_subtitle: splitRevealSubtitle,
        split_reveal_duration: Number(splitRevealDuration),
        split_reveal_mode: splitRevealMode,
        split_reveal_dim: Number(splitRevealDim),
        split_reveal_direction: splitRevealDirection,
        flash_deals_enabled: Boolean(flashDealsEnabled),
        flash_deals_title: flashDealsTitle,
        flash_deals_badge: flashDealsBadge,
        trust_ribbon_enabled: Boolean(trustRibbonEnabled),
        trust_ribbon_title_1: trustRibbonTitle1,
        trust_ribbon_desc_1: trustRibbonDesc1,
        trust_ribbon_title_2: trustRibbonTitle2,
        trust_ribbon_desc_2: trustRibbonDesc2,
        trust_ribbon_title_3: trustRibbonTitle3,
        trust_ribbon_desc_3: trustRibbonDesc3,
        trust_ribbon_title_4: trustRibbonTitle4,
        trust_ribbon_desc_4: trustRibbonDesc4,
        footer_features_enabled: Boolean(footerFeaturesEnabled),
        footer_feature_title_1: footerFeatureTitle1,
        footer_feature_desc_1: footerFeatureDesc1,
        footer_feature_link_1: footerFeatureLink1,
        footer_feature_title_2: footerFeatureTitle2,
        footer_feature_desc_2: footerFeatureDesc2,
        footer_feature_link_2: footerFeatureLink2,
        footer_feature_title_3: footerFeatureTitle3,
        footer_feature_desc_3: footerFeatureDesc3,
        footer_feature_link_3: footerFeatureLink3,
        footer_feature_title_4: footerFeatureTitle4,
        footer_feature_desc_4: footerFeatureDesc4,
        footer_feature_link_4: footerFeatureLink4,
        customer_auth_bg_image: savedAuthBg,
        customer_auth_bg_color: customerAuthBgColor,
        customer_auth_card_position: customerAuthCardPosition,
      };

      setInitialSettings(updatedBaseline);
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
        <div className="rounded-2xl bg-[#0b0e17] border border-white/10 p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                <Split className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Split-Reveal Splash Screen</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    splitRevealEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-slate-500 border border-white/10"
                  }`}>
                    {splitRevealEnabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cinematic two-shutter entrance animation displayed to visitors entering your storefront.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              {splitRevealEnabled && (
                <button
                  type="button"
                  onClick={handleLivePreview}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Test animation in this browser window"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span>Preview Intro</span>
                </button>
              )}

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={splitRevealEnabled}
                  onChange={(e) => setSplitRevealEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {splitRevealEnabled && (
            <div className="space-y-6 pt-1 animate-in fade-in duration-200">
              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Intro Title</label>
                  <input
                    type="text"
                    value={splitRevealTitle}
                    onChange={(e) => setSplitRevealTitle(e.target.value)}
                    placeholder="e.g. INHALIQ"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400 focus:bg-white/[0.07] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Intro Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={splitRevealSubtitle}
                    onChange={(e) => setSplitRevealSubtitle(e.target.value)}
                    placeholder="e.g. PRECISION ACOUSTICS & HARDWARE"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400 focus:bg-white/[0.07] transition-all"
                  />
                </div>
              </div>

              {/* Minimal Visual Dropzones: Wallpaper & Logo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Wallpaper Dropzone Card */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Splash Wallpaper Image</label>
                  <input
                    type="file"
                    ref={splitFileInputRef}
                    onChange={handleSplitFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {splitRevealImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 h-44 group transition-all">
                      <img
                        src={splitRevealImage}
                        alt="Split Wallpaper"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
                        <button
                          type="button"
                          onClick={() => splitFileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Wallpaper</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveSplitImage}
                          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 backdrop-blur-md transition-all shadow-lg cursor-pointer border border-rose-500/30"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-2.5 left-3 pointer-events-none group-hover:opacity-0 transition-opacity">
                        <span className="text-[10px] font-semibold text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                          Hover to replace or delete
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => splitFileInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-400/50 bg-white/[0.02] hover:bg-white/[0.04] h-44 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all p-4 text-center group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-amber-500/10 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-all">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Click or drag image to upload wallpaper</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Recommended 16:9 or fullscreen (PNG, JPG, WebP up to 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Logo Dropzone Card */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Split-Reveal Logo (Optional)</label>
                  <input
                    type="file"
                    ref={splitLogoInputRef}
                    onChange={handleSplitLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {splitRevealLogo ? (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 h-44 group transition-all flex items-center justify-center p-6">
                      <img
                        src={splitRevealLogo}
                        alt="Split Logo"
                        className="max-h-24 max-w-full object-contain filter drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
                        <button
                          type="button"
                          onClick={() => splitLogoInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Logo</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveSplitLogo}
                          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 backdrop-blur-md transition-all shadow-lg cursor-pointer border border-rose-500/30"
                          title="Remove custom logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-2.5 left-3 pointer-events-none group-hover:opacity-0 transition-opacity">
                        <span className="text-[10px] font-semibold text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                          Custom logo active
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => splitLogoInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-400/50 bg-white/[0.02] hover:bg-white/[0.04] h-44 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all p-4 text-center group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-amber-500/10 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-all">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Upload Dedicated Split Logo</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Leave empty to use primary brand logo (PNG or SVG with transparency)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Animation Config Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Shutter Duration</label>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                      {splitRevealDuration}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={splitRevealDuration}
                    onChange={(e) => setSplitRevealDuration(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Fast (0.5s)</span>
                    <span>Cinematic (4.2s)</span>
                    <span>Slow (6.0s)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Trigger Frequency</label>
                  <select
                    value={splitRevealMode}
                    onChange={(e) => setSplitRevealMode(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all cursor-pointer"
                  >
                    <option value="every_time" className="bg-[#0e121e]">Every Page Visit</option>
                    <option value="once_per_session" className="bg-[#0e121e]">Once Per Session (Recommended)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">
                    {splitRevealMode === "once_per_session" ? "Plays once per browser session" : "Plays on every page reload"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Split Motion</label>
                  <select
                    value={splitRevealDirection}
                    onChange={(e) => setSplitRevealDirection(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all cursor-pointer"
                  >
                    <option value="vertical" className="bg-[#0e121e]">Vertical Split (Top / Bottom)</option>
                    <option value="horizontal" className="bg-[#0e121e]">Horizontal Split (Left / Right)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">
                    {splitRevealDirection === "vertical" ? "Curtains part vertically (up & down)" : "Curtains slide horizontally (left & right)"}
                  </p>
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

        {/* ========================================================================= */}
        {/* SECTION 5: FOOTER GUARANTEES & FEATURES STRIP */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-[#0f121b] border border-white/[0.08] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Footer Guarantees & Features Strip</h3>
                <p className="text-xs text-slate-400">4 promotional value & warranty feature items displayed across the top of the footer</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={footerFeaturesEnabled}
                onChange={(e) => setFooterFeaturesEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500" />
            </label>
          </div>

          {footerFeaturesEnabled && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item 1 */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Footer Feature 1: Express Shipping</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Title</label>
                    <input
                      type="text"
                      value={footerFeatureTitle1}
                      onChange={(e) => setFooterFeatureTitle1(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Subtitle</label>
                    <input
                      type="text"
                      value={footerFeatureDesc1}
                      onChange={(e) => setFooterFeatureDesc1(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Link Route</label>
                    <input
                      type="text"
                      value={footerFeatureLink1}
                      onChange={(e) => setFooterFeatureLink1(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Footer Feature 2: Warranty & Protection</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Title</label>
                    <input
                      type="text"
                      value={footerFeatureTitle2}
                      onChange={(e) => setFooterFeatureTitle2(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Subtitle</label>
                    <input
                      type="text"
                      value={footerFeatureDesc2}
                      onChange={(e) => setFooterFeatureDesc2(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Link Route</label>
                    <input
                      type="text"
                      value={footerFeatureLink2}
                      onChange={(e) => setFooterFeatureLink2(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Footer Feature 3: Risk-Free Trial / Return</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Title</label>
                    <input
                      type="text"
                      value={footerFeatureTitle3}
                      onChange={(e) => setFooterFeatureTitle3(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Subtitle</label>
                    <input
                      type="text"
                      value={footerFeatureDesc3}
                      onChange={(e) => setFooterFeatureDesc3(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Link Route</label>
                    <input
                      type="text"
                      value={footerFeatureLink3}
                      onChange={(e) => setFooterFeatureLink3(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Item 4 */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">Footer Feature 4: Expert Support</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Title</label>
                    <input
                      type="text"
                      value={footerFeatureTitle4}
                      onChange={(e) => setFooterFeatureTitle4(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Subtitle</label>
                    <input
                      type="text"
                      value={footerFeatureDesc4}
                      onChange={(e) => setFooterFeatureDesc4(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Link Route</label>
                    <input
                      type="text"
                      value={footerFeatureLink4}
                      onChange={(e) => setFooterFeatureLink4(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CUSTOMER LOGIN & SIGN UP PAGE                                             */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Customer Login & Sign Up Page</h3>
                <p className="text-[11px] text-slate-400">Background wallpaper and color settings</p>
              </div>
            </div>

            <a
              href="/login"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors"
            >
              <span>View Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            {/* Background Wallpaper Image */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">Background Wallpaper Image</label>
                <ImageUploadGuidance slotKey="admin_storefront_auth_bg" imageUrl={customerAuthBgImage} layout="inline" />
              </div>
              <input
                type="file"
                ref={authBgFileInputRef}
                onChange={handleAuthBgUpload}
                accept="image/*"
                className="hidden"
              />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {customerAuthBgImage && (
                  <div className="w-14 h-11 rounded-lg border border-white/15 overflow-hidden bg-black/50 shrink-0">
                    <img
                      src={customerAuthBgImage}
                      alt="Background"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => authBgFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                  {customerAuthBgImage && (
                    <button
                      type="button"
                      onClick={handleRemoveAuthBg}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Remove wallpaper image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                  <input
                    type="text"
                    value={customerAuthBgImage}
                    onChange={(e) => setCustomerAuthBgImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            </div>

            {/* Fallback Background Color */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">Fallback Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customerAuthBgColor || "#ffffff"}
                  onChange={(e) => setCustomerAuthBgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-white/15 bg-transparent cursor-pointer shrink-0 p-0.5"
                />
                <input
                  type="text"
                  value={customerAuthBgColor}
                  onChange={(e) => setCustomerAuthBgColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-400 uppercase"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  {[
                    { label: "White", color: "#ffffff" },
                    { label: "Slate", color: "#f8fafc" },
                    { label: "Dark", color: "#090a0f" },
                  ].map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setCustomerAuthBgColor(p.color)}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Contextual Save Bar */}
      <AdminSaveBar
        isDirty={isDirty}
        isSaving={saving}
        onSave={handleSaveStorefront}
        onDiscard={handleReset}
        saveLabel="Save Storefront"
        message="Unsaved storefront changes"
      />

    </div>
  );
}
