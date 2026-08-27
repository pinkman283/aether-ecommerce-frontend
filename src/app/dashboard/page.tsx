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
  ShieldCheck,
  Sliders,
  Save,
  CheckCircle2,
  Lock,
  KeyRound,
  X
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
          setEmail(profileData.user.email || "");
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
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setAvatar(user?.avatar || null);
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
    setShowPasswordChange(false);
    setIsEditing(false);
    toast.info("Unsaved profile changes discarded.");
  };

  const origParts = (user?.name || "").trim().split(" ");
  const origFirst = origParts[0] || "";
  const origLast = origParts.slice(1).join(" ") || "";
  const isChangingEmail = Boolean(user?.email && email.trim().toLowerCase() !== user.email.trim().toLowerCase());
  
  const hasProfileChanges = Boolean(
    firstName.trim() !== origFirst ||
    lastName.trim() !== origLast ||
    isChangingEmail ||
    (phone.trim() || "") !== (user?.phone || "").trim() ||
    (avatar || null) !== (user?.avatar || null) ||
    (showPasswordChange && (currentPassword.length > 0 || password.length > 0 || confirmPassword.length > 0)) ||
    (isChangingEmail && currentPassword.length > 0)
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

    if (isChangingEmail && !currentPassword) {
      toast.error("Please enter your current password to authorize changing your email address.");
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
        email: email.trim(),
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

      toast.success(res.message || "Profile details and picture saved successfully!");
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
      
      {/* Top Customer Overview Banner / Edit Studio */}
      {!isEditing ? (
        <div className="relative rounded-3xl bg-gradient-to-b from-[#121626] to-[#090b12] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden">
          {/* Ambient glowing gradients */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Column: Avatar + Identity Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
              {/* Avatar with pulse ring */}
              <div className="relative shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl object-cover ring-2 ring-indigo-500/40 shadow-2xl shadow-indigo-500/20"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-indigo-600/40 via-purple-600/30 to-cyan-500/30 ring-2 ring-indigo-500/40 flex items-center justify-center text-indigo-200 font-black text-2xl shadow-2xl">
                    {user?.name ? user.name.trim().slice(0, 2).toUpperCase() : "U"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-[#090b12] flex items-center justify-center" title="Account Active">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Identity Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {user?.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-sm shadow-cyan-500/10">
                    {user?.role === "admin" ? "Studio Admin" : "Member"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    {user?.email}
                  </span>
                  {user?.phone && (
                    <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      {user.phone}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified AETHER Hardware Member</span>
                </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                Edit Profile
              </button>

              <Link
                href="/dashboard/addresses"
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Addresses
              </Link>

              <button
                onClick={logout}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} className="relative rounded-3xl bg-[#0b0e18] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden animate-in fade-in duration-200">
          {/* Ambient glowing orb */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">Edit Profile & Credentials</h2>
              </div>
              <p className="text-xs text-slate-400">
                Update your personal details, profile picture, and security credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDiscardEdit}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>

          {/* Body Split: Avatar Studio on Left, Details & Password on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Avatar Studio (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl bg-white/[0.02] border border-white/10 p-5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 block">Avatar Studio</span>
                <p className="text-[11px] text-slate-400">Live preview of your member image</p>
              </div>

              <ImageUploadAvatar
                value={avatar}
                onChange={(val) => setAvatar(val)}
                name={`${firstName} ${lastName}`.trim() || user?.name || "Customer"}
                size="xl"
              />

              <div className="text-[10px] text-slate-500 max-w-xs">
                Supports PNG, JPG, or WebP up to 5MB. Click or drag to update.
              </div>
            </div>

            {/* Right Column: Personal Information & Password Cards (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Section 1: Personal Details */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">
                  Personal Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      First Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Elena"
                        className="w-full bg-[#080a10] border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Second / Last Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Rostova"
                        className="w-full bg-[#080a10] border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-[#080a10] border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Account Email <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@domain.test"
                        className="w-full bg-[#080a10] border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Conditionally appeared section for email change password */}
                  {isChangingEmail && (
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-indigo-200 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-indigo-400" />
                          Enter Password <span className="text-rose-400 font-black">*</span>
                        </label>
                        <span className="text-[10px] text-indigo-300/80">Required to authorize new email</span>
                      </div>
                      <PasswordInput
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        inputClassName="bg-[#080a10] border border-indigo-500/40 focus:border-indigo-400 rounded-xl py-2.5 text-xs text-white placeholder:text-slate-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Password & Credentials */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-4">
                {!showPasswordChange ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">
                          Security & Password
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Update your account password to maintain security.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer w-fit"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                      Change Password
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-200 block">
                          Change Password
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPassword("");
                          setConfirmPassword("");
                          if (!isChangingEmail) {
                            setCurrentPassword("");
                          }
                        }}
                        className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">
                          Current Password <span className="text-rose-400 font-bold">*</span>
                        </label>
                        <PasswordInput
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current password"
                          inputClassName="bg-[#080a10] border border-white/10 focus:border-indigo-500 rounded-xl py-2.5 text-xs text-white placeholder:text-slate-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">
                          New Password <span className="text-rose-400 font-bold">*</span>
                        </label>
                        <PasswordInput
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          inputClassName="bg-[#080a10] border border-white/10 focus:border-indigo-500 rounded-xl py-2.5 text-xs text-white placeholder:text-slate-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">
                          Confirm Password <span className="text-rose-400 font-bold">*</span>
                        </label>
                        <PasswordInput
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          inputClassName="bg-[#080a10] border border-white/10 focus:border-indigo-500 rounded-xl py-2.5 text-xs text-white placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              {hasProfileChanges ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-300 font-medium">Unsaved modifications in preview</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-slate-500">All profile details are up to date</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDiscardEdit}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Discard
              </button>

              <button
                type="submit"
                disabled={saving || !hasProfileChanges}
                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  !hasProfileChanges
                    ? "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white shadow-indigo-600/25"
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
                    <span>Save Profile & Picture</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

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
