"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";

export function WishlistDrawer() {
  const { items, isWishlistOpen, closeWishlist, toggleWishlist, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  const handleMoveToCart = (product: any) => {
    addItem(product);
    toggleWishlist(product);
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => addItem(item));
    clearWishlist();
    closeWishlist();
    openCart();
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="w-screen max-w-md bg-[#0d1019] border-l border-white/10 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Saved Gear</h3>
                    <span className="text-[11px] text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={clearWishlist}
                      className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors mr-2"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={closeWishlist}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <Heart className="w-8 h-8 text-slate-500" />
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">Your wishlist is empty</h4>
                    <p className="text-xs text-slate-400 max-w-xs mb-6">
                      Save items you are interested in and return anytime to move them directly to your cart.
                    </p>
                  </div>
                ) : (
                  items.map((product) => {
                    const img = product.primary_image?.image_url || product.images?.[0]?.image_url;
                    return (
                      <div
                        key={product.id}
                        className="flex gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
                      >
                        {img && (
                          <img
                            src={img}
                            alt={product.name}
                            className="w-18 h-18 rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                              <button
                                onClick={() => toggleWishlist(product)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[11px] text-slate-400">{product.brand}</span>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                            <span className="text-xs font-black text-cyan-400">
                              {formatPrice(product.price)}
                            </span>
                            <button
                              onClick={() => handleMoveToCart(product)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all shadow-sm"
                            >
                              <ShoppingBag className="w-3 h-3" /> Move to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-5 border-t border-white/10 bg-[#090b12]">
                  <button
                    onClick={handleMoveAllToCart}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-extrabold tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-xl shadow-pink-500/20"
                  >
                    Move All to Cart <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
