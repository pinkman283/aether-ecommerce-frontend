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
  ArrowRight,
  Headphones,
  Keyboard,
  Briefcase,
  Watch,
  Radio
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { formatPrice } from "@/lib/utils";

interface NavbarProps {
  onOpenSearch: () => void;
}

interface SubItem {
  title: string;
  href: string;
  tag?: string;
  badge?: string;
}

interface NavCategoryItem {
  name: string;
  slug: string;
  href: string;
  icon: any;
  highlightTag?: string;
  featureTitle?: string;
  featureDesc?: string;
  featureImage?: string;
  featureBadge?: string;
  subcategories: SubItem[];
}

const CATEGORY_NAV_ITEMS: NavCategoryItem[] = [
  {
    name: "AUDIO & ACOUSTICS",
    slug: "audio-acoustics",
    href: "/products?category=audio-acoustics",
    icon: Headphones,
    highlightTag: "Hi-Res Lossless",
    featureTitle: "Studio Reference Acoustics",
    featureDesc: "Custom 50mm Beryllium diaphragms with 45dB hybrid active noise cancellation.",
    featureImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    featureBadge: "Hi-Res Certified",
    subcategories: [
      { title: "Active Noise Cancelling (ANC)", href: "/products?category=audio-acoustics&search=ANC", badge: "Popular" },
      { title: "Studio Reference Headphones", href: "/products?category=audio-acoustics&search=Studio" },
      { title: "True Wireless Planar Earbuds", href: "/products?category=audio-acoustics&search=Wireless" },
      { title: "Audiophile DACs & Amplifiers", href: "/products?category=audio-acoustics&search=Lossless" },
      { title: "Acoustic Desktop Monitor Stands", href: "/products?category=audio-acoustics" },
    ],
  },
  {
    name: "MECHANICAL KEYBOARDS",
    slug: "keyboards-desks",
    href: "/products?category=keyboards-desks",
    icon: Keyboard,
    highlightTag: "Custom Modded",
    featureTitle: "Tactile CNC Acoustics",
    featureDesc: "Gasket-mounted sound dampening with 8000Hz magnetic polling rates.",
    featureImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    featureBadge: "Gasket Mount",
    subcategories: [
      { title: "CNC Gasket Mechanical Keyboards", href: "/products?category=keyboards-desks&search=Gasket", badge: "Best Seller" },
      { title: "Hall Effect Magnetic HE Switches", href: "/products?category=keyboards-desks&search=Magnetic" },
      { title: "PBT Dye-Sub Custom Keycap Sets", href: "/products?category=keyboards-desks&search=Keycaps" },
      { title: "Microfiber & Leather Desk Mats", href: "/products?category=keyboards-desks&search=Desk" },
      { title: "Ergonomic Walnut & Resin Rests", href: "/products?category=keyboards-desks" },
    ],
  },
  {
    name: "EVERYDAY CARRY & TECH PACKS",
    slug: "everyday-carry",
    href: "/products?category=everyday-carry",
    icon: Briefcase,
    highlightTag: "X-Pac Ballistic",
    featureTitle: "Modular Weatherproof Carry",
    featureDesc: "Ultra-durable Dimension-Polyant X-Pac with Fidlock V-buckles and tech organization.",
    featureImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    featureBadge: "Waterproof",
    subcategories: [
      { title: "X-Pac 24L Modular Backpacks", href: "/products?category=everyday-carry&search=Pack", badge: "Flagship" },
      { title: "Magnetic Fidlock Tech Slings", href: "/products?category=everyday-carry&search=Sling" },
      { title: "Cable Organizers & Pouches", href: "/products?category=everyday-carry" },
      { title: "Titanium RFID Block Wallets", href: "/products?category=everyday-carry&search=Titanium" },
    ],
  },
  {
    name: "SMART LIVING & LIGHTING",
    slug: "smart-living-lighting",
    href: "/products?category=smart-living-lighting",
    icon: Sparkles,
    highlightTag: "Circadian Sync",
    featureTitle: "Workstation Ambiance",
    featureDesc: "Auto-dimming screenbars and circadian rhythm sync ambient lighting.",
    featureImage: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    featureBadge: "Smart Sync",
    subcategories: [
      { title: "Circadian Rhythm Monitor Lightbars", href: "/products?category=smart-living-lighting&search=Lamp", badge: "Trending" },
      { title: "Dynamic RGB Ambient LED Tubes", href: "/products?category=smart-living-lighting&search=RGB" },
      { title: "3-in-1 MagSafe Charging Docks", href: "/products?category=smart-living-lighting&search=Dock" },
      { title: "Under-Desk Clean Cable Tracks", href: "/products?category=smart-living-lighting" },
    ],
  },
  {
    name: "PRO CYBER WEARABLES",
    slug: "pro-wearables",
    href: "/products?category=pro-wearables",
    icon: Watch,
    highlightTag: "Titanium G5",
    featureTitle: "Biometric Precision",
    featureDesc: "Grade 5 titanium chronographs with sapphire crystal and recovery tracking.",
    featureImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    featureBadge: "Titanium Grade 5",
    subcategories: [
      { title: "Titanium Grade 5 Chronographs", href: "/products?category=pro-wearables&search=Watch", badge: "New" },
      { title: "Biometric Sleep & Health Rings", href: "/products?category=pro-wearables&search=Ring" },
      { title: "Tactical FKM Fluororubber Straps", href: "/products?category=pro-wearables" },
      { title: "Magnetic Qi2 Fast Charging Pods", href: "/products?category=pro-wearables" },
    ],
  },
];

