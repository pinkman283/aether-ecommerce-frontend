"use client";

import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

export interface AdminStatItem {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  changeType?: "up" | "down" | "neutral";
  meta?: string;
  helper?: string;
  icon?: LucideIcon;
  variant?: "default" | "emerald" | "amber" | "rose" | "cyan" | "purple";
}

export interface AdminStatStripProps {
  stats: AdminStatItem[];
  columns?: 2 | 3 | 4 | 5;
}

export const AdminStatStrip: React.FC<AdminStatStripProps> = ({
  stats,
  columns = 4,
}) => {
  const getColClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-3";
      case 5:
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
      case 4:
      default:
        return "grid-cols-2 lg:grid-cols-4";
    }
  };

  const getVariantTextColor = (v?: string) => {
    switch (v) {
      case "emerald":
        return "text-emerald-400";
      case "amber":
        return "text-amber-400";
      case "rose":
        return "text-rose-400";
      case "cyan":
        return "text-cyan-400";
      case "purple":
        return "text-purple-300";
      default:
        return "text-white";
    }
  };

  return (
    <div className={`grid ${getColClass()} gap-3`}>
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const effectiveTrend = stat.trend ?? stat.changeType;
        const effectiveMeta = stat.meta ?? stat.helper;

        return (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-[#0f121b] border border-white/[0.08] shadow-xs hover:border-white/[0.14] transition-colors flex flex-col justify-between gap-1"
          >
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>{stat.label}</span>
              {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-0.5">
              <span className={`text-xl font-bold font-mono tracking-tight ${getVariantTextColor(stat.variant)}`}>
                {stat.value}
              </span>

              {stat.change && (
                <span
                  className={`text-[11px] font-mono font-semibold flex items-center gap-0.5 shrink-0 ${
                    effectiveTrend === "up"
                      ? "text-emerald-400"
                      : effectiveTrend === "down"
                      ? "text-rose-400"
                      : "text-slate-400"
                  }`}
                >
                  {effectiveTrend === "up" && <TrendingUp className="w-3 h-3" />}
                  {effectiveTrend === "down" && <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              )}
            </div>

            {effectiveMeta && (
              <span className="text-[10.5px] text-slate-500 truncate block">
                {effectiveMeta}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
