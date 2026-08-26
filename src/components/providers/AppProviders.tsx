"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SearchModal } from "@/components/shared/SearchModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistDrawer } from "@/components/cart/WishlistDrawer";
import { AuthModal } from "@/components/auth/AuthModal";
import { Toaster } from "sonner";

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
      <>
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
      </>
    );
  }

  return (
    <>
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      
      <main className="min-h-[calc(100vh-140px)]">
        {children}
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      {mounted && (
        <>
          <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          <CartDrawer />
          <WishlistDrawer />
          <AuthModal />
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
    </>
  );
}
