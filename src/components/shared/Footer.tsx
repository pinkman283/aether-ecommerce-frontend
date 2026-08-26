import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones, Sparkles, ArrowRight, Globe, Send, Share2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07080c] text-slate-400 text-sm mt-24">
      {/* Guarantees Ribbon */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Free Express Shipping</h4>
                <p className="text-xs text-slate-400 mt-0.5">Complimentary express delivery on orders over $100.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">2-Year Studio Warranty</h4>
                <p className="text-xs text-slate-400 mt-0.5">Comprehensive hardware protection & zero-cost repair.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">30-Day Risk-Free Trial</h4>
                <p className="text-xs text-slate-400 mt-0.5">Hassle-free global returns with prepaid shipping labels.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">24/7 Expert Audio Support</h4>
                <p className="text-xs text-slate-400 mt-0.5">Direct access to sound engineers and hardware specialists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-[#0d1017] rounded-[10px] flex items-center justify-center">
                  <span className="font-extrabold text-base text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                    Æ
                  </span>
                </div>
              </div>
              <span className="font-black text-xl tracking-tight text-white">AETHER</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Crafting state-of-the-art acoustics, mechanical peripherals, and modular everyday carry for innovators, sound designers, and technical creators worldwide.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-white block mb-2">Subscribe to early product drops:</span>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 flex-1"
                />
                <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1">
                  Join <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Hardware</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/products?category=audio-acoustics" className="hover:text-cyan-400 transition-colors">Flagship Audio</Link></li>
              <li><Link href="/products?category=keyboards-desks" className="hover:text-cyan-400 transition-colors">Mechanical Keyboards</Link></li>
              <li><Link href="/products?category=everyday-carry" className="hover:text-cyan-400 transition-colors">Modular EDC Packs</Link></li>
              <li><Link href="/products?category=smart-living-lighting" className="hover:text-cyan-400 transition-colors">Ambient Desk Lighting</Link></li>
              <li><Link href="/products?category=pro-wearables" className="hover:text-cyan-400 transition-colors">Titanium Wearables</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/track" className="hover:text-cyan-400 transition-colors">Order Tracking</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Customer Account</Link></li>
              <li><Link href="/dashboard/addresses" className="hover:text-cyan-400 transition-colors">Shipping Addresses</Link></li>
              <li><Link href="/products" className="hover:text-cyan-400 transition-colors">Warranty Registration</Link></li>
              <li><Link href="/admin/login" className="text-amber-400/80 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">Admin Portal →</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex gap-3 mb-4">
              <a href="#" className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">
              San Francisco, CA • Tokyo • Berlin
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AETHER Technologies, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
