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

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <ThemeProvider>
        {children}
        {mounted && (
          <Toaster
            theme="dark"
            position="bottom-right"
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
    <ThemeProvider>
      {/* Horizontal Split Reveal Intro Animation */}
      <SplitReveal />

      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      
      <main className="min-h-[calc(100vh-140px)] pb-14 sm:pb-0">
        {children}
      </main>

      <Footer />

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

