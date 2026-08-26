"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Headphones, Keyboard, Briefcase, Sparkles, Watch } from "lucide-react";
import { Category } from "@/types";

interface CategoryBentoProps {
  categories: Category[];
}

export function CategoryBento({ categories }: CategoryBentoProps) {
  const iconMap: Record<string, any> = {
    Headphones: Headphones,
    Keyboard: Keyboard,
    Briefcase: Briefcase,
    Sparkles: Sparkles,
    Watch: Watch,
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400 block mb-1">
            Curated Ecosystems
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Explore By Hardware Category
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
        >
          View All Categories <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map((cat, idx) => {
          const Icon = iconMap[cat.icon || "Sparkles"] || Sparkles;
          const isSpanTwo = idx === 0 || idx === 3;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative rounded-3xl overflow-hidden bg-[#0e121e] border border-white/10 hover:border-indigo-500/50 transition-all duration-300 min-h-[260px] flex flex-col justify-end p-6 ${
                isSpanTwo ? "md:col-span-2" : "col-span-1"
              }`}
            >
              {/* Background Image */}
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-40 group-hover:opacity-55"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b12] via-[#090b12]/60 to-transparent" />

              {/* Top Category Badge */}
              {cat.badge && (
                <div className="absolute top-5 left-5 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 backdrop-blur-md text-white border border-white/15">
                    {cat.badge}
                  </span>
                </div>
              )}

              {/* Arrow Icon */}
              <div className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all">
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>

              {/* Bottom Details */}
              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold">{cat.products_count ?? 6} Products</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-cyan-400 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <Link href={`/products?category=${cat.slug}`} className="absolute inset-0 z-20" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
