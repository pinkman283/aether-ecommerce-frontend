import type { Metadata } from "next";
import ProductCatalogClient from "./ProductCatalogClient";

export const metadata: Metadata = {
  title: "Hardware Archive & Catalog",
  description: "Browse our entire collection of acoustic planar headphones, CNC mechanical keyboards, modular EDC packs, and smart studio peripherals.",
  openGraph: {
    type: "website",
    title: "Hardware Archive & Catalog",
    description: "Browse our entire collection of acoustic planar headphones, CNC mechanical keyboards, modular EDC packs, and smart studio peripherals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hardware Archive & Catalog",
    description: "Browse our entire collection of acoustic planar headphones, CNC mechanical keyboards, modular EDC packs, and smart studio peripherals.",
  },
};

export default function ProductsPage() {
  return <ProductCatalogClient />;
}
