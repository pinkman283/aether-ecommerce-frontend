import { Suspense } from "react";
import { CustomerAuthView } from "@/components/auth/CustomerAuthView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Sign In | Account Access",
  description: "Sign in to your customer account to manage hardware orders, saved items, and shipping addresses.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CustomerAuthView defaultTab="login" />
    </Suspense>
  );
}
