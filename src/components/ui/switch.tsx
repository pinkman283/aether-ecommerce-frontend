"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: "sm" | "default";
}

function Switch({
  className,
  size = "default",
  checked,
  onCheckedChange,
  ...props
}: SwitchProps) {
  const isSm = size === "sm";

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border transition-all duration-200 outline-none cursor-pointer select-none",
        isSm ? "h-5 w-9 p-0.5" : "h-6 w-11 p-0.5",
        // Unchecked state: soothing dark slate
        "bg-[#1e2330] border-white/10 hover:border-white/20",
        // Checked state: soothing warm amber that harmonizes with admin theme without eye strain
        "data-checked:bg-amber-500/80 data-checked:border-amber-400/40",
        // Disabled state
        "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-slate-100 shadow-sm ring-0 transition-transform duration-200 ease-out",
          isSm ? "h-3.5 w-3.5" : "h-5 w-5",
          isSm
            ? "translate-x-0 data-checked:translate-x-4 group-data-checked/switch:translate-x-4"
            : "translate-x-0 data-checked:translate-x-5 group-data-checked/switch:translate-x-5"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

