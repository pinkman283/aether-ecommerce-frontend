"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

/**
 * Safely updates browser tab favicon in the live DOM without removing any nodes.
 * Mutating .href is safe for React reconciliation and avoids "removeChild" errors.
 */
export function DynamicFavicon() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const faviconUrl = theme?.store_favicon;
    if (!faviconUrl || !faviconUrl.trim()) return;

    const updateFaviconInDOM = (url: string) => {
      try {
        const cacheBuster = url.startsWith("http") || url.startsWith("/storage")
          ? (url.includes("?") ? `${url}&v=${Date.now()}` : `${url}?v=${Date.now()}`)
          : url;

        // 1. Update standard icon without removing any node
        const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
        if (iconLinks.length > 0) {
          iconLinks.forEach((link) => {
            link.href = cacheBuster;
          });
        } else {
          const newLink = document.createElement("link");
          newLink.rel = "icon";
          newLink.href = cacheBuster;
          document.head.appendChild(newLink);
        }

        // 2. Update apple-touch-icon
        const appleLinks = document.querySelectorAll<HTMLLinkElement>("link[rel='apple-touch-icon']");
        if (appleLinks.length > 0) {
          appleLinks.forEach((link) => {
            link.href = cacheBuster;
          });
        }
      } catch (e) {
        // Silently catch to avoid crashing user UI
        console.warn("Favicon update notice:", e);
      }
    };

    updateFaviconInDOM(faviconUrl);

    const handleCustomFavicon = (e: any) => {
      if (e.detail) {
        updateFaviconInDOM(e.detail);
      }
    };

    window.addEventListener("store_favicon_updated", handleCustomFavicon);
    return () => {
      window.removeEventListener("store_favicon_updated", handleCustomFavicon);
    };
  }, [theme?.store_favicon]);

  return null;
}
