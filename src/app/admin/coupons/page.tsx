"use client";

import { useState, useEffect } from "react";
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Sparkles, 
  Check, 
  X,
  Percent,
  DollarSign,
  Clock,
  Calendar,
  Infinity as InfinityIcon,
  Timer,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { AdminDropdown } from "@/components/admin/AdminDropdown";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState("20");
  const [minOrderAmount, setMinOrderAmount] = useState("50");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("1000");
  const [isActive, setIsActive] = useState(true);
  const [hasDuration, setHasDuration] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [customDurationVal, setCustomDurationVal] = useState("10");
  const [customDurationUnit, setCustomDurationUnit] = useState<"hours" | "days" | "weeks">("days");
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingCoupon, setDeletingCoupon] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const toDateTimeLocalValue = (dateStr?: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const applyDurationPreset = (hours: number) => {
    const base = startsAt ? new Date(startsAt) : new Date();
    if (!startsAt) {
      setStartsAt(toDateTimeLocalValue(new Date().toISOString()));
    }
    const end = new Date(base.getTime() + hours * 60 * 60 * 1000);
    setExpiresAt(toDateTimeLocalValue(end.toISOString()));
    setHasDuration(true);
  };

  const applyCustomDuration = () => {
    const num = Number(customDurationVal);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid positive number for duration.");
      return;
    }
    let hours = num;
    if (customDurationUnit === "days") hours = num * 24;
    if (customDurationUnit === "weeks") hours = num * 24 * 7;

    const base = startsAt ? new Date(startsAt) : new Date();
    if (!startsAt) {
      setStartsAt(toDateTimeLocalValue(new Date().toISOString()));
    }
    const end = new Date(base.getTime() + hours * 60 * 60 * 1000);
    setExpiresAt(toDateTimeLocalValue(end.toISOString()));
    setHasDuration(true);
    toast.success(`Calculated end date (+${num} ${customDurationUnit}).`);
  };

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCoupons({ search: search.trim() || undefined });
      setCoupons(res.data || []);
    } catch (err) {
      toast.error("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    adminApi.getCoupons({}).then((res) => {
      setCoupons(res.data || []);
    });
    toast.success("Coupon filters reset to default.");
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode("");
    setType("percentage");
    setValue("20");
    setMinOrderAmount("50");
    setMaxDiscountAmount("");
    setUsageLimit("1000");
    setIsActive(true);
    setHasDuration(false);
    setStartsAt("");
    setExpiresAt("");
    setCustomDurationVal("10");
    setCustomDurationUnit("days");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCoupon(c);
    setCode(c.code);
    setType(c.type);
    setValue(c.value.toString());
    setMinOrderAmount(c.min_order_amount?.toString() || "");
    setMaxDiscountAmount(c.max_discount_amount?.toString() || "");
    setUsageLimit(c.usage_limit?.toString() || "");
    setIsActive(c.is_active);
    setHasDuration(Boolean(c.starts_at || c.expires_at));
    setStartsAt(toDateTimeLocalValue(c.starts_at));
    setExpiresAt(toDateTimeLocalValue(c.expires_at));
    setCustomDurationVal("10");
    setCustomDurationUnit("days");
    setIsModalOpen(true);
  };

  const isEditDirty = Boolean(
    editingCoupon && (
      code.trim().toUpperCase() !== (editingCoupon.code || "").toUpperCase() ||
      type !== editingCoupon.type ||
      value !== (editingCoupon.value?.toString() || "0") ||
      minOrderAmount !== (editingCoupon.min_order_amount?.toString() || "") ||
      maxDiscountAmount !== (editingCoupon.max_discount_amount?.toString() || "") ||
      usageLimit !== (editingCoupon.usage_limit?.toString() || "") ||
      isActive !== editingCoupon.is_active ||
      hasDuration !== Boolean(editingCoupon.starts_at || editingCoupon.expires_at) ||
      (hasDuration && startsAt !== toDateTimeLocalValue(editingCoupon.starts_at)) ||
      (hasDuration && expiresAt !== toDateTimeLocalValue(editingCoupon.expires_at))
    )
  );

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon && !isEditDirty) {
      toast.info("No changes were made.");
      return;
    }

    if (hasDuration && startsAt && expiresAt) {
      if (new Date(expiresAt).getTime() <= new Date(startsAt).getTime()) {
        toast.error("The End Date & Time (To) must be after the Start Date & Time (From).");
        return;
      }
    }

    setSaving(true);

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      min_order_amount: minOrderAmount ? Number(minOrderAmount) : null,
      max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usage_limit: usageLimit ? Number(usageLimit) : null,
      is_active: isActive,
      starts_at: hasDuration && startsAt ? new Date(startsAt).toISOString() : null,
      expires_at: hasDuration && expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    try {
      if (editingCoupon) {
        const res = await adminApi.updateCoupon(editingCoupon.id, payload);
        setCoupons(coupons.map((c) => (c.id === editingCoupon.id ? res.coupon : c)));
        toast.success(`Coupon '${res.coupon.code}' updated.`);
      } else {
        const res = await adminApi.createCoupon(payload);
        setCoupons([res.coupon, ...coupons]);
        toast.success(`Coupon '${res.coupon.code}' created.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deletingCoupon) return;
    setDeleting(true);

    try {
      await adminApi.deleteCoupon(deletingCoupon.id);
      setCoupons(coupons.filter((c) => c.id !== deletingCoupon.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingCoupon.id));
      toast.success(`Coupon '${deletingCoupon.code}' removed.`);
      setDeletingCoupon(null);
    } catch (err: any) {
      toast.error("Failed to delete coupon.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (filteredCoupons.length > 0 && selectedIds.length === filteredCoupons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCoupons.map((c) => c.id));
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
      const res = await adminApi.bulkDeleteCoupons(selectedIds);
      setCoupons((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      toast.success(res.message || `Deleted ${selectedIds.length} coupon(s).`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete selected coupons.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const isExpired = c.expires_at && new Date(c.expires_at).getTime() < Date.now();
    const isScheduled = c.starts_at && new Date(c.starts_at).getTime() > Date.now();
    if (statusFilter === "active") return c.is_active && !isExpired && !isScheduled;
    if (statusFilter === "scheduled") return c.is_active && isScheduled;
    if (statusFilter === "expired") return isExpired;
    if (statusFilter === "inactive") return !c.is_active;
    return true;
  });

  const renderCouponStatus = (c: any) => {
    const isExpired = c.expires_at && new Date(c.expires_at).getTime() < Date.now();
    const isScheduled = c.starts_at && new Date(c.starts_at).getTime() > Date.now();
    if (!c.is_active) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
          Inactive
        </span>
      );
    }
    if (isScheduled) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 w-fit">
          <Calendar className="w-3 h-3 text-cyan-400 shrink-0" /> Scheduled
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
          <Clock className="w-3 h-3 text-rose-400 shrink-0" /> Expired
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
        <Check className="w-3 h-3 text-emerald-400 shrink-0" /> Active
      </span>
    );
  };

  const renderCouponDuration = (c: any) => {
    const isScheduled = c.starts_at && new Date(c.starts_at).getTime() > Date.now();

    if (isScheduled) {
      return (
        <div className="flex flex-col text-xs">
          <span className="text-cyan-300 font-bold flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cyan-400 shrink-0" /> Starts {formatDate(c.starts_at)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {formatTime(c.starts_at)} {c.expires_at ? `• Until ${formatDate(c.expires_at)}` : "• No Expiry"}
          </span>
        </div>
      );
    }

    if (!c.expires_at) {
      if (c.starts_at) {
        return (
          <div className="flex flex-col text-xs">
            <span className="text-emerald-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" /> Active since {formatDate(c.starts_at)}
            </span>
            <span className="text-[10px] text-slate-500">Never Expires</span>
          </div>
        );
      }
      return (
        <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
          <InfinityIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          Never Expires
        </span>
      );
    }

    const expDate = new Date(c.expires_at);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();
    const isExpired = diffMs <= 0;

    if (isExpired) {
      return (
        <div className="flex flex-col text-xs">
          <span className="text-rose-400 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-rose-400 shrink-0" /> Automatically Halted
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Expired on {formatDate(c.expires_at)}
          </span>
        </div>
      );
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let countdownText = "";
    if (diffDays > 1) {
      countdownText = `${diffDays} days remaining`;
    } else if (diffHours > 0) {
      countdownText = `${diffHours} hours remaining`;
    } else {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      countdownText = `${diffMins} mins remaining`;
    }

    return (
      <div className="flex flex-col text-xs">
        <span className="text-amber-300 font-bold flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400 shrink-0" /> {countdownText}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Until {formatDate(c.expires_at)}, {formatTime(c.expires_at)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Promotions & Discounts
          </span>
          <h1 className="text-2xl font-black text-white">Coupons & Campaigns ({coupons.length})</h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); loadCoupons(); }} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon codes..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <AdminDropdown
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: "all", label: "All Campaigns" },
              { value: "active", label: "Active & Valid" },
              { value: "scheduled", label: "Scheduled (Future)" },
              { value: "expired", label: "Expired Duration" },
              { value: "inactive", label: "Manually Disabled" },
            ]}
          />

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            title="Reset all coupon filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Coupons Table with Scrollable Drag Card */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[750px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredCoupons.length > 0 && selectedIds.length === filteredCoupons.length}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 cursor-pointer accent-amber-500"
                  title="Select all coupons"
                />
              </th>
              <th className="p-3.5">Coupon Code</th>
              <th className="p-3.5">Discount Value</th>
              <th className="p-3.5">Min Spend</th>
              <th className="p-3.5 min-w-[180px]">Duration & Expiry</th>
              <th className="p-3.5">Redemptions</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  Loading promotional campaigns...
                </td>
              </tr>
            ) : filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                  No discount coupons matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredCoupons.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                return (
                  <tr
                    key={c.id}
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
                        onChange={() => handleToggleSelectRow(c.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 cursor-pointer accent-amber-500"
                      />
                    </td>
                    <td className="p-3.5 font-mono font-black text-amber-400 text-sm tracking-wider whitespace-nowrap">
                    {c.code}
                  </td>
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">
                    {c.type === "percentage" ? `${c.value}% OFF` : `${formatPrice(c.value)} OFF`}
                  </td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    {c.min_order_amount ? formatPrice(c.min_order_amount) : "No minimum"}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    {renderCouponDuration(c)}
                  </td>
                  <td className="p-3.5 text-slate-300 whitespace-nowrap">
                    <span className="font-bold text-white">{c.used_count ?? c.usage_count ?? 0}</span>
                    <span className="text-slate-500"> / {c.usage_limit ?? "∞"}</span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    {renderCouponStatus(c)}
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-start gap-1.5 flex-wrap w-[146px] mx-auto">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-105 transition-all shadow-sm"
                        title="Edit Coupon & Duration"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingCoupon(c)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all shadow-sm"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </ScrollableTableCard>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e121e] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-black text-white">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Campaign"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. STUDIO25"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Discount Type</label>
                  <AdminDropdown
                    value={type}
                    onChange={(val: any) => setType(val)}
                    className="w-full"
                    buttonClassName="w-full py-2"
                    options={[
                      { value: "percentage", label: "Percentage (%)" },
                      { value: "fixed", label: "Fixed Amount ($)" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Value {type === "percentage" ? "(%)" : "($)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Campaign Duration & Timing Policy Panel */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-white">
                      Campaign Duration & Timing
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasDuration) {
                        setHasDuration(true);
                        if (!startsAt) {
                          setStartsAt(toDateTimeLocalValue(new Date().toISOString()));
                        }
                        applyDurationPreset(72); // Default to 3 days
                      } else {
                        setHasDuration(false);
                        setStartsAt("");
                        setExpiresAt("");
                      }
                    }}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      hasDuration
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20"
                    }`}
                  >
                    {hasDuration ? (
                      <>
                        <X className="w-3.5 h-3.5" /> Remove Duration (Never Expires)
                      </>
                    ) : (
                      <>
                        <Timer className="w-3.5 h-3.5" /> Set Duration
                      </>
                    )}
                  </button>
                </div>

                {hasDuration ? (
                  <div className="space-y-3.5 pt-2 border-t border-white/5">
                    {/* Quick Duration Presets */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Quick Duration Presets
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {[
                          { label: "24 Hours", hours: 24 },
                          { label: "3 Days", hours: 72 },
                          { label: "7 Days", hours: 168 },
                          { label: "14 Days", hours: 336 },
                          { label: "30 Days", hours: 720 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => applyDurationPreset(p.hours)}
                            className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/30 text-[10px] font-bold text-slate-300 border border-white/5 transition-all text-center"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Duration Section */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Custom Duration Section
                      </span>
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={customDurationVal}
                          onChange={(e) => setCustomDurationVal(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-20 bg-[#0c0e15] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                        />
                        <select
                          value={customDurationUnit}
                          onChange={(e) => setCustomDurationUnit(e.target.value as any)}
                          className="bg-[#0c0e15] border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                        >
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                        </select>
                        <button
                          type="button"
                          onClick={applyCustomDuration}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-black text-[10px] uppercase tracking-wider transition-all shrink-0"
                        >
                          Apply Custom Duration
                        </button>
                      </div>
                    </div>

                    {/* Datetime Pickers: FROM and TO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* FROM / START DATE */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                            From (Start Date & Time)
                          </label>
                          <button
                            type="button"
                            onClick={() => setStartsAt(toDateTimeLocalValue(new Date().toISOString()))}
                            className="text-[9px] text-cyan-400 hover:underline font-bold"
                          >
                            Set to Now
                          </button>
                        </div>
                        <input
                          type="datetime-local"
                          value={startsAt}
                          onChange={(e) => setStartsAt(e.target.value)}
                          className="w-full bg-[#0c0e15] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                        />
                        <span className="text-[9px] text-slate-500 mt-1 block">
                          When this campaign officially begins.
                        </span>
                      </div>

                      {/* TO / EXPIRY DATE */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                            To (End Date & Time / Expiry)
                          </label>
                          {expiresAt && (
                            <button
                              type="button"
                              onClick={() => setExpiresAt("")}
                              className="text-[9px] text-slate-400 hover:text-white font-bold"
                            >
                              Clear Expiry
                            </button>
                          )}
                        </div>
                        <input
                          type="datetime-local"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          className="w-full bg-[#0c0e15] border border-amber-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                        />
                        <span className="text-[9px] text-slate-500 mt-1 block">
                          Leave empty for continuous / open-ended campaigns.
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This coupon has no time constraint and will remain valid indefinitely until manually deactivated or until its usage limit is exhausted. Click <b className="text-amber-400">Set Duration</b> to schedule start (From) and expiration (To) dates.
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-white/5 accent-amber-500"
                />
                <span>Coupon is actively redeemable by customers</span>
              </label>

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
                  disabled={saving || (editingCoupon ? !isEditDirty : false)}
                  className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-wide transition-all shadow-md ${
                    editingCoupon && !isEditDirty
                      ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                  title={editingCoupon && !isEditDirty ? "No changes made to coupon details" : undefined}
                >
                  {saving ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeletingCoupon(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0e121e] border border-rose-500/30 p-6 z-10 space-y-4 text-xs">
            <h3 className="text-base font-black text-white">Delete Coupon</h3>
            <p className="text-slate-300">
              Are you sure you want to deactivate and remove coupon <span className="font-mono font-bold text-amber-400">{deletingCoupon.code}</span>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteCoupon}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={filteredCoupons.length}
        itemName="coupon"
        isDeleting={isBulkDeleting}
        onClearSelection={() => setSelectedIds([])}
        onSelectAll={handleToggleSelectAll}
        onConfirmDelete={handleBulkDelete}
      />
    </div>
  );
}
