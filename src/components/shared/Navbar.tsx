"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  LogOut,
  Package,
  Menu,
  X,
  Sparkles,
  MapPin,
  Flame,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Headphones,
  Keyboard,
  Briefcase,
  Watch,
  Radio,
  Laptop,
  Smartphone,
  Tv,
  Gamepad,
  Shirt,
  Home,
  Layers,
  Box,
  Tag,
  Zap
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useAppTheme } from "@/components/providers/ThemeProvider";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Category } from "@/types";

interface NavbarProps {
  onOpenSearch: () => void;
}

const ICON_MAP: Record<string, any> = {
  Headphones,
  Keyboard,
  Briefcase,
  Watch,
  Radio,
  Laptop,
  Smartphone,
  Tv,
  Gamepad,
  Shirt,
  Home,
  Layers,
  Box,
  Tag,
  Zap,
  Sparkles,
};

function getCategoryIcon(cat: Category) {
  if (cat.icon && ICON_MAP[cat.icon]) {
    return ICON_MAP[cat.icon];
  }
  const slug = (cat.slug || "").toLowerCase();
  if (slug.includes("audio") || slug.includes("sound") || slug.includes("headphone")) return Headphones;
  if (slug.includes("keyboard") || slug.includes("desk") || slug.includes("keycap")) return Keyboard;
  if (slug.includes("carry") || slug.includes("bag") || slug.includes("backpack")) return Briefcase;
  if (slug.includes("wearable") || slug.includes("watch")) return Watch;
  if (slug.includes("light") || slug.includes("smart") || slug.includes("home")) return Sparkles;
  if (slug.includes("laptop") || slug.includes("computer")) return Laptop;
  if (slug.includes("phone") || slug.includes("mobile")) return Smartphone;
  if (slug.includes("game") || slug.includes("gaming")) return Gamepad;
  if (slug.includes("apparel") || slug.includes("cloth") || slug.includes("shirt")) return Shirt;
  return Sparkles;
}

