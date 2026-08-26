"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  DollarSign
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    items, 
    clearCart, 
    appliedCoupon, 
    getSubtotal, 
    getDiscount, 
    getShipping, 
    getTax, 
    getTotal 
  } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  // Form State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerName, setCustomerName] = useState(user?.name || "Elena Rostova");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "customer@ecommerce.test");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "+1 (555) 876-5432");
  
  // Shipping Address
  const [addressLine1, setAddressLine1] = useState("742 Evergreen Terrace, Suite 400");
  const [addressLine2, setAddressLine2] = useState("Apt 12B");
  const [city, setCity] = useState("San Francisco");
  const [state, setState] = useState("CA");
  const [postalCode, setPostalCode] = useState("94107");
  const [country, setCountry] = useState("United States");

  // Shipping & Payment Method
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "cash_on_delivery" | "paypal" | "apple_pay">("credit_card");

  // Card Simulation
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = deliveryMethod === "priority" ? 25 : getShipping();
  const tax = getTax();
  const total = Math.max(0, subtotal - discount) + shipping + tax;

  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Add some studio hardware before proceeding to checkout.</p>
        <Link href="/products" className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
          Explore Products
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: {
          full_name: customerName,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          state,
          postal_code: postalCode,
          country,
          phone: customerPhone,
        },
        billing_address: {
          full_name: customerName,
          address_line1: addressLine1,
          city,
          postal_code: postalCode,
          country,
        },
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code,
        items: items.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant?.id ?? null,
          quantity: item.quantity,
        })),
      };

      const res = await api.createOrder(orderPayload);

      // Trigger Celebration Canvas Confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#06b6d4", "#a855f7", "#ec4899", "#f59e0b"],
        });
      } catch (e) {}

      clearCart();
      toast.success("Order confirmed successfully!");
      router.push(`/order-confirmed?order_number=${res.order.order_number}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to process order. Please verify details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout Breadcrumb / Steps */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400 block mb-1">
            Secure Encrypted Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Finalize Your Order</h1>
        </div>

        {/* Step Numbers */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className={`px-3 py-1.5 rounded-xl font-bold ${step >= 1 ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-500"}`}>
            1. Shipping
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-3 py-1.5 rounded-xl font-bold ${step >= 2 ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-500"}`}>
            2. Delivery
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-3 py-1.5 rounded-xl font-bold ${step >= 3 ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-500"}`}>
            3. Payment
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Checkout Steps Forms */}
        <div className="lg:col-span-7 space-y-6">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Shipping Details */}
          <div className={`p-6 rounded-3xl bg-[#0e121e] border transition-all ${step === 1 ? "border-indigo-500/40 shadow-xl shadow-indigo-500/10" : "border-white/10"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" /> 1. Shipping & Contact Information
              </h2>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-indigo-400 hover:text-cyan-300"
                >
                  Edit
                </button>
              )}
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  Continue to Delivery <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span>{customerName} • {addressLine1}, {city}, {postalCode}, {country}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}
          </div>

          {/* STEP 2: Delivery Method */}
          <div className={`p-6 rounded-3xl bg-[#0e121e] border transition-all ${step === 2 ? "border-indigo-500/40 shadow-xl shadow-indigo-500/10" : "border-white/10"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" /> 2. Delivery Options
              </h2>
              {step > 2 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-indigo-400 hover:text-cyan-300"
                >
                  Edit
                </button>
              )}
            </div>

            {step === 2 ? (
              <div className="space-y-3">
                <div
                  onClick={() => setDeliveryMethod("standard")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    deliveryMethod === "standard"
                      ? "bg-indigo-600/20 border-cyan-400 shadow-md"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">DHL Standard Express (2-3 Business Days)</h4>
                      <p className="text-[11px] text-slate-400">Tracked with signature on delivery</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-white">
                    {subtotal >= 100 ? <span className="text-cyan-400">FREE</span> : "$15.00"}
                  </span>
                </div>

                <div
                  onClick={() => setDeliveryMethod("priority")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    deliveryMethod === "priority"
                      ? "bg-indigo-600/20 border-cyan-400 shadow-md"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Cyber Priority Overnight (Next Business Day)</h4>
                      <p className="text-[11px] text-slate-400">Insured express flight delivery with real-time GPS</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-white">$25.00</span>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : step > 2 ? (
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span>{deliveryMethod === "priority" ? "Cyber Priority Overnight ($25.00)" : "DHL Standard Express (Free)"}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            ) : null}
          </div>

          {/* STEP 3: Payment Method */}
          <div className={`p-6 rounded-3xl bg-[#0e121e] border transition-all ${step === 3 ? "border-indigo-500/40 shadow-xl shadow-indigo-500/10" : "border-white/10"}`}>
            <h2 className="text-base font-black text-white flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-cyan-400" /> 3. Payment Method
            </h2>

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit_card")}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === "credit_card"
                        ? "bg-indigo-600/20 border-cyan-400 text-white"
                        : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold">Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === "cash_on_delivery"
                        ? "bg-indigo-600/20 border-cyan-400 text-white"
                        : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                  </button>
                </div>

                {paymentMethod === "credit_card" && (
                  <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• 4242"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Expiration</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">CVC / CVV</label>
                        <PasswordInput
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="888"
                          inputClassName="bg-white/5 border border-white/10 rounded-xl py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Submit Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePlaceOrder}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-2 mt-4 hover:scale-[1.01] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Pay & Place Order ({formatPrice(total)})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Sticky Order Summary */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-[#0e121e] border border-white/10 sticky top-24 space-y-6">
            <h3 className="text-base font-black text-white pb-3 border-b border-white/10">
              Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})
            </h3>

            {/* Line Items */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => {
                const img = item.product.primary_image?.image_url || item.product.images?.[0]?.image_url;
                const itemPrice = Number(item.product.price) + (item.variant ? Number(item.variant.price_modifier) : 0);

                return (
                  <div key={`${item.product.id}-${item.variant?.id ?? "none"}`} className="flex gap-3 text-xs">
                    {img && (
                      <img
                        src={img}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate">{item.product.name}</h4>
                      {item.variant && (
                        <p className="text-[10px] text-slate-400">{item.variant.name}</p>
                      )}
                      <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-extrabold text-cyan-400">
                      {formatPrice(itemPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals Calculation */}
            <div className="space-y-2 text-xs text-slate-400 pt-4 border-t border-white/10">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-white font-medium">
                  {shipping === 0 ? <span className="text-cyan-400 font-bold">FREE</span> : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Sales Tax (8%)</span>
                <span className="text-white font-medium">{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-3 border-t border-white/10">
                <span>Total Due</span>
                <span className="text-cyan-400 text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>256-Bit SSL End-to-End Encryption Guarantee.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
