"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Sparkles, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Power, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  ExternalLink, 
  Clock, 
  Tag, 
  Layers, 
  Monitor, 
  Smartphone,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Banner } from "@/types";
import { BannerFormModal } from "@/components/admin/banners/BannerFormModal";
import { toast } from "sonner";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Action Loading
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBanners();
      setBanners(data || []);
    } catch (err) {
      toast.error("Failed to load marketing banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreate = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (banner: Banner) => {
    setActionLoadingId(banner.id);
    try {
      const res = await adminApi.toggleBannerStatus(banner.id);
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
      );
      toast.success(res.message);
    } catch (err) {
      toast.error("Failed to toggle banner status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!window.confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
      return;
    }

    setActionLoadingId(banner.id);
    try {
      await adminApi.deleteBanner(banner.id);
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      toast.success("Banner deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete banner.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reordering controls
  const handleMoveOrder = async (banner: Banner, direction: "up" | "down") => {
    const currentIndex = banners.findIndex((b) => b.id === banner.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const currentBanner = banners[currentIndex];
    const targetBanner = banners[targetIndex];

    const currentOrder = currentBanner.sort_order;
    const targetOrder = targetBanner.sort_order;

    const newCurrentOrder = currentOrder === targetOrder 
      ? (direction === "up" ? targetOrder - 1 : targetOrder + 1)
      : targetOrder;

    try {
      await adminApi.reorderBanners([
        { id: currentBanner.id, sort_order: newCurrentOrder },
        { id: targetBanner.id, sort_order: currentOrder },
      ]);

      setBanners((prev) => {
        const next = [...prev];
        next[currentIndex] = { ...currentBanner, sort_order: newCurrentOrder };
        next[targetIndex] = { ...targetBanner, sort_order: currentOrder };
        return next.sort((a, b) => a.sort_order - b.sort_order);
      });
      toast.success("Display order updated.");
    } catch {
      toast.error("Failed to reorder banners.");
    }
  };

  // Filtered & Searched Banners
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchEyebrow = b.eyebrow?.toLowerCase().includes(q);
        const matchSubtitle = b.subtitle?.toLowerCase().includes(q);
        const matchDiscount = b.discount_tag?.toLowerCase().includes(q);
        const matchLink = b.computed_link?.toLowerCase().includes(q);
        if (!matchTitle && !matchEyebrow && !matchSubtitle && !matchDiscount && !matchLink) {
          return false;
        }
      }

      // Placement filter
      if (placementFilter !== "all") {
        if (placementFilter === "primary_hero" && !["primary_hero", "hero_slider"].includes(b.placement)) {
          return false;
        }
        if (placementFilter === "secondary_hero" && b.placement !== "secondary_hero") {
          return false;
        }
        if (placementFilter === "top_strip" && !["top_strip", "top_announcement"].includes(b.placement)) {
          return false;
        }
        if (placementFilter === "bottom_banner" && !["bottom_banner", "middle_promo", "discount_carousel"].includes(b.placement)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        const now = new Date().toISOString();
        const isScheduled = b.starts_at && b.starts_at > now;
        const isExpired = b.expires_at && b.expires_at < now;

        if (statusFilter === "active" && (!b.is_active || isScheduled || isExpired)) return false;
        if (statusFilter === "scheduled" && (!b.is_active || !isScheduled)) return false;
        if (statusFilter === "expired" && !isExpired) return false;
        if (statusFilter === "paused" && b.is_active) return false;
      }

      return true;
    });
  }, [banners, search, placementFilter, statusFilter]);

  // Derive Banner Status
  const getBannerStatus = (b: Banner) => {
    const now = new Date().toISOString();
    if (!b.is_active) return { label: "PAUSED", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
    if (b.expires_at && b.expires_at < now) return { label: "EXPIRED", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    if (b.starts_at && b.starts_at > now) return { label: "SCHEDULED", color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" };
    return { label: "ACTIVE", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Homepage Hero & Promotional Banners
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer-facing hero carousels, secondary promotional cards, schedules, and dynamic destinations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Banner</span>
        </button>
      </div>

      {/* Stats Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-[#0d1017] border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Banners</span>
          <p className="text-xl font-black text-white">{banners.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0d1017] border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Currently Active</span>
          <p className="text-xl font-black text-emerald-400">
            {banners.filter((b) => b.is_currently_visible ?? b.is_active).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0d1017] border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Primary Hero</span>
          <p className="text-xl font-black text-cyan-400">
            {banners.filter((b) => ["primary_hero", "hero_slider"].includes(b.placement)).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0d1017] border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Secondary Cards</span>
          <p className="text-xl font-black text-purple-400">
            {banners.filter((b) => b.placement === "secondary_hero").length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0d1017] border border-white/10 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Bottom Banners</span>
          <p className="text-xl font-black text-amber-400">
            {banners.filter((b) => ["bottom_banner", "middle_promo", "discount_carousel"].includes(b.placement)).length}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Placement Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d1017] border border-white/10 text-xs">
            {[
              { id: "all", label: "All Banners" },
              { id: "primary_hero", label: "Primary Hero" },
              { id: "secondary_hero", label: "Secondary Cards" },
              { id: "top_strip", label: "Top Micro Strip" },
              { id: "bottom_banner", label: "Bottom Banner" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPlacementFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  placementFilter === tab.id
                    ? "bg-white/15 text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search banners, copy, links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#0d1017] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0d1017] border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="paused">Paused / Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banners Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1017] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">Banner Creative</th>
                <th className="p-4">Placement</th>
                <th className="p-4">Destination Target</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Order</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading marketing banners...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-bold text-white">No banners found</p>
                      <p className="text-xs text-slate-500">
                        Try adjusting your search terms or filters, or create a new banner.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBanners.map((b, idx) => {
                  const status = getBannerStatus(b);
                  const targetUrl = b.computed_link || b.cta_link || "/products";

                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* ID */}
                      <td className="p-4 text-center text-slate-500 font-mono text-[11px]">
                        {b.id}
                      </td>

                      {/* Creative & Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                            <img
                              src={b.image_url}
                              alt={b.title}
                              className="w-full h-full object-cover object-center"
                            />
                            {b.mobile_image_url && (
                              <span
                                className="absolute bottom-1 right-1 p-0.5 rounded bg-black/60 text-[9px] text-purple-300"
                                title="Mobile image available"
                              >
                                <Smartphone className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5 max-w-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {b.eyebrow && (
                                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                                  {b.eyebrow}
                                </span>
                              )}
                              {b.discount_tag && (
                                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                  {b.discount_tag}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-white block truncate">{b.title}</span>
                            {b.subtitle && (
                              <span className="text-[11px] text-slate-400 block truncate">
                                {b.subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Placement */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                          {b.placement === "primary_hero" || b.placement === "hero_slider"
                            ? "Primary Hero"
                            : b.placement === "secondary_hero"
                            ? "Secondary Card"
                            : b.placement === "top_strip" || b.placement === "top_announcement"
                            ? "Top Strip"
                            : b.placement === "bottom_banner" || b.placement === "middle_promo" || b.placement === "discount_carousel"
                            ? "Bottom Banner"
                            : b.placement}
                        </span>
                      </td>

                      {/* Destination Target */}
                      <td className="p-4 max-w-xs">
                        <div className="space-y-0.5">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {b.destination_type || "custom"}
                          </span>
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 truncate group-hover:underline"
                          >
                            <span className="truncate">{targetUrl}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                          </a>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="p-4 whitespace-nowrap text-[11px] text-slate-400">
                        {b.starts_at || b.expires_at ? (
                          <div className="space-y-0.5">
                            {b.starts_at && <div>From: {new Date(b.starts_at).toLocaleDateString()}</div>}
                            {b.expires_at && <div>Until: {new Date(b.expires_at).toLocaleDateString()}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-500">Always Visible</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.color}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Sort Order */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <span className="font-mono font-bold text-white text-xs w-6">
                            {b.sort_order}
                          </span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(b, "up")}
                              className="p-0.5 hover:bg-white/10 text-slate-400 hover:text-white rounded cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(b, "down")}
                              className="p-0.5 hover:bg-white/10 text-slate-400 hover:text-white rounded cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(b)}
                            disabled={actionLoadingId === b.id}
                            title={b.is_active ? "Pause banner" : "Activate banner"}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Power
                              className={`w-3.5 h-3.5 ${
                                b.is_active ? "text-emerald-400" : "text-slate-500"
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(b)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit banner"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(b)}
                            disabled={actionLoadingId === b.id}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete banner"
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
        </div>
      </div>

      {/* Banner Creation & Edit Modal */}
      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBanners}
        banner={editingBanner}
      />
    </div>
  );
}
