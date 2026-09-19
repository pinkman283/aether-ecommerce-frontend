"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Upload, 
  ClipboardPaste, 
  Sliders, 
  Sun, 
  Moon, 
  Loader2,
  CheckCheck,
  ChevronRight,
  Layers,
  Star,
  ArrowRight,
  X
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { 
  useThemeStore, 
  ThemeSettings, 
  DEFAULT_THEME_SETTINGS, 
  getHexLuminance, 
  getAutoSynchronizedTokens 
} from "@/store/useThemeStore";
import { SettingsNavTabs } from "@/components/admin/settings/SettingsNavTabs";
import { LiveStorefrontPreview } from "@/components/admin/settings/LiveStorefrontPreview";
import { AdminSaveBar } from "@/components/admin/ui";
import { toast } from "sonner";

export interface CustomThemeItem {
  id: string;
  name: string;
  category: "dark" | "light";
  tagline: string;
  primary: string;
  secondary: string;
  bg: string;
  card: string;
  border?: string;
  heading?: string;
  body?: string;
  btnPrimaryBg?: string;
  btnPrimaryText?: string;
  btnSecondaryBg?: string;
  btnSecondaryText?: string;
  tabActiveBg?: string;
  tabActiveText?: string;
  viewAllColor?: string;
  hoverBg?: string;
  hoverText?: string;
  radius?: string;
  settings?: Partial<ThemeSettings>;
  createdAt?: string;
  isCustom?: boolean;
}

interface ThemePreset {
  id: string;
  name: string;
  category: "dark" | "light";
  tagline: string;
  primary: string;
  secondary: string;
  bg: string;
  card: string;
  border?: string;
  heading?: string;
  body?: string;
  btnPrimaryBg?: string;
  btnPrimaryText?: string;
  btnSecondaryBg?: string;
  btnSecondaryText?: string;
  tabActiveBg?: string;
  tabActiveText?: string;
  viewAllColor?: string;
  hoverBg?: string;
  hoverText?: string;
  radius?: string;
  settings?: Partial<ThemeSettings>;
  gradientClass?: string;
  isCustom?: boolean;
}

