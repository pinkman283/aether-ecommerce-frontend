import { ContentPageLayout } from "@/components/shared/ContentPageLayout";
import { Sparkles, Cpu, Layers, Disc, Award, Globe, Heart } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About AETHER Studio | Precision Acoustic Hardware & Peripherals",
  description: "Learn about AETHER's engineering philosophy, planar magnetic acoustic research, and modular mechanical hardware.",
};

export default function AboutPage() {
  return (
    <ContentPageLayout
      badge="Design & Engineering Heritage"
      title="The AETHER Story"
      description="Crafting precision acoustic hardware, custom mechanical peripherals, and modular everyday tools for modern innovators."
      activeSlug="about"
    >
      <div className="space-y-8 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--theme-text-body, #94a3b8)" }}>
        
        {/* Brand Mission Statement */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" /> Our Philosophy
          </h2>
          <p>
            AETHER was founded on a singular premise: modern digital creators, audiophiles, and software architects deserve hardware that bridges surgical industrial engineering with soulful, uncompromised aesthetics.
          </p>
          <p>
            From CNC-machined aerospace-grade aluminum headphone chassis to hand-calibrated planar magnetic acoustic transducers, every item in our catalog undergoes rigorous studio bench testing before dispatch.
          </p>
        </section>

        {/* 3 Core Pillars */}
        <section className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: "var(--theme-text-heading, #ffffff)" }}>
            <Cpu className="w-5 h-5 text-indigo-400 shrink-0" /> Engineering Principles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <Disc className="w-6 h-6 text-cyan-400" />
              <h3 className="font-bold text-white text-xs">Acoustic Clarity</h3>
              <p className="text-[11px] text-slate-400">
                Ultra-low distortion planar membranes engineered for sub-bass extension and transparent spatial imaging.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <Layers className="w-6 h-6 text-purple-400" />
              <h3 className="font-bold text-white text-xs">Tactile Precision</h3>
              <p className="text-[11px] text-slate-400">
                Gasket-mounted mechanical keyboard architectures delivering acoustic isolation and fatigue-free actuation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <Award className="w-6 h-6 text-pink-400" />
              <h3 className="font-bold text-white text-xs">Built to Endure</h3>
              <p className="text-[11px] text-slate-400">
                Anodized alloy housings, replaceable modular parts, and a standard 2-year studio replacement warranty.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <div className="pt-6 border-t border-white/10 text-center space-y-4">
          <h3 className="text-base font-bold text-white">Experience the Benchmark</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Discover our curated flagship acoustic headphones, customized switches, and daily modular carry packs.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
          >
            Explore Hardware Lineup →
          </Link>
        </div>

      </div>
    </ContentPageLayout>
  );
}
