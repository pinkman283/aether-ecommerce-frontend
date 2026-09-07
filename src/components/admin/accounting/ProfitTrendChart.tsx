"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { ChartContainer } from "./ChartContainer";
import { FinancialTooltip } from "./FinancialTooltip";
import { ChartEmptyState } from "./ChartEmptyState";

interface DailyTrendItem {
  date: string;
  revenue: number;
  cogs: number;
  expense: number;
  total_cost?: number;
  gross_profit?: number;
  net_profit: number;
}

interface ProfitTrendChartProps {
  data: DailyTrendItem[];
  isLoading?: boolean;
  height?: number;
}

export const ProfitTrendChart: React.FC<ProfitTrendChartProps> = ({
  data = [],
  isLoading = false,
  height = 300,
}) => {
  const formattedData = data.map((d) => {
    const gross = typeof d.gross_profit === "number" ? d.gross_profit : (d.revenue || 0) - (d.cogs || 0);
    return {
      date: d.date,
      gross_profit: roundNumber(gross),
      net_profit: roundNumber(d.net_profit || 0),
    };
  });

  function roundNumber(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  const hasData = formattedData.length > 0 && formattedData.some((d) => d.gross_profit !== 0 || d.net_profit !== 0);

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  const cumulativeNet = formattedData.reduce((acc, curr) => acc + curr.net_profit, 0);

  return (
    <ChartContainer
      title="Gross vs. Net Profit Performance"
      subtitle="Operational value creation before and after general operating expenses"
      businessQuestion="Are product markups sufficient to absorb fixed overhead, and what is our bottom-line retention?"
      isLoading={isLoading}
      height={height}
      action={
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Net Retention:</span>
          <span
            className={`font-mono font-medium px-2 py-0.5 rounded-md border ${
              cumulativeNet >= 0
                ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/20"
                : "bg-rose-950/60 text-rose-400 border-rose-500/20"
            }`}
          >
            ${cumulativeNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      }
    >
      {!hasData ? (
        <ChartEmptyState
          title="No Profit History"
          message="No operational revenue or margin transactions in this timeframe."
          height={height}
        />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<FinancialTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
            />
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Line
              type="monotone"
              dataKey="gross_profit"
              name="Gross Profit"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ r: 2, fill: "#06b6d4" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="net_profit"
              name="Net Profit"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};
