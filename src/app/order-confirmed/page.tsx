"use client";

import { use, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  Sparkles,
  Download,
  Copy
} from "lucide-react";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number") || "ORD-2026-98421";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) return;
      try {
        const data = await api.getOrder(orderNumber);
        setOrder(data);
      } catch (err) {
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 shadow-2xl shadow-emerald-500/25 mx-auto">
          <div className="w-full h-full bg-[#0d1017] rounded-[22px] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-cyan-400 block">
          Order Successfully Dispatched to Studio Lab
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Thank you, {order?.customer_name || "Valued Customer"}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          We are preparing your acoustic hardware for calibration and express dispatch. A receipt has been sent to{" "}
          <span className="text-white font-bold">{order?.customer_email || "your email"}</span>.
        </p>
      </motion.div>

      {/* Order Info Card */}
      <div className="p-6 rounded-3xl bg-[#0e121e] border border-white/10 shadow-2xl space-y-6">
        
        {/* Order Meta Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Order Reference
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-black text-white font-mono">{orderNumber}</span>
              <button
                onClick={() => copyToClipboard(orderNumber)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
                title="Copy order number"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fulfillment Status
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 mt-0.5">
                <Sparkles className="w-3 h-3" /> Processing
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Estimated Delivery
              </span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">2-3 Business Days</span>
            </div>
          </div>
        </div>

        {/* Tracking Code if Available */}
        {order?.tracking_code && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-white font-bold block">{order.carrier || "DHL Express Priority"}</span>
                <span className="text-slate-400 font-mono text-[11px]">Tracking: {order.tracking_code}</span>
              </div>
            </div>

            <Link
              href={`/track?number=${order.tracking_code}`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center transition-all"
            >
              Track Package →
            </Link>
          </div>
        )}

        {/* Line Items List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Purchased Hardware</h3>
          <div className="divide-y divide-white/5">
            {order?.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-white">{item.product_name}</h4>
                      {item.variant_name && (
                        <p className="text-[11px] text-slate-400">{item.variant_name}</p>
                      )}
                      <span className="text-slate-500 text-[10px]">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-white">{formatPrice(item.total_price)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-2">Items successfully logged in order system.</p>
            )}
          </div>
        </div>

        {/* Total Summary */}
        <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-white">{formatPrice(order?.subtotal || 349)}</span>
          </div>
          {order?.discount_amount && order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Coupon Savings</span>
              <span>-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-white">
              {order?.shipping_amount === 0 ? "FREE" : formatPrice(order?.shipping_amount || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Taxes</span>
            <span className="text-white">{formatPrice(order?.tax_amount || 26.32)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
            <span>Total Paid</span>
            <span className="text-cyan-400 text-lg">{formatPrice(order?.total_amount || 375.32)}</span>
          </div>
        </div>

        {/* Shipping Address Snapshot */}
        {order?.shipping_address && (
          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block mb-1">Shipping Destination:</span>
            <p className="text-white font-medium">{order.shipping_address.full_name}</p>
            <p>{order.shipping_address.address_line1}</p>
            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}, {order.shipping_address.country}</p>
          </div>
        )}

      </div>

      {/* Next Step Action CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white text-center transition-all"
        >
          View in Dashboard
        </Link>
        <Link
          href="/products"
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white text-xs font-black uppercase tracking-wider text-center transition-all shadow-xl shadow-indigo-500/25"
        >
          Continue Shopping <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Order Confirmation...</div>}>
      <OrderConfirmedContent />
    </Suspense>
  );
}
