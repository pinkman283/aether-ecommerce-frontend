import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact & Support Hub",
  description: "Connect directly with our sound engineers, logistics coordinators, and customer support team.",
  openGraph: {
    type: "website",
    title: "Contact & Support Hub",
    description: "Connect directly with our sound engineers, logistics coordinators, and customer support team.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact & Support Hub",
    description: "Connect directly with our sound engineers, logistics coordinators, and customer support team.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
