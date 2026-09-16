"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CmsPage } from "@/types";
import { formatDate } from "@/lib/utils";
import { FileText, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

interface PublicCmsPageClientProps {
  slug: string;
}

export default function PublicCmsPageClient({ slug }: PublicCmsPageClientProps) {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function loadPage() {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await api.getPage(slug);
        setPage(data);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-slate-500 min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005826] dark:text-amber-400 animate-spin" />
        <span className="text-xs uppercase tracking-wider font-semibold">Loading content...</span>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Page Not Found</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md">
          The requested page <span className="font-mono text-xs">"{slug}"</span> could not be found or has been unpublished.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#005826] dark:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs transition hover:opacity-90 mt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
        <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{page.title}</span>
      </div>

      {/* Page Title & Metadata */}
      <header className="pb-6 border-b border-gray-200 dark:border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-[#005826] dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Store Information</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          {page.title}
        </h1>
        {page.updated_at && (
          <p className="text-xs text-gray-500 dark:text-slate-500 font-mono">
            Last updated: {formatDate(page.updated_at)}
          </p>
        )}
      </header>

      {/* Page Content */}
      <div 
        className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-gray-700 dark:text-slate-300 space-y-4"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  );
}
