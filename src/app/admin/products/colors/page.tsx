"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Palette, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  Copy, 
  Filter, 
  Loader2, 
  X,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Color } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminStatusBadge, AdminEmptyState } from "@/components/admin/ui";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const QUICK_PRESETS = [
  { name: "Obsidian", hex: "#0F172A" },
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Slate Grey", hex: "#64748B" },
  { name: "Crimson Red", hex: "#EF4444" },
  { name: "Royal Blue", hex: "#1D4ED8" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Cyber Cyan", hex: "#06B6D4" },
  { name: "Sunset Orange", hex: "#F97316" },
  { name: "Gold / Sand", hex: "#E0A96D" },
  { name: "Deep Violet", hex: "#8B5CF6" },
];

export default function AdminColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formName, setFormName] = useState("");
  const [formHex, setFormHex] = useState("#3B82F6");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [saving, setSaving] = useState(false);

  // Delete Confirmation State
  const [deletingColor, setDeletingColor] = useState<Color | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchColors = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getColors();
      setColors(data || []);
    } catch (err) {
      toast.error("Failed to load color swatches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleOpenCreate = () => {
    setEditingColor(null);
    setFormName("");
    setFormHex("#3B82F6");
    setFormStatus("active");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (color: Color) => {
    setEditingColor(color);
    setFormName(color.name);
    setFormHex(color.hex_code);
    setFormStatus(color.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Color name is required.");
      return;
    }
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(formHex)) {
      toast.error("Please enter a valid HEX color code (e.g. #0F172A).");
      return;
    }

    setSaving(true);
    try {
      if (editingColor) {
        await adminApi.updateColor(editingColor.id, {
          name: formName.trim(),
          hex_code: formHex.toUpperCase(),
          status: formStatus,
        });
        toast.success(`Color swatch "${formName}" updated successfully.`);
      } else {
        await adminApi.createColor({
          name: formName.trim(),
          hex_code: formHex.toUpperCase(),
          status: formStatus,
        });
        toast.success(`Color swatch "${formName}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchColors();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save color swatch.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (color: Color) => {
    try {
      await adminApi.toggleColorStatus(color.id);
      setColors((prev) =>
        prev.map((c) =>
          c.id === color.id
            ? { ...c, status: c.status === "active" ? "inactive" : "active" }
            : c
        )
      );
      toast.success(`Color "${color.name}" status updated.`);
    } catch (err) {
      toast.error("Failed to toggle status.");
    }
  };

  const handleDelete = async () => {
    if (!deletingColor) return;
    setDeleting(true);
    try {
      await adminApi.deleteColor(deletingColor.id);
      toast.success(`Color "${deletingColor.name}" removed.`);
      setDeletingColor(null);
      fetchColors();
    } catch (err) {
      toast.error("Failed to delete color swatch.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    toast.success(`Copied ${hex} to clipboard!`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const filteredColors = useMemo(() => {
    return colors.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.hex_code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [colors, search, statusFilter]);

  const activeCount = colors.filter((c) => c.status === "active").length;
  const inactiveCount = colors.filter((c) => c.status === "inactive").length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Color Swatches"
        description="Standardized color palette library for product variants, inventory attributes, and storefront facet filtering."
        badge="Catalog"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Color Swatches" },
        ]}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Color</span>
          </button>
        }
      />

      {/* Stats Strip */}
      <AdminStatStrip
        columns={4}
        stats={[
          {
            label: "Total Swatches",
            value: colors.length,
            icon: Palette,
            variant: "cyan",
            helper: "In global color catalog",
          },
          {
            label: "Active Swatches",
            value: activeCount,
            icon: Check,
            variant: "emerald",
            helper: "Visible on variant picker",
          },
          {
            label: "Inactive Swatches",
            value: inactiveCount,
            icon: AlertTriangle,
            variant: "amber",
            helper: "Hidden from storefront",
          },
          {
            label: "Filtered Count",
            value: filteredColors.length,
            icon: Filter,
            variant: "default",
            helper: "Matching current search/filters",
          },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0f121b] border border-white/[0.08]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or #HEX..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-[#161a26] border border-white/[0.08] px-2.5 py-1.5 rounded-lg text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#161a26] text-white">All Statuses</option>
              <option value="active" className="bg-[#161a26] text-white">Active Only</option>
              <option value="inactive" className="bg-[#161a26] text-white">Inactive Only</option>
            </select>
          </div>

          <button
            onClick={fetchColors}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-[#161a26] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
            title="Refresh Swatches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Swatch Grid Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">Loading swatches...</span>
        </div>
      ) : filteredColors.length === 0 ? (
        <AdminEmptyState
          title="No Color Swatches Found"
          description={
            search || statusFilter !== "all"
              ? "No swatches matched your search criteria. Try clearing filters."
              : "Start by creating your first standardized product color swatch."
          }
          action={
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              + Create Color Swatch
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {filteredColors.map((c) => (
            <div
              key={c.id}
              className="group p-4 rounded-xl bg-[#0f121b] border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-md"
            >
              {/* Header preview & active badge */}
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-white/20 shadow-inner flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: c.hex_code }}
                  >
                    {/* Ring highlight for light colors */}
                    <div className="w-full h-full rounded-full border border-black/10" />
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(c)}
                  className="cursor-pointer"
                  title="Click to toggle status"
                >
                  <AdminStatusBadge
                    status={c.status}
                    label={c.status === "active" ? "Active" : "Inactive"}
                    size="sm"
                  />
                </button>
              </div>

              {/* Title & Hex */}
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-amber-400 transition-colors">
                  {c.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-mono text-xs text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                    {c.hex_code}
                  </span>
                  <button
                    onClick={() => handleCopyHex(c.hex_code)}
                    className="p-1 text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
                    title="Copy HEX Code"
                  >
                    {copiedHex === c.hex_code ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] text-slate-500">ID #{c.id}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors cursor-pointer"
                    title="Edit Swatch"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingColor(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                    title="Delete Swatch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Color Swatch Slide-over Drawer */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:w-[480px] md:w-[520px] sm:!max-w-[520px] max-w-full bg-[#0b0e17] border-l border-white/[0.08] p-0 flex flex-col justify-between shadow-2xl text-slate-100 overflow-hidden"
        >
          <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
            {/* Compact Header: h-12 */}
            <div className="h-12 px-6 border-b border-white/[0.06] bg-[#0b0e17] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <SheetTitle className="text-xs font-semibold text-white tracking-wide shrink-0">
                  {editingColor ? "Edit Color Swatch" : "New Color Swatch"}
                </SheetTitle>
                {formHex && (
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-xs"
                    style={{ backgroundColor: formHex }}
                  />
                )}
                {editingColor && (
                  <>
                    <span className="text-slate-600 text-xs shrink-0">·</span>
                    <span className="text-xs text-slate-400 truncate max-w-[180px]">
                      {editingColor.name}
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

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              {/* Color Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Swatch Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midnight Blue, Desert Sand..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none transition"
                  required
                />
              </div>

              {/* Color Hex & Visual Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Color Value (HEX) <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-9 shrink-0 rounded-lg overflow-hidden border border-white/20 shadow-xs cursor-pointer">
                    <input
                      type="color"
                      value={formHex}
                      onChange={(e) => setFormHex(e.target.value.toUpperCase())}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 bg-transparent"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="#FFFFFF"
                    value={formHex}
                    onChange={(e) => setFormHex(e.target.value.toUpperCase())}
                    className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs font-mono text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none transition"
                    maxLength={7}
                    required
                  />
                </div>
              </div>

              {/* Quick Palette Presets */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormHex(p.hex);
                        if (!formName) setFormName(p.name);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.02] hover:bg-white/5 border border-white/5 text-xs text-slate-300 transition cursor-pointer"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: p.hex }}
                      />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Radio */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-slate-300">Display Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus("active")}
                    className={`h-9 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      formStatus === "active"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-[#131722] border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Active (Visible)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus("inactive")}
                    className={`h-9 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      formStatus === "inactive"
                        ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                        : "bg-[#131722] border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Inactive (Draft)
                  </button>
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
                disabled={saving}
                className="h-8 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{editingColor ? "Save Changes" : "Create Swatch"}</span>
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      {deletingColor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Color Swatch</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently remove{" "}
                <span className="text-white font-semibold">{deletingColor.name}</span> ({deletingColor.hex_code})? Product variants using this swatch won't be deleted.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingColor(null)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
