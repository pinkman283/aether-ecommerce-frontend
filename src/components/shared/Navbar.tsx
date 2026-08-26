"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  Package, 
  Menu, 
  X, 
  Sparkles,
  MapPin,
  Flame,
  LayoutDashboard
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatPrice } from "@/lib/utils";

interface NavbarProps {
  onOpenSearch: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { items, openCart, getItemCount, getSubtotal } = useCartStore();
  const { items: wishlistItems, openWishlist } = useWishlistStore();
  const { user, isAuthenticated, logout, openAuthModal } = useAuthStore();

  const cartCount = getItemCount();
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Explore Catalog", href: "/products" },
    { name: "Audio", href: "/products?category=audio-acoustics" },
    { name: "Keyboards", href: "/products?category=keyboards-desks" },
    { name: "EDC & Packs", href: "/products?category=everyday-carry" },
    { name: "Smart Living", href: "/products?category=smart-living-lighting" },
    { name: "Track Order", href: "/track" },
  ];

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-indigo-900/70 via-purple-900/70 to-cyan-900/70 border-b border-indigo-500/20 text-xs py-1.5 px-4 text-center text-slate-300 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 text-cyan-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Free Express Shipping
        </span>
        <span className="hidden sm:inline text-slate-400">on orders over $100</span>
        <span className="mx-2 text-slate-600 hidden sm:inline">•</span>
        <span className="text-amber-400 font-medium flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" /> Use Code: <span className="underline font-bold text-amber-300">WELCOME20</span> for 20% OFF
        </span>
      </div>

      {/* Main Glass Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? "glass-nav shadow-2xl py-3" : "bg-[#090a0f]/90 backdrop-blur-md py-4 border-b border-white/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#0d1017] rounded-[10px] flex items-center justify-center">
                  <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                    Æ
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  AETHER
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                  Studio & Lab
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-cyan-400 bg-white/5 shadow-inner"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 text-slate-400 hover:text-white text-xs sm:text-sm transition-all group"
              title="Search products (Cmd+K)"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="hidden md:inline">Search studio gear...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={openWishlist}
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-pink-400 hover:bg-white/5 border border-transparent hover:border-pink-500/20 transition-all"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white font-bold text-[11px] rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 hover:border-indigo-500/60 text-white transition-all shadow-md shadow-indigo-500/10 group"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-md shadow-cyan-500/50 animate-pulse"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">
                {cartCount > 0 ? formatPrice(getSubtotal()) : "Cart"}
              </span>
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {isAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold text-slate-200"
                  >
                    <img
                      src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-400/40"
                    />
                    <span className="hidden sm:inline font-bold">
                      {user.name?.trim().split(" ")[0] || user.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
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
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left mt-1 border-t border-white/5"
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
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white hover:border-indigo-400/40 transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/10 bg-[#0c0e15] px-4 pt-3 pb-6 space-y-2"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-white/10 flex gap-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold"
                >
                  Admin Portal
                </Link>
                <Link
                  href="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold"
                >
                  Track Package
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
