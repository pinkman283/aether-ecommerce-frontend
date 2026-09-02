"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Settings, 
  Palette, 
  Store, 
  LayoutTemplate
} from "lucide-react";

export function SettingsNavTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "General", href: "/admin/settings", icon: Settings },
    { label: "Appearance", href: "/admin/settings/appearance", icon: Palette },
    { label: "Branding", href: "/admin/settings/branding", icon: Store },
    { label: "Storefront & Hero", href: "/admin/settings/storefront", icon: LayoutTemplate },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/10 no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = 
          tab.href === "/admin/settings" 
            ? pathname === "/admin/settings"
            : pathname.startsWith(tab.href) || (tab.href === "/admin/settings/appearance" && pathname === "/admin/theme");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              isActive
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
