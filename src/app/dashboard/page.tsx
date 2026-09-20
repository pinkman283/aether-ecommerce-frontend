"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  MapPin, 
  LogOut, 
  ExternalLink, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Truck, 
  ShieldCheck, 
  Save, 
  Lock, 
  KeyRound, 
  X, 
  Gift, 
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Pencil,
  ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { ImageUploadAvatar } from "@/components/ui/ImageUploadAvatar";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "sonner";
import { useAppTheme } from "@/components/providers/ThemeProvider";

export default function CustomerDashboardPage() {
  const { theme } = useAppTheme();
  const { user, isAuthenticated, logout, openAuthModal, updateUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ total_orders: 0, total_spent: 0 });
  const [loading, setLoading] = useState(true);

  // Edit Profile Form
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadDashboard() {
      try {
        const [profileData, ordersRes] = await Promise.all([
          api.getProfile(),
          api.getMyOrders({ per_page: 100 }).catch(() => ({ data: [] })),
        ]);

        const customerOrders = ordersRes.data && ordersRes.data.length > 0 
          ? ordersRes.data 
          : (profileData.user?.orders || []);

        setOrders(customerOrders);

        setStats({
          total_orders: typeof profileData.total_orders === "number" ? profileData.total_orders : customerOrders.length,
          total_spent: typeof profileData.total_spent === "number" ? profileData.total_spent : 0,
        });

        if (profileData.user) {
          const parts = (profileData.user.name || "").trim().split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
          setEmail(profileData.user.email || "");
          setPhone(profileData.user.phone || "");
          setAvatar(profileData.user.avatar || null);
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          logout();
          toast.error("Your session has expired. Please sign in again.");
          openAuthModal("login");
        } else {
          console.warn("Failed to load profile:", err?.message || err);
          toast.error(err?.response?.data?.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [isAuthenticated, logout, openAuthModal]);

  const handleDiscardEdit = () => {
    const parts = (user?.name || "").trim().split(" ");
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setAvatar(user?.avatar || null);
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
    setShowPasswordChange(false);
    setIsEditing(false);
  };

  const origParts = (user?.name || "").trim().split(" ");
  const origFirst = origParts[0] || "";
  const origLast = origParts.slice(1).join(" ") || "";
  
  const hasProfileChanges = Boolean(
    firstName.trim() !== origFirst ||
    lastName.trim() !== origLast ||
    (phone.trim() || "") !== (user?.phone || "").trim() ||
    (avatar || null) !== (user?.avatar || null) ||
    (showPasswordChange && (currentPassword.length > 0 || password.length > 0 || confirmPassword.length > 0))
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasProfileChanges) {
      toast.info("No changes were made.");
      setIsEditing(false);
      return;
    }
    if (!firstName.trim()) {
      toast.error("First Name is required.");
      return;
    }

    if (showPasswordChange) {
      if (!currentPassword) {
        toast.error("Please enter your current password to set a new password.");
        return;
      }
      if (!password) {
        toast.error("Please enter your new password.");
        return;
      }
      if (password.length < 6) {
        toast.error("New password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("New password and confirm password do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const payload: any = {
        name: fullName,
        phone: phone || null,
        avatar: avatar
      };

      if (currentPassword) {
        payload.current_password = currentPassword;
      }

      if (showPasswordChange && password && currentPassword) {
        payload.password = password;
        payload.password_confirmation = confirmPassword;
      }

      const res = await api.updateProfile(payload);
      
      updateUser({
        name: fullName,
        email: res.user?.email || email.trim(),
        phone,
        avatar
      });

      toast.success(res.message || "Profile updated successfully!");
      setIsEditing(false);
      setShowPasswordChange(false);
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.current_password?.[0] || err.response?.data?.errors?.email?.[0] || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered" || s === "completed") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    }
    if (s === "shipped" || s === "in_transit") {
      return "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
    }
    if (s === "processing" || s === "confirmed") {
      return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
    }
    if (s === "cancelled" || s === "refunded") {
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
    }
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In Required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Please sign in to view your orders, track shipments, and manage your account.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Profile Header Card */}
      <div className="bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-7 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          {/* User Info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-1 ring-gray-200 dark:ring-white/10 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/10 to-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold text-xl flex items-center justify-center ring-1 ring-indigo-500/20">
                  {user?.name ? user.name.trim().slice(0, 2).toUpperCase() : "U"}
                </div>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                  {user?.role === "admin" ? "Admin" : "Member"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-white/5 justify-end">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isEditing
                  ? "bg-gray-100 dark:bg-white/10 text-slate-900 dark:text-white border-gray-300 dark:border-white/20"
                  : "bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border-gray-200 dark:border-white/10"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              {isEditing ? "Close Edit" : "Edit Profile"}
            </button>

            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Inline Profile Editor */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10 space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h2>
              <button
                type="button"
                onClick={handleDiscardEdit}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Avatar Upload */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 space-y-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Profile Photo</span>
                <ImageUploadAvatar
                  value={avatar}
                  onChange={(val) => setAvatar(val)}
                  name={`${firstName} ${lastName}`.trim() || user?.name || "Customer"}
                  size="xl"
                />
                <p className="text-[11px] text-slate-400 text-center">Click avatar to upload JPG, PNG or WebP</p>
              </div>

              {/* Input Fields */}
              <div className="md:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Section */}
                <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                  {!showPasswordChange ? (
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(true)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" /> Change Password
                    </button>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> Set New Password
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordChange(false);
                            setCurrentPassword("");
                            setPassword("");
                            setConfirmPassword("");
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Current Password</label>
                          <PasswordInput
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Current password"
                            inputClassName="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-xl py-2 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">New Password</label>
                          <PasswordInput
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            inputClassName="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-xl py-2 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Confirm Password</label>
                          <PasswordInput
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            inputClassName="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-xl py-2 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={handleDiscardEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving || !hasProfileChanges}
                className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  !hasProfileChanges
                    ? "bg-gray-100 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Total Orders</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.total_orders}</p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Total Spent</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{formatPrice(stats.total_spent)}</p>
          </div>
        </div>

        {/* Saved Addresses */}
        <Link
          href="/dashboard/addresses"
          className="p-5 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 shadow-sm flex items-center justify-between gap-2 hover:border-gray-300 dark:hover:border-white/20 transition-all group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Addresses</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Manage</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>

        {/* Coupons & Rewards */}
        <Link
          href="/dashboard/coupons"
          className="p-5 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 shadow-sm flex items-center justify-between gap-2 hover:border-gray-300 dark:hover:border-white/20 transition-all group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Discounts</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Coupons</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </div>

      {/* 3. Customer Order History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">All orders placed with your account</p>
          </div>
          {orders.length > 0 && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No orders placed yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              When you complete a purchase, your orders and tracking details will appear here.
            </p>
            <Link
              href="/products"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 hover:border-gray-300 dark:hover:border-white/20 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      #{ord.order_number}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(ord.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${getStatusBadge(ord.order_status)}`}>
                      {ord.order_status}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatPrice(ord.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Ordered Items Preview */}
                {ord.items && ord.items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ord.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 text-xs"
                      >
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-11 h-11 rounded-lg object-cover bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                            {item.product_name}
                          </h4>
                          {item.variant_name && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {item.variant_name}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Qty: {item.quantity} • {formatPrice(item.unit_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Footer Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Payment: <span className="font-medium text-slate-600 dark:text-slate-300 capitalize">{ord.payment_status || "Pending"}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {ord.tracking_code && (
                      <Link
                        href={`/track?number=${ord.tracking_code}`}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" /> Track
                      </Link>
                    )}
                    <Link
                      href={`/order-confirmed?order_number=${ord.order_number}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold transition-colors flex items-center gap-1"
                    >
                      Receipt <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
