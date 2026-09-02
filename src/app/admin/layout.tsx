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
  ShieldAlert,
  ChevronRight,
  Menu,
  X,
  Search,
  Magnet,
  Calculator,
  Truck,
  FileText,
  PackageCheck,
  Coins,
  TrendingUp,
  Receipt,
  BadgeDollarSign,
  Palette,
  Building2,
  SlidersHorizontal,
  Command,
  Store
} from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { adminApi } from "@/lib/adminApi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, logoutAdmin, setAdminAuth } = useAdminAuthStore();
  const { theme } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Command Palette State (Ctrl + K)
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  // If on admin login page, bypass layout shell
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCollapsed = localStorage.getItem("admin_sidebar_collapsed");
      if (savedCollapsed === "1") {
        setSidebarCollapsed(true);
      }
    }
  }, []);

  // Global Ctrl + K Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (e.key === "Escape" && commandOpen) {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandOpen]);

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

  const toggleSidebar = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_sidebar_collapsed", nextState ? "1" : "0");
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading Administration Session...
        </span>
      </div>
    );
  }

  const hasItemAccess = (permission?: string) => {
    if (!permission) return true;
    if (adminUser?.role === "super_admin") return true;
    return Boolean(adminUser?.permissions?.includes(permission));
  };

  const navSections = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "POS Terminal", href: "/admin/pos", icon: Receipt, permission: "orders.create" },
      ],
    },
    {
      title: "Catalog & Stock",
      items: [
        { label: "Products", href: "/admin/products", icon: Boxes, permission: "products.view" },
        { label: "Categories", href: "/admin/categories", icon: FolderTree, permission: "categories.view" },
        { label: "Brands", href: "/admin/brands", icon: Building2, permission: "products.view" },
        { label: "Inventory & Stock", href: "/admin/inventory", icon: Layers, permission: "products.view" },
        { label: "FIFO Ledger", href: "/admin/inventory-valuation", icon: Calculator, permission: "procurement.fifo" },
        { label: "Vendors", href: "/admin/vendors", icon: Truck, permission: "procurement.vendors" },
        { label: "Purchase Orders", href: "/admin/purchase-orders", icon: FileText, permission: "procurement.orders" },
        { label: "Goods Receiving", href: "/admin/goods-receipts", icon: PackageCheck, permission: "procurement.receive" },
      ],
    },
    {
      title: "Sales & CRM",
      items: [
        { label: "Orders", href: "/admin/orders", icon: ShoppingBag, permission: "orders.view" },
        { label: "Sales & Invoices", href: "/admin/sales", icon: BadgeDollarSign, permission: "orders.view" },
        { label: "Leads & Abandoned", href: "/admin/leads", icon: Magnet, permission: "leads.view" },
        { label: "Customers", href: "/admin/customers", icon: Users, permission: "customers.view" },
        { label: "Coupons", href: "/admin/coupons", icon: Tag, permission: "coupons.view" },
        { label: "Reviews", href: "/admin/reviews", icon: Star, permission: "reviews.view" },
      ],
    },
    {
      title: "Financials",
      items: [
        { label: "P&L Financial Engine", href: "/admin/finance", icon: TrendingUp, permission: "finance.view" },
        { label: "Operating Expenses", href: "/admin/expenses", icon: Coins, permission: "expenses.view" },
      ],
    },
    {
      title: "Administration & Settings",
      items: [
        { label: "Settings", href: "/admin/settings", icon: Settings, permission: "settings.manage" },
        { label: "Staff & RBAC", href: "/admin/staff", icon: UserCog, permission: "staff.view" },
        { label: "Blocked IPs", href: "/admin/blocked-ips", icon: ShieldAlert, permission: "security.ip_block" },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText, permission: "audit_logs.view" },
        { label: "My Profile", href: "/admin/profile", icon: ShieldCheck },
      ],
    },
  ];

  const handleLogout = async () => {
    await adminApi.logout();
    logoutAdmin();
    router.push("/admin/login");
  };

  const companyBrandName = theme?.store_brand_name || "AETHER";
  const companyBrandLogo = theme?.store_brand_logo;

  // Additional sub-pages for breadcrumb and command palette indexing
  const additionalSubPages = [
    { label: "Theme & Appearance", href: "/admin/settings/appearance", icon: Palette, section: "Settings", permission: "theme.manage" },
    { label: "Branding & Logo", href: "/admin/settings/branding", icon: Store, section: "Settings", permission: "theme.manage" },
    { label: "Storefront & Hero", href: "/admin/settings/storefront", icon: LayoutDashboard, section: "Settings", permission: "theme.manage" },
    { label: "Theme & UI Studio", href: "/admin/theme", icon: Palette, section: "Settings", permission: "theme.manage" },
  ];

  // Breadcrumb current item detection
  const allNavAndSubItems = [
    ...navSections.flatMap((s) => s.items.map((item) => ({ ...item, section: s.title }))),
    ...additionalSubPages,
  ];

  const currentNavItem = allNavAndSubItems.find(
    (item) => item.href === pathname || (item.href !== "/admin" && pathname.startsWith(item.href))
  );

  // Command palette items filter
  const allFlattenedItems = allNavAndSubItems.filter((item) => hasItemAccess(item.permission));
  const filteredCommandItems = allFlattenedItems.filter((item) => 
    item.label.toLowerCase().includes(commandQuery.toLowerCase()) ||
    item.section.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-full bg-[#07090e] text-slate-100 flex overflow-hidden fixed inset-0">
      
      {/* Sidebar Desktop */}
      <aside 
        className={`hidden lg:flex flex-col justify-between bg-[#0b0e17] border-r border-white/10 shrink-0 h-full transition-[width] duration-250 ease-in-out will-change-[width] overflow-hidden z-20 ${
          sidebarCollapsed ? "w-[64px]" : "w-60"
        }`}
      >
        <div className="p-3 flex flex-col h-full overflow-x-hidden overflow-y-auto no-scrollbar">
          
          {/* Admin Brand Header */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 mb-3 w-full shrink-0">
            {companyBrandLogo ? (
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                <img src={companyBrandLogo} alt={companyBrandName} className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-xs shrink-0">
                <span className="font-black text-amber-400 text-sm font-mono">
                  {companyBrandName.charAt(0)}
                </span>
              </div>
            )}
            
            <div 
              className={`overflow-hidden transition-all duration-200 whitespace-nowrap ${
                sidebarCollapsed ? "w-0 opacity-0 max-w-0 pointer-events-none -translate-x-2" : "w-auto opacity-100 max-w-[170px] translate-x-0"
              }`}
            >
              <span className="font-bold text-xs text-white tracking-tight block truncate uppercase">
                {companyBrandName}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4 flex-1 w-full overflow-x-hidden">
            {navSections.map((section) => {
              const visibleItems = section.items.filter((item) => hasItemAccess(item.permission));
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title} className="space-y-0.5">
                  {/* Category Header */}
                  <div 
                    className={`overflow-hidden transition-all duration-200 whitespace-nowrap ${
                      sidebarCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-5 opacity-100 mb-1"
                    }`}
                  >
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 px-2 block whitespace-nowrap">
                      {section.title}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center rounded-lg text-xs font-medium transition-colors group relative overflow-hidden whitespace-nowrap ${
                            sidebarCollapsed
                              ? "justify-center p-2.5 my-0.5"
                              : "gap-2.5 px-2.5 py-1.5"
                          } ${
                            isActive
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-xs"
                              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                          }`}
                          title={sidebarCollapsed ? `${item.label} (${section.title})` : undefined}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                          
                          <span 
                            className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                              sidebarCollapsed ? "w-0 opacity-0 max-w-0 -translate-x-2" : "w-auto opacity-100 max-w-[160px] translate-x-0"
                            }`}
                          >
                            {item.label}
                          </span>
                          
                          {/* Slim Rail Tooltip */}
                          {sidebarCollapsed && (
                            <div className="absolute left-full ml-2 px-2.5 py-1 rounded bg-slate-900 border border-white/15 text-[11px] font-bold text-white shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                              {item.label}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Card Bottom */}
        <div className="p-2.5 border-t border-white/10 bg-black/20 shrink-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity group overflow-hidden"
              title="View Profile"
            >
              <img
                src={adminUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt={adminUser?.name || "Admin"}
                className="w-7 h-7 rounded-md object-cover ring-1 ring-white/10 group-hover:ring-amber-400 transition-all shrink-0"
              />
              
              <div 
                className={`overflow-hidden transition-all duration-200 whitespace-nowrap ${
                  sidebarCollapsed ? "w-0 opacity-0 max-w-0 pointer-events-none -translate-x-2" : "w-auto opacity-100 max-w-[120px] translate-x-0"
                }`}
              >
                <span className="text-[11px] font-bold text-white block truncate group-hover:text-amber-300 transition-colors">
                  {adminUser?.name}
                </span>
                <span className="text-[9.5px] text-slate-400 truncate block capitalize">
                  {adminUser?.role?.replace("_", " ")}
                </span>
              </div>
            </Link>

            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 shrink-0 border-b border-white/10 bg-[#080b12]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30">
          
          {/* Left: Sidebar Toggle + Breadcrumb */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-all hover:border-amber-400/30"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 rounded-md bg-white/5 text-slate-300 hover:text-white cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Dynamic Breadcrumbs */}
            {currentNavItem && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">{currentNavItem.section}</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="font-bold text-slate-200">{currentNavItem.label}</span>
              </div>
            )}
          </div>

          {/* Center: Command Palette Trigger */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-xs transition-all cursor-pointer w-60 justify-between shadow-xs"
          >
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Quick navigation...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/15 text-[9.5px] font-mono text-slate-300">
              Ctrl+K
            </kbd>
          </button>

          {/* Right: Quick Storefront Link + Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1"
              title="Open customer storefront in new tab"
            >
              <span>Live Store</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </Link>

            <Link
              href="/admin/theme"
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
              title="Theme Studio"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            <Link
              href="/admin/settings"
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5 text-slate-300" />
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#07090e]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)} 
          />
          <div className="relative w-64 max-w-[80vw] bg-[#0b0e17] border-r border-white/10 h-full flex flex-col p-4 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="font-bold text-xs text-white uppercase">{companyBrandName} Admin</span>
              <button 
                onClick={() => setMobileNavOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-4 flex-1">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 px-2 block">
                    {section.title}
                  </span>
                  {section.items.filter((i) => hasItemAccess(i.permission)).map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                          isActive ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Global Quick Command Palette Modal (Ctrl + K) */}
      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setCommandOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#0e121e] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-white/10">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Search admin pages..."
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-400">ESC</kbd>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filteredCommandItems.length > 0 ? (
                filteredCommandItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setCommandOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{item.section}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching admin pages found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
