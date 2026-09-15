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

    const updateFaviconInDOM = (url?: string) => {
      try {
        const rawUrl = url?.trim() || "";
        const targetUrl = rawUrl || "/favicon.ico";
        const cacheBuster = targetUrl.startsWith("http") || targetUrl.startsWith("/storage")
          ? (targetUrl.includes("?") ? `${targetUrl}&v=${Date.now()}` : `${targetUrl}?v=${Date.now()}`)
          : `${targetUrl}?v=${Date.now()}`;

        // Select all icon links (icon, shortcut icon, apple-touch-icon)
        const iconLinks = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']"));

        if (iconLinks.length > 0) {
          iconLinks.forEach((link, index) => {
            // Remove sizes attribute to prevent browser preferring a stale dimension
            link.removeAttribute("sizes");
            if (index === 0) {
              link.href = cacheBuster;
            } else if (!link.rel.includes("apple")) {
              // Remove redundant duplicate icon links so they never overlap
              link.remove();
            } else {
              link.href = cacheBuster;
            }
          });
        } else {
          const newLink = document.createElement("link");
          newLink.rel = "icon";
          newLink.href = cacheBuster;
          document.head.appendChild(newLink);
        }
      } catch (e) {
        console.warn("Favicon update notice:", e);
      }
    };

    updateFaviconInDOM(theme?.store_favicon);

    const handleCustomFavicon = (e: any) => {
      updateFaviconInDOM(e.detail);
    };

    window.addEventListener("store_favicon_updated", handleCustomFavicon);
    return () => {
      window.removeEventListener("store_favicon_updated", handleCustomFavicon);
    };
  }, [theme?.store_favicon]);

  return null;
}
