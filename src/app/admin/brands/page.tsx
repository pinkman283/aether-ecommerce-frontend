"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Plus, 
  Search,
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Sparkles,
  Check,
  X,
  RotateCcw,
  ExternalLink,
  Globe,
  Boxes,
  Star,
  Award,
  Loader2
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Brand } from "@/types";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  // View Brand Modal State
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [website, setWebsite] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isFeatured, setIsFeatured] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBrands();
      setBrands(data || []);
    } catch (err) {
      toast.error("Failed to load brands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setName("");
    setDescription("");
    setLogo("");
    setWebsite("");
    setDisplayOrder("0");
    setIsFeatured(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setDescription(b.description || "");
    setLogo(b.logo || "");
    setWebsite(b.website || "");
    setDisplayOrder((b.display_order ?? 0).toString());
    setIsFeatured(b.is_featured ?? false);
    setIsModalOpen(true);
  };

  const handleInspectBrand = async (b: Brand) => {
    setViewingBrand(b);
    try {
      const fullBrand = await adminApi.getBrand(b.id);
      setViewingBrand(fullBrand);
    } catch (err) {
      // Fallback to existing data
    }
  };

  const isEditDirty = Boolean(
    editingBrand && (
      name.trim() !== (editingBrand.name || "").trim() ||
      description.trim() !== (editingBrand.description || "").trim() ||
      logo.trim() !== (editingBrand.logo || "").trim() ||
      website.trim() !== (editingBrand.website || "").trim() ||
      displayOrder !== (editingBrand.display_order ?? 0).toString() ||
      isFeatured !== (editingBrand.is_featured ?? false)
    )
  );

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required.");
      return;
    }

    if (editingBrand && !isEditDirty) {
      toast.info("No changes were made.");
      return;
    }
    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      logo: logo.trim() || null,
      website: website.trim() || null,
      display_order: Number(displayOrder) || 0,
      is_featured: isFeatured,
    };

    try {
      if (editingBrand) {
        const res = await adminApi.updateBrand(editingBrand.id, payload);
        setBrands(brands.map((b) => (b.id === editingBrand.id ? res.brand : b)));
        toast.success(`Brand '${res.brand.name}' updated.`);
      } else {
        const res = await adminApi.createBrand(payload);
        setBrands([...brands, res.brand]);
        toast.success(`Brand '${res.brand.name}' created.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save brand.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!deletingBrand) return;
    setDeleting(true);

    try {
      await adminApi.deleteBrand(deletingBrand.id);
      setBrands(brands.filter((b) => b.id !== deletingBrand.id));
      setSelectedIds(selectedIds.filter((id) => id !== deletingBrand.id));
      toast.success(`Brand '${deletingBrand.name}' deleted.`);
      setDeletingBrand(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete brand.");
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === displayedBrands.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedBrands.map((b) => b.id));
    }
  };

  const handleToggleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);

    try {
      const res = await adminApi.bulkDeleteBrands(selectedIds);
      toast.success(res.message);
      setSelectedIds([]);
      loadBrands();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to bulk delete brands.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Filtered list
  const displayedBrands = brands.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.website && b.website.toLowerCase().includes(search.toLowerCase())) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));

    const matchesFeatured =
      featuredFilter === "all" ||
      (featuredFilter === "featured" && b.is_featured) ||
      (featuredFilter === "standard" && !b.is_featured);

    return matchesSearch && matchesFeatured;
  });

  const totalProductsLinked = brands.reduce((acc, b) => acc + (b.products_count || 0), 0);
  const featuredBrandsCount = brands.filter((b) => b.is_featured).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              Hardware Manufacturers
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white mt-1">Brand Management</h1>
          <p className="text-xs text-slate-400">
            Configure manufacturer profiles, logos, URLs, and hardware assignments.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Brand</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Total Brands</span>
            <span className="text-lg font-black text-white">{brands.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Featured Brands</span>
            <span className="text-lg font-black text-amber-300">{featuredBrandsCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Hardware Catalog Linked</span>
            <span className="text-lg font-black text-emerald-300">{totalProductsLinked} units</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brands or websites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all" className="bg-[#0c0e15] text-white">All Tiers</option>
            <option value="featured" className="bg-[#0c0e15] text-white">Featured Only</option>
            <option value="standard" className="bg-[#0c0e15] text-white">Standard Only</option>
          </select>

          {(search || featuredFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setFeaturedFilter("all");
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Brands Table */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={displayedBrands.length > 0 && selectedIds.length === displayedBrands.length}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer accent-cyan-500"
                  title="Select all brands"
                />
              </th>
              <th className="p-3.5">Brand / Manufacturer</th>
              <th className="p-3.5">Website</th>
              <th className="p-3.5">Hardware Products</th>
              <th className="p-3.5">Tier</th>
              <th className="p-3.5">Order</th>
              <th className="p-3.5 text-center min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Loading manufacturer brands...</span>
                  </div>
                </td>
              </tr>
            ) : displayedBrands.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No brands match the current filter.
                </td>
              </tr>
            ) : (
              displayedBrands.map((b) => {
                const isSelected = selectedIds.includes(b.id);
                return (
                  <tr
                    key={b.id}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-cyan-500/10 border-l-2 border-cyan-500"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(b.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer accent-cyan-500"
                      />
                    </td>
                    <td className="p-3.5 flex items-center gap-3 font-bold text-white">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0 font-black text-xs overflow-hidden">
                        {b.logo ? (
                          <img src={b.logo} alt={b.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span>{b.name.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="truncate block text-white font-bold">{b.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">slug: {b.slug}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {b.website ? (
                        <a
                          href={b.website.startsWith("http") ? b.website : `https://${b.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px] truncate max-w-[180px]"
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          <span className="truncate">{b.website.replace(/^https?:\/\//, "")}</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Not configured</span>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        (b.products_count ?? 0) > 0
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {b.products_count ?? 0} products
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {b.is_featured ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Standard</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-slate-400 text-xs">
                      {b.display_order ?? 0}
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleInspectBrand(b)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all cursor-pointer shadow-sm"
                          title="Inspect Brand Telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-105 transition-all cursor-pointer shadow-sm"
                          title="Edit Brand"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingBrand(b)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all cursor-pointer shadow-sm"
                          title="Delete Brand"
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

      {/* View Brand Slide-Over Drawer */}
      <Sheet open={!!viewingBrand} onOpenChange={(open) => { if (!open) setViewingBrand(null); }}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:w-[480px] md:w-[520px] sm:!max-w-[520px] max-w-full bg-[#0b0e17] border-l border-white/[0.08] p-0 flex flex-col justify-between shadow-2xl text-slate-100 overflow-hidden"
        >
          {viewingBrand && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Compact Header: h-12 */}
              <div className="h-12 px-6 border-b border-white/[0.06] bg-[#0b0e17] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-3">
                  <SheetTitle className="text-xs font-semibold text-white tracking-wide shrink-0">
                    Brand Profile
                  </SheetTitle>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded shrink-0">
                    #{viewingBrand.id}
                  </span>
                  <span className="text-slate-600 text-xs shrink-0">·</span>
                  <span className="text-xs text-slate-400 truncate max-w-[200px]">
                    {viewingBrand.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingBrand(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0 overflow-hidden">
                    {viewingBrand.logo ? (
                      <img src={viewingBrand.logo} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span>{viewingBrand.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{viewingBrand.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{viewingBrand.slug}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Catalog Items</span>
                    <p className="text-sm font-bold text-cyan-400">{viewingBrand.products_count ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tier</span>
                    <p className="text-sm font-bold text-amber-400">
                      {viewingBrand.is_featured ? "Featured" : "Standard"}
                    </p>
                  </div>
                </div>

                {viewingBrand.website && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Website</span>
                    <a
                      href={viewingBrand.website.startsWith("http") ? viewingBrand.website : `https://${viewingBrand.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{viewingBrand.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {viewingBrand.description && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Description</span>
                    <p className="text-slate-300 leading-relaxed text-xs">{viewingBrand.description}</p>
                  </div>
                )}

                {viewingBrand.products && viewingBrand.products.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Associated Products
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {viewingBrand.products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-slate-200"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {p.primary_image?.image_url && (
                              <img src={p.primary_image.image_url} alt="" className="w-7 h-7 rounded-md object-cover bg-slate-900 border border-white/10" />
                            )}
                            <span className="font-medium truncate text-xs">{p.name}</span>
                          </div>
                          <span className="text-cyan-400 font-bold shrink-0 font-mono text-xs">${Number(p.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Footer: h-12 */}
              <div className="h-12 px-6 border-t border-white/[0.06] bg-[#0b0e17] flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const b = viewingBrand;
                    setViewingBrand(null);
                    handleOpenEdit(b);
                  }}
                  className="h-8 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Brand</span>
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create / Edit Brand Slide-over Drawer */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:w-[520px] md:w-[560px] sm:!max-w-[560px] max-w-full bg-[#0b0e17] border-l border-white/[0.08] p-0 flex flex-col justify-between shadow-2xl text-slate-100 overflow-hidden"
        >
          <form onSubmit={handleSaveBrand} className="flex flex-col h-full overflow-hidden">
            {/* Compact Header: h-12 */}
            <div className="h-12 px-6 border-b border-white/[0.06] bg-[#0b0e17] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <SheetTitle className="text-xs font-semibold text-white tracking-wide shrink-0">
                  {editingBrand ? "Edit Brand" : "New Brand"}
                </SheetTitle>
                {editingBrand && (
                  <>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded shrink-0">
                      #{editingBrand.id}
                    </span>
                    <span className="text-slate-600 text-xs shrink-0">·</span>
                    <span className="text-xs text-slate-400 truncate max-w-[220px]">
                      {editingBrand.name}
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable un-boxed form canvas */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Brand Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sennheiser, Focal, AETHER Studio"
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Website URL (Optional)</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://manufacturer.com"
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Logo URL (Optional)</label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brand acoustic philosophy, background, and origin..."
                  className="w-full rounded-lg border border-white/10 bg-[#131722] p-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded bg-white/5 border-white/20 text-cyan-400 accent-cyan-400 w-4 h-4 cursor-pointer"
                    />
                    <span>Featured Tier</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Compact Footer: h-12 */}
            <div className="h-12 px-6 border-t border-white/[0.06] bg-[#0b0e17] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-medium text-slate-400 hover:text-white transition px-1 py-1 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || (editingBrand ? !isEditDirty : false)}
                className={`h-8 px-4 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm ${
                  editingBrand && !isEditDirty
                    ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
                    : "bg-cyan-400 hover:bg-cyan-300 text-slate-950"
                }`}
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{saving ? "Saving..." : editingBrand ? "Save Changes" : "Create Brand"}</span>
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      {deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeletingBrand(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0e121e] border border-rose-500/30 p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-black text-white">Delete Brand Confirmation</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingBrand(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">{deletingBrand.name}</span>?
            </p>

            {(deletingBrand.products_count ?? 0) > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                ⚠️ Warning: There are <strong>{deletingBrand.products_count} hardware products</strong> assigned to this brand. You must reassign or remove them before deleting this brand.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBrand(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting || (deletingBrand.products_count ?? 0) > 0}
                onClick={handleDeleteBrand}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-lg cursor-pointer ${
                  (deletingBrand.products_count ?? 0) > 0
                    ? "bg-slate-700 opacity-50 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                }`}
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
        totalCount={displayedBrands.length}
        itemName="brand"
        isDeleting={isBulkDeleting}
        onClearSelection={() => setSelectedIds([])}
        onSelectAll={handleToggleSelectAll}
        onConfirmDelete={handleBulkDelete}
      />
    </div>
  );
}
