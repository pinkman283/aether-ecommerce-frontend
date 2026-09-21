"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Share2, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  Globe,
  Radio,
  Tv,
  MessageCircle
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { SocialLink } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminStatusBadge, AdminEmptyState } from "@/components/admin/ui";
import { AdminCheckbox } from "@/components/admin/AdminCheckbox";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const PRESET_PLATFORMS = [
  { name: "X (Twitter)", icon: "twitter", placeholder: "https://x.com/yourhandle" },
  { name: "Instagram", icon: "instagram", placeholder: "https://instagram.com/yourhandle" },
  { name: "YouTube", icon: "youtube", placeholder: "https://youtube.com/c/yourchannel" },
  { name: "GitHub", icon: "github", placeholder: "https://github.com/yourorg" },
  { name: "Discord", icon: "discord", placeholder: "https://discord.gg/yourserver" },
  { name: "LinkedIn", icon: "linkedin", placeholder: "https://linkedin.com/company/yourcompany" },
  { name: "TikTok", icon: "tiktok", placeholder: "https://tiktok.com/@yourhandle" },
  { name: "Facebook", icon: "facebook", placeholder: "https://facebook.com/yourpage" },
];

export default function AdminOnlineStoreSocialPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [platform, setPlatform] = useState("X (Twitter)");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("twitter");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingLink, setDeletingLink] = useState<SocialLink | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSocialLinks();
      setLinks(data || []);
    } catch (err) {
      toast.error("Failed to load social links.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleOpenCreate = () => {
    setEditingLink(null);
    setPlatform(PRESET_PLATFORMS[0].name);
    setUrl("");
    setIcon(PRESET_PLATFORMS[0].icon);
    setSortOrder("0");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: SocialLink) => {
    setEditingLink(link);
    setPlatform(link.platform);
    setUrl(link.url);
    setIcon(link.icon || "globe");
    setSortOrder(String(link.sort_order));
    setIsActive(link.is_active);
    setIsModalOpen(true);
  };

  const handlePresetSelect = (p: typeof PRESET_PLATFORMS[0]) => {
    setPlatform(p.name);
    setIcon(p.icon);
    if (!url) setUrl(p.placeholder);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform.trim() || !url.trim()) {
      toast.error("Platform name and URL are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        platform: platform.trim(),
        url: url.trim(),
        icon: icon.trim() || strToIcon(platform),
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      if (editingLink) {
        await adminApi.updateSocialLink(editingLink.id, payload);
        toast.success(`Social link "${platform}" updated.`);
      } else {
        await adminApi.createSocialLink(payload);
        toast.success(`Social link "${platform}" added.`);
      }
      setIsModalOpen(false);
      fetchLinks();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save social link.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLink) return;
    setDeleting(true);
    try {
      await adminApi.deleteSocialLink(deletingLink.id);
      toast.success(`Channel "${deletingLink.platform}" removed.`);
      setDeletingLink(null);
      fetchLinks();
    } catch (err) {
      toast.error("Failed to delete social link.");
    } finally {
      setDeleting(false);
    }
  };

  const strToIcon = (name: string) => {
    const l = name.toLowerCase();
    if (l.includes("twitter") || l.includes("x")) return "twitter";
    if (l.includes("instagram")) return "instagram";
    if (l.includes("youtube")) return "youtube";
    if (l.includes("github")) return "github";
    if (l.includes("discord")) return "discord";
    if (l.includes("linkedin")) return "linkedin";
    return "globe";
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Social Media Channels"
        description="Connect official social accounts displayed on the storefront header, navigation bar, and footer."
        badge="Online Store"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Online Store" },
          { label: "Social Links" },
        ]}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Channel</span>
          </button>
        }
      />

      {/* Stats Strip */}
      <AdminStatStrip
        columns={3}
        stats={[
          {
            label: "Connected Channels",
            value: links.length,
            icon: Share2,
            variant: "cyan",
            helper: "In social media index",
          },
          {
            label: "Live On Storefront",
            value: links.filter((l) => l.is_active).length,
            icon: Check,
            variant: "emerald",
            helper: "Active social links",
          },
          {
            label: "Supported Presets",
            value: PRESET_PLATFORMS.length,
            icon: Globe,
            variant: "purple",
            helper: "With dedicated iconography",
          },
        ]}
      />

      {/* Social Links Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">Loading social links...</span>
        </div>
      ) : links.length === 0 ? (
        <AdminEmptyState
          title="No Social Channels Configured"
          description="Connect your official X, Instagram, YouTube, Discord, or GitHub profiles."
          action={
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              + Connect Channel
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {links
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((link) => (
              <div
                key={link.id}
                className="p-4 rounded-xl bg-[#0f121b] border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between gap-3 group shadow-xs hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                        {link.platform}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Order #{link.sort_order}
                      </span>
                    </div>
                  </div>

                  <AdminStatusBadge
                    status={link.is_active ? "active" : "inactive"}
                    label={link.is_active ? "Live" : "Off"}
                    size="sm"
                  />
                </div>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-slate-400 hover:text-cyan-400 truncate flex items-center gap-1 bg-[#161a26] p-2 rounded-lg border border-white/[0.04] transition-colors"
                >
                  <span className="truncate">{link.url}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenEdit(link)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingLink(link)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create / Edit Social Channel Slide-over Drawer */}
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
                  {editingLink ? "Edit Channel" : "Connect Channel"}
                </SheetTitle>
                {editingLink && (
                  <>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded shrink-0">
                      #{editingLink.id}
                    </span>
                    <span className="text-slate-600 text-xs shrink-0">·</span>
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">
                      {editingLink.platform}
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
              {/* Quick Pick Presets */}
              {!editingLink && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Pick Platform
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PLATFORMS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs border transition cursor-pointer ${
                          platform === p.name
                            ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold"
                            : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Platform Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Instagram, Discord"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Profile URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs font-mono text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Display Sort Order</label>
                <input
                  type="number"
                  placeholder="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white focus:border-cyan-400/50 focus:outline-none transition"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs font-medium">
                  <AdminCheckbox
                    id="social_active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active (Display in header & footer)</span>
                </label>
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
                className="h-8 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{editingLink ? "Save Changes" : "Connect Channel"}</span>
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
              <h3 className="text-sm font-bold text-white">Remove Channel</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove{" "}
                <span className="text-white font-semibold">{deletingLink.platform}</span>?
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
                <span>Confirm Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
