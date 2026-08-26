"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  Store, 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  Check
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [storeName, setStoreName] = useState("AETHER Hardware Labs");
  const [supportEmail, setSupportEmail] = useState("ops@aether-audio.test");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("8.0");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("100.0");
  const [standardShippingRate, setStandardShippingRate] = useState("15.0");
  const [priorityShippingRate, setPriorityShippingRate] = useState("25.0");

  const [initialSettings, setInitialSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await adminApi.getSettings();
        const init = {
          store_name: data.store_name?.value || "AETHER Sound Systems",
          support_email: data.support_email?.value || "support@aether-audio.test",
          currency: data.currency?.value || "USD",
          tax_rate: data.tax_rate?.value || "8.5",
          free_shipping_threshold: data.free_shipping_threshold?.value || "150",
          standard_shipping_rate: data.standard_shipping_rate?.value || "15",
          priority_shipping_rate: data.priority_shipping_rate?.value || "35",
        };
        setInitialSettings(init);
        if (data.store_name?.value) setStoreName(data.store_name.value);
        if (data.support_email?.value) setSupportEmail(data.support_email.value);
        if (data.currency?.value) setCurrency(data.currency.value);
        if (data.tax_rate?.value) setTaxRate(data.tax_rate.value);
        if (data.free_shipping_threshold?.value) setFreeShippingThreshold(data.free_shipping_threshold.value);
        if (data.standard_shipping_rate?.value) setStandardShippingRate(data.standard_shipping_rate.value);
        if (data.priority_shipping_rate?.value) setPriorityShippingRate(data.priority_shipping_rate.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const isDirty = Boolean(
    initialSettings && (
      storeName !== initialSettings.store_name ||
      supportEmail !== initialSettings.support_email ||
      currency !== initialSettings.currency ||
      taxRate !== initialSettings.tax_rate ||
      freeShippingThreshold !== initialSettings.free_shipping_threshold ||
      standardShippingRate !== initialSettings.standard_shipping_rate ||
      priorityShippingRate !== initialSettings.priority_shipping_rate
    )
  );

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) {
      toast.info("No changes were made.");
      return;
    }
    setSaving(true);

    const payload = {
      store_name: storeName,
      support_email: supportEmail,
      currency,
      tax_rate: taxRate,
      free_shipping_threshold: freeShippingThreshold,
      standard_shipping_rate: standardShippingRate,
      priority_shipping_rate: priorityShippingRate,
    };

    try {
      await adminApi.updateSettings(payload);
      setInitialSettings(payload);
      toast.success("System configurations updated successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        Loading system configurations...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Global Configurations
        </span>
        <h1 className="text-2xl font-black text-white">Store & Operational Settings</h1>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        
        {/* Brand & Store Identity */}
        <div className="p-6 rounded-3xl bg-[#0e121e] border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Store className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-black text-white">Storefront Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Official Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax */}
        <div className="p-6 rounded-3xl bg-[#0e121e] border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white">Financial & Tax Policies</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Default Base Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Logistics & Shipping */}
        <div className="p-6 rounded-3xl bg-[#0e121e] border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Truck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black text-white">Logistics & Shipping Calculations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Free Shipping Threshold ($)</label>
              <input
                type="number"
                step="1"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Standard Ground Rate ($)</label>
              <input
                type="number"
                step="1"
                value={standardShippingRate}
                onChange={(e) => setStandardShippingRate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Priority Express Rate ($)</label>
              <input
                type="number"
                step="1"
                value={priorityShippingRate}
                onChange={(e) => setPriorityShippingRate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 ${
              !isDirty
                ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5 shadow-none"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
            }`}
            title={!isDirty ? "No changes made to settings" : undefined}
          >
            <Save className="w-4 h-4" />
            {saving ? "Deploying Changes..." : "Save System Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
