"use client";

import React, { useState } from "react";
import { 
  Receipt, 
  Printer, 
  X, 
  Copy, 
  Check
} from "lucide-react";
import { SalesInvoice } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useThemeStore, resolveLogo } from "@/store/useThemeStore";
import { toast } from "sonner";

interface OrderInvoiceModalProps {
  invoice: SalesInvoice | null;
  loading: boolean;
  onClose: () => void;
}

export function OrderInvoiceModal({ invoice, loading, onClose }: OrderInvoiceModalProps) {
  const { theme } = useThemeStore();
  const [copied, setCopied] = useState(false);
  const [logoError, setLogoError] = useState(false);

  if (!invoice && !loading) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoiceNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    toast.success(`Copied invoice ${num} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine dynamic brand details
  const storeName = invoice?.company?.name || theme?.store_brand_name || "Store";
  const storeLogo = !logoError ? (invoice?.company?.logo || resolveLogo(theme, "invoice", "") || "") : "";
  const storeTagline = invoice?.company?.tagline || theme?.store_brand_tagline || "";

  // Order Tracking ID: Guarantee tracking ID is always present
  const trackingId = invoice?.tracking_id || invoice?.tracking_code || invoice?.order_number || "N/A";

  // Payment Status Pill Styling
  const getStatusBadge = (status: string) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80 print:border-slate-300 print:text-slate-800 print:bg-slate-50";
      case "partially_paid":
      case "partial":
        return "bg-blue-50 text-blue-700 border-blue-200/80 print:border-slate-300 print:text-slate-800 print:bg-slate-50";
      case "refunded":
        return "bg-rose-50 text-rose-700 border-rose-200/80 print:border-slate-300 print:text-slate-800 print:bg-slate-50";
      case "pending":
      case "unpaid":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/80 print:border-slate-300 print:text-slate-800 print:bg-slate-50";
    }
  };

  // Format payment method
  const formatPaymentMethod = (method: string) => {
    if (!method) return "N/A";
    const m = method.toLowerCase();
    if (m === "cod" || m === "cash_on_delivery") return "Cash on Delivery";
    if (m === "credit_card" || m === "card") return "Credit / Debit Card";
    if (m === "bkash") return "bKash";
    if (m === "nagad") return "Nagad";
    if (m === "rocket") return "Rocket";
    if (m === "cash") return "Cash";
    if (m === "store_credit") return "Store Credit";
    if (m === "bank_transfer") return "Bank Transfer";
    return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Shipping Address Formatter
  const formatAddress = (addr: any) => {
    if (!addr) return null;
    if (typeof addr === "string") return addr;
    const parts = [
      addr.address_line1,
      addr.address_line2,
      addr.city,
      addr.state,
      addr.postal_code,
      addr.country
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  return (
    <>
      {/* Dedicated Clean Print Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #order-invoice-printable, #order-invoice-printable * {
            visibility: visible;
          }
          #order-invoice-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .print-hide {
            display: none !important;
          }
          .avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

      {/* Modal Backdrop & Screen Wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
        <div className="w-full max-w-[385px] rounded-none bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh]">
          
          {/* Top Control Bar (Screen Only - Compact & Square) */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-[#121622] border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between print-hide shrink-0 rounded-none">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Receipt className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-semibold tracking-tight">Invoice</span>
              {invoice?.invoice_number && (
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-medium">
                  • {invoice.invoice_number}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {invoice && (
                <button
                  onClick={() => handleCopyInvoiceNumber(invoice.invoice_number)}
                  className="px-2 py-1 rounded-none border border-slate-200 dark:border-white/[0.1] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-600 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                  title="Copy invoice number"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy #"}</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="px-2.5 py-1 rounded-none bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
              >
                <Printer className="w-3 h-3" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-1 rounded-none text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body / Scroll Area */}
          <div className="p-2 sm:p-2.5 overflow-y-auto bg-slate-100/70 dark:bg-[#07090e]">
            {loading || !invoice ? (
              <div className="py-20 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0d111b] rounded-none border border-slate-200/80 dark:border-white/[0.06]">
                <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                <p className="text-xs font-medium">Generating invoice document...</p>
              </div>
            ) : (
              /* Printable Invoice Sheet (Authentic Square-Cornered Slender Invoice) */
              <div 
                id="order-invoice-printable"
                className="w-full min-h-[520px] sm:min-h-[550px] flex flex-col justify-between bg-white text-slate-900 rounded-none p-4 sm:p-5 border border-slate-200/80 shadow-sm print:p-0 print:border-none print:shadow-none print:max-w-none print:rounded-none print:min-h-0"
              >
                
                {/* Upper Document Content Group */}
                <div className="space-y-3.5">
                  {/* ============================================================== */}
                  {/* 1. HEADER: Dynamic Logo / Store Name & Invoice Meta */}
                  {/* ============================================================== */}
                  <div className="flex justify-between items-start gap-2.5 pb-3 border-b border-slate-100 print:border-slate-200 avoid-break">
                    
                    {/* Left: Brand Identity */}
                    <div className="space-y-0.5 max-w-[210px]">
                      {storeLogo ? (
                        <img 
                          src={storeLogo} 
                          alt={storeName} 
                          onError={() => setLogoError(true)}
                          className="max-h-9 sm:max-h-10 w-auto max-w-[190px] sm:max-w-[210px] object-contain object-left mb-1"
                        />
                      ) : (
                        <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
                          {storeName}
                        </h1>
                      )}

                      {storeTagline && !storeLogo && (
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">{storeTagline}</p>
                      )}

                      {/* Compact Store Contact Info */}
                      <div className="text-[10px] text-slate-500 space-y-0 leading-tight pt-0.5">
                        {invoice.company?.address && (
                          <p>{invoice.company.address}</p>
                        )}
                        {(invoice.company?.phone || invoice.company?.email) && (
                          <p>
                            {[invoice.company.phone, invoice.company.email].filter(Boolean).join(" • ")}
                          </p>
                        )}
                        {invoice.company?.tax_number && (
                          <p className="font-mono text-[9px]">
                            Tax ID: {invoice.company.tax_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Invoice Reference, Date & Status */}
                    <div className="text-right space-y-0.5 shrink-0 self-start">
                      <h2 className="text-base font-bold tracking-tight text-slate-900 leading-none">
                        INVOICE
                      </h2>
                      
                      <div className="text-[11px] font-mono font-bold text-slate-800">
                        #{invoice.invoice_number}
                      </div>

                      <div className="text-[10px] text-slate-500">
                        Date: <span className="font-medium text-slate-700">{invoice.issue_date}</span>
                      </div>

                      <div className="pt-0.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider border ${getStatusBadge(invoice.payment_status)}`}>
                          {invoice.payment_status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* 2. ORDER / CUSTOMER INFORMATION (Compact & Tracking ID) */}
                  {/* ============================================================== */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5 avoid-break text-left">
                    
                    {/* Billed To Column */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Billed to
                      </span>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {invoice.customer?.name || "Valued Customer"}
                      </p>
                      {invoice.customer?.email && (
                        <p className="text-[10px] text-slate-600 leading-tight truncate">
                          {invoice.customer.email}
                        </p>
                      )}
                      {invoice.customer?.phone && (
                        <p className="text-[10px] text-slate-600 font-mono leading-tight">
                          {invoice.customer.phone}
                        </p>
                      )}
                      {formatAddress(invoice.customer?.shipping_address || invoice.customer?.billing_address) && (
                        <p className="text-[10px] text-slate-500 leading-tight pt-0.5">
                          {formatAddress(invoice.customer?.shipping_address || invoice.customer?.billing_address)}
                        </p>
                      )}
                    </div>

                    {/* Order Details Column (With prominent Tracking ID) */}
                    <div className="space-y-0.5 text-right">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Order Details
                      </span>
                      <p className="text-[10px] text-slate-700">
                        <span className="text-slate-400">Order #:</span>{" "}
                        <span className="font-mono font-semibold text-slate-900">{invoice.order_number}</span>
                      </p>
                      <p className="text-[10px] text-slate-700">
                        <span className="text-slate-400">Order Date:</span>{" "}
                        <span>{invoice.issue_date}</span>
                      </p>
                      
                      {/* Order Tracking ID - Guaranteed & Prominent */}
                      <p className="text-[10px] text-slate-700">
                        <span className="text-slate-400">Tracking ID:</span>{" "}
                        <span className="font-mono font-bold text-slate-900">{trackingId}</span>
                      </p>

                      {/* Courier Carrier if assigned */}
                      {invoice.carrier && (
                        <p className="text-[10px] text-slate-700">
                          <span className="text-slate-400">Courier:</span>{" "}
                          <span className="font-medium capitalize">{invoice.carrier}</span>
                        </p>
                      )}

                      <p className="text-[10px] text-slate-700">
                        <span className="text-slate-400">Payment:</span>{" "}
                        <span className="font-medium">{formatPaymentMethod(invoice.payment_method)}</span>
                      </p>

                      {/* POS Terminal / Rep if applicable */}
                      {invoice.order_source === "pos" && (
                        <p className="text-[9px] text-slate-500">
                          {invoice.terminal?.register_name} • {invoice.terminal?.cashier_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* 3. PRODUCT SECTION (Compact Minimal Clean Table) */}
                  {/* ============================================================== */}
                  <div className="pt-0.5 avoid-break">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="pb-1 font-bold uppercase text-[9px] text-slate-400 tracking-wider">
                            ITEM
                          </th>
                          <th className="pb-1 font-bold uppercase text-[9px] text-slate-400 tracking-wider text-center w-8">
                            QTY
                          </th>
                          <th className="pb-1 font-bold uppercase text-[9px] text-slate-400 tracking-wider text-right w-14">
                            PRICE
                          </th>
                          <th className="pb-1 font-bold uppercase text-[9px] text-slate-400 tracking-wider text-right w-14">
                            TOTAL
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoice.items && invoice.items.length > 0 ? (
                          invoice.items.map((it) => (
                            <tr key={it.id} className="avoid-break">
                              <td className="py-1.5 pr-1">
                                <span className="font-semibold text-slate-900 block leading-tight">
                                  {it.name}
                                </span>
                                {(it.sku !== "N/A" || it.variant) && (
                                  <span className="text-[9px] text-slate-400 font-mono block">
                                    {[it.sku !== "N/A" ? `SKU: ${it.sku}` : null, it.variant ? `Variant: ${it.variant}` : null].filter(Boolean).join(" • ")}
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 text-center font-mono text-slate-700 text-[11px]">
                                {it.quantity}
                              </td>
                              <td className="py-1.5 text-right font-mono text-slate-600 text-[11px]">
                                {formatPrice(it.unit_price)}
                                {it.discount_amount > 0 && (
                                  <span className="block text-[9px] text-rose-500 font-mono">
                                    -{formatPrice(it.discount_amount)}
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 text-right font-mono font-semibold text-slate-900 text-[11px]">
                                {formatPrice(it.total_price)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-3 text-center text-slate-400 text-xs italic">
                              No items recorded in this order.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ============================================================== */}
                  {/* 4. TOTALS SECTION (Compact & Clear Hierarchy) */}
                  {/* ============================================================== */}
                  <div className="pt-0.5 flex justify-between items-start gap-2 avoid-break">
                    
                    {/* Left: Customer/Order Notes if any */}
                    <div className="text-[10px] text-slate-500 max-w-[130px] space-y-0.5">
                      {invoice.notes && (
                        <div className="p-1.5 bg-slate-50 rounded-none border border-slate-100 print:bg-transparent print:border-slate-200">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                            Notes:
                          </span>
                          <p className="text-slate-600 leading-snug">{invoice.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Subtotal, Discount, Shipping, Tax & Final Payable */}
                    <div className="w-36 space-y-0.5 text-xs self-end">
                      
                      {/* Subtotal */}
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatPrice(invoice.financials?.subtotal || 0)}</span>
                      </div>

                      {/* Discount */}
                      {(invoice.financials?.discount_amount || 0) > 0 && (
                        <div className="flex justify-between text-rose-600 text-[11px]">
                          <span>Discount</span>
                          <span className="font-mono">-{formatPrice(invoice.financials.discount_amount)}</span>
                        </div>
                      )}

                      {/* Shipping */}
                      {(invoice.financials?.shipping_amount || 0) > 0 && (
                        <div className="flex justify-between text-slate-600 text-[11px]">
                          <span>Shipping</span>
                          <span className="font-mono">{formatPrice(invoice.financials.shipping_amount)}</span>
                        </div>
                      )}

                      {/* Tax / VAT */}
                      {(invoice.financials?.tax_amount || 0) > 0 && (
                        <div className="flex justify-between text-slate-600 text-[11px]">
                          <span>Tax / VAT</span>
                          <span className="font-mono">+{formatPrice(invoice.financials.tax_amount)}</span>
                        </div>
                      )}

                      {/* Divider before prominent total */}
                      <div className="border-t border-slate-200 my-0.5 pt-1 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-900">Total</span>
                        <span className="text-sm font-extrabold text-slate-900 font-mono tracking-tight">
                          {formatPrice(invoice.financials?.total_amount || 0)}
                        </span>
                      </div>

                      {/* POS Cash Details (if cash transaction recorded) */}
                      {(invoice.financials?.cash_received || 0) > 0 && (
                        <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Cash Received:</span>
                            <span className="font-mono">{formatPrice(invoice.financials.cash_received)}</span>
                          </div>
                          {(invoice.financials?.change_returned || 0) > 0 && (
                            <div className="flex justify-between">
                              <span>Change:</span>
                              <span className="font-mono">{formatPrice(invoice.financials.change_returned)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 5. FOOTER (Anchored at Bottom of Square Sheet) */}
                {/* ============================================================== */}
                <div className="pt-3 mt-4 border-t border-slate-100 print:border-slate-200 text-center text-[10px] text-slate-400 space-y-0.5 avoid-break">
                  <p className="font-medium text-slate-600">
                    Thank you for your order.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {[
                      invoice.company?.website,
                      invoice.company?.phone,
                      invoice.company?.email
                    ].filter(Boolean).join(" • ")}
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
