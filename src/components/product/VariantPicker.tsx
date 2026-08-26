"use client";

import { ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Check } from "lucide-react";

interface VariantPickerProps {
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export function VariantPicker({
  variants = [],
  selectedVariant,
  onSelectVariant,
}: VariantPickerProps) {
  if (variants.length === 0) return null;

  return (
    <div className="space-y-4 py-4 border-y border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Select Edition / Finish
        </span>
        {selectedVariant && (
          <span className="text-xs text-cyan-400 font-extrabold">
            {selectedVariant.name}
            {selectedVariant.price_modifier > 0 && ` (+${formatPrice(selectedVariant.price_modifier)})`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {variants.map((v) => {
          const isSelected = selectedVariant?.id === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVariant(v)}
              className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "bg-indigo-600/20 border-cyan-400 shadow-md shadow-cyan-400/15"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Color Dot if hex provided */}
                {v.color_hex && (
                  <div
                    className="w-4 h-4 rounded-full border border-white/40 shadow-inner shrink-0"
                    style={{ backgroundColor: v.color_hex }}
                  />
                )}
                <div>
                  <span className="text-xs font-bold text-white block">{v.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {v.stock_quantity > 0 ? `${v.stock_quantity} units available` : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {v.price_modifier > 0 && (
                  <span className="text-[11px] font-bold text-slate-300">
                    +{formatPrice(v.price_modifier)}
                  </span>
                )}
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
