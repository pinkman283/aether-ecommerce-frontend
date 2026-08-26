"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  ShoppingBag, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  MapPin, 
  AlertTriangle,
  History,
  Clock,
  PackageCheck,
  PackageX,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { AdminDropdown } from "@/components/admin/AdminDropdown";
import { SuspensionModal, SuspensionPayload } from "@/components/admin/SuspensionModal";
import { ImageUploadAvatar } from "@/components/ui/ImageUploadAvatar";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Customer Drawer / Inspector
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Customer History & Lifecycle Ledger Modal State
  const [historyCustomer, setHistoryCustomer] = useState<any | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Suspension Modal State
  const [suspendingCustomer, setSuspendingCustomer] = useState<any | null>(null);
  const [isSubmittingSuspension, setIsSubmittingSuspension] = useState(false);

  // Create Customer Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [status, setStatus] = useState("active");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [creating, setCreating] = useState(false);

  // Edit Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("active");
  const [editPassword, setEditPassword] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Customer Modal State
  const [deletingCustomer, setDeletingCustomer] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        per_page: 50,
      });
      setCustomers(res.data || []);
    } catch (err) {
      toast.error("Failed to load customer registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    adminApi.getCustomers({ per_page: 50 }).then((res) => {
      setCustomers(res.data || []);
    });
    toast.success("Customer filters reset to default.");
  };

  const handleOpenCreate = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setAvatar(null);
    setStatus("active");
    setAddressLine("");
    setCity("San Francisco");
    setState("CA");
    setPostalCode("94107");
    setCountry("United States");
    setIsCreateModalOpen(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await adminApi.createCustomer({
        name: fullName,
        email,
        password,
        phone: phone || null,
        avatar: avatar || undefined,
        status,
        address_line1: addressLine || null,
        city: city || null,
        state: state || null,
        postal_code: postalCode || null,
        country: country || null,
      });

      setCustomers([res.customer, ...customers]);
      toast.success(res.message);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create customer.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCustomerHistory = async (id: number) => {
    setLoadingHistory(true);
    try {
      const data = await adminApi.getCustomer(id);
      setHistoryCustomer(data);
    } catch (err) {
      toast.error("Failed to load customer order & lifecycle history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenEdit = (c: any) => {
    setEditingCustomer(c);
    const parts = (c.name || "").trim().split(" ");
    setEditFirstName(parts[0] || "");
    setEditLastName(parts.slice(1).join(" ") || "");
    setEditEmail(c.email);
    setEditPhone(c.phone || "");
    setEditAvatar(c.avatar || null);
    setEditStatus(c.status || "active");
    setEditPassword("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!isEditDirty) {
      toast.info("No changes were made.");
      return;
    }
    setSavingEdit(true);

    const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();
    const payload: any = {
      name: fullName,
      email: editEmail,
      phone: editPhone || null,
      avatar: editAvatar,
      status: editStatus,
    };

    if (editPassword) {
      payload.password = editPassword;
    }

    try {
      const res = await adminApi.updateCustomer(editingCustomer.id, payload);
      setCustomers(customers.map((c) => (c.id === editingCustomer.id ? { ...c, ...res.customer } : c)));
      if (selectedCustomer?.id === editingCustomer.id) {
        setSelectedCustomer({ ...selectedCustomer, ...res.customer });
      }
      toast.success(`Customer '${res.customer.name}' updated.`);
      setEditingCustomer(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update customer.");
    } finally {
      setSavingEdit(false);
    }
  };

  const isEditDirty = Boolean(
    editingCustomer && (
      (editFirstName.trim() !== ((editingCustomer.name || "").trim().split(" ")[0] || "")) ||
      (editLastName.trim() !== ((editingCustomer.name || "").trim().split(" ").slice(1).join(" ") || "")) ||
      (editEmail.trim() !== (editingCustomer.email || "")) ||
      ((editPhone.trim() || "") !== (editingCustomer.phone || "")) ||
      ((editAvatar || null) !== (editingCustomer.avatar || null)) ||
      (editStatus !== (editingCustomer.status || "active")) ||
      (editPassword.length > 0)
    )
  );

  const handleInspectCustomer = async (id: number) => {
    try {
      const customer = await adminApi.getCustomer(id);
      setSelectedCustomer(customer);
    } catch (err) {
      toast.error("Failed to fetch customer profile.");
    }
  };

  const handleConfirmSuspension = async (payload: SuspensionPayload) => {
    if (!suspendingCustomer) return;
    setIsSubmittingSuspension(true);
    try {
      const res = await adminApi.suspendCustomer(suspendingCustomer.id, payload);
      setCustomers(customers.map((c) => (c.id === suspendingCustomer.id ? { ...c, ...res.customer } : c)));
      if (selectedCustomer?.id === suspendingCustomer.id) {
        setSelectedCustomer({ ...selectedCustomer, ...res.customer });
      }
      toast.success(res.message || `Customer '${suspendingCustomer.name}' suspended.`);
      setSuspendingCustomer(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to suspend customer.");
    } finally {
      setIsSubmittingSuspension(false);
    }
  };

  const handleReactivateCustomer = async (customer: any) => {
    try {
      const res = await adminApi.reactivateCustomer(customer.id);
      setCustomers(customers.map((c) => (c.id === customer.id ? { ...c, ...res.customer } : c)));
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer({ ...selectedCustomer, ...res.customer });
      }
      toast.success(res.message || `Customer '${customer.name}' reactivated.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reactivate customer.");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setDeleting(true);

    try {
      await adminApi.deleteCustomer(deletingCustomer.id);
      setCustomers(customers.filter((c) => c.id !== deletingCustomer.id));
      if (selectedCustomer?.id === deletingCustomer.id) {
        setSelectedCustomer(null);
      }
      toast.success(`Customer '${deletingCustomer.name}' deleted.`);
      setDeletingCustomer(null);
    } catch (err: any) {
      toast.error("Failed to delete customer.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Customer Directory & Accounts
          </span>
          <h1 className="text-2xl font-black text-white">Registered Customers ({customers.length})</h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <AdminDropdown
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            className="w-full sm:w-auto"
            options={[
              { value: "all", label: "All Account Statuses" },
              { value: "active", label: "Active Only" },
              { value: "suspended", label: "Suspended Only" },
            ]}
          />

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            title="Reset all customer filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Customers Table with Scrollable Drag Card */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[760px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Phone</th>
              <th className="p-3.5">Lifetime Orders</th>
              <th className="p-3.5">Total Spent</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Joined</th>
              <th className="p-3.5 text-center min-w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Loading customer records...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No customer accounts found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 flex items-center gap-3 font-bold text-white">
                    <img
                      src={c.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                      alt={c.name}
                      className="w-8 h-8 rounded-full object-cover bg-slate-900 shrink-0 border border-white/10"
                    />
                    <div>
                      <span className="text-white font-bold block">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{c.email}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">{c.phone || "—"}</td>
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">{c.orders_count ?? 0} orders</td>
                  <td className="p-3.5 font-extrabold text-cyan-400 whitespace-nowrap">{formatPrice(c.total_spent || 0)}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    {c.status === "active" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    ) : c.suspended_until ? (
                      <div className="flex flex-col">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-help"
                          title={c.suspension_reason ? `Reason: ${c.suspension_reason}` : undefined}
                        >
                          Suspended (Timed)
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                          Until {formatDate(c.suspended_until)}
                        </span>
                      </div>
                    ) : (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 cursor-help"
                        title={c.suspension_reason ? `Reason: ${c.suspension_reason}` : undefined}
                      >
                        Suspended (Indefinite)
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{formatDate(c.created_at)}</td>
                  
                  {/* ICON-ONLY ACTION SYSTEM (UP TO 4 PER ROW) */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-start gap-1.5 flex-wrap w-[146px] mx-auto">
                      <button
                        onClick={() => handleInspectCustomer(c.id)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all shadow-sm"
                        title="View Customer Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenCustomerHistory(c.id)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:scale-105 transition-all shadow-sm"
                        title="View Customer Order & Lifecycle History"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-105 transition-all shadow-sm"
                        title="Edit Customer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      
                      {c.status === "active" ? (
                        <button
                          onClick={() => setSuspendingCustomer(c)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all shadow-sm"
                          title="Suspend Account (Indefinite / Timed)"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivateCustomer(c)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:scale-105 transition-all shadow-sm"
                          title="Reactivate Account to Active"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setDeletingCustomer(c)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all shadow-sm"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollableTableCard>

      {/* Create Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c0e15] border border-amber-500/30 shadow-2xl p-6 sm:p-8 z-10 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Customer Management
                </span>
                <h3 className="text-lg font-black text-white">Create New Customer Account</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <ImageUploadAvatar
                value={avatar}
                onChange={(val) => setAvatar(val)}
                name={`${firstName} ${lastName}`.trim() || "Customer"}
                size="md"
                label="Profile Picture (Optional)"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. David"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Second / Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Hasselhoff"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="david@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Initial Password</label>
                  <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    inputClassName="bg-white/5 border border-white/10 rounded-xl py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Account Status</label>
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

              {/* Optional Primary Address */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Default Shipping Address (Optional)</span>
                <div>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Street Address, Apt / Suite"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State / Region"
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal Code"
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wide transition-all shadow-md"
                >
                  {creating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingCustomer(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0c0e15] border border-amber-500/30 shadow-2xl p-6 sm:p-8 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Edit Customer: {editingCustomer.name}</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <ImageUploadAvatar
                value={editAvatar}
                onChange={(val) => setEditAvatar(val)}
                name={`${editFirstName} ${editLastName}`.trim() || "Customer"}
                size="md"
                label="Customer Profile Picture"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="e.g. David"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Second / Last Name
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="e.g. Hasselhoff"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Account Status</label>
                  <AdminDropdown
                    value={editStatus}
                    onChange={(val) => setEditStatus(val)}
                    className="w-full"
                    buttonClassName="w-full py-2"
                    options={[
                      { value: "active", label: "Active" },
                      { value: "suspended", label: "Suspended" },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Reset Password (Optional)</label>
                  <PasswordInput
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    inputClassName="bg-white/5 border border-white/10 rounded-xl py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !isEditDirty}
                  className={`px-5 py-2 rounded-xl font-black uppercase tracking-wide transition-all shadow-md ${
                    !isEditDirty
                      ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                  title={!isEditDirty ? "No changes made to customer profile" : "Save changes"}
                >
                  {savingEdit ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeletingCustomer(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0e121e] border border-rose-500/30 p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Delete Customer Account</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to delete customer <span className="font-bold text-white">{deletingCustomer.name}</span> ({deletingCustomer.email})? All active tokens and saved addresses will be deleted.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteCustomer}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-600/30"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Inspector Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedCustomer(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-xl rounded-3xl bg-[#0e121e] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCustomer.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                  alt={selectedCustomer.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400/40 shrink-0"
                />
                <div>
                  <h3 className="text-base font-black text-white">{selectedCustomer.name}</h3>
                  <span className="text-[11px] text-slate-400">{selectedCustomer.email}</span>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Lifetime Orders</span>
                <span className="text-xl font-black text-white">{selectedCustomer.orders_count ?? 0}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Total Settled Volume</span>
                <span className="text-xl font-black text-cyan-400">{formatPrice(selectedCustomer.total_spent || 0)}</span>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Saved Delivery Addresses ({selectedCustomer.addresses?.length || 0})
              </span>
              <div className="space-y-2">
                {selectedCustomer.addresses?.map((a: any) => (
                  <div key={a.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                    <span className="font-bold text-white block">{a.full_name} ({a.type})</span>
                    <span>{a.address_line1}, {a.city}, {a.state} {a.postal_code}, {a.country}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Recent Orders
              </span>
              <div className="divide-y divide-white/5 border-y border-white/5 max-h-40 overflow-y-auto">
                {selectedCustomer.orders?.map((ord: any) => (
                  <div key={ord.id} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-cyan-400 block">{ord.order_number}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(ord.created_at)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white block">{formatPrice(ord.total_amount)}</span>
                      <span className="text-[10px] uppercase font-bold text-amber-400">{ord.order_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              {selectedCustomer.status === "active" ? (
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedCustomer;
                    setSelectedCustomer(null);
                    setSuspendingCustomer(c);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30"
                >
                  Suspend Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleReactivateCustomer(selectedCustomer)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30"
                >
                  Re-activate Account
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const c = selectedCustomer;
                  setSelectedCustomer(null);
                  handleOpenEdit(c);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase"
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Comprehensive History & Lifecycle Ledger Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setHistoryCustomer(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0c0e15] border border-indigo-500/30 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6 text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={historyCustomer.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                  alt={historyCustomer.name}
                  className="w-12 h-12 rounded-2xl object-cover bg-slate-900 border border-white/10 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{historyCustomer.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      historyCustomer.status === "active"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    }`}>
                      {historyCustomer.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{historyCustomer.email} • {historyCustomer.phone || "No phone"}</p>
                </div>
              </div>

              <button onClick={() => setHistoryCustomer(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle KPI Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spend</span>
                <span className="text-lg font-black text-cyan-400 block">{formatPrice(historyCustomer.total_spent || 0)}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
                <span className="text-lg font-black text-white block">{historyCustomer.orders?.length || 0}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivered Orders</span>
                <span className="text-lg font-black text-emerald-400 block">
                  {historyCustomer.orders?.filter((o: any) => o.order_status === "delivered").length || 0}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cancelled / Refunded</span>
                <span className="text-lg font-black text-rose-400 block">
                  {historyCustomer.orders?.filter((o: any) => o.order_status === "cancelled" || o.order_status === "refunded").length || 0}
                </span>
              </div>
            </div>

            {/* Chronological Orders & Activity Ledger */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <History className="w-4 h-4" /> Comprehensive Purchase & Order Ledger ({historyCustomer.orders?.length || 0})
                </span>
              </div>

              {(!historyCustomer.orders || historyCustomer.orders.length === 0) ? (
                <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 font-medium">No order transactions recorded for this customer yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyCustomer.orders.map((ord: any) => (
                    <div
                      key={ord.id}
                      className={`p-4 rounded-2xl border space-y-3 transition-all ${
                        ord.order_status === "cancelled"
                          ? "bg-rose-500/[0.03] border-rose-500/20"
                          : ord.order_status === "refunded"
                          ? "bg-purple-500/[0.03] border-purple-500/20"
                          : ord.order_status === "delivered"
                          ? "bg-emerald-500/[0.03] border-emerald-500/20"
                          : "bg-white/[0.02] border-white/10"
                      }`}
                    >
                      {/* Order Item Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-white text-sm">{ord.order_number}</span>
                          <span className="text-[10px] text-slate-400">
                            Placed on {formatDate(ord.created_at)} at {formatTime(ord.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            ord.order_status === "delivered"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : ord.order_status === "shipped"
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                              : ord.order_status === "processing"
                              ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                              : ord.order_status === "cancelled"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : ord.order_status === "refunded"
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              : "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
                          }`}>
                            {ord.order_status}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            ord.payment_status === "paid"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : ord.payment_status === "refunded"
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              : ord.payment_status === "failed"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          }`}>
                            {ord.payment_status}
                          </span>
                        </div>
                      </div>

                      {/* Cancellation Alert Banner */}
                      {ord.order_status === "cancelled" && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span><b>Order Cancelled:</b> This transaction was cancelled and items were restored to warehouse inventory.</span>
                        </div>
                      )}

                      {/* Refund Alert Banner */}
                      {ord.order_status === "refunded" && (
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 shrink-0 text-purple-400" />
                          <span><b>Refund Processed:</b> Funds were returned to the customer.</span>
                        </div>
                      )}

                      {/* Order Items Breakdown */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Purchased Hardware Items ({ord.items?.length || 0})
                        </span>
                        <div className="divide-y divide-white/5 rounded-xl bg-white/[0.01] border border-white/5 p-2 space-y-1">
                          {ord.items?.map((item: any) => (
                            <div key={item.id} className="py-1.5 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {item.product_image && (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="w-9 h-9 rounded-lg object-cover bg-slate-900 border border-white/10 shrink-0"
                                  />
                                )}
                                <div className="truncate">
                                  <span className="font-bold text-white block truncate">{item.product_name}</span>
                                  {item.variant_name && (
                                    <span className="text-[10px] text-slate-400 block">{item.variant_name}</span>
                                  )}
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    Qty: {item.quantity} × {formatPrice(item.unit_price)}
                                  </span>
                                </div>
                              </div>
                              <span className="font-extrabold text-white shrink-0 font-mono">
                                {formatPrice(item.total_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Footer & Amount */}
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">
                          {ord.carrier ? `${ord.carrier} • Tracking: ${ord.tracking_code || "Pending"}` : "Standard Delivery"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Order Total:</span>
                          <span className="text-sm font-black text-cyan-400 font-mono">{formatPrice(ord.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lifecycle Registration Milestone */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Customer Account Created on <b>{formatDate(historyCustomer.created_at)}</b>
              </span>
              <button
                type="button"
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspension Modal */}
      {suspendingCustomer && (
        <SuspensionModal
          isOpen={!!suspendingCustomer}
          onClose={() => setSuspendingCustomer(null)}
          onConfirm={handleConfirmSuspension}
          targetName={suspendingCustomer.name}
          targetEmail={suspendingCustomer.email}
          targetType="customer"
          isSubmitting={isSubmittingSuspension}
        />
      )}
    </div>
  );
}
