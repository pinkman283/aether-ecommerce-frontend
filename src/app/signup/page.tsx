import { Suspense } from "react";
import { CustomerAuthView } from "@/components/auth/CustomerAuthView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Customer Account | Register",
  description: "Create an account to track shipments, access exclusive drops, and enjoy faster checkout.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CustomerAuthView defaultTab="register" />
    </Suspense>
  );
}
