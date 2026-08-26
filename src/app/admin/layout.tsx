"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Layers, 
  FolderTree, 
  Boxes, 
  ShoppingBag, 
  Users, 
  Tag, 
  Star, 
  UserCog, 
  ScrollText, 
  Settings, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { adminApi } from "@/lib/adminApi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, isAdminAuthenticated, logoutAdmin, setAdminAuth } = useAdminAuthStore();

  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on admin login page, bypass layout shell
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function verifyAuth() {
      const token = typeof window !== "undefined" ? localStorage.getItem("aether_admin_token") : null;
      if (!token) {
        router.push("/admin/login");
        return;
      }

      try {
        const res = await adminApi.getMe();
        if (!["admin", "super_admin", "staff"].includes(res.user.role)) {
          logoutAdmin();
          router.push("/admin/login?error=forbidden");
          return;
        }
        setAdminAuth(res.user, token);
      } catch (err) {
        logoutAdmin();
        router.push("/admin/login?error=session_expired");
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, [pathname, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080c] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
          Authenticating Executive Security Boundary...
        </span>
      </div>
    );
  }

  const navSections = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Catalog",
      items: [
        { label: "Products", href: "/admin/products", icon: Layers },
        { label: "Categories", href: "/admin/categories", icon: FolderTree },
        { label: "Inventory", href: "/admin/inventory", icon: Boxes },
      ],
    },
    {
      title: "Sales & Fulfillment",
      items: [
        { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { label: "Customers", href: "/admin/customers", icon: Users },
        { label: "Coupons", href: "/admin/coupons", icon: Tag },
        { label: "Reviews", href: "/admin/reviews", icon: Star },
      ],
    },
    {
      title: "Administration",
      items: [
        { label: "Staff & RBAC", href: "/admin/staff", icon: UserCog },
        { label: "My Profile", href: "/admin/profile", icon: ShieldCheck },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const handleLogout = async () => {
    await adminApi.logout();
    logoutAdmin();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex">
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-[#0b0d14] border-r border-white/10 shrink-0 sticky top-0 h-screen">
        <div className="p-5 flex flex-col h-full overflow-y-auto">
          {/* Admin Brand Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/10 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-black text-sm text-white tracking-tight block">AETHER OPS</span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {adminUser?.role === "super_admin" ? "Super Admin Console" : adminUser?.role === "staff" ? "Staff Operations" : "Executive Console"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-6 flex-1">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 block">
                  {section.title}
                </span>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold shadow-sm"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Card Bottom */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/admin/profile"
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity group"
              title="View & Edit Administrator Profile"
            >
              <img
                src={adminUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt={adminUser?.name || "Admin"}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-amber-500/40 group-hover:ring-amber-400 transition-all shrink-0"
              />
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate group-hover:text-amber-300 transition-colors">
                  {adminUser?.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">Edit Profile →</span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-[#0b0d14]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-bold text-slate-400 hidden sm:inline">
              AETHER Enterprise Operations
            </span>
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </Link>

            <Link
              href="/admin/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all"
            >
              <img
                src={adminUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                alt={adminUser?.name || "Admin"}
                className="w-5 h-5 rounded-lg object-cover ring-1 ring-amber-400/40"
              />
              <span className="text-[11px] font-bold hidden md:inline">
                {adminUser?.name?.trim().split(" ")[0] || adminUser?.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {adminUser?.role}
              </span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex">
            <div className="w-72 bg-[#0b0d14] h-full p-6 space-y-6 overflow-y-auto border-r border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="font-bold text-sm text-white">Navigation</span>
                <button onClick={() => setMobileNavOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    {section.title}
                  </span>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
                      >
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
