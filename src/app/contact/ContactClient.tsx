"use client";

import React, { useState } from "react";
import { ContentPageLayout } from "@/components/shared/ContentPageLayout";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { SocialPlatformIcon } from "@/components/shared/SocialPlatformIcon";
import { toast } from "sonner";

export default function ContactClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      toast.success("Your message has been sent successfully!");
    }, 500);
  };

  return (
    <ContentPageLayout
      title="Contact Us"
      description="Have questions about an order, hardware compatibility, or warranty? Reach out to our team."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Direct Contact Channels (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2
            className="text-sm font-bold uppercase tracking-wider opacity-60"
            style={{ color: "var(--theme-text-heading, #0f172a)" }}
          >
            Direct Channels
          </h2>

          {/* WhatsApp Card */}
          <a
            href="https://wa.me/8801700000000?text=Hello%20Inheliq%21%20I%20have%20an%20inquiry."
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl border flex flex-col gap-3 transition-all hover:scale-[1.01] group cursor-pointer block"
            style={{
              backgroundColor: "var(--theme-card-bg, #ffffff)",
              borderColor: "var(--theme-card-border, #e2e8f0)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <SocialPlatformIcon platform="whatsapp" className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    className="text-xs font-bold"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    WhatsApp Support
                  </h3>
                  <span className="text-[11px] opacity-70 block">Fastest Response</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-500 group-hover:underline">
                Chat Now →
              </span>
            </div>
            <p
              className="text-xs leading-relaxed opacity-80"
              style={{ color: "var(--theme-text-body, #64748b)" }}
            >
              Direct live chat for order tracking, hardware advice, and DOA warranty claims. Replies in minutes.
            </p>
          </a>

          {/* Email Support */}
          <div
            className="p-4 rounded-xl border space-y-2 transition-colors"
            style={{
              backgroundColor: "var(--theme-card-bg, #ffffff)",
              borderColor: "var(--theme-card-border, #e2e8f0)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                  color: "var(--theme-primary, #005826)",
                }}
              >
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3
                  className="text-xs font-bold"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Email Support
                </h3>
                <a
                  href="mailto:support@inheliq.com"
                  className="text-xs font-semibold hover:underline block"
                  style={{ color: "var(--theme-primary, #005826)" }}
                >
                  support@inheliq.com
                </a>
              </div>
            </div>
            <p
              className="text-xs opacity-75"
              style={{ color: "var(--theme-text-body, #64748b)" }}
            >
              For formal inquiries, business requests, and general help. Typical response within 24 hours.
            </p>
          </div>

          {/* Helpline & Location */}
          <div
            className="p-4 rounded-xl border space-y-2.5 transition-colors"
            style={{
              backgroundColor: "var(--theme-card-bg, #ffffff)",
              borderColor: "var(--theme-card-border, #e2e8f0)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.08))",
                  color: "var(--theme-primary, #005826)",
                }}
              >
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3
                  className="text-xs font-bold"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Helpline
                </h3>
                <span
                  className="text-xs font-semibold font-mono block"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  +880 1700-000000
                </span>
              </div>
            </div>
            <div
              className="text-xs space-y-1 pt-1 opacity-75 border-t"
              style={{
                color: "var(--theme-text-body, #64748b)",
                borderColor: "var(--theme-card-border, #e2e8f0)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span>Hours: Mon – Sat: 10:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>Dhaka, Bangladesh · Doorstep Delivery Nationwide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Send a Message Form (3 cols) */}
        <div
          className="lg:col-span-3 p-6 sm:p-7 rounded-2xl border space-y-5 transition-colors"
          style={{
            backgroundColor: "var(--theme-card-bg, #ffffff)",
            borderColor: "var(--theme-card-border, #e2e8f0)",
          }}
        >
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: "var(--theme-text-heading, #0f172a)" }}
            >
              Send Us a Message
            </h2>
            <p
              className="text-xs opacity-75 mt-0.5"
              style={{ color: "var(--theme-text-body, #64748b)" }}
            >
              Fill out the form below and we will get back to you shortly.
            </p>
          </div>

          {isSubmitted ? (
            <div
              className="p-6 rounded-xl border text-center space-y-3"
              style={{
                backgroundColor: "var(--theme-hover-bg, rgba(0, 88, 38, 0.04))",
                borderColor: "var(--theme-card-border, #e2e8f0)",
              }}
            >
              <CheckCircle2
                className="w-10 h-10 mx-auto"
                style={{ color: "var(--theme-primary, #005826)" }}
              />
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--theme-text-heading, #0f172a)" }}
              >
                Message Sent Successfully
              </h3>
              <p
                className="text-xs opacity-80 max-w-sm mx-auto"
                style={{ color: "var(--theme-text-body, #64748b)" }}
              >
                Thank you, <strong style={{ color: "var(--theme-text-heading, #0f172a)" }}>{name}</strong>. We received your note and will reply to <span className="underline">{email}</span> within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80 cursor-pointer"
                style={{
                  backgroundColor: "var(--theme-primary, #005826)",
                  color: "var(--theme-btn-primary-text, #ffffff)",
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium block"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full h-9 rounded-xl px-3 text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "var(--theme-bg, transparent)",
                      border: "1px solid var(--theme-card-border, #e2e8f0)",
                      color: "var(--theme-text-heading, #0f172a)",
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium block"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. tanvir@example.com"
                    className="w-full h-9 rounded-xl px-3 text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "var(--theme-bg, transparent)",
                      border: "1px solid var(--theme-card-border, #e2e8f0)",
                      color: "var(--theme-text-heading, #0f172a)",
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium block"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full h-9 rounded-xl px-3 text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "var(--theme-bg, transparent)",
                      border: "1px solid var(--theme-card-border, #e2e8f0)",
                      color: "var(--theme-text-heading, #0f172a)",
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium block"
                    style={{ color: "var(--theme-text-heading, #0f172a)" }}
                  >
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. ORD-2026-1024"
                    className="w-full h-9 rounded-xl px-3 text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "var(--theme-bg, transparent)",
                      border: "1px solid var(--theme-card-border, #e2e8f0)",
                      color: "var(--theme-text-heading, #0f172a)",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium block"
                  style={{ color: "var(--theme-text-heading, #0f172a)" }}
                >
                  Your Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today?"
                  className="w-full rounded-xl p-3 text-xs focus:outline-none transition-colors resize-none"
                  style={{
                    backgroundColor: "var(--theme-bg, transparent)",
                    border: "1px solid var(--theme-card-border, #e2e8f0)",
                    color: "var(--theme-text-heading, #0f172a)",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--theme-primary, #005826)",
                  color: "var(--theme-btn-primary-text, #ffffff)",
                }}
              >
                {loading ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </ContentPageLayout>
  );
}
