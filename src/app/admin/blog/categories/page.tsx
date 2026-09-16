"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FolderTree, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  Loader2, 
  X, 
  AlertTriangle,
  RefreshCw,
  Hash
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { BlogCategory } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminEmptyState } from "@/components/admin/ui";
import { toast } from "sonner";

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState<BlogCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBlogCategories();
      setCategories(data || []);
    } catch (err) {
      toast.error("Failed to load blog categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setMetaTitle("");
    setMetaDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setMetaTitle(cat.meta_title || "");
    setMetaDescription(cat.meta_description || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await adminApi.updateBlogCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
        });
        toast.success(`Category "${name}" updated.`);
      } else {
        await adminApi.createBlogCategory({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
        });
        toast.success(`Category "${name}" created.`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save category.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await adminApi.deleteBlogCategory(deletingCategory.id);
      toast.success(`Category "${deletingCategory.name}" removed.`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalArticles = categories.reduce((sum, c) => sum + (c.posts_count || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Blog Categories"
        description="Organize articles by engineering disciplines, acoustics journals, and setup guides."
        badge="Taxonomy"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: "Categories" },
        ]}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        }
      />

      {/* Stats Strip */}
      <AdminStatStrip
        columns={3}
        stats={[
          {
            label: "Total Categories",
            value: categories.length,
            icon: FolderTree,
            variant: "cyan",
            helper: "Active topic divisions",
          },
          {
            label: "Tagged Articles",
            value: totalArticles,
            icon: FileText,
            variant: "emerald",
            helper: "Articles categorized",
          },
          {
            label: "Avg Articles / Category",
            value: categories.length > 0 ? (totalArticles / categories.length).toFixed(1) : 0,
            icon: Hash,
            variant: "purple",
            helper: "Content distribution balance",
          },
        ]}
      />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0f121b] border border-white/[0.08]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
          />
        </div>

        <button
          onClick={fetchCategories}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white bg-[#161a26] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
        </button>
      </div>

      {/* Categories Table Card */}
      <div className="rounded-xl bg-[#0f121b] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <span className="text-xs uppercase tracking-wider font-semibold">Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              title="No Categories Found"
              description={search ? "No categories matched your search term." : "Create your first blog category."}
              action={
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  + Add Category
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#161a26] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Articles Count</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <FolderTree className="w-3.5 h-3.5" />
                        </div>
                        <span>{cat.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      /{cat.slug}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-md">
                      <span className="line-clamp-1">{cat.description || "—"}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                      <span className="bg-white/[0.05] text-slate-300 px-2 py-0.5 rounded border border-white/[0.08]">
                        {cat.posts_count ?? 0} articles
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#0f121b] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                  <FolderTree className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ergonomics & Desk Tech"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">URL Slug</label>
                <input
                  type="text"
                  placeholder="ergonomics-desk-tech"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the subject area..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400/50"
                />
              </div>

              {/* SEO Configuration */}
              <div className="pt-4 mt-4 border-t border-white/[0.08] space-y-4">
                <h4 className="text-[13px] font-medium text-white flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  Search Engine Optimization
                </h4>
                <p className="text-xs text-slate-400">
                  Leave blank to automatically use the category name and description as fallbacks.
                </p>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Custom SEO title..."
                    className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Meta Description</label>
                  <textarea
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Custom SEO description..."
                    className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400/50 resize-y leading-relaxed"
                  />
                </div>
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
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Category</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete{" "}
                <span className="text-white font-semibold">{deletingCategory.name}</span>? Articles in this category will become Uncategorized.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
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
