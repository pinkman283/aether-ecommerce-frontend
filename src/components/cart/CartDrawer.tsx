"use client";

import { useState, useEffect } from "react";
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
import { useThemeStore } from "@/store/useThemeStore";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";

export function CartDrawer() {
  const router = useRouter();
  const { theme } = useThemeStore();
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
    promotionEvaluation,
    setPromotionEvaluation,
    getSubtotal,
    getDiscount,
    getItemCount,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const itemCount = getItemCount();

  // Auto-evaluate promotions on cart change
  useEffect(() => {
    if (!isCartOpen || items.length === 0) return;

    let isMounted = true;
    const evaluate = async () => {
      try {
        const payload = {
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            price: Number(i.product.price) + (i.variant ? Number(i.variant.price_modifier) : 0),
            category_id: (i.product as any).category_id,
          })),
          code: appliedCoupon?.code || undefined,
        };
        const res = await api.evaluatePromotions(payload);
        if (isMounted && res.valid) {
          setPromotionEvaluation(res);
        }
      } catch (e) {
        // silent fallback
      }
    };
    evaluate();
    return () => {
      isMounted = false;
    };
  }, [isCartOpen, items, appliedCoupon?.code, setPromotionEvaluation]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const payload = {
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price: Number(i.product.price) + (i.variant ? Number(i.variant.price_modifier) : 0),
          category_id: (i.product as any).category_id,
        })),
        code: couponInput.trim(),
      };
      const result = await api.evaluatePromotions(payload);
      if (result.valid) {
        setPromotionEvaluation(result);
        applyCoupon({
          valid: true,
          code: couponInput.trim().toUpperCase(),
          discount_type: (result.applied_promotions?.[0]?.discount_type as any) || "fixed",
          value: result.total_discount,
          discount_amount: result.total_discount,
          message: result.message || "Promotion applied!",
        });
        setCouponInput("");
      } else {
        setCouponError(result.error_message || "Invalid or ineligible promotion code.");
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
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="w-screen max-w-md border-l shadow-2xl flex flex-col justify-between transition-colors"
              style={{
                backgroundColor: "var(--theme-card-bg, #ffffff)",
                borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.1))",
                color: "var(--theme-text-body, #64748b)"
              }}
            >
              {/* Drawer Header */}
              <div 
                className="p-5 border-b flex items-center justify-between transition-colors"
                style={{ borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.1))" }}
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                    style={{ 
                      backgroundColor: "color-mix(in srgb, var(--theme-primary, #6366f1) 12%, transparent)", 
                      borderColor: "color-mix(in srgb, var(--theme-primary, #6366f1) 28%, transparent)" 
                    }}
                  >
                    <ShoppingBag 
                      className="w-4 h-4" 
                      style={{ color: "var(--theme-primary, #6366f1)" }} 
                    />
                  </div>
                  <div>
                    <h3 
                      className="text-sm font-bold leading-none mb-1"
                      style={{ color: "var(--theme-text-heading, #0f172a)" }}
                    >
                      Your Studio Cart
                    </h3>
                    <span 
                      className="text-[11px]"
                      style={{ color: "var(--theme-text-body, #64748b)" }}
                    >
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-[11px] hover:text-rose-500 transition-colors mr-2 cursor-pointer font-medium"
                      style={{ color: "var(--theme-text-body, #64748b)" }}
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={closeCart}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
                    style={{ color: "var(--theme-text-body, #64748b)" }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div 
                      className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 transition-colors"
                      style={{ 
                        backgroundColor: "color-mix(in srgb, var(--theme-primary, #6366f1) 10%, transparent)", 
                        borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.1))" 
                      }}
                    >
                      <ShoppingBag 
                        className="w-8 h-8" 
                        style={{ color: "var(--theme-text-body, #64748b)" }} 
                      />
                    </div>
                    <h4 
                      className="text-base font-bold mb-1"
                      style={{ color: "var(--theme-text-heading, #0f172a)" }}
                    >
                      Your cart is empty
                    </h4>
                    <p 
                      className="text-xs max-w-xs mb-6"
                      style={{ color: "var(--theme-text-body, #64748b)" }}
                    >
                      Explore our precision acoustic headphones, mechanical keyboards, and modular daily essentials.
                    </p>
                    <button
                      onClick={closeCart}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg hover:brightness-105 active:scale-95"
                      style={{ 
                        backgroundColor: "var(--theme-btn-primary-bg, var(--theme-primary, #6366f1))", 
                        color: "var(--theme-btn-primary-text, #ffffff)",
                        boxShadow: "0 8px 24px -4px color-mix(in srgb, var(--theme-primary, #6366f1) 35%, transparent)"
                      }}
                    >
                      Start Exploring
                    </button>
                  </div>
                ) : (
                  items.map((item) => {
                    const img = item.product.primary_image?.image_url || item.product.images?.[0]?.image_url;
                    const itemPrice = Number(item.product.price) + (item.variant ? Number(item.variant.price_modifier) : 0);

                    return (
                      <motion.div
                        key={`${item.product.id}-${item.variant?.id ?? "none"}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-3.5 p-3 rounded-2xl border transition-all"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--theme-card-bg, #ffffff) 92%, var(--theme-bg, #f8fafc))",
                          borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.08))"
                        }}
                      >
                        {/* Thumbnail */}
                        {img && (
                          <div 
                            className="w-18 h-18 rounded-xl overflow-hidden border shrink-0 p-1 flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: "var(--theme-card-bg, #ffffff)",
                              borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.1))"
                            }}
                          >
                            <img
                              src={img}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 
                                className="text-xs font-bold truncate"
                                style={{ color: "var(--theme-text-heading, #0f172a)" }}
                              >
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => removeItem(item.product.id, item.variant?.id)}
                                className="hover:text-rose-500 transition-colors p-1 cursor-pointer"
                                style={{ color: "var(--theme-text-body, #64748b)" }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {item.variant && (
                              <div className="flex items-center gap-1.5 mt-1">
                                {item.variant.color_hex && (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-white/40 inline-block"
                                    style={{ backgroundColor: item.variant.color_hex }}
                                  />
                                )}
                                <span 
                                  className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors"
                                  style={{
                                    backgroundColor: "color-mix(in srgb, var(--theme-primary, #6366f1) 12%, transparent)",
                                    color: "var(--theme-primary, #6366f1)",
                                    borderColor: "color-mix(in srgb, var(--theme-primary, #6366f1) 25%, transparent)"
                                  }}
                                >
                                  {item.variant.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Price & Quantity Controls */}
                          <div 
                            className="flex items-center justify-between mt-2 pt-1 border-t"
                            style={{ borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.08))" }}
                          >
                            <span 
                              className="text-xs font-black"
                              style={{ color: "var(--theme-primary, #6366f1)" }}
                            >
                              {formatPrice(itemPrice * item.quantity)}
                            </span>

                            <div 
                              className="flex items-center gap-2 rounded-lg p-1 border transition-colors"
                              style={{
                                backgroundColor: "color-mix(in srgb, var(--theme-card-bg, #ffffff) 70%, var(--theme-bg, #f8fafc))",
                                borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.1))"
                              }}
                            >
                              <button
                                onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                style={{ color: "var(--theme-text-body, #64748b)" }}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span 
                                className="text-xs font-bold w-4 text-center"
                                style={{ color: "var(--theme-text-heading, #0f172a)" }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                style={{ color: "var(--theme-text-body, #64748b)" }}
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
                <div 
                  className="p-5 border-t space-y-4 transition-colors"
                  style={{
                    backgroundColor: "var(--theme-card-bg, #ffffff)",
                    borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.1))"
                  }}
                >
                  {/* Promo Code Input */}
                  {appliedCoupon ? (
                    <div 
                      className="flex items-center justify-between p-2.5 rounded-xl border text-xs"
                      style={{
                        backgroundColor: "color-mix(in srgb, #10b981 12%, transparent)",
                        borderColor: "color-mix(in srgb, #10b981 25%, transparent)"
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">(-{formatPrice(discount)})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] hover:text-rose-500 font-semibold cursor-pointer transition-colors"
                        style={{ color: "var(--theme-text-body, #64748b)" }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag 
                            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" 
                            style={{ color: "var(--theme-text-body, #64748b)" }}
                          />
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Promo Code (e.g. WELCOME20)"
                            className="w-full rounded-xl pl-8.5 pr-3 py-2 text-xs uppercase tracking-wider focus:outline-none transition-colors border"
                            style={{
                              backgroundColor: "color-mix(in srgb, var(--theme-bg, #f8fafc) 85%, var(--theme-card-bg, #ffffff))",
                              borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.12))",
                              color: "var(--theme-text-heading, #0f172a)"
                            }}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={couponLoading || !couponInput.trim()}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md hover:brightness-110 active:scale-95"
                          style={{
                            backgroundColor: "var(--theme-primary, #6366f1)",
                            color: "var(--theme-btn-primary-text, #ffffff)",
                            boxShadow: "0 4px 14px -2px color-mix(in srgb, var(--theme-primary, #6366f1) 35%, transparent)"
                          }}
                        >
                          {couponLoading ? "..." : "Apply"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-rose-500 flex items-center gap-1 pt-1 font-medium">
                          <AlertCircle className="w-3 h-3" /> {couponError}
                        </p>
                      )}
                    </form>
                  )}

                  {/* Pricing Breakdown */}
                  <div 
                    className="space-y-2 text-xs pt-3 border-t"
                    style={{ 
                      color: "var(--theme-text-body, #64748b)",
                      borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.08))"
                    }}
                  >
                    {discount > 0 ? (
                      <>
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span 
                            className="font-medium"
                            style={{ color: "var(--theme-text-heading, #0f172a)" }}
                          >
                            {formatPrice(subtotal)}
                          </span>
                        </div>

                        {/* Promotion Breakdown List */}
                        {promotionEvaluation?.valid && promotionEvaluation.applied_promotions.length > 0 ? (
                          <div 
                            className="space-y-1.5 p-2 rounded-lg border my-1"
                            style={{
                              backgroundColor: "color-mix(in srgb, var(--theme-primary, #6366f1) 5%, transparent)",
                              borderColor: "color-mix(in srgb, var(--theme-primary, #6366f1) 15%, transparent)"
                            }}
                          >
                            {promotionEvaluation.applied_promotions.map((p, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] text-amber-500 dark:text-amber-300">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  {p.promotion_name} {p.code ? `(${p.code})` : ""}
                                </span>
                                <span className="font-mono font-bold">
                                  {p.discount_amount > 0 ? `-${formatPrice(p.discount_amount)}` : "Applied"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                            <span>Discount</span>
                            <span>-{formatPrice(discount)}</span>
                          </div>
                        )}

                        <div 
                          className="flex justify-between text-sm font-black pt-2 border-t"
                          style={{ borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.1))" }}
                        >
                          <span style={{ color: "var(--theme-text-heading, #0f172a)" }}>Total</span>
                          <span className="text-base font-black" style={{ color: "var(--theme-primary, #6366f1)" }}>
                            {formatPrice(Math.max(0, subtotal - discount))}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div 
                        className="flex justify-between text-sm font-black py-1"
                      >
                        <span style={{ color: "var(--theme-text-heading, #0f172a)" }}>Subtotal</span>
                        <span className="text-base font-black" style={{ color: "var(--theme-primary, #6366f1)" }}>
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 rounded-xl text-xs font-extrabold tracking-wide uppercase flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-[0.99] cursor-pointer shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, var(--theme-btn-primary-bg, var(--theme-primary, #6366f1)), var(--theme-secondary, var(--theme-primary, #6366f1)))",
                      color: "var(--theme-btn-primary-text, #ffffff)",
                      boxShadow: "0 10px 28px -4px color-mix(in srgb, var(--theme-primary, #6366f1) 40%, transparent)"
                    }}
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Cart Trust Reassurance Strip */}
                  <div 
                    className="pt-2 flex items-center justify-between text-[10px] border-t"
                    style={{ 
                      color: "var(--theme-text-body, #64748b)",
                      borderColor: "var(--theme-card-border, rgba(255, 255, 255, 0.08))"
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <span 
                        className="w-1.5 h-1.5 rounded-full inline-block" 
                        style={{ backgroundColor: "var(--theme-primary, #6366f1)" }}
                      /> Cash on Delivery
                    </span>
                    <span className="flex items-center gap-1">
                      <span 
                        className="w-1.5 h-1.5 rounded-full inline-block" 
                        style={{ backgroundColor: "var(--theme-secondary, var(--theme-primary, #6366f1))" }}
                      /> Express Dispatch
                    </span>
                    <span className="flex items-center gap-1">
                      <span 
                        className="w-1.5 h-1.5 rounded-full inline-block" 
                        style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary, #6366f1) 65%, #10b981)" }}
                      /> 100% Authentic
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
