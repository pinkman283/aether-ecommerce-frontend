import { ContentPageLayout } from "@/components/shared/ContentPageLayout";
import { Shield, Lock, Eye, Server, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | AETHER Audio & Peripherals",
  description: "Learn how AETHER protects your personal information, telemetry data, and order history.",
};

export default function PrivacyPolicyPage() {
  return (
    <ContentPageLayout
      badge="Compliance & Data Protection"
      title="Privacy Policy"
      description="Our commitment to safeguarding your biometric calibrations, purchase telemetry, and customer account credentials."
      activeSlug="privacy"
    >
      <div className="space-y-8 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--theme-text-body, #94a3b8)" }}>
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Shield className="w-5 h-5 text-cyan-400 shrink-0" /> 1. Information We Collect
          </h2>
          <p>
            When you interact with AETHER Technologies through our storefront, mobile interfaces, or hardware calibration tools, we collect information necessary to fulfill your studio hardware orders and customize your audio soundstage preferences.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong className="text-white">Account Identification:</strong> Full name, verified email address, phone contact number, and hashed authentication keys.</li>
            <li><strong className="text-white">Logistics & Delivery Data:</strong> Physical street addresses, district and division routing codes, and delivery instructions.</li>
            <li><strong className="text-white">Commercial Transactions:</strong> Order line items, applied discount codes, payment gateway identifiers (e.g. bKash transaction tokens, SSLCommerz session references). We do not store raw cardholder CVC numbers.</li>
            <li><strong className="text-white">Acoustic & Device Telemetry:</strong> Anonymized frequency curve choices and hardware firmware revision queries.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Lock className="w-5 h-5 text-indigo-400 shrink-0" /> 2. How Your Data Is Utilized
          </h2>
          <p>
            Collected data is restricted solely to authentic commercial operations:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <h4 className="font-bold text-white text-xs">Order Fulfillment</h4>
              <p className="text-[11px] text-slate-400">Packaging, acoustic diagnostic checks, and dispatching couriers to your designated delivery point.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <h4 className="font-bold text-white text-xs">Fraud Prevention</h4>
              <p className="text-[11px] text-slate-400">Real-time IP telemetry and anomaly detection to prevent unauthorized account access and duplicate billing.</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Server className="w-5 h-5 text-emerald-400 shrink-0" /> 3. Data Storage & Cookie Policy
          </h2>
          <p>
            We utilize persistent local browser storage exclusively for holding cart contents (<code className="text-cyan-300 font-mono text-xs">ecom_cart_storage_v1</code>), customer wishlist preferences, and authenticated session tokens. We never sell, rent, or lease customer behavioral data to third-party ad brokers.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Eye className="w-5 h-5 text-pink-400 shrink-0" /> 4. Customer Rights & Data Erasure
          </h2>
          <p>
            You retain absolute sovereignty over your customer profile. You may edit your addresses, update your account email, or request complete account erasure at any time by contacting our data protection officer at <a href="mailto:privacy@aether.studio" className="text-cyan-400 hover:underline">privacy@aether.studio</a>.
          </p>
        </section>

      </div>
    </ContentPageLayout>
  );
}
