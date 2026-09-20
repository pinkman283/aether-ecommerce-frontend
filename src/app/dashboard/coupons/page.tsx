"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Gift,
  Tag,
  Clock,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { api } from "@/lib/api";
import { Promotion, PromotionClaim } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { CouponCard } from "@/components/promotions/CouponCard";
import { toast } from "sonner";

export default function CustomerCouponsPage() {
  const { isAuthenticated, logout, openAuthModal } = useAuthStore();
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
      if (err?.response?.status === 401) {
        logout();
        toast.error("Your session has expired. Please sign in again.");
        openAuthModal("login");
      } else {
        toast.error("Failed to load your coupons");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout, openAuthModal]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClaimSuccess = (newClaim: PromotionClaim) => {
    toast.success("Coupon claimed successfully!");
    setUserClaims((prev) => [newClaim, ...prev]);
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
          <Gift className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In Required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sign in to view your available coupons, claim special discounts, and track vouchers.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Segment user claims
  const claimedList = userClaims.filter((c) => c.status === "claimed");
  const redeemedList = userClaims.filter((c) => c.status === "redeemed");
  const expiredList = userClaims.filter((c) => c.status === "expired");

  const tabs = [
    { key: "available", label: "Available", count: claimablePromotions.length, icon: Sparkles },
    { key: "claimed", label: "Claimed", count: claimedList.length, icon: Gift },
    { key: "redeemed", label: "Redeemed", count: redeemedList.length, icon: CheckCircle2 },
    { key: "expired", label: "Expired", count: expiredList.length, icon: Clock },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-white/5">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 mb-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Coupons & Discounts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Available discounts, promo codes, and rewards for your account
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm self-start sm:self-auto"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Browse Products
        </Link>
      </div>

      {/* 2. Segmented Pill Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-xl w-fit overflow-x-auto text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-[#0f131f] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? "bg-gray-100 dark:bg-white/10 text-slate-800 dark:text-slate-200"
                    : "bg-gray-200/60 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading coupons...</p>
        </div>
      ) : activeTab === "available" ? (
        <div>
          {claimablePromotions.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">No available claimable coupons</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Check back soon for new promotions, seasonal discounts, and special offers!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div>
          {claimedList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">No claimed coupons</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Switch to &quot;Available&quot; to claim discount coupons to your account.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("available")}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                View Available Coupons
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claimedList.map((claim) => (
                <CouponCard
                  key={claim.id}
                  promotion={claim.promotion as any}
                  userClaim={claim}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "redeemed" ? (
        <div>
          {redeemedList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">No redeemed coupons</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Coupons that you have already applied to past orders will be archived here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {redeemedList.map((claim) => (
                <CouponCard
                  key={claim.id}
                  promotion={claim.promotion as any}
                  userClaim={claim}
                  disabled
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {expiredList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">No expired coupons</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                All of your coupons are currently active.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expiredList.map((claim) => (
                <CouponCard
                  key={claim.id}
                  promotion={claim.promotion as any}
                  userClaim={claim}
                  disabled
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
