"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SearchModal } from "@/components/shared/SearchModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistDrawer } from "@/components/cart/WishlistDrawer";
import { AuthModal } from "@/components/auth/AuthModal";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SplitReveal } from "@/components/shared/SplitReveal";
import { Toaster } from "sonner";

import { FloatingWhatsApp } from "@/components/shared/FloatingWhatsApp";
import { BackToTop } from "@/components/shared/BackToTop";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { ThemeSettings } from "@/store/useThemeStore";

export function AppProviders({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: ThemeSettings;
}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always ensure landing at the top of the page on navigation
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <ThemeProvider initialTheme={initialTheme}>
        {children}
        {mounted && (
          <Toaster
            theme="dark"
            position="bottom-right"
            closeButton
            toastOptions={{
              style: {
                background: "#0c0e15",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#ffffff",
              },
            }}
          />
        )}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <div className="min-h-screen flex flex-col">
        {/* Horizontal Split Reveal Intro Animation */}
        <SplitReveal initialTheme={initialTheme} />

        <Navbar onOpenSearch={() => setSearchOpen(true)} />
        
        <main className="flex-1 flex flex-col pb-14 sm:pb-0">
          {children}
        </main>

        <Footer />
      </div>

      {/* Global Modals, Drawers & Conversion Widgets */}
      {mounted && (
        <>
          <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          <CartDrawer />
          <WishlistDrawer />
          <AuthModal />
          <FloatingWhatsApp />
          <BackToTop />
          <MobileBottomNav onOpenSearch={() => setSearchOpen(true)} />
          <Toaster
            theme="dark"
            position="bottom-right"
            closeButton
            toastOptions={{
              style: {
                background: "#0e121e",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
              },
            }}
          />
        </>
      )}
    </ThemeProvider>
  );
}

