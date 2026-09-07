"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  X, 
  AlertTriangle,
  RefreshCw,
  Hash
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { BlogTag } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminEmptyState } from "@/components/admin/ui";
import { toast } from "sonner";

export default function AdminBlogTagsPage() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingTag, setDeletingTag] = useState<BlogTag | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBlogTags();
      setTags(data || []);
    } catch (err) {
      toast.error("Failed to load blog tags.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleOpenCreate = () => {
    setEditingTag(null);
    setName("");
    setSlug("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tag: BlogTag) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tag name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingTag) {
        await adminApi.updateBlogTag(editingTag.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
        });
        toast.success(`Tag "#${name}" updated.`);
      } else {
        await adminApi.createBlogTag({
          name: name.trim(),
          slug: slug.trim() || undefined,
        });
        toast.success(`Tag "#${name}" created.`);
      }
      setIsModalOpen(false);
      fetchTags();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save tag.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTag) return;
    setDeleting(true);
    try {
      await adminApi.deleteBlogTag(deletingTag.id);
      toast.success(`Tag "#${deletingTag.name}" deleted.`);
      setDeletingTag(null);
      fetchTags();
    } catch (err) {
      toast.error("Failed to delete tag.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Article Tags"
        description="Keyword labels and topical tags to interconnect articles and guide reader discovery."
        badge="Taxonomy"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: "Tags" },
        ]}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tag</span>
          </button>
        }
      />

      {/* Stats Strip */}
      <AdminStatStrip
        columns={3}
        stats={[
          {
            label: "Total Tags",
            value: tags.length,
            icon: Tag,
            variant: "cyan",
            helper: "Active vocabulary tags",
          },
          {
            label: "Tagged Relationships",
            value: tags.reduce((sum, t) => sum + (t.posts_count || 0), 0),
            icon: Hash,
            variant: "emerald",
            helper: "Total post-to-tag links",
          },
          {
            label: "Filtered Tags",
            value: filteredTags.length,
            icon: Search,
            variant: "default",
            helper: "Matching search query",
          },
        ]}
      />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0f121b] border border-white/[0.08]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
          />
        </div>

        <button
          onClick={fetchTags}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white bg-[#161a26] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
        </button>
      </div>

      {/* Tags Cards / Table */}
      <div className="rounded-xl bg-[#0f121b] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <span className="text-xs uppercase tracking-wider font-semibold">Loading tags...</span>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              title="No Tags Found"
              description={search ? "No tags matched your query." : "Create your first article keyword tag."}
              action={
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  + Add Tag
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#161a26] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Tag</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Articles Count</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredTags.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Tag className="w-3 h-3" />
                        </div>
                        <span className="font-mono text-emerald-400">#{t.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      /{t.slug}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      <span className="bg-white/[0.05] text-slate-300 px-2 py-0.5 rounded border border-white/[0.08]">
                        {t.posts_count ?? 0} articles
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTag(t)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                  <Tag className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingTag ? "Edit Tag" : "Add Tag"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Tag Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Audiophile, GasketMount"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-400/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Slug</label>
                <input
                  type="text"
                  placeholder="audiophile"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-400/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white bg-transparent hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTag ? "Update Tag" : "Create Tag"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Tag</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete <span className="text-white font-semibold">#{deletingTag.name}</span>? Articles with this tag will not be deleted.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingTag(null)}
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