const DEFAULT_FALLBACK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Flagship Audio & Acoustics",
    slug: "audio-acoustics",
    is_featured: true,
    display_order: 1,
    children: [
      {
        id: 101,
        name: "Headphones & IEMs",
        slug: "headphones-iems",
        is_featured: true,
        display_order: 1,
        children: [
          {
            id: 1001,
            name: "Reference & Studio",
            slug: "reference-studio",
            is_featured: true,
            display_order: 1,
            children: [
              { id: 10001, name: "Planar Magnetic Drivers", slug: "planar-magnetic-drivers", is_featured: true, display_order: 1 },
              { id: 10002, name: "Beryllium Dynamic Monitors", slug: "beryllium-dynamic-monitors", is_featured: true, display_order: 2 },
              { id: 10003, name: "Open-Back Mixing Cans", slug: "open-back-mixing", is_featured: true, display_order: 3 },
              { id: 10004, name: "Closed-Back Isolation", slug: "closed-back-isolation", is_featured: true, display_order: 4 },
            ]
          },
          {
            id: 1002,
            name: "Wireless & ANC",
            slug: "wireless-anc",
            is_featured: true,
            display_order: 2,
            children: [
              { id: 10005, name: "Hybrid Noise Cancelling", slug: "hybrid-noise-cancelling", is_featured: true, display_order: 1 },
              { id: 10006, name: "True Wireless Planar Buds", slug: "true-wireless-planar-buds", is_featured: true, display_order: 2 },
              { id: 10007, name: "Transparency Mode Earphones", slug: "transparency-mode-earphones", is_featured: true, display_order: 3 },
            ]
          }
        ]
      },
      {
        id: 102,
        name: "DACs & Amplifiers",
        slug: "dacs-amplifiers",
        is_featured: true,
        display_order: 2,
        children: [
          {
            id: 1003,
            name: "Desktop Processing",
            slug: "desktop-processing",
            is_featured: true,
            display_order: 1,
            children: [
              { id: 10008, name: "Balanced R2R DACs", slug: "balanced-r2r-dacs", is_featured: true, display_order: 1 },
              { id: 10009, name: "Tube Headphone Amplifiers", slug: "tube-headphone-amps", is_featured: true, display_order: 2 },
            ]
          },
          {
            id: 1004,
            name: "Portable Audio",
            slug: "portable-audio",
            is_featured: true,
            display_order: 2,
            children: [
              { id: 10010, name: "Hi-Res Dongle DACs", slug: "hi-res-dongle-dacs", is_featured: true, display_order: 1 },
              { id: 10011, name: "Bluetooth Receiver Amps", slug: "bluetooth-receiver-amps", is_featured: true, display_order: 2 },
            ]
          }
        ]
      },
      {
        id: 103,
        name: "Acoustic Peripherals",
        slug: "acoustic-peripherals",
        is_featured: true,
        display_order: 3,
        children: []
      }
    ]
  },
  {
    id: 2,
    name: "Mechanical Keyboards & Desks",
    slug: "keyboards-desks",
    is_featured: true,
    display_order: 2,
    children: [
      {
        id: 201,
        name: "Custom Keyboards",
        slug: "custom-keyboards",
        is_featured: true,
        display_order: 1,
        children: [
          {
            id: 2001,
            name: "Layout Form Factors",
            slug: "layout-form-factors",
            is_featured: true,
            display_order: 1,
            children: [
              { id: 20001, name: "65% Compact Wireless", slug: "compact-65-wireless", is_featured: true, display_order: 1 },
              { id: 20002, name: "75% Exploded Rotary Kits", slug: "gasket-mount-75", is_featured: true, display_order: 2 },
              { id: 20003, name: "Tenkeyless (TKL) Aluminum", slug: "tkl-aluminum-boards", is_featured: true, display_order: 3 },
            ]
          },
          {
            id: 2002,
            name: "Mounting & Acoustics",
            slug: "mounting-acoustics",
            is_featured: true,
            display_order: 2,
            children: [
              { id: 20004, name: "CNC Gasket Mount Kits", slug: "cnc-gasket-mount-kits", is_featured: true, display_order: 1 },
              { id: 20005, name: "Magnetic Hall Effect Boards", slug: "he-magnetic-rapid-trigger", is_featured: true, display_order: 2 },
            ]
          }
        ]
      },
      {
        id: 202,
        name: "Switches & Modding",
        slug: "switches-modding",
        is_featured: true,
        display_order: 2,
        children: [
          {
            id: 2003,
            name: "Mechanical Switches",
            slug: "mechanical-switches",
            is_featured: true,
            display_order: 1,
            children: [
              { id: 20006, name: "Linear Pre-Lubed Switches", slug: "linear-pre-lubed", is_featured: true, display_order: 1 },
              { id: 20007, name: "Tactile Silent Switches", slug: "tactile-silent-switches", is_featured: true, display_order: 2 },
            ]
          }
        ]
      },
      {
        id: 203,
        name: "Keycaps & Desk Mats",
        slug: "keycaps-mats",
        is_featured: true,
        display_order: 3,
        children: []
      }
    ]
  },
  {
    id: 3,
    name: "Everyday Carry & Tech Packs",
    slug: "everyday-carry",
    is_featured: true,
    display_order: 3,
    children: [
      {
        id: 301,
        name: "Modular Backpacks",
        slug: "modular-backpacks",
        is_featured: true,
        display_order: 1,
        children: [
          {
            id: 3001,
            name: "Tech Travel Packs",
            slug: "tech-travel-packs",
            is_featured: true,
            display_order: 1,
            children: [
              { id: 30001, name: "X-Pac 24L Daily Carry", slug: "xpac-24l-daily", is_featured: true, display_order: 1 },
              { id: 30002, name: "Cordura 30L Commuter Pack", slug: "cordura-30l-commuter", is_featured: true, display_order: 2 },
            ]
          }
        ]
      }
    ]
  }
];

