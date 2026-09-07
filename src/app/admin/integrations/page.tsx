"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Puzzle, 
  CreditCard, 
  Truck, 
  MessageSquare, 
  Mail, 
  MessageCircle, 
  BarChart3, 
  ShieldCheck, 
  Search, 
  Check, 
  X, 
  Loader2, 
  Settings, 
  Activity, 
  Zap, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ExternalLink,
  SlidersHorizontal,
  Lock,
  ArrowRight
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Integration, IntegrationStats } from "@/types";
import { AdminPageHeader, AdminStatStrip, AdminStatusBadge, AdminEmptyState } from "@/components/admin/ui";
import { toast } from "sonner";

const CATEGORY_TABS = [
  { id: "all", label: "All Integrations", icon: Puzzle },
  { id: "payment", label: "Payment Gateways", icon: CreditCard },
  { id: "courier", label: "Courier Logistics", icon: Truck },
  { id: "sms", label: "SMS & OTP", icon: MessageSquare },
  { id: "email", label: "SMTP Email", icon: Mail },
  { id: "whatsapp", label: "WhatsApp Bot", icon: MessageCircle },
  { id: "analytics", label: "Tracking Pixels", icon: BarChart3 },
  { id: "fraud", label: "Fraud Protection", icon: ShieldCheck },
];

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Configuration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<{
    is_enabled: boolean;
    is_test_mode: boolean;
    credentials: Record<string, any>;
    settings: Record<string, any>;
  }>({
    is_enabled: false,
    is_test_mode: true,
    credentials: {},
    settings: {},
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getIntegrations();
      setIntegrations(res.integrations || []);
      setStats(res.stats || null);
    } catch (err) {
      toast.error("Failed to load integrations list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (integration: Integration) => {
    try {
      const res = await adminApi.toggleIntegration(integration.provider);
      setIntegrations((prev) =>
        prev.map((item) =>
          item.provider === integration.provider ? { ...item, is_enabled: res.is_enabled } : item
        )
      );
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleTest = async (provider: string) => {
    setTestingProvider(provider);
    try {
      const res = await adminApi.testIntegration(provider);
      if (res.success) {
        toast.success(`[${res.latency_ms}ms] ${res.message}`);
      } else {
        toast.error(res.message);
      }
      setIntegrations((prev) =>
        prev.map((item) =>
          item.provider === provider
            ? {
                ...item,
                test_status: res.test_status as any,
                test_message: res.message,
                last_tested_at: res.last_tested_at,
              }
            : item
        )
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Connection test failed.");
    } finally {
      setTestingProvider(null);
    }
  };

  const handleOpenConfigure = (integration: Integration) => {
    setActiveIntegration(integration);
    setFormData({
      is_enabled: integration.is_enabled,
      is_test_mode: integration.is_test_mode,
      credentials: { ...(integration.credentials || {}) },
      settings: { ...(integration.settings || {}) },
    });
    setShowSecrets({});
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIntegration) return;

    setSaving(true);
    try {
      const res = await adminApi.updateIntegration(activeIntegration.provider, formData);
      setIntegrations((prev) =>
        prev.map((item) =>
          item.provider === activeIntegration.provider ? { ...item, ...res.integration } : item
        )
      );
      toast.success(res.message);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update integration settings.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return integrations.filter((item) => {
      const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.provider.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [integrations, selectedCategory, search]);

  const statItems = [
    {
      label: "Total Services",
      value: stats?.total ?? integrations.length,
      icon: Puzzle,
    },
    {
      label: "Active & Online",
      value: stats?.active ?? integrations.filter((i) => i.is_enabled).length,
      change: "Production ready",
      positive: true,
      icon: Zap,
    },
    {
      label: "Health Verified",
      value: stats?.connected ?? integrations.filter((i) => i.test_status === "connected").length,
      change: "Connected",
      positive: true,
      icon: ShieldCheck,
    },
    {
      label: "Integrations Hub",
      value: CATEGORY_TABS.length - 1,
      change: "Service clusters",
      icon: Activity,
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "payment": return CreditCard;
      case "courier": return Truck;
      case "sms": return MessageSquare;
      case "email": return Mail;
      case "whatsapp": return MessageCircle;
      case "analytics": return BarChart3;
      case "fraud": return ShieldCheck;
      default: return Puzzle;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <AdminPageHeader
        title="Third-Party Integrations Hub"
        subtitle="Configure API credentials, test connectivity, and orchestrate payment, courier, and communication gateways."
        badge={`${integrations.filter((i) => i.is_enabled).length} Enabled`}
        breadcrumbs={[
          { label: "Settings", href: "/admin/settings" },
          { label: "Integrations", href: "/admin/integrations" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Store Settings
            </Link>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Status
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <AdminStatStrip stats={statItems} />

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === "all"
              ? integrations.length
              : integrations.filter((i) => i.category === tab.id).length;
            const isActive = selectedCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-amber-500/30 text-amber-200" : "bg-white/5 text-slate-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161a26] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Grid of Integration Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-[#0f121b] border border-white/[0.08] rounded-2xl p-5 animate-pulse h-56" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title="No Integrations Found"
          description="Try changing the category tab filter or search query."
          icon={Puzzle}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const CatIcon = getCategoryIcon(item.category);
            const isTesting = testingProvider === item.provider;

            return (
              <div
                key={item.id}
                className="bg-[#0f121b] border border-white/[0.08] hover:border-white/15 rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                {/* Top Row: Icon & Status Toggle */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#161a26] border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                            {item.provider}
                          </span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] font-bold capitalize text-slate-400">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Active Toggle */}
                    <button
                      onClick={() => handleToggle(item)}
                      title={item.is_enabled ? "Deactivate integration" : "Activate integration"}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.is_enabled ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          item.is_enabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {item.description || "No description configured."}
                  </p>
                </div>

                {/* Bottom Meta & Actions */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  {/* Status Pills */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.test_status === "connected"
                            ? "bg-emerald-400 animate-pulse"
                            : item.test_status === "failed"
                            ? "bg-rose-500"
                            : "bg-amber-400"
                        }`}
                      />
                      <span className="font-semibold text-slate-300 capitalize">
                        {item.test_status === "connected"
                          ? "Connected"
                          : item.test_status === "failed"
                          ? "Check Credentials"
                          : "Untested"}
                      </span>
                    </div>

                    {item.is_test_mode ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Sandbox Mode
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Live Mode
                      </span>
                    )}
                  </div>

                  {item.test_message && (
                    <div className="text-[10px] text-slate-400 font-mono truncate bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                      {item.test_message}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleTest(item.provider)}
                      disabled={isTesting}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                    >
                      {isTesting ? (
                        <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                      ) : (
                        <Zap className="w-3 h-3 text-amber-400" />
                      )}
                      <span>{isTesting ? "Testing..." : "Test Ping"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenConfigure(item)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Configure</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Configuration Modal */}
      {isModalOpen && activeIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#0f121b] border border-white/10 rounded-2xl w-full max-w-[480px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0 bg-[#121624]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#161a26] border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {activeIntegration.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                    Provider: <span className="font-mono text-amber-300">{activeIntegration.provider}</span> ({activeIntegration.category})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 hover-scrollbar">
                {/* Toggles */}
                <div className="grid grid-cols-2 gap-2.5 bg-[#161a26] p-2.5 rounded-xl border border-white/5">
                  <label className="flex items-center justify-between cursor-pointer gap-2">
                    <span className="text-xs font-semibold text-slate-300">Enable Service</span>
                    <input
                      type="checkbox"
                      checked={formData.is_enabled}
                      onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-amber-500 bg-[#090b10] border-white/20 focus:ring-amber-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer gap-2">
                    <span className="text-xs font-semibold text-slate-300">Sandbox / Test Mode</span>
                    <input
                      type="checkbox"
                      checked={formData.is_test_mode}
                      onChange={(e) => setFormData({ ...formData, is_test_mode: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-amber-500 bg-[#090b10] border-white/20 focus:ring-amber-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Dynamic Credentials Form */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-amber-400" />
                      Authentication Credentials
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">Encrypted at rest</span>
                  </div>

                  {formData.credentials && Object.keys(formData.credentials).length > 0 ? (
                    Object.entries(formData.credentials).map(([k, val]) => {
                      const isSecret = /secret|password|token|key|auth/i.test(k);
                      const isVisible = showSecrets[k] || false;

                      return (
                        <div key={k} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-slate-300 capitalize">
                              {k.replace(/_/g, " ")}
                            </label>
                            {isSecret && (
                              <button
                                type="button"
                                onClick={() => setShowSecrets({ ...showSecrets, [k]: !isVisible })}
                                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {isVisible ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5 text-slate-400" />}
                                <span>{isVisible ? "Hide" : "Show"}</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type={isSecret && !isVisible ? "password" : "text"}
                              value={val || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  credentials: { ...formData.credentials, [k]: e.target.value },
                                })
                              }
                              className="w-full bg-[#161a26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-mono transition-colors"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2.5 bg-[#161a26] rounded-lg border border-white/5 text-xs text-slate-400">
                      No custom authentication credentials required for this service.
                    </div>
                  )}
                </div>

                {/* Dynamic Settings Fields */}
                {formData.settings && Object.keys(formData.settings).length > 0 && (
                  <div className="space-y-2.5 pt-1.5 border-t border-white/5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                      Service Parameters & Defaults
                    </h4>
                    {Object.entries(formData.settings).map(([k, val]) => (
                      <div key={k} className="space-y-1">
                        <label className="text-xs font-medium text-slate-300 capitalize">
                          {k.replace(/_/g, " ")}
                        </label>
                        <input
                          type={typeof val === "number" ? "number" : "text"}
                          value={val !== null && val !== undefined ? String(val) : ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: { ...formData.settings, [k]: e.target.value },
                            })
                          }
                          className="w-full bg-[#161a26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-[#0d1017] shrink-0">
                <button
                  type="button"
                  onClick={() => handleTest(activeIntegration.provider)}
                  disabled={testingProvider === activeIntegration.provider}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                >
                  {testingProvider === activeIntegration.provider ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Test Connection</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving..." : "Save Settings"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
