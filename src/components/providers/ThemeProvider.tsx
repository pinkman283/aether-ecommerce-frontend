"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useThemeStore, ThemeSettings, DEFAULT_THEME_SETTINGS, initThemeFromCache } from "@/store/useThemeStore";

interface ThemeContextType {
  theme: ThemeSettings;
  isLoaded: boolean;
  setTheme: (partial: Partial<ThemeSettings>) => void;
  fetchTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME_SETTINGS,
  isLoaded: false,
  setTheme: () => {},
  fetchTheme: async () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: ThemeSettings;
}) {
  const pathname = usePathname();
  const store = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (initialTheme) {
      // Synchronously write SSR theme to Zustand and localStorage
      store.setTheme(initialTheme);
    } else {
      initThemeFromCache();
    }
  }, [initialTheme]);

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add("admin-body");
    } else {
      document.body.classList.remove("admin-body");
      store.fetchTheme();
    }
  }, [pathname, isAdmin]);

  // On server and during initial client hydration render:
  // Before mounted, strictly use initialTheme (or DEFAULT_THEME_SETTINGS) to guarantee 100% deterministic SSR/client parity.
  // After client mount: use store.theme for live updates from admin & API.
  const activeTheme = mounted ? store.theme : (initialTheme || DEFAULT_THEME_SETTINGS);
  const activeIsLoaded = mounted ? store.isLoaded : Boolean(initialTheme);

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        isLoaded: activeIsLoaded,
        setTheme: store.setTheme,
        fetchTheme: store.fetchTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