export function Navbar({ onOpenSearch }: NavbarProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHoverCategory, setActiveHoverCategory] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
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
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (slug: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveHoverCategory(slug);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveHoverCategory(null);
    }, 100);
  };

  const { theme } = useThemeStore();
  const activeCategoryData = CATEGORY_NAV_ITEMS.find((c) => c.slug === activeHoverCategory);

  return (
    <>
      {/* ===================== NON-STICKY TOP NOTIFICATION BAR ===================== */}
      {theme.announcement_enabled && (
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
      <div className="bg-[#090b14]/95 border-b border-white/5 text-slate-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4 lg:gap-8">
          {/* Left: Brand Identity Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              {theme.store_brand_logo ? (
                <div className="h-9 max-w-[160px] flex items-center justify-center shrink-0">
                  <img
                    src={theme.store_brand_logo}
                    alt={theme.store_brand_name || "Company Logo"}
                    className="max-h-9 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div
                  className="w-9 h-9 rounded-xl p-0.5 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300"
                  style={{
                    background: "linear-gradient(135deg, var(--theme-primary, #06b6d4), var(--theme-secondary, #6366f1))",
                  }}
                >
                  <div className="w-full h-full bg-[#0d1017] rounded-[9px] flex items-center justify-center">
                    <span
                      className="font-black text-base text-transparent bg-clip-text"
                      style={{
                        backgroundImage: "linear-gradient(90deg, var(--theme-primary, #06b6d4), var(--theme-secondary, #6366f1))",
                      }}
                    >
                      {theme.store_brand_name?.charAt(0) || "Æ"}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg tracking-wider text-white group-hover:text-cyan-400 transition-colors leading-tight">
                  {theme.store_brand_name || "AETHER"}
                </span>
                <span className="text-[8.5px] tracking-widest text-slate-400 uppercase font-semibold">
                  {theme.store_brand_tagline || "Studio & Lab"}
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Big Prominent Search Area */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4 lg:mx-8 hidden sm:block">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 hover:border-cyan-400/60 text-white text-xs transition-all group cursor-pointer shadow-inner"
              title="Search products, categories, audio, gear... (Cmd+K)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-4 h-4 text-slate-200 group-hover:text-cyan-400 transition-colors shrink-0" />
                <span className="text-xs text-slate-100 group-hover:text-white font-medium truncate">
                  Search hardware, audio, keyboards, tech packs...
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-slate-200 bg-white/10 rounded border border-white/20">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Mobile Search + Wishlist + Cart + Account Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
              title="Search products (Cmd+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={openWishlist}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer group"
              style={{
                borderColor: mounted && wishlistCount > 0
                  ? "color-mix(in srgb, var(--theme-secondary, #ec4899) 30%, transparent)"
                  : undefined,
              }}
              title="Saved Wishlist"
            >
              <Heart
                className="w-4 h-4 transition-all duration-200"
                style={{
                  color: mounted && wishlistCount > 0 ? "var(--theme-secondary, #ec4899)" : undefined,
                  fill: mounted && wishlistCount > 0 ? "var(--theme-secondary, #ec4899)" : "none",
                }}
              />
              {mounted && wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 font-black text-[10px] rounded-full flex items-center justify-center shadow-md ring-2 ring-[#090b14]"
                  style={{
                    background: "linear-gradient(135deg, var(--theme-secondary, #ec4899), var(--theme-primary, #6366f1))",
                    color: "var(--theme-btn-primary-text, #ffffff)",
                  }}
                >
                  {wishlistCount}
                </motion.span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-white transition-all shadow-sm group cursor-pointer"
              style={{
                background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary, #6366f1) 25%, rgba(255, 255, 255, 0.05)) 0%, color-mix(in srgb, var(--theme-secondary, #a855f7) 20%, rgba(255, 255, 255, 0.02)) 100%)",
                borderColor: "color-mix(in srgb, var(--theme-primary, #6366f1) 40%, rgba(255, 255, 255, 0.15))",
              }}
              title="Shopping Cart"
            >
              {mounted && cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 font-black text-[10px] rounded-full flex items-center justify-center shadow-md ring-2 ring-[#090b14] z-10"
                  style={{
                    background: "linear-gradient(135deg, var(--theme-primary, #06b6d4), var(--theme-secondary, #6366f1))",
                    color: "var(--theme-btn-primary-text, #ffffff)",
                  }}
                >
                  {cartCount}
                </motion.span>
              )}
              <ShoppingBag className="w-4 h-4 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-xs font-bold hidden sm:inline text-white">
                Cart
              </span>
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {isAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-lg border border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-md object-cover ring-1 ring-indigo-400/40"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-600/40 to-purple-600/40 text-indigo-200 ring-1 ring-indigo-400/40 flex items-center justify-center font-black text-xs">
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
                        className="absolute right-0 mt-2 w-56 rounded-2xl glass-card bg-[#0e121e]/95 border border-white/10 shadow-2xl p-2 z-50"
                        onMouseLeave={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-white/10 mb-1">
                          <p className="text-xs font-bold text-white truncate">
                            {user.name?.trim().split(" ")[0] || user.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          {user.role === "admin" && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Admin Access
                            </span>
                          )}
                        </div>

                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/10 rounded-xl transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-400" />
                            Admin Console
                          </Link>
                        )}

                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-purple-400" />
                          Profile & Settings
                        </Link>

                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <Package className="w-4 h-4 text-indigo-400" />
                          My Orders
                        </Link>

                        <Link
                          href="/dashboard/addresses"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-cyan-400" />
                          Saved Addresses
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            router.push("/");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left mt-1 border-t border-white/5 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white hover:border-indigo-400/40 transition-all cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
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
        className={`sticky top-0 z-40 transition-all duration-300 border-b theme-sticky-subnav ${
          isScrolled
            ? "bg-[#070911]/95 backdrop-blur-xl shadow-2xl border-white/10 py-1.5"
            : "bg-[#090b14]/90 backdrop-blur-md border-white/5 py-1.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Strict Single-Line Category Navigation (No wrapping, pure categories only) */}
          <div className="hidden lg:flex items-center justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-8 flex-nowrap whitespace-nowrap overflow-x-auto no-scrollbar">
            {CATEGORY_NAV_ITEMS.map((cat) => {
              const isHovered = activeHoverCategory === cat.slug;
              return (
                <div
                  key={cat.slug}
                  onMouseEnter={() => handleMouseEnter(cat.slug)}
                  className="relative shrink-0"
                >
                  <Link
                    href={cat?.href || "/products"}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isHovered
                        ? "text-white bg-white/10 shadow-sm shadow-cyan-950/50"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-500 transition-transform duration-200 shrink-0 ${
                        isHovered ? "rotate-180 text-cyan-400" : ""
                      }`}
                    />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Mobile Categories Bar */}
          <div className="lg:hidden flex items-center justify-between text-xs font-bold text-slate-300 py-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Explore Hardware Departments
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
            >
              <span>{mobileMenuOpen ? "Close Menu" : "View All"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* ===================== FULL MEGA DROPDOWN MENU ON HOVER ===================== */}
        <AnimatePresence>
          {activeCategoryData && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
              className="hidden lg:block absolute left-0 right-0 top-full w-full theme-mega-menu bg-[#080b15]/98 border-b border-white/10 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 sm:py-5">
                <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
                  
                  {/* Left Col: Category Title, Badge & Subcategories */}
                  <div className="col-span-8">
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          {(() => {
                            const Icon = activeCategoryData.icon;
                            return <Icon className="w-3.5 h-3.5" />;
                          })()}
                        </div>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-white">
                            {activeCategoryData.name}
                          </h3>
                          <span className="text-[10px] text-slate-400">
                            {activeCategoryData.subcategories.length} Curated Collections
                          </span>
                        </div>
                      </div>

                      <Link
                        href={activeCategoryData?.href || "/products"}
                        onClick={() => setActiveHoverCategory(null)}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group/viewall"
                      >
                        <span>View All {activeCategoryData.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/viewall:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Subcategories 2-Column Grid with Reduced Corner Radius */}
                    <div className="grid grid-cols-2 gap-2">
                      {activeCategoryData.subcategories.map((sub, idx) => (
                        <Link
                          key={idx}
                          href={sub?.href || "/products"}
                          onClick={() => setActiveHoverCategory(null)}
                          className="theme-mega-item flex items-center justify-between p-2 rounded-md bg-white/[0.03] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all group/item"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 group-hover/item:bg-cyan-400 group-hover/item:scale-125 transition-all" />
                            <span className="text-xs font-medium group-hover/item:font-bold transition-all truncate">
                              {sub.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {sub.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                {sub.badge}
                              </span>
                            )}
                            {sub.tag && (
                              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-sm bg-white/5 text-slate-400">
                                {sub.tag}
                              </span>
                            )}
                            <ArrowRight className="w-3 h-3 text-slate-600 group-hover/item:text-cyan-400 group-hover/item:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right Col: Visual Feature Teaser Card with Vibrant Image & Theme-Matched Border */}
                  <div className="col-span-4">
                    <div className="theme-megamenu-card relative rounded-lg overflow-hidden border border-white/15 bg-gradient-to-br from-indigo-950/70 via-[#0d1222] to-cyan-950/50 p-3.5 flex flex-col justify-between h-full min-h-[175px] group/card shadow-lg">
                      {activeCategoryData.featureImage && (
                        <div className="absolute inset-0 z-0">
                          <img
                            src={activeCategoryData.featureImage}
                            alt={activeCategoryData.featureTitle || activeCategoryData.name}
                            className="w-full h-full object-cover opacity-80 group-hover/card:opacity-95 group-hover/card:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 theme-megamenu-card-overlay bg-gradient-to-t from-[#080b15]/95 via-[#080b15]/65 to-transparent transition-all" />
                        </div>
                      )}

                      <div className="relative z-10">
                        <span
                          className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm mb-1.5"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--theme-primary, #06b6d4) 20%, transparent)",
                            color: "var(--theme-primary, #06b6d4)",
                            borderColor: "color-mix(in srgb, var(--theme-primary, #06b6d4) 40%, transparent)",
                            borderWidth: 1,
                          }}
                        >
                          {activeCategoryData.featureBadge || "Highlight"}
                        </span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-white leading-snug">
                          {activeCategoryData.featureTitle}
                        </h4>
                        <p className="text-[10.5px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {activeCategoryData.featureDesc}
                        </p>
                      </div>

                      <div className="relative z-10 pt-2.5 mt-2.5 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Aether Engineered
                        </span>
                        <Link
                          href={activeCategoryData?.href || "/products"}
                          onClick={() => setActiveHoverCategory(null)}
                          className="px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-md flex items-center gap-1 hover:scale-105"
                          style={{
                            backgroundColor: "var(--theme-primary, #06b6d4)",
                            color: "#ffffff",
                          }}
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

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

            {CATEGORY_NAV_ITEMS.map((cat) => {
              const isExpanded = mobileExpandedCat === cat.slug;
              const Icon = cat.icon;
              return (
                <div key={cat.slug} className="rounded-md bg-white/[0.02] border border-white/5 overflow-hidden">
                  <button
                    onClick={() => setMobileExpandedCat(isExpanded ? null : cat.slug)}
                    className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span>{cat.name}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        isExpanded ? "rotate-180 text-cyan-400" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="p-2 pt-0 border-t border-white/5 space-y-1 bg-white/[0.01]">
                      <Link
                        href={cat?.href || "/products"}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-2.5 py-1.5 rounded-md text-xs font-bold text-cyan-400 bg-cyan-500/10"
                      >
                        View All {cat.name} →
                      </Link>
                      {cat.subcategories.map((sub, idx) => (
                        <Link
                          key={idx}
                          href={sub?.href || "/products"}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-2.5 py-1.5 rounded-md text-xs text-slate-300 hover:text-white hover:bg-white/5"
                        >
                          {sub.title}
                        </Link>
                      ))}
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
