"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, User as UserIcon, Phone, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "sonner";

export function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (authModalTab === "login") {
        const res = await api.login({ email, password });
        setAuth(res.user, res.token);
        toast.success(`Welcome back, ${res.user.name.split(" ")[0]}!`);
        closeAuthModal();
      } else {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        await api.register({ name: fullName, email, password, phone });
        // Do NOT log in automatically. Switch to Sign In tab and request credentials.
        setPassword("");
        setFirstName("");
        setLastName("");
        setPhone("");
        setSuccessMessage("Account created successfully! Please enter your password to sign in.");
        openAuthModal("login");
        toast.success("Account created successfully! Please enter your password to sign in.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Authentication failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCustomerLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await api.login({ email: "customer@ecommerce.test", password: "password123" });
      setAuth(res.user, res.token);
      toast.success("Signed in as Demo Customer");
      closeAuthModal();
    } catch (err: any) {
      setError("Demo login failed. Make sure database is seeded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden scrollbar-transparent">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent",
              overflowX: "hidden",
            }}
            className="relative w-full max-w-[420px] max-h-[min(92vh,620px)] flex flex-col rounded-2xl sm:rounded-3xl bg-[#0e121e] border border-white/15 shadow-2xl p-5 sm:p-6 overflow-y-auto overflow-x-hidden scrollbar-transparent z-10 my-auto"
          >
            {/* Background Glow contained to prevent overflow */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none -z-10">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-cyan-600/15 rounded-full blur-3xl" />
            </div>

            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-4 pr-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-md mb-2">
                <div className="w-full h-full bg-[#0d1017] rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                {authModalTab === "login" ? "Customer Sign In" : "Create Customer Account"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {authModalTab === "login"
                  ? "Access your hardware orders, saved gear, and delivery addresses."
                  : "Join AETHER for member-exclusive pricing and express fulfillment."}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-3.5 border border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => { setError(null); setSuccessMessage(null); openAuthModal("login"); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  authModalTab === "login" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setError(null); setSuccessMessage(null); openAuthModal("register"); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  authModalTab === "register" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Success Message Banner */}
            {successMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 mb-3 shrink-0">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="text-[11px] leading-tight font-medium">{successMessage}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2 mb-3 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="text-[11px] leading-tight">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {authModalTab === "register" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                      First Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Elena"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                      Second / Last Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Rostova"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@ecommerce.test"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {authModalTab === "register" && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">Password</label>
                <PasswordInput
                  required
                  iconLeft
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  inputClassName="bg-white/5 border border-white/10 rounded-lg py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white text-xs font-extrabold tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 mt-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : authModalTab === "login" ? (
                  <>Sign In to Account <ArrowRight className="w-3.5 h-3.5" /></>
                ) : (
                  <>Create Customer Account <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </form>

            {/* Quick Customer Test Login */}
            <div className="mt-3.5 pt-3 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={handleQuickCustomerLogin}
                disabled={loading}
                className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                1-Click Demo Customer Sign In
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
