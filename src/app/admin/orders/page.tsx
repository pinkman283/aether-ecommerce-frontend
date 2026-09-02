"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Eye, 
  Edit3, 
  Trash2,
  RotateCcw, 
  Sparkles,
  ChevronRight,
  Plus,
  Calendar,
  AlertTriangle,
  X,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Unlock,
  UserCheck,
  ExternalLink,
  Lock,
  Shield,
  RefreshCw,
  Loader2
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Order, Product } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { AdminDropdown } from "@/components/admin/AdminDropdown";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusTab, setStatusTab] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Inspect / Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // IP Block & Restriction Modal State
  const [ipBlockModalData, setIpBlockModalData] = useState<{
    ip: string;
    isBlocked: boolean;
    blockId?: number;
    existingReason?: string;
    existingExpiresAt?: string | null;
  } | null>(null);
  const [blockDuration, setBlockDuration] = useState<"permanent" | "1_hour" | "24_hours" | "7_days" | "30_days" | "custom">("permanent");
  const [customBlockExpiresAt, setCustomBlockExpiresAt] = useState("");
  const [blockReason, setBlockReason] = useState("Abusive order behavior / Risk mitigation");
  const [blockNotes, setBlockNotes] = useState("");
  const [isSubmittingIpBlock, setIsSubmittingIpBlock] = useState(false);
  const [isCheckingIpStatus, setIsCheckingIpStatus] = useState(false);

  // Bulk Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Order Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newAddressLine, setNewAddressLine] = useState("742 Evergreen Terrace");
  const [newCity, setNewCity] = useState("San Francisco");
  const [newState, setNewState] = useState("CA");
  const [newPostal, setNewPostal] = useState("94107");
  const [newCountry, setNewCountry] = useState("United States");
  const [orderItems, setOrderItems] = useState<{ productId: number; quantity: number; unitPrice: number }[]>([]);
  const [selectedProdId, setSelectedProdId] = useState<string>("");
  const [itemQty, setItemQty] = useState<string>("1");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("paid");
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>("credit_card");
  const [newOrderStatus, setNewOrderStatus] = useState<string>("processing");
  const [newCarrier, setNewCarrier] = useState<string>("DHL Express");
  const [newTracking, setNewTracking] = useState<string>("");
  const [newShippingAmount, setNewShippingAmount] = useState<string>("0");
  const [creating, setCreating] = useState(false);

  // Edit Order Modal
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustName, setEditCustName] = useState("");
  const [editCustEmail, setEditCustEmail] = useState("");
  const [editCustPhone, setEditCustPhone] = useState("");
  const [editOrderStatus, setEditOrderStatus] = useState("processing");
  const [editPaymentStatus, setEditPaymentStatus] = useState("paid");
  const [editCarrier, setEditCarrier] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirm Modal
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Refund Modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("Customer requested cancellation");
  const [restock, setRestock] = useState(true);
  const [refunding, setRefunding] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        adminApi.getOrders({
          status: statusTab !== "all" ? statusTab : undefined,
          payment_status: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
          search: search.trim() || undefined,
          page: 1,
          per_page: 50,
        }),
        adminApi.getProducts({ per_page: 100 }),
      ]);
      setOrders(ordRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusTab, paymentStatusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleResetFilters = () => {
    setStatusTab("all");
    setSearch("");
    setPaymentStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setMinTotal("");
    setMaxTotal("");
    setShowAdvancedFilters(false);
    adminApi.getOrders({ per_page: 50 }).then((res) => {
      setOrders(res.data || []);
    });
    toast.success("Filters reset.");
  };

  const handleAddItem = () => {
    if (!selectedProdId) return;
    const prod = products.find((p) => p.id === Number(selectedProdId));
    if (!prod) return;

    const qty = Number(itemQty) || 1;
    const existingIndex = orderItems.findIndex((i) => i.productId === prod.id);

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += qty;
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, { productId: prod.id, quantity: qty, unitPrice: prod.price }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      toast.error("Please add at least one product to the order.");
      return;
    }
    setCreating(true);

    const payload = {
      customer_name: newCustName,
      customer_email: newCustEmail,
      customer_phone: newCustPhone || null,
      shipping_address: {
        full_name: newCustName,
        address_line1: newAddressLine,
        city: newCity,
        state: newState,
        postal_code: newPostal,
        country: newCountry,
      },
      items: orderItems.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      })),
      shipping_amount: Number(newShippingAmount) || 0,
      payment_status: newPaymentStatus,
      payment_method: newPaymentMethod,
      order_status: newOrderStatus,
      carrier: newCarrier || null,
      tracking_code: newTracking || null,
    };

    try {
      const res = await adminApi.createOrder(payload);
      setOrders([res.order, ...orders]);
      toast.success(`Order #${res.order.order_number} created.`);
      setIsCreateModalOpen(false);
      setOrderItems([]);
      setNewCustName("");
      setNewCustEmail("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create order.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (ord: Order) => {
    setEditingOrder(ord);
    setEditCustName(ord.customer_name);
    setEditCustEmail(ord.customer_email);
    setEditCustPhone(ord.customer_phone || "");
    setEditOrderStatus(ord.order_status);
    setEditPaymentStatus(ord.payment_status);
    setEditCarrier(ord.carrier || "");
    setEditTracking(ord.tracking_code || "");
    setEditNotes(ord.notes || "");
  };

  const isEditDirty = Boolean(
    editingOrder && (
      editCustName.trim() !== (editingOrder.customer_name || "").trim() ||
      editCustEmail.trim() !== (editingOrder.customer_email || "").trim() ||
      editCustPhone.trim() !== (editingOrder.customer_phone || "").trim() ||
      editOrderStatus !== editingOrder.order_status ||
      editPaymentStatus !== editingOrder.payment_status ||
      editCarrier.trim() !== (editingOrder.carrier || "").trim() ||
      editTracking.trim() !== (editingOrder.tracking_code || "").trim() ||
      editNotes.trim() !== (editingOrder.notes || "").trim()
    )
  );

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (!isEditDirty) {
      toast.info("No changes were made.");
      return;
    }
    setSavingEdit(true);

    try {
      const res = await adminApi.updateOrder(editingOrder.id, {
        customer_name: editCustName,
        customer_email: editCustEmail,
        customer_phone: editCustPhone || null,
        order_status: editOrderStatus,
        payment_status: editPaymentStatus,
        carrier: editCarrier || null,
        tracking_code: editTracking || null,
        notes: editNotes || null,
      });

      setOrders(orders.map((o) => (o.id === editingOrder.id ? res.order : o)));
      if (selectedOrder?.id === editingOrder.id) {
        setSelectedOrder(res.order);
      }
      toast.success(`Order #${res.order.order_number} updated.`);
      setEditingOrder(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update order.");
    } finally {
      setSavingEdit(false);
    }
  };

  const openIpBlockModal = async (ip: string) => {
    setIsCheckingIpStatus(true);
    setBlockDuration("permanent");
    setCustomBlockExpiresAt("");
    setBlockReason("Abusive order behavior / Risk mitigation");
    setBlockNotes("");
    
    try {
      const res = await adminApi.getBlockedIps({ search: ip });
      const activeRule = (res.data || []).find((r: any) => r.ip_address === ip && r.is_active);
      setIpBlockModalData({
        ip,
        isBlocked: !!activeRule,
        blockId: activeRule?.id,
        existingReason: activeRule?.reason,
        existingExpiresAt: activeRule?.expires_at,
      });
    } catch {
      setIpBlockModalData({
        ip,
        isBlocked: false,
      });
    } finally {
      setIsCheckingIpStatus(false);
    }
  };

  const handleExecuteBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipBlockModalData || !blockReason.trim()) return;

    try {
      setIsSubmittingIpBlock(true);
      const res = await adminApi.blockIp({
        ip_address: ipBlockModalData.ip,
        reason: blockReason.trim(),
        notes: blockNotes.trim() || undefined,
        duration: blockDuration,
        custom_expires_at: blockDuration === "custom" ? customBlockExpiresAt : undefined,
      });

      toast.success(res.message);
      if (res.co_tenant_warning) {
        toast.warning(res.co_tenant_warning);
      }
      setIpBlockModalData((prev) => prev ? {
        ...prev,
        isBlocked: true,
        blockId: res.blocked_ip.id,
        existingReason: res.blocked_ip.reason,
        existingExpiresAt: res.blocked_ip.expires_at,
      } : null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to block IP.");
    } finally {
      setIsSubmittingIpBlock(false);
    }
  };

  const handleExecuteUnblockIp = async () => {
    if (!ipBlockModalData?.blockId) return;

    try {
      setIsSubmittingIpBlock(true);
      const res = await adminApi.unblockIp(ipBlockModalData.blockId);
      toast.success(res.message);
      setIpBlockModalData((prev) => prev ? {
        ...prev,
        isBlocked: false,
        blockId: undefined,
        existingReason: undefined,
        existingExpiresAt: undefined,
      } : null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unblock IP.");
    } finally {
      setIsSubmittingIpBlock(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return;
    setDeleting(true);

    try {
      await adminApi.deleteOrder(deletingOrder.id);
      setOrders(orders.filter((o) => o.id !== deletingOrder.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingOrder.id));
      if (selectedOrder?.id === deletingOrder.id) setSelectedOrder(null);
      toast.success(`Order #${deletingOrder.order_number} deleted.`);
      setDeletingOrder(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete order.");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => adminApi.deleteOrder(id)));
      setOrders(orders.filter((o) => !selectedIds.includes(o.id)));
      setSelectedIds([]);
      toast.success(`Deleted ${selectedIds.length} orders.`);
    } catch (err) {
      toast.error("Failed to delete selected orders.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExecuteRefund = async () => {
    if (!selectedOrder) return;
    setRefunding(true);

    try {
      const res = await adminApi.refundOrder(selectedOrder.id, {
        reason: refundReason,
        restock: restock,
      });

      setOrders(orders.map((o) => (o.id === selectedOrder.id ? res.order : o)));
      setSelectedOrder(res.order);
      setIsRefundModalOpen(false);
      toast.success(`Order #${res.order.order_number} refunded.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to process refund.");
    } finally {
      setRefunding(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (orders.length > 0 && selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const handleToggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredOrders = orders.filter((ord) => {
    if (dateFrom && new Date(ord.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(ord.created_at) > new Date(dateTo + "T23:59:59")) return false;
    if (minTotal && ord.total_amount < parseFloat(minTotal)) return false;
    if (maxTotal && ord.total_amount > parseFloat(maxTotal)) return false;
    return true;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage customer fulfillment, tracking, payments and security</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Order
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 rounded-xl bg-[#0b0e17] border border-white/10 space-y-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5">
          <form onSubmit={handleSearch} className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer, email..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </form>

          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            <AdminDropdown
              value={statusTab}
              onChange={(val) => setStatusTab(val)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />

            <AdminDropdown
              value={paymentStatusFilter}
              onChange={(val) => setPaymentStatusFilter(val)}
              options={[
                { value: "all", label: "All Payments" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "refunded", label: "Refunded" },
                { value: "failed", label: "Failed" },
              ]}
            />

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                showAdvancedFilters ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "bg-white/5 text-slate-400 hover:text-white border-white/10"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Expandable Bar */}
        {showAdvancedFilters && (
          <div className="pt-2.5 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Min Amount ($)</label>
              <input
                type="number"
                value={minTotal}
                onChange={(e) => setMinTotal(e.target.value)}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Max Amount ($)</label>
              <input
                type="number"
                value={maxTotal}
                onChange={(e) => setMaxTotal(e.target.value)}
                placeholder="10000"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={filteredOrders.length}
        onClearSelection={() => setSelectedIds([])}
        onConfirmDelete={handleBulkDelete}
        isDeleting={isBulkDeleting}
        itemName="order"
      />

      {/* Orders Table Card */}
      <div className="rounded-xl bg-[#0b0e17] border border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase text-[9.5px] tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-white/20 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Fulfillment</th>
                <th className="p-3">IP / Security</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    <span>Loading orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  const ip = order.ip_address || "127.0.0.1";

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isSelected ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(order.id)}
                          className="rounded border-white/20 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Order Number */}
                      <td className="p-3 font-mono font-bold text-cyan-400">
                        {order.order_number}
                      </td>

                      {/* Customer */}
                      <td className="p-3">
                        <div className="truncate min-w-[150px]">
                          <span className="font-bold text-white block truncate">{order.customer_name}</span>
                          <span className="text-[10.5px] text-slate-400 block truncate">{order.customer_email}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-3 font-mono font-bold text-white">
                        {formatPrice(order.total_amount)}
                      </td>

                      {/* Payment */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.payment_status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : order.payment_status === "refunded"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>

                      {/* Fulfillment */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                          {order.order_status}
                        </span>
                      </td>

                      {/* IP Security */}
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => openIpBlockModal(ip)}
                          className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Inspect or restrict IP address"
                        >
                          <Shield className="w-3 h-3 text-slate-500" />
                          <span>{ip}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="p-3 text-slate-400 text-[11px]">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Inspect order"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"
                            title="Edit order details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingOrder(order)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* INSPECT ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0e121e] border border-white/15 rounded-2xl shadow-2xl p-5 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-black text-white">Order #{selectedOrder.order_number}</h3>
                <span className="text-[10.5px] text-slate-400">{formatDate(selectedOrder.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedOrder.payment_status === "paid" && (
                  <button
                    onClick={() => setIsRefundModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/25 transition-colors cursor-pointer"
                  >
                    Issue Refund
                  </button>
                )}
                <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer</span>
                <span className="font-bold text-white block">{selectedOrder.customer_name}</span>
                <span className="text-slate-400 block">{selectedOrder.customer_email}</span>
                {selectedOrder.customer_phone && (
                  <span className="text-slate-400 block font-mono">{selectedOrder.customer_phone}</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipping Address</span>
                <span className="text-white block">
                  {selectedOrder.shipping_address?.address_line1 || "No street address recorded"}
                </span>
                <span className="text-slate-400 block">
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.country}
                </span>
                {selectedOrder.carrier && (
                  <span className="text-cyan-400 text-[11px] block font-mono pt-1">
                    Carrier: {selectedOrder.carrier} {selectedOrder.tracking_code ? `(${selectedOrder.tracking_code})` : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">Ordered Items</span>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 divide-y divide-white/5 text-xs">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{item.product_name || `Product #${item.product_id}`}</span>
                      <span className="text-[10px] text-slate-400">Qty: {item.quantity} × {formatPrice(item.unit_price)}</span>
                    </div>
                    <span className="font-bold font-mono text-white">{formatPrice(item.quantity * item.unit_price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 text-xs font-bold text-white">
              <span>Total Amount</span>
              <span className="text-base text-cyan-400 font-mono font-black">{formatPrice(selectedOrder.total_amount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0e121e] border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-black text-white">Edit Order #{editingOrder.order_number}</h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Customer Name</label>
                  <input
                    type="text"
                    value={editCustName}
                    onChange={(e) => setEditCustName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Phone</label>
                  <input
                    type="text"
                    value={editCustPhone}
                    onChange={(e) => setEditCustPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Fulfillment Status</label>
                  <select
                    value={editOrderStatus}
                    onChange={(e) => setEditOrderStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="pending" className="bg-[#0e121e]">Pending</option>
                    <option value="processing" className="bg-[#0e121e]">Processing</option>
                    <option value="shipped" className="bg-[#0e121e]">Shipped</option>
                    <option value="delivered" className="bg-[#0e121e]">Delivered</option>
                    <option value="cancelled" className="bg-[#0e121e]">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="pending" className="bg-[#0e121e]">Pending</option>
                    <option value="paid" className="bg-[#0e121e]">Paid</option>
                    <option value="refunded" className="bg-[#0e121e]">Refunded</option>
                    <option value="failed" className="bg-[#0e121e]">Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Carrier</label>
                  <input
                    type="text"
                    value={editCarrier}
                    onChange={(e) => setEditCarrier(e.target.value)}
                    placeholder="e.g. DHL Express / Pathao"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Tracking Code</label>
                  <input
                    type="text"
                    value={editTracking}
                    onChange={(e) => setEditTracking(e.target.value)}
                    placeholder="Tracking #"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IP RESTRICTION & BLOCK MODAL */}
      {ipBlockModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e121e] border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="text-sm font-black text-white">IP Security: {ipBlockModalData.ip}</h3>
              </div>
              <button onClick={() => setIpBlockModalData(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {ipBlockModalData.isBlocked ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <span className="font-bold block">Currently Blocked</span>
                  <span className="text-[11px] text-slate-400 block mt-1">Reason: {ipBlockModalData.existingReason}</span>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIpBlockModalData(null)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 font-bold"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteUnblockIp}
                    disabled={isSubmittingIpBlock}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    {isSubmittingIpBlock ? "Unblocking..." : "Unblock IP"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteBlockIp} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Block Duration</label>
                  <select
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="permanent" className="bg-[#0e121e]">Permanent Block</option>
                    <option value="24_hours" className="bg-[#0e121e]">24 Hours</option>
                    <option value="7_days" className="bg-[#0e121e]">7 Days</option>
                    <option value="30_days" className="bg-[#0e121e]">30 Days</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Reason</label>
                  <input
                    type="text"
                    required
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIpBlockModalData(null)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingIpBlock}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    {isSubmittingIpBlock ? "Blocking..." : "Block IP Address"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e121e] border border-purple-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-black text-white">Process Refund</h3>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Refund Reason</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restock}
                  onChange={(e) => setRestock(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-0"
                />
                <span>Restock items back into inventory</span>
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRefund}
                  disabled={refunding}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  {refunding ? "Processing..." : "Confirm Refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e121e] border border-rose-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-black text-white">Delete Order?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete order <span className="font-bold text-white">#{deletingOrder.order_number}</span>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setDeletingOrder(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={deleting}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
