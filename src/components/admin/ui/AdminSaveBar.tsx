"use client";

import React from "react";
import { Save, RotateCcw, Loader2 } from "lucide-react";

export interface AdminSaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  saveLabel?: string;
  discardLabel?: string;
  message?: string;
}

export const AdminSaveBar: React.FC<AdminSaveBarProps> = ({
  isDirty,
  isSaving,
  onSave,
  onDiscard,
  saveLabel = "Save Changes",
  discardLabel = "Discard",
  message = "Unsaved changes",
}) => {
  if (!isDirty) return null;

  return (
    <div
      role="region"
      aria-label="Unsaved changes bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0b0e17]/95 border border-white/15 backdrop-blur-xl shadow-2xl shadow-black/80 ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-auto"
    >
      {/* Unsaved Indicator */}
      <div className="flex items-center gap-2 pl-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="text-xs font-semibold text-white whitespace-nowrap tracking-tight">
          {message}
        </span>
      </div>

      <div className="h-4 w-px bg-white/15" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDiscard}
          disabled={isSaving}
          className="px-3 py-1 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>{discardLabel}</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{saveLabel}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
