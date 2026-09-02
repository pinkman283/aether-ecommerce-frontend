"use client";

import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag, Search, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* Glow & 404 Visual Indicator */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
          <div className="relative w-28 h-28 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl flex flex-col items-center justify-center">
            <span className="font-mono text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              404
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Lost In Orbit
            </span>
          </div>
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Page Not Found
          </div>
          <h1
            className="text-2xl sm:text-4xl font-black tracking-tight"
            style={{ color: "var(--theme-text-heading, #ffffff)" }}
          >
            Looking for Uncharted Hardware?
          </h1>
          <p
            className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: "var(--theme-text-body, #94a3b8)" }}
          >
            The route or product specification you requested has either moved, been retired, or does not exist in our catalog.
          </p>
        </div>

        {/* Action Recovery Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" /> Explore Catalog
          </Link>
        </div>

        {/* Helpful links */}
        <div className="pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-center gap-6">
          <Link href="/track" className="hover:text-cyan-400 transition-colors">
            Track Shipment
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-cyan-400 transition-colors">
            Customer Support
          </Link>
          <span>•</span>
          <Link href="/faq" className="hover:text-cyan-400 transition-colors">
            FAQ
          </Link>
        </div>

      </div>
    </div>
  );
}
