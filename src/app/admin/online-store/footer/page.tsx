"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  Globe,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { FooterColumn, FooterLink, SocialLink } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminStatusBadge, AdminEmptyState } from "@/components/admin/ui";
import { AdminCheckbox } from "@/components/admin/AdminCheckbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useThemeStore } from "@/store/useThemeStore";
import { BrandLogoImage } from "@/components/shared/BrandLogoImage";
import { SocialPlatformIcon } from "@/components/shared/SocialPlatformIcon";

export default function AdminOnlineStoreFooterPage() {
  const [columns, setColumns] = useState<FooterColumn[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();

  // Column Modal State
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null);
  const [columnTitle, setColumnTitle] = useState("");
  const [columnSortOrder, setColumnSortOrder] = useState("0");
  const [columnIsActive, setColumnIsActive] = useState(true);
  const [savingColumn, setSavingColumn] = useState(false);
  const [deletingColumn, setDeletingColumn] = useState<FooterColumn | null>(null);

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkIsExternal, setLinkIsExternal] = useState(false);
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(false);
  const [linkSortOrder, setLinkSortOrder] = useState("0");
  const [linkIsActive, setLinkIsActive] = useState(true);
  const [savingLink, setSavingLink] = useState(false);
  const [deletingLink, setDeletingLink] = useState<FooterLink | null>(null);

  // Live Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [colData, socData] = await Promise.all([
        adminApi.getFooterColumns(),
        adminApi.getSocialLinks().catch(() => []),
      ]);
      setColumns(colData || []);
      setSocialLinks(socData || []);
    } catch (err) {
      toast.error("Failed to load footer navigation data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Total link count across all columns
  const totalLinks = useMemo(() => {
    return columns.reduce((acc, col) => acc + (col.links?.length || 0), 0);
  }, [columns]);

  // Active link count
  const activeLinksCount = useMemo(() => {
    return columns.reduce((acc, col) => {
      if (!col.is_active) return acc;
      return acc + (col.links?.filter((l) => l.is_active).length || 0);
    }, 0);
  }, [columns]);

  // ==========================================
  // COLUMN ACTIONS
  // ==========================================

  const handleOpenCreateColumn = () => {
    setEditingColumn(null);
    setColumnTitle("");
    const maxSort = columns.length > 0 ? Math.max(...columns.map((c) => c.sort_order)) : 0;
    setColumnSortOrder(String(maxSort + 1));
    setColumnIsActive(true);
    setIsColumnModalOpen(true);
  };

  const handleOpenEditColumn = (col: FooterColumn) => {
    setEditingColumn(col);
    setColumnTitle(col.title);
    setColumnSortOrder(String(col.sort_order));
    setColumnIsActive(col.is_active);
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnTitle.trim()) {
      toast.error("Column title is required.");
      return;
    }

    setSavingColumn(true);
    try {
      const payload = {
        title: columnTitle.trim(),
        sort_order: Number(columnSortOrder) || 0,
        is_active: columnIsActive,
      };

      if (editingColumn) {
        await adminApi.updateFooterColumn(editingColumn.id, payload);
        toast.success(`Column "${columnTitle}" updated.`);
      } else {
        await adminApi.createFooterColumn(payload);
        toast.success(`Column "${columnTitle}" created.`);
      }
      setIsColumnModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save footer column.";
      toast.error(msg);
    } finally {
      setSavingColumn(false);
    }
  };

  const handleDeleteColumn = async () => {
    if (!deletingColumn) return;
    setDeleting(true);
    try {
      await adminApi.deleteFooterColumn(deletingColumn.id);
      toast.success(`Column "${deletingColumn.title}" deleted.`);
      setDeletingColumn(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to delete column.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleColumnActive = async (col: FooterColumn) => {
    try {
      await adminApi.updateFooterColumn(col.id, {
        title: col.title,
        sort_order: col.sort_order,
        is_active: !col.is_active,
      });
      setColumns((prev) =>
        prev.map((c) => (c.id === col.id ? { ...c, is_active: !col.is_active } : c))
      );
      toast.success(`Column "${col.title}" ${col.is_active ? "hidden" : "activated"}.`);
    } catch (err) {
      toast.error("Failed to toggle column status.");
    }
  };

  const handleMoveColumn = async (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const newCols = [...columns];
    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;

    // Update locally for immediate response
    setColumns(newCols);

    try {
      await adminApi.reorderFooterColumns(newCols.map((c) => c.id));
      toast.success("Column order updated.");
    } catch (err) {
      toast.error("Failed to save column reorder.");
      fetchData();
    }
  };

  // ==========================================
  // LINK ACTIONS
  // ==========================================

  const handleOpenCreateLink = (columnId?: number) => {
    setEditingLink(null);
    setSelectedColumnId(columnId || (columns[0] ? columns[0].id : null));
    setLinkTitle("");
    setLinkUrl("");
    setLinkIsExternal(false);
    setLinkOpenInNewTab(false);

    // Default sort order is next in selected column
    const col = columns.find((c) => c.id === (columnId || columns[0]?.id));
    const maxSort = col && col.links && col.links.length > 0 ? Math.max(...col.links.map((l) => l.sort_order)) : 0;
    setLinkSortOrder(String(maxSort + 1));
    setLinkIsActive(true);
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLink = (link: FooterLink) => {
    setEditingLink(link);
    setSelectedColumnId(link.footer_column_id || (columns[0] ? columns[0].id : null));
    setLinkTitle(link.title);
    setLinkUrl(link.url);
    setLinkIsExternal(Boolean(link.is_external));
    setLinkOpenInNewTab(Boolean(link.open_in_new_tab));
    setLinkSortOrder(String(link.sort_order));
    setLinkIsActive(link.is_active);
    setIsLinkModalOpen(true);
  };

  // Auto-detect external links when URL changes
  const handleUrlChange = (value: string) => {
    setLinkUrl(value);
    const trimmed = value.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      setLinkIsExternal(true);
      setLinkOpenInNewTab(true);
    } else if (trimmed.startsWith("/")) {
      setLinkIsExternal(false);
      setLinkOpenInNewTab(false);
    }
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) {
      toast.error("Title and URL are required.");
      return;
    }

    // Safety validation
    const trimmedUrl = linkUrl.trim().toLowerCase();
    if (trimmedUrl.startsWith("javascript:") || trimmedUrl.startsWith("data:") || trimmedUrl.startsWith("vbscript:")) {
      toast.error("Unsafe URL protocol prohibited.");
      return;
    }

    setSavingLink(true);
    try {
      const payload = {
        footer_column_id: selectedColumnId,
        title: linkTitle.trim(),
        url: linkUrl.trim(),
        is_external: linkIsExternal,
        open_in_new_tab: linkOpenInNewTab,
        sort_order: Number(linkSortOrder) || 0,
        is_active: linkIsActive,
      };

      if (editingLink) {
        await adminApi.updateFooterLink(editingLink.id, payload);
        toast.success(`Link "${linkTitle}" updated.`);
      } else {
        await adminApi.createFooterLink(payload);
        toast.success(`Link "${linkTitle}" created.`);
      }
      setIsLinkModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save link.";
      toast.error(msg);
    } finally {
      setSavingLink(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!deletingLink) return;
    setDeleting(true);
    try {
      await adminApi.deleteFooterLink(deletingLink.id);
      toast.success(`Link "${deletingLink.title}" deleted.`);
      setDeletingLink(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to delete link.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleLinkActive = async (link: FooterLink) => {
    try {
      await adminApi.updateFooterLink(link.id, {
        footer_column_id: link.footer_column_id,
        title: link.title,
        url: link.url,
        is_external: link.is_external,
        open_in_new_tab: link.open_in_new_tab,
        sort_order: link.sort_order,
        is_active: !link.is_active,
      });
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          links: col.links?.map((l) => (l.id === link.id ? { ...l, is_active: !link.is_active } : l)),
        }))
      );
      toast.success(`Link "${link.title}" ${link.is_active ? "disabled" : "enabled"}.`);
    } catch (err) {
      toast.error("Failed to update link status.");
    }
  };

  const handleMoveLink = async (columnId: number, linkIndex: number, direction: "up" | "down") => {
    const targetCol = columns.find((c) => c.id === columnId);
    if (!targetCol || !targetCol.links) return;

    const targetIndex = direction === "up" ? linkIndex - 1 : linkIndex + 1;
    if (targetIndex < 0 || targetIndex >= targetCol.links.length) return;

    const newLinks = [...targetCol.links];
    const temp = newLinks[linkIndex];
    newLinks[linkIndex] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    // Update locally
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, links: newLinks } : c))
    );

    try {
      await adminApi.reorderFooterLinks(newLinks.map((l) => l.id), columnId);
      toast.success("Link order updated.");
    } catch (err) {
      toast.error("Failed to save link reorder.");
      fetchData();
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Footer Builder"
        description="Manage storefront footer columns, links, visibility, and destination URLs from a single source of truth."
        badge="Online Store"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Online Store" },
          { label: "Footer Builder" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] hover:text-white border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Preview Footer</span>
            </button>
            <button
              onClick={handleOpenCreateColumn}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Column</span>
            </button>
          </div>
        }
      />

      {/* Stats Strip */}
      <AdminStatStrip
        columns={3}
        stats={[
          {
            label: "Footer Columns",
            value: columns.length,
            icon: FolderTree,
            variant: "cyan",
            helper: `${columns.filter((c) => c.is_active).length} visible on storefront`,
          },
          {
            label: "Total Navigation Links",
            value: totalLinks,
            icon: Layers,
            variant: "purple",
            helper: "Across all footer columns",
          },
          {
            label: "Active Links",
            value: activeLinksCount,
            icon: Check,
            variant: "emerald",
            helper: "Live on customer footer",
          },
        ]}
      />

      {/* Columns Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">Loading footer columns...</span>
        </div>
      ) : columns.length === 0 ? (
        <AdminEmptyState
          icon={FolderTree}
          title="No footer columns created yet"
          description="Create your first navigation column (e.g. SHOP, CUSTOMER CARE, INFORMATION) to start building your footer."
          action={
            <button
              onClick={handleOpenCreateColumn}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-lg cursor-pointer transition"
            >
              Add First Column
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col, colIndex) => {
            const colLinks = (col.links || []).sort((a, b) => a.sort_order - b.sort_order);

            return (
              <div
                key={col.id}
                className={`rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  col.is_active
                    ? "bg-[#0f121b] border-white/[0.08] shadow-sm hover:border-white/[0.14]"
                    : "bg-[#0b0e17] border-white/[0.04] opacity-75"
                }`}
              >
                {/* Column Card Header */}
                <div className="p-3.5 border-b border-white/[0.06] bg-white/[0.01]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleColumnActive(col)}
                        title={col.is_active ? "Column is active. Click to disable." : "Column is disabled. Click to enable."}
                        className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform hover:scale-125 cursor-pointer ${
                          col.is_active ? "bg-emerald-400" : "bg-slate-600"
                        }`}
                      />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                        {col.title}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 font-mono">
                        {colLinks.length}
                      </span>
                    </div>

                    {/* Column Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveColumn(colIndex, "left")}
                        disabled={colIndex === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded transition cursor-pointer"
                        title="Move column left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveColumn(colIndex, "right")}
                        disabled={colIndex === columns.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded transition cursor-pointer"
                        title="Move column right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditColumn(col)}
                        className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-white/[0.04] rounded transition cursor-pointer"
                        title="Edit Column"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingColumn(col)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                        title="Delete Column"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column Links List */}
                <div className="p-2 min-h-[140px] flex-1 flex flex-col justify-between">
                  {colLinks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center">
                      <p className="text-[11px] text-slate-500 italic mb-2">No links in this column yet.</p>
                      <button
                        onClick={() => handleOpenCreateLink(col.id)}
                        className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add first link</span>
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {colLinks.map((link, linkIndex) => (
                        <div
                          key={link.id}
                          className={`py-2 px-2 flex items-center justify-between gap-2 group rounded-lg transition-colors ${
                            link.is_active ? "hover:bg-white/[0.03]" : "opacity-50 hover:bg-white/[0.02]"
                          }`}
                        >
                          {/* Reorder Arrows */}
                          <div className="flex flex-col gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleMoveLink(col.id, linkIndex, "up")}
                              disabled={linkIndex === 0}
                              className="text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                              title="Move link up"
                            >
                              <ArrowUp className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleMoveLink(col.id, linkIndex, "down")}
                              disabled={linkIndex === colLinks.length - 1}
                              className="text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                              title="Move link down"
                            >
                              <ArrowDown className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Link Title & URL */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-white truncate block">
                                {link.title}
                              </span>
                              {link.is_external && (
                                <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                                  EXT
                                </span>
                              )}
                              {link.open_in_new_tab && (
                                <span className="text-[9px] text-slate-500 shrink-0" title="Opens in new tab">
                                  ↗
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 truncate block">
                              {link.url}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleToggleLinkActive(link)}
                              title={link.is_active ? "Click to disable" : "Click to enable"}
                              className={`w-2 h-2 rounded-full cursor-pointer transition ${
                                link.is_active ? "bg-emerald-400" : "bg-slate-600"
                              }`}
                            />
                            <button
                              onClick={() => handleOpenEditLink(link)}
                              className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded transition cursor-pointer"
                              title="Edit link"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeletingLink(link)}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                              title="Delete link"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Link Button inside Column */}
                  <div className="pt-2 mt-2 border-t border-white/[0.04]">
                    <button
                      onClick={() => handleOpenCreateLink(col.id)}
                      className="w-full py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/[0.08] hover:border-white/[0.18] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add Link</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Column Modal */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">
                {editingColumn ? "Edit Footer Column" : "Add Footer Column"}
              </h3>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveColumn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Column Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SHOP, CUSTOMER CARE, INFORMATION..."
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Display Order</label>
                <input
                  type="number"
                  placeholder="1"
                  value={columnSortOrder}
                  onChange={(e) => setColumnSortOrder(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white focus:border-cyan-400 focus:outline-none transition"
                />
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <AdminCheckbox
                    checked={columnIsActive}
                    onChange={(e) => setColumnIsActive(e.target.checked)}
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Visible on Storefront</span>
                    <span className="text-[11px] text-slate-400 block">Column and its links will be shown to visitors</span>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsColumnModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingColumn}
                  className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {savingColumn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingColumn ? "Update Column" : "Create Column"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Link Drawer */}
      <Sheet open={isLinkModalOpen} onOpenChange={(open) => { if (!open) setIsLinkModalOpen(false); }}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:w-[480px] md:w-[500px] sm:!max-w-[500px] max-w-full bg-[#0b0e17] border-l border-white/[0.08] p-0 flex flex-col justify-between shadow-2xl text-slate-100 overflow-hidden"
        >
          <form onSubmit={handleSaveLink} className="flex flex-col h-full overflow-hidden">
            {/* Drawer Header */}
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
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              {/* Column Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Column <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedColumnId || ""}
                  onChange={(e) => setSelectedColumnId(Number(e.target.value) || null)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white focus:border-cyan-400 focus:outline-none transition cursor-pointer"
                  required
                >
                  <option value="" disabled>Select a column</option>
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} {!c.is_active ? "(Disabled)" : ""}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500">
                  Select which navigation column this link appears under
                </span>
              </div>

              {/* Link Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Link Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Disposable Vapes, Track Order, FAQ..."
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                  required
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Destination URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="/products, /track, or https://example.com"
                  value={linkUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs font-mono text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition"
                  required
                />
                <span className="text-[11px] text-slate-500">
                  Use relative paths (e.g. <code className="text-slate-300">/contact</code>) for internal routes, or <code className="text-slate-300">https://...</code> for external websites.
                </span>
              </div>

              {/* Behavior toggles */}
              <div className="space-y-3 p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <AdminCheckbox
                    checked={linkIsExternal}
                    onChange={(e) => setLinkIsExternal(e.target.checked)}
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">External Link</span>
                    <span className="text-[11px] text-slate-400 block">
                      Renders standard &lt;a&gt; tag instead of Next.js router
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none pt-2 border-t border-white/[0.04]">
                  <AdminCheckbox
                    checked={linkOpenInNewTab}
                    onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Open in New Tab</span>
                    <span className="text-[11px] text-slate-400 block">
                      Opens link in new window with secure <code className="text-slate-300">rel=&quot;noopener noreferrer&quot;</code>
                    </span>
                  </div>
                </label>
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Sort Order</label>
                <input
                  type="number"
                  placeholder="1"
                  value={linkSortOrder}
                  onChange={(e) => setLinkSortOrder(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white focus:border-cyan-400 focus:outline-none transition"
                />
              </div>

              {/* Active Toggle */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <AdminCheckbox
                    checked={linkIsActive}
                    onChange={(e) => setLinkIsActive(e.target.checked)}
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Active Link</span>
                    <span className="text-[11px] text-slate-400 block">Visible in storefront footer column</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="h-12 px-6 border-t border-white/[0.06] bg-[#0b0e17] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingLink}
                className="h-8 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {savingLink && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingLink ? "Update Link" : "Save Link"}</span>
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Column Confirmation Modal */}
      {deletingColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Footer Column</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete{" "}
                <span className="text-white font-semibold">{deletingColumn.title}</span>?
                {deletingColumn.links && deletingColumn.links.length > 0 && (
                  <span className="block text-rose-400 mt-1">
                    This will also delete {deletingColumn.links.length} link(s) inside this column.
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingColumn(null)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteColumn}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Link Confirmation Modal */}
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
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLink}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Footer Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#0f121b] border border-white/[0.15] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="h-12 px-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0b0e17]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white tracking-wide">Live Footer Storefront Preview</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Interactive
                </span>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0d14]">
              <div className="rounded-xl border border-white/10 bg-[#0e121e] text-slate-300 overflow-hidden text-xs">
                {/* Guarantees Ribbon */}
                {theme.footer_features_enabled !== false && (
                  <div className="border-b border-white/10 p-4 sm:p-6 bg-white/[0.01]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <Truck className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{theme.footer_feature_title_1 || "Free Express Shipping"}</p>
                          <p className="text-[10px] text-slate-400">{theme.footer_feature_desc_1 || "Complimentary delivery on qualifying orders."}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{theme.footer_feature_title_2 || "100% Authentic Guarantee"}</p>
                          <p className="text-[10px] text-slate-400">{theme.footer_feature_desc_2 || "Verified authentic hardware and genuine e-liquids."}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                          <RotateCcw className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{theme.footer_feature_title_3 || "Fast Dispatch"}</p>
                          <p className="text-[10px] text-slate-400">{theme.footer_feature_desc_3 || "Orders processed within 24-48 hours."}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                          <Headphones className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{theme.footer_feature_title_4 || "Dedicated Customer Care"}</p>
                          <p className="text-[10px] text-slate-400">{theme.footer_feature_desc_4 || "Expert assistance with orders and device support."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Columns */}
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Brand Col */}
                    <div className="lg:col-span-2 space-y-3">
                      <div>
                        <span className="text-base font-black tracking-wider text-white">
                          {theme.store_brand_name || "INHALIQ"}
                        </span>
                        <p className="text-[10px] tracking-widest text-cyan-400 uppercase font-semibold mt-0.5">
                          {theme.store_brand_tagline || "ELEVATE EVERY INHALE"}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                        Curated premium disposable vapes, pod systems, e-liquids, and accessories. Experience authentic quality and fast delivery.
                      </p>

                      {/* Social Icons */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {socialLinks.filter((s) => s.is_active).map((social) => (
                          <span
                            key={social.id}
                            className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400"
                            title={social.platform}
                          >
                            <SocialPlatformIcon platform={social.platform} icon={social.icon} className="w-3.5 h-3.5" />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Columns */}
                    {columns.filter((c) => c.is_active).map((col) => (
                      <div key={col.id} className="space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                          {col.title}
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                          {(col.links || [])
                            .filter((l) => l.is_active)
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((link) => (
                              <li key={link.id}>
                                <span className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                                  <span>{link.title}</span>
                                  {link.open_in_new_tab && <span className="text-[10px] text-slate-500">↗</span>}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Copyright Bar */}
                  <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
                    <p>© {new Date().getFullYear()} {theme.store_brand_name || "Inheliq"}. All rights reserved.</p>
                    <p className="text-slate-400">Strictly 18+ Only • Age verification required</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="h-12 px-5 border-t border-white/[0.08] flex items-center justify-end bg-[#0b0e17]">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
