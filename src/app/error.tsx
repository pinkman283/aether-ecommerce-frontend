"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, MessageSquare } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
    console.error("Segment Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        
        {/* Visual Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
            Operational Disruption
          </span>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: "var(--theme-text-heading, #ffffff)" }}
          >
            Something Went Off Track
          </h1>
          <p
            className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: "var(--theme-text-body, #94a3b8)" }}
          >
            We encountered an unexpected condition while rendering this studio section. Our engineering monitors have logged this event.
          </p>
        </div>

        {/* Recovery CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </div>

        {/* Diagnostic collapse or Contact link */}
        <div className="pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-center gap-4">
          <span>Need immediate assistance?</span>
          <Link href="/contact" className="text-cyan-400 hover:underline font-bold flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
}
