import { ContentPageLayout } from "@/components/shared/ContentPageLayout";
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Return & Refund Policy | AETHER Studio",
  description: "30-day risk-free acoustic evaluation and 2-year comprehensive hardware warranty.",
};

export default function RefundPolicyPage() {
  return (
    <ContentPageLayout
      badge="Warranty & Guarantee"
      title="Return & Refund Policy"
      description="Enjoy our 30-day risk-free trial and 2-year studio hardware warranty coverage."
      activeSlug="refund-policy"
    >
      <div className="space-y-8 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--theme-text-body, #94a3b8)" }}>
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <RotateCcw className="w-5 h-5 text-purple-400 shrink-0" /> 1. 30-Day Risk-Free Studio Trial
          </h2>
          <p>
            We believe true acoustic performance can only be evaluated in your personal listening environment. If your AETHER headphones, mechanical keyboard, or audio peripheral does not exceed your expectations, you may return it within 30 days of delivery for a 100% refund.
          </p>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
            <strong>Condition Requirement:</strong> Returned items must include original packaging, braided audio cables, modular adapters, and documentation without unauthorized physical modifications.
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" /> 2. 2-Year Comprehensive Studio Warranty
          </h2>
          <p>
            All flagship audio drivers, planar magnetic membranes, and CNC keyboard PCBs carry an automatic 2-year replacement and repair warranty against manufacturing defects, solder degradation, and transducer imbalances.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong className="text-white">Zero-Cost Diagnostics:</strong> Hardware inspection and acoustic recalibration at no charge.</li>
            <li><strong className="text-white">Prepaid RMA Return Labels:</strong> In verified warranty cases, AETHER covers 100% of the return transit cost.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> 3. Refund Processing Timelines
          </h2>
          <p>
            Once our diagnostic technicians inspect and log the returned unit:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong className="text-white">Mobile Wallets (bKash, Nagad, Rocket):</strong> 24 to 48 hours to your original sender wallet.</li>
            <li><strong className="text-white">Credit / Debit Cards:</strong> 5 to 7 business days depending on your issuing bank.</li>
            <li><strong className="text-white">Store Credit:</strong> Instant balance credit to your customer account profile.</li>
          </ul>
        </section>

      </div>
    </ContentPageLayout>
  );
}
