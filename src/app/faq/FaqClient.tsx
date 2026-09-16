"use client";

import { useState } from "react";
import { ContentPageLayout } from "@/components/shared/ContentPageLayout";
import { ChevronDown, HelpCircle, Search, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "Shipping" | "Orders & Payments" | "Hardware & Sound" | "Warranty";
}

const FAQS: FAQItem[] = [
  {
    category: "Shipping",
    question: "How much is delivery inside and outside Dhaka?",
    answer: "Delivery inside Dhaka Metro is 60 Tk (1-2 business days). Delivery outside Dhaka to any of Bangladesh's 64 districts is 120 Tk (2-4 business days). Orders qualifying for free shipping promotions receive a full rebate credit on the checkout invoice.",
  },
  {
    category: "Shipping",
    question: "How can I track my package in real-time?",
    answer: "When your order is dispatched, you receive a tracking code (e.g. ORD-2026-98421). Visit the /track page and enter your order number or tracking code to monitor calibration, sorting, carrier handover, and doorstep arrival in real time.",
  },
  {
    category: "Orders & Payments",
    question: "What payment methods are supported?",
    answer: "We support Cash on Delivery (COD), bKash, Nagad, Rocket, and all major debit/credit cards (Visa, Mastercard, AMEX) via secure encrypted payment gateway integrations.",
  },
  {
    category: "Orders & Payments",
    question: "How do I apply a discount or promo voucher?",
    answer: "Enter your promotional code (e.g. WELCOME20) into the promo box located in your Cart Drawer or on the Checkout Order Summary. The discount amount will be calculated and subtracted from your invoice subtotal immediately.",
  },
  {
    category: "Hardware & Sound",
    question: "Are AETHER acoustic headphones compatible with standard DACs and mobile devices?",
    answer: "Yes. All flagship AETHER headphones feature low-impedance high-efficiency transducers that can be driven comfortably by laptops and mobile devices, while scaling dynamically with dedicated high-end studio DAC amplifiers via included 3.5mm and 6.35mm gold-plated adapters.",
  },
  {
    category: "Hardware & Sound",
    question: "Can I swap the switches and keycaps on mechanical keyboards?",
    answer: "Absolutely. Our mechanical keyboards feature 5-pin hot-swappable sockets compatible with all standard Cherry MX, Gateron, and Kailh style mechanical switches.",
  },
  {
    category: "Warranty",
    question: "What does the 2-year studio warranty cover?",
    answer: "The 2-year warranty covers all internal manufacturing defects, driver imbalances, solder joint integrity, PCB failures, and wireless telemetry radios. Physical drop damage or unauthorized liquid immersion are excluded.",
  },
  {
    category: "Warranty",
    question: "How does the 30-day risk-free evaluation trial work?",
    answer: "You have 30 calendar days from the date of delivery to test our hardware in your home or studio. If you are not completely satisfied, contact our support team to receive an instant RMA return authorization and full refund.",
  },
];

export default function FaqClient() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndexes, setOpenIndexes] = useState<number[]>([0, 1]);

  const categories = ["All", "Shipping", "Orders & Payments", "Hardware & Sound", "Warranty"];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <ContentPageLayout
      badge="Knowledge Base & Answers"
      title="Frequently Asked Questions"
      description="Quick answers regarding delivery timelines, acoustic calibrations, payment options, and warranty trials."
      activeSlug="faq"
    >
      <div className="space-y-6">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. shipping, bKash, warranty, DAC)..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No questions matched your search criteria.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndexes.includes(idx);
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden transition-colors hover:border-white/20"
                >
                  <button
                    onClick={() => toggleIndex(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-cyan-400" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </ContentPageLayout>
  );
}
