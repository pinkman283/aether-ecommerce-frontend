"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductImage } from "@/types";

interface ProductGalleryProps {
  images?: ProductImage[];
  productName: string;
}

export function ProductGallery({ images = [], productName }: ProductGalleryProps) {
  const defaultImages = images.length > 0 ? images : [
    {
      id: 1,
      product_id: 0,
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
      is_primary: true,
      display_order: 0,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = defaultImages[activeIndex] || defaultImages[0];

  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#0c0f18] border border-white/10 shadow-2xl p-4 flex items-center justify-center group">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage.image_url}
            src={activeImage.image_url}
            alt={activeImage.alt_text || productName}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
          />
        </AnimatePresence>

        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-slate-300 pointer-events-none">
          {activeIndex + 1} / {defaultImages.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {defaultImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {defaultImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square w-20 rounded-2xl overflow-hidden bg-slate-900 border-2 transition-all shrink-0 ${
                activeIndex === idx
                  ? "border-cyan-400 shadow-lg shadow-cyan-400/20 scale-105"
                  : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <img
                src={img.image_url}
                alt={productName}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
