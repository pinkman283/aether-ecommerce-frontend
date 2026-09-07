"use client";

import React from "react";

export interface AdminStatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({
  status,
  label,
  size = "sm",
  showDot = true,
  className = "",
}) => {
  const norm = (status || "").toLowerCase().trim().replace(/[-_]/g, " ");

  const getConfig = () => {
    switch (norm) {
      // Success / Paid / Active / Completed
      case "paid":
      case "active":
      case "completed":
      case "in stock":
      case "instock":
      case "approved":
      case "delivered":
      case "settled":
      case "verified":
        return {
          bg: "bg-emerald-500/10",
          text: "text-emerald-400",
          border: "border-emerald-500/25",
          dot: "bg-emerald-400",
        };

      // Warning / Pending / Processing / Due Soon
      case "pending":
      case "processing":
      case "low stock":
      case "lowstock":
      case "shipped":
      case "recorded":
      case "due soon":
      case "unpaid":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          border: "border-amber-500/25",
          dot: "bg-amber-400",
        };

      // Danger / Cancelled / Refunded / Out of Stock
      case "cancelled":
      case "canceled":
      case "refunded":
      case "failed":
      case "out of stock":
      case "outofstock":
      case "blocked":
      case "overdue":
        return {
          bg: "bg-rose-500/10",
          text: "text-rose-400",
          border: "border-rose-500/25",
          dot: "bg-rose-400",
        };

      // Informational / Cyan / Blue
      case "draft":
      case "pos":
      case "online":
      case "featured":
        return {
          bg: "bg-cyan-500/10",
          text: "text-cyan-400",
          border: "border-cyan-500/25",
          dot: "bg-cyan-400",
        };

      // Default Neutral
      default:
        return {
          bg: "bg-white/5",
          text: "text-slate-300",
          border: "border-white/10",
          dot: "bg-slate-400",
        };
    }
  };

  const config = getConfig();
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10.5px]"
      : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold uppercase tracking-wider ${sizeClasses} ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />}
      <span className="truncate">{label || status}</span>
    </span>
  );
};
