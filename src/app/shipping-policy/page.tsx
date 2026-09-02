import { ContentPageLayout } from "@/components/shared/ContentPageLayout";
import { Truck, MapPin, Clock, ShieldCheck, CheckCircle2, Box } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy | AETHER Studio",
  description: "Fast express delivery across all 64 districts of Bangladesh and global express shipping.",
};

export default function ShippingPolicyPage() {
  return (
    <ContentPageLayout
      badge="Logistics & Delivery"
      title="Shipping & Delivery Policy"
      description="Transparent shipping rates, doorstep fulfillment timelines, and real-time package tracking."
      activeSlug="shipping-policy"
    >
      <div className="space-y-8 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--theme-text-body, #94a3b8)" }}>
        
        {/* Delivery Rates Table / Cards */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Truck className="w-5 h-5 text-cyan-400 shrink-0" /> 1. Domestic Delivery Rates & Timelines (Bangladesh)
          </h2>
          <p>
            We operate automated fulfillment routes with verified domestic couriers (Steadfast, Pathao, RedX, Paperfly) covering all 64 districts of Bangladesh.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" /> Inside Dhaka Metro
                </span>
                <span className="text-base font-extrabold text-cyan-400">60 Tk</span>
              </div>
              <p className="text-slate-400 text-xs">
                Estimated Transit Time: <strong className="text-white">24 to 48 Hours</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Direct express courier dispatch directly from our Tejgaon studio hub.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" /> Outside Dhaka (All Districts)
                </span>
                <span className="text-base font-extrabold text-indigo-400">120 Tk</span>
              </div>
              <p className="text-slate-400 text-xs">
                Estimated Transit Time: <strong className="text-white">2 to 4 Business Days</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Secure doorstep dispatch to Chittagong, Sylhet, Rajshahi, Khulna, Barisal, and Rangpur divisions.
              </p>
            </div>
          </div>
        </section>

        {/* Free Shipping Qualification */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Box className="w-5 h-5 text-emerald-400 shrink-0" /> 2. Complimentary Free Express Shipping
          </h2>
          <p>
            Orders that exceed our promotional qualification threshold (or orders where an active free shipping voucher is applied) receive 100% complimentary express delivery. On the checkout page, the standard delivery charge is visibly credited back as an explicit <strong className="text-emerald-400 font-mono">-60 Tk / -120 Tk Free Delivery Discount</strong> line.
          </p>
        </section>

        {/* Package Tracking */}
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Clock className="w-5 h-5 text-purple-400 shrink-0" /> 3. Real-Time Telemetry & Tracking
          </h2>
          <p>
            Every dispatched shipment generates a tracking identifier (e.g. <code className="text-cyan-300 font-mono text-xs">AETH-BD-89421</code>). You can monitor your hardware calibration progress and carrier dispatch status 24/7 on our live <a href="/track" className="text-cyan-400 hover:underline font-bold">Order Tracking Page</a>.
          </p>
        </section>

      </div>
    </ContentPageLayout>
  );
}
