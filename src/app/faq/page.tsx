import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Quick answers regarding delivery timelines, acoustic calibrations, payment options, and warranty trials.",
  openGraph: {
    type: "website",
    title: "Frequently Asked Questions",
    description: "Quick answers regarding delivery timelines, acoustic calibrations, payment options, and warranty trials.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions",
    description: "Quick answers regarding delivery timelines, acoustic calibrations, payment options, and warranty trials.",
  },
};

export default function FAQPage() {
  return <FaqClient />;
}
