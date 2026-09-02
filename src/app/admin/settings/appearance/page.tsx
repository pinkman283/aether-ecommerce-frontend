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
  Star
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
  const [hoverBg, setHoverBg] = useState(DEFAULT_THEME_SETTINGS.theme_hover_bg || "rgba(6, 182, 212, 0.15)");
  const [hoverText, setHoverText] = useState(DEFAULT_THEME_SETTINGS.theme_hover_text || "#06b6d4");
  const [radius, setRadius] = useState<string>(DEFAULT_THEME_SETTINGS.theme_radius || "rounded-lg");

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
        if (s.theme_hover_bg) setHoverBg(s.theme_hover_bg);
        if (s.theme_hover_text) setHoverText(s.theme_hover_text);
        if (s.theme_radius) setRadius(s.theme_radius);

        if (s.custom_themes && Array.isArray(s.custom_themes)) {
          setCustomThemes(s.custom_themes);
        }
      } catch (err) {
        console.error(err);
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
        setHoverBg(initialSettings.theme_hover_bg || DEFAULT_THEME_SETTINGS.theme_hover_bg || "rgba(6, 182, 212, 0.15)");
        setHoverText(initialSettings.theme_hover_text || DEFAULT_THEME_SETTINGS.theme_hover_text || "#06b6d4");
        setRadius(initialSettings.theme_radius || DEFAULT_THEME_SETTINGS.theme_radius || "rounded-lg");
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
      setHoverBg(initialSettings.theme_hover_bg || preset.hoverBg || "rgba(6, 182, 212, 0.15)");
      setHoverText(initialSettings.theme_hover_text || preset.hoverText || preset.primary);
      setRadius(initialSettings.theme_radius || preset.radius || "rounded-lg");
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
    if (preset.tabActiveBg) setTabActiveBg(preset.tabActiveBg);
    if (preset.tabActiveText) setTabActiveText(preset.tabActiveText);
    if (preset.hoverBg) setHoverBg(preset.hoverBg);
    if (preset.hoverText) setHoverText(preset.hoverText);
    if (preset.radius) setRadius(preset.radius);
  };

  const handleToggleEditPreset = (preset: ThemePreset | CustomThemeItem) => {
    if (editingThemeId === preset.id) {
      setEditingThemeId(null);
    } else {
      handleSelectPreset(preset);
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
      });
      toast.success(`"${preset.name}" is now the default theme!`);
    } catch (err) {
      toast.success(`"${preset.name}" marked as default.`);
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
    handleSelectPreset(newTheme);
    toast.success(`Theme "${newTheme.name}" created! Click "Publish Changes" to save.`);
  };

  const handleDeleteCustomTheme = (id: string, name: string) => {
    const updated = customThemes.filter((t) => t.id !== id);
    setCustomThemes(updated);
    toast.info(`Theme "${name}" removed. Click "Publish Changes" to confirm.`);
  };

  const isDirty = useMemo(() => {
    if (!initialSettings) return false;

    // Helper to normalize hex colors and strings for accurate comparison
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

    const initDefaultPreset = norm(initialSettings.theme_default_preset || "cyan-indigo");
    const currDefaultPreset = norm(defaultThemeId);

    const initCustomThemes = JSON.stringify(initialSettings.custom_themes || []);
    const currCustomThemes = JSON.stringify(customThemes || []);

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
      currDefaultPreset !== initDefaultPreset ||
      currCustomThemes !== initCustomThemes
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
    defaultThemeId,
    customThemes,
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
      theme_default_preset: defaultThemeId,
      custom_themes: customThemes,
    };

    try {
      const res = await adminApi.updateThemeSettings(payload);
      setInitialSettings(res.settings);
      updateClientTheme(payload);
      toast.success("Theme & Appearance settings published successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update theme.");
    } finally {
      setSaving(false);
    }
  };

  // Ensure any custom active settings in database are never lost and always appear
  const activeCustomSynthesizedTheme: CustomThemeItem | null = useMemo(() => {
    if (!initialSettings || !initialSettings.theme_primary_color) return null;
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
        hoverBg: initialSettings.theme_hover_bg,
        hoverText: initialSettings.theme_hover_text,
        radius: initialSettings.theme_radius,
        isCustom: true,
      };
    }
    return null;
  }, [initialSettings, customThemes]);

  const allAvailableThemes = useMemo(() => {
    const list: (ThemePreset | CustomThemeItem)[] = [];
    if (activeCustomSynthesizedTheme) {
      list.push(activeCustomSynthesizedTheme);
    }
    list.push(...customThemes.map((c) => ({ ...c, isCustom: true })));
    list.push(...BUILTIN_PRESETS.map((b) => ({ ...b, isCustom: false })));
    return list;
  }, [customThemes, activeCustomSynthesizedTheme]);

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
    return activeCustomSynthesizedTheme ? activeCustomSynthesizedTheme.id : "cyan-indigo";
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
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Theme</span>
          </button>

          {/* Publish / Save Button */}
          <button
            type="button"
            onClick={handleSaveTheme}
            disabled={saving || !isDirty}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ${
              isDirty && !saving
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20 ring-1 ring-amber-400/50"
                : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed opacity-40"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Publishing..." : "Publish Changes"}</span>
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
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative group ${
                      isLiveActive
                        ? "bg-emerald-500/[0.04] border-emerald-500/40 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                        : isDraftSelected
                        ? "bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
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
                        <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                        
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
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Make Default Button */}
                        {!isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefaultTheme(preset);
                            }}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 hover:bg-amber-500/15 text-slate-400 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Set as Default Theme"
                          >
                            <Star className="w-2.5 h-2.5" />
                            <span>Make Default</span>
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleEditPreset(preset);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            editingThemeId === preset.id
                              ? "bg-amber-500 text-slate-950 shadow-sm"
                              : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-amber-400/40"
                          }`}
                          title="Toggle palette and token editor"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{editingThemeId === preset.id ? "Close" : "Edit"}</span>
                        </button>

                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 shrink-0">
                          {preset.category}
                        </span>

                        {preset.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomTheme(preset.id, preset.name);
                            }}
                            className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            title="Delete custom theme"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{preset.tagline}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Core Colors Calibrator & Geometry (Rendered when an Edit button is clicked) */}
          {editingThemeId !== null && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-xs font-bold text-slate-300">
                    Editing Palette: <strong className="text-white">{activeThemeName}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingThemeId(null)}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Close Editor
                </button>
              </div>

              {/* Core Color Palette */}
              <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Core Color Palette</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Live Sync Active</span>
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

                  {/* Secondary Gradient */}
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
                    
                    {/* Heading Color */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">Text Heading Color</label>
                      <input
                        type="text"
                        value={textHeadingColor}
                        onChange={(e) => setTextHeadingColor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                      />
                    </div>

                    {/* Body Text */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">Body Text Color</label>
                      <input
                        type="text"
                        value={textBodyColor}
                        onChange={(e) => setTextBodyColor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                      />
                    </div>

                    {/* Primary Button Fill */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">Primary Button Background</label>
                      <input
                        type="text"
                        value={btnPrimaryBg}
                        onChange={(e) => setBtnPrimaryBg(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                      />
                    </div>

                    {/* Primary Button Text */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">Primary Button Text</label>
                      <input
                        type="text"
                        value={btnPrimaryText}
                        onChange={(e) => setBtnPrimaryText(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white"
                      />
                    </div>

                  </div>
                )}
              </div>

              {/* Corner Radius & Geometry */}
              <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
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
          )}

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
              radius={radius}
            />
          </div>
        )}

      </div>

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

    </div>
  );
}
