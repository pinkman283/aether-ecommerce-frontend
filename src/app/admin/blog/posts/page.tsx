"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Filter, 
  SlidersHorizontal, 
  Calendar, 
  User, 
  Tag, 
  FolderTree, 
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { BlogPost, BlogCategory, BlogTag } from "@/types";
import { AdminPageHeader, AdminStatusBadge, AdminEmptyState, AdminPagination } from "@/components/admin/ui";
import { ImageUploadGuidance } from "@/components/admin/ui/ImageUploadGuidance";
import { toast } from "sonner";

export default function AdminBlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formSelectedTags, setFormSelectedTags] = useState<number[]>([]);
  const [formStatus, setFormStatus] = useState<"published" | "draft" | "archived">("draft");
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTaxonomies = async () => {
    try {
      const [cats, tgs] = await Promise.all([
        adminApi.getBlogCategories(),
        adminApi.getBlogTags(),
      ]);
      setCategories(cats || []);
      setTags(tgs || []);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBlogPosts({
        page: currentPage,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category_id: categoryFilter !== "all" ? Number(categoryFilter) : undefined,
      });
      setPosts(res.data || []);
      setTotalPages(res.last_page || 1);
      setTotalItems(res.total || 0);
    } catch (err) {
      toast.error("Failed to load blog articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, search, statusFilter, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormSlug("");
    setFormExcerpt("");
    setFormContent("");
    setFormImage("");
    setFormCategoryId(categories[0]?.id ? String(categories[0].id) : "");
    setFormSelectedTags([]);
    setFormStatus("draft");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormExcerpt(post.excerpt || "");
    setFormContent(post.content);
    setFormImage(post.featured_image || "");
    setFormCategoryId(post.category_id ? String(post.category_id) : "");
    setFormSelectedTags(post.tags?.map((t) => t.id) || []);
    setFormStatus(post.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Article title is required.");
      return;
    }
    if (!formContent.trim()) {
      toast.error("Article content is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        excerpt: formExcerpt.trim() || undefined,
        content: formContent,
        featured_image: formImage.trim() || undefined,
        category_id: formCategoryId ? Number(formCategoryId) : null,
        status: formStatus,
        tag_ids: formSelectedTags,
      };

      if (editingPost) {
        await adminApi.updateBlogPost(editingPost.id, payload);
        toast.success(`Article "${formTitle}" updated successfully.`);
      } else {
        await adminApi.createBlogPost(payload);
        toast.success(`Article "${formTitle}" published/saved.`);
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save article.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    try {
      const res = await adminApi.toggleBlogPostStatus(post.id);
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: res.post.status } : p))
      );
      toast.success(res.message);
    } catch (err) {
      toast.error("Failed to toggle status.");
    }
  };

  const handleDelete = async () => {
    if (!deletingPost) return;
    setDeleting(true);
    try {
      await adminApi.deleteBlogPost(deletingPost.id);
      toast.success(`Article "${deletingPost.title}" deleted.`);
      setDeletingPost(null);
      fetchPosts();
    } catch (err) {
      toast.error("Failed to delete article.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleTagSelection = (tagId: number) => {
    setFormSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Article Management"
        description="Write and publish hardware teardowns, acoustic laboratory findings, and news updates."
        badge="Editorial"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: "Articles" },
        ]}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write Article</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0f121b] border border-white/[0.08]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search article titles or excerpts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-[#161a26] border border-white/[0.08] px-2.5 py-1.5 rounded-lg text-xs text-slate-300">
            <FolderTree className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#161a26] text-white">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#161a26] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#161a26] border border-white/[0.08] px-2.5 py-1.5 rounded-lg text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#161a26] text-white">All Statuses</option>
              <option value="published" className="bg-[#161a26] text-white">Published</option>
              <option value="draft" className="bg-[#161a26] text-white">Drafts</option>
              <option value="archived" className="bg-[#161a26] text-white">Archived</option>
            </select>
          </div>

          <button
            onClick={fetchPosts}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-[#161a26] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Articles Table Card */}
      <div className="rounded-xl bg-[#0f121b] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <span className="text-xs uppercase tracking-wider font-semibold">Loading articles...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              title="No Articles Found"
              description="No blog articles match your active search filters or status requirements."
              action={
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  + Write New Article
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#161a26] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Comments</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Title and Thumbnail */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-white hover:text-amber-400 transition-colors block truncate">
                            {post.title}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 block truncate">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {post.category ? (
                        <span className="text-[11px] font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Uncategorized</span>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.slice(0, 3).map((t) => (
                            <span
                              key={t.id}
                              className="text-[10px] bg-white/[0.04] text-slate-400 px-1.5 py-0.5 rounded border border-white/[0.06]"
                            >
                              #{t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                        {post.tags && post.tags.length > 3 && (
                          <span className="text-[10px] text-slate-500">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{post.author?.name || "Team"}</span>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>{post.views_count.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Comments */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        <span>{post.comments_count ?? 0}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className="cursor-pointer"
                        title="Click to toggle publish/draft"
                      >
                        <AdminStatusBadge
                          status={post.status}
                          label={post.status.toUpperCase()}
                          size="sm"
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPost(post)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Article"
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

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-white/[0.08]">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={15}
            />
          </div>
        )}
      </div>

      {/* Create / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0f121b] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingPost ? "Edit Article" : "Write New Article"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Article Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inside the Acoustic Chamber..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">URL Slug</label>
                  <input
                    type="text"
                    placeholder="inside-the-acoustic-chamber"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Summary / Excerpt</label>
                <textarea
                  rows={2}
                  placeholder="Short introductory teaser displayed on cards and search meta..."
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
                />
              </div>

              {/* Content Markdown */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Article Body (Markdown Supported) <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10.5px] text-slate-500">Supports headers, code blocks, lists</span>
                </div>
                <textarea
                  rows={9}
                  placeholder="## Heading 2&#10;&#10;Detailed article narrative, teardown notes, or engineering journal..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full font-mono px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
                  required
                />
              </div>

              {/* Category, Status & Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white focus:outline-hidden focus:border-amber-400/50 cursor-pointer"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Publication Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white focus:outline-hidden focus:border-amber-400/50 cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Featured Image URL</label>
                    <ImageUploadGuidance slotKey="admin_blog_featured" imageUrl={formImage} layout="inline" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
                  />
                </div>
              </div>

              {/* Tags Multi-select */}
              {tags.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-300">Article Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => {
                      const isSelected = formSelectedTags.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTagSelection(t.id)}
                          className={`px-2 py-1 text-[11px] rounded-md border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-amber-400/10 border-amber-400/30 text-amber-300 font-semibold"
                              : "bg-[#161a26] border-white/[0.08] text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          #{t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
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
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPost ? "Update Article" : "Publish Article"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Article</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete{" "}
                <span className="text-white font-semibold">{deletingPost.title}</span>? All associated comments will also be permanently purged.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingPost(null)}
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
