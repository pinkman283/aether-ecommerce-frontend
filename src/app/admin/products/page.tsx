"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Layers,
  Package,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Tag,
  Star,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Category, Product, ProductImage } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { AdminDropdown } from "@/components/admin/AdminDropdown";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { toast } from "sonner";

interface ProductFormImage {
  id?: number;
  image_url: string;
  is_primary: boolean;
  alt_text?: string;
  source?: "upload" | "url";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // View Product Modal State
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [viewingActiveImage, setViewingActiveImage] = useState<string>("");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Bulk Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("1");
  const [brand, setBrand] = useState("AETHER Studio");
  const [price, setPrice] = useState("199.00");
  const [comparePrice, setComparePrice] = useState("249.00");
  const [stock, setStock] = useState("25");
  const [description, setDescription] = useState("");
  const [formImages, setFormImages] = useState<ProductFormImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirm Modal State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts({
          search: search.trim() || undefined,
          category_id: categoryId || undefined,
          stock_status: stockFilter !== "all" ? stockFilter : undefined,
          per_page: 50,
        }),
        adminApi.getCategories(),
      ]);

      setProducts(prodRes.data || []);
      setCategories(catRes || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryId, stockFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryId("");
    setStockFilter("all");
    setBadgeFilter("all");
    setSortBy("latest");
    adminApi.getProducts({ per_page: 50 }).then((res) => {
      setProducts(res.data || []);
    });
    toast.success("Filters reset to default.");
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName("");
    setCategory(categories[0]?.id?.toString() || "1");
    setBrand("AETHER Studio");
    setPrice("199.00");
    setComparePrice("249.00");
    setStock("25");
    setDescription("");
    setFormImages([
      {
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        is_primary: true,
        source: "url",
        alt_text: "Aether Horizon Studio DAC",
      },
    ]);
    setNewImageUrl("");
    setImageInputMode("upload");
    setIsFeatured(false);
    setIsNewArrival(true);
    setIsBestSeller(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category_id?.toString() || "1");
    setBrand(p.brand || "AETHER Studio");
    setPrice(p.price?.toString() || "0");
    setComparePrice(p.compare_at_price?.toString() || "");
    setStock(p.stock_quantity?.toString() || "0");
    setDescription(p.description || "");

    let initialImages: ProductFormImage[] = [];
    if (p.images && p.images.length > 0) {
      initialImages = p.images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        is_primary: Boolean(img.is_primary),
        alt_text: img.alt_text || p.name,
        source: img.image_url.includes("/storage/products/") ? "upload" : "url",
      }));
    } else if (p.primary_image?.image_url) {
      initialImages = [
        {
          id: p.primary_image.id,
          image_url: p.primary_image.image_url,
          is_primary: true,
          alt_text: p.primary_image.alt_text || p.name,
          source: p.primary_image.image_url.includes("/storage/products/") ? "upload" : "url",
        },
      ];
    }

    if (initialImages.length > 0 && !initialImages.some((img) => img.is_primary)) {
      initialImages[0].is_primary = true;
    }

    setFormImages(initialImages);
    setNewImageUrl("");
    setImageInputMode("upload");
    setIsFeatured(p.is_featured);
    setIsNewArrival(p.is_new_arrival);
    setIsBestSeller(p.is_best_seller);
    setIsModalOpen(true);
  };

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) {
      toast.error("Please enter a valid image URL.");
      return;
    }
    if (!/^https?:\/\/.+/i.test(url)) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    if (formImages.length >= 5) {
      toast.error("Maximum 5 images allowed per product.");
      return;
    }
    const isFirst = formImages.length === 0;
    setFormImages((prev) => [
      ...prev,
      {
        image_url: url,
        is_primary: isFirst,
        source: "url",
        alt_text: name || "Product Image",
      },
    ]);
    setNewImageUrl("");
    toast.success("Image URL added.");
  };

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - formImages.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 5 images allowed per product.");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.info(`Only uploading first ${remainingSlots} image(s) to stay within the 5-image limit.`);
    }

    setIsUploadingImage(true);
    try {
      const uploadedImages: ProductFormImage[] = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          toast.error(`'${file.name}' is not a valid image file.`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`'${file.name}' exceeds the 10MB maximum limit.`);
          continue;
        }

        const res = await adminApi.uploadProductImage(file);
        uploadedImages.push({
          image_url: res.image_url,
          is_primary: formImages.length === 0 && uploadedImages.length === 0,
          source: "upload",
          alt_text: file.name,
        });
      }

      if (uploadedImages.length > 0) {
        setFormImages((prev) => {
          const next = [...prev, ...uploadedImages];
          if (!next.some((img) => img.is_primary)) {
            next[0].is_primary = true;
          }
          return next;
        });
        toast.success(`Uploaded ${uploadedImages.length} image(s) from device.`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image from device.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      }))
    );
    toast.success(`Set image #${index + 1} as the primary cover.`);
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length > 0 && !next.some((img) => img.is_primary)) {
        next[0].is_primary = true;
      }
      return next;
    });
    toast.info("Image removed.");
  };

  const imagesChanged = Boolean(
    editingProduct && (
      JSON.stringify(formImages.map((img) => ({ url: img.image_url, primary: img.is_primary }))) !==
      JSON.stringify(
        (editingProduct.images && editingProduct.images.length > 0
          ? editingProduct.images
          : editingProduct.primary_image
          ? [editingProduct.primary_image]
          : []
        ).map((img) => ({ url: img.image_url, primary: Boolean(img.is_primary) }))
      )
    )
  );

  const isEditDirty = Boolean(
    editingProduct && (
      name.trim() !== (editingProduct.name || "").trim() ||
      category !== (editingProduct.category_id?.toString() || "1") ||
      brand.trim() !== (editingProduct.brand || "AETHER Studio").trim() ||
      price !== (editingProduct.price?.toString() || "0") ||
      comparePrice !== (editingProduct.compare_at_price?.toString() || "") ||
      stock !== (editingProduct.stock_quantity?.toString() || "0") ||
      description.trim() !== (editingProduct.description || "").trim() ||
      imagesChanged ||
      isFeatured !== editingProduct.is_featured ||
      isNewArrival !== editingProduct.is_new_arrival ||
      isBestSeller !== editingProduct.is_best_seller
    )
  );

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory Image Check
    if (formImages.length === 0) {
      toast.error("At least 1 product image is mandatory. Please upload an image or enter an image URL.");
      return;
    }
    if (formImages.length > 5) {
      toast.error("Maximum 5 images allowed per product.");
      return;
    }

    if (editingProduct && !isEditDirty) {
      toast.info("No changes were made.");
      return;
    }
    setSaving(true);

    const sanitizedImages = formImages.map((img, idx) => ({
      image_url: img.image_url,
      is_primary: img.is_primary,
      display_order: idx,
      alt_text: img.alt_text || name,
    }));
    if (!sanitizedImages.some((img) => img.is_primary)) {
      sanitizedImages[0].is_primary = true;
    }
    const primaryUrl = sanitizedImages.find((img) => img.is_primary)?.image_url || sanitizedImages[0].image_url;

    const payload = {
      name,
      category_id: Number(category),
      brand,
      price: Number(price),
      compare_at_price: comparePrice ? Number(comparePrice) : null,
      stock_quantity: Number(stock),
      description: description || "High performance studio grade hardware.",
      images: sanitizedImages,
      image_url: primaryUrl,
      is_featured: isFeatured,
      is_new_arrival: isNewArrival,
      is_best_seller: isBestSeller,
    };

    try {
      if (editingProduct) {
        const res = await adminApi.updateProduct(editingProduct.id, payload);
        setProducts(products.map((p) => (p.id === editingProduct.id ? res.product : p)));
        toast.success(`Updated '${res.product.name}'`);
      } else {
        const res = await adminApi.createProduct(payload);
        setProducts([res.product, ...products]);
        toast.success(`Created hardware '${res.product.name}'`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleting(true);

    try {
      await adminApi.deleteProduct(deletingProduct.id);
      setProducts(products.filter((p) => p.id !== deletingProduct.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingProduct.id));
      toast.success(`Product '${deletingProduct.name}' deleted.`);
      setDeletingProduct(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (displayedProducts.length > 0 && selectedIds.length === displayedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await adminApi.bulkDeleteProducts(selectedIds);
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      toast.success(res.message || `Deleted ${selectedIds.length} product(s).`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete selected products.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const displayedProducts = products
    .filter((p) => {
      if (badgeFilter === "featured") return p.is_featured;
      if (badgeFilter === "new_arrival") return p.is_new_arrival;
      if (badgeFilter === "best_seller") return p.is_best_seller;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price_desc") return Number(b.price) - Number(a.price);
      if (sortBy === "stock_asc") return Number(a.stock_quantity) - Number(b.stock_quantity);
      if (sortBy === "stock_desc") return Number(b.stock_quantity) - Number(a.stock_quantity);
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Catalog Administration
          </span>
          <h1 className="text-2xl font-black text-white">Hardware Products ({displayedProducts.length})</h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, name, or brand..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
          <AdminDropdown
            value={categoryId}
            onChange={(val) => setCategoryId(val)}
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
            ]}
          />

          <AdminDropdown
            value={stockFilter}
            onChange={(val) => setStockFilter(val)}
            options={[
              { value: "all", label: "All Stock Levels" },
              { value: "in_stock", label: "In Stock (>0)" },
              { value: "low_stock", label: "Low Stock (<=10)" },
              { value: "out_of_stock", label: "Out of Stock (0)" },
            ]}
          />

          <AdminDropdown
            value={badgeFilter}
            onChange={(val) => setBadgeFilter(val)}
            options={[
              { value: "all", label: "All Badges / Flags" },
              { value: "featured", label: "Featured Only" },
              { value: "new_arrival", label: "New Arrivals Only" },
              { value: "best_seller", label: "Best Sellers Only" },
            ]}
          />

          <AdminDropdown
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: "latest", label: "Sort: Latest" },
              { value: "price_asc", label: "Price: Low to High" },
              { value: "price_desc", label: "Price: High to Low" },
              { value: "stock_asc", label: "Stock: Low to High" },
              { value: "stock_desc", label: "Stock: High to Low" },
              { value: "name_asc", label: "Alphabetical (A-Z)" },
            ]}
          />

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            title="Reset all filters and search"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Products Table with Smooth Scrollbar & Cursor Dragging */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[760px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={displayedProducts.length > 0 && selectedIds.length === displayedProducts.length}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 cursor-pointer accent-amber-500"
                  title="Select all products"
                />
              </th>
              <th className="p-3.5">Product</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">SKU</th>
              <th className="p-3.5">Price</th>
              <th className="p-3.5">Stock</th>
              <th className="p-3.5">Rating</th>
              <th className="p-3.5 text-center min-w-[160px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  Loading hardware products...
                </td>
              </tr>
            ) : displayedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                  No hardware products match the current filters.
                </td>
              </tr>
            ) : (
              displayedProducts.map((p) => {
                const img = p.primary_image?.image_url || p.images?.[0]?.image_url;
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-amber-500/10 border-l-2 border-amber-500"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(p.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 cursor-pointer accent-amber-500"
                      />
                    </td>
                    <td className="p-3.5 flex items-center gap-3 font-bold text-white">
                      {img && (
                        <img
                          src={img}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="truncate max-w-xs block text-white font-bold">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{p.brand}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300 whitespace-nowrap">{p.category?.name || "Audio"}</td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">{p.sku}</td>
                    <td className="p-3.5 font-extrabold text-cyan-400 whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.stock_quantity > 10
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : p.stock_quantity > 0
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        }`}>
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-amber-400 whitespace-nowrap">
                      {Number(p.rating_average || 0).toFixed(1)}★ ({p.review_count})
                    </td>

                    {/* ICON-ONLY ACTION SYSTEM (UP TO 4 PER ROW) */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-start gap-1.5 flex-wrap w-[146px] mx-auto">
                        <button
                          onClick={() => setViewingProduct(p)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all shadow-sm"
                          title="Inspect Hardware"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-105 transition-all shadow-sm"
                          title="Edit Hardware"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all shadow-sm"
                          title="Delete Hardware"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollableTableCard>

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setViewingProduct(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-xl rounded-3xl bg-[#0e121e] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                  Hardware Telemetry & Specs
                </span>
                <h3 className="text-lg font-black text-white">{viewingProduct.name}</h3>
              </div>
              <button onClick={() => setViewingProduct(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <img
                  src={
                    viewingActiveImage ||
                    viewingProduct.primary_image?.image_url ||
                    viewingProduct.images?.[0]?.image_url ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={viewingProduct.name}
                  className="w-full h-48 rounded-2xl object-cover bg-slate-900 border border-white/10"
                />

                {/* Multi-image thumbnails strip */}
                {viewingProduct.images && viewingProduct.images.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 custom-horizontal-scrollbar">
                    {viewingProduct.images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setViewingActiveImage(img.image_url)}
                        className={`relative aspect-square w-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                          (viewingActiveImage === img.image_url || (!viewingActiveImage && (img.is_primary || idx === 0)))
                            ? "border-cyan-400 shadow-md shadow-cyan-400/20 scale-105"
                            : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                        }`}
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">SKU: <span className="text-white font-mono">{viewingProduct.sku}</span></span>
                  <span className="font-extrabold text-cyan-400 text-sm">{formatPrice(viewingProduct.price)}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category & Brand</span>
                  <p className="text-white font-bold">{viewingProduct.category?.name || "Audio"} • {viewingProduct.brand || "AETHER Studio"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Warehouse Stock</span>
                  <p className="text-amber-400 font-black text-sm">{viewingProduct.stock_quantity} Units Available</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rating & Feedback</span>
                  <p className="text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {Number(viewingProduct.rating_average || 0).toFixed(1)} / 5.0 ({viewingProduct.review_count} reviews)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-4">{viewingProduct.description}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <Link
                href={`/products/${viewingProduct.slug}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
              >
                <span>View on Storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </Link>

              <button
                onClick={() => {
                  const prod = viewingProduct;
                  setViewingProduct(null);
                  setViewingActiveImage("");
                  handleOpenEdit(prod);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-md"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-xl rounded-2xl bg-[#0e121e] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-black text-white">
              {editingProduct ? `Edit Hardware: ${editingProduct.name}` : "Create New Hardware Product"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name ?? ""}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aether Horizon Studio DAC"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Category</label>
                  <AdminDropdown
                    value={category ?? "1"}
                    onChange={(val) => setCategory(val)}
                    options={categories.map((c) => ({ value: c.id.toString(), label: c.name }))}
                    className="w-full"
                    buttonClassName="w-full py-2.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand ?? ""}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price ?? ""}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Compare Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={comparePrice ?? ""}
                    onChange={(e) => setComparePrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={stock ?? ""}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* INTERACTIVE MULTI-IMAGE MANAGER (MANDATORY 1 TO 5 IMAGES) */}
              {/* ========================================================= */}
              <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <label className="text-xs font-bold text-white">Product Imagery</label>
                    <span className="text-[10px] text-rose-400 font-black uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      * Mandatory
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border ${
                        formImages.length === 0
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : formImages.length === 5
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                      }`}
                    >
                      {formImages.length} / 5 Images
                    </span>
                  </div>
                </div>

                {/* Active Thumbnails Grid */}
                {formImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                    {formImages.map((img, idx) => (
                      <div
                        key={img.id ? `img-${img.id}` : `form-img-${idx}`}
                        className={`relative group rounded-xl overflow-hidden bg-slate-900 border transition-all ${
                          img.is_primary
                            ? "border-amber-400 ring-2 ring-amber-400/20 shadow-lg shadow-amber-400/10"
                            : "border-white/15 hover:border-white/30"
                        }`}
                      >
                        <div className="relative aspect-square w-full">
                          <img
                            src={img.image_url}
                            alt={img.alt_text || `Product image ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                        </div>

                        {/* Primary Badge & Toggle */}
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          title={img.is_primary ? "Primary Cover Image" : "Click to set as Primary Cover"}
                          className={`absolute top-1.5 left-1.5 p-1 rounded-md text-[10px] font-black flex items-center gap-1 backdrop-blur-md transition-all ${
                            img.is_primary
                              ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                              : "bg-black/60 text-slate-300 hover:text-amber-300 hover:bg-black/80"
                          }`}
                        >
                          <Star className={`w-3 h-3 ${img.is_primary ? "fill-slate-950" : ""}`} />
                          {img.is_primary && <span className="text-[9px]">Cover</span>}
                        </button>

                        {/* Delete Button */}
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove this image"
                            className="p-1 rounded-md bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white transition-all backdrop-blur-md"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom Source & Index Bar */}
                        <div className="p-1.5 bg-black/75 backdrop-blur-sm border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                          <span className="font-bold">#{idx + 1}</span>
                          <span className="px-1 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold text-slate-300 bg-white/10">
                            {img.source === "upload" ? "Device" : "URL"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1">
                    <AlertCircle className="w-5 h-5 text-rose-400 mx-auto" />
                    <p className="text-xs font-bold text-rose-300">No product images attached</p>
                    <p className="text-[11px] text-slate-400">
                      You must upload an image from your device or specify an image URL to publish this product.
                    </p>
                  </div>
                )}

                {/* Add Image Options (shown when < 5 images) */}
                {formImages.length < 5 ? (
                  <div className="space-y-2.5 pt-2 border-t border-white/5">
                    {/* Tabs for Input Method */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImageInputMode("upload")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          imageInputMode === "upload"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "bg-white/5 text-slate-400 hover:text-white border border-transparent"
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Device</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode("url")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          imageInputMode === "url"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                            : "bg-white/5 text-slate-400 hover:text-white border border-transparent"
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Direct Image URL</span>
                      </button>
                    </div>

                    {imageInputMode === "upload" ? (
                      /* Device Upload Box */
                      <div className="relative border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 rounded-xl p-4 text-center transition-all bg-cyan-500/[0.02] hover:bg-cyan-500/[0.05]">
                        <input
                          key="device-file-upload-input"
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isUploadingImage || formImages.length >= 5}
                          onChange={handleDeviceUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="space-y-1.5 pointer-events-none">
                          {isUploadingImage ? (
                            <div className="flex flex-col items-center justify-center gap-1 text-cyan-400">
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <span className="text-xs font-bold">Uploading & Optimizing image(s)...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-cyan-400 mx-auto" />
                              <div className="text-xs font-bold text-slate-200">
                                <span className="text-cyan-400 underline">Click to browse</span> or drag & drop images
                              </div>
                              <p className="text-[10px] text-slate-400">
                                PNG, JPG, WEBP, GIF up to 10MB • Can select multiple files ({5 - formImages.length} slots remaining)
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Direct Image URL Input */
                      <div className="flex gap-2">
                        <input
                          key="direct-image-url-input"
                          type="url"
                          value={newImageUrl || ""}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-400 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shrink-0 flex items-center gap-1 shadow-md shadow-purple-600/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add URL</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-[11px] font-bold text-amber-300">
                      Maximum 5 product images reached. Remove an existing image if you want to add another.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Description & Acoustic Specs</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Status checkboxes */}
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded bg-white/5 border-white/20"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded bg-white/5 border-white/20"
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded bg-white/5 border-white/20"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (editingProduct ? !isEditDirty : false)}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all shadow-md ${
                    editingProduct && !isEditDirty
                      ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                  title={editingProduct && !isEditDirty ? "No changes made to product details" : undefined}
                >
                  {saving ? "Saving..." : editingProduct ? "Update Hardware" : "Create Hardware"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeletingProduct(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0e121e] border border-rose-500/30 p-6 z-10 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Delete Product Confirmation</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">{deletingProduct.name}</span> (SKU: {deletingProduct.sku})? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteProduct}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={displayedProducts.length}
        itemName="product"
        isDeleting={isBulkDeleting}
        onClearSelection={() => setSelectedIds([])}
        onSelectAll={handleToggleSelectAll}
        onConfirmDelete={handleBulkDelete}
      />
    </div>
  );
}
