import Link from "next/link";
import { ChevronRight, ShieldCheck, Clock, FileText, ArrowLeft } from "lucide-react";

interface ContentPageLayoutProps {
  badge: string;
  title: string;
  description: string;
  lastUpdated?: string;
  children: React.ReactNode;
  activeSlug?: string;
}

const POLICY_NAV_LINKS = [
  { name: "Privacy Policy", href: "/privacy", slug: "privacy" },
  { name: "Terms of Service", href: "/terms", slug: "terms" },
  { name: "Shipping Policy", href: "/shipping-policy", slug: "shipping-policy" },
  { name: "Return & Refund Policy", href: "/refund-policy", slug: "refund-policy" },
  { name: "Frequently Asked Questions", href: "/faq", slug: "faq" },
  { name: "Contact & Support", href: "/contact", slug: "contact" },
  { name: "About AETHER Studio", href: "/about", slug: "about" },
];

export function ContentPageLayout({
  badge,
  title,
  description,
  lastUpdated = "September 2026",
  children,
  activeSlug,
}: ContentPageLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200 font-medium">{title}</span>
      </nav>

      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#121626] to-[#090b12] border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-cyan-300">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            {badge}
          </div>
          <h1
            className="text-2xl sm:text-4xl font-black tracking-tight"
            style={{ color: "var(--theme-text-heading, #ffffff)" }}
          >
            {title}
          </h1>
          <p
            className="text-xs sm:text-sm leading-relaxed"
            style={{ color: "var(--theme-text-body, #94a3b8)" }}
          >
            {description}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Effective Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Navigation Links */}
        <aside className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-5 rounded-3xl theme-card border border-white/10 space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-2">
              Legal & Support Navigation
            </span>
            <div className="space-y-1">
              {POLICY_NAV_LINKS.map((link) => {
                const isActive = activeSlug === link.slug;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`w-full block px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="p-5 rounded-3xl theme-card border border-white/10 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Studio Support Guarantee</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Have questions regarding custom acoustic orders, expedited shipments, or RMA warranties? Our engineering team is on standby 24/7.
            </p>
            <Link
              href="/contact"
              className="inline-block text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Open Support Ticket →
            </Link>
          </div>
        </aside>

        {/* Right Main Content Body */}
        <main className="lg:col-span-8 p-6 sm:p-8 rounded-3xl theme-card border border-white/10 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
