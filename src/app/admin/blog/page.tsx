"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  FileText, 
  FolderTree, 
  Tag, 
  MessageSquare, 
  Eye, 
  Plus, 
  TrendingUp, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { BlogSummary } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminStatusBadge } from "@/components/admin/ui";
import { toast } from "sonner";

export default function AdminBlogDashboardPage() {
  const [summary, setSummary] = useState<BlogSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBlogSummary();
      setSummary(data);
    } catch (err) {
      toast.error("Failed to load blog analytics summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading || !summary) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="text-xs uppercase tracking-wider font-semibold">Loading blog intelligence...</span>
      </div>
    );
  }

  const { metrics, recent_posts } = summary;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Editorial & Blog Center"
        description="Publish hardware engineering logs, product spotlights, acoustic teardowns, and manage reader comments."
        badge="Content CMS"
        badgeVariant="cyan"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog & Editorial" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/blog/posts"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Write Article</span>
            </Link>
          </div>
        }
      />

      {/* Primary Metrics Strip */}
      <AdminStatStrip
        columns={4}
        stats={[
          {
            label: "Total Articles",
            value: metrics.total_posts,
            icon: FileText,
            variant: "cyan",
            helper: `${metrics.published_posts} published, ${metrics.draft_posts} drafts`,
          },
          {
            label: "Total Article Views",
            value: metrics.total_views.toLocaleString(),
            icon: Eye,
            variant: "emerald",
            helper: "Across all published articles",
          },
          {
            label: "Reader Comments",
            value: metrics.total_comments,
            icon: MessageSquare,
            variant: "purple",
            helper: `${metrics.pending_comments} pending moderation`,
          },
          {
            label: "Taxonomy & Tags",
            value: `${metrics.total_categories} / ${metrics.total_tags}`,
            icon: FolderTree,
            variant: "amber",
            helper: "Categories / Active Tags",
          },
        ]}
      />

      {/* Fast Navigation Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link
          href="/admin/blog/posts"
          className="group p-4 rounded-xl bg-[#0f121b] border border-white/[0.08] hover:border-amber-400/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                All Articles
              </h3>
              <p className="text-[11px] text-slate-400">Manage, edit & publish</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/blog/categories"
          className="group p-4 rounded-xl bg-[#0f121b] border border-white/[0.08] hover:border-cyan-400/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                Categories
              </h3>
              <p className="text-[11px] text-slate-400">{metrics.total_categories} topic sections</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/blog/tags"
          className="group p-4 rounded-xl bg-[#0f121b] border border-white/[0.08] hover:border-emerald-400/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Article Tags
              </h3>
              <p className="text-[11px] text-slate-400">{metrics.total_tags} keyword index</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/blog/comments"
          className="group p-4 rounded-xl bg-[#0f121b] border border-white/[0.08] hover:border-purple-400/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-400/10 border border-purple-400/20 text-purple-400 flex items-center justify-center relative">
              <MessageSquare className="w-5 h-5" />
              {metrics.pending_comments > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {metrics.pending_comments}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                Comments Queue
              </h3>
              <p className="text-[11px] text-slate-400">
                {metrics.pending_comments > 0
                  ? `${metrics.pending_comments} pending approval`
                  : "All clear"}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Recent Articles Section */}
      <div className="rounded-xl bg-[#0f121b] border border-white/[0.08] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Recent Articles</h2>
          </div>
          <Link
            href="/admin/blog/posts"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_posts.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No articles written yet.</p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recent_posts.map((post) => (
              <div
                key={post.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <h3 className="text-xs font-bold text-white truncate hover:text-amber-400 transition-colors">
                      <Link href={`/admin/blog/posts?edit=${post.id}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {post.excerpt || "No summary provided."}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                      {post.category && (
                        <span className="text-cyan-400 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          {post.category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author?.name || "Aether Team"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views_count.toLocaleString()} views
                      </span>
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 sm:self-center">
                  <AdminStatusBadge
                    status={post.status}
                    label={post.status.toUpperCase()}
                    size="sm"
                  />
                  <Link
                    href={`/admin/blog/posts?edit=${post.id}`}
                    className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#161a26] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
