"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Store, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Loader2,
  Plus,
  AlertTriangle,
  Globe,
  X,
  Layers,
  Check,
  RotateCcw
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { useThemeStore, DEFAULT_THEME_SETTINGS } from "@/store/useThemeStore";
import { SettingsNavTabs } from "@/components/admin/settings/SettingsNavTabs";
import { ImageUploadGuidance } from "@/components/admin/ui/ImageUploadGuidance";
import { AdminSaveBar } from "@/components/admin/ui";
import { toast } from "sonner";

interface BrandLogoPlacementRecord {
  id: number;
  logo_id: number;
  placement: string;
}

interface BrandLogo {
  id: number;
  name: string | null;
  image_url: string;
  is_active?: boolean;
  placements: BrandLogoPlacementRecord[];
}

interface PlacementOption {
  id: string;
  label: string;
  description: string;
  recommended: string;
}

const DEFAULT_PLACEMENTS: PlacementOption[] = [
  { id: "navbar", label: "Desktop Navbar", description: "Top header logo on desktop screens", recommended: "240 × 60 px · 4:1" },
  { id: "mobile_navbar", label: "Mobile Navbar", description: "Compact header logo for mobile screens", recommended: "180 × 50 px · 3.6:1" },
  { id: "footer", label: "Footer", description: "Bottom storefront brand footer column", recommended: "240 × 60 px · 4:1" },
  { id: "auth", label: "Customer Auth", description: "Centered branding above customer sign-in", recommended: "200 × 50 px · 4:1" },
  { id: "invoice", label: "Invoices & Receipts", description: "Printable receipts and order invoices", recommended: "220 × 60 px · 3.6:1" },
  { id: "split_reveal", label: "Splash / Split Screen", description: "Centered shutter reveal on entrance", recommended: "512 × 512 px · 1:1" },
];

