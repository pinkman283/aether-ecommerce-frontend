"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  Mail,
  User,
  ExternalLink,
  SlidersHorizontal,
  FileText
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { BlogComment } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminStatusBadge, AdminEmptyState, AdminPagination } from "@/components/admin/ui";
import { toast } from "sonner";

export default function AdminBlogCommentsPage() {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete State
  const [deletingComment, setDeletingComment] = useState<BlogComment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBlogComments({
        page: currentPage,
        search: search || undefined,
        is_approved: approvalFilter === "all" ? undefined : approvalFilter === "approved",
      });
      setComments(res.data || []);
      setTotalPages(res.last_page || 1);
      setTotalItems(res.total || 0);
    } catch (err) {
      toast.error("Failed to load blog comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentPage, search, approvalFilter]);

  const handleToggleApproval = async (comment: BlogComment) => {
    try {
      const res = await adminApi.toggleBlogCommentApproval(comment.id);
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id ? { ...c, is_approved: res.comment.is_approved } : c
        )
      );
      toast.success(res.message);
    } catch (err) {
      toast.error("Failed to update approval status.");
    }
  };

  const handleDelete = async () => {
    if (!deletingComment) return;
    setDeleting(true);
    try {
      await adminApi.deleteBlogComment(deletingComment.id);
      toast.success("Comment deleted successfully.");
      setDeletingComment(null);
      fetchComments();
    } catch (err) {
      toast.error("Failed to delete comment.");
    } finally {
      setDeleting(false);
    }
  };

  const approvedCount = comments.filter((c) => c.is_approved).length;
  const pendingCount = comments.filter((c) => !c.is_approved).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Comment Moderation Queue"
        description="Review reader feedback, approve comments for public display, and filter spam."
        badge="Moderation"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: "Comments" },
        ]}
      />

      {/* Stats Strip */}
      <AdminStatStrip
        columns={3}
        stats={[
          {
            label: "Total Comments",
            value: totalItems,
            icon: MessageSquare,
            variant: "cyan",
            helper: "Across all articles",
          },
          {
            label: "Pending Moderation",
            value: pendingCount,
            icon: Clock,
            variant: pendingCount > 0 ? "amber" : "default",
            helper: "Awaiting staff review",
          },
          {
            label: "Approved & Live",
            value: approvedCount,
            icon: CheckCircle2,
            variant: "emerald",
            helper: "Visible on storefront blog",
          },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0f121b] border border-white/[0.08]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search comment body, author, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#161a26] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-[#161a26] border border-white/[0.08] px-2.5 py-1.5 rounded-lg text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={approvalFilter}
              onChange={(e) => {
                setApprovalFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#161a26] text-white">All Moderation Status</option>
              <option value="approved" className="bg-[#161a26] text-white">Approved Only</option>
              <option value="pending" className="bg-[#161a26] text-white">Pending Approval</option>
            </select>
          </div>

          <button
            onClick={fetchComments}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-[#161a26] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Comments List Card */}
      <div className="rounded-xl bg-[#0f121b] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <span className="text-xs uppercase tracking-wider font-semibold">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              title="No Comments In Queue"
              description="There are currently no reader comments matching your filters."
            />
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 hover:bg-white/[0.015] transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 max-w-3xl">
                  {/* Author metadata & Article Link */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{comment.author_name}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{comment.author_email}</span>
                    </div>

                    {comment.post && (
                      <span className="text-[11px] text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        <FileText className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{comment.post.title}</span>
                      </span>
                    )}

                    {comment.created_at && (
                      <span className="text-[10px] text-slate-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#161a26] p-3 rounded-lg border border-white/[0.06]">
                    {comment.comment}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      comment.is_approved
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {comment.is_approved ? "Approved" : "Pending"}
                  </span>

                  <button
                    onClick={() => handleToggleApproval(comment)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                      comment.is_approved
                        ? "bg-[#161a26] border-white/[0.08] text-slate-300 hover:text-white"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {comment.is_approved ? "Unapprove" : "Approve"}
                  </button>

                  <button
                    onClick={() => setDeletingComment(comment)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
              itemsPerPage={20}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deletingComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f121b] border border-white/[0.12] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Delete Comment</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove this comment from{" "}
                <span className="text-white font-semibold">{deletingComment.author_name}</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingComment(null)}
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
