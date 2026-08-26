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
  Info
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
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
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
        if (data.product.variants && data.product.variants.length > 0) {
          setSelectedVariant(data.product.variants[0]);
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

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    toast.success(`Added ${quantity}x ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    addItem(product, selectedVariant, quantity);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Image Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Info & Actions Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Top Brand & Category Tag */}
            <div className="flex items-center justify-between gap-2 mb-2">
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
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {product.short_description}
              </p>
            )}
          </div>

          {/* Pricing Header */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-cyan-400">
                {formatPrice(currentPrice)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-sm text-slate-500 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Check className="w-4 h-4" /> In Stock & Ready to Ship
            </div>
          </div>

          {/* Variant Selector */}
          <VariantPicker
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelectVariant={(v) => setSelectedVariant(v)}
          />

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center bg-[#0e121e] border border-white/15 rounded-2xl p-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-extrabold text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>

              {/* Wishlist Heart */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  inWishlist
                    ? "bg-pink-600 border-pink-500 text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:text-pink-400"
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-white" : ""}`} />
              </button>
            </div>

            {/* Instant Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" /> Instant Checkout
            </button>
          </div>

          {/* Guarantees Box */}
          <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="space-y-1">
              <Truck className="w-4 h-4 text-cyan-400 mx-auto" />
              <p className="text-[11px] font-bold text-white">Free Express</p>
              <p className="text-[9px] text-slate-500">Orders over $100</p>
            </div>
            <div className="space-y-1 border-x border-white/10">
              <ShieldCheck className="w-4 h-4 text-indigo-400 mx-auto" />
              <p className="text-[11px] font-bold text-white">2-Yr Warranty</p>
              <p className="text-[9px] text-slate-500">Official coverage</p>
            </div>
            <div className="space-y-1">
              <RotateCcw className="w-4 h-4 text-purple-400 mx-auto" />
              <p className="text-[11px] font-bold text-white">30-Day Trial</p>
              <p className="text-[9px] text-slate-500">Risk-free returns</p>
            </div>
          </div>

        </div>

      </div>

      {/* Description & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-white/10">
        
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xl font-black text-white">Product Overview</h3>
          <div className="prose prose-invert text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
            <p>{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Specifications Table */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xl font-black text-white">Technical Specifications</h3>
          <div className="rounded-2xl bg-[#0e121e] border border-white/10 overflow-hidden divide-y divide-white/5 text-xs">
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
    </div>
  );
}
