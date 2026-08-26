"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Heart, Check, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [addedAnim, setAddedAnim] = useState(false);

  const img = product.primary_image?.image_url || product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
  const inWishlist = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.variants?.[0] || null, 1);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discountAmount = product.compare_at_price && product.compare_at_price > product.price
    ? product.compare_at_price - product.price
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative rounded-3xl bg-[#0e121e]/80 border border-white/10 hover:border-indigo-500/40 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/15 flex flex-col justify-between"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 mb-4 border border-white/5">
          <Link href={`/products/${product.slug}`}>
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Badges Top Left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.is_new_arrival && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30">
                <Sparkles className="w-2.5 h-2.5" /> New Release
              </span>
            )}
            {product.is_best_seller && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30">
                Best Seller
              </span>
            )}
            {discountAmount > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600/90 text-white border border-rose-500/30">
                Save {formatPrice(discountAmount)}
              </span>
            )}
          </div>

          {/* Wishlist Heart Top Right */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md border transition-all z-10 ${
              inWishlist
                ? "bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/30"
                : "bg-black/50 border-white/10 text-white/80 hover:text-pink-400 hover:border-pink-500/40 hover:bg-black/80"
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-white" : ""}`} />
          </button>

          {/* Quick Add Overlay on Hover */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleQuickAdd}
              className={`w-full py-2.5 rounded-xl backdrop-blur-md text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                addedAnim
                  ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30"
                  : "bg-indigo-600/90 hover:bg-indigo-600 text-white border border-indigo-400/30 shadow-indigo-500/30"
              }`}
            >
              {addedAnim ? (
                <>
                  <Check className="w-4 h-4" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Quick Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
          <span className="text-[11px] font-bold text-indigo-400/90 uppercase tracking-wider">
            {product.category?.name || product.brand || "Studio Edition"}
          </span>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{Number(product.rating_average || 0).toFixed(1)}</span>
            <span className="text-slate-500 text-[10px]">({product.review_count || 0})</span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-bold text-white hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>
      </div>

      {/* Pricing and Variant Color Swatches */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-cyan-400">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-slate-500 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>

        {/* Color Swatches */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-1">
            {product.variants.slice(0, 3).map((v) => (
              <div
                key={v.id}
                title={v.color_name || v.name}
                className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-inner"
                style={{ backgroundColor: v.color_hex || "#334155" }}
              />
            ))}
            {product.variants.length > 3 && (
              <span className="text-[10px] text-slate-400 font-semibold">
                +{product.variants.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
