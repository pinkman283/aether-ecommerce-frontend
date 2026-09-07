"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";

export interface NavChildItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  permission?: string;
  badge?: string | number;
}

export interface SidebarNavGroupProps {
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  items: NavChildItem[];
  sidebarCollapsed: boolean;
  pathname: string;
  hasItemAccess: (permission?: string) => boolean;
  onNavigate?: () => void;
}

export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
  label,
  icon: GroupIcon,
  badge,
  items,
  sidebarCollapsed,
  pathname,
  hasItemAccess,
  onNavigate,
}) => {
  // Filter visible items according to permissions
  const visibleItems = items.filter((item) => hasItemAccess(item.permission));

  // Determine if any child is currently active
  const hasActiveChild = visibleItems.some(
    (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  );

  // Accordion state: open by default if active child is present
  const [isOpen, setIsOpen] = useState(hasActiveChild);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const flyoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-expand if navigating to an active child
  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild, pathname]);

  // If no visible items, hide entire group
  if (visibleItems.length === 0) return null;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  // Handlers for flyout menu in collapsed mode
  const handleMouseEnter = () => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    setFlyoutOpen(true);
  };

  const handleMouseLeave = () => {
    flyoutTimerRef.current = setTimeout(() => {
      setFlyoutOpen(false);
    }, 150);
  };

  // -------------------------------------------------------------
  // COLLAPSED SIDEBAR (ICON-ONLY MODE with Anchored Flyout)
  // -------------------------------------------------------------
  if (sidebarCollapsed) {
    return (
      <div
        className="relative group my-0.5 w-full flex justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={() => setFlyoutOpen((prev) => !prev)}
          className={`flex h-9 w-full items-center justify-center rounded-xl transition-colors duration-150 cursor-pointer ${
            hasActiveChild
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs"
              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
          title={label}
        >
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            <GroupIcon
              className={`w-4 h-4 transition-colors ${
                hasActiveChild ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
              }`}
            />
          </div>
          {hasActiveChild && (
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          )}
        </button>

        {/* Anchored Popover / Flyout for Collapsed Sidebar */}
        {flyoutOpen && (
          <div
            className="absolute left-full top-0 ml-2 z-50 w-56 rounded-xl border border-white/15 bg-[#0b0e17] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-2.5 pb-2 pt-1 mb-1.5">
              <GroupIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-white uppercase tracking-wide truncate">
                {label}
              </span>
              {badge && (
                <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                  {badge}
                </span>
              )}
            </div>

            <div className="space-y-0.5 max-h-72 overflow-y-auto no-scrollbar">
              {visibleItems.map((item) => {
                const ItemIcon = item.icon;
                const isItemActive =
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setFlyoutOpen(false);
                      if (onNavigate) onNavigate();
                    }}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      isItemActive
                        ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {ItemIcon && (
                      <ItemIcon
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isItemActive ? "text-amber-400" : "text-slate-500"
                        }`}
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                    {isItemActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // EXPANDED SIDEBAR: Contained Full-Width Accordion Panel
  // -------------------------------------------------------------
  return (
    <div
      className={`w-full rounded-xl transition-all duration-200 overflow-hidden my-0.5 ${
        isOpen
          ? "border border-white/10 bg-slate-900/60 shadow-sm"
          : "border border-transparent bg-transparent hover:border-white/5"
      }`}
    >
      {/* Parent Navigation Item (Header Button) */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-3 h-9 text-xs font-medium transition-all duration-150 cursor-pointer ${
          isOpen
            ? "bg-slate-900/90 text-white font-semibold"
            : hasActiveChild
            ? "bg-amber-500/10 text-amber-300 font-semibold hover:bg-amber-500/15"
            : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <GroupIcon
            className={`w-4 h-4 shrink-0 transition-colors ${
              hasActiveChild || isOpen ? "text-amber-400" : "text-slate-400"
            }`}
          />
          <span className="truncate tracking-tight whitespace-nowrap">{label}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {hasActiveChild && !isOpen && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          )}
          {badge && (
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9.5px] font-mono text-slate-300">
              {badge}
            </span>
          )}
          <ChevronRight
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-90 text-slate-200" : "rotate-0"
            }`}
          />
        </div>
      </button>

      {/* Submenu: Contained full-width panel immediately underneath parent */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="w-full bg-[#070911] border-t border-white/5 p-1.5 space-y-0.5">
            {visibleItems.map((item) => {
              const ItemIcon = item.icon;
              const isItemActive =
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors duration-150 group relative ${
                    isItemActive
                      ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shadow-xs"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  {ItemIcon ? (
                    <ItemIcon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isItemActive
                          ? "text-amber-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />
                  ) : (
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                        isItemActive ? "bg-amber-400" : "bg-slate-600 group-hover:bg-slate-400"
                      }`}
                    />
                  )}

                  <span className="truncate">{item.label}</span>

                  {isItemActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export interface SidebarNavLinkProps {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  sidebarCollapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}

export const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({
  label,
  href,
  icon: Icon,
  badge,
  sidebarCollapsed,
  pathname,
  onNavigate,
}) => {
  const isActive = pathname === href;

  return (
    <div className="relative group/navlink my-0.5 w-full">
      <Link
        href={href}
        onClick={onNavigate}
        className={`flex items-center h-9 w-full rounded-xl text-xs font-medium transition-colors duration-150 ${
          sidebarCollapsed ? "justify-center px-0" : "px-3 justify-between"
        } ${
          isActive
            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-xs"
            : "text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent"
        }`}
        title={sidebarCollapsed ? label : undefined}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? "text-amber-400" : "text-slate-400 group-hover/navlink:text-slate-200"
              }`}
            />
          </div>
          {!sidebarCollapsed && (
            <span className="truncate tracking-tight whitespace-nowrap animate-in fade-in duration-150">
              {label}
            </span>
          )}
        </div>
        {badge && !sidebarCollapsed && (
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9.5px] font-mono text-slate-300 ml-2 shrink-0">
            {badge}
          </span>
        )}
      </Link>

      {sidebarCollapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-lg bg-[#141824] border border-white/15 text-[11px] font-semibold text-white shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/navlink:opacity-100 transition-opacity z-50">
          {label}
        </div>
      )}
    </div>
  );
};