const BUILTIN_PRESETS: ThemePreset[] = [
  // ========================
  // DARK PRESETS (8)
  // ========================
  {
    id: "cyan-indigo",
    name: "Aether Studio",
    category: "dark",
    tagline: "High-tech acoustic cyan and deep studio indigo with cyber borders",
    primary: "#06b6d4",
    secondary: "#6366f1",
    bg: "#090a0f",
    card: "#0c101d",
    border: "rgba(255, 255, 255, 0.1)",
    heading: "#ffffff",
    body: "#94a3b8",
    btnPrimaryBg: "#06b6d4",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "rgba(255, 255, 255, 0.05)",
    btnSecondaryText: "#ffffff",
    tabActiveBg: "#06b6d4",
    tabActiveText: "#ffffff",
    hoverBg: "rgba(6, 182, 212, 0.15)",
    hoverText: "#06b6d4",
    radius: "rounded-lg",
    gradientClass: "from-cyan-500 to-indigo-600",
  },
  {
    id: "emerald-matrix",
    name: "Emerald Cyber Matrix",
    category: "dark",
    tagline: "Bio-luminescent green with deep emerald tones and matrix glow",
    primary: "#10b981",
    secondary: "#06b6d4",
    bg: "#05120c",
    card: "#091f14",
    border: "rgba(16, 185, 129, 0.2)",
    heading: "#ffffff",
    body: "#a7f3d0",
    btnPrimaryBg: "#10b981",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "rgba(16, 185, 129, 0.1)",
    btnSecondaryText: "#34d399",
    tabActiveBg: "#10b981",
    tabActiveText: "#ffffff",
    hoverBg: "rgba(16, 185, 129, 0.2)",
    hoverText: "#10b981",
    radius: "rounded-lg",
    gradientClass: "from-emerald-400 to-cyan-500",
  },
  {
    id: "violet-cyberpunk",
    name: "Neon Violet Cyberpunk",
    category: "dark",
    tagline: "Futuristic ultraviolet with electric magenta highlights",
    primary: "#8b5cf6",
    secondary: "#ec4899",
    bg: "#0c0717",
    card: "#160d29",
    border: "rgba(139, 92, 246, 0.25)",
    heading: "#ffffff",
    body: "#c4b5fd",
    btnPrimaryBg: "#8b5cf6",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "rgba(139, 92, 246, 0.1)",
    btnSecondaryText: "#a78bfa",
    tabActiveBg: "#8b5cf6",
    tabActiveText: "#ffffff",
    hoverBg: "rgba(139, 92, 246, 0.2)",
    hoverText: "#8b5cf6",
    radius: "rounded-xl",
    gradientClass: "from-purple-500 to-pink-500",
  },
  {
    id: "amber-horizon",
    name: "Golden Amber Horizon",
    category: "dark",
    tagline: "Warm industrial titanium with tactile golden hardware glow",
    primary: "#f59e0b",
    secondary: "#f97316",
    bg: "#0d0a06",
    card: "#17120a",
    border: "rgba(245, 158, 11, 0.2)",
    heading: "#ffffff",
    body: "#fde68a",
    btnPrimaryBg: "#f59e0b",
    btnPrimaryText: "#090a0f",
    btnSecondaryBg: "rgba(245, 158, 11, 0.1)",
    btnSecondaryText: "#fbbf24",
    tabActiveBg: "#f59e0b",
    tabActiveText: "#090a0f",
    hoverBg: "rgba(245, 158, 11, 0.15)",
    hoverText: "#f59e0b",
    radius: "rounded-lg",
    gradientClass: "from-amber-400 to-orange-500",
  },
  {
    id: "crimson-noir",
    name: "Crimson Cyber Noir",
    category: "dark",
    tagline: "Deep stealth carbon & laser crimson glow for aggressive high-impact audio",
    primary: "#f43f5e",
    secondary: "#fb7185",
    bg: "#0f0507",
    card: "#1a0b0f",
    border: "rgba(244, 63, 94, 0.2)",
    heading: "#ffffff",
    body: "#fecdd3",
    btnPrimaryBg: "#f43f5e",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "rgba(244, 63, 94, 0.1)",
    btnSecondaryText: "#fda4af",
    tabActiveBg: "#f43f5e",
    tabActiveText: "#ffffff",
    hoverBg: "rgba(244, 63, 94, 0.2)",
    hoverText: "#f43f5e",
    radius: "rounded-lg",
    gradientClass: "from-rose-500 to-red-600",
  },
  {
    id: "sapphire-abyss",
    name: "Midnight Sapphire Abyss",
    category: "dark",
    tagline: "Deep oceanic abyss with electric royal sapphire and crystalline indigo",
    primary: "#3b82f6",
    secondary: "#06b6d4",
    bg: "#060b18",
    card: "#0c152e",
    border: "rgba(59, 130, 246, 0.2)",
    heading: "#ffffff",
    body: "#bfdbfe",
    btnPrimaryBg: "#3b82f6",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "rgba(59, 130, 246, 0.1)",
    btnSecondaryText: "#93c5fd",
    tabActiveBg: "#3b82f6",
    tabActiveText: "#ffffff",
    hoverBg: "rgba(59, 130, 246, 0.2)",
    hoverText: "#3b82f6",
    radius: "rounded-lg",
    gradientClass: "from-blue-500 to-cyan-400",
  },
  {
    id: "stealth-obsidian",
    name: "Titanium Stealth Obsidian",
    category: "dark",
    tagline: "Matte stealth carbon & aerospace titanium monochrome architecture",
    primary: "#94a3b8",
    secondary: "#cbd5e1",
    bg: "#09090b",
    card: "#141417",
    border: "rgba(255, 255, 255, 0.12)",
    heading: "#f8fafc",
    body: "#94a3b8",
    btnPrimaryBg: "#f8fafc",
    btnPrimaryText: "#09090b",
    btnSecondaryBg: "rgba(255, 255, 255, 0.05)",
    btnSecondaryText: "#f8fafc",
    tabActiveBg: "#f8fafc",
    tabActiveText: "#09090b",
    hoverBg: "rgba(255, 255, 255, 0.08)",
    hoverText: "#ffffff",
    radius: "rounded-md",
    gradientClass: "from-slate-400 to-zinc-200",
  },
  {
    id: "synthwave-sunset",
    name: "Tokyo Synthwave Sunset",
    category: "dark",
    tagline: "Retro-futuristic neon violet and hot magenta arcade horizon",
    primary: "#ec4899",
    secondary: "#8b5cf6",
    bg: "#10061a",
    card: "#1b0d2b",
    border: "rgba(236, 72, 153, 0.25)",
    heading: "#ffffff",
    body: "#fbcfe8",
    btnPrimaryBg: "#ec4899",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "rgba(236, 72, 153, 0.1)",
    btnSecondaryText: "#f472b6",
    tabActiveBg: "#ec4899",
    tabActiveText: "#ffffff",
    hoverBg: "rgba(236, 72, 153, 0.2)",
    hoverText: "#ec4899",
    radius: "rounded-2xl",
    gradientClass: "from-pink-500 to-violet-600",
  },

  // ========================
  // WHITE / LIGHT PRESETS (8+)
  // ========================
  {
    id: "lulu-emerald-white",
    name: "LuLu Hypermarket Minimalist Emerald & White",
    category: "light",
    tagline: "Signature LuLu deep forest green & vibrant emerald on ultra-clean pure white canvas",
    primary: "#005826",
    secondary: "#2da54b",
    bg: "#ffffff",
    card: "#ffffff",
    border: "#e5e7eb",
    heading: "#0f172a",
    body: "#475569",
    btnPrimaryBg: "#005826",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#f3f4f6",
    btnSecondaryText: "#0f172a",
    tabActiveBg: "#005826",
    tabActiveText: "#ffffff",
    hoverBg: "rgba(0, 88, 38, 0.08)",
    hoverText: "#005826",
    radius: "rounded-xl",
    gradientClass: "from-emerald-700 to-green-500",
  },
  {
    id: "pure-snow-white",
    name: "Pure Snow & Minimalist White",
    category: "light",
    tagline: "Ultra-crisp modern storefront with pure snow canvas and slate accents",
    primary: "#0f172a",
    secondary: "#2563eb",
    bg: "#ffffff",
    card: "#f8fafc",
    border: "#e2e8f0",
    heading: "#0f172a",
    body: "#475569",
    btnPrimaryBg: "#0f172a",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#f1f5f9",
    btnSecondaryText: "#0f172a",
    tabActiveBg: "#0f172a",
    tabActiveText: "#ffffff",
    hoverBg: "#f1f5f9",
    hoverText: "#2563eb",
    radius: "rounded-lg",
    gradientClass: "from-slate-900 to-blue-600",
  },
  {
    id: "apple-clean-white",
    name: "Apple Modernist Clean White",
    category: "light",
    tagline: "Iconic Cupertino clean aesthetic with crisp typography and subtle pearl depth",
    primary: "#0071e3",
    secondary: "#000000",
    bg: "#ffffff",
    card: "#fbfbfd",
    border: "#e5e5e7",
    heading: "#1d1d1f",
    body: "#515154",
    btnPrimaryBg: "#0071e3",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#f5f5f7",
    btnSecondaryText: "#1d1d1f",
    tabActiveBg: "#0071e3",
    tabActiveText: "#ffffff",
    hoverBg: "#f5f5f7",
    hoverText: "#0071e3",
    radius: "rounded-xl",
    gradientClass: "from-blue-600 to-sky-500",
  },
  {
    id: "nordic-frost-light",
    name: "Nordic Frost & Glacier Blue",
    category: "light",
    tagline: "Clean Scandinavian pearl canvas with crystalline glacier cyan and steel indigo",
    primary: "#0284c7",
    secondary: "#4f46e5",
    bg: "#ffffff",
    card: "#f0f9ff",
    border: "#bae6fd",
    heading: "#0c4a6e",
    body: "#334155",
    btnPrimaryBg: "#0284c7",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#e0f2fe",
    btnSecondaryText: "#0369a1",
    tabActiveBg: "#0284c7",
    tabActiveText: "#ffffff",
    hoverBg: "#e0f2fe",
    hoverText: "#0284c7",
    radius: "rounded-lg",
    gradientClass: "from-sky-500 to-indigo-600",
  },
  {
    id: "alabaster-gold-light",
    name: "Luxe Alabaster & Warm Gold",
    category: "light",
    tagline: "High-end luxury boutique aesthetic on ivory alabaster with warm golden hardware",
    primary: "#b45309",
    secondary: "#d97706",
    bg: "#fafaf9",
    card: "#ffffff",
    border: "#e7e5e4",
    heading: "#1c1917",
    body: "#57534e",
    btnPrimaryBg: "#b45309",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#f5f5f4",
    btnSecondaryText: "#1c1917",
    tabActiveBg: "#b45309",
    tabActiveText: "#ffffff",
    hoverBg: "#f5f5f4",
    hoverText: "#b45309",
    radius: "rounded-lg",
    gradientClass: "from-amber-600 to-yellow-500",
  },
  {
    id: "botanical-sage-light",
    name: "Botanical Forest Sage",
    category: "light",
    tagline: "Organic white canvas with lush botanical emerald and eucalyptus accents",
    primary: "#059669",
    secondary: "#0d9488",
    bg: "#ffffff",
    card: "#f0fdf4",
    border: "#bbf7d0",
    heading: "#064e3b",
    body: "#374151",
    btnPrimaryBg: "#059669",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#dcfce7",
    btnSecondaryText: "#047857",
    tabActiveBg: "#059669",
    tabActiveText: "#ffffff",
    hoverBg: "#dcfce7",
    hoverText: "#059669",
    radius: "rounded-lg",
    gradientClass: "from-emerald-500 to-teal-600",
  },
  {
    id: "monochrome-charcoal-light",
    name: "Monochrome Charcoal & Pure Studio",
    category: "light",
    tagline: "High-fashion minimalist black and white editorial with sharp modern contrast",
    primary: "#18181b",
    secondary: "#71717a",
    bg: "#ffffff",
    card: "#f4f4f5",
    border: "#e4e4e7",
    heading: "#09090b",
    body: "#52525b",
    btnPrimaryBg: "#18181b",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#e4e4e7",
    btnSecondaryText: "#09090b",
    tabActiveBg: "#18181b",
    tabActiveText: "#ffffff",
    hoverBg: "#e4e4e7",
    hoverText: "#18181b",
    radius: "rounded-none",
    gradientClass: "from-zinc-900 to-zinc-600",
  },
  {
    id: "lavender-silk-light",
    name: "Lavender Silk & Royal Violet",
    category: "light",
    tagline: "Elegantly refined white canvas with regal violet and velvet orchid highlights",
    primary: "#7c3aed",
    secondary: "#ec4899",
    bg: "#faf5ff",
    card: "#ffffff",
    border: "#e9d5ff",
    heading: "#2e1065",
    body: "#4b5563",
    btnPrimaryBg: "#7c3aed",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#f3e8ff",
    btnSecondaryText: "#6b21a8",
    tabActiveBg: "#7c3aed",
    tabActiveText: "#ffffff",
    hoverBg: "#f3e8ff",
    hoverText: "#7c3aed",
    radius: "rounded-xl",
    gradientClass: "from-purple-600 to-pink-500",
  },
  {
    id: "sunset-coral-light",
    name: "Sunset Coral & Radiant Peach",
    category: "light",
    tagline: "Warm, energetic white porcelain with vibrant coral glow and summer sunset hues",
    primary: "#f97316",
    secondary: "#e11d48",
    bg: "#fffbf5",
    card: "#ffffff",
    border: "#fed7aa",
    heading: "#431407",
    body: "#4b5563",
    btnPrimaryBg: "#f97316",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#ffedd5",
    btnSecondaryText: "#c2410c",
    tabActiveBg: "#f97316",
    tabActiveText: "#ffffff",
    hoverBg: "#ffedd5",
    hoverText: "#f97316",
    radius: "rounded-2xl",
    gradientClass: "from-orange-500 to-rose-500",
  },
  {
    id: "ocean-marine-light",
    name: "Ocean Marine & Crisp Aqua",
    category: "light",
    tagline: "Vibrant seafoam turquoise and bright marine azure on fresh white porcelain",
    primary: "#0d9488",
    secondary: "#0284c7",
    bg: "#ffffff",
    card: "#f0fdfa",
    border: "#99f6e4",
    heading: "#134e4a",
    body: "#334155",
    btnPrimaryBg: "#0d9488",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "#ccfbf1",
    btnSecondaryText: "#0f766e",
    tabActiveBg: "#0d9488",
    tabActiveText: "#ffffff",
    hoverBg: "#ccfbf1",
    hoverText: "#0d9488",
    radius: "rounded-lg",
    gradientClass: "from-teal-500 to-cyan-600",
  },
];

