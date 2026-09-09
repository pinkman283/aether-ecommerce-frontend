"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight, Globe, Send, Share2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useThemeStore } from "@/store/useThemeStore";
import { useAppTheme } from "@/components/providers/ThemeProvider";

export function Footer() {
  const { theme } = useAppTheme();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }
    setSubscribed(true);
    toast.success(`Subscribed to ${theme.store_brand_name || "AETHER"} studio drops and product releases!`);
    setEmail("");
  };

  return (
    <footer
      suppressHydrationWarning
      className="theme-footer border-t text-sm transition-colors duration-200"
    >
      {/* Guarantees Ribbon */}
      {theme.footer_features_enabled !== false && (
        <div className="theme-footer-guarantees border-b transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link href={theme.footer_feature_link_1 || "/shipping-policy"} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:border-indigo-400 transition-colors">
                  <Truck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="theme-footer-card-title font-bold text-sm group-hover:text-cyan-400 transition-colors">
                    {theme.footer_feature_title_1 || "Free Express Shipping"}
                  </h4>
                  <p className="theme-footer-card-desc text-xs mt-0.5">
                    {theme.footer_feature_desc_1 || "Complimentary delivery inside & outside Dhaka."}
                  </p>
                </div>
              </Link>

              <Link href={theme.footer_feature_link_2 || "/refund-policy"} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:border-cyan-400 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="theme-footer-card-title font-bold text-sm group-hover:text-cyan-400 transition-colors">
                    {theme.footer_feature_title_2 || "2-Year Studio Warranty"}
                  </h4>
                  <p className="theme-footer-card-desc text-xs mt-0.5">
                    {theme.footer_feature_desc_2 || "Comprehensive hardware protection & zero-cost repair."}
                  </p>
                </div>
              </Link>

              <Link href={theme.footer_feature_link_3 || "/refund-policy"} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:border-purple-400 transition-colors">
                  <RotateCcw className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="theme-footer-card-title font-bold text-sm group-hover:text-cyan-400 transition-colors">
                    {theme.footer_feature_title_3 || "30-Day Risk-Free Trial"}
                  </h4>
                  <p className="theme-footer-card-desc text-xs mt-0.5">
                    {theme.footer_feature_desc_3 || "Hassle-free evaluation with prepaid RMA labels."}
                  </p>
                </div>
              </Link>

              <Link href={theme.footer_feature_link_4 || "/contact"} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 group-hover:border-pink-400 transition-colors">
                  <Headphones className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h4 className="theme-footer-card-title font-bold text-sm group-hover:text-cyan-400 transition-colors">
                    {theme.footer_feature_title_4 || "24/7 Audio Support"}
                  </h4>
                  <p className="theme-footer-card-desc text-xs mt-0.5">
                    {theme.footer_feature_desc_4 || "Direct access to sound engineers & hardware specialists."}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Links */}
      <div className="theme-footer-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" suppressHydrationWarning className="flex items-center gap-3 inline-flex group select-none">
                {theme.store_brand_logo ? (
                  <div
                    className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full p-1 border-2 border-cyan-400/30 bg-white/[0.04] shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center shrink-0 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-all duration-300"
                    suppressHydrationWarning
                  >
                    <img
                      src={theme.store_brand_logo}
                      alt={theme.store_brand_name || "Company Logo"}
                      className="w-full h-full object-contain rounded-full filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
                      suppressHydrationWarning
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-400/30 bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <div className="theme-footer-logo-inner w-full h-full rounded-full flex items-center justify-center transition-colors">
                      <span className="font-extrabold text-base text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        {theme.store_brand_name?.charAt(0) || "Æ"}
                      </span>
                    </div>
                  </div>
                )}
                <span className="theme-footer-brand-title font-black text-xl tracking-tight transition-colors">
                  {theme.store_brand_name || "AETHER"}
                </span>
              </Link>
              <p className="theme-footer-desc text-xs leading-relaxed max-w-sm">
                Crafting state-of-the-art acoustics, mechanical peripherals, and modular everyday carry for innovators, sound designers, and technical creators worldwide.
              </p>

              {/* Newsletter */}
              <div className="pt-2">
                <span className="theme-footer-newsletter-title text-xs font-semibold block mb-2">
                  Subscribe to early product drops:
                </span>
                {subscribed ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 max-w-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>You are subscribed to exclusive studio drops.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="theme-footer-input border rounded-xl px-3.5 py-2 text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 flex-1 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      Join <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="theme-footer-col-title font-bold text-xs uppercase tracking-wider mb-4">
                Hardware
              </h4>
              <ul className="theme-footer-col-links space-y-2.5 text-xs">
                <li><Link href="/products?category=audio-acoustics" className="hover:text-cyan-400 transition-colors">Flagship Audio</Link></li>
                <li><Link href="/products?category=keyboards-desks" className="hover:text-cyan-400 transition-colors">Mechanical Keyboards</Link></li>
                <li><Link href="/products?category=everyday-carry" className="hover:text-cyan-400 transition-colors">Modular EDC Packs</Link></li>
                <li><Link href="/products?category=smart-living-lighting" className="hover:text-cyan-400 transition-colors">Ambient Desk Lighting</Link></li>
                <li><Link href="/products?category=pro-wearables" className="hover:text-cyan-400 transition-colors">Titanium Wearables</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="theme-footer-col-title font-bold text-xs uppercase tracking-wider mb-4">
                Customer Care
              </h4>
              <ul className="theme-footer-col-links space-y-2.5 text-xs">
                <li><Link href="/track" className="hover:text-cyan-400 transition-colors">Order Tracking</Link></li>
                <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Customer Account</Link></li>
                <li><Link href="/dashboard/addresses" className="hover:text-cyan-400 transition-colors">Shipping Addresses</Link></li>
                <li><Link href="/shipping-policy" className="hover:text-cyan-400 transition-colors">Shipping & Delivery Rates</Link></li>
                <li><Link href="/refund-policy" className="hover:text-cyan-400 transition-colors">30-Day Trial & Warranty</Link></li>
                <li><Link href="/faq" className="hover:text-cyan-400 transition-colors">FAQ & Knowledge Base</Link></li>
                <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="theme-footer-col-title font-bold text-xs uppercase tracking-wider mb-4">
                Company & Hub
              </h4>
              <ul className="theme-footer-col-links space-y-2.5 text-xs mb-4">
                <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About {theme.store_brand_name || "AETHER"}</Link></li>
                <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/admin/login" className="text-amber-400/80 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">Admin Portal →</Link></li>
              </ul>
              <div className="flex gap-3 mb-3">
                <a
                  href="#"
                  className="theme-footer-social-btn w-8 h-8 rounded-xl border flex items-center justify-center transition-all"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="theme-footer-social-btn w-8 h-8 rounded-xl border flex items-center justify-center transition-all"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="theme-footer-social-btn w-8 h-8 rounded-xl border flex items-center justify-center transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              </div>
              <p className="theme-footer-locations text-[11px]">
                Dhaka • San Francisco • Tokyo • Berlin
              </p>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="theme-footer-bottom border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2026 {theme.store_brand_name || "AETHER"} Technologies, Inc. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-400">Terms of Service</Link>
              <Link href="/shipping-policy" className="hover:text-slate-400">Shipping Policy</Link>
              <Link href="/refund-policy" className="hover:text-slate-400">Refunds & Warranty</Link>
            </div>
          </div>
        </div>
      </footer>
    );
}
