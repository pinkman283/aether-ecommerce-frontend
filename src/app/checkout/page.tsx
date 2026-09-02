"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Banknote,
  Tag,
  Plus,
  Minus,
  Trash2,
  LogIn,
  UserPlus,
  Check,
  Info,
  ChevronDown
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
  } = useCartStore();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();

  // Form State (Single-Page Low Friction Checkout)
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [shippingArea, setShippingArea] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");
  const [fullAddress, setFullAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "credit_card">("cash_on_delivery");

  // Card Simulation (Optional for instant card testing)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Promo Code State
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission & Lead State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<number | null>(null);

  // Sync logged in user details
  useEffect(() => {
    if (user) {
      if (user.name && !customerName) setCustomerName(user.name);
      if (user.phone && !customerPhone) setCustomerPhone(user.phone);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  // Pricing calculations
  const subtotal = getSubtotal();
  const discount = getDiscount();

  const insideDhakaRate = theme.shipping_inside_dhaka_rate ?? 60;
  const outsideDhakaRate = theme.shipping_outside_dhaka_rate ?? 120;
  const freeShippingThreshold = theme.shipping_free_threshold ?? 100;

  const baseShippingRate = shippingArea === "inside_dhaka" ? insideDhakaRate : outsideDhakaRate;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const effectiveShipping = isFreeShipping ? 0 : baseShippingRate;

  const total = Math.max(0, subtotal - discount) + effectiveShipping;

  // Phone input handler enforcing digits & 11 max chars
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 11);
    setCustomerPhone(val);
  };

  // Coupon handling
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const result = await api.validateCoupon(couponInput.trim(), subtotal);
      if (result.valid) {
        applyCoupon(result);
        setCouponInput("");
        toast.success(`Promo code "${result.code}" applied!`);
      } else {
        setCouponError(result.message || "Invalid promo code.");
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Failed to validate promo code.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Background Checkout Abandonment Lead Capture
  useEffect(() => {
    if (!customerName?.trim() || !customerPhone?.trim() || items.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const res = await api.captureLead({
          lead_id: leadId,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || null,
          address: fullAddress.trim() || null,
          city: shippingArea === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka",
          postal_code: null,
          cart_items: items.map((i) => ({
            product_id: i.product.id,
            title: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            image: i.product.primary_image?.image_url || i.product.images?.[0]?.image_url,
            variant_id: i.variant?.id ?? null,
            variant_name: i.variant?.name ?? null,
          })),
          total_amount: total,
        });
        if (res?.lead_id) {
          setLeadId(res.lead_id);
        }
      } catch (err) {
        // Silently handle background lead capture
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [customerName, customerPhone, customerEmail, fullAddress, shippingArea, items, total, leadId]);

  // Order Submission Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      toast.error("Please enter a valid 11-digit mobile number starting with 01 (e.g. 017XXXXXXXX).");
      return;
    }

    if (!fullAddress.trim()) {
      toast.error("Please enter your complete delivery address.");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please accept the Terms & Conditions and Privacy Policy to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || `${cleanPhone}@guest.store`,
        customer_phone: cleanPhone,
        shipping_address: {
          full_name: customerName.trim(),
          address_line1: fullAddress.trim(),
          address_line2: orderNotes.trim() ? `Note: ${orderNotes.trim()}` : "",
          city: shippingArea === "inside_dhaka" ? "Dhaka" : "Outside Dhaka",
          district: shippingArea === "inside_dhaka" ? "Dhaka" : "Outside Dhaka",
          country: "Bangladesh",
          phone: cleanPhone,
        },
        billing_address: {
          full_name: customerName.trim(),
          address_line1: fullAddress.trim(),
          city: shippingArea === "inside_dhaka" ? "Dhaka" : "Outside Dhaka",
          country: "Bangladesh",
        },
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code,
        notes: orderNotes.trim() || undefined,
        items: items.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant?.id ?? null,
          quantity: item.quantity,
        })),
      };

      const res = await api.createOrder(orderPayload);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#06b6d4", "#a855f7", "#ec4899", "#f59e0b"],
        });
      } catch (e) {}

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order-confirmed?order_number=${res.order.order_number}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to process order. Please verify your details.");
      toast.error(err.response?.data?.message || "Failed to process order.");
    } finally {
      setLoading(false);
    }
  };

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Add products to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl theme-btn-primary text-xs font-bold shadow-lg cursor-pointer"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      
      {/* Top Quick Auth Strip (For Guest Users) */}
      {!isAuthenticated && (
        <div className="p-3 sm:p-4 rounded-xl theme-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Have an account? Please login or register for fast checkout.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("register")}
              className="px-4 py-1.5 rounded-lg theme-btn-primary text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" /> Register
            </button>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        {/* Main 2-Column Responsive Checkout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Order Review & Shipping Address              */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. ORDER REVIEW CARD */}
            <div className="p-5 sm:p-6 rounded-2xl theme-card border border-white/10 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="w-1.5 h-4.5 rounded-full bg-cyan-400" />
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Order Review
                </h3>
                <span className="ml-auto text-[11px] font-bold text-slate-400">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 divide-y divide-white/5">
                {items.map((item) => {
                  const itemPrice = Number(item.product.price) + (item.variant ? Number(item.variant.price_modifier) : 0);
                  const imageUrl = item.product.primary_image?.image_url || item.product.images?.[0]?.image_url || "/placeholder.png";

                  return (
                    <div
                      key={`${item.product.id}-${item.variant?.id ?? "none"}`}
                      className="pt-3 first:pt-0 flex items-center gap-3 sm:gap-4"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details & Variant */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                          {item.product.name}
                        </h4>

                        {/* Variant / Color pill */}
                        {(item.selectedColor || item.selectedSize || item.variant?.name) && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            {item.variant?.name && <span>{item.variant.name}</span>}
                            {item.selectedColor && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-white/5 border border-white/10">
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10">
                                {item.selectedSize}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Inline Quantity Stepper */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span 
                            className="text-[11px] font-semibold"
                            style={{ color: "var(--theme-text-body, #64748b)" }}
                          >
                            Qty:
                          </span>
                          <div className="flex items-center border border-black/15 dark:border-white/15 rounded-lg bg-black/5 dark:bg-white/5 overflow-hidden shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                              className="px-2 py-1 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span 
                              className="px-2.5 py-0.5 text-xs font-black font-mono min-w-[22px] text-center"
                              style={{ color: "var(--theme-text-heading, #0f172a)" }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)}
                              className="px-2 py-1 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price & Remove Button */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span 
                          className="text-xs sm:text-sm font-black font-mono"
                          style={{ color: "var(--theme-text-heading, #0f172a)" }}
                        >
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id, item.variant?.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                          title="Remove item from order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. SHIPPING ADDRESS CARD */}
            <div className="p-5 sm:p-6 rounded-2xl theme-card border border-white/10 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="w-1.5 h-4.5 rounded-full bg-cyan-400" />
                <h3 
                  className="text-sm sm:text-base font-black tracking-tight"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Shipping Address
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Full Name */}
                <div className="space-y-1">
                  <label 
                    className="text-[11px] font-bold block"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full theme-input rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                {/* 2-Column Row: Phone Number & Shipping Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label 
                      className="text-[11px] font-bold block"
                      style={{ color: "var(--theme-text-heading, #0f172a)" }}
                    >
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      placeholder="01XXXXXXXXX"
                      className="w-full theme-input rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>

                  {/* Shipping Area Dropdown */}
                  <div className="space-y-1">
                    <label 
                      className="text-[11px] font-bold block"
                      style={{ color: "var(--theme-text-heading, #0f172a)" }}
                    >
                      Shipping Area <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={shippingArea}
                        onChange={(e) => setShippingArea(e.target.value as "inside_dhaka" | "outside_dhaka")}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 text-xs appearance-none pr-8 focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
                      >
                        <option value="inside_dhaka">
                          Inside Dhaka ({formatPrice(insideDhakaRate)})
                        </option>
                        <option value="outside_dhaka">
                          Outside Dhaka ({formatPrice(outsideDhakaRate)})
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Email Address (Moved above Full Address per user request) */}
                <div className="space-y-1">
                  <label 
                    className="text-[11px] font-bold block"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    Email Address <span className="text-[10px] text-slate-500 font-normal">(Optional - for order receipt)</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full theme-input rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                {/* Full Address Textarea */}
                <div className="space-y-1">
                  <label 
                    className="text-[11px] font-bold block"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    Full Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="House number, road/street, area, landmark, city..."
                    className="w-full theme-input rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-400 transition-all leading-relaxed"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Payment Method & Order Summary              */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">

            {/* 3. PAYMENT METHOD CARD */}
            <div className="p-5 sm:p-6 rounded-2xl theme-card border border-white/10 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="w-1.5 h-4.5 rounded-full bg-cyan-400" />
                <h3 
                  className="text-sm sm:text-base font-black tracking-tight"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Payment Method
                </h3>
              </div>

              {/* Payment Selectable Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Cash On Delivery Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash_on_delivery")}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    paymentMethod === "cash_on_delivery"
                      ? "border-cyan-400 bg-cyan-500/10 shadow-md shadow-cyan-500/10"
                      : "border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-cyan-400/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 shrink-0">
                      <Banknote className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <span 
                        className="font-black block text-xs"
                        style={{ color: "var(--theme-text-heading, #0f172a)" }}
                      >
                        Cash On Delivery
                      </span>
                      <span 
                        className="text-[10px]"
                        style={{ color: "var(--theme-text-body, #64748b)" }}
                      >
                        Pay upon arrival
                      </span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod === "cash_on_delivery" ? "border-cyan-400 bg-cyan-400" : "border-slate-400"
                  }`}>
                    {paymentMethod === "cash_on_delivery" && <Check className="w-2.5 h-2.5 text-slate-950 stroke-3" />}
                  </div>
                </button>

                {/* Online Card / Instant Payment Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("credit_card")}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    paymentMethod === "credit_card"
                      ? "border-cyan-400 bg-cyan-500/10 shadow-md shadow-cyan-500/10"
                      : "border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-cyan-400/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 shrink-0">
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <span 
                        className="font-black block text-xs"
                        style={{ color: "var(--theme-text-heading, #0f172a)" }}
                      >
                        Online Card / Pay
                      </span>
                      <span 
                        className="text-[10px]"
                        style={{ color: "var(--theme-text-body, #64748b)" }}
                      >
                        Cards, MFS & Banking
                      </span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod === "credit_card" ? "border-cyan-400 bg-cyan-400" : "border-slate-400"
                  }`}>
                    {paymentMethod === "credit_card" && <Check className="w-2.5 h-2.5 text-slate-950 stroke-3" />}
                  </div>
                </button>
              </div>

              {/* Online Payment Inputs if Credit Card selected */}
              {paymentMethod === "credit_card" && (
                <div className="space-y-3 p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 text-xs">
                  <div className="space-y-1">
                    <label 
                      className="text-[11px] font-bold block"
                      style={{ color: "var(--theme-text-heading, #0f172a)" }}
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label 
                        className="text-[11px] font-bold block"
                        style={{ color: "var(--theme-text-heading, #0f172a)" }}
                      >
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full theme-input rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label 
                        className="text-[11px] font-bold block"
                        style={{ color: "var(--theme-text-heading, #0f172a)" }}
                      >
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        className="w-full theme-input rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. ORDER SUMMARY CARD */}
            <div className="p-5 sm:p-6 rounded-2xl theme-card border border-white/10 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="w-1.5 h-4.5 rounded-full bg-cyan-400" />
                <h3 
                  className="text-sm sm:text-base font-black tracking-tight"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Order Summary
                </h3>
              </div>

              {/* In-Card Promo Code Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-300">{appliedCoupon.code}</span>
                    <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">(-{formatPrice(discount)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[11px] text-slate-400 hover:text-rose-500 font-bold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Coupon Code"
                        className="w-full theme-input rounded-xl pl-8.5 pr-3 py-2 text-xs uppercase tracking-wider focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer border border-white/10"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 pt-1">
                      <AlertCircle className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                </div>
              )}

              {/* Line Items Pricing Breakdown */}
              <div className="space-y-2 text-xs pt-2 border-t border-white/5">
                <div 
                  className="flex justify-between"
                  style={{ color: "var(--theme-text-body, #64748b)" }}
                >
                  <span>Subtotal</span>
                  <span 
                    className="font-bold font-mono"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div 
                  className="flex justify-between"
                  style={{ color: "var(--theme-text-body, #64748b)" }}
                >
                  <span>Delivery Charge</span>
                  <span 
                    className="font-bold font-mono"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    {effectiveShipping === 0 ? (
                      <span className="text-cyan-500 font-bold">FREE</span>
                    ) : (
                      formatPrice(effectiveShipping)
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold font-mono">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                {/* Bold Total Line */}
                <div className="flex justify-between items-center text-sm font-black pt-3 border-t border-black/10 dark:border-white/10">
                  <span style={{ color: "var(--theme-text-heading, #0f172a)" }}>Total</span>
                  <span className="text-lg text-cyan-500 font-mono font-black">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 text-cyan-400 focus:ring-0 focus:ring-offset-0 bg-white/5 cursor-pointer"
                  />
                  <span>
                    I have read and agree to the{" "}
                    <Link href="/terms" className="text-cyan-400 hover:underline">
                      Terms and Conditions
                    </Link>
                    ,{" "}
                    <Link href="/privacy" className="text-cyan-400 hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    &{" "}
                    <Link href="/refund-policy" className="text-cyan-400 hover:underline">
                      Refund Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Order Notes (Optional) */}
              <div className="space-y-1">
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Order notes (optional) - e.g. landmark, call before arrival..."
                  className="w-full theme-input rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* High-Conversion Confirm Order CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl theme-btn-primary hover:opacity-95 text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirm Order • {formatPrice(total)}</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      </form>

    </div>
  );
}
