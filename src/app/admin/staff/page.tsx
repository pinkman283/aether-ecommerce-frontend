"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  UserCog, 
  Plus, 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Mail, 
  Phone, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Sparkles, 
  ScrollText, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Sliders,
  CheckSquare,
  Square,
  Crown,
  ArrowUpCircle,
  ArrowDownCircle,
  UserCheck,
  Search,
  RotateCcw
} from "lucide-react";
import { adminApi, ADMIN_PERMISSION_MODULES, PermissionModule } from "@/lib/adminApi";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { AdminDropdown } from "@/components/admin/AdminDropdown";
import { SuspensionModal, SuspensionPayload } from "@/components/admin/SuspensionModal";
import { ImageUploadAvatar } from "@/components/ui/ImageUploadAvatar";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { toast } from "sonner";

export default function AdminStaffPage() {
  const { adminUser } = useAdminAuthStore();
  const isSuperAdmin = adminUser?.role === "super_admin";
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // View Staff Modal State
  const [viewingStaff, setViewingStaff] = useState<User | null>(null);

  // Suspension Modal State
  const [suspendingStaff, setSuspendingStaff] = useState<User | null>(null);
  const [isSubmittingSuspension, setIsSubmittingSuspension] = useState(false);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // Bulk Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("staff");
  const [status, setStatus] = useState<string>("active");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>(["products.view", "products.manage", "orders.view", "orders.manage"]);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingStaff, setDeletingStaff] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStaff();
      setStaffList(data || []);
    } catch (err) {
      toast.error("Failed to load staff accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setRole("staff");
    setStatus("active");
    setPhone("");
    setAvatar(null);
    setPermissions(["products.view", "products.manage", "orders.view", "orders.manage"]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: User) => {
    if (s.role === "super_admin" && !isSuperAdmin) {
      toast.error("Super Administrator account is untouchable and cannot be modified.");
      return;
    }
    setEditingStaff(s);
    const parts = (s.name || "").trim().split(" ");
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
    setEmail(s.email);
    setPassword("");
    setRole(s.role);
    setStatus(s.status || "active");
    setPhone(s.phone || "");
    setAvatar(s.avatar || null);
    setPermissions(s.permissions || []);
    setIsModalOpen(true);
  };

  const handlePromote = async (s: User) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Administrators have authority to promote personnel to Admin status.");
      return;
    }
    try {
      const res = await adminApi.promoteStaff(s.id);
      setStaffList(staffList.map((item) => (item.id === s.id ? { ...item, ...res.staff } : item)));
      toast.success(res.message || `Personnel '${s.name}' promoted to Administrator!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to promote staff member.");
    }
  };

  const handleDemote = async (s: User) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Administrators have authority to demote administrators.");
      return;
    }
    if (s.role === "super_admin") {
      toast.error("Super Administrator is untouchable and cannot be demoted.");
      return;
    }
    try {
      const res = await adminApi.demoteStaff(s.id);
      setStaffList(staffList.map((item) => (item.id === s.id ? { ...item, ...res.staff } : item)));
      toast.success(res.message || `Administrator '${s.name}' demoted to Staff.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to demote administrator.");
    }
  };

  const togglePermission = (permId: string) => {
    if (permissions.includes(permId)) {
      setPermissions(permissions.filter((p) => p !== permId));
    } else {
      setPermissions([...permissions, permId]);
    }
  };

  const toggleModulePermissions = (module: PermissionModule) => {
    const modulePermIds = module.permissions.map((p) => p.id);
    const allSelected = modulePermIds.every((id) => permissions.includes(id));

    if (allSelected) {
      // Remove all in this module
      setPermissions(permissions.filter((id) => !modulePermIds.includes(id)));
    } else {
      // Add all missing in this module
      const combined = Array.from(new Set([...permissions, ...modulePermIds]));
      setPermissions(combined);
    }
  };

  // Quick Preset Handlers
  const applyPreset = (preset: "all" | "operations" | "warehouse" | "support" | "catalog" | "none") => {
    if (preset === "all") {
      const allPerms = ADMIN_PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.id));
      setPermissions(allPerms);
    } else if (preset === "operations") {
      setPermissions([
        "products.view", "products.manage", "categories.manage", 
        "inventory.manage", "orders.view", "orders.manage", 
        "customers.view", "customers.manage", "coupons.manage", "reviews.manage", "analytics.view"
      ]);
    } else if (preset === "warehouse") {
      setPermissions(["inventory.manage", "products.view", "orders.view"]);
    } else if (preset === "support") {
      setPermissions(["orders.view", "orders.manage", "customers.view", "customers.manage", "reviews.manage"]);
    } else if (preset === "catalog") {
      setPermissions(["products.view", "products.manage", "categories.manage", "inventory.manage"]);
    } else {
      setPermissions([]);
    }
  };

  const isEditDirty = Boolean(
    editingStaff && (
      (firstName.trim() !== ((editingStaff.name || "").trim().split(" ")[0] || "")) ||
      (lastName.trim() !== ((editingStaff.name || "").trim().split(" ").slice(1).join(" ") || "")) ||
      (email.trim() !== (editingStaff.email || "")) ||
      ((phone.trim() || "") !== (editingStaff.phone || "")) ||
      ((avatar || null) !== (editingStaff.avatar || null)) ||
      (role !== editingStaff.role) ||
      (status !== (editingStaff.status || "active")) ||
      (password.length > 0) ||
      (role === "staff" && JSON.stringify([...permissions].sort()) !== JSON.stringify([...(editingStaff.permissions || [])].sort()))
    )
  );

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff?.role === "super_admin" && !isSuperAdmin) {
      toast.error("Super Administrator account is untouchable and cannot be modified.");
      return;
    }
    if (editingStaff && !isEditDirty) {
      toast.info("No changes were made.");
      return;
    }
    setSaving(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const payload: any = {
      name: fullName,
      email,
      role: isSuperAdmin ? role : (editingStaff ? editingStaff.role : "staff"),
      status,
      phone: phone || null,
      avatar,
      permissions: role === "staff" ? permissions : [],
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (editingStaff) {
        const res = await adminApi.updateStaff(editingStaff.id, payload);
        setStaffList(staffList.map((s) => (s.id === editingStaff.id ? res.staff : s)));
        if (viewingStaff?.id === editingStaff.id) setViewingStaff(res.staff);
        toast.success(`Updated staff account '${res.staff.name}'`);
      } else {
        const res = await adminApi.createStaff(payload);
        setStaffList([res.staff, ...staffList]);
        toast.success(`Created ${res.staff.role} account '${res.staff.name}'`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save staff account.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSuspension = async (payload: SuspensionPayload) => {
    if (!suspendingStaff) return;
    setIsSubmittingSuspension(true);
    try {
      const res = await adminApi.suspendStaff(suspendingStaff.id, payload);
      setStaffList(staffList.map((s) => (s.id === suspendingStaff.id ? res.staff : s)));
      if (viewingStaff?.id === suspendingStaff.id) setViewingStaff(res.staff);
      toast.success(res.message || `Staff '${suspendingStaff.name}' suspended.`);
      setSuspendingStaff(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to suspend staff.");
    } finally {
      setIsSubmittingSuspension(false);
    }
  };

  const handleReactivateStaff = async (staffMember: User) => {
    try {
      const res = await adminApi.reactivateStaff(staffMember.id);
      setStaffList(staffList.map((s) => (s.id === staffMember.id ? res.staff : s)));
      if (viewingStaff?.id === staffMember.id) setViewingStaff(res.staff);
      toast.success(res.message || `Staff '${staffMember.name}' reactivated.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reactivate staff.");
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    setDeleting(true);

    try {
      await adminApi.deleteStaff(deletingStaff.id);
      setStaffList(staffList.filter((s) => s.id !== deletingStaff.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingStaff.id));
      if (viewingStaff?.id === deletingStaff.id) setViewingStaff(null);
      toast.success(`Staff account '${deletingStaff.name}' removed.`);
      setDeletingStaff(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete staff account.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleSelectAll = () => {
    // Only select staff that can be deleted (exclude super_admin and self)
    const deletableIds = filteredStaff
      .filter((s) => s.role !== "super_admin" && s.id !== adminUser?.id)
      .map((s) => s.id);

    if (deletableIds.length > 0 && selectedIds.length === deletableIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deletableIds);
    }
  };

  const handleToggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await adminApi.bulkDeleteStaff(selectedIds);
      const updated = await adminApi.getStaff();
      setStaffList(updated || []);
      if (viewingStaff && selectedIds.includes(viewingStaff.id)) setViewingStaff(null);
      setSelectedIds([]);
      toast.success(res.message || `Processed staff deletion.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete selected staff.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    toast.success("Personnel filters reset to default.");
  };

  const filteredStaff = staffList.filter((s) => {
    if (roleFilter !== "all" && s.role !== roleFilter) return false;
    if (statusFilter !== "all" && (s.status || "active") !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (s.name || "").toLowerCase().includes(q);
      const matchEmail = (s.email || "").toLowerCase().includes(q);
      const matchRole = (s.role || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Access Control & RBAC
          </span>
          <h1 className="text-2xl font-black text-white">Staff & Administrator Directory ({filteredStaff.length})</h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add Personnel
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search personnel name, email, or role..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <AdminDropdown
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={[
              { value: "all", label: "All Security Roles" },
              { value: "super_admin", label: "Super Admin" },
              { value: "admin", label: "Admin" },
              { value: "staff", label: "Staff" },
            ]}
          />

          <AdminDropdown
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: "all", label: "All Account Statuses" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
            ]}
          />

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            title="Reset personnel filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Staff Table with Scrollable Drag Card */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[760px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredStaff.filter((s) => s.role !== "super_admin" && s.id !== adminUser?.id).length > 0 &&
                    selectedIds.length === filteredStaff.filter((s) => s.role !== "super_admin" && s.id !== adminUser?.id).length
                  }
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 cursor-pointer accent-amber-500"
                  title="Select all deletable staff"
                />
              </th>
              <th className="p-3.5">Personnel</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Permissions</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Joined</th>
              <th className="p-3.5 text-center min-w-[160px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Loading personnel records...
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No personnel matching search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredStaff.map((s: any) => {
                const isSelected = selectedIds.includes(s.id);
                const isProtected = s.role === "super_admin" || s.id === adminUser?.id;
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-amber-500/10 border-l-2 border-amber-500"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isProtected}
                        onChange={() => handleToggleSelectRow(s.id)}
                        className={`w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 accent-amber-500 ${
                          isProtected ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                        }`}
                        title={isProtected ? "Protected account cannot be selected for deletion" : "Select row"}
                      />
                    </td>
                    <td className="p-3.5 flex items-center gap-3 font-bold text-white">
                    <img
                      src={s.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                      alt={s.name}
                      className="w-8 h-8 rounded-xl object-cover bg-slate-900 ring-1 ring-amber-400/30 shrink-0"
                    />
                    <div>
                      <span className="text-white font-bold block">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{s.email}</span>
                    </div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      s.role === "super_admin"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10"
                        : s.role === "admin"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30"
                    }`}>
                      {s.role === "super_admin" && <Crown className="w-3 h-3 text-purple-400 shrink-0" />}
                      {s.role === "admin" && <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />}
                      {s.role === "staff" && <UserCog className="w-3 h-3 text-cyan-400 shrink-0" />}
                      {s.role === "super_admin" ? "Super Admin" : s.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-300 max-w-xs truncate">
                    {s.role === "super_admin" ? (
                      <span className="text-purple-300 font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3 text-purple-400" /> Untouchable Root Access
                      </span>
                    ) : s.role === "admin" ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-400" /> Full Operations Access
                      </span>
                    ) : s.permissions && s.permissions.length > 0 ? (
                      <span className="text-slate-400 font-mono text-[10px]">{s.permissions.length} module permissions</span>
                    ) : (
                      <span className="text-slate-500 italic">Read-only</span>
                    )}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    {s.status === "active" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    ) : s.suspended_until ? (
                      <div className="flex flex-col">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-help"
                          title={s.suspension_reason ? `Reason: ${s.suspension_reason}` : undefined}
                        >
                          Suspended (Timed)
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                          Until {formatDate(s.suspended_until)}
                        </span>
                      </div>
                    ) : (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 cursor-help"
                        title={s.suspension_reason ? `Reason: ${s.suspension_reason}` : undefined}
                      >
                        Suspended (Indefinite)
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{formatDate(s.created_at)}</td>
                  
                  {/* ICON-ONLY ACTION SYSTEM */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    {s.role === "super_admin" && !isSuperAdmin ? (
                      /* Protected Super Admin Badge for non-superadmins */
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingStaff(s)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all shadow-sm"
                          title="View Super Admin Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <div 
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-black tracking-wide"
                          title="Super Administrator is permanent and protected from all external modifications"
                        >
                          <Crown className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>Untouchable</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-start gap-1.5 flex-wrap w-[146px] mx-auto">
                        <button
                          onClick={() => setViewingStaff(s)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all shadow-sm"
                          title="View Personnel Profile & Clearance"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-105 transition-all shadow-sm"
                          title="Edit Personnel & Permissions"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Super Admin Quick Promote to Admin */}
                        {isSuperAdmin && s.role === "staff" && (
                          <button
                            onClick={() => handlePromote(s)}
                            className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:scale-105 transition-all shadow-sm"
                            title="Promote to Administrator (Executive Clearance)"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Super Admin Quick Demote to Staff */}
                        {isSuperAdmin && s.role === "admin" && (
                          <button
                            onClick={() => handleDemote(s)}
                            className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-105 transition-all shadow-sm"
                            title="Demote from Administrator to Staff"
                          >
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Suspension Toggle (Excluded for Super Admin accounts & Self) */}
                        {s.role !== "super_admin" && adminUser?.id !== s.id && (
                          s.status === "active" ? (
                            <button
                              onClick={() => setSuspendingStaff(s)}
                              className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all shadow-sm"
                              title="Suspend Account (Indefinite / Timed)"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivateStaff(s)}
                              className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:scale-105 transition-all shadow-sm"
                              title="Reactivate Account"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}

                        {/* Delete (Excluded for Super Admin accounts & Self) */}
                        {s.role !== "super_admin" && adminUser?.id !== s.id && (
                          <button
                            onClick={() => setDeletingStaff(s)}
                            className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all shadow-sm"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </ScrollableTableCard>

      {/* View Staff Profile & Permissions Modal */}
      {viewingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setViewingStaff(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c0e15] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 z-10 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={viewingStaff.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                  alt={viewingStaff.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400/40 shrink-0"
                />
                <div>
                  <h3 className="text-base font-black text-white">{viewingStaff.name}</h3>
                  <span className="text-[11px] text-slate-400">{viewingStaff.email}</span>
                </div>
              </div>
              <button onClick={() => setViewingStaff(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewingStaff.role === "super_admin" && (
              <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2.5 shadow-sm">
                <Crown className="w-4 h-4 text-purple-400 shrink-0" />
                <span><b>Untouchable Master Authority:</b> This Super Administrator account holds immutable clearance. It cannot be demoted, modified, suspended, or deleted by other administrators.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned System Role</span>
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1">
                  {viewingStaff.role === "super_admin" && <Crown className="w-3.5 h-3.5 text-purple-400" />}
                  {viewingStaff.role === "super_admin" ? "Super Admin" : viewingStaff.role}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
                <span className="text-xs font-black uppercase text-emerald-400 block">{viewingStaff.status || "active"}</span>
              </div>
            </div>

            {/* Granular Permissions Inspection */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider block">
                Dynamic Permission Matrix ({viewingStaff.permissions?.length || 0} active)
              </span>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {ADMIN_PERMISSION_MODULES.map((module) => (
                  <div key={module.name} className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                      {module.name}
                    </span>
                    <div className="space-y-1.5">
                      {module.permissions.map((p) => {
                        const hasPerm = viewingStaff.role === "super_admin" || viewingStaff.role === "admin" || (viewingStaff.permissions && viewingStaff.permissions.includes(p.id));
                        return (
                          <div key={p.id} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300">{p.name}</span>
                            {hasPerm ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                              </span>
                            ) : (
                              <span className="text-slate-600 flex items-center gap-1 text-[10px]">
                                <XCircle className="w-3.5 h-3.5" /> Restricted
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <Link
                href={`/admin/audit-logs?search=${viewingStaff.name}`}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
              >
                <ScrollText className="w-3.5 h-3.5 text-purple-400" />
                <span>Audit Logs History</span>
              </Link>

              {(! (viewingStaff.role === "super_admin" && !isSuperAdmin)) && (
                <button
                  onClick={() => {
                    const s = viewingStaff;
                    setViewingStaff(null);
                    handleOpenEdit(s);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase transition-all shadow-md"
                >
                  Modify Permissions
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Staff Modal with Dynamic Granular Permission Matrix */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c0e15] border border-amber-500/30 shadow-2xl p-6 sm:p-8 z-10 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Staff Administration & RBAC
                </span>
                <h3 className="text-base font-black text-white">
                  {editingStaff ? `Modify Personnel: ${editingStaff.name}` : "Provision New Operations Personnel"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <ImageUploadAvatar
                value={avatar}
                onChange={(val) => setAvatar(val)}
                name={`${firstName} ${lastName}`.trim() || "Personnel"}
                size="md"
                label="Personnel Profile Photo"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rachel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
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
                    placeholder="e.g. Sterling"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rachel@ecommerce.test"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Password {editingStaff && "(Leave blank to keep current)"}
                  </label>
                  <PasswordInput
                    required={!editingStaff}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    inputClassName="bg-white/5 border border-white/10 rounded-xl py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    System Role {!isSuperAdmin && "(Locked)"}
                  </label>
                  <AdminDropdown
                    value={role}
                    onChange={(val) => {
                      if (!isSuperAdmin) {
                        toast.error("Only Super Administrators can change personnel system roles.");
                        return;
                      }
                      setRole(val);
                    }}
                    className="w-full"
                    buttonClassName="w-full py-2"
                    options={
                      isSuperAdmin
                        ? [
                            { value: "staff", label: "Staff Member (Custom RBAC)" },
                            { value: "admin", label: "Operational Admin (Full Access)" },
                            ...(editingStaff?.role === "super_admin"
                              ? [{ value: "super_admin", label: "Super Administrator (Master)" }]
                              : []),
                          ]
                        : [
                            { value: role, label: role === "super_admin" ? "Super Administrator (Protected)" : role === "admin" ? "Operational Admin" : "Staff Member" },
                          ]
                    }
                  />
                  {!isSuperAdmin && (
                    <span className="text-[10px] text-amber-400/80 mt-1 block">
                      Only Super Administrators have clearance to promote or demote roles.
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Account Status</label>
                  <AdminDropdown
                    value={status}
                    onChange={(val) => setStatus(val)}
                    className="w-full"
                    buttonClassName="w-full py-2"
                    options={[
                      { value: "active", label: "Active" },
                      { value: "suspended", label: "Suspended" },
                    ]}
                  />
                </div>
              </div>

              {/* Dynamic Modular Staff Permissions Matrix */}
              {role === "staff" ? (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-black uppercase text-slate-200 block">
                        Dynamic Access Control Matrix ({permissions.length} selected)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Select individual permissions or apply quick role presets.
                      </span>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => applyPreset("all")}
                        className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/20"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("operations")}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold border border-white/10"
                      >
                        Ops Manager
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("warehouse")}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold border border-white/10"
                      >
                        Warehouse
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("support")}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold border border-white/10"
                      >
                        Support
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("none")}
                        className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-semibold border border-rose-500/20"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Modules Accordion Cards */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {ADMIN_PERMISSION_MODULES.map((module) => {
                      const modulePermIds = module.permissions.map((p) => p.id);
                      const allSelected = modulePermIds.every((id) => permissions.includes(id));
                      const someSelected = modulePermIds.some((id) => permissions.includes(id));

                      return (
                        <div
                          key={module.name}
                          className="p-3.5 rounded-2xl bg-[#0e121e] border border-white/10 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                                {module.name}
                              </span>
                              <span className="text-[10px] text-slate-400">{module.description}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleModulePermissions(module)}
                              className="text-[10px] font-bold text-slate-400 hover:text-amber-300 transition-colors"
                            >
                              {allSelected ? "Deselect All" : "Select All"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/5">
                            {module.permissions.map((p) => {
                              const isChecked = permissions.includes(p.id);
                              return (
                                <label
                                  key={p.id}
                                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                                    isChecked
                                      ? "bg-amber-500/10 border-amber-500/30 text-white shadow-sm"
                                      : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePermission(p.id)}
                                    className="mt-0.5 rounded accent-amber-500 bg-white/10"
                                  />
                                  <div>
                                    <span className="font-bold text-xs block leading-none">{p.name}</span>
                                    <span className="text-[10px] text-slate-400 mt-1 block leading-tight">
                                      {p.description}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>The <b>{role.toUpperCase()}</b> role automatically inherits full operational permissions across all modules.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (editingStaff ? !isEditDirty : false)}
                  className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-wide transition-all shadow-md ${
                    editingStaff && !isEditDirty
                      ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                  title={editingStaff && !isEditDirty ? "No changes made to personnel profile or permissions" : undefined}
                >
                  {saving ? "Saving..." : editingStaff ? "Save Permissions" : "Create Personnel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspension Modal for Staff */}
      {suspendingStaff && (
        <SuspensionModal
          isOpen={!!suspendingStaff}
          onClose={() => setSuspendingStaff(null)}
          onConfirm={handleConfirmSuspension}
          targetName={suspendingStaff.name}
          targetEmail={suspendingStaff.email}
          targetType="staff"
          isSubmitting={isSubmittingSuspension}
        />
      )}

      {/* Delete Modal */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeletingStaff(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0e121e] border border-rose-500/30 p-6 z-10 space-y-4 text-xs">
            <h3 className="text-base font-black text-white">Delete Personnel</h3>
            <p className="text-slate-300">
              Are you sure you want to terminate administrative access for <span className="font-bold text-white">{deletingStaff.name}</span>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteStaff}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md"
              >
                {deleting ? "Deleting..." : "Confirm Termination"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={filteredStaff.filter((s) => s.role !== "super_admin" && s.id !== adminUser?.id).length}
        itemName="personnel"
        isDeleting={isBulkDeleting}
        onClearSelection={() => setSelectedIds([])}
        onSelectAll={handleToggleSelectAll}
        onConfirmDelete={handleBulkDelete}
      />
    </div>
  );
}
