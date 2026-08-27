"use client";

import { useEffect, useState } from "react";
import { 
  Truck, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers, 
  History,
  Tag
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Product, Vendor, VendorProduct } from "@/types";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<{ total_vendors: number; active_vendors: number }>({ total_vendors: 0, active_vendors: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorAnalytics, setVendorAnalytics] = useState<any>(null);

  // Link Product Modal
  const [linkProductModal, setLinkProductModal] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [linkForm, setLinkForm] = useState({
    product_id: "",
    purchase_price: "",
    min_order_quantity: 1,
    lead_time_days: 7,
    notes: "",
  });

  // Form State
  const [formData, setFormData] = useState({
    vendor_code: "",
    name: "",
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    tax_number: "",
    payment_terms: "net_30",
    notes: "",
    status: "active" as "active" | "inactive",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchVendors();
  }, [search, statusFilter, page]);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getVendors({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        per_page: 15,
      });
      setVendors(res.vendors.data);
      setTotalPages(res.vendors.last_page);
      setStats(res.stats);
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    const code = "VND-" + Math.floor(1000 + Math.random() * 9000);
    setFormData({
      vendor_code: code,
      name: "",
      company_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      tax_number: "",
      payment_terms: "net_30",
      notes: "",
      status: "active",
    });
    setCreateModal(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      vendor_code: vendor.vendor_code,
      name: vendor.name,
      company_name: vendor.company_name,
      contact_person: vendor.contact_person || "",
      phone: vendor.phone,
      email: vendor.email || "",
      address: vendor.address || "",
      city: vendor.city || "",
      tax_number: vendor.tax_number || "",
      payment_terms: vendor.payment_terms || "net_30",
      notes: vendor.notes || "",
      status: vendor.status,
    });
    setEditModal(true);
  };

  const openViewModal = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewModal(true);
    try {
      const res = await adminApi.getVendor(vendor.id);
      setSelectedVendor(res.vendor);
      setVendorAnalytics(res.analytics);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await adminApi.createVendor(formData);
      showToast("success", res.message);
      setCreateModal(false);
      fetchVendors();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to create vendor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    setIsSubmitting(true);
    try {
      const res = await adminApi.updateVendor(selectedVendor.id, formData);
      showToast("success", res.message);
      setEditModal(false);
      fetchVendors();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to update vendor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    if (!confirm(`Are you sure you want to remove supplier profile '${vendor.company_name}'?`)) return;
    try {
      const res = await adminApi.deleteVendor(vendor.id);
      showToast("success", res.message);
      fetchVendors();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to delete vendor.");
    }
  };

  const openLinkProductModal = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setLinkForm({
      product_id: "",
      purchase_price: "",
      min_order_quantity: 1,
      lead_time_days: 7,
      notes: "",
    });
    setLinkProductModal(true);
    try {
      const pRes = await adminApi.getProducts({ per_page: 100 });
      setAllProducts(pRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !linkForm.product_id) return;
    setIsSubmitting(true);
    try {
      const res = await adminApi.createVendorProduct({
        vendor_id: selectedVendor.id,
        product_id: parseInt(linkForm.product_id),
        purchase_price: parseFloat(linkForm.purchase_price),
        min_order_quantity: linkForm.min_order_quantity,
        lead_time_days: linkForm.lead_time_days,
        notes: linkForm.notes,
      });
      showToast("success", res.message);
      setLinkProductModal(false);
      if (viewModal) {
        openViewModal(selectedVendor);
      }
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to link product pricing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border shadow-lg animate-in fade-in slide-in-from-top-2 ${
          toast.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0f18] p-5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Vendor & Supplier Network</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage procurement suppliers, multi-source purchase price contracts, and supply reliability.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Vendor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d0f18] p-4 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Total Suppliers</span>
            <span className="text-2xl font-black text-white font-mono">{stats.total_vendors}</span>
          </div>
          <Building2 className="w-8 h-8 text-slate-600" />
        </div>
        <div className="bg-[#0d0f18] p-4 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Active Suppliers</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{stats.active_vendors}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
        </div>
        <div className="bg-[#0d0f18] p-4 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Payment Standard</span>
            <span className="text-sm font-bold text-amber-400">NET-30 Terms Active</span>
          </div>
          <FileText className="w-8 h-8 text-amber-500/30" />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0d0f18] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search supplier, code, phone, or email..."
            className="w-full bg-[#151824] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "active", "inactive"].map(st => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                statusFilter === st 
                  ? "bg-amber-400 text-black shadow-md" 
                  : "bg-white/5 text-slate-400 hover:bg-white/10 text-slate-300"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Table */}
      <div className="bg-[#0d0f18] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151824] text-slate-400 border-b border-white/10 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Supplier Code & Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Terms</th>
                <th className="py-3.5 px-4">Supplied Products</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading supplier matrix...
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No vendor profiles found matching criteria.
                  </td>
                </tr>
              ) : (
                vendors.map(v => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-white block">{v.company_name}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{v.vendor_code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{v.phone}</span>
                        </div>
                        {v.email && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{v.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span>{v.city || "Primary Warehouse"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        {v.payment_terms.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                      {v.vendor_products_count || 0} catalog items
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openLinkProductModal(v)}
                          title="Link Product Price"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 transition"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openViewModal(v)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(v)}
                          title="Edit Vendor"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          title="Delete Vendor"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#151824] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Create / Edit Vendor */}
      {(createModal || editModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <Truck className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  {createModal ? "Create New Supplier Profile" : "Edit Supplier Profile"}
                </h3>
              </div>
              <button onClick={() => { setCreateModal(false); setEditModal(false); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createModal ? handleCreate : handleUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={e => setFormData({ ...formData, company_name: e.target.value, name: e.target.value })}
                    placeholder="e.g. Asus Global Distribution"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Supplier Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.vendor_code}
                    onChange={e => setFormData({ ...formData, vendor_code: e.target.value })}
                    placeholder="e.g. VND-001"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Account Manager / Contact</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. David Vance"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 800 555 0199"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="orders@supplier.com"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Tax / VAT Registration</label>
                  <input
                    type="text"
                    value={formData.tax_number}
                    onChange={e => setFormData({ ...formData, tax_number: e.target.value })}
                    placeholder="e.g. US-TAX-998811"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Payment Terms</label>
                  <select
                    value={formData.payment_terms}
                    onChange={e => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="net_15">Net 15 Days</option>
                    <option value="net_30">Net 30 Days</option>
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="due_on_receipt">Due on Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="active">Active Vendor</option>
                    <option value="inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Warehouse Address & City</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Facility street address, city, state, zip..."
                  className="w-full bg-[#151824] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCreateModal(false); setEditModal(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-lg shadow-amber-400/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : createModal ? "Create Vendor" : "Update Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Link Product & Set Purchase Price */}
      {linkProductModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <Tag className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Set Supplier Product Price</h3>
              </div>
              <button onClick={() => setLinkProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Define contractual purchase cost with supplier <span className="text-amber-400 font-bold">{selectedVendor.company_name}</span>.
            </p>

            <form onSubmit={handleLinkProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Select Catalog Product *</label>
                <select
                  required
                  value={linkForm.product_id}
                  onChange={e => setLinkForm({ ...linkForm, product_id: e.target.value })}
                  className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Choose Product --</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - Retail: ${p.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Purchase Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={linkForm.purchase_price}
                    onChange={e => setLinkForm({ ...linkForm, purchase_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={linkForm.lead_time_days}
                    onChange={e => setLinkForm({ ...linkForm, lead_time_days: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkProductModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-lg shadow-amber-400/20"
                >
                  {isSubmitting ? "Linking..." : "Save Supplier Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Vendor Profile, Products & Price History */}
      {viewModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <Building2 className="w-5 h-5" />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedVendor.company_name}</h3>
                  <span className="text-[10px] font-mono text-amber-400">{selectedVendor.vendor_code}</span>
                </div>
              </div>
              <button onClick={() => setViewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analytics Stats */}
            {vendorAnalytics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#151824] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Procurement Spend</span>
                  <span className="text-amber-400 font-bold font-mono text-sm">
                    ${vendorAnalytics.total_purchases_amount?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="bg-[#151824] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total POs Fulfilled</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    {vendorAnalytics.received_pos_count} / {vendorAnalytics.total_pos_count}
                  </span>
                </div>
                <div className="bg-[#151824] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplied Products</span>
                  <span className="text-white font-bold font-mono text-sm">
                    {vendorAnalytics.products_supplied_count} items
                  </span>
                </div>
              </div>
            )}

            {/* Supplier Products List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Contracted Products & Unit Costs
                </h4>
                <button
                  onClick={() => openLinkProductModal(selectedVendor)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold"
                >
                  + Add Product Price
                </button>
              </div>

              <div className="bg-[#151824] rounded-xl border border-white/10 divide-y divide-white/5">
                {(!selectedVendor.vendor_products || selectedVendor.vendor_products.length === 0) ? (
                  <div className="p-6 text-center text-slate-500">
                    No products contracted with this vendor yet.
                  </div>
                ) : (
                  selectedVendor.vendor_products.map(vp => (
                    <div key={vp.id} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-white block">{vp.product?.name}</span>
                        <span className="text-[10px] text-slate-400">SKU: {vp.product?.sku} | Lead Time: {vp.lead_time_days} days</span>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-bold font-mono text-xs block">
                          ${vp.purchase_price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500">Min Order: {vp.min_order_quantity}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Price History Log */}
            {selectedVendor.price_histories && selectedVendor.price_histories.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  Historical Price Changes
                </h4>
                <div className="bg-[#151824] rounded-xl border border-white/10 divide-y divide-white/5 max-h-40 overflow-y-auto">
                  {selectedVendor.price_histories.map(ph => (
                    <div key={ph.id} className="p-2.5 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-300">{ph.product?.name}</span>
                        <span className="text-[10px] text-slate-500 block">{ph.notes}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-amber-400 font-bold">${ph.price.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500 block">{ph.effective_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
