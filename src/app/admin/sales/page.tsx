"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  BadgeDollarSign, 
  Search, 
  Filter, 
  Receipt, 
  Printer, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Banknote, 
  ShoppingBag, 
  Calculator, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye, 
  Calendar, 
  ChevronDown, 
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Order, SalesInvoice, SalesSummary } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  AdminPageHeader,
  AdminStatStrip,
  AdminStatusBadge,
  AdminPagination,
  AdminEmptyState,
} from "@/components/admin/ui";

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Order[]>([]);
  const [summary, setSummary] = useState<SalesSummary>({
    total_sales: 0,
    total_transactions: 0,
    average_invoice_value: 0,
    pos_sales: 0,
    online_sales: 0,
    total_tax_collected: 0,
    total_discount_given: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [openPaymentStatusFilter, setOpenPaymentStatusFilter] = useState(false);
  const [openPaymentMethodFilter, setOpenPaymentMethodFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Drag-to-scroll State
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  useEffect(() => {
    fetchSales();
  }, [search, sourceFilter, paymentStatusFilter, paymentMethodFilter, dateFrom, dateTo, page]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSales({
        search: search.trim() || undefined,
        source: sourceFilter !== "all" ? sourceFilter : undefined,
        payment_status: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
        payment_method: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: 15,
      });

      setSales(res.sales.data || []);
      setTotalPages(res.sales.last_page || 1);
      setSummary(res.summary);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load sales history.");
    } finally {
      setLoading(false);
    }
  };

  const openInvoiceModal = async (orderId: number) => {
    setLoadingInvoice(true);
    setSelectedInvoice(null);
    try {
      const invoiceData = await adminApi.getSalesInvoice(orderId);
      setSelectedInvoice(invoiceData);
    } catch (err: any) {
      toast.error("Failed to generate commercial invoice.");
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const fromParam = dateFrom ? `&date_from=${dateFrom}` : "";
    const toParam = dateTo ? `&date_to=${dateTo}` : "";
    const srcParam = sourceFilter !== "all" ? `&source=${sourceFilter}` : "";
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/admin/sales/export?_token=1${srcParam}${fromParam}${toParam}`;
    window.open(url, "_blank");
  };

  // Drag-to-scroll Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select, a, textarea")) return;
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeftState(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tableContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case "pos":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Calculator className="w-3 h-3" /> POS Terminal
          </span>
        );
      case "online":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <ShoppingBag className="w-3 h-3" /> Online Store
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Direct Admin
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PAID</span>;
      case "pending":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>;
      case "refunded":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">REFUNDED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10 uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Admin Page Header */}
      <AdminPageHeader
        title="Commercial Sales & Invoices"
        description="Unified multi-channel sales ledger across POS retail registers and online storefront checkouts."
        badge={`${summary.total_transactions} txns`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSales}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
          </div>
        }
      />

      {/* Workspace Unification Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide">Orders & Invoices Unified</h4>
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">Canonical Workspace</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sales, commercial invoice generation, and POS/web channel fulfillment are unified into the main <strong>Orders & Fulfillment</strong> workspace.
            </p>
          </div>
        </div>
        <Link
          href="/admin/orders"
          className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
        >
          <span>Open Orders Workspace</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Sales Performance Ribbon */}
      <AdminStatStrip
        stats={[
          {
            label: "Total Sales Revenue",
            value: formatPrice(summary.total_sales),
            change: `${summary.total_transactions} txns`,
            icon: BadgeDollarSign,
            helper: "Processed gross volume",
          },
          {
            label: "In-Store POS Sales",
            value: formatPrice(summary.pos_sales),
            change: `${summary.total_sales > 0 ? Math.round((summary.pos_sales / summary.total_sales) * 100) : 0}%`,
            icon: Calculator,
            helper: "Physical retail registers",
          },
          {
            label: "Online Storefront",
            value: formatPrice(summary.online_sales),
            change: `${summary.total_sales > 0 ? Math.round((summary.online_sales / summary.total_sales) * 100) : 0}%`,
            icon: ShoppingBag,
            helper: "eCommerce checkouts",
          },
          {
            label: "Average Ticket (AOV)",
            value: formatPrice(summary.average_invoice_value),
            icon: Receipt,
            helper: `VAT: ${formatPrice(summary.total_tax_collected)}`,
          },
        ]}
      />

      {/* Filter Toolbar */}
      <div className="bg-[#0f121b] p-4 rounded-xl border border-white/[0.08] space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Channel Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Sales" },
              { id: "pos", label: "In-Store POS" },
              { id: "online", label: "Online Storefront" },
              { id: "admin", label: "Admin Direct" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setSourceFilter(tab.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  sourceFilter === tab.id
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                    : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar & Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search invoice #, customer, phone..."
                className="w-full bg-[#161a26] border border-white/[0.08] focus:border-amber-400/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            {/* Payment Status Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenPaymentStatusFilter(!openPaymentStatusFilter);
                  setOpenPaymentMethodFilter(false);
                }}
                className="bg-[#161a26] hover:bg-[#1c2232] border border-white/[0.08] hover:border-white/20 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 flex items-center justify-between gap-2 transition cursor-pointer"
              >
                <span>
                  {paymentStatusFilter === "all" && "All Statuses"}
                  {paymentStatusFilter === "paid" && "Paid"}
                  {paymentStatusFilter === "pending" && "Pending"}
                  {paymentStatusFilter === "refunded" && "Refunded"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openPaymentStatusFilter ? "rotate-180 text-amber-400" : ""}`} />
              </button>

              {openPaymentStatusFilter && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setOpenPaymentStatusFilter(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[#0f121b] border border-white/[0.1] shadow-xl p-1.5 z-40 space-y-1">
                    {[
                      { id: "all", label: "All Payment Statuses" },
                      { id: "paid", label: "Paid" },
                      { id: "pending", label: "Pending" },
                      { id: "refunded", label: "Refunded" },
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setPaymentStatusFilter(st.id);
                          setPage(1);
                          setOpenPaymentStatusFilter(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                          paymentStatusFilter === st.id
                            ? "bg-amber-400/10 text-amber-300 font-semibold"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{st.label}</span>
                        {paymentStatusFilter === st.id && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Payment Method Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenPaymentMethodFilter(!openPaymentMethodFilter);
                  setOpenPaymentStatusFilter(false);
                }}
                className="bg-[#161a26] hover:bg-[#1c2232] border border-white/[0.08] hover:border-white/20 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 flex items-center justify-between gap-2 transition cursor-pointer"
              >
                <span>
                  {paymentMethodFilter === "all" && "All Tender Methods"}
                  {paymentMethodFilter === "cash" && "Cash"}
                  {paymentMethodFilter === "credit_card" && "Credit / Debit Card"}
                  {paymentMethodFilter === "bank_transfer" && "Bank Wire"}
                  {paymentMethodFilter === "mobile_money" && "Mobile Banking"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openPaymentMethodFilter ? "rotate-180 text-amber-400" : ""}`} />
              </button>

              {openPaymentMethodFilter && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setOpenPaymentMethodFilter(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-[#0f121b] border border-white/[0.1] shadow-xl p-1.5 z-40 space-y-1">
                    {[
                      { id: "all", label: "All Tender Methods" },
                      { id: "cash", label: "Cash" },
                      { id: "credit_card", label: "Credit / Debit Card" },
                      { id: "bank_transfer", label: "Bank Transfer" },
                      { id: "mobile_money", label: "Mobile Banking" },
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethodFilter(m.id);
                          setPage(1);
                          setOpenPaymentMethodFilter(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                          paymentMethodFilter === m.id
                            ? "bg-amber-400/10 text-amber-300 font-semibold"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{m.label}</span>
                        {paymentMethodFilter === m.id && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sales Transactions & Invoices Table */}
      <div className="rounded-xl bg-[#0f121b] border border-white/[0.08] shadow-sm overflow-hidden">
        <div 
          ref={tableContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"} custom-horizontal-scrollbar pb-3`}
        >
          <table className="w-full text-left text-xs text-slate-300 min-w-[1050px]">
            <thead className="bg-white/[0.02] border-b border-white/[0.06] uppercase font-semibold text-[10px] tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Invoice / Order #</th>
                <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Channel</th>
                <th className="py-3 px-4 min-w-[240px] whitespace-nowrap">Customer / Cashier</th>
                <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Line Items</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Tender & Status</th>
                <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Net Amount</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Date & Time</th>
                <th className="py-3 px-4 min-w-[130px] whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading sales records...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <AdminEmptyState
                      icon={BadgeDollarSign}
                      title="No sales transactions found"
                      description="Sales will populate automatically from in-store POS checkouts and web orders."
                    />
                  </td>
                </tr>
              ) : (
                sales.map(order => {
                  const itemsCount = order.items?.reduce((acc, it) => acc + it.quantity, 0) || order.items?.length || 0;

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition">
                      
                      {/* Invoice & Order Number */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">
                        <button
                          onClick={() => openInvoiceModal(order.id)}
                          className="text-left group cursor-pointer"
                        >
                          <span className="font-mono font-bold text-amber-400 group-hover:text-amber-300 block transition">
                            {order.invoice_number || `INV-${String(order.id).padStart(6, '0')}`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Ref: {order.order_number}
                          </span>
                        </button>
                      </td>

                      {/* Source Channel Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">
                        {getSourceBadge(order.order_source)}
                        {order.pos_register_session?.pos_register && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {order.pos_register_session.pos_register.name}
                          </div>
                        )}
                      </td>

                      {/* Customer & Cashier Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[240px]">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white block">{order.customer_name}</span>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            {order.customer_phone && <span className="font-mono">{order.customer_phone}</span>}
                            {order.cashier_user && (
                              <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono">
                                Cashier: {order.cashier_user.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Line Items Preview */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">
                        <div className="space-y-0.5">
                          <span className="text-xs font-medium text-slate-200 block">
                            {itemsCount} {itemsCount === 1 ? "unit" : "units"}
                          </span>
                          {order.items && order.items.length > 0 && (
                            <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px] block">
                              {order.items[0]?.product_name}
                              {order.items.length > 1 && ` +${order.items.length - 1} more`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Tender & Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                        <div className="space-y-1">
                          <div>
                            <AdminStatusBadge status={order.payment_status} size="sm" />
                          </div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">
                            {order.payment_method?.replace("_", " ") || "CASH"}
                          </span>
                        </div>
                      </td>

                      {/* Net Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
                        <span className="font-mono font-bold text-emerald-400 text-sm block">
                          {formatPrice(order.total_amount)}
                        </span>
                        {parseFloat(order.tax_amount as any) > 0 && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Incl. {formatPrice(order.tax_amount)} VAT
                          </span>
                        )}
                      </td>

                      {/* Date & Timestamp */}
                      <td className="py-3.5 px-4 text-slate-300 text-xs whitespace-nowrap min-w-[140px] font-mono">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[130px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openInvoiceModal(order.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                            title="View Formal Commercial Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 bg-white/[0.01] border-t border-white/[0.06]">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={summary.total_transactions}
              itemsPerPage={15}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FORMAL COMMERCIAL INVOICE MODAL (Printable & Downloadable) */}
      {/* ========================================================================= */}
      {(selectedInvoice || loadingInvoice) && (
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
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-300 bg-[#090b10] print:bg-white print:text-black print:p-0">
              {loadingInvoice || !selectedInvoice ? (
                <div className="py-20 text-center text-slate-500">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Generating formal commercial invoice...
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
                          {selectedInvoice.company.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 print:text-black/70">{selectedInvoice.company.tagline}</p>
                      <p className="text-[10px] text-slate-400 print:text-black/60 font-mono">
                        {selectedInvoice.company.address} • Tax ID: {selectedInvoice.company.tax_number}
                      </p>
                      <p className="text-[10px] text-slate-400 print:text-black/60">
                        {selectedInvoice.company.phone} • {selectedInvoice.company.email}
                      </p>
                    </div>

                    <div className="sm:text-right space-y-1">
                      <span className="text-xl font-black text-amber-400 print:text-black tracking-wider block font-mono">
                        INVOICE
                      </span>
                      <div className="text-xs font-mono font-bold text-white print:text-black">
                        {selectedInvoice.invoice_number}
                      </div>
                      <div className="text-[11px] text-slate-400 print:text-black/70 font-mono">
                        Ref: {selectedInvoice.order_number}
                      </div>
                      <div className="text-[11px] text-slate-400 print:text-black/70 font-mono">
                        Date: {selectedInvoice.issue_date}
                      </div>
                      <div className="pt-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          selectedInvoice.payment_status === "paid" 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:border-black print:text-black" 
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30 print:border-black print:text-black"
                        }`}>
                          {selectedInvoice.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Billed To & Terminal Origin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 print:border-black/15 print:bg-transparent">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-black/70 block">
                        Billed To / Customer
                      </span>
                      <div className="font-bold text-white print:text-black text-sm">
                        {selectedInvoice.customer.name}
                      </div>
                      {selectedInvoice.customer.email && (
                        <div className="text-[11px] text-slate-400 print:text-black/70">
                          {selectedInvoice.customer.email}
                        </div>
                      )}
                      {selectedInvoice.customer.phone && (
                        <div className="text-[11px] text-slate-400 print:text-black/70 font-mono">
                          {selectedInvoice.customer.phone}
                        </div>
                      )}
                      {selectedInvoice.customer.shipping_address?.address_line1 && (
                        <div className="text-[10px] text-slate-500 print:text-black/60 mt-1">
                          {selectedInvoice.customer.shipping_address.address_line1}, {selectedInvoice.customer.shipping_address.city}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 sm:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-black/70 block">
                        Commercial Channel
                      </span>
                      <div className="font-bold text-slate-200 print:text-black">
                        {selectedInvoice.terminal.register_name}
                      </div>
                      <div className="text-[11px] text-slate-400 print:text-black/70">
                        Cashier / Rep: {selectedInvoice.terminal.cashier_name}
                      </div>
                      <div className="text-[11px] text-slate-400 print:text-black/70 font-mono">
                        Payment: {selectedInvoice.payment_method.toUpperCase().replace("_", " ")}
                      </div>
                      {selectedInvoice.financials.payment_transaction_id && (
                        <div className="text-[10px] font-mono text-slate-500 print:text-black/60">
                          Txn: {selectedInvoice.financials.payment_transaction_id}
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
                        {selectedInvoice.items.map(it => (
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
                      <p>Hardware purchases backed by standard 1-year AETHER studio replacement warranty. In-store returns valid within 14 days with original packaging and invoice.</p>
                      {selectedInvoice.notes && (
                        <p className="text-amber-400/90 print:text-black font-semibold mt-1">
                          Notes: {selectedInvoice.notes}
                        </p>
                      )}
                    </div>

                    <div className="w-full sm:w-64 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400 print:text-black/70">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatPrice(selectedInvoice.financials.subtotal)}</span>
                      </div>
                      {selectedInvoice.financials.discount_amount > 0 && (
                        <div className="flex justify-between text-rose-400 print:text-black">
                          <span>Discounts</span>
                          <span className="font-mono">-{formatPrice(selectedInvoice.financials.discount_amount)}</span>
                        </div>
                      )}
                      {selectedInvoice.financials.shipping_amount > 0 && (
                        <div className="flex justify-between text-slate-400 print:text-black/70">
                          <span>Shipping / Delivery</span>
                          <span className="font-mono">{formatPrice(selectedInvoice.financials.shipping_amount)}</span>
                        </div>
                      )}
                      {selectedInvoice.financials.tax_amount > 0 && (
                        <div className="flex justify-between text-slate-400 print:text-black/70">
                          <span>VAT</span>
                          <span className="font-mono">{formatPrice(selectedInvoice.financials.tax_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-white print:text-black pt-2 border-t border-white/10 print:border-black/20">
                        <span>Total Due / Paid</span>
                        <span className="text-amber-400 print:text-black font-mono">
                          {formatPrice(selectedInvoice.financials.total_amount)}
                        </span>
                      </div>

                      {/* Cash Tender Details if applicable */}
                      {selectedInvoice.financials.cash_received > 0 && (
                        <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 print:text-black/70 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Cash Tendered:</span>
                            <span className="font-mono">{formatPrice(selectedInvoice.financials.cash_received)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-400 print:text-black font-bold">
                            <span>Change Returned:</span>
                            <span className="font-mono">{formatPrice(selectedInvoice.financials.change_returned)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Signature / Stamp */}
                  <div className="pt-6 border-t border-white/10 print:border-black/20 flex items-center justify-between text-[10px] text-slate-500 print:text-black/50">
                    <span>Generated by AETHER OPS Management System</span>
                    <span className="font-mono">{selectedInvoice.issue_timestamp}</span>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
