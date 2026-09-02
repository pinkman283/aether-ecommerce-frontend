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
  Link as LinkIcon,
  Building2,
  FolderTree,
  Palette,
  CheckCircle2
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Brand, Category, Product, ProductImage } from "@/types";
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

interface ProductFormVariant {
  id?: number;
  name: string;
  color_name?: string | null;
  color_hex?: string | null;
  stock_quantity: number;
  price_modifier?: number;
}

const COLOR_PRESETS = [
  { name: "Stealth Black", hex: "#0f172a" },
  { name: "Pure White", hex: "#f8fafc" },
  { name: "Space Gray", hex: "#64748b" },
  { name: "Cyber Cyan", hex: "#06b6d4" },
  { name: "Crimson Red", hex: "#ef4444" },
  { name: "Olive Green", hex: "#3f6212" },
  { name: "Royal Gold", hex: "#d97706" },
  { name: "Deep Navy", hex: "#1e3a8a" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
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

  // Quick-Add Category Modal State
  const [isQuickCategoryModalOpen, setIsQuickCategoryModalOpen] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState("");
  const [quickCategoryDescription, setQuickCategoryDescription] = useState("");
  const [quickCategoryIcon, setQuickCategoryIcon] = useState("Sparkles");
  const [quickCategorySaving, setQuickCategorySaving] = useState(false);

  // Quick-Add Brand Modal State
  const [isQuickBrandModalOpen, setIsQuickBrandModalOpen] = useState(false);
  const [quickBrandName, setQuickBrandName] = useState("");
  const [quickBrandWebsite, setQuickBrandWebsite] = useState("");
  const [quickBrandDescription, setQuickBrandDescription] = useState("");
  const [quickBrandSaving, setQuickBrandSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("1");
  const [brand, setBrand] = useState("AETHER Studio");
  const [price, setPrice] = useState("0");
  const [comparePrice, setComparePrice] = useState("0");
  const [stock, setStock] = useState("0");
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

  // Color Variants & Stock Inventory State
  const [formVariants, setFormVariants] = useState<ProductFormVariant[]>([]);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantColorHex, setNewVariantColorHex] = useState("#0f172a");
  const [newVariantStock, setNewVariantStock] = useState("20");
  const [newVariantPriceMod, setNewVariantPriceMod] = useState("0");

  // Delete Confirm Modal State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        adminApi.getProducts({
          search: search.trim() || undefined,
          category_id: categoryId || undefined,
          stock_status: stockFilter !== "all" ? stockFilter : undefined,
          per_page: 50,
        }),
        adminApi.getCategories(),
        adminApi.getBrands(),
      ]);

      setProducts(prodRes.data || []);
      setCategories(catRes || []);
      setBrands(brandRes || []);
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
    loadData();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName("");
    setCategory(categories[0]?.id?.toString() || "1");
    setBrand(brands[0]?.name || "AETHER Studio");
    setPrice("0");
    setComparePrice("0");
    setStock("0");
    setDescription("");
    setFormImages([]);
    setNewImageUrl("");
    setImageInputMode("upload");
    setIsFeatured(false);
    setIsNewArrival(true);
    setIsBestSeller(false);
    setFormVariants([]);
    setNewVariantName("");
    setNewVariantColorHex("#0f172a");
    setNewVariantStock("20");
    setNewVariantPriceMod("0");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category?.id?.toString() || product.category_id?.toString() || "1");
    setBrand(product.brand || "AETHER Studio");
    setPrice(product.price.toString());
    setComparePrice(product.compare_at_price ? product.compare_at_price.toString() : "0");
    setStock(product.stock_quantity.toString());
    setDescription(product.description || "");

    let initialImages: ProductFormImage[] = [];
    if (product.images && product.images.length > 0) {
      initialImages = product.images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        is_primary: img.is_primary,
        alt_text: img.alt_text || undefined,
        source: "url",
      }));
    } else if (product.primary_image) {
      initialImages = [
        {
          id: product.primary_image.id,
          image_url: product.primary_image.image_url,
          is_primary: true,
          alt_text: product.primary_image.alt_text || undefined,
          source: "url",
        },
      ];
    }
    setFormImages(initialImages);
    setNewImageUrl("");
    setImageInputMode("upload");

    setIsFeatured(Boolean(product.is_featured));
    setIsNewArrival(Boolean(product.is_new_arrival));
    setIsBestSeller(Boolean(product.is_best_seller));

    if (product.variants && product.variants.length > 0) {
      setFormVariants(
        product.variants.map((v) => ({
          id: v.id,
          name: v.name,
          color_name: v.color_name || v.name,
          color_hex: v.color_hex || "#0f172a",
          stock_quantity: v.stock_quantity ?? 0,
          price_modifier: Number(v.price_modifier || 0),
        }))
      );
    } else {
      setFormVariants([]);
    }

    setNewVariantName("");
    setNewVariantColorHex("#0f172a");
    setNewVariantStock("20");
    setNewVariantPriceMod("0");

    setIsModalOpen(true);
  };

  const handleOpenView = (product: Product) => {
    setViewingProduct(product);
    const primary = product.primary_image?.image_url || product.images?.[0]?.image_url || "";
    setViewingActiveImage(primary);
  };

  const handleAddVariant = () => {
    if (!newVariantName.trim()) {
      toast.error("Please enter a variant / color name.");
      return;
    }
    const stockQty = Math.max(0, parseInt(newVariantStock || "0", 10));
    const priceMod = parseFloat(newVariantPriceMod || "0") || 0;

    const newVar: ProductFormVariant = {
      name: newVariantName.trim(),
      color_name: newVariantName.trim(),
      color_hex: newVariantColorHex || null,
      stock_quantity: stockQty,
      price_modifier: priceMod,
    };

    const nextVariants = [...formVariants, newVar];
    setFormVariants(nextVariants);

    const sumStock = nextVariants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
    setStock(sumStock.toString());

    setNewVariantName("");
    setNewVariantColorHex("#0f172a");
    setNewVariantStock("20");
    setNewVariantPriceMod("0");
    toast.success(`Variant '${newVar.name}' added.`);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = formVariants.filter((_, idx) => idx !== index);
    setFormVariants(updated);
    if (updated.length > 0) {
      const sumStock = updated.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
      setStock(sumStock.toString());
    }
    toast.info("Variant removed.");
  };

  const handleUpdateVariantStock = (index: number, stockVal: string) => {
    const qty = Math.max(0, parseInt(stockVal || "0", 10));
    const updated = formVariants.map((v, idx) => (idx === index ? { ...v, stock_quantity: qty } : v));
    setFormVariants(updated);
    const sumStock = updated.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
    setStock(sumStock.toString());
  };

  const handleSaveQuickCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCategoryName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    setQuickCategorySaving(true);
    try {
      const res = await adminApi.createCategory({
        name: quickCategoryName.trim(),
        description: quickCategoryDescription.trim() || undefined,
        icon: quickCategoryIcon || "Sparkles",
        is_featured: true,
      });
      const newCat = res.category;
      setCategories((prev) => [...prev, newCat]);
      setCategory(newCat.id.toString());
      setIsQuickCategoryModalOpen(false);
      setQuickCategoryName("");
      setQuickCategoryDescription("");
      toast.success(`Category '${newCat.name}' created.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category.");
    } finally {
      setQuickCategorySaving(false);
    }
  };

  const handleSaveQuickBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBrandName.trim()) {
      toast.error("Brand name is required.");
      return;
    }
    setQuickBrandSaving(true);
    try {
      const res = await adminApi.createBrand({
        name: quickBrandName.trim(),
        website: quickBrandWebsite.trim() || undefined,
        description: quickBrandDescription.trim() || undefined,
        is_featured: true,
      });
      const newBrand = res.brand;
      setBrands((prev) => [...prev, newBrand]);
      setBrand(newBrand.name);
      setIsQuickBrandModalOpen(false);
      setQuickBrandName("");
      setQuickBrandWebsite("");
      setQuickBrandDescription("");
      toast.success(`Brand '${newBrand.name}' created.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create brand.");
    } finally {
      setQuickBrandSaving(false);
    }
  };

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) {
      toast.error("Please enter an image URL.");
      return;
    }
    if (!/^https?:\/\/.+/i.test(url)) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    if (formImages.length >= 5) {
      toast.error("Maximum 5 images allowed.");
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
    toast.success("Image added.");
  };

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - formImages.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 5 images allowed.");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploadingImage(true);
    try {
      const uploadedImages: ProductFormImage[] = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) continue;
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
        toast.success(`Uploaded ${uploadedImages.length} image(s).`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = formImages.filter((_, idx) => idx !== index);
    if (nextImages.length > 0 && !nextImages.some((img) => img.is_primary)) {
      nextImages[0].is_primary = true;
    }
    setFormImages(nextImages);
  };

  const handleSetPrimaryImage = (index: number) => {
    const nextImages = formImages.map((img, idx) => ({
      ...img,
      is_primary: idx === index,
    }));
    setFormImages(nextImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (formImages.length === 0) {
      toast.error("Please add at least 1 image.");
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
      description: description || "High performance studio hardware.",
      images: sanitizedImages,
      image_url: primaryUrl,
      is_featured: isFeatured,
      is_new_arrival: isNewArrival,
      is_best_seller: isBestSeller,
      variants: formVariants.map((v) => ({
        name: v.name,
        color_name: v.color_name || v.name,
        color_hex: v.color_hex,
        stock_quantity: Number(v.stock_quantity || 0),
        price_modifier: Number(v.price_modifier || 0),
      })),
    };

    try {
      if (editingProduct) {
        const res = await adminApi.updateProduct(editingProduct.id, payload);
        setProducts(products.map((p) => (p.id === editingProduct.id ? res.product : p)));
        toast.success(`Updated '${res.product.name}'`);
      } else {
        const res = await adminApi.createProduct(payload);
        setProducts([res.product, ...products]);
        toast.success(`Created '${res.product.name}'`);
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
    <div className="space-y-5 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage hardware items, inventory variants, and pricing</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 rounded-xl bg-[#0b0e17] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-2.5">
        <form onSubmit={handleSearch} className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, name, brand..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
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
              { value: "all", label: "All Badges" },
              { value: "featured", label: "Featured" },
              { value: "new_arrival", label: "New Arrivals" },
              { value: "best_seller", label: "Best Sellers" },
            ]}
          />

          <AdminDropdown
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: "latest", label: "Sort: Latest" },
              { value: "price_asc", label: "Price: Low-High" },
              { value: "price_desc", label: "Price: High-Low" },
              { value: "stock_asc", label: "Stock: Low-High" },
              { value: "stock_desc", label: "Stock: High-Low" },
              { value: "name_asc", label: "Name: A-Z" },
            ]}
          />

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={displayedProducts.length}
        onClearSelection={() => setSelectedIds([])}
        onConfirmDelete={handleBulkDelete}
        isDeleting={isBulkDeleting}
        itemName="product"
      />

      {/* Products Table Card */}
      <div className="rounded-xl bg-[#0b0e17] border border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase text-[9.5px] tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={displayedProducts.length > 0 && selectedIds.length === displayedProducts.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-white/20 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Flags</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    <span>Loading products catalog...</span>
                  </td>
                </tr>
              ) : displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No products matching current filters.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const img = product.primary_image?.image_url || product.images?.[0]?.image_url;
                  const hasVariants = product.variants && product.variants.length > 0;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isSelected ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(product.id)}
                          className="rounded border-white/20 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Product details */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5 min-w-[200px]">
                          {img ? (
                            <img
                              src={img}
                              alt={product.name}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-900 border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-white block truncate hover:text-amber-400 transition-colors">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {product.brand} {product.sku ? `• SKU: ${product.sku}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10.5px] font-medium text-slate-300">
                          {product.category?.name || "Hardware"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-3">
                        <div className="font-mono">
                          <span className="font-bold text-white block">{formatPrice(product.price)}</span>
                          {product.compare_at_price && (
                            <span className="text-[10px] text-slate-500 line-through block">
                              {formatPrice(product.compare_at_price)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              product.stock_quantity > 10
                                ? "bg-emerald-400"
                                : product.stock_quantity > 0
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                          />
                          <span className="font-mono font-bold text-white">{product.stock_quantity}</span>
                          {hasVariants && (
                            <span className="text-[9.5px] text-cyan-400 font-medium">
                              ({product.variants?.length || 0} vars)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Flags */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {product.is_featured && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9.5px] font-bold border border-amber-500/20">
                              Featured
                            </span>
                          )}
                          {product.is_new_arrival && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[9.5px] font-bold border border-cyan-500/20">
                              New
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(product)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="View product preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"
                            title="Edit product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete product"
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
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0e121e] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0a0d16]">
              <div>
                <h3 className="text-sm font-black text-white">
                  {editingProduct ? `Edit '${editingProduct.name}'` : "Add New Product"}
                </h3>
                <span className="text-[10.5px] text-slate-400">Configure catalog information, imagery & inventory</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AeroPack X-Pac 24L Modular Travel Pack"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category & Brand with Quick-Add */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsQuickCategoryModalOpen(true)}
                      className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" /> New Category
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id.toString()} className="bg-[#0e121e]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300">Brand</label>
                    <button
                      type="button"
                      onClick={() => setIsQuickBrandModalOpen(true)}
                      className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" /> New Brand
                    </button>
                  </div>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.name} className="bg-[#0e121e]">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Base Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Base Price <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Compare At Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Total Stock Quantity <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Visual Gallery / Images */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300">
                    Product Images ({formImages.length}/5) <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("upload")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        imageInputMode === "upload" ? "bg-amber-500/20 text-amber-300" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Device Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        imageInputMode === "url" ? "bg-amber-500/20 text-amber-300" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Web URL
                    </button>
                  </div>
                </div>

                {/* Image Input Bar */}
                {imageInputMode === "upload" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleDeviceUpload}
                      disabled={isUploadingImage || formImages.length >= 5}
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                    />
                    {isUploadingImage && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/product.jpg"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Uploaded Images Thumbnails */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {formImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl overflow-hidden border ${
                          img.is_primary ? "border-amber-400 ring-2 ring-amber-400/20" : "border-white/10"
                        } group`}
                      >
                        <img src={img.image_url} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          {!img.is_primary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="p-1 rounded bg-amber-500 text-slate-950 text-[9px] font-black cursor-pointer"
                              title="Set Primary"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded bg-rose-500 text-white cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Variants Builder */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Color Variants & Stock Modifiers ({formVariants.length})
                </label>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newVariantName}
                      onChange={(e) => setNewVariantName(e.target.value)}
                      placeholder="Variant name (e.g. Stealth Black)"
                      className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={newVariantColorHex}
                        onChange={(e) => setNewVariantColorHex(e.target.value)}
                        className="w-8 h-8 rounded border border-white/15 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newVariantColorHex}
                        onChange={(e) => setNewVariantColorHex(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white font-mono"
                      />
                    </div>
                    <input
                      type="number"
                      value={newVariantStock}
                      onChange={(e) => setNewVariantStock(e.target.value)}
                      placeholder="Stock"
                      className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Preset color chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-500">Presets:</span>
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setNewVariantName(p.name);
                          setNewVariantColorHex(p.hex);
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.hex }} />
                        {p.name}
                      </button>
                    ))}
                  </div>

                  {/* Added variants list */}
                  {formVariants.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      {formVariants.map((v, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            {v.color_hex && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: v.color_hex }}
                              />
                            )}
                            <span className="font-bold text-white">{v.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">Stock:</span>
                            <input
                              type="number"
                              value={v.stock_quantity}
                              onChange={(e) => handleUpdateVariantStock(idx, e.target.value)}
                              className="w-16 bg-black/40 border border-white/10 rounded px-2 py-0.5 text-xs text-white font-mono text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(idx)}
                              className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Badges / Visibility */}
              <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              {/* Description */}
              <div className="space-y-1 pt-2 border-t border-white/5">
                <label className="text-[11px] font-bold text-slate-300 block">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product specifications and highlights..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QUICK CATEGORY MODAL */}
      {isQuickCategoryModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e121e] border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-black text-white">Create Category</h3>
              <button onClick={() => setIsQuickCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveQuickCategory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Category Name *</label>
                <input
                  type="text"
                  required
                  value={quickCategoryName}
                  onChange={(e) => setQuickCategoryName(e.target.value)}
                  placeholder="e.g. Ergonomics & Comfort"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Description</label>
                <input
                  type="text"
                  value={quickCategoryDescription}
                  onChange={(e) => setQuickCategoryDescription(e.target.value)}
                  placeholder="Short description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickCategorySaving}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black"
                >
                  {quickCategorySaving ? "Creating..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK BRAND MODAL */}
      {isQuickBrandModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e121e] border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-black text-white">Create Brand</h3>
              <button onClick={() => setIsQuickBrandModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveQuickBrand} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={quickBrandName}
                  onChange={(e) => setQuickBrandName(e.target.value)}
                  placeholder="e.g. OrbitKey Labs"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Website (Optional)</label>
                <input
                  type="url"
                  value={quickBrandWebsite}
                  onChange={(e) => setQuickBrandWebsite(e.target.value)}
                  placeholder="https://brand.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickBrandModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickBrandSaving}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black"
                >
                  {quickBrandSaving ? "Creating..." : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRODUCT PREVIEW MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0e121e] border border-white/15 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-black text-white">{viewingProduct.name}</h3>
              <button onClick={() => setViewingProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {viewingActiveImage && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
                  <img src={viewingActiveImage} alt={viewingProduct.name} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-mono text-lg font-black text-cyan-400">{formatPrice(viewingProduct.price)}</span>
                <span className="text-slate-400">Stock: {viewingProduct.stock_quantity}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{viewingProduct.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e121e] border border-rose-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-black text-white">Delete Product?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete <span className="font-bold text-white">"{deletingProduct.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
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
