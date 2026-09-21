import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Inheliq customer care for fast WhatsApp support, order inquiries, and product guidance.",
  openGraph: {
    type: "website",
    title: "Contact Us | Inheliq",
    description: "Get in touch with Inheliq customer care for fast WhatsApp support, order inquiries, and product guidance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Inheliq",
    description: "Get in touch with Inheliq customer care for fast WhatsApp support, order inquiries, and product guidance.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
