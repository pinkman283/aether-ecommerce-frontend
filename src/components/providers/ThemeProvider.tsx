"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { fetchTheme } = useThemeStore();

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add("admin-body");
    } else {
      document.body.classList.remove("admin-body");
      fetchTheme();
    }
  }, [pathname, isAdmin, fetchTheme]);

  return <>{children}</>;
}
