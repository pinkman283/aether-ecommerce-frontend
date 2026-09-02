"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  ChevronRight, 
  Share2, 
  Zap, 
  Sparkles,
  Info,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { Product, ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ProductGallery } from "@/components/product/ProductGallery";
import { VariantPicker } from "@/components/product/VariantPicker";
import { ReviewSummary } from "@/components/product/ReviewSummary";
import { ProductCard } from "@/components/product/ProductCard";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useThemeStore } from "@/store/useThemeStore";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { theme } = useThemeStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [hasVariantError, setHasVariantError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    async function loadProductData() {
      setLoading(true);
      try {
        const data = await api.getProduct(slug);
        setProduct(data.product);
        setRelated(data.related || []);
        
        // Single color: auto-select (not mandatory to click). Multiple colors: require user to pick.
        if (data.product.variants && data.product.variants.length === 1) {
          setSelectedVariant(data.product.variants[0]);
        } else {
          setSelectedVariant(null);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
          Loading Hardware Specifications...
        </span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Product Not Found</h2>
        <p className="text-xs text-slate-400">The hardware item you are looking for does not exist or has been retired.</p>
        <Link href="/products" className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const currentPrice = Number(product.price) + (selectedVariant ? Number(selectedVariant.price_modifier) : 0);
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity !== undefined && product.stock_quantity <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }
    if (product.variants && product.variants.length > 1 && !selectedVariant) {
      setHasVariantError(true);
      toast.error("Please select a color finish before adding to cart.");
      return;
    }
    setHasVariantError(false);
    addItem(product, selectedVariant, quantity);
    toast.success(`Added ${quantity}x ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ""} to cart`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }
    if (product.variants && product.variants.length > 1 && !selectedVariant) {
      setHasVariantError(true);
      toast.error("Please select a color finish before proceeding to checkout.");
      return;
    }
    setHasVariantError(false);
    addItem(product, selectedVariant, quantity);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-white transition-colors">Catalog</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-white transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left Image Gallery (Balanced 6 cols) */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Info & Actions Panel (Balanced 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            {/* Top Brand & Category Tag */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                {product.brand || "AETHER Studio"}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{Number(product.rating_average || 0).toFixed(1)}</span>
                <span className="text-slate-500 font-normal">({product.review_count || 0} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                {product.short_description}
              </p>
            )}
          </div>

          {/* Pricing Header & Stock Indicator */}
          <div className="p-3.5 rounded-2xl theme-card border border-white/5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">
                {formatPrice(currentPrice)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xs sm:text-sm text-slate-500 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {isOutOfStock ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" /> Only {product.stock_quantity} left
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Check className="w-4 h-4" /> In Stock & Ready to Ship
              </div>
            )}
          </div>

          {/* Compact Variant Selector */}
          <VariantPicker
            variants={product.variants}
            selectedVariant={selectedVariant}
            hasError={hasVariantError}
            onSelectVariant={(v) => {
              setSelectedVariant(v);
              setHasVariantError(false);
            }}
          />

          {/* Quantity & CTA Buttons */}
          <div className="space-y-2.5 pt-1">
            <div className="flex gap-2.5">
              {/* Quantity Selector */}
              <div className={`flex items-center theme-card border border-white/15 rounded-2xl p-1 shrink-0 ${isOutOfStock ? "opacity-50 pointer-events-none" : ""}`}>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-extrabold text-white">{quantity}</span>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isOutOfStock
                    ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-[1.01] cursor-pointer"
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              {/* Wishlist Heart */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  inWishlist
                    ? "bg-pink-600 border-pink-500 text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:text-pink-400"
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? "fill-white" : ""}`} />
              </button>
            </div>

            {/* Instant Buy Now Button */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 shadow-md shadow-cyan-500/20 cursor-pointer"
              }`}
            >
              <Zap className="w-4 h-4 fill-current" /> {isOutOfStock ? "Currently Unavailable" : "Instant Checkout"}
            </button>
          </div>

          {/* Delivery & Shipping Information Card (Admin Controlled) */}
          <div className="p-4 rounded-2xl theme-card border border-white/10 space-y-3 bg-[#0c101d]/60 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-cyan-400" /> Nationwide Delivery Options
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Cash on Delivery (COD)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Inside Dhaka</span>
                  <span className="text-[10px] text-slate-400">24 – 48 Hours Express</span>
                </div>
                <span className="font-black text-cyan-400 font-mono">
                  {formatPrice(theme.shipping_inside_dhaka_rate || 60)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Outside Dhaka</span>
                  <span className="text-[10px] text-slate-400">2 – 3 Working Days</span>
                </div>
                <span className="font-black text-cyan-400 font-mono">
                  {formatPrice(theme.shipping_outside_dhaka_rate || 120)}
                </span>
              </div>
            </div>
          </div>

          {/* 4-Pillar Trust Guarantees Box (Admin Controlled) */}
          <div className="p-3.5 rounded-2xl theme-card border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="space-y-0.5 p-1.5 rounded-lg bg-white/[0.02]">
              <Truck className="w-4 h-4 text-cyan-400 mx-auto" />
              <p className="text-[11px] font-bold text-white">
                {theme.trust_ribbon_title_1 || "Fast Delivery"}
              </p>
              <p className="text-[9px] text-slate-400">All 64 Districts</p>
            </div>
            <div className="space-y-0.5 p-1.5 rounded-lg bg-white/[0.02]">
              <ShieldCheck className="w-4 h-4 text-indigo-400 mx-auto" />
              <p className="text-[11px] font-bold text-white">
                {theme.trust_ribbon_title_3 || "100% Genuine"}
              </p>
              <p className="text-[9px] text-slate-400">Official Warranty</p>
            </div>
            <div className="space-y-0.5 p-1.5 rounded-lg bg-white/[0.02]">
              <RotateCcw className="w-4 h-4 text-pink-400 mx-auto" />
              <p className="text-[11px] font-bold text-white">
                {theme.trust_ribbon_title_4 || "7-Day Return"}
              </p>
              <p className="text-[9px] text-slate-400">Easy Exchange</p>
            </div>
            <div className="space-y-0.5 p-1.5 rounded-lg bg-white/[0.02]">
              <Zap className="w-4 h-4 text-amber-400 mx-auto" />
              <p className="text-[11px] font-bold text-white">
                {theme.trust_ribbon_title_2 || "Pay on Delivery"}
              </p>
              <p className="text-[9px] text-slate-400">Inspect & Receive</p>
            </div>
          </div>

        </div>

      </div>

      {/* Description & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-white/10">
        
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-lg font-black text-white">Product Overview</h3>
          <div className="prose prose-invert text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
            <p>{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Specifications Table */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-lg font-black text-white">Technical Specifications</h3>
          <div className="rounded-2xl theme-card border border-white/10 overflow-hidden divide-y divide-white/5 text-xs">
            <div className="flex justify-between p-3">
              <span className="text-slate-400">SKU</span>
              <span className="text-white font-mono font-bold">{product.sku || "N/A"}</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-slate-400">Brand</span>
              <span className="text-white font-bold">{product.brand || "AETHER"}</span>
            </div>
            {product.specifications &&
              Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between p-3">
                  <span className="text-slate-400">{key}</span>
                  <span className="text-white font-medium text-right">{val}</span>
                </div>
              ))}
          </div>
        </div>

      </div>

      {/* Reviews Section */}
      <ReviewSummary
        productId={product.id}
        ratingAverage={product.rating_average}
        reviewCount={product.review_count}
        reviews={product.reviews}
      />

      {/* Related Products Grid */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white">Frequently Paired Gear</h3>
            <Link href="/products" className="text-xs font-bold text-cyan-400 hover:text-cyan-300">
              View Entire Collection →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Add-to-Cart Action Bar */}
      <div className="lg:hidden fixed bottom-12 sm:bottom-0 inset-x-0 z-40 p-2.5 sm:p-3 bg-[#080a12]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-2 shadow-2xl">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-slate-400 block truncate">{product.name}</span>
          <span className="text-sm font-black text-cyan-400">{formatPrice(currentPrice)}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
              isOutOfStock
                ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/15 text-white border border-white/15 cursor-pointer"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Cart
          </button>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
              isOutOfStock
                ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                : "theme-btn-primary cursor-pointer shadow-md"
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Buy Now
          </button>
        </div>
      </div>

      {/* JSON-LD Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.images?.map((i) => i.image_url) || [],
            description: product.short_description || product.description,
            sku: product.sku || `AETH-${product.id}`,
            brand: {
              "@type": "Brand",
              name: product.brand || "AETHER",
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "BDT",
              price: product.price,
              availability: isOutOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            },
            ...(product.rating_average && product.review_count
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: product.rating_average,
                    reviewCount: product.review_count,
                  },
                }
              : {}),
          }),
        }}
      />
    </div>
  );
}
