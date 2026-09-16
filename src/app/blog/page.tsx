import type { Metadata } from "next";
import BlogCatalogClient from "./BlogCatalogClient";

export const metadata: Metadata = {
  title: "Hardware Stories & Guides",
  description: "In-depth technical reviews, acoustic engineering, setup walkthroughs, and studio announcements.",
  openGraph: {
    type: "website",
    title: "Hardware Stories & Guides",
    description: "In-depth technical reviews, acoustic engineering, setup walkthroughs, and studio announcements.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hardware Stories & Guides",
    description: "In-depth technical reviews, acoustic engineering, setup walkthroughs, and studio announcements.",
  },
};

export default function BlogPage() {
  return <BlogCatalogClient />;
}
