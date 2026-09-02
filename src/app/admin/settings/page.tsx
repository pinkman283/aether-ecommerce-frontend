"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  Store, 
  DollarSign, 
  Truck, 
  RotateCcw, 
  Loader2
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { SettingsNavTabs } from "@/components/admin/settings/SettingsNavTabs";
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

  const handleReset = () => {
    if (!initialSettings) return;
    setStoreName(initialSettings.store_name);
    setSupportEmail(initialSettings.support_email);
    setCurrency(initialSettings.currency);
    setTaxRate(initialSettings.tax_rate);
    setFreeShippingThreshold(initialSettings.free_shipping_threshold);
    setStandardShippingRate(initialSettings.standard_shipping_rate);
    setPriorityShippingRate(initialSettings.priority_shipping_rate);
    toast.info("Settings reverted.");
  };

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
      toast.success("Store configurations updated successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading Store Configurations...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      
      {/* Settings Navigation Tabs */}
      <SettingsNavTabs />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">General Store Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure official store identity, currency, financial taxes, and default shipping rates</p>
        </div>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
          )}

          <button
            onClick={handleSaveSettings}
            disabled={saving || !isDirty}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ${
              isDirty && !saving
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20 ring-1 ring-amber-400/50"
                : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed opacity-40"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
        
        {/* 1. Store Identity */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
            <Store className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">General Store Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Official Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* 2. Financial & Currency */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Currency & Tax Policies</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Operational Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="USD" className="bg-[#0e121e]">USD ($) - US Dollar</option>
                <option value="BDT" className="bg-[#0e121e]">BDT (৳) - Bangladeshi Taka</option>
                <option value="EUR" className="bg-[#0e121e]">EUR (€) - Euro</option>
                <option value="GBP" className="bg-[#0e121e]">GBP (£) - British Pound</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Default Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* 3. Logistics & Shipping */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
            <Truck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Logistics & Default Shipping Rates</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Free Shipping Threshold ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Standard Delivery Rate ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={standardShippingRate}
                onChange={(e) => setStandardShippingRate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Priority Express Rate ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={priorityShippingRate}
                onChange={(e) => setPriorityShippingRate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-40 flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Store Configurations"}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
