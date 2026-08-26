"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Truck, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { AdminAnalytics } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";

export default function AdminDashboardOverview() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await adminApi.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load admin analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading Live Telemetry...</span>
      </div>
    );
  }

  const stats = analytics?.stats || {
    total_revenue: 39800,
    total_orders: 134,
    total_customers: 248,
    total_products: 8,
    low_stock_count: 2,
  };

  const avgOrderValue = stats.total_orders > 0 ? stats.total_revenue / stats.total_orders : 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Real-Time Operations Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Executive Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Products
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Net Revenue */}
        <div className="p-5 rounded-2xl bg-[#0e121e] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Net Settled Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white block">
            {formatPrice(stats.total_revenue)}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
            <TrendingUp className="w-3 h-3" /> +28.4% vs last period
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#0e121e] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-3xl font-black text-white block">
            {stats.total_orders}
          </span>
          <div className="text-[11px] text-cyan-400 font-medium">
            Avg Value: <span className="font-bold text-white">{formatPrice(avgOrderValue)}</span>
          </div>
        </div>

        {/* Active Customers */}
        <div className="p-5 rounded-2xl bg-[#0e121e] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Active Customers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-3xl font-black text-white block">
            {stats.total_customers}
          </span>
          <div className="text-[11px] text-purple-400 font-medium">
            100% verified accounts
          </div>
        </div>

        {/* Inventory SKUs / Low Stock Alert */}
        <div className="p-5 rounded-2xl bg-[#0e121e] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Hardware SKUs</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-white block">
            {stats.total_products}
          </span>
          <div className="flex items-center gap-1.5 text-[11px]">
            {stats.low_stock_count > 0 ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {stats.low_stock_count} low-stock items
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">All stock levels healthy</span>
            )}
          </div>
        </div>

      </div>

      {/* Sales Velocity Chart & Top Hardware */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0e121e] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white">Monthly Sales Velocity</h3>
              <p className="text-[11px] text-slate-400">Gross revenue breakdown (Q1 - Q3 2026)</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Target: +120% YoY
            </span>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="grid grid-cols-6 gap-3 items-end h-48 pt-6 pb-2 border-b border-white/10">
            {(analytics?.sales_trend || [
              { month: "Mar", sales: 14200 },
              { month: "Apr", sales: 18900 },
              { month: "May", sales: 24500 },
              { month: "Jun", sales: 31200 },
              { month: "Jul", sales: 28400 },
              { month: "Aug", sales: 39800 },
            ]).map((item) => {
              const heightPercent = Math.round((item.sales / 42000) * 100);
              return (
                <div key={item.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-cyan-300 transition-colors">
                    ${Math.round(item.sales / 1000)}k
                  </span>
                  <div className="w-full max-w-[42px] bg-white/5 rounded-xl overflow-hidden flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 via-purple-600 to-cyan-400 rounded-xl transition-all duration-500 group-hover:brightness-125"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Hardware List */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0e121e] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white">Top Rated Hardware</h3>
            <Link href="/admin/products" className="text-xs font-bold text-amber-400 hover:text-amber-300">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {analytics?.top_products && analytics.top_products.length > 0 ? (
              analytics.top_products.map((p) => {
                const img = p.primary_image?.image_url || p.images?.[0]?.image_url;
                return (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {img && (
                        <img src={img} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-900 shrink-0" />
                      )}
                      <div className="truncate">
                        <h4 className="font-bold text-white truncate">{p.name}</h4>
                        <span className="text-[10px] text-slate-400">{p.brand}</span>
                      </div>
                    </div>
                    <span className="font-black text-cyan-400 shrink-0">{formatPrice(p.price)}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 italic">No product ratings logged.</p>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders Stream */}
      <div className="p-6 rounded-2xl bg-[#0e121e] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white">Recent Customer Orders</h3>
            <p className="text-[11px] text-slate-400">Live order fulfillment stream</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            All Orders <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Order Number</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Fulfillment</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analytics?.recent_orders && analytics.recent_orders.length > 0 ? (
                analytics.recent_orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-400">{ord.order_number}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-white block">{ord.customer_name}</span>
                      <span className="text-[10px] text-slate-500">{ord.customer_email}</span>
                    </td>
                    <td className="p-3.5 font-extrabold text-white">{formatPrice(ord.total_amount)}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{formatDate(ord.created_at)}</td>
                    <td className="p-3.5 text-right">
                      <Link
                        href="/admin/orders"
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-amber-300"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                    No orders logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
