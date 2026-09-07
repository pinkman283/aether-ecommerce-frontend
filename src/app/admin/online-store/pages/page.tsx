"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  Loader2, 
  Globe, 
  SlidersHorizontal, 
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { CmsPage } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminStatusBadge, AdminEmptyState } from "@/components/admin/ui";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function AdminOnlineStorePagesPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingPage, setDeletingPage] = useState<CmsPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCmsPages();
      setPages(data || []);
    } catch (err) {
      toast.error("Failed to load CMS pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenCreate = () => {
    setEditingPage(null);
    setTitle("");
    setSlug("");
    setContent("");
    setMetaTitle("");
    setMetaDescription("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (page: CmsPage) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setMetaTitle(page.meta_title || "");
    setMetaDescription(page.meta_description || "");
    setIsActive(page.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Page title is required.");
      return;
    }
    if (!content.trim()) {
      toast.error("Page content is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        content,
        meta_title: metaTitle.trim() || undefined,
        meta_description: metaDescription.trim() || undefined,
        is_active: isActive,
      };

      if (editingPage) {
        await adminApi.updateCmsPage(editingPage.id, payload);
        toast.success(`CMS Page "${title}" updated successfully.`);
      } else {
        await adminApi.createCmsPage(payload);
        toast.success(`CMS Page "${title}" created.`);
      }
      setIsModalOpen(false);
      fetchPages();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save CMS page.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (page: CmsPage) => {
    try {
      const res = await adminApi.toggleCmsPageStatus(page.id);
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, is_active: res.page.is_active } : p))
      );
      toast.success(res.message);
    } catch (err) {
      toast.error("Failed to toggle page status.");
    }
  };

  const handleDelete = async () => {
    if (!deletingPage) return;
    setDeleting(true);
    try {
      await adminApi.deleteCmsPage(deletingPage.id);
      toast.success(`Page "${deletingPage.title}" removed.`);
      setDeletingPage(null);
      fetchPages();
    } catch (err) {
      toast.error("Failed to delete page.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredPages = pages.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? p.is_active : !p.is_active);
    return matchSearch && matchStatus;
  });

  const activeCount = pages.filter((p) => p.is_active).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="CMS Pages & Legal Docs"
        description="Publish storefront static informational pages, legal policies, warranty terms, and FAQ documentation."
        badge="Online Store"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Online Store" },
          { label: "Pages" },
        ]}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Page</span>
          </button>
        }
      />

      {/* Stats Strip */}
      <AdminStatStrip
        columns={3}
        stats={[
          {
            label: "Total Static Pages",
            value: pages.length,
            icon: FileText,
            variant: "cyan",
            helper: "In storefront content registry",
          },
          {
            label: "Active & Published",
            value: activeCount,
            icon: Check,
            variant: "emerald",
            helper: "Publicly accessible URLs",
          },
          {
            label: "Drafts / Hidden",
            value: pages.length - activeCount,
            icon: AlertTriangle,
            variant: "amber",
            helper: "Awaiting legal or marketing review",
          },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0f121b] border border-white/[0.08]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search page titles or URLs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-[#161a26] border border-white/[0.08] px-2.5 py-1.5 rounded-lg text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#161a26] text-white">All Statuses</option>
              <option value="active" className="bg-[#161a26] text-white">Active Only</option>
              <option value="draft" className="bg-[#161a26] text-white">Draft Only</option>
            </select>
          </div>

          <button
            onClick={fetchPages}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-[#161a26] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Pages Table Card */}
      <div className="rounded-xl bg-[#0f121b] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <span className="text-xs uppercase tracking-wider font-semibold">Loading CMS pages...</span>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              title="No Pages Found"
              description="No static CMS pages matched your criteria. Create your first page."
              action={
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  + Create Page
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#161a26] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Page Title</th>
                  <th className="py-3 px-4">Storefront Path</th>
                  <th className="py-3 px-4">SEO Meta Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span>{page.title}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      <a
                        href={`/pages/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <span>/pages/{page.slug}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {page.meta_title || page.title}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(page)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <AdminStatusBadge
                          status={page.is_active ? "active" : "inactive"}
                          label={page.is_active ? "Active" : "Draft"}
                          size="sm"
                        />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                      {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : "—"}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(page)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                          title="Edit Page"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPage(page)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit CMS Page Slide-over Drawer */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:w-[600px] md:w-[640px] sm:!max-w-[640px] max-w-full bg-[#0b0e17] border-l border-white/[0.08] p-0 flex flex-col justify-between shadow-2xl text-slate-100 overflow-hidden"
        >
          <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
            {/* Compact Header: h-12 */}
            <div className="h-12 px-6 border-b border-white/[0.06] bg-[#0b0e17] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <SheetTitle className="text-xs font-semibold text-white tracking-wide shrink-0">
                  {editingPage ? "Edit CMS Page" : "New CMS Page"}
                </SheetTitle>
                {editingPage && (
                  <>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded shrink-0">
                      #{editingPage.id}
                    </span>
                    <span className="text-slate-600 text-xs shrink-0">·</span>
                    <span className="text-xs text-slate-400 truncate max-w-[220px]">
                      {editingPage.title}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Page Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shipping & Delivery Policy"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">URL Slug</label>
                  <input
                    type="text"
                    placeholder="shipping-delivery-policy"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs font-mono text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">SEO Meta Title</label>
                  <input
                    type="text"
                    placeholder="Meta Title (Optional)"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">SEO Meta Description</label>
                  <input
                    type="text"
                    placeholder="Short meta description for search engines..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-[#131722] px-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Page Content (Markdown / HTML) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={10}
                  placeholder="## Heading 2&#10;&#10;Policy terms, customer guidelines, or FAQ content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full font-mono rounded-lg border border-white/10 bg-[#131722] p-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition resize-none"
                  required
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="page_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-white/5 border-white/20 text-cyan-400 accent-cyan-400 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="page_active" className="text-xs text-slate-300 cursor-pointer select-none">
                  Published and publicly visible on storefront
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
                <span>{editingPage ? "Save Changes" : "Create Page"}</span>
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Modal */}
      {deletingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Page</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete{" "}
                <span className="text-white font-semibold">{deletingPage.title}</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingPage(null)}
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
