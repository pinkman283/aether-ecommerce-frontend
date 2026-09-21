import React from "react";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

interface ContentPageLayoutProps {
  badge?: string; // Kept optional for backward compatibility if passed
  title: string;
  description?: string;
  lastUpdated?: string;
  children: React.ReactNode;
  activeSlug?: string; // Kept optional for backward compatibility
}

export function ContentPageLayout({
  title,
  description,
  lastUpdated,
  children,
}: ContentPageLayoutProps) {
  return (
    <div
      className="min-h-[70vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200"
      style={{ backgroundColor: "var(--theme-bg, transparent)" }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Minimal Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "var(--theme-text-body, #64748b)" }}
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:opacity-80 transition-opacity">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span
            className="font-medium"
            style={{ color: "var(--theme-text-heading, #0f172a)" }}
          >
            {title}
          </span>
        </nav>

        {/* Minimal Clean Header */}
        <header
          className="space-y-2 pb-6 border-b transition-colors"
          style={{ borderColor: "var(--theme-card-border, #e2e8f0)" }}
        >
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: "var(--theme-text-heading, #0f172a)" }}
          >
            {title}
          </h1>

          {description && (
            <p
              className="text-sm leading-relaxed max-w-2xl"
              style={{ color: "var(--theme-text-body, #475569)" }}
            >
              {description}
            </p>
          )}

          {lastUpdated && (
            <div
              className="flex items-center gap-1.5 text-xs pt-1 opacity-70"
              style={{ color: "var(--theme-text-body, #64748b)" }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Effective: {lastUpdated}</span>
            </div>
          )}
        </header>

        {/* Content Area */}
        <main>{children}</main>
      </div>
    </div>
  );
}
