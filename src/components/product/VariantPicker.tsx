"use client";

import { ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Check, Sparkles, AlertCircle } from "lucide-react";

interface VariantPickerProps {
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant | null) => void;
  hasError?: boolean;
}

export function VariantPicker({
  variants = [],
  selectedVariant,
  onSelectVariant,
  hasError = false,
}: VariantPickerProps) {
  if (variants.length === 0) return null;

  return (
    <div
      className={`space-y-3 py-3.5 px-4 rounded-2xl border transition-all ${
        hasError
          ? "border-rose-500/80 bg-rose-500/5 shadow-lg shadow-rose-500/15 animate-pulse"
          : "theme-card border-white/10"
      }`}
    >
      {/* Header with Title and Selected Color info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Color Finish
          </span>
          {variants.length > 1 && !selectedVariant && (
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              (Choose an edition)
            </span>
          )}
        </div>

        {selectedVariant && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyan-400 font-extrabold flex items-center gap-1.5">
              {selectedVariant.color_hex && (
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
                  style={{ backgroundColor: selectedVariant.color_hex }}
                />
              )}
              {selectedVariant.name}
              {selectedVariant.price_modifier > 0 && ` (+${formatPrice(selectedVariant.price_modifier)})`}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              ({selectedVariant.stock_quantity > 0 ? `${selectedVariant.stock_quantity} left` : "Sold out"})
            </span>
          </div>
        )}
      </div>

      {/* Swatches & Chips Row */}
      <div className="flex flex-wrap gap-2.5 items-center">
        {variants.map((v) => {
          const isSelected = selectedVariant?.id === v.id;
          const isOutOfStock = v.stock_quantity <= 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(isSelected ? null : v)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-600/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-400/15 ring-2 ring-cyan-400/30"
                  : isOutOfStock
                  ? "opacity-40 border-dashed border-white/10 bg-white/[0.02] text-slate-500 cursor-not-allowed"
                  : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/25 hover:bg-white/10"
              }`}
            >
              {/* Color Swatch Dot */}
              {v.color_hex ? (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-inner shrink-0"
                  style={{ backgroundColor: v.color_hex }}
                />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
              )}

              {/* Variant Name */}
              <span>{v.name}</span>

              {/* Stock Indicator */}
              <span className={`text-[10px] font-normal ${isSelected ? "text-cyan-400/80" : "text-slate-400"}`}>
                {isOutOfStock ? "Out" : `${v.stock_quantity}`}
              </span>

              {/* Selected Check icon */}
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3] ml-0.5 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
