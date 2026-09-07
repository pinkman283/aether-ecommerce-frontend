"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Copy, Check, Tag } from "lucide-react";
import { Promotion } from "@/types";

interface PromotionBannerProps {
  promotion: Promotion;
  onApplyCode?: (code: string) => void;
}

export const PromotionBanner: React.FC<PromotionBannerProps> = ({
  promotion,
  onApplyCode,
}) => {
  const [copied, setCopied] = useState(false);
  const promoCode = promotion.codes?.[0]?.code;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!promoCode) return;
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    if (onApplyCode) onApplyCode(promoCode);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-[#12141d] to-purple-950/30 p-6 md:p-8 my-6">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              {promotion.badge_text || "Special Offer"}
            </span>
            {promotion.customer_eligibility === "first_order_only" && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                New Customers Only
              </span>
            )}
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {promotion.name}
          </h3>

          {promotion.description && (
            <p className="text-sm text-slate-300 leading-relaxed">
              {promotion.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            {promotion.min_order_amount > 0 && (
              <span>• Min order: ৳{promotion.min_order_amount.toLocaleString()}</span>
            )}
            {promotion.expires_at && (
              <span>• Valid through: {new Date(promotion.expires_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Call to action & Code */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {promoCode ? (
            <div className="flex items-center bg-black/60 border border-white/15 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2 mr-3 font-mono text-sm font-black text-amber-300">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>{promoCode}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
          ) : null}

          {promotion.cta_destination ? (
            <Link
              href={promotion.cta_destination}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10 transition-all text-center"
            >
              {promotion.cta_text || "Shop Now"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10 transition-all text-center"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
