import { ContentPageLayout } from "@/components/shared/ContentPageLayout";
import { BookOpen, Scale, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | AETHER Audio & Peripherals",
  description: "Terms and conditions governing the purchase, calibration, and use of AETHER hardware.",
};

export default function TermsOfServicePage() {
  return (
    <ContentPageLayout
      badge="Legal Framework"
      title="Terms of Service"
      description="The standard legal agreement establishing guidelines for hardware ordering, pricing accuracy, and user conduct."
      activeSlug="terms"
    >
      <div className="space-y-8 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--theme-text-body, #94a3b8)" }}>
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" /> 1. Agreement to Terms
          </h2>
          <p>
            By accessing the AETHER storefront, placing an order for acoustic hardware, peripherals, or modular daily carry items, you agree to be bound by these Terms of Service and all applicable national and international consumer regulations.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <CreditCard className="w-5 h-5 text-cyan-400 shrink-0" /> 2. Orders, Pricing & Payment Acceptance
          </h2>
          <p>
            All listed prices are displayed in either Bangladeshi Taka (৳/Tk) or USD ($) depending on your active localization configuration. While we strive for absolute accuracy, AETHER reserves the right to correct typographical pricing discrepancies prior to order fulfillment.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong className="text-white">Order Confirmation:</strong> An automated confirmation email verifies receipt of your order request. It does not constitute final contractual fulfillment until the order status changes to Dispatched.</li>
            <li><strong className="text-white">Cash on Delivery (COD):</strong> For COD orders, customers agree to pay the exact invoice total upon doorstep handover by the carrier.</li>
            <li><strong className="text-white">Promo Codes:</strong> Promotional vouchers are limited to one per order and cannot be combined unless explicitly stated.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Scale className="w-5 h-5 text-emerald-400 shrink-0" /> 3. Intellectual Property
          </h2>
          <p>
            All industrial designs, planar magnetic driver acoustic schematics, CNC keyboard frame specifications, brand iconography, and software customizers belong exclusively to AETHER Technologies, Inc. Unauthorized reproduction or reverse engineering is strictly prohibited.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" /> 4. Limitation of Liability
          </h2>
          <p>
            AETHER products are engineered to strict acoustic safety standards. Users are advised to adhere to recommended listening decibel thresholds. AETHER shall not be held liable for incidental hearing fatigue arising from extended misuse beyond designated acoustic volume levels.
          </p>
        </section>

      </div>
    </ContentPageLayout>
  );
}
