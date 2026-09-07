"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Reorder,
  motion,
  AnimatePresence
} from "framer-motion";
import { 
  Layers, 
  Plus, 
  GripVertical, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Tag,
  Headphones,
  Keyboard,
  Briefcase,
  Watch,
  Flame,
  Trophy,
  Zap,
  Boxes,
  Package,
  ShieldCheck,
  Star
} from "lucide-react";
import { SettingsNavTabs } from "@/components/admin/settings/SettingsNavTabs";
import { HomepageSectionModal } from "@/components/admin/homepage/HomepageSectionModal";
import { adminApi } from "@/lib/adminApi";
import { HomepageSection } from "@/types";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  Headphones,
  Keyboard,
  Briefcase,
  Sparkles,
  Watch,
  Layers,
  Flame,
  Trophy,
  Zap,
  Boxes,
  Package,
  ShieldCheck,
  Tag,
  Star,
};

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<HomepageSection | null>(null);

  // Load sections
  const loadSections = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getHomepageSections();
      setSections(res.data || []);
    } catch (err: any) {
      console.error("Failed to load homepage sections:", err);
      toast.error("Failed to load homepage sections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Handle Drag Reorder
  const handleReorder = async (newSections: HomepageSection[]) => {
    setSections(newSections);
    const sectionsPayload = newSections.map((s, idx) => ({ id: s.id, sort_order: idx }));
    setSavingOrder(true);
    try {
      await adminApi.reorderHomepageSections(sectionsPayload);
      toast.success("Homepage section order updated!", { id: "reorder-toast", duration: 1500 });
    } catch (err) {
      console.error("Failed to save reorder:", err);
      toast.error("Failed to update section order.");
    } finally {
      setSavingOrder(false);
    }
  };

  // Toggle active status
  const handleToggle = async (section: HomepageSection, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !section.is_active;

    // Optimistic update
    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, is_active: newStatus } : s))
    );

    try {
      await adminApi.toggleHomepageSection(section.id);
      toast.success(
        newStatus
          ? `"${section.title}" is now visible on storefront`
          : `"${section.title}" hidden from storefront`
      );
    } catch (err) {
      // Revert on error
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, is_active: !newStatus } : s))
      );
      toast.error("Failed to toggle section status.");
    }
  };

  // Duplicate section
  const handleDuplicate = async (section: HomepageSection, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      toast.loading("Duplicating section...", { id: "duplicate-toast" });
      const res = await adminApi.duplicateHomepageSection(section.id);
      toast.success(`Cloned section "${res.data.title}"`, { id: "duplicate-toast" });
      await loadSections();
    } catch (err: any) {
      console.error("Duplicate failed:", err);
      toast.error(err?.response?.data?.message || "Failed to duplicate section", { id: "duplicate-toast" });
    }
  };

  // Delete section
  const handleDelete = async (section: HomepageSection, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${section.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await adminApi.deleteHomepageSection(section.id);
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      toast.success(`Deleted section "${section.title}"`);
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err?.response?.data?.message || "Failed to delete section");
    }
  };

  // Open modal in create mode
  const handleCreate = () => {
    setSelectedSection(null);
    setIsModalOpen(true);
  };

  // Open modal in edit mode
  const handleEdit = (section: HomepageSection) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const activeCount = sections.filter((s) => s.is_active).length;
  const tabbedCount = sections.filter((s) => s.has_tabs && s.tabs && s.tabs.length > 0).length;

  return (
    <div className="space-y-6">
      {/* 1. Global Settings Tabs */}
      <SettingsNavTabs />

      {/* 2. Top Header & Primary Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Homepage Builder
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Live Storefront Sections
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Showcase & Category Sections</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure dynamic homepage product carousels, category spotlights, multi-tab filters, and sorting rules without editing code. Drag to reorder sections in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </Link>

          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Showcase Section</span>
          </button>
        </div>
      </div>

      {/* 3. Quick Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-400">Total Showcase Sections</span>
            <div className="text-xl font-black text-white">{sections.length}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-400">Active on Storefront</span>
            <div className="text-xl font-black text-emerald-400">{activeCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-400">Multi-Tab Showcases</span>
            <div className="text-xl font-black text-cyan-300">{tabbedCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Sections List Container */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Sections Ordering (Top to Bottom)
            </span>
            {savingOrder && (
              <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving order...
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            Drag rows using the handle icon to change order on homepage
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Homepage Sections Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add your first homepage product showcase section or click the button below to get started.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Section</span>
            </button>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={sections}
            onReorder={handleReorder}
            className="space-y-3"
          >
            {sections.map((section, index) => {
              const Icon = ICON_MAP[section.badge_icon || ""] || Layers;
              const isSmartLiving =
                section.title.toLowerCase().includes("smart living") ||
                section.category?.slug?.includes("smart-living");

              return (
                <Reorder.Item
                  key={section.id}
                  value={section}
                  className="rounded-2xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 transition-all p-4 select-none relative group shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Drag Handle, Number, and Section Info */}
                    <div className="flex items-start md:items-center gap-3.5 flex-1 min-w-0">
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors mt-0.5 md:mt-0">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Order Index Badge */}
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-cyan-400 shrink-0">
                        #{index + 1}
                      </div>

                      {/* Info & Badges */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">
                            {section.title}
                          </h3>

                          {section.badge_text && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              <Icon className="w-2.5 h-2.5 text-cyan-400" />
                              <span>{section.badge_text}</span>
                            </span>
                          )}

                          {isSmartLiving && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                              Bottom Banner Anchor
                            </span>
                          )}
                        </div>

                        {section.subtitle && (
                          <p className="text-xs text-slate-400 truncate max-w-xl">
                            {section.subtitle}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                          {section.category && (
                            <span className="text-slate-400">
                              Category: <strong className="text-slate-300">{section.category.name}</strong>
                            </span>
                          )}

                          {section.has_tabs ? (
                            <span className="text-cyan-400/90 font-medium">
                              {section.tabs?.length || 0} Tabs ({section.tabs?.map((t) => t.name).join(", ")})
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Source: <strong className="text-slate-300 capitalize">{section.source_type}</strong>
                            </span>
                          )}

                          <span>•</span>
                          <span>Limit: {section.product_limit || 14} items</span>
                          <span>•</span>
                          <span className="font-mono text-slate-400">
                            {section.view_all_label || "View All"} ({section.view_all_url || "auto"})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Toggle & Action Buttons */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                      {/* Active Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <div
                          onClick={(e) => handleToggle(section, e)}
                          className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                            section.is_active ? "bg-cyan-500" : "bg-slate-700"
                          }`}
                          title={section.is_active ? "Click to disable" : "Click to enable"}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              section.is_active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            section.is_active ? "text-cyan-400" : "text-slate-500"
                          }`}
                        >
                          {section.is_active ? "Active" : "Hidden"}
                        </span>
                      </div>

                      <div className="h-4 w-px bg-white/10 hidden md:block" />

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(section)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/15 hover:text-cyan-300 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
                          title="Edit Section"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDuplicate(section, e)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors border border-white/5"
                          title="Duplicate Section"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(section, e)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-colors border border-white/5"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>

      {/* 5. Modal for Add / Edit */}
      <HomepageSectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadSections}
        section={selectedSection}
      />
    </div>
  );
}
