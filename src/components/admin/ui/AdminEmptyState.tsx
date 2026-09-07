"use client";

import React from "react";
import { FolderOpen, LucideIcon } from "lucide-react";

export interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  height?: number | string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  height = "240px",
}) => {
  return (
    <div
      style={{ minHeight: height }}
      className="flex flex-col items-center justify-center text-center p-6 space-y-3"
    >
      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>

      {action && <div className="pt-1">{action}</div>}
    </div>
  );
};
