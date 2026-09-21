"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Globe,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { useAppTheme } from "@/components/providers/ThemeProvider";
import { BrandLogoImage } from "@/components/shared/BrandLogoImage";
import { FooterColumn, SocialLink } from "@/types";
import { SocialPlatformIcon } from "@/components/shared/SocialPlatformIcon";

export function Footer() {
  const { theme } = useAppTheme();
  const [columns, setColumns] = useState<FooterColumn[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [openAccordion, setOpenAccordion] = useState<Record<number, boolean>>({});

  // Fetch dynamic navigation data from the single source of truth
  useEffect(() => {
    let isMounted = true;

    async function loadNavigation() {
      try {
        const res = await fetch("/api/storefront/store-navigation", {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error("Navigation fetch failed");
        const data = await res.json();
        if (isMounted) {
          if (data.footer_columns && Array.isArray(data.footer_columns)) {
            setColumns(data.footer_columns);
          }
          if (data.social_links && Array.isArray(data.social_links)) {
            setSocialLinks(data.social_links);
          }
        }
      } catch (err) {
        // Graceful fallback to direct API if storefront proxy failed
        try {
          const directUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
          const directRes = await fetch(`${directUrl}/store-navigation`);
          if (directRes.ok && isMounted) {
            const directData = await directRes.json();
            if (directData.footer_columns) setColumns(directData.footer_columns);
            if (directData.social_links) setSocialLinks(directData.social_links);
          }
        } catch {}
      }
    }

    loadNavigation();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleAccordion = (columnId: number) => {
    setOpenAccordion((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const brandName = theme.store_brand_name || "Inheliq";
  const brandTagline = theme.store_brand_tagline || "Elevate every inhale";

  // Filter active columns and their active links
  const activeColumns = columns
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const activeSocials = socialLinks
    .filter((s) => s.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <footer
      suppressHydrationWarning
      className="theme-footer border-t text-sm transition-colors duration-200"
      role="contentinfo"
    >
      {/* 1. Guarantees Ribbon (Theme-Managed) */}
      {theme.footer_features_enabled !== false && (
        <div className="theme-footer-guarantees border-b transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <Link href={theme.footer_feature_link_1 || "/shipping-policy"} className="flex items-center gap-4 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl p-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:border-indigo-400 transition-colors">
                  <Truck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="theme-footer-card-title font-bold text-sm group-hover:text-cyan-400 transition-colors">
                    {theme.footer_feature_title_1 || "Free Express Shipping"}
                  </h4>
                  <p className="theme-footer-card-desc text-xs mt-0.5">
                    {theme.footer_feature_desc_1 || "Complimentary delivery on qualifying orders."}
                  </p>
                </div>
              </Link>

              <Link href={theme.footer_feature_link_2 || "/about"} className="flex items-center gap-4 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl p-1">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:border-cyan-400 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="theme-footer-card-title font-bold text-sm group-hover:text-cyan-400 transition-colors">
                    {theme.footer_feature_title_2 || "100% Authentic Guarantee"}
                  </h4>
                  <p className="theme-footer-card-desc text-xs mt-0.5">
                    {theme.footer_feature_desc_2 || "Verified authentic hardware and genuine e-liquids."}
                  </p>
                </div>
              </Link>

              <Link href={theme.footer_feature_link_3 || "/track"} className="flex items-center gap-4 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl p-1">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:border-purple-400 transition-colors">
                  <RotateCcw className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="theme-footer-card-title font-bold text-sm group-hover:text-cyan-400 transition-colors">
                    {theme.footer_feature_title_3 || "Fast Dispatch"}
                  </h4>
                  <p className="theme-footer-card-desc text-xs mt-0.5">
                    {theme.footer_feature_desc_3 || "Orders processed and dispatched within 24-48 hours."}
                  </p>
                </div>
              </Link>

              <Link href={theme.footer_feature_link_4 || "/contact"} className="flex items-center gap-4 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl p-1">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 group-hover:border-pink-400 transition-colors">
                  <Headphones className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h4 className="theme-footer-card-title font-bold text-sm group-hover:text-cyan-400 transition-colors">
                    {theme.footer_feature_title_4 || "Dedicated Customer Care"}
                  </h4>
                  <p className="theme-footer-card-desc text-xs mt-0.5">
                    {theme.footer_feature_desc_4 || "Expert assistance with orders and device support."}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Footer Area */}
      <div className="theme-footer-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-16">
        <nav aria-label="Footer Navigation" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column (2-wide on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              suppressHydrationWarning
              className="inline-flex items-center group select-none p-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
            >
              <BrandLogoImage placement="footer" />
            </Link>

            <p className="theme-footer-desc text-xs leading-relaxed max-w-sm text-slate-400">
              Curated premium disposable vapes, pod systems, e-liquids, and accessories. Elevate your vaping experience with authentic hardware, verified flavors, and express dispatch.
            </p>

            {/* Social Links (Admin Managed via social_links) */}
            {activeSocials.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Connect with us</span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {activeSocials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow ${brandName} on ${social.platform} (opens in a new tab)`}
                      className="theme-footer-social-btn w-8 h-8 rounded-xl border flex items-center justify-center transition-all hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      <SocialPlatformIcon platform={social.platform} icon={social.icon} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Configurable Navigation Columns (Admin Managed) */}
          {activeColumns.map((col) => {
            const links = (col.links || [])
              .filter((l) => l.is_active)
              .sort((a, b) => a.sort_order - b.sort_order);

            const isOpen = openAccordion[col.id];

            return (
              <div key={col.id} className="border-b border-white/[0.06] md:border-b-0 pb-4 md:pb-0">
                {/* Mobile Accordion Trigger / Desktop Heading */}
                <button
                  type="button"
                  onClick={() => handleToggleAccordion(col.id)}
                  className="w-full flex items-center justify-between text-left md:pointer-events-none group py-2 md:py-0"
                  aria-expanded={Boolean(isOpen)}
                >
                  <h4 className="theme-footer-col-title font-bold text-xs uppercase tracking-wider text-white">
                    {col.title}
                  </h4>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 md:hidden transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-cyan-400" : ""
                    }`}
                  />
                </button>

                {/* Links list (always visible on md+, collapsible on mobile) */}
                <ul
                  className={`theme-footer-col-links space-y-2.5 text-xs mt-3 md:block ${
                    isOpen ? "block" : "hidden md:block"
                  }`}
                >
                  {links.map((link) => {
                    const isExt = link.is_external || link.url.startsWith("http://") || link.url.startsWith("https://");
                    const openInNewTab = link.open_in_new_tab || isExt;

                    if (isExt) {
                      return (
                        <li key={link.id}>
                          <a
                            href={link.url}
                            target={openInNewTab ? "_blank" : undefined}
                            rel={openInNewTab ? "noopener noreferrer" : undefined}
                            className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
                          >
                            <span>{link.title}</span>
                            {openInNewTab && (
                              <span className="sr-only">(opens in a new tab)</span>
                            )}
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={link.id}>
                        <Link
                          href={link.url}
                          className="hover:text-cyan-400 transition-colors inline-block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
                        >
                          {link.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* 3. Bottom Copyright & Compliance Bar */}
        <div className="theme-footer-bottom border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400 text-center sm:text-left">
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-500 text-center sm:text-right font-medium">
            Strictly 18+ Only • Age verification required upon entry and delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
