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
import SplashCursor from "@/components/SplashCursor";

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

  return (
    <div className="min-h-screen bg-[#07080c] flex flex-col justify-center items-center p-4 py-8 sm:py-12 relative overflow-x-hidden">
      {/* ReactBits SplashCursor Fluid Animation (Background only) */}
      <SplashCursor />

      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Floating Return Button */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px] mb-3.5 relative z-20"
      >
        <Link
          href="/"
          className="group inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#0c0e15] border border-white/10 hover:border-amber-500/40 text-xs font-bold text-slate-300 hover:text-white transition-colors duration-300 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(245,158,11,0.15)]"
        >
          <div className="inline-flex items-center gap-2 transition-transform duration-300 ease-out group-hover:-translate-x-1">
            <ChevronLeft className="w-4 h-4 text-amber-400 transition-transform duration-300 ease-out group-hover:-translate-x-0.5" />
            <span>Return to Storefront</span>
          </div>
        </Link>
      </motion.div>

      {/* Floating Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[360px] rounded-2xl bg-[#0c0e15] border border-amber-500/25 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(245,158,11,0.08)] ring-1 ring-white/5 space-y-4.5 z-20"
      >
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md shadow-amber-500/10">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block">
            AETHER Executive Network
          </span>
          <h1 className="text-lg font-black text-white tracking-tight">Admin Console</h1>
          <p className="text-[11px] text-slate-400">
            Strict authentication boundary. Authorized personnel only.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px]">
              <span className="font-bold block">Authorization Notice</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecommerce.test"
                className="w-full bg-white/5 border border-white/15 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-medium"
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
              inputClassName="bg-white/5 border border-white/15 rounded-lg py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-1"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key className="w-3.5 h-3.5" /> Authenticate Session <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Role Access Badges */}
        <div className="pt-3 border-t border-white/10">
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-300 font-bold flex flex-col items-center gap-0.5 select-none">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>Super Admin</span>
            </div>

            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 font-bold flex flex-col items-center gap-0.5 select-none">
              <UserCheck className="w-3 h-3 text-amber-400" />
              <span>Admin</span>
            </div>

            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-bold flex flex-col items-center gap-0.5 select-none">
              <Users className="w-3 h-3 text-cyan-400" />
              <span>Staff</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
