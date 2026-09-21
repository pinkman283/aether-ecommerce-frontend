"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Headphones, CheckCircle2, ArrowRight } from "lucide-react";
import { useAppTheme } from "@/components/providers/ThemeProvider";
import { ContentPageLayout } from "@/components/shared/ContentPageLayout";
import { CmsPage } from "@/types";

export default function AboutClient() {
  const { theme } = useAppTheme();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);

  const brandName = theme.store_brand_name || "Inheliq";
  const brandTagline = theme.store_brand_tagline || "Elevate every inhale";

  useEffect(() => {
    let isMounted = true;

    async function loadCmsPage() {
      try {
        let res = await fetch("/api/storefront/pages/about-us", { signal: AbortSignal.timeout(4000) });
        if (!res.ok) {
          const directUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
          res = await fetch(`${directUrl}/pages/about-us`);
        }

        if (!res.ok) {
          res = await fetch("/api/storefront/pages/about", { signal: AbortSignal.timeout(4000) });
        }

        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && data.is_active) {
            setPage(data);
          }
        }
      } catch (err) {
        // Fall back to default brand presentation
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCmsPage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Format markdown-like headings and paragraphs if raw markdown is stored
  const renderFormattedContent = (content: string) => {
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    const blocks = content.split(/\n\n+/);
    return (
      <div className="space-y-4">
        {blocks.map((block, idx) => {
          const trimmed = block.trim();
          if (trimmed.startsWith("### ")) {
            return (
              <h3
                key={idx}
                className="text-base sm:text-lg font-bold pt-3"
                style={{ color: "var(--theme-text-heading, #0f172a)" }}
              >
                {trimmed.replace(/^###\s+/, "")}
              </h3>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h2
                key={idx}
                className="text-lg sm:text-xl font-bold pt-4"
                style={{ color: "var(--theme-text-heading, #0f172a)" }}
              >
                {trimmed.replace(/^##\s+/, "")}
              </h2>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h1
                key={idx}
                className="text-xl sm:text-2xl font-black pt-4"
                style={{ color: "var(--theme-text-heading, #0f172a)" }}
              >
                {trimmed.replace(/^#\s+/, "")}
              </h1>
            );
          }
          return (
            <p key={idx} className="leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <ContentPageLayout
      title={page?.title || "About Us"}
      description={page?.meta_description || "Committed to authentic vape hardware, premium flavors, and responsible adult advocacy."}
    >
      <div className="text-xs sm:text-sm leading-relaxed space-y-8">
        {page && page.content ? (
          <div className="space-y-6">{renderFormattedContent(page.content)}</div>
        ) : (
          <div className="space-y-8">
            {/* Mission Statement */}
            <section className="space-y-3">
              <h2
                className="text-base sm:text-lg font-bold tracking-tight"
                style={{ color: "var(--theme-text-heading, #0f172a)" }}
              >
                Our Mission
              </h2>
              <p>
                At <strong style={{ color: "var(--theme-text-heading, #0f172a)" }}>{brandName}</strong>, we believe adult vape enthusiasts deserve effortless access to verified, authentic hardware and premium flavors without compromise. Founded with a commitment to quality and transparency, our catalog features handpicked disposable vapes, pod systems, e-liquids, and accessories from the world&apos;s most trusted manufacturers.
              </p>
              <p>
                Every device and batch in our inventory is sourced through certified channels and verified authentic, ensuring consistent vapor production, clean flavor profiles, and strict safety compliance.
              </p>
            </section>

            {/* Core Pillars */}
            <section
              className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t transition-colors"
              style={{ borderColor: "var(--theme-card-border, #e2e8f0)" }}
            >
              <div
                className="p-4 rounded-xl border transition-colors space-y-2"
                style={{
                  backgroundColor: "var(--theme-card-bg, #ffffff)",
                  borderColor: "var(--theme-card-border, #e2e8f0)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                    color: "var(--theme-primary, #005826)",
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3
                  className="font-bold text-xs sm:text-sm"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  100% Authentic
                </h3>
                <p className="text-[11px] leading-relaxed opacity-80">
                  Guaranteed genuine hardware with verifiable holographic security scratch codes direct from official distributors.
                </p>
              </div>

              <div
                className="p-4 rounded-xl border transition-colors space-y-2"
                style={{
                  backgroundColor: "var(--theme-card-bg, #ffffff)",
                  borderColor: "var(--theme-card-border, #e2e8f0)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                    color: "var(--theme-primary, #005826)",
                  }}
                >
                  <Truck className="w-4 h-4" />
                </div>
                <h3
                  className="font-bold text-xs sm:text-sm"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Express Nationwide Delivery
                </h3>
                <p className="text-[11px] leading-relaxed opacity-80">
                  Swift dispatch across Dhaka (24–48 hrs) and all 64 districts with secure, tamper-evident packaging.
                </p>
              </div>

              <div
                className="p-4 rounded-xl border transition-colors space-y-2"
                style={{
                  backgroundColor: "var(--theme-card-bg, #ffffff)",
                  borderColor: "var(--theme-card-border, #e2e8f0)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                    color: "var(--theme-primary, #005826)",
                  }}
                >
                  <Headphones className="w-4 h-4" />
                </div>
                <h3
                  className="font-bold text-xs sm:text-sm"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Dedicated Care
                </h3>
                <p className="text-[11px] leading-relaxed opacity-80">
                  Direct WhatsApp support, expert coil & pod guidance, and hassle-free warranty claim assistance.
                </p>
              </div>
            </section>

            {/* Responsible Adult Advocacy */}
            <section
              className="p-4 rounded-xl border transition-colors space-y-1.5"
              style={{
                backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.04))",
                borderColor: "var(--theme-card-border, #e2e8f0)",
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--theme-primary, #005826)" }}
                />
                <h3
                  className="font-bold text-xs sm:text-sm"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Strictly 18+ Adult Age Verification
                </h3>
              </div>
              <p className="text-xs leading-relaxed opacity-80">
                We strictly prohibit sales to minors. All orders require age confirmation prior to dispatch in accordance with responsible adult vaping advocacy and local regulations.
              </p>
            </section>

            {/* Call to action */}
            <div
              className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors"
              style={{ borderColor: "var(--theme-card-border, #e2e8f0)" }}
            >
              <div>
                <h4
                  className="font-bold text-xs sm:text-sm"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Ready to elevate your experience?
                </h4>
                <p className="text-xs opacity-75">
                  Explore our curated catalog of authentic devices, pods, and premium flavors.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all hover:opacity-90 cursor-pointer shrink-0"
                style={{
                  backgroundColor: "var(--theme-primary, #005826)",
                  color: "var(--theme-btn-primary-text, #ffffff)",
                }}
              >
                <span>Explore Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </ContentPageLayout>
  );
}
