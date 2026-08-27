"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  ChevronLeft, 
  Key, 
  UserCheck, 
  Users 
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminAuth } = useAdminAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await adminApi.login({ email, password });
      setAdminAuth(res.user, res.token);
      toast.success(`Authenticated as ${res.user.role.toUpperCase()}: ${res.user.name}`);
      router.push("/admin");
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403) {
        setError(err.response?.data?.message || "Access Denied: This account lacks administrative privileges.");
      } else if (status === 429) {
        setError("Too many login attempts. Rate limit engaged. Please wait 60 seconds.");
      } else if (status === 500) {
        setError(err.response?.data?.message || "Database connection error: Please ensure MySQL is running and the database is migrated/seeded.");
      } else if (!err.response) {
        setError("Unable to connect to backend server (http://localhost:8000). Please ensure 'php artisan serve' is running.");
      } else {
        setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Invalid administrator credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async (role: "super_admin" | "admin" | "staff") => {
    setLoading(true);
    setError(null);

    const creds = {
      super_admin: { email: "superadmin@ecommerce.test", password: "password123" },
      admin: { email: "admin@ecommerce.test", password: "password123" },
      staff: { email: "staff@ecommerce.test", password: "password123" },
    }[role];

    try {
      const res = await adminApi.login(creds);
      setAdminAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}`);
      router.push("/admin");
    } catch (err: any) {
      if (err.response?.status === 500) {
        setError(err.response?.data?.message || "Database connection error: Please ensure MySQL is running and seeded.");
      } else if (!err.response) {
        setError("Unable to connect to backend server (http://localhost:8000).");
      } else {
        setError(err.response?.data?.message || "Demo login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] flex flex-col justify-center items-center p-4 py-8 sm:py-12 relative overflow-y-auto">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top back button */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Customer Storefront
        </Link>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl bg-[#0c0e15] border border-amber-500/30 p-8 shadow-2xl space-y-6 z-10"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
            AETHER Executive Network
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Operations Console</h1>
          <p className="text-xs text-slate-400">
            Strict authentication boundary. Authorized personnel only.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Authorization Notice</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecommerce.test"
                className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Secret Key / Password
            </label>
            <PasswordInput
              required
              iconLeft
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              inputClassName="bg-white/5 border border-white/15 rounded-xl py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key className="w-4 h-4" /> Authenticate Session <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Operational Test Accounts */}
        <div className="pt-5 border-t border-white/10 space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-center">
            Instant Test Authentications (Staff / Admin)
          </span>

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickAdminLogin("super_admin")}
              disabled={loading}
              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold transition-all flex flex-col items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Super Admin
            </button>

            <button
              type="button"
              onClick={() => handleQuickAdminLogin("admin")}
              disabled={loading}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-all flex flex-col items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              Admin
            </button>

            <button
              type="button"
              onClick={() => handleQuickAdminLogin("staff")}
              disabled={loading}
              className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold transition-all flex flex-col items-center gap-1"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Staff
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
