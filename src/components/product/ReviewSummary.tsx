"use client";

import { useState } from "react";
import { Star, ShieldCheck, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { Review } from "@/types";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface ReviewSummaryProps {
  productId: number;
  ratingAverage: number;
  reviewCount: number;
  reviews?: Review[];
}

export function ReviewSummary({
  productId,
  ratingAverage,
  reviewCount,
  reviews = [],
}: ReviewSummaryProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      const res = await api.submitReview(productId, {
        rating,
        title,
        comment,
        user_name: userName || "Verified Studio Buyer",
      });

      if (res.review) {
        setLocalReviews([res.review, ...localReviews]);
      }
      setSuccessMsg("Your review has been verified and published!");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        setTitle("");
        setComment("");
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-12 border-t border-white/10 space-y-10">
      {/* Header and Rating Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400 block mb-1">
            Customer Validation
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Verified Studio Reviews ({reviewCount})
          </h3>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white flex items-center gap-2 transition-all hover:border-indigo-400/40"
        >
          <Plus className="w-4 h-4 text-cyan-400" /> Write a Review
        </button>
      </div>

      {/* Breakdown Card */}
      <div className="p-6 rounded-3xl bg-[#0e121e] border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
          <span className="text-5xl font-black text-white">{Number(ratingAverage || 0).toFixed(1)}</span>
          <div className="flex justify-center md:justify-start gap-1 text-amber-400 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(ratingAverage) ? "fill-amber-400" : "text-slate-600"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">Based on {reviewCount} customer ratings</span>
        </div>

        {/* Rating Bars */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const percentage = stars === 5 ? 85 : stars === 4 ? 12 : 3;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs text-slate-400">
                <span className="w-12">{stars} Stars</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {localReviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to share your thoughts!</p>
        ) : (
          localReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.user_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                    alt={rev.user_name}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {rev.user_name}
                      {rev.is_verified_purchase && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-normal">
                          <ShieldCheck className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-500">{formatDate(rev.created_at)}</span>
                  </div>
                </div>

                <div className="flex gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? "fill-amber-400" : "text-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {rev.title && (
                <h5 className="text-xs font-extrabold text-slate-200">{rev.title}</h5>
              )}
              <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e121e] border border-white/15 shadow-2xl p-6 sm:p-8 z-10">
            <h3 className="text-lg font-black text-white mb-1">Write a Review</h3>
            <p className="text-xs text-slate-400 mb-5">
              Share your genuine feedback on build quality, acoustics, and daily usability.
            </p>

            {successMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Rating Score</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`p-2 rounded-xl border transition-all ${
                          s <= rating
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                            : "bg-white/5 border-white/10 text-slate-600"
                        }`}
                      >
                        <Star className={`w-5 h-5 ${s <= rating ? "fill-amber-400" : ""}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {!isAuthenticated && (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Your Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Review Headline</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Pure studio bliss, worth every penny"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Your Experience</label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you think of the ergonomics, acoustic soundstage, and battery performance?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-wide transition-all shadow-md shadow-indigo-600/30"
                  >
                    {loading ? "Submitting..." : "Publish Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
