import type { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Live real-time courier telemetry and order dispatch tracking status.",
  openGraph: {
    type: "website",
    title: "Track Your Order",
    description: "Live real-time courier telemetry and order dispatch tracking status.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Your Order",
    description: "Live real-time courier telemetry and order dispatch tracking status.",
  },
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
