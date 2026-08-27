"use client";

import { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  ShieldCheck, 
  KeyRound, 
  Phone, 
  Mail, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Lock,
  Layers,
  AlertTriangle,
  X
} from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { adminApi, ADMIN_PERMISSION_MODULES } from "@/lib/adminApi";
import { ImageUploadAvatar } from "@/components/ui/ImageUploadAvatar";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminProfilePage() {
  const { adminUser, updateAdminUser } = useAdminAuthStore();

  // Local Form State with Initial Values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(adminUser?.email || "");
  const [phone, setPhone] = useState(adminUser?.phone || "");
  const [avatar, setAvatar] = useState<string | null>(adminUser?.avatar || null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync state if adminUser changes
  useEffect(() => {
    if (adminUser) {
      const parts = (adminUser.name || "").trim().split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setEmail(adminUser.email || "");
      setPhone(adminUser.phone || "");
      setAvatar(adminUser.avatar || null);
    }
  }, [adminUser]);

  const originalParts = (adminUser?.name || "").trim().split(" ");
  const originalFirst = originalParts[0] || "";
  const originalLast = originalParts.slice(1).join(" ") || "";
  const isChangingEmail = Boolean(adminUser?.email && email.trim().toLowerCase() !== adminUser.email.trim().toLowerCase());

  // Check if there are uncommitted changes
  const hasUnsavedChanges = 
    firstName !== originalFirst ||
    lastName !== originalLast ||
    isChangingEmail ||
    phone !== (adminUser?.phone || "") ||
    avatar !== (adminUser?.avatar || null) ||
    (showPasswordChange && (currentPassword.length > 0 || password.length > 0 || confirmPassword.length > 0)) ||
    (isChangingEmail && currentPassword.length > 0);

  const handleDiscardChanges = () => {
    if (!adminUser) return;
    setFirstName(originalFirst);
    setLastName(originalLast);
    setEmail(adminUser.email || "");
    setPhone(adminUser.phone || "");
    setAvatar(adminUser.avatar || null);
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
    setShowPasswordChange(false);
    toast.info("Unsaved profile changes reverted.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasUnsavedChanges) {
      toast.info("No changes were made.");
      return;
    }

    if (!firstName.trim()) {
      toast.error("First Name is mandatory.");
      return;
    }

    if (isChangingEmail && !currentPassword) {
      toast.error("Please enter your current administrator password to authorize changing your email address.");
      return;
    }

    if (showPasswordChange) {
      if (!currentPassword) {
        toast.error("Please enter your current administrator password to set a new password.");
        return;
      }

      if (!password) {
        toast.error("Please enter a new administrator password.");
        return;
      }

      if (password.length < 8) {
        toast.error("New password must be at least 8 characters long.");
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
        avatar: avatar,
      };

      if (currentPassword) {
        payload.current_password = currentPassword;
      }

      if (showPasswordChange && password && currentPassword) {
        payload.password = password;
        payload.password_confirmation = confirmPassword;
      }

      const res = await adminApi.updateProfile(payload);
      
      // Update global auth store & localStorage
      updateAdminUser(res.user);

      setShowPasswordChange(false);
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      toast.success("Executive profile and avatar updated permanently.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.current_password?.[0] || err.response?.data?.errors?.email?.[0] || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Executive Security & Credentials
          </span>
          <h1 className="text-2xl font-black text-white">Administrator Profile</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            ROLE: {adminUser?.role?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Floating Unsaved Changes Warning Banner */}
      {hasUnsavedChanges && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 text-xs text-amber-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You have unsaved profile or avatar modifications in preview.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscardChanges}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase transition-all shadow-md flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Now"}
            </button>
          </div>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Avatar & Basic Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121e] border border-white/10 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-black text-white">Profile Photo & Identity</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload a high-resolution portrait. Changes preview immediately across your session.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <ImageUploadAvatar
              value={avatar}
              onChange={(newVal) => setAvatar(newVal)}
              name={`${firstName} ${lastName}`.trim() || adminUser?.name || "Admin"}
              size="xl"
            />

            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Marcus"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    Second / Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Aurelius"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    Official Administrator Email <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ecommerce.test"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    Direct Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Conditionally appeared section for email change password */}
                {isChangingEmail && (
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-amber-200 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        Enter Password <span className="text-rose-400 font-black">*</span>
                      </label>
                      <span className="text-[10px] text-amber-300/80">Required to authorize new email</span>
                    </div>
                    <PasswordInput
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current administrator password"
                      inputClassName="bg-[#080a10] border border-amber-500/40 focus:border-amber-400 rounded-xl py-2.5 text-xs text-white placeholder:text-slate-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Security & Password Update */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121e] border border-white/10 shadow-2xl space-y-5">
          {!showPasswordChange ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400/80" />
                  <h2 className="text-base font-black text-white">Security & Password</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update administrative credentials to maintain executive system security.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordChange(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer w-fit"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Change Password
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-black text-white">Change Password</h2>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    Current Password <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <PasswordInput
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    inputClassName="bg-white/5 border border-white/10 rounded-2xl py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Verify current credentials.</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    New Executive Password <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    inputClassName="bg-white/5 border border-white/10 rounded-2xl py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Minimum 8 characters.</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    Confirm New Password <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <PasswordInput
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    inputClassName="bg-white/5 border border-white/10 rounded-2xl py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Must match new password.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Active RBAC Matrix Overview */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121e] border border-white/10 shadow-2xl space-y-4">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Assigned Capabilities & RBAC Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                System privileges authorized for your administrative profile.
              </p>
            </div>
            <Layers className="w-5 h-5 text-cyan-400/60" />
          </div>

          {adminUser?.role === "super_admin" || adminUser?.role === "admin" ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs text-amber-300">
                <span className="font-bold block">Master Enterprise Authority</span>
                <span className="text-[11px] text-slate-400">
                  Your account holds unrestricted authorization across all catalog, financial, order, customer, and cryptographic audit log domains.
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADMIN_PERMISSION_MODULES.map((mod) => (
                <div key={mod.name} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-400 block">{mod.name}</span>
                  <div className="space-y-1">
                    {mod.permissions.map((p) => {
                      const has = adminUser?.permissions?.includes(p.id);
                      return (
                        <div key={p.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">{p.name}</span>
                          <span className={`text-[10px] font-bold ${has ? "text-emerald-400" : "text-slate-600"}`}>
                            {has ? "Granted" : "Restricted"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition-colors"
            >
              Cancel / Discard
            </button>
          )}

          <button
            type="submit"
            disabled={saving || !hasUnsavedChanges}
            className={`px-8 py-3 rounded-2xl font-black uppercase tracking-wider text-xs transition-all shadow-xl flex items-center gap-2 ${
              !hasUnsavedChanges
                ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5 shadow-none"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 cursor-pointer"
            }`}
            title={!hasUnsavedChanges ? "No changes made to profile" : undefined}
          >
            <Save className="w-4 h-4" />
            {saving ? "Updating Profile..." : "Save Profile Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
