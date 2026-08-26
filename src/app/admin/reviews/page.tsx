"use client";

import { useState, useEffect } from "react";
import { 
  Star, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Sparkles,
  MessageSquare,
  Eye,
  X,
  Package,
  User as UserIcon,
  Calendar,
  Check,
  RotateCcw
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { formatDate } from "@/lib/utils";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { toast } from "sonner";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [viewingReview, setViewingReview] = useState<any | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReviews({
        search: search.trim() || undefined,
        status: statusFilter,
        per_page: 50,
      });
      setReviews(res.data || []);
    } catch (err) {
      toast.error("Failed to load customer reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadReviews();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    adminApi.getReviews({ per_page: 50 }).then((res) => {
      setReviews(res.data || []);
    });
    toast.success("Review filters reset to default.");
  };

  const handleToggleApproval = async (id: number) => {
    try {
      const res = await adminApi.toggleReviewApproval(id);
      setReviews(reviews.map((r) => (r.id === id ? { ...r, is_approved: res.review.is_approved } : r)));
      if (viewingReview && viewingReview.id === id) {
        setViewingReview({ ...viewingReview, is_approved: res.review.is_approved });
      }
      toast.success(res.message);
    } catch (err) {
      toast.error("Failed to moderate review.");
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      await adminApi.deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
      if (viewingReview && viewingReview.id === id) {
        setViewingReview(null);
      }
      toast.success("Review removed.");
    } catch (err) {
      toast.error("Failed to delete review.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Community & Reputation
          </span>
          <h1 className="text-2xl font-black text-white">Review Moderation Queue ({reviews.length})</h1>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search review comments, titles, or author..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "all" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "approved" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Live on Store
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "pending" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Hidden / Moderation
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            title="Reset all review filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Reviews Table with Drag Scrolling */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[760px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Target Hardware</th>
              <th className="p-3.5">Reviewer</th>
              <th className="p-3.5">Rating</th>
              <th className="p-3.5">Review Snippet</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-center min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Loading customer feedback...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No reviews in the moderation queue.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 font-bold text-white max-w-[160px] truncate">
                    {r.product?.name || "Acoustic Gear"}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-bold text-white block">{r.user_name}</span>
                    {r.is_verified_purchase && (
                      <span className="text-[10px] text-cyan-400 font-medium">Verified Buyer</span>
                    )}
                  </td>
                  <td className="p-3.5 font-black text-amber-400 whitespace-nowrap">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </td>
                  <td className="p-3.5 max-w-sm">
                    <span className="font-bold text-white block truncate">{r.title}</span>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.is_approved
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    }`}>
                      {r.is_approved ? "Live on Store" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{formatDate(r.created_at)}</td>
                  
                  {/* ICON-ONLY ACTION SYSTEM */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-start gap-1.5 flex-wrap w-[146px] mx-auto">
                      <button
                        onClick={() => setViewingReview(r)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all shadow-sm"
                        title="View Full Review Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleApproval(r.id)}
                        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border hover:scale-105 transition-all shadow-sm ${
                          r.is_approved
                            ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30"
                        }`}
                        title={r.is_approved ? "Hide Review from Store" : "Approve Review"}
                      >
                        {r.is_approved ? (
                          <XCircle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all shadow-sm"
                        title="Delete Spam Review"
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

      {/* View Review Modal */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setViewingReview(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c0e15] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 z-10 space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Customer Review Inspection</h3>
                  <span className="text-[10px] text-slate-400">ID #{viewingReview.id} • Posted {formatDate(viewingReview.created_at)}</span>
                </div>
              </div>
              <button onClick={() => setViewingReview(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Product Info */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Product</span>
                  <span className="text-xs font-black text-white">{viewingReview.product?.name || "Audio Hardware"}</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                viewingReview.is_approved
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}>
                {viewingReview.is_approved ? "Live on Store" : "Hidden"}
              </span>
            </div>

            {/* Author & Rating Banner */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Reviewer</span>
                <span className="text-xs font-bold text-white block">{viewingReview.user_name}</span>
                {viewingReview.is_verified_purchase && (
                  <span className="text-[10px] text-cyan-400 font-bold block flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Rating Score</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= viewingReview.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
                      />
                    ))}
                  </div>
                  <span className="font-mono font-bold text-white text-xs">{viewingReview.rating}.0 / 5.0</span>
                </div>
              </div>
            </div>

            {/* Review Title & Full Body */}
            <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-sm font-black text-white block">{viewingReview.title || "No Title Provided"}</span>
              <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                {viewingReview.comment || "No written review feedback provided."}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <button
                onClick={() => handleDeleteReview(viewingReview.id)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Review</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingReview(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => handleToggleApproval(viewingReview.id)}
                  className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wide flex items-center gap-1.5 transition-all shadow-md ${
                    viewingReview.is_approved
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  }`}
                >
                  {viewingReview.is_approved ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Hide Review</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