export default function AdminAppearancePage() {
  const { adminUser } = useAdminAuthStore();
  const { setTheme: updateClientTheme } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Filter & Search
  const [presetFilter, setPresetFilter] = useState<"all" | "dark" | "light" | "custom">("all");
  const [customThemes, setCustomThemes] = useState<CustomThemeItem[]>([]);
  const [deletedThemeIds, setDeletedThemeIds] = useState<string[]>([]);

  // Default Theme Tracking (One theme is default at a time)
  const [defaultThemeId, setDefaultThemeId] = useState<string>("cyan-indigo");

  // Active Theme Form State
  const [activeThemeName, setActiveThemeName] = useState("Aether Studio");
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_THEME_SETTINGS.theme_primary_color);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_THEME_SETTINGS.theme_secondary_color);
  const [accentGradient, setAccentGradient] = useState(DEFAULT_THEME_SETTINGS.theme_accent_gradient);
  const [bgColor, setBgColor] = useState(DEFAULT_THEME_SETTINGS.theme_bg_color);
  const [cardBgColor, setCardBgColor] = useState(DEFAULT_THEME_SETTINGS.theme_card_bg_color);
  const [cardBorderColor, setCardBorderColor] = useState(DEFAULT_THEME_SETTINGS.theme_card_border_color || "rgba(255, 255, 255, 0.1)");
  const [textHeadingColor, setTextHeadingColor] = useState(DEFAULT_THEME_SETTINGS.theme_text_heading_color || "#ffffff");
  const [textBodyColor, setTextBodyColor] = useState(DEFAULT_THEME_SETTINGS.theme_text_body_color || "#94a3b8");
  const [btnPrimaryBg, setBtnPrimaryBg] = useState(DEFAULT_THEME_SETTINGS.theme_btn_primary_bg || "#06b6d4");
  const [btnPrimaryText, setBtnPrimaryText] = useState(DEFAULT_THEME_SETTINGS.theme_btn_primary_text || "#ffffff");
  const [btnSecondaryBg, setBtnSecondaryBg] = useState(DEFAULT_THEME_SETTINGS.theme_btn_secondary_bg || "rgba(255, 255, 255, 0.05)");
  const [btnSecondaryText, setBtnSecondaryText] = useState(DEFAULT_THEME_SETTINGS.theme_btn_secondary_text || "#ffffff");
  const [tabActiveBg, setTabActiveBg] = useState(DEFAULT_THEME_SETTINGS.theme_tab_active_bg || "#06b6d4");
  const [tabActiveText, setTabActiveText] = useState(DEFAULT_THEME_SETTINGS.theme_tab_active_text || "#ffffff");
  const [viewAllColor, setViewAllColor] = useState(DEFAULT_THEME_SETTINGS.theme_tab_active_bg || "#06b6d4");
  const [hoverBg, setHoverBg] = useState(DEFAULT_THEME_SETTINGS.theme_hover_bg || "rgba(6, 182, 212, 0.15)");
  const [hoverText, setHoverText] = useState(DEFAULT_THEME_SETTINGS.theme_hover_text || "#06b6d4");
  const [radius, setRadius] = useState<string>(DEFAULT_THEME_SETTINGS.theme_radius || "rounded-lg");
  const [footerBgColor, setFooterBgColor] = useState(DEFAULT_THEME_SETTINGS.theme_footer_bg_color || "#1f242e");
  const [footerTextColor, setFooterTextColor] = useState(DEFAULT_THEME_SETTINGS.theme_footer_text_color || "#94a3b8");

  // Advanced Color Token accordion
  const [showAdvancedColors, setShowAdvancedColors] = useState(false);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeType, setNewThemeType] = useState<"dark" | "light">("dark");
  const [newThemePrimary, setNewThemePrimary] = useState("#06b6d4");
  const [newThemeSecondary, setNewThemeSecondary] = useState("#6366f1");

  // Full Initial State for save dirty checking
  const [initialSettings, setInitialSettings] = useState<any>(null);

  useEffect(() => {
    // Load Preview Preference from localStorage
    const savedPreview = localStorage.getItem("aether_admin_preview_active");
    if (savedPreview !== null) {
      setShowPreview(savedPreview === "true");
    }

    // Load Default Theme from localStorage
    const savedDefault = localStorage.getItem("aether_default_theme_preset");
    if (savedDefault) {
      setDefaultThemeId(savedDefault);
    }

    async function loadThemeSettings() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("aether_admin_token") : null;
        if (!token) return;

        const res = await adminApi.getThemeSettings();
        const s = res.settings;
        setInitialSettings(s);

        if (s.theme_default_preset) {
          setDefaultThemeId(s.theme_default_preset);
        }

        if (s.theme_primary_color) setPrimaryColor(s.theme_primary_color);
        if (s.theme_secondary_color) setSecondaryColor(s.theme_secondary_color);
        if (s.theme_accent_gradient) setAccentGradient(s.theme_accent_gradient);
        if (s.theme_bg_color) setBgColor(s.theme_bg_color);
        if (s.theme_card_bg_color) setCardBgColor(s.theme_card_bg_color);
        if (s.theme_card_border_color) setCardBorderColor(s.theme_card_border_color);
        if (s.theme_text_heading_color) setTextHeadingColor(s.theme_text_heading_color);
        if (s.theme_text_body_color) setTextBodyColor(s.theme_text_body_color);
        if (s.theme_btn_primary_bg) setBtnPrimaryBg(s.theme_btn_primary_bg);
        if (s.theme_btn_primary_text) setBtnPrimaryText(s.theme_btn_primary_text);
        if (s.theme_btn_secondary_bg) setBtnSecondaryBg(s.theme_btn_secondary_bg);
        if (s.theme_btn_secondary_text) setBtnSecondaryText(s.theme_btn_secondary_text);
        if (s.theme_tab_active_bg) setTabActiveBg(s.theme_tab_active_bg);
        if (s.theme_tab_active_text) setTabActiveText(s.theme_tab_active_text);
        if (s.theme_view_all_color) {
          setViewAllColor(s.theme_view_all_color);
        } else if (s.theme_tab_active_bg) {
          setViewAllColor(s.theme_tab_active_bg);
        }
        if (s.theme_hover_bg) setHoverBg(s.theme_hover_bg);
        if (s.theme_hover_text) setHoverText(s.theme_hover_text);
        if (s.theme_radius) setRadius(s.theme_radius);
        if (s.theme_footer_bg_color) setFooterBgColor(s.theme_footer_bg_color);
        if (s.theme_footer_text_color) setFooterTextColor(s.theme_footer_text_color);

        if (s.custom_themes && Array.isArray(s.custom_themes)) {
          setCustomThemes(s.custom_themes);
        }

        if (s.deleted_theme_ids && Array.isArray(s.deleted_theme_ids)) {
          setDeletedThemeIds(s.deleted_theme_ids);
        }
      } catch (err: any) {
        if (err?.response?.status !== 401 && err?.response?.status !== 403) {
          console.error("Failed to load theme settings:", err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadThemeSettings();
  }, []);

  const togglePreview = () => {
    const nextState = !showPreview;
    setShowPreview(nextState);
    localStorage.setItem("aether_admin_preview_active", String(nextState));
  };

  const handleSelectPreset = (preset: ThemePreset | CustomThemeItem) => {
    const isCurrentlySelected = accentGradient === preset.id || activeThemeName === preset.name;
    const isLiveActive = livePublishedThemeId === preset.id;

    // If clicking on an already selected draft theme, unselect it and revert back to active theme
    if (isCurrentlySelected && !isLiveActive) {
      const livePreset = allAvailableThemes.find((p) => p.id === livePublishedThemeId);
      setActiveThemeName(livePreset?.name || "Aether Studio");
      if (initialSettings) {
        setPrimaryColor(initialSettings.theme_primary_color || DEFAULT_THEME_SETTINGS.theme_primary_color);
        setSecondaryColor(initialSettings.theme_secondary_color || DEFAULT_THEME_SETTINGS.theme_secondary_color);
        setBgColor(initialSettings.theme_bg_color || DEFAULT_THEME_SETTINGS.theme_bg_color);
        setCardBgColor(initialSettings.theme_card_bg_color || DEFAULT_THEME_SETTINGS.theme_card_bg_color);
        setAccentGradient(initialSettings.theme_accent_gradient || DEFAULT_THEME_SETTINGS.theme_accent_gradient);
        setCardBorderColor(initialSettings.theme_card_border_color || DEFAULT_THEME_SETTINGS.theme_card_border_color || "rgba(255, 255, 255, 0.1)");
        setTextHeadingColor(initialSettings.theme_text_heading_color || DEFAULT_THEME_SETTINGS.theme_text_heading_color || "#ffffff");
        setTextBodyColor(initialSettings.theme_text_body_color || DEFAULT_THEME_SETTINGS.theme_text_body_color || "#94a3b8");
        setBtnPrimaryBg(initialSettings.theme_btn_primary_bg || DEFAULT_THEME_SETTINGS.theme_btn_primary_bg || "#06b6d4");
        setBtnPrimaryText(initialSettings.theme_btn_primary_text || DEFAULT_THEME_SETTINGS.theme_btn_primary_text || "#ffffff");
        setBtnSecondaryBg(initialSettings.theme_btn_secondary_bg || DEFAULT_THEME_SETTINGS.theme_btn_secondary_bg || "rgba(255, 255, 255, 0.05)");
        setBtnSecondaryText(initialSettings.theme_btn_secondary_text || DEFAULT_THEME_SETTINGS.theme_btn_secondary_text || "#ffffff");
        setTabActiveBg(initialSettings.theme_tab_active_bg || DEFAULT_THEME_SETTINGS.theme_tab_active_bg || "#06b6d4");
        setTabActiveText(initialSettings.theme_tab_active_text || DEFAULT_THEME_SETTINGS.theme_tab_active_text || "#ffffff");
        setViewAllColor(initialSettings.theme_view_all_color || initialSettings.theme_tab_active_bg || DEFAULT_THEME_SETTINGS.theme_tab_active_bg || "#06b6d4");
        setHoverBg(initialSettings.theme_hover_bg || DEFAULT_THEME_SETTINGS.theme_hover_bg || "rgba(6, 182, 212, 0.15)");
        setHoverText(initialSettings.theme_hover_text || DEFAULT_THEME_SETTINGS.theme_hover_text || "#06b6d4");
        setRadius(initialSettings.theme_radius || DEFAULT_THEME_SETTINGS.theme_radius || "rounded-lg");
        setFooterBgColor(initialSettings.theme_footer_bg_color || DEFAULT_THEME_SETTINGS.theme_footer_bg_color || "#1f242e");
        setFooterTextColor(initialSettings.theme_footer_text_color || DEFAULT_THEME_SETTINGS.theme_footer_text_color || "#94a3b8");
      }
      if (editingThemeId === preset.id) {
        setEditingThemeId(null);
      }
      return;
    }

    setActiveThemeName(preset.name);

    const isSelectingActiveLiveTheme = livePublishedThemeId === preset.id;
    if (isSelectingActiveLiveTheme && initialSettings) {
      // Restore exact published initial settings values
      setPrimaryColor(initialSettings.theme_primary_color || preset.primary);
      setSecondaryColor(initialSettings.theme_secondary_color || preset.secondary);
      setBgColor(initialSettings.theme_bg_color || preset.bg);
      setCardBgColor(initialSettings.theme_card_bg_color || preset.card);
      setAccentGradient(initialSettings.theme_accent_gradient || preset.id);
      setCardBorderColor(initialSettings.theme_card_border_color || preset.border || "rgba(255, 255, 255, 0.1)");
      setTextHeadingColor(initialSettings.theme_text_heading_color || preset.heading || "#ffffff");
      setTextBodyColor(initialSettings.theme_text_body_color || preset.body || "#94a3b8");
      setBtnPrimaryBg(initialSettings.theme_btn_primary_bg || preset.btnPrimaryBg || preset.primary);
      setBtnPrimaryText(initialSettings.theme_btn_primary_text || preset.btnPrimaryText || "#ffffff");
      setBtnSecondaryBg(initialSettings.theme_btn_secondary_bg || preset.btnSecondaryBg || "rgba(255, 255, 255, 0.05)");
      setBtnSecondaryText(initialSettings.theme_btn_secondary_text || preset.btnSecondaryText || "#ffffff");
      setTabActiveBg(initialSettings.theme_tab_active_bg || preset.tabActiveBg || preset.primary);
      setTabActiveText(initialSettings.theme_tab_active_text || preset.tabActiveText || "#ffffff");
      setViewAllColor(initialSettings.theme_view_all_color || initialSettings.theme_tab_active_bg || preset.viewAllColor || preset.tabActiveBg || preset.primary);
      setHoverBg(initialSettings.theme_hover_bg || preset.hoverBg || "rgba(6, 182, 212, 0.15)");
      setHoverText(initialSettings.theme_hover_text || preset.hoverText || preset.primary);
      setRadius(initialSettings.theme_radius || preset.radius || "rounded-lg");
      setFooterBgColor(initialSettings.theme_footer_bg_color || DEFAULT_THEME_SETTINGS.theme_footer_bg_color || "#1f242e");
      setFooterTextColor(initialSettings.theme_footer_text_color || DEFAULT_THEME_SETTINGS.theme_footer_text_color || "#94a3b8");
      return;
    }

    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setBgColor(preset.bg);
    setCardBgColor(preset.card);
    setAccentGradient(preset.id);

    if (preset.border) setCardBorderColor(preset.border);
    if (preset.heading) setTextHeadingColor(preset.heading);
    if (preset.body) setTextBodyColor(preset.body);
    if (preset.btnPrimaryBg) setBtnPrimaryBg(preset.btnPrimaryBg);
    if (preset.btnPrimaryText) setBtnPrimaryText(preset.btnPrimaryText);
    if (preset.btnSecondaryBg) setBtnSecondaryBg(preset.btnSecondaryBg);
    if (preset.btnSecondaryText) setBtnSecondaryText(preset.btnSecondaryText);
    if (preset.tabActiveBg) {
      setTabActiveBg(preset.tabActiveBg);
      setViewAllColor(preset.viewAllColor || preset.tabActiveBg);
    } else {
      setTabActiveBg(preset.primary);
      setViewAllColor(preset.viewAllColor || preset.primary);
    }
    if (preset.tabActiveText) setTabActiveText(preset.tabActiveText);
    if (preset.hoverBg) setHoverBg(preset.hoverBg);
    if (preset.hoverText) setHoverText(preset.hoverText);
    if (preset.radius) setRadius(preset.radius);
  };

  const handleToggleEditPreset = (preset: ThemePreset | CustomThemeItem) => {
    if (editingThemeId === preset.id) {
      setEditingThemeId(null);
    } else {
      setActiveThemeName(preset.name);
      setPrimaryColor(preset.primary);
      setSecondaryColor(preset.secondary);
      setAccentGradient(preset.id);
      setBgColor(preset.bg);
      setCardBgColor(preset.card);
      setCardBorderColor(preset.border || "rgba(255, 255, 255, 0.1)");
      setTextHeadingColor(preset.heading || "#ffffff");
      setTextBodyColor(preset.body || "#94a3b8");
      setBtnPrimaryBg(preset.btnPrimaryBg || preset.primary);
      setBtnPrimaryText(preset.btnPrimaryText || "#ffffff");
      setBtnSecondaryBg(preset.btnSecondaryBg || "rgba(255, 255, 255, 0.05)");
      setBtnSecondaryText(preset.btnSecondaryText || "#ffffff");
      const isLive = livePublishedThemeId === preset.id;
      const initialTabActiveBg = (isLive && initialSettings?.theme_tab_active_bg) ? initialSettings.theme_tab_active_bg : (preset.tabActiveBg || preset.primary);
      const initialViewAllColor = (isLive && (initialSettings?.theme_view_all_color || initialSettings?.theme_tab_active_bg)) ? (initialSettings.theme_view_all_color || initialSettings.theme_tab_active_bg) : (preset.viewAllColor || preset.tabActiveBg || preset.primary);
      setTabActiveBg(initialTabActiveBg);
      setTabActiveText(preset.tabActiveText || "#ffffff");
      setViewAllColor(initialViewAllColor);
      setHoverBg(preset.hoverBg || "rgba(6, 182, 212, 0.15)");
      setHoverText(preset.hoverText || preset.primary);
      setRadius(preset.radius || "rounded-lg");
      setFooterBgColor(preset.settings?.theme_footer_bg_color || (preset.category === "light" ? "#ffffff" : "#1f242e"));
      setFooterTextColor(preset.settings?.theme_footer_text_color || (preset.category === "light" ? "#475569" : "#94a3b8"));
      setEditingThemeId(preset.id);
    }
  };

  const handleSetDefaultTheme = async (preset: ThemePreset | CustomThemeItem) => {
    setDefaultThemeId(preset.id);
    localStorage.setItem("aether_default_theme_preset", preset.id);

    try {
      await adminApi.updateThemeSettings({
        ...initialSettings,
        theme_default_preset: preset.id,
        deleted_theme_ids: deletedThemeIds,
      });
      toast.success(`"${preset.name}" is now the default theme!`);
    } catch (err) {
      toast.success(`"${preset.name}" marked as default.`);
    }
  };

  // 1. Activate theme via switch (only one theme active at a time)
  const handleActivateTheme = async (preset: ThemePreset | CustomThemeItem) => {
    if (livePublishedThemeId === preset.id) {
      toast.info(`"${preset.name}" is already the active theme on your storefront.`);
      return;
    }

    setSaving(true);
    const isLight = preset.category === "light" || getHexLuminance(preset.bg) > 0.45;
    const payload: any = {
      ...initialSettings,
      theme_primary_color: preset.primary,
      theme_secondary_color: preset.secondary,
      theme_accent_gradient: preset.id,
      theme_bg_color: preset.bg,
      theme_card_bg_color: preset.card,
      theme_card_border_color: preset.border || (isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)"),
      theme_text_heading_color: preset.heading || (isLight ? "#0f172a" : "#ffffff"),
      theme_text_body_color: preset.body || (isLight ? "#475569" : "#94a3b8"),
      theme_btn_primary_bg: preset.btnPrimaryBg || preset.primary,
      theme_btn_primary_text: preset.btnPrimaryText || "#ffffff",
      theme_btn_secondary_bg: preset.btnSecondaryBg || (isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)"),
      theme_btn_secondary_text: preset.btnSecondaryText || (isLight ? "#0f172a" : "#ffffff"),
      theme_tab_active_bg: preset.tabActiveBg || preset.primary,
      theme_tab_active_text: preset.tabActiveText || (getHexLuminance(preset.tabActiveBg || preset.primary) > 0.5 ? "#0f172a" : "#ffffff"),
      theme_view_all_color: preset.viewAllColor || preset.tabActiveBg || preset.primary,
      theme_hover_bg: preset.hoverBg || "rgba(6, 182, 212, 0.15)",
      theme_hover_text: preset.hoverText || preset.primary,
      theme_radius: preset.radius || "rounded-lg",
      theme_footer_bg_color: preset.settings?.theme_footer_bg_color || (isLight ? "#f8fafc" : "#1f242e"),
      theme_footer_text_color: preset.settings?.theme_footer_text_color || (isLight ? "#475569" : "#94a3b8"),
      theme_default_preset: defaultThemeId,
      custom_themes: customThemes,
      deleted_theme_ids: deletedThemeIds,
    };

    try {
      const res = await adminApi.updateThemeSettings(payload);
      const updatedBaseline = {
        ...initialSettings,
        ...payload,
        ...(res?.settings || {}),
      };
      setInitialSettings(updatedBaseline);
      updateClientTheme(payload);

      setActiveThemeName(preset.name);
      setPrimaryColor(preset.primary);
      setSecondaryColor(preset.secondary);
      setAccentGradient(preset.id);
      setBgColor(preset.bg);
      setCardBgColor(preset.card);
      if (preset.border) setCardBorderColor(preset.border);
      if (preset.heading) setTextHeadingColor(preset.heading);
      if (preset.body) setTextBodyColor(preset.body);
      if (preset.btnPrimaryBg) setBtnPrimaryBg(preset.btnPrimaryBg);
      if (preset.btnPrimaryText) setBtnPrimaryText(preset.btnPrimaryText);
      if (preset.btnSecondaryBg) setBtnSecondaryBg(preset.btnSecondaryBg);
      if (preset.btnSecondaryText) setBtnSecondaryText(preset.btnSecondaryText);
      setTabActiveBg(preset.tabActiveBg || preset.primary);
      setTabActiveText(preset.tabActiveText || (getHexLuminance(preset.tabActiveBg || preset.primary) > 0.5 ? "#0f172a" : "#ffffff"));
      setViewAllColor(preset.viewAllColor || preset.tabActiveBg || preset.primary);
      if (preset.hoverBg) setHoverBg(preset.hoverBg);
      if (preset.hoverText) setHoverText(preset.hoverText);
      if (preset.radius) setRadius(preset.radius);

      toast.success(`Theme "${preset.name}" is now active on your storefront!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to activate theme.");
    } finally {
      setSaving(false);
    }
  };

  // 2. Confirm and save changes directly to the theme being edited (without creating a duplicate theme)
  const handleConfirmSaveThemeChanges = async () => {
    if (!editingThemeId) return;
    setSaving(true);

    try {
      const existingTheme = allAvailableThemes.find((t) => t.id === editingThemeId);
      const isLight = getHexLuminance(bgColor) > 0.45;

      const updatedTheme: CustomThemeItem = {
        id: editingThemeId,
        name: activeThemeName.trim() || existingTheme?.name || "Custom Theme",
        category: isLight ? "light" : "dark",
        tagline: existingTheme?.tagline || `Custom ${isLight ? "light" : "dark"} palette`,
        primary: primaryColor,
        secondary: secondaryColor,
        bg: bgColor,
        card: cardBgColor,
        border: cardBorderColor,
        heading: textHeadingColor,
        body: textBodyColor,
        btnPrimaryBg: btnPrimaryBg,
        btnPrimaryText: btnPrimaryText,
        btnSecondaryBg: btnSecondaryBg,
        btnSecondaryText: btnSecondaryText,
        tabActiveBg: tabActiveBg,
        tabActiveText: tabActiveText || (getHexLuminance(tabActiveBg) > 0.5 ? "#0f172a" : "#ffffff"),
        viewAllColor: tabActiveBg,
        hoverBg: hoverBg,
        hoverText: hoverText,
        radius: radius,
        settings: {
          theme_footer_bg_color: footerBgColor,
          theme_footer_text_color: footerTextColor,
        },
        isCustom: true,
      };

      let updatedCustomThemes = [...customThemes];
      const existingIdx = updatedCustomThemes.findIndex((c) => c.id === editingThemeId);
      if (existingIdx >= 0) {
        updatedCustomThemes[existingIdx] = updatedTheme;
      } else {
        updatedCustomThemes.push(updatedTheme);
      }

      const isCurrentActive =
        livePublishedThemeId === editingThemeId ||
        accentGradient === editingThemeId ||
        initialSettings?.theme_accent_gradient === editingThemeId ||
        !livePublishedThemeId ||
        livePublishedThemeId === "emerald-teal";

      const payload: any = {
        ...initialSettings,
        custom_themes: updatedCustomThemes,
        deleted_theme_ids: deletedThemeIds,
      };

      if (isCurrentActive) {
        payload.theme_primary_color = primaryColor;
        payload.theme_secondary_color = secondaryColor;
        payload.theme_accent_gradient = editingThemeId;
        payload.theme_bg_color = bgColor;
        payload.theme_card_bg_color = cardBgColor;
        payload.theme_card_border_color = cardBorderColor;
        payload.theme_text_heading_color = textHeadingColor;
        payload.theme_text_body_color = textBodyColor;
        payload.theme_btn_primary_bg = btnPrimaryBg;
        payload.theme_btn_primary_text = btnPrimaryText;
        payload.theme_btn_secondary_bg = btnSecondaryBg;
        payload.theme_btn_secondary_text = btnSecondaryText;
        payload.theme_tab_active_bg = tabActiveBg;
        payload.theme_tab_active_text = tabActiveText || (getHexLuminance(tabActiveBg) > 0.5 ? "#0f172a" : "#ffffff");
        payload.theme_view_all_color = tabActiveBg;
        payload.theme_hover_bg = hoverBg;
        payload.theme_hover_text = hoverText;
        payload.theme_radius = radius;
        payload.theme_footer_bg_color = footerBgColor;
        payload.theme_footer_text_color = footerTextColor;
      }

      const res = await adminApi.updateThemeSettings(payload);
      setInitialSettings(res.settings);
      setCustomThemes(updatedCustomThemes);
      if (isCurrentActive) {
        updateClientTheme(payload);
      }

      setEditingThemeId(null);
      toast.success(`Theme "${updatedTheme.name}" updated and saved successfully!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save theme changes.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Delete button on all themes
  const handleDeleteTheme = async (preset: ThemePreset | CustomThemeItem) => {
    if (allAvailableThemes.length <= 1) {
      toast.error("You cannot delete the only remaining theme.");
      return;
    }

    setSaving(true);
    try {
      const newDeletedIds = Array.from(new Set([...deletedThemeIds, preset.id]));
      const newCustomThemes = customThemes.filter((c) => c.id !== preset.id);

      let payloadUpdate: any = {
        ...initialSettings,
        custom_themes: newCustomThemes,
        deleted_theme_ids: newDeletedIds,
      };

      if (livePublishedThemeId === preset.id) {
        const fallbackTheme = allAvailableThemes.find((t) => t.id !== preset.id) || BUILTIN_PRESETS[0];
        const isLight = fallbackTheme.category === "light" || getHexLuminance(fallbackTheme.bg) > 0.45;

        payloadUpdate = {
          ...payloadUpdate,
          theme_primary_color: fallbackTheme.primary,
          theme_secondary_color: fallbackTheme.secondary,
          theme_accent_gradient: fallbackTheme.id,
          theme_bg_color: fallbackTheme.bg,
          theme_card_bg_color: fallbackTheme.card,
          theme_card_border_color: fallbackTheme.border || (isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)"),
          theme_text_heading_color: fallbackTheme.heading || (isLight ? "#0f172a" : "#ffffff"),
          theme_text_body_color: fallbackTheme.body || (isLight ? "#475569" : "#94a3b8"),
          theme_btn_primary_bg: fallbackTheme.btnPrimaryBg || fallbackTheme.primary,
          theme_btn_primary_text: fallbackTheme.btnPrimaryText || "#ffffff",
          theme_btn_secondary_bg: fallbackTheme.btnSecondaryBg || (isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)"),
          theme_btn_secondary_text: fallbackTheme.btnSecondaryText || (isLight ? "#0f172a" : "#ffffff"),
          theme_tab_active_bg: fallbackTheme.tabActiveBg || fallbackTheme.primary,
          theme_tab_active_text: fallbackTheme.tabActiveText || "#ffffff",
          theme_hover_bg: fallbackTheme.hoverBg || "rgba(6, 182, 212, 0.15)",
          theme_hover_text: fallbackTheme.hoverText || fallbackTheme.primary,
          theme_radius: fallbackTheme.radius || "rounded-lg",
        };
        updateClientTheme(payloadUpdate);
      }

      const res = await adminApi.updateThemeSettings(payloadUpdate);
      setInitialSettings(res.settings);
      setDeletedThemeIds(newDeletedIds);
      setCustomThemes(newCustomThemes);

      if (editingThemeId === preset.id) {
        setEditingThemeId(null);
      }

      toast.success(`Theme "${preset.name}" deleted.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete theme.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      toast.error("Please enter a name for the new theme.");
      return;
    }

    const isLight = newThemeType === "light";
    const newTheme: CustomThemeItem = {
      id: `custom-${Date.now()}`,
      name: newThemeName.trim(),
      category: newThemeType,
      tagline: `Custom ${newThemeType} theme created by ${adminUser?.name || "Administrator"}`,
      primary: newThemePrimary,
      secondary: newThemeSecondary,
      bg: isLight ? "#ffffff" : "#090a0f",
      card: isLight ? "#f8fafc" : "#0c101d",
      border: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)",
      heading: isLight ? "#0f172a" : "#ffffff",
      body: isLight ? "#475569" : "#94a3b8",
      btnPrimaryBg: newThemePrimary,
      btnPrimaryText: isLight && getHexLuminance(newThemePrimary) > 0.5 ? "#0f172a" : "#ffffff",
      btnSecondaryBg: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
      btnSecondaryText: isLight ? "#0f172a" : "#ffffff",
      tabActiveBg: newThemePrimary,
      tabActiveText: isLight && getHexLuminance(newThemePrimary) > 0.5 ? "#0f172a" : "#ffffff",
      hoverBg: isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.08)",
      hoverText: newThemePrimary,
      radius: "rounded-lg",
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    const updated = [...customThemes, newTheme];
    setCustomThemes(updated);
    setCreateModalOpen(false);
    setNewThemeName("");
    handleToggleEditPreset(newTheme);
    toast.success(`Theme "${newTheme.name}" created! You can now customize and save it.`);
  };

  const isDirty = useMemo(() => {
    if (!initialSettings) return false;

    const norm = (val: any) => (val === undefined || val === null ? "" : String(val).trim().toLowerCase());

    const initPrimary = norm(initialSettings.theme_primary_color || DEFAULT_THEME_SETTINGS.theme_primary_color);
    const currPrimary = norm(primaryColor);

    const initSecondary = norm(initialSettings.theme_secondary_color || DEFAULT_THEME_SETTINGS.theme_secondary_color);
    const currSecondary = norm(secondaryColor);

    const initGradient = norm(initialSettings.theme_accent_gradient || DEFAULT_THEME_SETTINGS.theme_accent_gradient);
    const currGradient = norm(accentGradient);

    const initBg = norm(initialSettings.theme_bg_color || DEFAULT_THEME_SETTINGS.theme_bg_color);
    const currBg = norm(bgColor);

    const initCard = norm(initialSettings.theme_card_bg_color || DEFAULT_THEME_SETTINGS.theme_card_bg_color);
    const currCard = norm(cardBgColor);

    const initBorder = norm(initialSettings.theme_card_border_color || DEFAULT_THEME_SETTINGS.theme_card_border_color);
    const currBorder = norm(cardBorderColor);

    const initHeading = norm(initialSettings.theme_text_heading_color || DEFAULT_THEME_SETTINGS.theme_text_heading_color);
    const currHeading = norm(textHeadingColor);

    const initBody = norm(initialSettings.theme_text_body_color || DEFAULT_THEME_SETTINGS.theme_text_body_color);
    const currBody = norm(textBodyColor);

    const initBtnPrimaryBg = norm(initialSettings.theme_btn_primary_bg || DEFAULT_THEME_SETTINGS.theme_btn_primary_bg);
    const currBtnPrimaryBg = norm(btnPrimaryBg);

    const initBtnPrimaryText = norm(initialSettings.theme_btn_primary_text || DEFAULT_THEME_SETTINGS.theme_btn_primary_text);
    const currBtnPrimaryText = norm(btnPrimaryText);

    const initBtnSecondaryBg = norm(initialSettings.theme_btn_secondary_bg || DEFAULT_THEME_SETTINGS.theme_btn_secondary_bg);
    const currBtnSecondaryBg = norm(btnSecondaryBg);

    const initBtnSecondaryText = norm(initialSettings.theme_btn_secondary_text || DEFAULT_THEME_SETTINGS.theme_btn_secondary_text);
    const currBtnSecondaryText = norm(btnSecondaryText);

    const initTabActiveBg = norm(initialSettings.theme_tab_active_bg || DEFAULT_THEME_SETTINGS.theme_tab_active_bg);
    const currTabActiveBg = norm(tabActiveBg);

    const initTabActiveText = norm(initialSettings.theme_tab_active_text || DEFAULT_THEME_SETTINGS.theme_tab_active_text);
    const currTabActiveText = norm(tabActiveText);

    const initHoverBg = norm(initialSettings.theme_hover_bg || DEFAULT_THEME_SETTINGS.theme_hover_bg);
    const currHoverBg = norm(hoverBg);

    const initHoverText = norm(initialSettings.theme_hover_text || DEFAULT_THEME_SETTINGS.theme_hover_text);
    const currHoverText = norm(hoverText);

    const initRadius = norm(initialSettings.theme_radius || DEFAULT_THEME_SETTINGS.theme_radius);
    const currRadius = norm(radius);

    const initFooterBg = norm(initialSettings.theme_footer_bg_color || DEFAULT_THEME_SETTINGS.theme_footer_bg_color || "#1f242e");
    const currFooterBg = norm(footerBgColor);

    const initFooterText = norm(initialSettings.theme_footer_text_color || DEFAULT_THEME_SETTINGS.theme_footer_text_color || "#94a3b8");
    const currFooterText = norm(footerTextColor);

    const initDefaultPreset = norm(initialSettings.theme_default_preset || "cyan-indigo");
    const currDefaultPreset = norm(defaultThemeId);

    const initCustomThemes = JSON.stringify(initialSettings.custom_themes || []);
    const currCustomThemes = JSON.stringify(customThemes || []);

    const initDeletedIds = JSON.stringify(initialSettings.deleted_theme_ids || []);
    const currDeletedIds = JSON.stringify(deletedThemeIds || []);

    return (
      currPrimary !== initPrimary ||
      currSecondary !== initSecondary ||
      currGradient !== initGradient ||
      currBg !== initBg ||
      currCard !== initCard ||
      currBorder !== initBorder ||
      currHeading !== initHeading ||
      currBody !== initBody ||
      currBtnPrimaryBg !== initBtnPrimaryBg ||
      currBtnPrimaryText !== initBtnPrimaryText ||
      currBtnSecondaryBg !== initBtnSecondaryBg ||
      currBtnSecondaryText !== initBtnSecondaryText ||
      currTabActiveBg !== initTabActiveBg ||
      currTabActiveText !== initTabActiveText ||
      currHoverBg !== initHoverBg ||
      currHoverText !== initHoverText ||
      currRadius !== initRadius ||
      currFooterBg !== initFooterBg ||
      currFooterText !== initFooterText ||
      currDefaultPreset !== initDefaultPreset ||
      currCustomThemes !== initCustomThemes ||
      currDeletedIds !== initDeletedIds
    );
  }, [
    initialSettings,
    primaryColor,
    secondaryColor,
    accentGradient,
    bgColor,
    cardBgColor,
    cardBorderColor,
    textHeadingColor,
    textBodyColor,
    btnPrimaryBg,
    btnPrimaryText,
    btnSecondaryBg,
    btnSecondaryText,
    tabActiveBg,
    tabActiveText,
    hoverBg,
    hoverText,
    radius,
    footerBgColor,
    footerTextColor,
    defaultThemeId,
    customThemes,
    deletedThemeIds,
  ]);

  const handleSaveTheme = async () => {
    if (!isDirty) {
      toast.info("No changes to publish.");
      return;
    }
    setSaving(true);

    const payload = {
      ...initialSettings,
      theme_primary_color: primaryColor,
      theme_secondary_color: secondaryColor,
      theme_accent_gradient: accentGradient,
      theme_bg_color: bgColor,
      theme_card_bg_color: cardBgColor,
      theme_card_border_color: cardBorderColor,
      theme_text_heading_color: textHeadingColor,
      theme_text_body_color: textBodyColor,
      theme_btn_primary_bg: btnPrimaryBg,
      theme_btn_primary_text: btnPrimaryText,
      theme_btn_secondary_bg: btnSecondaryBg,
      theme_btn_secondary_text: btnSecondaryText,
      theme_tab_active_bg: tabActiveBg,
      theme_tab_active_text: tabActiveText,
      theme_hover_bg: hoverBg,
      theme_hover_text: hoverText,
      theme_radius: radius,
      theme_footer_bg_color: footerBgColor,
      theme_footer_text_color: footerTextColor,
      theme_default_preset: defaultThemeId,
      custom_themes: customThemes,
      deleted_theme_ids: deletedThemeIds,
    };

    try {
      const res = await adminApi.updateThemeSettings(payload);
      const updatedBaseline = {
        ...initialSettings,
        ...payload,
        ...(res?.settings || {}),
      };
      setInitialSettings(updatedBaseline);
      updateClientTheme(payload);
      toast.success("Theme & Appearance settings published successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update theme.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (!isDirty || !initialSettings) return;
    const s = initialSettings;
    if (s.theme_default_preset) setDefaultThemeId(s.theme_default_preset);
    setPrimaryColor(s.theme_primary_color || DEFAULT_THEME_SETTINGS.theme_primary_color);
    setSecondaryColor(s.theme_secondary_color || DEFAULT_THEME_SETTINGS.theme_secondary_color);
    setAccentGradient(s.theme_accent_gradient || DEFAULT_THEME_SETTINGS.theme_accent_gradient);
    setBgColor(s.theme_bg_color || DEFAULT_THEME_SETTINGS.theme_bg_color);
    setCardBgColor(s.theme_card_bg_color || DEFAULT_THEME_SETTINGS.theme_card_bg_color);
    setCardBorderColor(s.theme_card_border_color || DEFAULT_THEME_SETTINGS.theme_card_border_color || "rgba(255, 255, 255, 0.1)");
    setTextHeadingColor(s.theme_text_heading_color || DEFAULT_THEME_SETTINGS.theme_text_heading_color || "#ffffff");
    setTextBodyColor(s.theme_text_body_color || DEFAULT_THEME_SETTINGS.theme_text_body_color || "#94a3b8");
    setBtnPrimaryBg(s.theme_btn_primary_bg || DEFAULT_THEME_SETTINGS.theme_btn_primary_bg || "#06b6d4");
    setBtnPrimaryText(s.theme_btn_primary_text || DEFAULT_THEME_SETTINGS.theme_btn_primary_text || "#ffffff");
    setBtnSecondaryBg(s.theme_btn_secondary_bg || DEFAULT_THEME_SETTINGS.theme_btn_secondary_bg || "rgba(255, 255, 255, 0.05)");
    setBtnSecondaryText(s.theme_btn_secondary_text || DEFAULT_THEME_SETTINGS.theme_btn_secondary_text || "#ffffff");
    setTabActiveBg(s.theme_tab_active_bg || DEFAULT_THEME_SETTINGS.theme_tab_active_bg || "#06b6d4");
    setTabActiveText(s.theme_tab_active_text || DEFAULT_THEME_SETTINGS.theme_tab_active_text || "#ffffff");
    setViewAllColor(s.theme_view_all_color || s.theme_tab_active_bg || "#06b6d4");
    setHoverBg(s.theme_hover_bg || DEFAULT_THEME_SETTINGS.theme_hover_bg || "rgba(6, 182, 212, 0.15)");
    setHoverText(s.theme_hover_text || DEFAULT_THEME_SETTINGS.theme_hover_text || "#06b6d4");
    setRadius(s.theme_radius || DEFAULT_THEME_SETTINGS.theme_radius || "rounded-lg");
    setFooterBgColor(s.theme_footer_bg_color || DEFAULT_THEME_SETTINGS.theme_footer_bg_color || "#1f242e");
    setFooterTextColor(s.theme_footer_text_color || DEFAULT_THEME_SETTINGS.theme_footer_text_color || "#94a3b8");
    setCustomThemes(Array.isArray(s.custom_themes) ? s.custom_themes : []);
    setDeletedThemeIds(Array.isArray(s.deleted_theme_ids) ? s.deleted_theme_ids : []);
    setEditingThemeId(null);
    toast.info("Theme changes discarded.");
  };

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

  // Ensure any legacy custom active settings in database are never lost unless explicitly deleted
  const activeCustomSynthesizedTheme: CustomThemeItem | null = useMemo(() => {
    if (!initialSettings || !initialSettings.theme_primary_color) return null;
    if (
      deletedThemeIds.includes("active-custom-live") ||
      (initialSettings.theme_accent_gradient && deletedThemeIds.includes(initialSettings.theme_accent_gradient))
    ) {
      return null;
    }

    const isBuiltin = BUILTIN_PRESETS.some(
      (b) =>
        b.id === initialSettings.theme_accent_gradient ||
        (b.primary?.toLowerCase() === initialSettings.theme_primary_color?.toLowerCase() &&
         b.secondary?.toLowerCase() === initialSettings.theme_secondary_color?.toLowerCase())
    );
    const isSavedCustom = customThemes.some(
      (c) =>
        c.id === initialSettings.theme_accent_gradient ||
        (c.primary?.toLowerCase() === initialSettings.theme_primary_color?.toLowerCase() &&
         c.secondary?.toLowerCase() === initialSettings.theme_secondary_color?.toLowerCase())
    );
    if (!isBuiltin && !isSavedCustom) {
      const isLight = getHexLuminance(initialSettings.theme_bg_color || "#090a0f") > 0.45;
      return {
        id: initialSettings.theme_accent_gradient || "active-custom-live",
        name: "Current Custom Active Theme",
        category: isLight ? "light" : "dark",
        tagline: "Your active storefront palette loaded directly from the live database",
        primary: initialSettings.theme_primary_color,
        secondary: initialSettings.theme_secondary_color || initialSettings.theme_primary_color,
        bg: initialSettings.theme_bg_color || (isLight ? "#ffffff" : "#090a0f"),
        card: initialSettings.theme_card_bg_color || (isLight ? "#f8fafc" : "#0c101d"),
        border: initialSettings.theme_card_border_color,
        heading: initialSettings.theme_text_heading_color,
        body: initialSettings.theme_text_body_color,
        btnPrimaryBg: initialSettings.theme_btn_primary_bg,
        btnPrimaryText: initialSettings.theme_btn_primary_text,
        btnSecondaryBg: initialSettings.theme_btn_secondary_bg,
        btnSecondaryText: initialSettings.theme_btn_secondary_text,
        tabActiveBg: initialSettings.theme_tab_active_bg,
        tabActiveText: initialSettings.theme_tab_active_text,
        viewAllColor: initialSettings.theme_view_all_color || initialSettings.theme_tab_active_bg,
        hoverBg: initialSettings.theme_hover_bg,
        hoverText: initialSettings.theme_hover_text,
        radius: initialSettings.theme_radius,
        isCustom: true,
      };
    }
    return null;
  }, [initialSettings, customThemes, deletedThemeIds]);

  const allAvailableThemes = useMemo(() => {
    const customMap = new Map<string, CustomThemeItem>();
    for (const c of customThemes) {
      customMap.set(c.id, c);
    }

    const list: (ThemePreset | CustomThemeItem)[] = [];

    // Builtin presets (with custom overrides applied, filtered out if deleted)
    for (const b of BUILTIN_PRESETS) {
      if (deletedThemeIds.includes(b.id)) continue;
      if (customMap.has(b.id)) {
        const override = customMap.get(b.id)!;
        list.push({ ...b, ...override, isCustom: false });
        customMap.delete(b.id);
      } else {
        list.push({ ...b, isCustom: false });
      }
    }

    // Custom themes
    for (const [, c] of customMap) {
      if (!deletedThemeIds.includes(c.id)) {
        list.push({ ...c, isCustom: true });
      }
    }

    // Synthesized legacy active theme if not already present
    if (activeCustomSynthesizedTheme && !deletedThemeIds.includes(activeCustomSynthesizedTheme.id)) {
      const alreadyHas = list.some(
        (t) =>
          t.id === activeCustomSynthesizedTheme.id ||
          (t.primary?.toLowerCase() === activeCustomSynthesizedTheme.primary?.toLowerCase() &&
           t.secondary?.toLowerCase() === activeCustomSynthesizedTheme.secondary?.toLowerCase())
      );
      if (!alreadyHas) {
        list.unshift(activeCustomSynthesizedTheme);
      }
    }

    return list;
  }, [customThemes, deletedThemeIds, activeCustomSynthesizedTheme]);

  // Determine which theme is actually LIVE on the customer-facing frontend right now
  const livePublishedThemeId = useMemo(() => {
    if (!initialSettings) return "cyan-indigo";
    if (initialSettings.theme_accent_gradient) {
      const match = allAvailableThemes.find((p) => p.id === initialSettings.theme_accent_gradient);
      if (match) return match.id;
    }
    const matchByColors = allAvailableThemes.find(
      (p) =>
        p.primary?.toLowerCase() === initialSettings.theme_primary_color?.toLowerCase() &&
        p.secondary?.toLowerCase() === initialSettings.theme_secondary_color?.toLowerCase()
    );
    if (matchByColors) return matchByColors.id;
    return activeCustomSynthesizedTheme ? activeCustomSynthesizedTheme.id : (allAvailableThemes[0]?.id || "cyan-indigo");
  }, [initialSettings, allAvailableThemes, activeCustomSynthesizedTheme]);

  const displayedThemes = allAvailableThemes.filter((p) => {
    if (presetFilter === "all") return true;
    if (presetFilter === "custom") return p.isCustom;
    return p.category === presetFilter;
  });

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading Theme Engine...
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
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Theme & Appearance</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure color palettes, design tokens, geometry, and live themes</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live Preview Toggle Switch */}
          <button
            type="button"
            onClick={togglePreview}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showPreview 
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                : "bg-white/5 text-slate-400 hover:text-white border-white/10"
            }`}
          >
            {showPreview ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Preview: {showPreview ? "ON" : "OFF"}</span>
          </button>

          {/* Create Theme Button */}
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Theme</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Full-Width or Responsive Split-Pane */}
      <div className={`grid grid-cols-1 ${showPreview ? "lg:grid-cols-12 gap-8" : "gap-6"}`}>
        
        {/* Left Column: Configuration Forms */}
        <div className={`space-y-6 ${showPreview ? "lg:col-span-7" : "w-full"}`}>
          
          {/* 1. Theme Presets Grid */}
          <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Curated Themes & Presets</h3>
                <span className="text-[11px] text-slate-500 font-bold ml-1">({displayedThemes.length} available)</span>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px]">
                {(["all", "dark", "light", "custom"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPresetFilter(cat)}
                    className={`px-2 py-0.5 rounded-md font-bold uppercase transition-all cursor-pointer ${
                      presetFilter === cat ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayedThemes.map((preset) => {
                const isLiveActive = livePublishedThemeId === preset.id;
                const isDraftSelected = accentGradient === preset.id || activeThemeName === preset.name;
                const isDefault = defaultThemeId === preset.id;

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between gap-3 ${
                      isLiveActive
                        ? "bg-emerald-500/[0.04] border-emerald-500/40 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                        : isDraftSelected
                        ? "bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Top Row: Switch, Swatch dots, Theme Title, and Badges/Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* 1. Theme Active Toggle Switch */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivateTheme(preset);
                          }}
                          className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isLiveActive ? "bg-emerald-500 shadow-sm shadow-emerald-500/40" : "bg-white/15 hover:bg-white/25"
                          }`}
                          title={isLiveActive ? "Active storefront theme" : "Click switch to activate this theme"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out my-auto ${
                              isLiveActive ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>

                        <div className="flex items-center shrink-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm -ml-1.5"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>

                        <span className="text-xs font-bold text-white truncate" title={preset.name}>
                          {preset.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Live Active on Storefront Indicator */}
                        {isLiveActive && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                            <span>Active</span>
                          </span>
                        )}

                        {/* Selected for draft/editing */}
                        {!isLiveActive && isDraftSelected && (
                          <span className="inline-flex items-center text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                            Draft
                          </span>
                        )}

                        {/* Default Theme Badge */}
                        {isDefault && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 shrink-0 shadow-sm" title="Default Theme">
                            <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                            <span>Default</span>
                          </span>
                        )}

                        {/* 4. Delete button on ALL themes (icon-only) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTheme(preset);
                          }}
                          className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer shrink-0"
                          title={`Delete theme "${preset.name}"`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Middle: Tagline */}
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{preset.tagline}</p>

                    {/* Bottom Row: Actions (Category, Make Default & Edit) */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 shrink-0">
                          {preset.category}
                        </span>

                        {!isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefaultTheme(preset);
                            }}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white/5 hover:bg-amber-500/15 text-slate-400 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Set as Default Theme"
                          >
                            <Star className="w-2.5 h-2.5" />
                            <span>Make Default</span>
                          </button>
                        )}
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleEditPreset(preset);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          editingThemeId === preset.id
                            ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                            : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-amber-400/40"
                        }`}
                        title="Open theme editor in right sidebar"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Live Storefront Preview (When Preview is ON) */}
        {showPreview && (
          <div className="lg:col-span-5">
            <LiveStorefrontPreview
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              bgColor={bgColor}
              cardBgColor={cardBgColor}
              cardBorderColor={cardBorderColor}
              textHeadingColor={textHeadingColor}
              textBodyColor={textBodyColor}
              btnPrimaryBg={btnPrimaryBg}
              btnPrimaryText={btnPrimaryText}
              footerBgColor={footerBgColor}
              footerTextColor={footerTextColor}
              radius={radius}
            />
          </div>
        )}

      </div>

      {/* 3. Right-Side Sidebar Drawer for Theme Editing */}
      {editingThemeId !== null && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingThemeId(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-[#0b0e17] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
              
              {/* Drawer Sticky Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#0e121e]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        Edit Theme: {activeThemeName}
                      </h3>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 shrink-0">
                        {getHexLuminance(bgColor) > 0.45 ? "Light" : "Dark"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      Customize palette colors, design tokens, and geometry
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingThemeId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 hover-scrollbar">
                
                {/* Theme Name input */}
                <div className="p-4 rounded-xl bg-[#0f131f] border border-white/10 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Theme Name</label>
                  <input
                    type="text"
                    value={activeThemeName}
                    onChange={(e) => setActiveThemeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                    placeholder="Theme Name"
                  />
                </div>

                {/* Core Color Palette */}
                <div className="p-5 rounded-xl bg-[#0f131f] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-white">Core Color Palette</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Accent */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">Primary Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Secondary Accent */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">Secondary Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Store Background */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">Store Background (Canvas)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor.startsWith("#") ? bgColor : "#090a0f"}
                          onChange={(e) => {
                            setBgColor(e.target.value);
                            const auto = getAutoSynchronizedTokens(e.target.value, primaryColor);
                            if (auto.theme_card_bg_color) setCardBgColor(auto.theme_card_bg_color);
                            if (auto.theme_text_heading_color) setTextHeadingColor(auto.theme_text_heading_color);
                            if (auto.theme_text_body_color) setTextBodyColor(auto.theme_text_body_color);
                          }}
                          className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Card Background */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">Card & Modal Surface</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={cardBgColor.startsWith("#") ? cardBgColor : "#0c101d"}
                          onChange={(e) => setCardBgColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={cardBgColor}
                          onChange={(e) => setCardBgColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Color Tokens Toggle */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedColors(!showAdvancedColors)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showAdvancedColors ? "Hide" : "Show"} Advanced Design Tokens</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAdvancedColors ? "rotate-90" : ""}`} />
                    </button>
                  </div>

                  {/* Advanced Token Accordion */}
                  {showAdvancedColors && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 block">Text Heading Color</label>
                        <input
                          type="text"
                          value={textHeadingColor}
                          onChange={(e) => setTextHeadingColor(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 block">Body Text Color</label>
                        <input
                          type="text"
                          value={textBodyColor}
                          onChange={(e) => setTextBodyColor(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 block">Primary Button Background</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={btnPrimaryBg.startsWith("#") ? btnPrimaryBg : (primaryColor.startsWith("#") ? primaryColor : "#06b6d4")}
                            onChange={(e) => setBtnPrimaryBg(e.target.value)}
                            className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={btnPrimaryBg}
                            onChange={(e) => setBtnPrimaryBg(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 block">Primary Button Text</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={btnPrimaryText.startsWith("#") ? btnPrimaryText : "#ffffff"}
                            onChange={(e) => setBtnPrimaryText(e.target.value)}
                            className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={btnPrimaryText}
                            onChange={(e) => setBtnPrimaryText(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 block">Active Tabs, Badges &amp; &ldquo;View All&rdquo; Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tabActiveBg.startsWith("#") ? tabActiveBg : (primaryColor.startsWith("#") ? primaryColor : "#06b6d4")}
                            onChange={(e) => {
                              setTabActiveBg(e.target.value);
                              setViewAllColor(e.target.value);
                            }}
                            className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={tabActiveBg}
                            onChange={(e) => {
                              setTabActiveBg(e.target.value);
                              setViewAllColor(e.target.value);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                            placeholder="#005826"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 block">Live Synchronized Preview</label>
                        <div className="flex items-center gap-2.5 h-8 px-2.5 rounded-lg bg-white/5 border border-white/10">
                          <div
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold"
                            style={{
                              backgroundColor: tabActiveBg || primaryColor,
                              color: getHexLuminance(tabActiveBg || primaryColor) > 0.5 ? "#0f172a" : "#ffffff",
                            }}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Featured</span>
                          </div>

                          <div
                            className="text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1"
                            style={{ color: tabActiveBg || primaryColor }}
                          >
                            <span>View All</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Surface & Color Studio */}
                <div className="p-5 rounded-xl bg-[#0f131f] border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <div>
                        <h3 className="text-sm font-bold text-white">Footer Surface & Color Studio</h3>
                        <p className="text-[11px] text-slate-400">
                          Customize the storefront footer tone and contrast.
                        </p>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[10px] font-semibold border border-cyan-500/20 whitespace-nowrap">
                      Reassurance & Trust
                    </span>
                  </div>

                  {/* Curated Presets */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">Curated Ash & Surface Presets</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { name: "Slate Ash", bg: "#1f242e", text: "#94a3b8", desc: "Soothing Ash" },
                        { name: "Deep Charcoal", bg: "#161922", text: "#94a3b8", desc: "Midnight Ash" },
                        { name: "Cool Slate", bg: "#1e293b", text: "#cbd5e1", desc: "Slate Grey" },
                        { name: "Warm Ash", bg: "#262a33", text: "#a1a1aa", desc: "Studio Warm" },
                        { name: "Crisp White", bg: "#ffffff", text: "#475569", desc: "Clean Light" },
                        { name: "Pure Obsidian", bg: "#07080c", text: "#94a3b8", desc: "Deep Black" },
                      ].map((preset) => {
                        const isSelected = footerBgColor.toLowerCase() === preset.bg.toLowerCase();
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setFooterBgColor(preset.bg);
                              setFooterTextColor(preset.text);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                              isSelected
                                ? "bg-cyan-500/10 border-cyan-400 text-white shadow-sm"
                                : "bg-white/5 border-white/10 hover:border-white/20 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="w-4 h-4 rounded-full border border-white/30 shadow-inner shrink-0"
                                style={{ backgroundColor: preset.bg }}
                              />
                              {isSelected && (
                                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[9px] font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="text-[11px] font-bold block leading-tight truncate">{preset.name}</span>
                              <span className="text-[9px] text-slate-400 block truncate">{preset.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-300">Footer Background Surface</label>
                        <span className="text-[10px] text-slate-400 font-mono">{footerBgColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={footerBgColor.startsWith("#") ? footerBgColor : "#1f242e"}
                          onChange={(e) => setFooterBgColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={footerBgColor}
                          onChange={(e) => setFooterBgColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-300">Footer Text & Links Color</label>
                        <button
                          type="button"
                          onClick={() => {
                            const isLight = getHexLuminance(footerBgColor) > 0.45;
                            setFooterTextColor(isLight ? "#475569" : "#94a3b8");
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                        >
                          Auto Contrast
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={footerTextColor.startsWith("#") ? footerTextColor : "#94a3b8"}
                          onChange={(e) => setFooterTextColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={footerTextColor}
                          onChange={(e) => setFooterTextColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corner Radius & Geometry */}
                <div className="p-5 rounded-xl bg-[#0f131f] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Corner Radius & Geometry</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { label: "Square (0px)", value: "rounded-none" },
                      { label: "Subtle (6px)", value: "rounded-md" },
                      { label: "Default (8px)", value: "rounded-lg" },
                      { label: "Smooth (12px)", value: "rounded-xl" },
                      { label: "Pill (16px)", value: "rounded-2xl" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRadius(opt.value)}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          radius === opt.value
                            ? "bg-amber-500/15 border-amber-400 text-amber-300 shadow-sm"
                            : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Sticky Footer: Cancel and Confirm & Save Changes */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-[#0c101d] shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingThemeId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSaveThemeChanges}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{saving ? "Saving Changes..." : "Confirm & Save Changes"}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Create Theme Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-md bg-[#0d111d] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Create Custom Theme</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Theme Name</label>
                <input
                  type="text"
                  required
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="e.g. Nordic Crimson"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Base Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewThemeType("dark")}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      newThemeType === "dark"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-white/5 text-slate-400 border-white/10"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark Theme</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewThemeType("light")}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      newThemeType === "light"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-white/5 text-slate-400 border-white/10"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light Theme</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Primary Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newThemePrimary}
                      onChange={(e) => setNewThemePrimary(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={newThemePrimary}
                      onChange={(e) => setNewThemePrimary(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Secondary Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newThemeSecondary}
                      onChange={(e) => setNewThemeSecondary(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={newThemeSecondary}
                      onChange={(e) => setNewThemeSecondary(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTheme}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer"
              >
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Contextual Save Bar */}
      <AdminSaveBar
        isDirty={isDirty}
        isSaving={saving}
        onSave={handleSaveTheme}
        onDiscard={handleDiscardChanges}
        saveLabel="Publish Changes"
        message="Unsaved theme changes"
      />

    </div>
  );
}
