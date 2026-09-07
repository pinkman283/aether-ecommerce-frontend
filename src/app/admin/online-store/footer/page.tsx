"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  FolderTree,
  ArrowUpDown
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { FooterLink } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminStatusBadge, AdminEmptyState } from "@/components/admin/ui";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const DEFAULT_GROUPS = ["Quick Links", "Customer Care", "Company", "Legal"];

export default function AdminOnlineStoreFooterPage() {
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [columnGroup, setColumnGroup] = useState("Quick Links");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingLink, setDeletingLink] = useState<FooterLink | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getFooterLinks();
      setLinks(data || []);
    } catch (err) {
      toast.error("Failed to load footer navigation links.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleOpenCreate = (prefillGroup?: string) => {
    setEditingLink(null);
    setColumnGroup(prefillGroup || DEFAULT_GROUPS[0]);
    setTitle("");
    setUrl("");
    setSortOrder("0");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: FooterLink) => {
    setEditingLink(link);
    setColumnGroup(link.column_group);
    setTitle(link.title);
    setUrl(link.url);
    setSortOrder(String(link.sort_order));
    setIsActive(link.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !columnGroup.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        column_group: columnGroup.trim(),
        title: title.trim(),
        url: url.trim(),
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      if (editingLink) {
        await adminApi.updateFooterLink(editingLink.id, payload);
        toast.success(`Footer link "${title}" updated.`);
      } else {
        await adminApi.createFooterLink(payload);
        toast.success(`Footer link "${title}" created.`);
      }
      setIsModalOpen(false);
      fetchLinks();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save footer link.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLink) return;
    setDeleting(true);
    try {
      await adminApi.deleteFooterLink(deletingLink.id);
      toast.success(`Link "${deletingLink.title}" removed.`);
      setDeletingLink(null);
      fetchLinks();
    } catch (err) {
      toast.error("Failed to delete link.");
    } finally {
      setDeleting(false);
    }
  };

  // Group links by column_group
  const groupedLinks = useMemo(() => {
    const map: Record<string, FooterLink[]> = {};
    links.forEach((l) => {
      const g = l.column_group || "General";
      if (!map[g]) map[g] = [];
      map[g].push(l);
    });
    // Ensure all default groups appear
    DEFAULT_GROUPS.forEach((g) => {
      if (!map[g]) map[g] = [];
    });
    return map;
  }, [links]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Footer Builder & Navigation"
        description="Architect multi-column storefront footer links grouped by Customer Care, Legal, and Company directories."
        badge="Online Store"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Online Store" },
          { label: "Footer Builder" },
        ]}
        action={
          <button
            onClick={() => handleOpenCreate()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Link</span>
          </button>
        }
      />

      {/* Stats Strip */}
      <AdminStatStrip
        columns={3}
        stats={[
          {
            label: "Total Footer Links",
            value: links.length,
            icon: Layers,
            variant: "cyan",
            helper: "Across all footer columns",
          },
          {
            label: "Column Categories",
            value: Object.keys(groupedLinks).length,
            icon: FolderTree,
            variant: "emerald",
            helper: "Active footer groups",
          },
          {
            label: "Active Links",
            value: links.filter((l) => l.is_active).length,
            icon: Check,
            variant: "purple",
            helper: "Live on storefront footer",
          },
        ]}
      />

      {/* Grouped Columns Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">Loading footer links...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(groupedLinks).map(([group, groupLinks]) => (
            <div
              key={group}
              className="rounded-xl bg-[#0f121b] border border-white/[0.08] p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {group}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleOpenCreate(group)}
                    className="p-1 text-slate-400 hover:text-amber-400 hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
                    title={`Add link to ${group}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {groupLinks.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-6 text-center italic">
                    No links in this column yet.
                  </p>
                ) : (
                  <div className="divide-y divide-white/[0.04] mt-2">
                    {groupLinks
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((link) => (
                        <div
                          key={link.id}
                          className="py-2 flex items-center justify-between gap-2 group hover:bg-white/[0.02] px-1 rounded transition-colors"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-white truncate block">
                              {link.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 truncate block">
                              {link.url}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(link)}
                              className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeletingLink(link)}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
                <span>{groupLinks.length} items</span>
                <span>Sorted by order</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Footer Link Slide-over Drawer */}
      <Sheet open={isModalOpen} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
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
                  {editingLink ? "Edit Footer Link" : "Add Footer Link"}
                </SheetTitle>
                <span className="text-slate-600 text-xs shrink-0">·</span>
                <span className="text-xs text-slate-400 truncate">
                  {editingLink ? editingLink.title : "Storefront Navigation"}
                </span>
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Column Group <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  list="group-options"
                  placeholder="Quick Links, Customer Care..."
                  value={columnGroup}
                  onChange={(e) => setColumnGroup(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-white/20 focus:outline-none transition"
                  required
                />
                <datalist id="group-options">
                  {DEFAULT_GROUPS.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Link Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Order Tracking, Warranty..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-white/20 focus:outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Destination URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="/shop, /orders/track, https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs font-mono text-white placeholder:text-slate-500 focus:border-white/20 focus:outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Sort Order</label>
                <input
                  type="number"
                  placeholder="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white focus:border-white/20 focus:outline-none transition"
                />
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-[#131722] text-white focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Active Link</span>
                    <span className="text-[11px] text-slate-400 block">Visible in the storefront footer column</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Compact Footer: h-12 */}
            <div className="h-12 px-6 border-t border-white/[0.06] bg-[#0b0e17] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-8 px-4 rounded-lg bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingLink ? "Update Link" : "Save Link"}</span>
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Modal */}
      {deletingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Footer Link</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove{" "}
                <span className="text-white font-semibold">{deletingLink.title}</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingLink(null)}
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
