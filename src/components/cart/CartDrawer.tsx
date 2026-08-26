"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getShipping,
    getTax,
    getTotal,
    getItemCount,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();
  const itemCount = getItemCount();

  // Free shipping threshold = $100
  const freeShippingThreshold = 100;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const result = await api.validateCoupon(couponInput, subtotal);
      if (result.valid) {
        applyCoupon(result);
        setCouponInput("");
      } else {
        setCouponError(result.message || "Invalid coupon code.");
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Failed to validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="w-screen max-w-md bg-[#0d1019] border-l border-white/10 shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Your Studio Cart</h3>
                    <span className="text-[11px] text-slate-400">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors mr-2"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={closeCart}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Free Shipping Progress Meter */}
              {items.length > 0 && (
                <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-5 py-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      {amountToFreeShipping === 0 ? (
                        <span className="text-cyan-300 font-bold">Unlocked Free Express Shipping!</span>
                      ) : (
                        <span>Add <span className="text-white font-bold">{formatPrice(amountToFreeShipping)}</span> more for Free Shipping</span>
                      )}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-400">{Math.round(freeShippingProgress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-slate-500" />
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">Your cart is empty</h4>
                    <p className="text-xs text-slate-400 max-w-xs mb-6">
                      Explore our precision acoustic headphones, mechanical keyboards, and modular daily essentials.
                    </p>
                    <button
                      onClick={closeCart}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                      Start Exploring
                    </button>
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const img = item.product.primary_image?.image_url || item.product.images?.[0]?.image_url;
                    const itemPrice = Number(item.product.price) + (item.variant ? Number(item.variant.price_modifier) : 0);

                    return (
                      <motion.div
                        key={`${item.product.id}-${item.variant?.id ?? "none"}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
                      >
                        {/* Thumbnail */}
                        {img && (
                          <img
                            src={img}
                            alt={item.product.name}
                            className="w-18 h-18 rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0"
                          />
                        )}

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-white truncate">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => removeItem(item.product.id, item.variant?.id)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {item.variant && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                  {item.variant.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                            <span className="text-xs font-black text-cyan-400">
                              {formatPrice(itemPrice * item.quantity)}
                            </span>

                            <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-white/10">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-white w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)}
                                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {items.length > 0 && (
                <div className="p-5 border-t border-white/10 bg-[#090b12] space-y-4">
                  {/* Promo Code Input */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-emerald-300">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-emerald-400/80">(-{formatPrice(discount)})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] text-slate-400 hover:text-rose-400 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Promo Code (e.g. WELCOME20)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8.5 pr-3 py-2 text-xs text-white placeholder:text-slate-500 uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={couponLoading || !couponInput.trim()}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {couponLoading ? "..." : "Apply"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1 pt-1">
                          <AlertCircle className="w-3 h-3" /> {couponError}
                        </p>
                      )}
                    </form>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>Coupon Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Estimated Shipping</span>
                      <span className="text-white font-medium">
                        {shipping === 0 ? <span className="text-cyan-400 font-bold">FREE</span> : formatPrice(shipping)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Tax (8%)</span>
                      <span className="text-white font-medium">{formatPrice(tax)}</span>
                    </div>

                    <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/10">
                      <span>Estimated Total</span>
                      <span className="text-cyan-400 text-base">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white text-xs font-extrabold tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
