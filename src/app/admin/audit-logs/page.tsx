"use client";

import { useState, useEffect } from "react";
import { 
  ScrollText, 
  Search, 
  Eye, 
  X, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Terminal,
  Layers,
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  MinusCircle,
  PlusCircle,
  FileText,
  Calendar,
  Globe,
  RotateCcw
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { toast } from "sonner";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Inspect Diff Modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        search: search.trim() || undefined,
        per_page: 50,
      });
      setLogs(res.data || []);
    } catch (err) {
      toast.error("Failed to load audit trail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAuditLogs();
  };

  const handleResetFilters = () => {
    setSearch("");
    adminApi.getAuditLogs({ per_page: 50 }).then((res) => {
      setLogs(res.data || []);
    });
    toast.success("Audit trail search reset.");
  };

  // Helper to format keys cleanly (e.g. stock_quantity -> Stock Quantity)
  const formatKeyName = (key: string): string => {
    const customMappings: Record<string, string> = {
      stock_quantity: "Stock Quantity",
      order_status: "Fulfillment Status",
      payment_status: "Payment Status",
      reason: "Audit / Restock Reason",
      unit_price: "Unit Price",
      total_amount: "Total Amount",
      is_active: "Active Status",
      is_approved: "Approval Status",
      role: "Security Role",
      tracking_code: "Tracking Code",
      carrier: "Shipping Carrier",
    };
    if (customMappings[key]) return customMappings[key];

    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Helper to render property values cleanly
  const renderValueBadge = (val: any) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-500 italic text-[11px]">None / Unset</span>;
    }
    if (typeof val === "boolean") {
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
          val 
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
        }`}>
          {val ? "Enabled" : "Disabled"}
        </span>
      );
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-slate-500 italic text-[11px]">Empty</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {val.map((item, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[10px] font-medium border border-white/10">
              {typeof item === "object" ? JSON.stringify(item) : String(item)}
            </span>
          ))}
        </div>
      );
    }
    if (typeof val === "object") {
      return (
        <div className="space-y-1 pl-2 border-l border-white/10">
          {Object.entries(val).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 text-[11px]">
              <span className="text-slate-400 font-semibold">{formatKeyName(k)}:</span>
              <span className="text-white font-bold">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <span className="font-bold text-white text-xs">{String(val)}</span>;
  };

  // Extract all unique property keys between old and new state
  const getAllKeys = (oldVal: any, newVal: any) => {
    const keys = new Set<string>();
    if (oldVal && typeof oldVal === "object") {
      Object.keys(oldVal).forEach((k) => keys.add(k));
    }
    if (newVal && typeof newVal === "object") {
      Object.keys(newVal).forEach((k) => keys.add(k));
    }
    return Array.from(keys);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Immutable Security Trail
          </span>
          <h1 className="text-2xl font-black text-white">System Audit Trail ({logs.length})</h1>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, admin, or description..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </form>

        <button
          type="button"
          onClick={handleResetFilters}
          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
          title="Reset audit trail search"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Logs Table with Scrollable Drag Card */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[800px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5 min-w-[160px]">Timestamp & Time</th>
              <th className="p-3.5">Administrator</th>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Entity</th>
              <th className="p-3.5">Description</th>
              <th className="p-3.5 text-center min-w-[90px]">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Retrieving cryptographic audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                  No audit records found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors font-mono text-[11px]">
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-white font-bold font-sans text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {formatDate(log.created_at)}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5 font-semibold">
                        <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                        {formatTime(log.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 font-sans font-bold text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={log.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                        alt={log.user_name || "Admin"}
                        className="w-6 h-6 rounded-md object-cover bg-slate-900 ring-1 ring-amber-400/30"
                      />
                      <span>{log.user_name || "System"}</span>
                    </div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/25">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans text-cyan-300 font-bold whitespace-nowrap">
                    {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ""}
                  </td>
                  <td className="p-3.5 font-sans text-slate-300 max-w-sm truncate">{log.description}</td>
                  <td className="p-3.5 text-center font-sans whitespace-nowrap">
                    {(log.old_values || log.new_values) && (
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowRawJson(false);
                        }}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all shadow-sm mx-auto"
                        title="View Change Diff Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollableTableCard>

      {/* Structured Change Diff Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedLog(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c0e15] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Action Inspection & Audit Diff
                </span>
                <h3 className="text-base font-black text-white font-mono">{selectedLog.action}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Telemetry Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Timestamp
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 block">
                  {formatDateTime(selectedLog.created_at)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" /> Executor
                </span>
                <span className="text-xs font-bold text-white block truncate">
                  {selectedLog.user_name || "System"} <span className="text-[10px] text-slate-400 font-mono">({selectedLog.user_role || "system"})</span>
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Globe className="w-3 h-3 text-purple-400" /> Entity & Source
                </span>
                <span className="text-xs font-mono text-purple-300 block truncate">
                  {selectedLog.entity_type} {selectedLog.entity_id ? `#${selectedLog.entity_id}` : ""} {selectedLog.ip_address ? `• ${selectedLog.ip_address}` : ""}
                </span>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Operation Summary
              </span>
              <p className="text-slate-200 text-xs leading-relaxed font-sans">{selectedLog.description}</p>
            </div>

            {/* Structured Property Comparison Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  State Mutation Properties
                </span>
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  {showRawJson ? "Show Formatted Cards" : "View Raw JSON Payload"}
                </button>
              </div>

              {!showRawJson ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ORIGINAL STATE (OLD) */}
                  <div className="p-4 rounded-2xl bg-[#0e121e] border border-rose-500/20 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <MinusCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
                        Original State (Old)
                      </span>
                    </div>

                    {!selectedLog.old_values || Object.keys(selectedLog.old_values).length === 0 ? (
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-slate-500 italic text-[11px]">
                        No prior state (New Entity Created)
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(selectedLog.old_values).map(([k, v]) => (
                          <div
                            key={k}
                            className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col gap-1"
                          >
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {formatKeyName(k)}
                            </span>
                            <div>{renderValueBadge(v)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MUTATED STATE (NEW) */}
                  <div className="p-4 rounded-2xl bg-[#0e121e] border border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                        Mutated State (New)
                      </span>
                    </div>

                    {!selectedLog.new_values || Object.keys(selectedLog.new_values).length === 0 ? (
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-slate-500 italic text-[11px]">
                        Entity Deleted / Depleted
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(selectedLog.new_values).map(([k, v]) => (
                          <div
                            key={k}
                            className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-1"
                          >
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {formatKeyName(k)}
                            </span>
                            <div>{renderValueBadge(v)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Raw JSON toggle for technical inspection */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                      Original State JSON
                    </span>
                    <pre className="font-mono text-[10px] text-slate-300 overflow-x-auto p-3 bg-black/60 rounded-xl max-h-56">
                      {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : "null"}
                    </pre>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Mutated State JSON
                    </span>
                    <pre className="font-mono text-[10px] text-slate-300 overflow-x-auto p-3 bg-black/60 rounded-xl max-h-56">
                      {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : "null"}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wide text-xs transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
