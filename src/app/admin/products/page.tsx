"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
  ExternalLink,
  Tag,
  Star,
  RotateCcw
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Category, Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { AdminDropdown } from "@/components/admin/AdminDropdown";
import { toast } from "sonner";

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

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("1");
  const [brand, setBrand] = useState("AETHER Studio");
  const [price, setPrice] = useState("199.00");
  const [comparePrice, setComparePrice] = useState("249.00");
  const [stock, setStock] = useState("25");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setImageUrl("");
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
    setImageUrl(p.primary_image?.image_url || p.images?.[0]?.image_url || "");
    setIsFeatured(p.is_featured);
    setIsNewArrival(p.is_new_arrival);
    setIsBestSeller(p.is_best_seller);
    setIsModalOpen(true);
  };

  const isEditDirty = Boolean(
    editingProduct && (
      name.trim() !== (editingProduct.name || "").trim() ||
      category !== (editingProduct.category_id?.toString() || "1") ||
      brand.trim() !== (editingProduct.brand || "AETHER Studio").trim() ||
      price !== (editingProduct.price?.toString() || "0") ||
      comparePrice !== (editingProduct.compare_at_price?.toString() || "") ||
      stock !== (editingProduct.stock_quantity?.toString() || "0") ||
      description.trim() !== (editingProduct.description || "").trim() ||
      imageUrl.trim() !== (editingProduct.primary_image?.image_url || editingProduct.images?.[0]?.image_url || "").trim() ||
      isFeatured !== editingProduct.is_featured ||
      isNewArrival !== editingProduct.is_new_arrival ||
      isBestSeller !== editingProduct.is_best_seller
    )
  );

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && !isEditDirty) {
      toast.info("No changes were made.");
      return;
    }
    setSaving(true);

    const payload = {
      name,
      category_id: Number(category),
      brand,
      price: Number(price),
      compare_at_price: comparePrice ? Number(comparePrice) : null,
      stock_quantity: Number(stock),
      description: description || "High performance studio grade hardware.",
      image_url: imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
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
      toast.success(`Product '${deletingProduct.name}' deleted.`);
      setDeletingProduct(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleting(false);
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
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Loading hardware products...
                </td>
              </tr>
            ) : displayedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No hardware products match the current filters.
                </td>
              </tr>
            ) : (
              displayedProducts.map((p) => {
                const img = p.primary_image?.image_url || p.images?.[0]?.image_url;
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
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
                  src={viewingProduct.primary_image?.image_url || viewingProduct.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"}
                  alt={viewingProduct.name}
                  className="w-full h-48 rounded-2xl object-cover bg-slate-900 border border-white/10"
                />
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
                  setViewingProduct(null);
                  handleOpenEdit(viewingProduct);
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

          <div className="relative w-full max-w-xl rounded-3xl bg-[#0e121e] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-black text-white">
              {editingProduct ? `Edit Hardware: ${editingProduct.name}` : "Create New Hardware Product"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aether Horizon Studio DAC"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Category</label>
                  <AdminDropdown
                    value={category}
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
                    value={brand}
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
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Compare Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">High-Res Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                />
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
    </div>
  );
}
