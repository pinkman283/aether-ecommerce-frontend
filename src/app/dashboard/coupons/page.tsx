"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Gift,
  Tag,
  Clock,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { api } from "@/lib/api";
import { Promotion, PromotionClaim } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { CouponCard } from "@/components/promotions/CouponCard";
import { toast } from "sonner";

export default function CustomerCouponsPage() {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"available" | "claimed" | "redeemed" | "expired">("available");

  const [claimablePromotions, setClaimablePromotions] = useState<Promotion[]>([]);
  const [userClaims, setUserClaims] = useState<PromotionClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [claimableRes, couponsRes] = await Promise.all([
        api.getClaimablePromotions().catch(() => []),
        api.getMyCoupons().catch(() => ({ claimed: [], available: [], used: [], expired: [] })),
      ]);

      setClaimablePromotions(Array.isArray(claimableRes) ? (claimableRes as any) : []);
      const allUserClaims = [
        ...(couponsRes.claimed || []),
        ...(couponsRes.used || []),
        ...(couponsRes.expired || []),
      ];
      setUserClaims(allUserClaims);
    } catch (err: any) {
      toast.error("Failed to load your coupons");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClaimSuccess = (newClaim: PromotionClaim) => {
    toast.success("Coupon claimed to your wallet!");
    setUserClaims((prev) => [newClaim, ...prev]);
    // Refresh to update available/claimed counts
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Gift className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-black text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">
          Sign in to view your exclusive vouchers, claim special discount codes, and track expiration timers.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
        >
          Sign In to Access Wallet
        </button>
      </div>
    );
  }

  // Segment user claims
  const claimedList = userClaims.filter((c) => c.status === "claimed");
  const redeemedList = userClaims.filter((c) => c.status === "redeemed");
  const expiredList = userClaims.filter((c) => c.status === "expired");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#161a29] to-[#0b0e17] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">My Coupon Wallet</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Discover claimable store discounts, exclusive VIP vouchers, and manage active promotional codes ready for checkout.
            </p>
          </div>

          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            Go to Checkout
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto no-scrollbar pb-1 text-xs">
        {[
          { key: "available", label: "Available to Claim", count: claimablePromotions.length, icon: Sparkles },
          { key: "claimed", label: "Claimed & Ready", count: claimedList.length, icon: Gift },
          { key: "redeemed", label: "Redeemed / Used", count: redeemedList.length, icon: CheckCircle2 },
          { key: "expired", label: "Expired", count: expiredList.length, icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-black/30 text-black" : "bg-white/10 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-xs uppercase tracking-wider font-semibold">Loading your coupons...</span>
        </div>
      ) : activeTab === "available" ? (
        <div className="space-y-4">
          {claimablePromotions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0c0e17] border border-white/10 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No available claimable coupons right now</h3>
              <p className="text-xs text-slate-400">Check back soon for upcoming flash campaigns and seasonal vouchers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {claimablePromotions.map((promo) => (
                <CouponCard
                  key={promo.id}
                  promotion={promo}
                  onClaimSuccess={handleClaimSuccess}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "claimed" ? (
        <div className="space-y-4">
          {claimedList.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0c0e17] border border-white/10 text-center space-y-3">
              <Gift className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No claimed coupons in your wallet</h3>
              <p className="text-xs text-slate-400">
                Switch to &quot;Available to Claim&quot; to claim discount vouchers to your wallet.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("available")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold"
              >
                Browse Available Coupons
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {claimedList.map((claim) => (
                <CouponCard
                  key={claim.id}
                  promotion={claim.promotion!}
                  userClaim={claim}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "redeemed" ? (
        <div className="space-y-4">
          {redeemedList.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0c0e17] border border-white/10 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No coupons redeemed yet</h3>
              <p className="text-xs text-slate-400">Your used promotional vouchers will be saved here for your records.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {redeemedList.map((claim) => (
                <div
                  key={claim.id}
                  className="p-5 rounded-2xl bg-[#0c0e17] border border-white/10 space-y-3 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Redeemed</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {claim.claimed_code}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{claim.promotion?.name}</h4>
                  <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2 flex items-center justify-between">
                    <span>Used on {new Date(claim.redeemed_at || claim.claimed_at).toLocaleDateString()}</span>
                    {claim.order && (
                      <Link
                        href={`/dashboard`}
                        className="text-cyan-400 hover:underline font-mono"
                      >
                        Order #{claim.order.order_number}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {expiredList.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0c0e17] border border-white/10 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No expired coupons</h3>
              <p className="text-xs text-slate-400">Great job! You haven&apos;t let any claimed coupons lapse.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {expiredList.map((claim) => (
                <div
                  key={claim.id}
                  className="p-5 rounded-2xl bg-[#0c0e17] border border-white/10 space-y-3 opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 uppercase">Expired</span>
                    <span className="text-xs font-mono text-slate-500">{claim.claimed_code}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-400">{claim.promotion?.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    Expired on {claim.expires_at ? new Date(claim.expires_at).toLocaleDateString() : "Campaign end"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
