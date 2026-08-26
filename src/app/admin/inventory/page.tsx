"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpDown, 
  Edit3, 
  Eye,
  X,
  Package,
  Layers,
  Sparkles,
  ScrollText,
  Plus,
  Minus,
  PlusCircle,
  MinusCircle,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Product, Category } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { AdminDropdown } from "@/components/admin/AdminDropdown";
import { toast } from "sonner";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<any>({
    total_skus: 0,
    total_units: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("urgent_restock");

  // View Modal State
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Stock Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustMode, setAdjustMode] = useState<"add" | "reduce">("add");
  const [addQty, setAddQty] = useState<string>("10");
  const [addReason, setAddReason] = useState<string>("Supplier Restock Batch");
  const [reduceQty, setReduceQty] = useState<string>("1");
  const [reduceReason, setReduceReason] = useState<string>("Damaged in Warehouse");
  const [saving, setSaving] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [res, cats] = await Promise.all([
        adminApi.getInventory({
          search: search.trim() || undefined,
        }),
        adminApi.getCategories().catch(() => []),
      ]);
      setInventory(res.inventory.data || []);
      setSummary(res.summary || {});
      setCategories(cats || []);
    } catch (err) {
      toast.error("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryId("");
    setStockLevelFilter("all");
    setSortBy("urgent_restock");
    adminApi.getInventory({}).then((res) => {
      setInventory(res.inventory.data || []);
      setSummary(res.summary || {});
    });
    toast.success("Inventory filters reset to default.");
  };

  const handleOpenAdjust = (p: Product) => {
    setAdjustingProduct(p);
    setAdjustMode("add");
    setAddQty("10");
    setAddReason("Supplier Restock Batch");
    setReduceQty("1");
    setReduceReason("Damaged in Warehouse");
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    let adjustmentDelta = 0;
    let memo = "";

    if (adjustMode === "add") {
      const qty = Number(addQty);
      if (isNaN(qty) || qty <= 0) {
        toast.error("Please enter a valid positive quantity to add.");
        return;
      }
      adjustmentDelta = qty;
      memo = addReason.trim() || "Manual Stock Addition";
    } else {
      const qty = Number(reduceQty);
      if (isNaN(qty) || qty <= 0) {
        toast.error("Please enter a valid positive quantity to reduce.");
        return;
      }
      if (qty > adjustingProduct.stock_quantity) {
        toast.error(`Cannot reduce ${qty} units. Current stock is only ${adjustingProduct.stock_quantity} units.`);
        return;
      }
      adjustmentDelta = -qty;
      memo = reduceReason.trim() || "Manual Stock Reduction";
    }

    setSaving(true);

    try {
      const res = await adminApi.adjustStock(adjustingProduct.id, {
        adjustment: adjustmentDelta,
        reason: memo,
      });

      setInventory(inventory.map((p) => (p.id === adjustingProduct.id ? res.product : p)));
      toast.success(res.message);
      setAdjustingProduct(null);
      loadInventory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to adjust inventory.");
    } finally {
      setSaving(false);
    }
  };

  // Live Calculations for modal
  const currentStock = adjustingProduct?.stock_quantity ?? 0;
  const parsedAdd = Number(addQty) || 0;
  const parsedReduce = Number(reduceQty) || 0;
  const targetStock = adjustMode === "add" 
    ? currentStock + parsedAdd 
    : Math.max(0, currentStock - parsedReduce);
  const isOverReducing = adjustMode === "reduce" && parsedReduce > currentStock;

  const displayedInventory = inventory
    .filter((p) => {
      if (categoryId && p.category_id?.toString() !== categoryId) return false;
      if (stockLevelFilter === "in_stock" && p.stock_quantity <= 10) return false;
      if (stockLevelFilter === "low_stock" && (p.stock_quantity <= 0 || p.stock_quantity > 10)) return false;
      if (stockLevelFilter === "out_of_stock" && p.stock_quantity > 0) return false;
      if (stockLevelFilter === "overstocked" && p.stock_quantity < 50) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "urgent_restock") return a.stock_quantity - b.stock_quantity;
      if (sortBy === "stock_desc") return b.stock_quantity - a.stock_quantity;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "price_desc") return Number(b.price) - Number(a.price);
      if (sortBy === "sku_asc") return (a.sku || "").localeCompare(b.sku || "");
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Stock Telemetry & Auditing
          </span>
          <h1 className="text-2xl font-black text-white">Warehouse Inventory Levels ({displayedInventory.length})</h1>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Total Active SKUs</span>
          <span className="text-2xl font-black text-white block">{summary.total_skus}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Total Units In Warehouse</span>
          <span className="text-2xl font-black text-cyan-400 block">{summary.total_units}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Low Stock Warnings (≤10)</span>
          <span className="text-2xl font-black text-amber-400 block">{summary.low_stock_count}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Out of Stock Depletions</span>
          <span className="text-2xl font-black text-rose-400 block">{summary.out_of_stock_count}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or product title..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
          <AdminDropdown
            value={categoryId}
            onChange={(val) => setCategoryId(val)}
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
            ]}
          />

          <AdminDropdown
            value={stockLevelFilter}
            onChange={(val) => setStockLevelFilter(val)}
            options={[
              { value: "all", label: "All Stock Levels" },
              { value: "in_stock", label: "Optimal Stock (>10)" },
              { value: "low_stock", label: "Low Stock Alert (1-10)" },
              { value: "out_of_stock", label: "Depleted (0)" },
              { value: "overstocked", label: "Overstocked (≥50)" },
            ]}
          />

          <AdminDropdown
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: "urgent_restock", label: "Urgent Restock (Lowest First)" },
              { value: "stock_desc", label: "Highest Stock First" },
              { value: "name_asc", label: "Product Title (A-Z)" },
              { value: "sku_asc", label: "SKU Code" },
              { value: "price_desc", label: "Highest Unit Price" },
            ]}
          />

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            title="Reset all filters and search"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Inventory Table with Scrollable Dragging Card */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[860px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Product</th>
              <th className="p-3.5">SKU</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Unit Price</th>
              <th className="p-3.5">Stock Level</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center min-w-[160px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Auditing live warehouse inventory...
                </td>
              </tr>
            ) : displayedInventory.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No inventory records match the filter criteria.
                </td>
              </tr>
            ) : (
              displayedInventory.map((p) => {
                const img = p.primary_image?.image_url || p.images?.[0]?.image_url;
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 flex items-center gap-3 font-bold text-white">
                      {img && (
                        <img
                          src={img}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0"
                        />
                      )}
                      <span className="truncate max-w-xs">{p.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400 text-[11px] whitespace-nowrap">{p.sku}</td>
                    <td className="p-3.5 text-slate-300 whitespace-nowrap">{p.category?.name || "Acoustics"}</td>
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="p-3.5 font-black text-sm text-white whitespace-nowrap">
                      {p.stock_quantity} <span className="text-slate-500 text-[10px] font-normal">units</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.stock_quantity > 10
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : p.stock_quantity > 0
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      }`}>
                        {p.stock_quantity > 10 ? "Optimal Stock" : p.stock_quantity > 0 ? "Low Stock Alert" : "Depleted"}
                      </span>
                    </td>

                    {/* ICON-ONLY ACTION SYSTEM (UP TO 4 PER ROW) */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-start gap-1.5 flex-wrap w-[146px] mx-auto">
                        <button
                          onClick={() => setViewingProduct(p)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all shadow-sm"
                          title="View Stock Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-105 transition-all shadow-sm"
                          title="Adjust Units"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/admin/audit-logs?search=${p.sku}`}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:scale-105 transition-all shadow-sm"
                          title="View SKU Audit Logs"
                        >
                          <ScrollText className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollableTableCard>

      {/* Product Stock View Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setViewingProduct(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e121e] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                  SKU Telemetry
                </span>
                <h3 className="text-base font-black text-white">{viewingProduct.name}</h3>
              </div>
              <button onClick={() => setViewingProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">SKU Identifier</span>
                <p className="text-white font-mono font-bold text-sm">{viewingProduct.sku}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Unit Price</span>
                <p className="text-cyan-400 font-black text-sm">{formatPrice(viewingProduct.price)}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Warehouse Stock Level</span>
                <span className="text-xl font-black text-white">{viewingProduct.stock_quantity} units</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                viewingProduct.stock_quantity > 10
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : viewingProduct.stock_quantity > 0
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
              }`}>
                {viewingProduct.stock_quantity > 10 ? "Optimal Stock" : viewingProduct.stock_quantity > 0 ? "Low Stock" : "Depleted"}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const prod = viewingProduct;
                  setViewingProduct(null);
                  handleOpenAdjust(prod);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <ArrowUpDown className="w-3.5 h-3.5" /> Adjust Units
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal with Dedicated Add & Reduce Sections */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setAdjustingProduct(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c0e15] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 space-y-5 text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Inventory Management
                </span>
                <h3 className="text-base font-black text-white">{adjustingProduct.name}</h3>
                <span className="text-[11px] font-mono text-cyan-400">SKU: {adjustingProduct.sku}</span>
              </div>
              <button onClick={() => setAdjustingProduct(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Stock vs New Calculated Total Telemetry Card */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current In Stock</span>
                <span className="text-xl font-black text-white">{currentStock} units</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Resulting Stock</span>
                <span className={`text-xl font-black flex items-center justify-end gap-1 ${
                  adjustMode === "add" 
                    ? "text-emerald-400" 
                    : targetStock === 0 
                    ? "text-rose-400" 
                    : "text-amber-400"
                }`}>
                  {adjustMode === "add" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {targetStock} units
                </span>
              </div>
            </div>

            {/* TWO DEDICATED SECTIONS / TABS: ADD PRODUCT vs REDUCE PRODUCT */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setAdjustMode("add")}
                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                  adjustMode === "add"
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <PlusCircle className="w-4 h-4" /> Add Product (Restock)
              </button>

              <button
                type="button"
                onClick={() => setAdjustMode("reduce")}
                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                  adjustMode === "reduce"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MinusCircle className="w-4 h-4" /> Reduce Product
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              {/* SECTION 1: ADD PRODUCT (RESTOCK) */}
              {adjustMode === "add" && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Units To Add
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold">
                      +{parsedAdd} units
                    </span>
                  </div>

                  {/* Quantity Input */}
                  <input
                    type="number"
                    min="1"
                    required
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    placeholder="Enter units to add..."
                    className="w-full bg-[#0e121e] border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-400 text-base font-black"
                  />

                  {/* Quick Preset Pills for Adding */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Quick Add Presets</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[5, 10, 25, 50, 100].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAddQty(num.toString())}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                            addQty === num.toString()
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black"
                              : "bg-white/5 hover:bg-white/10 text-emerald-300 border-emerald-500/20"
                          }`}
                        >
                          +{num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason / Tracking Memo */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">
                      Restock Reason / Tracking Memo
                    </label>
                    <input
                      type="text"
                      required
                      value={addReason}
                      onChange={(e) => setAddReason(e.target.value)}
                      placeholder="e.g. Supplier Restock Batch #4092"
                      className="w-full bg-[#0e121e] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-xs"
                    />

                    {/* Quick Reason Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["Supplier Restock Batch", "Warehouse Recount", "Customer Return Restock"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setAddReason(r)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-300 transition-colors"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: REDUCE PRODUCT (DEDUCT / WRITE-OFF) */}
              {adjustMode === "reduce" && (
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Minus className="w-3.5 h-3.5" /> Units To Deduct
                    </span>
                    <span className="text-[10px] text-rose-300 font-bold">
                      -{parsedReduce} units
                    </span>
                  </div>

                  {/* Quantity Input */}
                  <input
                    type="number"
                    min="1"
                    max={currentStock}
                    required
                    value={reduceQty}
                    onChange={(e) => setReduceQty(e.target.value)}
                    placeholder={`Enter units to reduce (max ${currentStock})...`}
                    className="w-full bg-[#0e121e] border border-rose-500/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-400 text-base font-black"
                  />

                  {/* Warning if trying to over-reduce */}
                  {isOverReducing && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-[11px]">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Cannot reduce more than current stock ({currentStock} units).</span>
                    </div>
                  )}

                  {/* Quick Preset Pills for Reducing */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Quick Reduce Presets</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 5, 10, 25].filter(n => n <= currentStock).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReduceQty(num.toString())}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                            reduceQty === num.toString()
                              ? "bg-rose-500 text-white border-rose-400 font-black"
                              : "bg-white/5 hover:bg-white/10 text-rose-300 border-rose-500/20"
                          }`}
                        >
                          -{num}
                        </button>
                      ))}
                      {currentStock > 0 && (
                        <button
                          type="button"
                          onClick={() => setReduceQty(currentStock.toString())}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
                        >
                          Deplete All ({currentStock})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reason / Tracking Memo */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">
                      Depletion Reason / Tracking Memo
                    </label>
                    <input
                      type="text"
                      required
                      value={reduceReason}
                      onChange={(e) => setReduceReason(e.target.value)}
                      placeholder="e.g. Damaged in Warehouse / Write-off"
                      className="w-full bg-[#0e121e] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400 text-xs"
                    />

                    {/* Quick Reason Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["Damaged in Warehouse", "Defective / Return Write-off", "Stock Discrepancy", "Internal QA Testing"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setReduceReason(r)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-300 transition-colors"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || isOverReducing || (adjustMode === "add" ? parsedAdd <= 0 : parsedReduce <= 0)}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    adjustMode === "add"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                      : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                  }`}
                >
                  {saving ? (
                    "Recording Changes..."
                  ) : adjustMode === "add" ? (
                    `Apply Stock Addition (+${parsedAdd})`
                  ) : (
                    `Apply Stock Reduction (-${parsedReduce})`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
