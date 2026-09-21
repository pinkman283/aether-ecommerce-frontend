"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  X, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { SocialLink } from "@/types";
import { AdminPageHeader, AdminStatusBadge, AdminEmptyState } from "@/components/admin/ui";
import { AdminCheckbox } from "@/components/admin/AdminCheckbox";
import { SocialPlatformIcon } from "@/components/shared/SocialPlatformIcon";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const PRESET_PLATFORMS = [
  { name: "WhatsApp", icon: "whatsapp", placeholder: "8801XXXXXXXXX" },
  { name: "Instagram", icon: "instagram", placeholder: "https://instagram.com/yourhandle" },
  { name: "Facebook", icon: "facebook", placeholder: "https://facebook.com/yourpage" },
  { name: "X (Twitter)", icon: "twitter", placeholder: "https://x.com/yourhandle" },
  { name: "YouTube", icon: "youtube", placeholder: "https://youtube.com/c/yourchannel" },
  { name: "Discord", icon: "discord", placeholder: "https://discord.gg/yourserver" },
  { name: "TikTok", icon: "tiktok", placeholder: "https://tiktok.com/@yourhandle" },
  { name: "LinkedIn", icon: "linkedin", placeholder: "https://linkedin.com/company/yourbrand" },
  { name: "GitHub", icon: "github", placeholder: "https://github.com/yourbrand" },
];

function buildWhatsAppUrl(number: string, message: string): string {
  const clean = number.replace(/[^0-9]/g, "");
  if (!clean) return "";
  const trimmed = message.trim();
  return trimmed ? `https://wa.me/${clean}?text=${encodeURIComponent(trimmed)}` : `https://wa.me/${clean}`;
}

function parseWhatsAppUrl(urlStr: string): { number: string; message: string } {
  try {
    const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    const num = parsed.pathname.replace(/^\/+/, "").replace(/[^0-9]/g, "");
    const msg = parsed.searchParams.get("text") || "";
    return { number: num, message: msg };
  } catch {
    const match = urlStr.match(/wa\.me\/([0-9]+)(\?text=(.*))?/);
    if (match) {
      return {
        number: match[1] || "",
        message: match[3] ? decodeURIComponent(match[3]) : "",
      };
    }
    return { number: "", message: "" };
  }
}

export default function AdminOnlineStoreSocialPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [platform, setPlatform] = useState("WhatsApp");
  const [url, setUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [icon, setIcon] = useState("whatsapp");
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
    } catch {
      toast.error("Failed to load channels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const isWhatsApp = platform.trim().toLowerCase() === "whatsapp";
  const hasExistingWhatsApp = links.some(
    (l) => l.platform.toLowerCase() === "whatsapp" && (!editingLink || editingLink.id !== l.id)
  );
  const previewWhatsAppUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);

  const handleOpenCreate = () => {
    setEditingLink(null);
    const defaultPreset = hasExistingWhatsApp ? PRESET_PLATFORMS[1] : PRESET_PLATFORMS[0];
    setPlatform(defaultPreset.name);
    setUrl(defaultPreset.name === "WhatsApp" ? "" : defaultPreset.placeholder);
    setIcon(defaultPreset.icon);
    setWhatsappNumber("");
    setWhatsappMessage("");
    setSortOrder(String(links.length));
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

    if (link.platform.toLowerCase() === "whatsapp" || link.url.includes("wa.me")) {
      const parsed = parseWhatsAppUrl(link.url);
      setWhatsappNumber(parsed.number);
      setWhatsappMessage(parsed.message);
    } else {
      setWhatsappNumber("");
      setWhatsappMessage("");
    }

    setIsModalOpen(true);
  };

  const handlePresetSelect = (p: typeof PRESET_PLATFORMS[0]) => {
    setPlatform(p.name);
    setIcon(p.icon);
    if (p.name === "WhatsApp") {
      setUrl(buildWhatsAppUrl(whatsappNumber, whatsappMessage));
    } else {
      if (!url || url.includes("wa.me")) {
        setUrl(p.placeholder);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isWhatsApp) {
      if (hasExistingWhatsApp) {
        toast.error("WhatsApp channel is already configured.");
        return;
      }

      const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
      if (!cleanNumber || cleanNumber.length < 7 || cleanNumber.length > 15) {
        toast.error("Please enter a valid phone number (7–15 digits with country code).");
        return;
      }

      const finalUrl = buildWhatsAppUrl(cleanNumber, whatsappMessage);

      setSaving(true);
      try {
        const payload = {
          platform: "WhatsApp",
          url: finalUrl,
          icon: "whatsapp",
          sort_order: Number(sortOrder) || 0,
          is_active: isActive,
          whatsapp_number: cleanNumber,
          whatsapp_message: whatsappMessage.trim() || undefined,
        };

        if (editingLink) {
          await adminApi.updateSocialLink(editingLink.id, payload);
          toast.success("WhatsApp channel updated.");
        } else {
          await adminApi.createSocialLink(payload);
          toast.success("WhatsApp channel connected.");
        }
        setIsModalOpen(false);
        fetchLinks();
      } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to save WhatsApp channel.";
        toast.error(msg);
      } finally {
        setSaving(false);
      }
      return;
    }

    // Standard Links
    if (!platform.trim() || !url.trim()) {
      toast.error("Platform and URL are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        platform: platform.trim(),
        url: url.trim(),
        icon: icon.trim() || platform.toLowerCase(),
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      if (editingLink) {
        await adminApi.updateSocialLink(editingLink.id, payload);
        toast.success(`${platform} updated.`);
      } else {
        await adminApi.createSocialLink(payload);
        toast.success(`${platform} connected.`);
      }
      setIsModalOpen(false);
      fetchLinks();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save link.";
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
      toast.success(`${deletingLink.platform} removed.`);
      setDeletingLink(null);
      fetchLinks();
    } catch {
      toast.error("Failed to delete link.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Clean Minimal Header */}
      <AdminPageHeader
        title="Social & Contact Channels"
        description="Configure social media profiles and WhatsApp contact channels displayed on your storefront."
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
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-white hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Channel</span>
          </button>
        }
      />

      {/* Channels Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
          <span className="text-xs">Loading channels...</span>
        </div>
      ) : links.length === 0 ? (
        <AdminEmptyState
          title="No Channels Added"
          description="Connect WhatsApp, Instagram, Facebook, or your other social channels."
          action={
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Add Channel
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {links
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((link) => {
              const isWa = link.platform.toLowerCase() === "whatsapp";

              return (
                <div
                  key={link.id}
                  className="p-4 rounded-xl bg-[#0f121a] border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                          isWa
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-white/[0.04] border-white/10 text-slate-300"
                        }`}
                      >
                        <SocialPlatformIcon platform={link.platform} icon={link.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-semibold text-white">
                            {link.platform}
                          </h3>
                          {isWa && (
                            <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              Chat
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Order #{link.sort_order}
                        </span>
                      </div>
                    </div>

                    <AdminStatusBadge
                      status={link.is_active ? "active" : "inactive"}
                      label={link.is_active ? "Active" : "Hidden"}
                      size="sm"
                    />
                  </div>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-slate-400 hover:text-white truncate flex items-center justify-between gap-1 bg-[#141824] px-2.5 py-1.5 rounded-lg border border-white/[0.04] transition-colors"
                  >
                    <span className="truncate">{link.url}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-50" />
                  </a>

                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(link)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
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
              );
            })}
        </div>
      )}

      {/* Clean Minimal Slide-over Drawer */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:w-[400px] sm:!max-w-[400px] max-w-full bg-[#0d1017] border-l border-white/[0.08] p-0 flex flex-col justify-between shadow-2xl text-slate-100"
        >
          <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
            {/* Minimal Header */}
            <div className="h-13 px-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <SocialPlatformIcon platform={platform} icon={icon} className="w-3.5 h-3.5 text-slate-200" />
                </div>
                <SheetTitle className="text-xs font-semibold text-white">
                  {editingLink ? `Edit ${editingLink.platform}` : "Connect Channel"}
                </SheetTitle>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Minimal Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Preset Selector (Only when creating) */}
              {!editingLink && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Platform</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRESET_PLATFORMS.map((p) => {
                      const isSelected = platform === p.name;
                      const isWaDisabled = p.name === "WhatsApp" && hasExistingWhatsApp;

                      return (
                        <button
                          key={p.name}
                          type="button"
                          disabled={isWaDisabled}
                          onClick={() => handlePresetSelect(p)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                            isSelected
                              ? "bg-white/10 border-white/25 text-white"
                              : isWaDisabled
                              ? "bg-white/[0.01] border-white/5 text-slate-600 cursor-not-allowed opacity-40 line-through"
                              : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <SocialPlatformIcon platform={p.name} icon={p.icon} className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{p.name.split(" ")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Duplicate WhatsApp Notice */}
              {isWhatsApp && !editingLink && hasExistingWhatsApp && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                  WhatsApp is already configured. Please edit the existing channel card.
                </div>
              )}

              {/* Conditional Inputs */}
              {isWhatsApp ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">
                      Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 8801700000000"
                      value={whatsappNumber}
                      onChange={(e) => {
                        setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ""));
                      }}
                      className="w-full h-8.5 rounded-lg border border-white/10 bg-[#141824] px-3 font-mono text-xs text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">
                      Welcome Message <span className="text-slate-500">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Hi, I have a question about my order"
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#141824] p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none transition resize-none"
                    />
                  </div>

                  {/* Clean minimal preview link */}
                  {whatsappNumber && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] font-mono text-slate-400 overflow-hidden">
                      <span className="text-slate-500 shrink-0">wa.me:</span>
                      <span className="truncate text-slate-300 select-all">
                        {previewWhatsAppUrl}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                /* Standard URL input for other platforms */
                <>
                  {editingLink && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">Platform Name</label>
                      <input
                        type="text"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full h-8.5 rounded-lg border border-white/10 bg-[#141824] px-3 text-xs text-white focus:border-white/30 focus:outline-none transition"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">
                      Profile URL <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full h-8.5 rounded-lg border border-white/10 bg-[#141824] px-3 font-mono text-xs text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none transition"
                      required
                    />
                  </div>
                </>
              )}

              {/* Clean Inline Controls */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs select-none">
                  <AdminCheckbox
                    id="social_active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active on store</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Order:</span>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-12 h-7.5 rounded-lg border border-white/10 bg-[#141824] px-2 text-center text-xs text-white focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Clean Minimal Footer */}
            <div className="h-13 px-5 border-t border-white/[0.06] flex items-center justify-end gap-2 bg-[#0a0d14] shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || (isWhatsApp && !editingLink && hasExistingWhatsApp)}
                className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-slate-200 transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingLink ? "Save Changes" : "Connect"}</span>
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Minimal Delete Modal */}
      {deletingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f121a] border border-white/[0.12] rounded-xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Remove Channel</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove <span className="text-white font-medium">{deletingLink.platform}</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingLink(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
