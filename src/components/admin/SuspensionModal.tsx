"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  X, 
  Clock, 
  Infinity as InfinityIcon, 
  AlertTriangle, 
  Calendar,
  CheckCircle2,
  Lock
} from "lucide-react";

export interface SuspensionPayload {
  duration_type: "indefinite" | "24h" | "3d" | "7d" | "30d" | "custom";
  suspended_until?: string;
  reason?: string;
}

interface SuspensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: SuspensionPayload) => Promise<void>;
  targetName: string;
  targetEmail: string;
  targetType: "customer" | "staff";
  isSubmitting?: boolean;
}

export function SuspensionModal({
  isOpen,
  onClose,
  onConfirm,
  targetName,
  targetEmail,
  targetType,
  isSubmitting = false,
}: SuspensionModalProps) {
  const [durationType, setDurationType] = useState<"indefinite" | "24h" | "3d" | "7d" | "30d" | "custom">("indefinite");
  const [customDate, setCustomDate] = useState("");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const customerReasonPresets = [
    "Fraud / Chargeback Risk",
    "Terms of Service Violation",
    "Abusive Behavior / Spam",
    "Payment / Billing Issue",
    "Under Security Review",
  ];

  const staffReasonPresets = [
    "Security Audit / Review",
    "Credential Compromise Suspicion",
    "Temporary Leave of Absence",
    "Internal Policy Violation",
    "Access Protocol Review",
  ];

  const presets = targetType === "customer" ? customerReasonPresets : staffReasonPresets;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (durationType === "custom" && !customDate) {
      return;
    }
    await onConfirm({
      duration_type: durationType,
      suspended_until: durationType === "custom" ? customDate : undefined,
      reason: reason.trim() || undefined,
    });
  };

  // Min date for custom picker (current time + 1 hour)
  const minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Card with max-h and custom scrollbar */}
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-[#0c0e15] border border-rose-500/30 shadow-2xl p-5 sm:p-6 z-10 space-y-3.5 text-xs max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 sticky top-0 bg-[#0c0e15] z-10 -mt-1 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 block">
                Security & Account Enforcement
              </span>
              <h3 className="text-sm font-black text-white">
                Suspend {targetType === "customer" ? "Customer" : "Staff Member"}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Profile Summary */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-xs font-bold text-white block truncate">{targetName}</span>
            <span className="text-[10px] text-slate-400 font-mono block truncate">{targetEmail}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
            {targetType.toUpperCase()}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Suspension Duration Options */}
          <div className="space-y-2">
            <label className="text-[10.5px] font-bold text-slate-300 block">
              Suspension Type & Duration
            </label>

            <div className="grid grid-cols-2 gap-2">
              {/* Indefinite Option */}
              <button
                type="button"
                onClick={() => setDurationType("indefinite")}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                  durationType === "indefinite"
                    ? "bg-rose-500/15 border-rose-500/50 text-white shadow-lg shadow-rose-500/10"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] flex items-center gap-1.5">
                    <InfinityIcon className="w-3 h-3 text-rose-400" />
                    Indefinite
                  </span>
                  {durationType === "indefinite" && (
                    <CheckCircle2 className="w-3 h-3 text-rose-400" />
                  )}
                </div>
                <span className="text-[9.5px] text-slate-400 leading-tight">
                  Until manually reactivated by admin.
                </span>
              </button>

              {/* Fixed / Timed Option */}
              <button
                type="button"
                onClick={() => {
                  if (durationType === "indefinite") setDurationType("7d");
                }}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                  durationType !== "indefinite"
                    ? "bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/10"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Fixed Duration
                  </span>
                  {durationType !== "indefinite" && (
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  )}
                </div>
                <span className="text-[9.5px] text-slate-400 leading-tight">
                  Auto-reactivates when duration expires.
                </span>
              </button>
            </div>

            {/* Quick Duration Preset Chips if Fixed Duration selected */}
            {durationType !== "indefinite" && (
              <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 space-y-2">
                <span className="text-[9.5px] font-bold uppercase text-slate-400 block tracking-wider">
                  Select Preset Duration
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: "24h", label: "24 Hours" },
                    { id: "3d", label: "3 Days" },
                    { id: "7d", label: "7 Days" },
                    { id: "30d", label: "30 Days" },
                    { id: "custom", label: "Custom..." },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setDurationType(chip.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        durationType === chip.id
                          ? "bg-amber-500 text-slate-950 shadow-md font-black"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {durationType === "custom" && (
                  <div className="pt-1.5">
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-1">
                      Set Reactivation Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      min={minDateTime}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full bg-white/5 border border-amber-500/40 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reason Input & Preset Chips */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-bold text-slate-300 block">
              Suspension Reason (Audit Log)
            </label>
            <div className="flex flex-wrap gap-1 pb-0.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReason(p)}
                  className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-[9.5px] font-medium border border-white/5 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Chargeback dispute, security flag..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400 text-xs"
            />
          </div>

          {/* Warning Banner */}
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-[10px] text-rose-300">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
            <p className="leading-tight">
              Enforcing suspension terminates active sessions and invalidates all JWT / Sanctum tokens.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 sticky bottom-0 bg-[#0c0e15] -mb-1 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wide text-xs transition-all shadow-lg shadow-rose-600/20"
            >
              {isSubmitting ? "Enforcing..." : "Enforce Suspension"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
