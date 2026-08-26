"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FolderTree, 
  Plus, 
  Search,
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Sparkles,
  Layers,
  Check,
  X,
  RotateCcw,
  ExternalLink
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Category } from "@/types";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // View Category Modal State
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [icon, setIcon] = useState("Sparkles");
  const [badge, setBadge] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isFeatured, setIsFeatured] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      setCategories(data || []);
    } catch (err) {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImage("https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80");
    setIcon("Headphones");
    setBadge("Flagship Line");
    setDisplayOrder("0");
    setIsFeatured(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || "");
    setImage(c.image || "");
    setIcon(c.icon || "Sparkles");
    setBadge(c.badge || "");
    setDisplayOrder((c.display_order ?? 0).toString());
    setIsFeatured(c.is_featured ?? false);
    setIsModalOpen(true);
  };

  const isEditDirty = Boolean(
    editingCategory && (
      name.trim() !== (editingCategory.name || "").trim() ||
      description.trim() !== (editingCategory.description || "").trim() ||
      image.trim() !== (editingCategory.image || "").trim() ||
      icon.trim() !== (editingCategory.icon || "Sparkles").trim() ||
      badge.trim() !== (editingCategory.badge || "").trim() ||
      displayOrder !== (editingCategory.display_order ?? 0).toString() ||
      isFeatured !== (editingCategory.is_featured ?? false)
    )
  );

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && !isEditDirty) {
      toast.info("No changes were made.");
      return;
    }
    setSaving(true);

    const payload = {
      name,
      description,
      image,
      icon,
      badge: badge || null,
      display_order: Number(displayOrder),
      is_featured: isFeatured,
    };

    try {
      if (editingCategory) {
        const res = await adminApi.updateCategory(editingCategory.id, payload);
        setCategories(categories.map((c) => (c.id === editingCategory.id ? res.category : c)));
        toast.success(`Category '${res.category.name}' updated.`);
      } else {
        const res = await adminApi.createCategory(payload);
        setCategories([...categories, res.category]);
        toast.success(`Category '${res.category.name}' created.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setDeleting(true);

    try {
      await adminApi.deleteCategory(deletingCategory.id);
      setCategories(categories.filter((c) => c.id !== deletingCategory.id));
      toast.success(`Category '${deletingCategory.name}' removed.`);
      setDeletingCategory(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query)) ||
      (c.badge && c.badge.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Taxonomy & Navigation
          </span>
          <h1 className="text-2xl font-black text-white">Categories ({filteredCategories.length})</h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category name, slug, or badge..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            toast.success("Category search reset.");
          }}
          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
          title="Reset category search"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Categories Table with Scrollable Dragging Card */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Slug</th>
              <th className="p-3.5">Badge</th>
              <th className="p-3.5">Products Linked</th>
              <th className="p-3.5">Order</th>
              <th className="p-3.5 text-center min-w-[160px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Loading categories...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                  {search ? "No categories matched your search criteria." : "No categories created yet."}
                </td>
              </tr>
            ) : (
              filteredCategories.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 flex items-center gap-3 font-bold text-white">
                    {c.image && (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0"
                      />
                    )}
                    <div>
                      <span className="text-white font-bold block">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal line-clamp-1">{c.description}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400 text-[11px] whitespace-nowrap">{c.slug}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    {c.badge ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {c.badge}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                      {c.products_count ?? 0} products
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{c.display_order ?? 0}</td>
                  
                  {/* ICON-ONLY ACTION SYSTEM (UP TO 4 PER ROW) */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-start gap-1.5 flex-wrap w-[146px] mx-auto">
                      <button
                        onClick={() => setViewingCategory(c)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all shadow-sm"
                        title="View Category Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-105 transition-all shadow-sm"
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(c)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all shadow-sm"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollableTableCard>

      {/* View Category Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setViewingCategory(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e121e] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                  Taxonomy Details
                </span>
                <h3 className="text-lg font-black text-white">{viewingCategory.name}</h3>
              </div>
              <button onClick={() => setViewingCategory(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewingCategory.image && (
              <img
                src={viewingCategory.image}
                alt={viewingCategory.name}
                className="w-full h-40 rounded-2xl object-cover bg-slate-900 border border-white/10"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Slug Identifier</span>
                <p className="text-cyan-400 font-mono font-bold">{viewingCategory.slug}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Linked Products</span>
                <p className="text-white font-bold">{viewingCategory.products_count ?? 0} hardware items</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">{viewingCategory.description || "No description provided."}</p>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <Link
                href={`/products?category=${viewingCategory.slug}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
              >
                <span>View on Storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </Link>

              <button
                onClick={() => {
                  setViewingCategory(null);
                  handleOpenEdit(viewingCategory);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-md"
              >
                Edit Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e121e] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 space-y-4">
            <h3 className="text-lg font-black text-white">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smart Living & Acoustics"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Flagship"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (editingCategory ? !isEditDirty : false)}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all shadow-md ${
                    editingCategory && !isEditDirty
                      ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                  title={editingCategory && !isEditDirty ? "No changes made to category details" : undefined}
                >
                  {saving ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeletingCategory(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0e121e] border border-rose-500/30 p-6 z-10 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Delete Category</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-white">{deletingCategory.name}</span>?
              {deletingCategory.products_count && deletingCategory.products_count > 0 ? (
                <span className="block mt-2 text-rose-400 font-bold">
                  ⚠️ Notice: This category contains {deletingCategory.products_count} linked products and cannot be deleted until those products are reassigned.
                </span>
              ) : null}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting || Boolean(deletingCategory.products_count && deletingCategory.products_count > 0)}
                onClick={handleDeleteCategory}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30 disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
