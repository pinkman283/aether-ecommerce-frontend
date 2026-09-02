"use client";

import { useState } from "react";
import { ContentPageLayout } from "@/components/shared/ContentPageLayout";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, Headphones } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Order Inquiry & Tracking");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      toast.success("Support message dispatched successfully!");
    }, 800);
  };

  return (
    <ContentPageLayout
      badge="Customer Care & Engineering Support"
      title="Contact & Support Hub"
      description="Connect directly with sound engineers, logistics coordinators, and customer advocates."
      activeSlug="contact"
    >
      <div className="space-y-8">
        
        {/* Support Channel Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-center sm:text-left">
            <Mail className="w-5 h-5 text-cyan-400 mx-auto sm:mx-0 mb-1" />
            <span className="font-bold text-white text-xs block">Direct Support Email</span>
            <a href="mailto:support@aether.studio" className="text-[11px] text-cyan-300 hover:underline">
              support@aether.studio
            </a>
            <span className="text-[10px] text-slate-500 block">Typical response: &lt; 2 hours</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-center sm:text-left">
            <Phone className="w-5 h-5 text-indigo-400 mx-auto sm:mx-0 mb-1" />
            <span className="font-bold text-white text-xs block">Studio Hotline</span>
            <span className="text-[11px] text-indigo-300 font-mono">+880 1700-000000</span>
            <span className="text-[10px] text-slate-500 block">Mon - Sat: 9 AM - 9 PM BST</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-center sm:text-left">
            <MapPin className="w-5 h-5 text-pink-400 mx-auto sm:mx-0 mb-1" />
            <span className="font-bold text-white text-xs block">Studio Lab Location</span>
            <span className="text-[11px] text-pink-200">Tejgaon I/A, Dhaka 1208</span>
            <span className="text-[10px] text-slate-500 block">Hardware Experience Hub</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Send a Dispatch Message</h3>
          </div>

          {isSubmitted ? (
            <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Message Transmitted</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Thank you, <span className="text-white font-bold">{name}</span>. A studio support engineer has received your ticket and will follow up at <span className="text-cyan-300">{email}</span> shortly.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage("");
                }}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Rahman"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tariq@domain.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Inquiry Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#0e121e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Order Inquiry & Tracking">Order Inquiry & Tracking</option>
                  <option value="Hardware Specs & Compatibility">Hardware Specs & Compatibility</option>
                  <option value="Warranty & 30-Day Trial RMA">Warranty & 30-Day Trial RMA</option>
                  <option value="Corporate & Studio Studio Bulk Orders">Corporate & Studio Bulk Orders</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Message Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our sound engineers or fulfillment team assist you today?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Transmitting..." : <>Send Message <Send className="w-3.5 h-3.5" /></>}
              </button>
            </form>
          )}
        </div>

      </div>
    </ContentPageLayout>
  );
}
