"use client";

import React, { useState } from "react";
import { Copy, Check, Clock, Gift, ShieldAlert, Sparkles, Tag, ArrowRight } from "lucide-react";
import { Promotion, PromotionClaim } from "@/types";
import { api } from "@/lib/api";

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
      className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
        isApplied
          ? "border-amber-500/60 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent shadow-lg shadow-amber-500/5"
          : "border-white/[0.08] bg-[#0c0e14]/90 hover:border-white/20 hover:bg-[#10131b]"
      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Perforated ticket notches */}
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#07090e] border-r border-white/[0.08]" />
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#07090e] border-l border-white/[0.08]" />

      <div className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-2.5 h-2.5" />
              {promotion.badge_text || formatDiscountDisplay()}
            </span>
            {isClaimable && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25">
                Claimable
              </span>
            )}
            {promotion.customer_eligibility === "first_order_only" && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                First Order Only
              </span>
            )}
          </div>

          {isApplied && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Applied
            </span>
          )}
        </div>

        {/* Main Content */}
        <div>
          <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            {promotion.name}
          </h4>
          {promotion.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {promotion.description}
            </p>
          )}
        </div>

        {/* Conditions Strip */}
        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 border-t border-dashed border-white/[0.08]">
          {promotion.min_order_amount > 0 && (
            <span>Min spend: ৳{promotion.min_order_amount.toLocaleString()}</span>
          )}
          {promotion.max_discount_amount && (
            <span>Max cap: ৳{promotion.max_discount_amount.toLocaleString()}</span>
          )}
          {userClaim?.expires_at ? (
            <span className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3 h-3" />
              Valid until {new Date(userClaim.expires_at).toLocaleDateString()}
            </span>
          ) : promotion.expires_at ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expires {new Date(promotion.expires_at).toLocaleDateString()}
            </span>
          ) : promotion.claim_validity_days ? (
            <span className="text-purple-300">
              Valid for {promotion.claim_validity_days} days once claimed
            </span>
          ) : null}
        </div>

        {/* Error message */}
        {claimError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
            {claimError}
          </p>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between gap-2 pt-2">
          {displayCode ? (
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-xs text-amber-300 font-bold">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>{displayCode}</span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Code"
                className="p-1 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">Auto-applied at checkout</div>
          )}

          <div className="flex items-center gap-2">
            {isClaimable && !isClaimed ? (
              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming || isExpired}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <Gift className="w-3.5 h-3.5" />
                {claiming ? "Claiming..." : "Claim Coupon"}
              </button>
            ) : isClaimable && isClaimed ? (
              <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md">
                {isRedeemed ? "Redeemed" : isExpired ? "Expired" : "Claimed ✓"}
              </span>
            ) : null}

            {onApply && displayCode && !isApplied && (
              <button
                type="button"
                onClick={() => onApply(displayCode)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-sm transition-all"
              >
                Apply
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
