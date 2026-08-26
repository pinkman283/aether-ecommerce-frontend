import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AETHER | Next-Gen Industrial Audio & Setup Gear",
  description: "State-of-the-art studio monitors, active noise-cancelling headphones, custom mechanical keyboards, and modular daily essentials.",
  keywords: ["Aether Audio", "Studio Headphones", "Mechanical Keyboard", "EDC Backpack", "Audiophile Gear"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${jakarta.variable} font-sans antialiased min-h-screen flex flex-col bg-[#090a0f] text-slate-100`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
