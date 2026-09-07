"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  Clock,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { StoreCreditAccount, StoreCreditTransaction } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function CustomerStoreCreditPage() {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [account, setAccount] = useState<StoreCreditAccount | null>(null);
  const [transactions, setTransactions] = useState<StoreCreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStoreCredit = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.getMyStoreCredit();
      setAccount({
        id: 0,
        user_id: 0,
        balance: res.balance,
        total_credited: res.total_credited,
        total_debited: res.total_debited,
        is_frozen: res.is_frozen,
        updated_at: new Date().toISOString(),
      });
      setTransactions(res.transactions?.data || []);
    } catch (err: any) {
      toast.error("Failed to load store credit details");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadStoreCredit();
  }, [loadStoreCredit]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
          <Wallet className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-black text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">
          Sign in to view your store credit balance, refunds, and transaction history.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="px-8 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
        >
          Sign In to Access Store Credit
        </button>
      </div>
    );
  }

  const balance = Number(account?.balance || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#131d2e] to-[#0a101a] border border-cyan-500/20 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Store Credit Wallet</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Use your store credit balance seamlessly at checkout. Credits can be stacked with promotional discount codes.
            </p>
          </div>

          {/* Current Balance Card */}
          <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-1 min-w-[240px] shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Available Store Credit Balance
            </span>
            <div className="text-3xl font-black font-mono text-cyan-400">
              ৳{balance.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Ready for 1-click checkout deduction
            </div>
          </div>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-[#0e121e] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black font-mono text-white">
              ৳{Number(account?.total_credited || 0).toLocaleString()}
            </span>
            <p className="text-xs text-slate-400">Lifetime Credited</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e121e] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black font-mono text-white">
              ৳{Number(account?.total_debited || 0).toLocaleString()}
            </span>
            <p className="text-xs text-slate-400">Redeemed in Purchases</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e121e] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black text-white">Direct Deduct</span>
            <p className="text-xs text-slate-400">Usable on Any Hardware</p>
          </div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Credit Activity & Audit Ledger
          </h3>
          <button
            onClick={() => loadStoreCredit()}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c0e17] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase font-semibold">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Balance After</th>
                  <th className="p-4">Reason / Order Memo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading wallet ledger...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                      <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      No store credit transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isCredit =
                      tx.type === "credit" ||
                      tx.type === "refund" ||
                      tx.type === "reward";
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                              isCredit
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3" />
                            )}
                            {tx.type}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap font-mono font-bold">
                          <span className={isCredit ? "text-emerald-400" : "text-rose-400"}>
                            {isCredit ? "+" : "-"}৳{Number(tx.amount).toLocaleString()}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap font-mono text-white">
                          ৳{Number(tx.balance_after).toLocaleString()}
                        </td>

                        <td className="p-4 text-slate-300 max-w-sm truncate">
                          {tx.reason}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
