"use client";

import React from "react";
import { 
  Receipt, 
  Printer, 
  X, 
  CheckCircle2, 
  Copy 
} from "lucide-react";
import { SalesInvoice } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface OrderInvoiceModalProps {
  invoice: SalesInvoice | null;
  loading: boolean;
  onClose: () => void;
}

export function OrderInvoiceModal({ invoice, loading, onClose }: OrderInvoiceModalProps) {
  if (!invoice && !loading) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoiceNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success(`Copied invoice ${num} to clipboard`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0f121b] border border-white/[0.1] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Controls Bar (Non-printed) */}
        <div className="p-3.5 bg-[#161a26] border-b border-white/[0.08] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-amber-400">
            <Receipt className="w-4 h-4" />
            <span className="text-xs font-bold text-white">Commercial Invoice & Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-300 bg-[#090b10] print:bg-white print:text-black print:p-0">
          {loading || !invoice ? (
            <div className="py-20 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Generating commercial invoice...
            </div>
          ) : (
            <div className="space-y-6" id="printable-invoice">
              
              {/* Top Header: Company Info + Invoice Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-white/10 print:border-black/20">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 print:text-black">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 print:bg-black/10 flex items-center justify-center font-black">
                      Æ
                    </div>
                    <span className="text-base font-black tracking-tight text-white print:text-black">
                      {invoice.company.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-black/70">{invoice.company.tagline}</p>
                  <p className="text-[10px] text-slate-400 print:text-black/60 font-mono">
                    {invoice.company.address} • Tax ID: {invoice.company.tax_number}
                  </p>
                  <p className="text-[10px] text-slate-400 print:text-black/60">
                    {invoice.company.phone} • {invoice.company.email}
                  </p>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-xl font-black text-amber-400 print:text-black tracking-wider block font-mono">
                    INVOICE
                  </span>
                  <div className="text-xs font-mono font-bold text-white print:text-black flex items-center gap-1 sm:justify-end">
                    <span>{invoice.invoice_number}</span>
                    <button
                      onClick={() => handleCopyInvoiceNumber(invoice.invoice_number)}
                      className="text-slate-500 hover:text-white print:hidden"
                      title="Copy Invoice Number"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-black/70 font-mono">
                    Ref: {invoice.order_number}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-black/70 font-mono">
                    Date: {invoice.issue_date}
                  </div>
                  <div className="pt-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      invoice.payment_status === "paid" 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:border-black print:text-black" 
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30 print:border-black print:text-black"
                    }`}>
                      {invoice.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billed To & Channel Origin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 print:border-black/15 print:bg-transparent">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-black/70 block">
                    Billed To / Customer
                  </span>
                  <div className="font-bold text-white print:text-black text-sm">
                    {invoice.customer.name}
                  </div>
                  {invoice.customer.email && (
                    <div className="text-[11px] text-slate-400 print:text-black/70">
                      {invoice.customer.email}
                    </div>
                  )}
                  {invoice.customer.phone && (
                    <div className="text-[11px] text-slate-400 print:text-black/70 font-mono">
                      {invoice.customer.phone}
                    </div>
                  )}
                  {invoice.customer.shipping_address?.address_line1 && (
                    <div className="text-[10px] text-slate-500 print:text-black/60 mt-1">
                      {invoice.customer.shipping_address.address_line1}, {invoice.customer.shipping_address.city}
                    </div>
                  )}
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-black/70 block">
                    Commercial Channel
                  </span>
                  <div className="font-bold text-slate-200 print:text-black">
                    {invoice.terminal.register_name}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-black/70">
                    Staff / Cashier: {invoice.terminal.cashier_name}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-black/70 font-mono">
                    Payment: {invoice.payment_method.toUpperCase().replace("_", " ")}
                  </div>
                  {invoice.financials.payment_transaction_id && (
                    <div className="text-[10px] font-mono text-slate-500 print:text-black/60">
                      Txn: {invoice.financials.payment_transaction_id}
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="rounded-2xl border border-white/10 overflow-hidden print:border-black/20">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.04] print:bg-black/5 text-slate-400 print:text-black font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-black/10">
                    {invoice.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white print:text-black block">{it.name}</span>
                          <span className="text-[10px] text-slate-400 print:text-black/60 font-mono">
                            SKU: {it.sku} {it.variant && `| Variant: ${it.variant}`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-white print:text-black">
                          {it.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300 print:text-black">
                          {formatPrice(it.unit_price)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-400 print:text-black">
                          {it.discount_amount > 0 ? `-${formatPrice(it.discount_amount)}` : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                          {formatPrice(it.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financials Totals */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="text-[10px] text-slate-500 print:text-black/60 max-w-sm space-y-1">
                  <p className="font-bold text-slate-400 print:text-black">Payment Terms & Warranty:</p>
                  <p>Purchases backed by official warranty. Returns and replacements accepted according to store policy with original receipt.</p>
                  {invoice.notes && (
                    <p className="text-amber-400/90 print:text-black font-semibold mt-1">
                      Notes: {invoice.notes}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-64 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400 print:text-black">
                    <span>Subtotal:</span>
                    <span>{formatPrice(invoice.financials.subtotal)}</span>
                  </div>
                  {invoice.financials.discount_amount > 0 && (
                    <div className="flex justify-between text-rose-400 print:text-black">
                      <span>Total Discounts:</span>
                      <span>-{formatPrice(invoice.financials.discount_amount)}</span>
                    </div>
                  )}
                  {invoice.financials.tax_amount > 0 && (
                    <div className="flex justify-between text-slate-400 print:text-black">
                      <span>Tax / VAT:</span>
                      <span>+{formatPrice(invoice.financials.tax_amount)}</span>
                    </div>
                  )}
                  {invoice.financials.shipping_amount > 0 && (
                    <div className="flex justify-between text-slate-400 print:text-black">
                      <span>Shipping Rate:</span>
                      <span>+{formatPrice(invoice.financials.shipping_amount)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 print:border-black/20 pt-2 flex justify-between font-bold text-base text-amber-400 print:text-black">
                    <span>Total Amount:</span>
                    <span>{formatPrice(invoice.financials.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-6 border-t border-white/5 print:border-black/10 text-center text-[10px] text-slate-500 print:text-black/60 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 print:text-black" />
                <span>This document serves as an authentic sales receipt and commercial invoice.</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