export function Navbar({ onOpenSearch }: NavbarProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_FALLBACK_CATEGORIES);
  const [activeHoverCategory, setActiveHoverCategory] = useState<string | null>(null);
  const [activeSubcategorySlug, setActiveSubcategorySlug] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [mobileExpandedSubCat, setMobileExpandedSubCat] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLElement | null>(null);

  const { isWishlistOpen, openWishlist, items: wishlistItems } = useWishlistStore();
  const { isCartOpen, openCart, getItemCount, getSubtotal } = useCartStore();
  const { user, isAuthenticated, logout, openAuthModal } = useAuthStore();

  const cartCount = getItemCount();
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);

    // Load dynamic categories hierarchy from backend
    api.getCategories()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch((err) => console.warn("Notice: Navbar categories fetch fallback:", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (cat: Category) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveHoverCategory(cat.slug);
    setActiveSubcategorySlug(null);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveHoverCategory(null);
      setActiveSubcategorySlug(null);
    }, 250);
  };

  const { theme } = useAppTheme();
  const activeCategoryData = categories.find((c) => c.slug === activeHoverCategory);

  return (
    <>
      {/* ===================== NON-STICKY TOP NOTIFICATION BAR ===================== */}
      {mounted && theme.announcement_enabled && (
        <div className="bg-gradient-to-r from-indigo-950 via-[#0a0d18] to-cyan-950 border-b border-white/5 text-[11px] py-1 px-4 text-center text-slate-300 flex items-center justify-between max-w-full">
          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              <Radio className="w-3 h-3 animate-pulse" /> {theme.announcement_badge || "Studio Dispatch: Global Shipping Active"}
            </span>
          </div>
          <div className="mx-auto md:mx-0 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </span>
            <span className="text-slate-300 font-medium">{theme.announcement_text}</span>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-slate-400 text-[10px]">
            <Link href="/track" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Package className="w-3 h-3" /> Track Order
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 font-mono">USD ($)</span>
          </div>
        </div>
      )}

      {/* ===================== NON-STICKY TIER 1: BRAND LOGO + CENTER SEARCH + UTILITIES ===================== */}
      <div className="bg-white dark:bg-[#090b14]/95 border-b border-gray-200 dark:border-white/5 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 sm:gap-4 lg:gap-8">
          {/* Left: Brand Identity Logo & Store Department Switcher */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" suppressHydrationWarning className="flex items-center gap-2.5 group select-none">
              {theme.store_brand_logo ? (
                <div 
                  className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full p-1 border-2 border-emerald-600/40 bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:border-[#005826] group-hover:scale-105 transition-all duration-300"
                  suppressHydrationWarning
                >
                  <img
                    src={theme.store_brand_logo}
                    alt={theme.store_brand_name || "Company Logo"}
                    className="w-full h-full object-contain rounded-full"
                    suppressHydrationWarning
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 shadow-sm border border-emerald-600/30 group-hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-[#005826] to-[#2da54b]"
                >
                  <div className="w-full h-full bg-[#005826] dark:bg-[#0d1017] rounded-full flex items-center justify-center">
                    <span className="font-black text-sm text-white">
                      {theme.store_brand_name?.charAt(0) || "I"}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg tracking-wider text-slate-900 dark:text-white group-hover:text-[#005826] dark:group-hover:text-cyan-400 transition-colors leading-tight">
                  {theme.store_brand_name || "INHALIQ"}
                </span>
                <span className="text-[8px] sm:text-[8.5px] tracking-widest text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  {theme.store_brand_tagline || "ELEVATE EVERY INHALE"}
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Big Prominent Search Area */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4 hidden sm:block">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.08] hover:bg-gray-200/80 dark:hover:bg-white/[0.12] border border-gray-200 dark:border-white/20 text-slate-800 dark:text-white text-xs transition-all group cursor-pointer shadow-xs"
              title="Search products, categories, audio, gear... (Cmd+K)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-4 h-4 text-gray-500 dark:text-slate-300 group-hover:text-[#005826] dark:group-hover:text-cyan-400 transition-colors shrink-0" />
                <span className="text-xs text-gray-600 dark:text-slate-200 group-hover:text-gray-900 dark:group-hover:text-white font-medium truncate">
                  Search hardware, audio, keyboards, tech packs...
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-gray-600 dark:text-slate-200 bg-white dark:bg-white/10 rounded border border-gray-200 dark:border-white/20">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Mobile Search + Wishlist + Cart + Account Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 rounded-md bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs transition-all cursor-pointer"
              title="Search products (Cmd+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={openWishlist}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#fb2c5c] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent transition-all cursor-pointer group"
              title="Saved Wishlist"
            >
              <Heart
                className="w-4 h-4 transition-all duration-200"
                style={{
                  color: mounted && wishlistCount > 0 ? "#fb2c5c" : undefined,
                  fill: mounted && wishlistCount > 0 ? "#fb2c5c" : "none",
                }}
              />
              {mounted && wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 font-black text-[10px] rounded-full flex items-center justify-center shadow-md bg-[#fb2c5c] text-white ring-2 ring-white dark:ring-[#090b14] z-10"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-slate-800 dark:text-white bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-[#005826] dark:hover:border-cyan-400 transition-all shadow-xs group cursor-pointer"
              title="Shopping Cart"
            >
              {mounted && cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 font-black text-[10px] rounded-full flex items-center justify-center shadow-md bg-[#005826] text-white ring-2 ring-white dark:ring-[#090b14] z-10"
                >
                  {cartCount}
                </motion.span>
              )}
              <ShoppingBag className="w-4 h-4 text-[#005826] dark:text-indigo-400 transition-colors" />
              <span className="text-xs font-bold hidden sm:inline">
                Cart
              </span>
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {isAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 hover:border-emerald-600/40 bg-gray-100 dark:bg-white/5 hover:bg-gray-200/80 dark:hover:bg-white/10 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-md object-cover ring-1 ring-emerald-600/40"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-600/40 flex items-center justify-center font-black text-xs">
                        {user.name ? user.name.trim().slice(0, 1).toUpperCase() : "U"}
                      </div>
                    )}
                    <span className="hidden sm:inline font-bold pr-0.5 text-xs">
                      {user.name?.trim().split(" ")[0] || user.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0e121e]/95 border border-gray-200 dark:border-white/10 shadow-2xl p-2 z-50 text-slate-800 dark:text-slate-200"
                        onMouseLeave={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10 mb-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {user.name?.trim().split(" ")[0] || user.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                          {user.role === "admin" && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              Admin Access
                            </span>
                          )}
                        </div>

                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            Admin Console
                          </Link>
                        )}

                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-emerald-600 dark:text-purple-400" />
                          Profile & Settings
                        </Link>

                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <Package className="w-4 h-4 text-emerald-600 dark:text-indigo-400" />
                          My Orders
                        </Link>

                        <Link
                          href="/dashboard/addresses"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-emerald-600 dark:text-cyan-400" />
                          Saved Addresses
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            router.push("/");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors text-left mt-1 border-t border-gray-100 dark:border-white/5 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white hover:border-[#005826] transition-all cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#005826] dark:text-indigo-400" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ===================== ONLY THIS CATEGORY NAV SECTION IS STICKY ===================== */}
      <nav
        ref={navContainerRef}
        onMouseLeave={handleMouseLeave}
        className={`sticky top-0 z-40 transition-all duration-300 border-b theme-sticky-subnav ${isScrolled
            ? "bg-white/95 dark:bg-[#070911]/95 backdrop-blur-xl shadow-md dark:shadow-2xl border-gray-200 dark:border-white/10 py-1.5"
            : "bg-white/90 dark:bg-[#090b14]/90 backdrop-blur-md border-gray-200 dark:border-white/5 py-1.5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* LuLu Style: Clean Single-Line Navigation with All Categories & Deals */}
          <div className="hidden lg:flex items-center justify-between relative min-h-[36px] flex-nowrap whitespace-nowrap">
            {/* Left: Green "All Categories" Dropdown Button */}
            <div className="flex items-center gap-2 shrink-0 z-10">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer all-categories-btn"
                style={{
                  backgroundColor: "var(--theme-btn-primary-bg, var(--theme-primary, #005826))",
                  color: "var(--theme-btn-primary-text, #ffffff)",
                }}
              >
                <Menu className="w-3.5 h-3.5" style={{ color: "var(--theme-btn-primary-text, #ffffff)" }} />
                <span style={{ color: "var(--theme-btn-primary-text, #ffffff)" }}>All Categories</span>
              </Link>
            </div>            {/* Center: Category Nav Links + Red Deals Pill (Anchored in the exact middle of navbar) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0 pointer-events-auto">
              {categories.slice(0, 7).map((cat, catIndex, arr) => {
                const isCatHovered = activeHoverCategory === cat.slug;
                const hasChildren = cat.children && cat.children.length > 0;
                const activeSubcategory = cat.children?.find((c) => c.slug === activeSubcategorySlug) || null;
                const hasRightGroups = activeSubcategory && activeSubcategory.children && activeSubcategory.children.length > 0;
                const isRightSide = catIndex >= Math.ceil(arr.length / 2) || catIndex >= 2;

                return (
                  <div
                    key={cat.id || cat.slug}
                    onMouseEnter={() => handleMouseEnter(cat)}
                    onMouseLeave={handleMouseLeave}
                    className="relative shrink-0"
                  >
                    <Link
                      href={`/products?category=${cat.slug}`}
                      onMouseEnter={() => handleMouseEnter(cat)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isCatHovered
                          ? "text-[#005826] dark:text-emerald-400 bg-emerald-50/80 dark:bg-white/10"
                          : "text-slate-700 dark:text-slate-300 hover:text-[#005826] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {hasChildren && (
                        <ChevronDown
                          className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
                            isCatHovered ? "rotate-180 text-[#005826] dark:text-emerald-400" : ""
                          }`}
                        />
                      )}
                    </Link>

                    {/* LuLu Style Floating Dropdown Popover */}
                    <AnimatePresence>
                      {isCatHovered && hasChildren && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.12, ease: "easeOut" }}
                          onMouseEnter={() => {
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current);
                              hoverTimeoutRef.current = null;
                            }
                          }}
                          onMouseLeave={handleMouseLeave}
                          className={`absolute top-full mt-1 z-50 bg-white dark:bg-[#0e121e] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-[0_14px_45px_rgba(0,0,0,0.14)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-150 text-left max-w-[calc(100vw-32px)] ${
                            hasRightGroups ? "w-[680px] sm:w-[720px]" : "w-[230px]"
                          } ${
                            isRightSide ? "right-0 origin-top-right" : "left-0 origin-top-left"
                          }`}
                        >
                          <div className="flex">
                            {/* Left Column: Subcategory list */}
                            <div className={`w-[230px] shrink-0 py-2.5 px-2 space-y-0.5 bg-white dark:bg-[#0e121e] ${
                              hasRightGroups ? "border-r border-gray-100 dark:border-white/10" : ""
                            }`}>
                              {cat.children!.map((sub) => {
                                const isSubActive = activeSubcategorySlug === sub.slug;
                                const subHasChildren = sub.children && sub.children.length > 0;
                                return (
                                  <Link
                                    key={sub.id || sub.slug}
                                    href={`/products?category=${sub.slug}`}
                                    onMouseEnter={() => setActiveSubcategorySlug(sub.slug)}
                                    onClick={() => setActiveHoverCategory(null)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-colors cursor-pointer select-none ${
                                      isSubActive
                                        ? "bg-[#005826]/10 dark:bg-emerald-950/40 text-[#005826] dark:text-emerald-400 font-semibold"
                                        : "text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                  >
                                    <span className="truncate">{sub.name}</span>
                                    {subHasChildren && (
                                      <ChevronRight
                                        className={`w-3.5 h-3.5 transition-transform shrink-0 ml-1.5 ${
                                          isSubActive ? "text-[#005826] dark:text-emerald-400 translate-x-0.5" : "text-slate-400"
                                        }`}
                                      />
                                    )}
                                  </Link>
                                );
                              })}
                            </div>

                            {/* Right Area: Groups of the hovered subcategory */}
                            {hasRightGroups && (
                              <div className="flex-1 p-5 max-h-[420px] overflow-y-auto bg-white dark:bg-[#0e121e]">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                  {activeSubcategory.children!.map((group) => (
                                    <div key={group.id || group.slug} className="space-y-1">
                                      <Link
                                        href={`/products?category=${group.slug}`}
                                        onClick={() => setActiveHoverCategory(null)}
                                        className="font-bold text-[13px] text-slate-900 dark:text-white hover:text-[#005826] dark:hover:text-emerald-400 transition-colors block mb-1.5"
                                      >
                                        {group.name}
                                      </Link>

                                      {group.children && group.children.length > 0 ? (
                                        <div className="space-y-1">
                                          {group.children.map((item) => (
                                            <Link
                                              key={item.id || item.slug}
                                              href={`/products?category=${item.slug}`}
                                              onClick={() => setActiveHoverCategory(null)}
                                              className="block text-xs text-slate-500 dark:text-slate-400 hover:text-[#005826] dark:hover:text-emerald-400 transition-colors py-0.5 truncate"
                                            >
                                              {item.name}
                                            </Link>
                                          ))}
                                        </div>
                                      ) : null}

                                      <Link
                                        href={`/products?category=${group.slug}`}
                                        onClick={() => setActiveHoverCategory(null)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#005826] dark:text-emerald-400 hover:underline pt-0.5"
                                      >
                                        <span>View all</span>
                                        <span className="text-[12px]">→</span>
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* LuLu Inspired: Coral Red Deals Tab with Flame Icon (Admin Configurable) */}
              {theme.nav_deals_enabled !== false && (
                <Link
                  href={theme.nav_deals_link || "/products?discounted=true"}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-extrabold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 transition-all shrink-0 cursor-pointer ml-1"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600 animate-pulse" />
                  <span>{theme.nav_deals_text || "Deals"}</span>
                </Link>
              )}
            </div>

            {/* Right: LuLu Style Micro Promo Badge with Coupon Code (Admin Controllable) */}
            <div className="flex items-center gap-1.5 shrink-0 text-xs ml-auto z-10">
              {theme.navbar_promo_enabled !== false && (theme.navbar_promo_discount_text || theme.navbar_promo_code) ? (
                <>
                  {theme.navbar_promo_discount_text && (
                    <span className="font-black text-slate-900 dark:text-white text-[10.5px]">
                      {theme.navbar_promo_discount_text}
                    </span>
                  )}
                  {theme.navbar_promo_code && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(theme.navbar_promo_code || "");
                        toast.success(`Coupon code "${theme.navbar_promo_code}" copied to clipboard!`);
                      }}
                      title="Click to copy coupon code"
                      className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-[9px] font-bold shadow-xs whitespace-nowrap transition cursor-pointer"
                    >
                      CODE: {theme.navbar_promo_code}
                    </button>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Mobile Categories Bar */}
          <div className="lg:hidden flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 py-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hardware Departments
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:opacity-80 text-xs flex items-center gap-1 transition-colors"
              style={{ color: "var(--theme-view-all-color, var(--theme-tab-active-bg, var(--theme-primary, #005826)))" }}
            >
              <span>{mobileMenuOpen ? "Close Menu" : "View All"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>    </nav>

      {/* ===================== MOBILE NAVIGATION DRAWER ===================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden fixed top-[110px] left-0 right-0 z-50 border-b border-white/10 bg-[#080a12] px-4 pt-3 pb-6 space-y-2 overflow-y-auto max-h-[80vh] shadow-2xl"
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
              Hardware Departments
            </div>

            {categories.map((cat) => {
              const isExpanded = mobileExpandedCat === cat.slug;
              const hasChildren = cat.children && cat.children.length > 0;
              const Icon = getCategoryIcon(cat);

              return (
                <div key={cat.id || cat.slug} className="rounded-md bg-white/[0.02] border border-white/5 overflow-hidden">
                  <div className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-slate-200">
                    <Link
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 flex-1"
                    >
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{cat.name}</span>
                    </Link>
                    {hasChildren && (
                      <button
                        onClick={() => setMobileExpandedCat(isExpanded ? null : cat.slug)}
                        className="p-1 text-slate-400 hover:text-white"
                        aria-label="Toggle subcategories"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180 text-emerald-400" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {isExpanded && hasChildren && (
                    <div className="p-2 pt-0 border-t border-white/5 space-y-1 bg-white/[0.01]">
                      <Link
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-2.5 py-1.5 rounded-md text-xs font-bold text-emerald-400 bg-emerald-500/10"
                      >
                        View All {cat.name} →
                      </Link>

                      {cat.children!.map((sub) => {
                        const isSubExpanded = mobileExpandedSubCat === sub.slug;
                        const hasSubSubs = sub.children && sub.children.length > 0;

                        return (
                          <div key={sub.id || sub.slug} className="pl-2 border-l border-white/10 space-y-1">
                            <div className="flex items-center justify-between py-1 px-1">
                              <Link
                                href={`/products?category=${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-xs text-slate-300 hover:text-white font-medium flex-1 truncate"
                              >
                                {sub.name}
                              </Link>
                              {hasSubSubs && (
                                <button
                                  onClick={() => setMobileExpandedSubCat(isSubExpanded ? null : sub.slug)}
                                  className="p-0.5 text-slate-500 hover:text-white"
                                >
                                  <ChevronDown className={`w-3 h-3 transition-transform ${isSubExpanded ? "rotate-180 text-emerald-400" : ""}`} />
                                </button>
                              )}
                            </div>

                            {isSubExpanded && hasSubSubs && (
                              <div className="pl-3 space-y-1 pb-1">
                                {sub.children!.map((leaf) => (
                                  <Link
                                    key={leaf.id || leaf.slug}
                                    href={`/products?category=${leaf.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-[11px] text-slate-400 hover:text-emerald-300 py-0.5"
                                  >
                                    ↳ {leaf.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-3 border-t border-white/10 flex gap-2">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold"
              >
                Admin Portal
              </Link>
              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold"
              >
                Track Order
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
