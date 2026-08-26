"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  ExternalLink, 
  Sparkles, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Truck,
  ShieldCheck
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { ImageUploadAvatar } from "@/components/ui/ImageUploadAvatar";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "sonner";

export default function CustomerDashboardPage() {
  const { user, isAuthenticated, logout, openAuthModal, updateUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ total_orders: 1, total_spent: 375.32 });
  const [loading, setLoading] = useState(true);

  // Edit Profile Form
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadDashboard() {
      try {
        const profileData = await api.getProfile();
        setStats({
          total_orders: profileData.total_orders || 1,
          total_spent: profileData.total_spent || 375.32,
        });
        if (profileData.user?.orders) {
          setOrders(profileData.user.orders);
        }
        if (profileData.user) {
          const parts = (profileData.user.name || "").trim().split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
          setPhone(profileData.user.phone || "");
          setAvatar(profileData.user.avatar || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [isAuthenticated]);

  const handleDiscardEdit = () => {
    const parts = (user?.name || "").trim().split(" ");
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
    setPhone(user?.phone || "");
    setAvatar(user?.avatar || null);
    setPassword("");
    setIsEditing(false);
    toast.info("Unsaved profile changes discarded.");
  };

  const origParts = (user?.name || "").trim().split(" ");
  const origFirst = origParts[0] || "";
  const origLast = origParts.slice(1).join(" ") || "";
  const hasProfileChanges = Boolean(
    firstName.trim() !== origFirst ||
    lastName.trim() !== origLast ||
    (phone.trim() || "") !== (user?.phone || "").trim() ||
    (avatar || null) !== (user?.avatar || null) ||
    password.length > 0
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasProfileChanges) {
      toast.info("No changes were made.");
      return;
    }
    if (!firstName.trim()) {
      toast.error("First Name is mandatory.");
      return;
    }

    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const payload: any = { name: fullName, phone, avatar };
      if (password) {
        payload.password = password;
      }
      const res = await api.client.put("/auth/profile", payload);
      updateUser({ name: fullName, phone, avatar });
      toast.success("Profile details and picture saved successfully!");
      setIsEditing(false);
      setPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-black text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">
          Sign in to your AETHER account to review past hardware orders, track shipments, and manage saved addresses.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
        >
          Sign In to Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Customer Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121e] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={avatar || user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"}
              alt={user?.name}
              className="w-18 h-18 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                  {user?.role === "admin" ? "Studio Admin" : "Studio Member"}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {user?.email}
                {user?.phone && (
                  <>
                    <span className="text-slate-600">•</span>
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> {user.phone}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isEditing) {
                  handleDiscardEdit();
                } else {
                  setIsEditing(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white transition-all"
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
            <Link
              href="/dashboard/addresses"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white transition-all flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Addresses
            </Link>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Profile & Avatar Editor */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t border-white/10 space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <ImageUploadAvatar
                value={avatar}
                onChange={(val) => setAvatar(val)}
                name={`${firstName} ${lastName}`.trim() || user?.name || "Customer"}
                size="lg"
                label="Profile Picture (Live Preview)"
              />

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Elena"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Second / Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Rostova"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">New Password (Optional)</label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep"
                    inputClassName="bg-white/5 border border-white/10 rounded-xl py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={handleDiscardEdit}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving || !hasProfileChanges}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  !hasProfileChanges
                    ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5 shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                }`}
                title={!hasProfileChanges ? "No changes made to profile details" : undefined}
              >
                {saving ? "Saving Changes..." : "Save Profile & Picture"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* KPI Stats Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-[#0e121e] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{stats.total_orders}</span>
            <p className="text-xs text-slate-400">Total Hardware Orders</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e121e] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-cyan-400">{formatPrice(stats.total_spent)}</span>
            <p className="text-xs text-slate-400">Hardware Investment</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e121e] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-400">Active</span>
            <p className="text-xs text-slate-400">Studio Platinum Warranty</p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400 block mb-1">
              Purchase History
            </span>
            <h2 className="text-2xl font-black text-white">Your Dispatched Orders</h2>
          </div>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0e121e] border border-white/10 text-center space-y-4">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No previous orders found</h3>
              <p className="text-xs text-slate-400">Your hardware purchases will appear here with live tracking telemetry.</p>
              <Link href="/products" className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 rounded-3xl bg-[#0e121e] border border-white/10 shadow-xl space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{ord.order_number}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Placed on {formatDate(ord.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {ord.order_status}
                    </span>
                    <span className="text-base font-black text-white">{formatPrice(ord.total_amount)}</span>
                  </div>
                </div>

                {/* Items in order */}
                {ord.items && ord.items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ord.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-white/10"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white truncate">{item.product_name}</h4>
                          {item.variant_name && <p className="text-[10px] text-slate-400">{item.variant_name}</p>}
                          <p className="text-slate-400 text-[10px]">Qty: {item.quantity} • {formatPrice(item.unit_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {ord.tracking_code && (
                    <Link
                      href={`/track?number=${ord.tracking_code}`}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-all"
                    >
                      <Truck className="w-3.5 h-3.5" /> Track Shipment
                    </Link>
                  )}
                  <Link
                    href={`/order-confirmed?order_number=${ord.order_number}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    View Receipt <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
