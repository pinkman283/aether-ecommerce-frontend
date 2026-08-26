"use client";

import { useState, useEffect } from "react";
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
  X
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Order, Product } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { ScrollableTableCard } from "@/components/admin/ScrollableTableCard";
import { AdminDropdown } from "@/components/admin/AdminDropdown";
import { toast } from "sonner";

export default function AdminOrdersPage() {
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
    adminApi.getOrders({ per_page: 50 }).then((res) => {
      setOrders(res.data || []);
    });
    toast.success("Order filters reset to default.");
  };

  // Add Item in Order Create
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
      toast.error("Please add at least one hardware product to the order.");
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
      toast.success(`Order #${res.order.order_number} created successfully.`);
      setIsCreateModalOpen(false);
      // Reset form
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

  const handleQuickStatusChange = async (orderId: number, status: string) => {
    try {
      const currentOrder = orders.find((o) => o.id === orderId);
      const res = await adminApi.updateOrderStatus(orderId, { 
        order_status: status,
        payment_status: currentOrder?.payment_status || "paid"
      });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, order_status: status as any } : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, order_status: status as any });
      toast.success(`Order #${currentOrder?.order_number || orderId} fulfillment status updated to ${status}.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleQuickPaymentStatusChange = async (orderId: number, paymentStatus: string) => {
    try {
      const currentOrder = orders.find((o) => o.id === orderId);
      const res = await adminApi.updateOrderStatus(orderId, {
        order_status: currentOrder?.order_status || "processing",
        payment_status: paymentStatus,
      });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, payment_status: paymentStatus as any } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus as any });
      }
      toast.success(`Order #${currentOrder?.order_number || orderId} payment status updated to ${paymentStatus}.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update payment status.");
    }
  };

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return;
    setDeleting(true);

    try {
      await adminApi.deleteOrder(deletingOrder.id);
      setOrders(orders.filter((o) => o.id !== deletingOrder.id));
      if (selectedOrder?.id === deletingOrder.id) setSelectedOrder(null);
      toast.success(`Order #${deletingOrder.order_number} deleted.`);
      setDeletingOrder(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete order.");
    } finally {
      setDeleting(false);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setRefunding(true);

    try {
      const res = await adminApi.refundOrder(selectedOrder.id, {
        reason: refundReason,
        restock,
      });

      setOrders(orders.map((o) => (o.id === selectedOrder.id ? res.order : o)));
      setSelectedOrder(res.order);
      setIsRefundModalOpen(false);
      toast.success(`Order #${res.order.order_number} marked as refunded.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to process refund.");
    } finally {
      setRefunding(false);
    }
  };

  const statusPills = [
    { label: "All Orders", val: "all" },
    { label: "Pending", val: "pending" },
    { label: "Processing", val: "processing" },
    { label: "Shipped", val: "shipped" },
    { label: "Delivered", val: "delivered" },
    { label: "Refunded", val: "refunded" },
    { label: "Cancelled", val: "cancelled" },
  ];

  const getPaymentStatusStyles = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm";
      case "pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-sm";
      case "refunded":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30 shadow-sm";
      case "failed":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 shadow-sm";
      default:
        return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  const getFulfillmentStatusStyles = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm";
      case "shipped":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/30 shadow-sm";
      case "processing":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30 shadow-sm";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30 shadow-sm";
      case "cancelled":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 shadow-sm";
      case "refunded":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30 shadow-sm";
      default:
        return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Fulfillment & Logistics
          </span>
          <h1 className="text-2xl font-black text-white">Customer Orders ({orders.length})</h1>
        </div>

        <button
          onClick={() => {
            setSelectedProdId(products[0]?.id?.toString() || "");
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Create Order
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 overflow-x-auto">
          {statusPills.map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusTab(tab.val)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusTab === tab.val
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-[#0e121e] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, customer, email, or tracking code..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
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
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
              title="Reset all order filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table with Scrollable Dragging Card */}
      <ScrollableTableCard>
        <table className="w-full text-left text-xs text-slate-300 min-w-[860px]">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Order Ref</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Total Amount</th>
              <th className="p-3.5">Payment Status</th>
              <th className="p-3.5">Fulfillment Status</th>
              <th className="p-3.5">Carrier / Tracking</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-center min-w-[160px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  Loading customer shipments...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                  No orders found matching the filter criteria.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-cyan-400 whitespace-nowrap">{ord.order_number}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{ord.customer_name}</span>
                    <span className="text-[10px] text-slate-500">{ord.customer_email}</span>
                  </td>
                  <td className="p-3.5 font-extrabold text-white whitespace-nowrap">{formatPrice(ord.total_amount)}</td>

                  {/* EDITABLE PAYMENT STATUS DROPDOWN */}
                  <td className="p-3.5 whitespace-nowrap">
                    <AdminDropdown
                      size="sm"
                      value={ord.payment_status}
                      onChange={(val) => handleQuickPaymentStatusChange(ord.id, val)}
                      buttonClassName={`rounded-xl text-[10px] font-black uppercase tracking-wider ${getPaymentStatusStyles(ord.payment_status)}`}
                      options={[
                        { value: "paid", label: "Paid" },
                        { value: "pending", label: "Pending" },
                        { value: "refunded", label: "Refunded" },
                        { value: "failed", label: "Failed" },
                      ]}
                    />
                  </td>

                  {/* EDITABLE FULFILLMENT STATUS DROPDOWN */}
                  <td className="p-3.5 whitespace-nowrap">
                    <AdminDropdown
                      size="sm"
                      value={ord.order_status}
                      onChange={(val) => handleQuickStatusChange(ord.id, val)}
                      buttonClassName={`rounded-xl text-[10px] font-black uppercase tracking-wider ${getFulfillmentStatusStyles(ord.order_status)}`}
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "processing", label: "Processing" },
                        { value: "shipped", label: "Shipped" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" },
                        { value: "refunded", label: "Refunded" },
                      ]}
                    />
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {ord.tracking_code || <span className="text-slate-600">—</span>}
                  </td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{formatDate(ord.created_at)}</td>
                  
                  {/* ICON-ONLY ACTION SYSTEM (UP TO 4 PER ROW) */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-start gap-1.5 flex-wrap w-[146px] mx-auto">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:scale-105 transition-all shadow-sm"
                        title="Inspect Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(ord)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-105 transition-all shadow-sm"
                        title="Edit Order"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingOrder(ord)}
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:scale-105 transition-all shadow-sm"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollableTableCard>

      {/* Order Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c0e15] border border-amber-500/30 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Order Management
                </span>
                <h3 className="text-lg font-black text-white">Create Order</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              {/* Customer Information */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">Customer Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="e.g. Jonathan Blake"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      placeholder="jonathan@test.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Destination */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">Shipping Destination</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddressLine}
                      onChange={(e) => setNewAddressLine(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">State</label>
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={newPostal}
                      onChange={(e) => setNewPostal(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Order Line Items Picker */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">Select Hardware Items</span>
                
                <div className="flex items-center gap-2">
                  <AdminDropdown
                    value={selectedProdId}
                    onChange={(val) => setSelectedProdId(val)}
                    className="flex-1"
                    buttonClassName="w-full py-2"
                    options={products.map((p) => ({
                      value: p.id.toString(),
                      label: `${p.name} (${formatPrice(p.price)}) - Stock: ${p.stock_quantity}`,
                    }))}
                  />

                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-center font-bold shrink-0"
                  />

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {/* Selected Items List */}
                <div className="space-y-1.5 divide-y divide-white/5">
                  {orderItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div key={idx} className="pt-2 flex items-center justify-between">
                        <span className="font-bold text-white">{prod?.name} (x{item.quantity})</span>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-cyan-400">{formatPrice(item.unitPrice * item.quantity)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Preview */}
                <div className="pt-3 border-t border-white/10 flex justify-between font-black text-sm text-white">
                  <span>Order Total:</span>
                  <span className="text-cyan-400">{formatPrice(calculateSubtotal() + Number(newShippingAmount || 0))}</span>
                </div>
              </div>

              {/* Status & Carrier Defaults */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Payment Status</label>
                  <AdminDropdown
                    value={newPaymentStatus}
                    onChange={(val) => setNewPaymentStatus(val)}
                    className="w-full"
                    buttonClassName="w-full py-2"
                    options={[
                      { value: "paid", label: "Paid" },
                      { value: "pending", label: "Pending" },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Fulfillment Status</label>
                  <AdminDropdown
                    value={newOrderStatus}
                    onChange={(val) => setNewOrderStatus(val)}
                    className="w-full"
                    buttonClassName="w-full py-2"
                    options={[
                      { value: "processing", label: "Processing" },
                      { value: "shipped", label: "Shipped" },
                      { value: "pending", label: "Pending" },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Carrier</label>
                  <input
                    type="text"
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wide transition-all shadow-md"
                >
                  {creating ? "Creating Order..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingOrder(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c0e15] border border-amber-500/30 shadow-2xl p-6 sm:p-8 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Edit Order #{editingOrder.order_number}</h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={editCustName}
                    onChange={(e) => setEditCustName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editCustEmail}
                    onChange={(e) => setEditCustEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Fulfillment Status</label>
                  <AdminDropdown
                    value={editOrderStatus}
                    onChange={(val) => setEditOrderStatus(val)}
                    className="w-full"
                    buttonClassName="w-full py-2"
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "processing", label: "Processing" },
                      { value: "shipped", label: "Shipped" },
                      { value: "delivered", label: "Delivered" },
                      { value: "cancelled", label: "Cancelled" },
                      { value: "refunded", label: "Refunded" },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Payment Status</label>
                  <AdminDropdown
                    value={editPaymentStatus}
                    onChange={(val) => setEditPaymentStatus(val)}
                    className="w-full"
                    buttonClassName="w-full py-2"
                    options={[
                      { value: "paid", label: "Paid" },
                      { value: "pending", label: "Pending" },
                      { value: "refunded", label: "Refunded" },
                      { value: "failed", label: "Failed" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Carrier</label>
                  <input
                    type="text"
                    value={editCarrier}
                    onChange={(e) => setEditCarrier(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={editTracking}
                    onChange={(e) => setEditTracking(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Internal Operational Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !isEditDirty}
                  className={`px-5 py-2 rounded-xl font-black uppercase tracking-wide transition-all shadow-md ${
                    !isEditDirty
                      ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                  title={!isEditDirty ? "No changes made to order details" : undefined}
                >
                  {savingEdit ? "Saving..." : "Save Modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeletingOrder(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0e121e] border border-rose-500/30 p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Delete Order Confirmation</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete order <span className="font-mono font-bold text-white">{deletingOrder.order_number}</span>? Unfulfilled items will be automatically restocked into inventory.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteOrder}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-600/30"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Inspector Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c0e15] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Order Telemetry & Fulfillment
                </span>
                <h3 className="text-lg font-black text-white font-mono">{selectedOrder.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Realtime Status Badges Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Status</span>
                <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${getPaymentStatusStyles(selectedOrder.payment_status)}`}>
                  {selectedOrder.payment_status}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fulfillment Status</span>
                <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${getFulfillmentStatusStyles(selectedOrder.order_status)}`}>
                  {selectedOrder.order_status}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logistics & Tracking</span>
                <span className="text-xs font-mono font-bold text-cyan-300 block truncate">
                  {selectedOrder.carrier || "Standard"} • {selectedOrder.tracking_code || "Pending Code"}
                </span>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Customer Details</span>
                <p className="text-white font-bold">{selectedOrder.customer_name}</p>
                <p className="text-slate-400">{selectedOrder.customer_email}</p>
                <p className="text-slate-400">{selectedOrder.customer_phone || "No phone recorded"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shipping Destination</span>
                <p className="text-white font-bold">{selectedOrder.shipping_address?.full_name}</p>
                <p className="text-slate-400">{selectedOrder.shipping_address?.address_line1}</p>
                <p className="text-slate-400">
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}
                </p>
                <p className="text-slate-400">{selectedOrder.shipping_address?.country}</p>
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Purchased Hardware Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="divide-y divide-white/5 border-y border-white/5 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{item.product_name}</span>
                        {item.variant_name && <span className="text-[10px] text-slate-400 block">{item.variant_name}</span>}
                        <span className="text-[10px] text-slate-500">Qty: {item.quantity} • {formatPrice(item.unit_price)} each</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-white shrink-0">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Savings ({selectedOrder.coupon_code})</span>
                    <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-white">{selectedOrder.shipping_amount === 0 ? "FREE" : formatPrice(selectedOrder.shipping_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount</span>
                  <span className="text-white">{formatPrice(selectedOrder.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/10">
                  <span>Total Amount Paid</span>
                  <span className="text-cyan-400">{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions in details view */}
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              {selectedOrder.payment_status !== "refunded" && (
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold transition-all flex items-center gap-1 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Issue Refund
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const ord = selectedOrder;
                  setSelectedOrder(null);
                  handleOpenEdit(ord);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-md ml-auto"
              >
                Edit Order Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsRefundModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-3xl bg-[#0e121e] border border-purple-500/30 p-6 z-10 space-y-4 text-xs">
            <h3 className="text-base font-black text-white">Refund Order #{selectedOrder.order_number}</h3>

            <form onSubmit={handleRefund} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Reason for Refund</label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={restock}
                  onChange={(e) => setRestock(e.target.checked)}
                  className="rounded bg-white/5"
                />
                <span>Automatically restock items back into inventory</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refunding}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md"
                >
                  {refunding ? "Processing..." : "Process Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