export default function AdminBrandingPage() {
  const { theme, setTheme: updateClientTheme } = useThemeStore();
  
  const [loading, setLoading] = useState(true);
  const [savingIdentity, setSavingIdentity] = useState(false);

  // Identity State
  const [brandName, setBrandName] = useState(DEFAULT_THEME_SETTINGS.store_brand_name);
  const [brandTagline, setBrandTagline] = useState(DEFAULT_THEME_SETTINGS.store_brand_tagline);
  const [initialIdentity, setInitialIdentity] = useState({ name: "", tagline: "" });

  // Favicon State
  const [faviconUrl, setFaviconUrl] = useState("");
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Brand Logos State
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [savedLogos, setSavedLogos] = useState<BrandLogo[]>([]);
  const [savingPlacements, setSavingPlacements] = useState(false);
  const [availablePlacements, setAvailablePlacements] = useState<PlacementOption[]>(DEFAULT_PLACEMENTS);
  const [logoUploadingId, setLogoUploadingId] = useState<number | "new" | null>(null);

  // New Logo Modal / Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLogoName, setNewLogoName] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const [newLogoPlacements, setNewLogoPlacements] = useState<string[]>([]);
  const newLogoFileRef = useRef<HTMLInputElement>(null);
  const [creatingLogo, setCreatingLogo] = useState(false);

  // Conflict Confirmation Modal State
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    placement: string;
    placementLabel: string;
    existingLogoName: string;
    targetLogoId: number;
  }>({
    isOpen: false,
    placement: "",
    placementLabel: "",
    existingLogoName: "",
    targetLogoId: 0,
  });

  // Load all branding settings
  async function loadData() {
    try {
      setLoading(true);
      const [themeRes, brandingRes] = await Promise.all([
        adminApi.getThemeSettings(),
        adminApi.getBrandLogos().catch(() => ({ logos: [], favicon: "", available_placements: DEFAULT_PLACEMENTS })),
      ]);

      const s = themeRes.settings || {};
      setBrandName(s.store_brand_name || DEFAULT_THEME_SETTINGS.store_brand_name);
      setBrandTagline(s.store_brand_tagline || DEFAULT_THEME_SETTINGS.store_brand_tagline);
      setInitialIdentity({
        name: s.store_brand_name || DEFAULT_THEME_SETTINGS.store_brand_name,
        tagline: s.store_brand_tagline || DEFAULT_THEME_SETTINGS.store_brand_tagline,
      });

      setFaviconUrl(brandingRes.favicon || s.store_favicon || "");
      const resolvedLogos: BrandLogo[] = (brandingRes.logos && brandingRes.logos.length > 0)
        ? (brandingRes.logos as BrandLogo[])
        : (s.store_brand_logo ? [{
            id: 1,
            name: "Primary Store Logo",
            image_url: s.store_brand_logo,
            is_active: true,
            placements: [
              { id: 1, logo_id: 1, placement: "navbar" },
              { id: 2, logo_id: 1, placement: "footer" },
              { id: 3, logo_id: 1, placement: "split_reveal" },
            ],
          }] : []);
      setLogos(resolvedLogos);
      setSavedLogos(resolvedLogos);
      if (brandingRes.available_placements && brandingRes.available_placements.length > 0) {
        setAvailablePlacements(brandingRes.available_placements);
      }
    } catch (err) {
      console.error("Failed to load branding data:", err);
      toast.error("Failed to load branding settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Identity Dirty State
  const isIdentityDirty =
    brandName.trim() !== initialIdentity.name.trim() ||
    brandTagline.trim() !== initialIdentity.tagline.trim();

  // Favicon Handlers
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Favicon must be less than 2MB.");
      return;
    }

    setUploadingFavicon(true);
    try {
      const uploadRes = await adminApi.uploadBrandingAsset(file);
      await adminApi.updateFavicon(uploadRes.image_url);
      setFaviconUrl(uploadRes.image_url);
      updateClientTheme({ store_favicon: uploadRes.image_url });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("store_favicon_updated", { detail: uploadRes.image_url }));
      }
      toast.success("Store favicon updated successfully! Browser tabs will display the new icon.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload favicon.");
    } finally {
      setUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    }
  };

  const handleRemoveFavicon = async () => {
    try {
      await adminApi.removeFavicon();
      setFaviconUrl("");
      updateClientTheme({ store_favicon: "" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("store_favicon_updated", { detail: "" }));
      }
      toast.info("Favicon removed. Default browser icon restored.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove favicon.");
    }
  };

  // Helper to get placement keys for a logo
  const getLogoPlacements = (logo: BrandLogo): string[] => {
    return (logo.placements || []).map((p) => (typeof p === "string" ? p : p.placement));
  };

  // Fingerprint for dirty checking placements
  const getPlacementsFingerprint = (list: BrandLogo[]) => {
    return list
      .map((l) => ({
        id: l.id,
        placements: getLogoPlacements(l).slice().sort(),
      }))
      .sort((a, b) => a.id - b.id);
  };

  const isPlacementsDirty = useMemo(() => {
    return JSON.stringify(getPlacementsFingerprint(logos)) !== JSON.stringify(getPlacementsFingerprint(savedLogos));
  }, [logos, savedLogos]);

  // Unified page-wide dirty state and saving state
  const isDirty = isPlacementsDirty || isIdentityDirty;
  const isSaving = savingPlacements || savingIdentity;

  // Warn on page unload if changes are pending
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Find logo currently holding a placement
  const findLogoWithPlacement = (placementKey: string): BrandLogo | undefined => {
    return logos.find((l) => getLogoPlacements(l).includes(placementKey));
  };

  // Toggle placement on an existing logo (pure local staging)
  const handleTogglePlacement = (targetLogo: BrandLogo, placementKey: string) => {
    const currentPlacements = getLogoPlacements(targetLogo);
    const isCurrentlyChecked = currentPlacements.includes(placementKey);

    setLogos((prevLogos) =>
      prevLogos.map((l) => {
        const logoPlacements = getLogoPlacements(l);
        if (l.id === targetLogo.id) {
          // Toggle on/off for target logo
          const nextPlacements = isCurrentlyChecked
            ? logoPlacements.filter((p) => p !== placementKey)
            : Array.from(new Set([...logoPlacements, placementKey]));

          return {
            ...l,
            placements: nextPlacements.map((p, idx) => ({
              id: idx + 1,
              logo_id: l.id,
              placement: p,
            })),
          };
        } else {
          // If turning this placement ON on targetLogo, remove it from any other logo to enforce 1-to-1 surface placement
          if (!isCurrentlyChecked && logoPlacements.includes(placementKey)) {
            const nextPlacements = logoPlacements.filter((p) => p !== placementKey);
            return {
              ...l,
              placements: nextPlacements.map((p, idx) => ({
                id: idx + 1,
                logo_id: l.id,
                placement: p,
              })),
            };
          }
          return l;
        }
      })
    );
  };

  // Confirm reassignment from conflict modal
  const handleConfirmReassignment = () => {
    const { targetLogoId, placement } = conflictModal;
    setConflictModal((prev) => ({ ...prev, isOpen: false }));

    const targetLogo = logos.find((l) => l.id === targetLogoId);
    if (!targetLogo) return;

    handleTogglePlacement(targetLogo, placement);
  };

  // Discard all unstaged changes across identity and placements
  const handleDiscardAll = () => {
    setLogos(JSON.parse(JSON.stringify(savedLogos)));
    setBrandName(initialIdentity.name);
    setBrandTagline(initialIdentity.tagline);
    toast.info("All unsaved changes discarded.");
  };

  // Unified save handler committing both identity and placements in one operation
  const handleSaveAll = async () => {
    if (!isDirty || isSaving) return;

    setSavingPlacements(true);
    setSavingIdentity(true);
    try {
      const promises: Promise<any>[] = [];

      if (isPlacementsDirty) {
        const payload = logos.map((l) => ({
          logo_id: l.id,
          placements: getLogoPlacements(l),
          image_url: l.image_url,
          name: l.name,
        }));
        promises.push(adminApi.updateAllBrandPlacements(payload));
      }

      if (isIdentityDirty) {
        promises.push(
          (async () => {
            const themeRes = await adminApi.getThemeSettings();
            const payload = {
              ...themeRes.settings,
              store_brand_name: brandName.trim(),
              store_brand_tagline: brandTagline.trim(),
            };
            await adminApi.updateThemeSettings(payload);
            updateClientTheme(payload);
            setInitialIdentity({ name: brandName.trim(), tagline: brandTagline.trim() });
          })()
        );
      }

      await Promise.all(promises);

      if (isPlacementsDirty) {
        setSavedLogos(JSON.parse(JSON.stringify(logos)));
        const navLogo = logos.find((l) => getLogoPlacements(l).includes("navbar"));
        const splitLogo = logos.find((l) => getLogoPlacements(l).includes("split_reveal"));

        const themeUpdates: Record<string, string> = {};
        if (navLogo) {
          themeUpdates.store_brand_logo = navLogo.image_url;
        }
        if (splitLogo) {
          themeUpdates.split_reveal_logo = splitLogo.image_url;
        }
        if (Object.keys(themeUpdates).length > 0) {
          updateClientTheme(themeUpdates);
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("store_brand_logo_updated", { detail: navLogo?.image_url || "" }));
          window.dispatchEvent(new CustomEvent("theme_updated", { detail: themeUpdates }));
        }
      }

      toast.success("Branding settings saved successfully!");
    } catch (err: any) {
      console.error("Failed to save branding settings:", err);
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSavingPlacements(false);
      setSavingIdentity(false);
    }
  };

  // Rename a logo
  const handleRenameLogo = async (logoId: number, newName: string) => {
    try {
      const targetLogo = logos.find((l) => l.id === logoId);
      if (!targetLogo) return;
      await adminApi.updateBrandLogo(logoId, {
        name: newName,
        image_url: targetLogo.image_url,
        placements: getLogoPlacements(targetLogo),
      });
      setLogos((prev) =>
        prev.map((l) => (l.id === logoId ? { ...l, name: newName } : l))
      );
      setSavedLogos((prev) =>
        prev.map((l) => (l.id === logoId ? { ...l, name: newName } : l))
      );
      toast.success("Logo label updated.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update logo name.");
    }
  };

  // Replace logo image file
  const handleReplaceLogoImage = async (logoId: number, file: File) => {
    setLogoUploadingId(logoId);
    try {
      const uploadRes = await adminApi.uploadBrandingAsset(file);
      const targetLogo = logos.find((l) => l.id === logoId);
      if (!targetLogo) return;

      await adminApi.updateBrandLogo(logoId, {
        name: targetLogo.name || undefined,
        image_url: uploadRes.image_url,
        placements: getLogoPlacements(targetLogo),
      });

      const brandingRes = await adminApi.getBrandLogos();
      setLogos(brandingRes.logos || []);
      setSavedLogos(brandingRes.logos || []);
      toast.success("Logo image replaced successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to replace logo image.");
    } finally {
      setLogoUploadingId(null);
    }
  };

  // Delete a logo
  const handleDeleteLogo = async (logoId: number) => {
    if (logos.length <= 1) {
      toast.error("You must keep at least one logo entry. Replace it instead of deleting.");
      return;
    }

    if (!confirm("Are you sure you want to delete this logo? Any placements assigned to it will become unassigned.")) {
      return;
    }

    try {
      await adminApi.deleteBrandLogo(logoId);
      const brandingRes = await adminApi.getBrandLogos();
      setLogos(brandingRes.logos || []);
      setSavedLogos(brandingRes.logos || []);
      toast.success("Logo deleted successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete logo.");
    }
  };

  // Create New Logo Modal Handlers
  const handleCreateLogo = async () => {
    if (!newLogoUrl.trim()) {
      toast.error("Please upload an image or provide a valid logo image URL.");
      return;
    }

    setCreatingLogo(true);
    try {
      await adminApi.createBrandLogo({
        name: newLogoName.trim() || undefined,
        image_url: newLogoUrl.trim(),
        placements: newLogoPlacements,
      });

      const brandingRes = await adminApi.getBrandLogos();
      setLogos(brandingRes.logos || []);
      setSavedLogos(brandingRes.logos || []);
      setShowAddModal(false);
      setNewLogoName("");
      setNewLogoUrl("");
      setNewLogoPlacements([]);
      toast.success("New logo added successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add new logo.");
    } finally {
      setCreatingLogo(false);
    }
  };

  const handleNewLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploadingId("new");
    try {
      const uploadRes = await adminApi.uploadBrandingAsset(file);
      setNewLogoUrl(uploadRes.image_url);
      toast.success("Logo file uploaded!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload logo.");
    } finally {
      setLogoUploadingId(null);
      if (newLogoFileRef.current) newLogoFileRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading Branding Settings...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl pb-16">
      {/* Settings Navigation Tabs */}
      <SettingsNavTabs />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Branding & Logo Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure isolated browser favicons, multi-surface brand logos, and dynamic placement routing.
          </p>
        </div>
      </div>

      {/* SECTION 1: SEPARATE FAVICON SETTING */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0e17] border border-white/10 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Browser Favicon</h3>
              <p className="text-[11px] text-slate-400">
                Independent icon for browser tabs, address bar, bookmarks, and PWA mobile home screen shortcuts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          {/* Favicon Visual Preview Box */}
          <div className="relative w-16 h-16 rounded-xl border border-white/15 bg-[#121622] flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt="Store Favicon"
                className="w-10 h-10 object-contain drop-shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 text-[10px] font-semibold text-center px-1">
                <Globe className="w-5 h-5 mb-0.5 text-slate-600" />
                <span>None</span>
              </div>
            )}
            {uploadingFavicon && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              </div>
            )}
          </div>

          {/* Favicon Info & Guidance */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">
                {faviconUrl ? "Custom Favicon Active" : "No Custom Favicon Set (Using Default)"}
              </span>
              {faviconUrl && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              )}
            </div>
            
            {/* Direct Recommendation Label */}
            <ImageUploadGuidance slotKey="admin_branding_favicon" layout="row" />
          </div>

          {/* Favicon Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={faviconInputRef}
              onChange={handleFaviconUpload}
              accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => faviconInputRef.current?.click()}
              disabled={uploadingFavicon}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingFavicon ? "Uploading..." : faviconUrl ? "Replace Favicon" : "Upload Favicon"}</span>
            </button>

            {faviconUrl && (
              <button
                type="button"
                onClick={handleRemoveFavicon}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Remove favicon"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: EXTENSIBLE BRAND LOGOS & PLACEMENT ROUTING */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0e17] border border-white/10 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Brand Logos & Surface Placements</h3>
              <p className="text-[11px] text-slate-400">
                Manage multiple logo marks (horizontal, vertical, monochrome, dark mode) and control where each is rendered.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add another logo</span>
          </button>
        </div>

        {/* Logo Cards List */}
        <div className="space-y-4">
          {logos.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10 space-y-3">
              <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs text-slate-400">No brand logos configured yet.</p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Primary Logo</span>
              </button>
            </div>
          ) : (
            logos.map((logo, index) => {
              const assignedKeys = getLogoPlacements(logo);
              const isUploadingThis = logoUploadingId === logo.id;

              return (
                <div
                  key={logo.id}
                  className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/8 space-y-4 hover:border-white/15 transition-all"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* Left: Logo Preview Box + Name Input */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-28 h-16 rounded-xl border border-white/10 bg-[#121622] flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-sm">
                        <img
                          src={logo.image_url}
                          alt={logo.name || `Logo ${index + 1}`}
                          className="max-w-full max-h-full object-contain drop-shadow-sm"
                        />
                        {isUploadingThis && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          type="text"
                          defaultValue={logo.name || ""}
                          placeholder={`Logo #${index + 1} (e.g. Primary Horizontal)`}
                          onBlur={(e) => {
                            if (e.target.value !== (logo.name || "")) {
                              handleRenameLogo(logo.id, e.target.value.trim());
                            }
                          }}
                          className="w-full bg-white/5 hover:bg-white/8 focus:bg-white/10 border border-transparent focus:border-cyan-500/40 rounded-lg px-2.5 py-1 text-xs font-bold text-white transition-all focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <ImageUploadGuidance slotKey="admin_branding_logo" layout="inline" />
                        </div>
                      </div>
                    </div>

                    {/* Right: Replace & Remove Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                      <label className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isUploadingThis ? "Replacing..." : "Replace"}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          disabled={isUploadingThis}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReplaceLogoImage(logo.id, file);
                          }}
                        />
                      </label>

                      {logos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteLogo(logo.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                          title="Delete logo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Surface Placements Checkbox Group */}
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Assigned Placements
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {availablePlacements.map((placement) => {
                        const isChecked = assignedKeys.includes(placement.id);
                        const otherHolder = !isChecked ? findLogoWithPlacement(placement.id) : undefined;

                        return (
                          <button
                            key={placement.id}
                            type="button"
                            onClick={() => handleTogglePlacement(logo, placement.id)}
                            className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              isChecked
                                ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-sm ring-1 ring-cyan-500/20"
                                : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04] hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold leading-tight truncate">
                                {placement.label}
                              </span>
                              <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ml-1.5 border transition-colors ${
                                  isChecked
                                    ? "bg-cyan-500 border-cyan-400 text-slate-950"
                                    : "border-white/20 bg-transparent"
                                }`}
                              >
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>

                            {otherHolder && otherHolder.id !== logo.id && (
                              <span className="text-[9px] text-amber-400/80 truncate mt-1">
                                Used by {otherHolder.name || `#${otherHolder.id}`}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 3: STORE IDENTITY DETAILS (NAME, TAGLINE, MONOGRAM) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0e17] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Store Identity Details</h3>
              <p className="text-[11px] text-slate-400">
                Official store title and tagline shown when logos are loading or as browser title fallbacks.
              </p>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">Brand Title</label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">Brand Subtitle / Tagline</label>
            <input
              type="text"
              value={brandTagline}
              onChange={(e) => setBrandTagline(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* MODAL: ADD ANOTHER LOGO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Add Another Brand Logo</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Optional Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Logo Label (Optional)</label>
                <input
                  type="text"
                  value={newLogoName}
                  onChange={(e) => setNewLogoName(e.target.value)}
                  placeholder="e.g., Mobile Header Mark, Footer Dark Version"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Upload or URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Logo Image</label>
                
                {/* Upload Guidance */}
                <ImageUploadGuidance slotKey="admin_branding_logo" layout="row" />

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={newLogoFileRef}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleNewLogoFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => newLogoFileRef.current?.click()}
                    disabled={logoUploadingId === "new"}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{logoUploadingId === "new" ? "Uploading..." : "Upload File"}</span>
                  </button>
                  <input
                    type="text"
                    value={newLogoUrl}
                    onChange={(e) => setNewLogoUrl(e.target.value)}
                    placeholder="or paste image URL https://..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {newLogoUrl && (
                  <div className="mt-2 p-3 rounded-xl bg-[#121622] border border-white/10 flex items-center justify-center h-20">
                    <img src={newLogoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              {/* Initial Placements */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Initial Placements</label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePlacements.map((p) => {
                    const isChecked = newLogoPlacements.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setNewLogoPlacements((prev) =>
                            prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                          );
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                            : "bg-white/[0.02] border-white/5 text-slate-400"
                        }`}
                      >
                        <span>{p.label}</span>
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                            isChecked ? "bg-cyan-500 border-cyan-400 text-slate-950" : "border-white/20"
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateLogo}
                disabled={creatingLogo || !newLogoUrl}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {creatingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Add Logo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REASSIGN PLACEMENT CONFLICT */}
      {conflictModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white">Reassign Placement?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The <strong className="text-white">{conflictModal.placementLabel}</strong> placement is currently assigned to <strong className="text-cyan-400">{conflictModal.existingLogoName}</strong>.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reassigning will make this logo active on <strong className="text-white">{conflictModal.placementLabel}</strong> instead. Each placement can only have one active logo at a time.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConflictModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassignment}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
              >
                Reassign to This Logo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Contextual Unsaved Changes Dock */}
      <AdminSaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSaveAll}
        onDiscard={handleDiscardAll}
        saveLabel="Save Changes"
        discardLabel="Discard"
        message="Unsaved branding changes"
      />
    </div>
  );
}
