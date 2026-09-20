"use client";

import React, { useState } from "react";
import { Copy, Check, Clock, Gift, Sparkles, Tag, ArrowRight } from "lucide-react";
import { Promotion, PromotionClaim } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface CouponCardProps {
  promotion: Promotion;
  userClaim?: PromotionClaim | null;
  onClaimSuccess?: (claim: PromotionClaim) => void;
  onApply?: (code: string) => void;
  isApplied?: boolean;
  compact?: boolean;
  disabled?: boolean;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  promotion,
  userClaim,
  onClaimSuccess,
  onApply,
  isApplied = false,
  compact = false,
  disabled = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Format discount value
  const formatDiscountDisplay = () => {
    switch (promotion.discount_type) {
      case "percentage":
        return `${promotion.discount_value}% OFF`;
      case "fixed_amount":
        return `৳${promotion.discount_value} OFF`;
      case "free_shipping":
        return "FREE SHIPPING";
      case "buy_x_get_y":
        return `BUY ${promotion.bxgy_buy_quantity || 1} GET ${promotion.bxgy_get_quantity || 1}`;
      default:
        return `${promotion.discount_value}% OFF`;
    }
  };

  // Primary code: from userClaim, or first promo code, or slug
  const displayCode = userClaim?.claimed_code || promotion.codes?.[0]?.code || "";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayCode) return;
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    toast.success(`Coupon code ${displayCode} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (claiming || userClaim) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const res = await api.claimPromotion(promotion.id);
      if (res.claim) {
        onClaimSuccess?.(res.claim);
      }
    } catch (err: any) {
      setClaimError(err?.response?.data?.message || "Failed to claim coupon");
      toast.error(err?.response?.data?.message || "Failed to claim coupon");
    } finally {
      setClaiming(false);
    }
  };

  const isClaimable = promotion.promotion_type === "claimable_coupon";
  const isClaimed = Boolean(userClaim);
  const isExpired = promotion.status === "expired" || (userClaim?.status === "expired");
  const isRedeemed = userClaim?.status === "redeemed";

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 ${
        isApplied
          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-500/10 shadow-sm"
          : "border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#0f131f] shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-white/20"
      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              <Sparkles className="w-3 h-3" />
              {promotion.badge_text || formatDiscountDisplay()}
            </span>
            {isClaimable && !isClaimed && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                Claimable
              </span>
            )}
            {promotion.customer_eligibility === "first_order_only" && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                First Order Only
              </span>
            )}
          </div>

          {isApplied && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Applied
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {promotion.name}
          </h4>
          {promotion.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {promotion.description}
            </p>
          )}
        </div>

        {/* Conditions Strip */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-2.5 border-t border-dashed border-gray-200 dark:border-white/10">
          {promotion.min_order_amount > 0 && (
            <span>Min spend: ৳{promotion.min_order_amount.toLocaleString()}</span>
          )}
          {promotion.max_discount_amount && (
            <span>Max discount: ৳{promotion.max_discount_amount.toLocaleString()}</span>
          )}
          {userClaim?.expires_at ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <Clock className="w-3 h-3" />
              Valid until {new Date(userClaim.expires_at).toLocaleDateString()}
            </span>
          ) : promotion.expires_at ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expires {new Date(promotion.expires_at).toLocaleDateString()}
            </span>
          ) : promotion.claim_validity_days ? (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              Valid for {promotion.claim_validity_days} days once claimed
            </span>
          ) : null}
        </div>

        {/* Claim Error */}
        {claimError && (
          <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1 rounded-lg">
            {claimError}
          </p>
        )}
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between gap-2 pt-4 mt-2">
        {displayCode ? (
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:text-white font-bold">
            <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{displayCode}</span>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy Code"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Auto-applied at checkout</span>
        )}

        <div className="flex items-center gap-2">
          {isClaimable && !isClaimed ? (
            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming || isExpired}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              {claiming ? "Claiming..." : "Claim Coupon"}
            </button>
          ) : isClaimable && isClaimed ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
              {isRedeemed ? "Redeemed" : isExpired ? "Expired" : "Claimed ✓"}
            </span>
          ) : null}

          {onApply && displayCode && !isApplied && (
            <button
              type="button"
              onClick={() => onApply(displayCode)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-all cursor-pointer"
            >
              Apply
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
